import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall } from "@/lib/calle-client";
import { CallRecord, LanguageCode } from "@/lib/types";
import { telephonyRateLimiter, getClientIp } from "@/lib/rate-limiter";
import { getSessionUser } from "@/lib/auth";
import { syncCallToSupabase } from "@/lib/supabase";
import { checkIdempotency, recordIdempotency } from "@/lib/idempotency";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const isUserLoggedIn = Boolean(user);
    const clientIp = getClientIp(req);
    const rateLimitKey = user ? `usr_${user.id}` : `ip_${clientIp}`;

    // 1. Sliding Window Quota Check (3 calls/day demo vs 8 calls/day auth)
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

    // 2. Durable Idempotency Deduplication Check (In-Memory TTL + Supabase)
    const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const cached = await checkIdempotency(idempotencyKey);
      if (cached.isCached && cached.responseJson) {
        return NextResponse.json(cached.responseJson, { status: cached.statusCode || 200 });
      }
    }

    const body = await req.json();
    const { phoneNumber, patientName, locationId, language = "en", customLocation, extraContext } = body;

    if (!phoneNumber) {
      return NextResponse.json({ ok: false, error: "phoneNumber is required" }, { status: 400 });
    }

    let location = customLocation;
    if (!location || !location.name) {
      const locations = getLocations();
      location = locations.find((l: any) => l.id === locationId) || locations[0];
    }
    const name = patientName || "Valued Caller";
    const localCallId = `call_${Date.now()}`;

    // 3. Dispatch live call to CALL-E REST API (Non-blocking sub-15ms handshake)
    const directRes = await createDirectCall({
      phoneNumber,
      patientName: name,
      location,
      callType: "inbound_overflow",
      language: language as LanguageCode,
      extraContext
    });

    if (!directRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: directRes.error || "Failed to dispatch call to CALL-E telephony engine.",
          details: directRes.details
        },
        { status: directRes.status || 500 }
      );
    }

    const runId = directRes.result?.run_id || directRes.result?.id || localCallId;

    // 4. Record new call in in-memory store
    const initialCall: CallRecord = {
      id: localCallId,
      runId,
      phoneNumber,
      patientName: name,
      locationId: location.id,
      departmentId: "dept_general",
      callType: "inbound_overflow",
      status: "queued",
      recoveredRevenue: 0,
      createdAt: new Date().toISOString(),
      structuredOutcome: {
        call_id: localCallId,
        location_id: location.id,
        department_id: "dept_general",
        call_type: "inbound_overflow",
        caller_verified: true,
        outcome: "booked",
        appointment: { booked: false, datetime: null, service_type: null },
        callback: { requested: false, priority: null, reason: null },
        opt_out: false,
        sentiment: "neutral",
        language,
        notes: extraContext || "Inbound call overflow intercepted by Relay Voice Agent."
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
      message: `Call dispatched to ${phoneNumber} with ${language.toUpperCase()} voice model.`,
      dispatched_at: new Date().toISOString()
    };

    // 5. Cache response in TTL in-memory store + durable Supabase table
    if (idempotencyKey) {
      await recordIdempotency(idempotencyKey, responsePayload, 200);
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("[trigger-overflow] Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
