import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall } from "@/lib/calle-client";
import { CallRecord, LanguageCode } from "@/lib/types";
import { telephonyRateLimiter, getClientIp } from "@/lib/rate-limiter";
import { getSessionUser } from "@/lib/auth";
import { getDbIdempotencyKey, saveDbIdempotencyKey, syncCallToSupabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

const recallIdempotencyKeys = new Map<string, any>();

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const isUserLoggedIn = Boolean(user);
    const clientIp = getClientIp(req);
    const rateLimitKey = user ? `usr_${user.id}` : `ip_${clientIp}`;

    // 1. Sliding Window Quota Check
    const rateCheck = telephonyRateLimiter.check(rateLimitKey, isUserLoggedIn, 15);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          ok: false,
          error: rateCheck.error,
          reason: rateCheck.reason,
          dailyLimit: rateCheck.dailyLimit,
          remainingDaily: rateCheck.remainingDaily,
          resetTime: rateCheck.resetTime,
          isLoggedIn: isUserLoggedIn,
          rateLimited: true
        },
        { status: 429 }
      );
    }

    // 2. Durable Idempotency Deduplication Check (Supabase + In-Memory Fast Tier)
    const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      if (recallIdempotencyKeys.has(idempotencyKey)) {
        return NextResponse.json(recallIdempotencyKeys.get(idempotencyKey));
      }

      const dbCached = await getDbIdempotencyKey(idempotencyKey);
      if (dbCached) {
        recallIdempotencyKeys.set(idempotencyKey, dbCached.response_json);
        return NextResponse.json(dbCached.response_json, { status: dbCached.status_code });
      }
    }

    const body = await req.json();
    const { phoneNumber, patientName, locationId, dueFor, language = "en", customLocation, extraContext } = body;

    if (!phoneNumber) {
      return NextResponse.json({ ok: false, error: "phoneNumber is required" }, { status: 400 });
    }

    let location = customLocation;
    if (!location || !location.name) {
      const locations = getLocations();
      location = locations.find((l: any) => l.id === locationId) || locations[0];
    }
    const name = patientName || "Valued Customer";
    const localCallId = `call_${Date.now()}`;

    // 3. Dispatch recall call to CALL-E REST API
    const directRes = await createDirectCall({
      phoneNumber,
      patientName: name,
      location,
      callType: "outbound_recall",
      language: language as LanguageCode,
      customGoal: `Proactive Client Outreach: Follow up for ${dueFor || "scheduled review"}.`,
      extraContext
    });

    if (!directRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: directRes.error || "Failed to dispatch recall call.",
          details: directRes.details
        },
        { status: directRes.status || 500 }
      );
    }

    const runId = directRes.result?.run_id || directRes.result?.id || localCallId;

    const initialCall: CallRecord = {
      id: localCallId,
      runId,
      phoneNumber,
      patientName: name,
      locationId: location.id,
      departmentId: "dept_general",
      callType: "outbound_recall",
      status: "queued",
      recoveredRevenue: 0,
      createdAt: new Date().toISOString(),
      structuredOutcome: {
        call_id: localCallId,
        location_id: location.id,
        department_id: "dept_general",
        call_type: "outbound_recall",
        caller_verified: true,
        outcome: "booked",
        appointment: { booked: false, datetime: null, service_type: null },
        callback: { requested: false, priority: null, reason: null },
        opt_out: false,
        sentiment: "neutral",
        language,
        notes: `Outbound follow-up campaign dispatched for: ${dueFor || "routine review"}.`
      }
    };

    store.addCall(initialCall);
    syncCallToSupabase(initialCall);

    const responsePayload = {
      ok: true,
      callId: localCallId,
      runId,
      status: "queued",
      patientName: name,
      phoneNumber,
      message: `Recall call dispatched to ${phoneNumber} in ${language.toUpperCase()}.`,
      dispatched_at: new Date().toISOString()
    };

    if (idempotencyKey) {
      recallIdempotencyKeys.set(idempotencyKey, responsePayload);
      await saveDbIdempotencyKey(idempotencyKey, responsePayload, 200);
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("[trigger-recall] Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
