import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall, getDirectCall, parseRestCallOutcome } from "@/lib/calle-client";
import { CallRecord, LanguageCode } from "@/lib/types";
import { telephonyRateLimiter, getClientIp } from "@/lib/rate-limiter";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

function pollCallRunUntilResolved(callId: string, runId: string, location: any) {
  let attempts = 0;
  const maxAttempts = 300; // 5 minutes max at 1s intervals

  const interval = setInterval(async () => {
    attempts++;
    try {
      const statusRes = await getDirectCall(runId);
      if (statusRes.ok && statusRes.result) {
        const runData = statusRes.result;
        const status = (runData.status || "").toLowerCase();
        const recipient = runData.recipients?.[0];
        const recipientStatus = (recipient?.status || status).toLowerCase();

        let mappedStatus: "queued" | "ringing" | "in-progress" | "completed" | "failed" = "queued";
        if (recipientStatus === "completed" || status === "completed") {
          mappedStatus = "completed";
        } else if (recipientStatus === "failed" || status === "failed" || recipientStatus === "canceled") {
          mappedStatus = "failed";
        } else if (
          recipientStatus === "in_progress" ||
          recipientStatus === "in-progress" ||
          recipientStatus === "answered" ||
          recipientStatus === "active"
        ) {
          mappedStatus = "in-progress";
        } else if (recipientStatus === "dialing" || recipientStatus === "ringing") {
          mappedStatus = "ringing";
        }

        const summary =
          runData.summary ||
          recipient?.summary ||
          recipient?.structured_result?.summary ||
          recipient?.structured_result?.notes ||
          (mappedStatus === "ringing" ? "Ringing destination phone handset..." : "Carrier PSTN gateway connected...");

        store.updateCall(callId, {
          status: mappedStatus,
          summary,
          rawCalleData: runData
        });

        if (status === "completed" || status === "failed" || status === "canceled" || attempts >= maxAttempts) {
          clearInterval(interval);
          const finalStatus = status === "failed" || status === "canceled" ? "failed" : "completed";
          const structuredOutcome = parseRestCallOutcome(runData, {
            callId,
            locationId: location.id,
            callType: "inbound_overflow"
          });
          const revenue = structuredOutcome.appointment.booked ? (location.average_ticket_value || 320) : 0;
          store.updateCall(callId, {
            status: finalStatus,
            completedAt: runData.completed_at || new Date().toISOString(),
            structuredOutcome,
            recoveredRevenue: revenue,
            summary: structuredOutcome.notes || summary
          });
        }
      }
    } catch (err) {
      console.error(`[REST Poller] Error polling call ${callId}:`, err);
    }

    if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 1000);
}

import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    const isUserLoggedIn = Boolean(user);
    const clientIp = getClientIp(req);
    const rateLimitKey = user ? `usr_${user.id}` : `ip_${clientIp}`;

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

    // Dispatch live call to CALL-E REST API
    const directRes = await createDirectCall({
      phoneNumber,
      patientName: name,
      location,
      callType: "inbound_overflow",
      language: language as LanguageCode,
      extraContext
    });

    if (!directRes.ok || !directRes.result) {
      const errorMsg = directRes.error || "Carrier dispatch failed";
      const failedRecord: CallRecord = {
        id: localCallId,
        runId: localCallId,
        phoneNumber,
        patientName: name,
        locationId: location.id || "loc_custom",
        callType: "inbound_overflow",
        status: "failed",
        createdAt: new Date().toISOString(),
        recoveredRevenue: 0,
        language: language as LanguageCode,
        summary: `Dispatch failed: ${errorMsg}`
      };
      store.addCall(failedRecord);

      return NextResponse.json(
        { ok: false, error: errorMsg, runId: localCallId, status: "failed" },
        { status: directRes.status || 500 }
      );
    }

    const realRunId = directRes.result.id;

    // Store initial record with real vendor runId
    const callRecord: CallRecord = {
      id: localCallId,
      runId: realRunId,
      phoneNumber,
      patientName: name,
      locationId: location.id || "loc_custom",
      callType: "inbound_overflow",
      status: "queued",
      createdAt: new Date().toISOString(),
      recoveredRevenue: 0,
      language: language as LanguageCode,
      summary: "Interconnecting PSTN gateway..."
    };

    store.addCall(callRecord);

    // Poll live run until completed or failed
    pollCallRunUntilResolved(localCallId, realRunId, location);

    return NextResponse.json({
      ok: true,
      message: "Call dispatched on regional carrier gateway",
      callId: localCallId,
      runId: realRunId,
      status: "queued",
      location: location.name
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
