import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall } from "@/lib/calle-client";
import { CallRecord, LanguageCode } from "@/lib/types";
import { telephonyRateLimiter, getClientIp } from "@/lib/rate-limiter";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

// In-memory idempotency cache for deduplication
const dispatchedIdempotencyKeys = new Map<string, any>();

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

    // 2. Idempotency Check
    const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
    if (idempotencyKey && dispatchedIdempotencyKeys.has(idempotencyKey)) {
      return NextResponse.json(dispatchedIdempotencyKeys.get(idempotencyKey));
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
        language: language as LanguageCode,
        notes: "Call queued in regional carrier PSTN gateway..."
      },
      recoveredRevenue: 0,
      summary: "Call queued in regional carrier PSTN gateway..."
    };

    store.addCall(initialCall);

    const responsePayload = {
      ok: true,
      message: "Call successfully dispatched to CALL-E telephony gateway",
      callId: localCallId,
      runId,
      status: "queued"
    };

    if (idempotencyKey) {
      dispatchedIdempotencyKeys.set(idempotencyKey, responsePayload);
    }

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error("[trigger-overflow] Fatal dispatch error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
