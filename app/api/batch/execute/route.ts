import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { createDirectCall } from "@/lib/calle-client";
import { CallRecord } from "@/lib/types";
import { getSessionUser } from "@/lib/auth";
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
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Session required to launch batch campaigns." },
        { status: 401 }
      );
    }

    // 1. Idempotency Check (Batch Scope: 1 key = 1 entire campaign execution run)
    const idempotencyKey = req.headers.get("idempotency-key") || req.headers.get("Idempotency-Key");
    if (idempotencyKey) {
      const cached = await checkIdempotency(idempotencyKey);
      if (cached.isCached && cached.responseJson) {
        return NextResponse.json(cached.responseJson, { status: cached.statusCode || 200 });
      }
    }

    const body = await req.json();
    const { campaignId } = body;

    const campaign = store.getBatchCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json({ ok: false, error: "Campaign not found" }, { status: 404 });
    }

    // If already processing or completed, short-circuit
    if (campaign.status === "processing" || campaign.status === "completed") {
      const responsePayload = {
        ok: true,
        message: `Batch campaign already in status '${campaign.status}'.`,
        campaign,
        idempotentReplay: true
      };
      if (idempotencyKey) {
        await recordIdempotency(idempotencyKey, responsePayload, 200);
      }
      return NextResponse.json(responsePayload);
    }

    store.updateBatchCampaign(campaignId, { status: "processing" });

    const locations = getLocations();
    const location = locations[0];

    // Asynchronously dispatch calls for queued items in background
    (async () => {
      for (const item of campaign.items) {
        if (item.status === "queued") {
          item.status = "dialing";
          const callId = `call_batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

          const callRecord: CallRecord = {
            id: callId,
            phoneNumber: item.phoneNumber,
            patientName: item.patientName,
            locationId: location.id,
            departmentId: item.departmentId,
            callType: "batch_followup",
            status: "running",
            createdAt: new Date().toISOString(),
            language: item.language,
            customGoal: item.customGoal,
            recoveredRevenue: 0
          };

          store.addCall(callRecord);

          try {
            const res = await createDirectCall({
              phoneNumber: item.phoneNumber,
              patientName: item.patientName,
              location,
              callType: "batch_followup",
              departmentId: item.departmentId,
              language: item.language,
              customGoal: item.customGoal
            });

            if (res.ok && res.result) {
              item.callId = callId;
              item.status = "completed";
              item.outcome = "booked";
              item.notes = "Call successfully dispatched via CALL-E";
              campaign.completedCount += 1;
              campaign.bookedCount += 1;
            } else {
              item.status = "failed";
              item.notes = res.error || "Failed to dispatch";
              campaign.completedCount += 1;
            }
          } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            item.status = "failed";
            item.notes = errorMsg;
            campaign.completedCount += 1;
          }

          store.updateBatchCampaign(campaignId, {
            completedCount: campaign.completedCount,
            bookedCount: campaign.bookedCount,
            items: [...campaign.items]
          });

          // Small delay between calls
          await new Promise((r) => setTimeout(r, 1200));
        }
      }

      store.updateBatchCampaign(campaignId, { status: "completed" });
    })();

    const responsePayload = {
      ok: true,
      message: "Batch campaign execution started",
      campaign
    };

    if (idempotencyKey) {
      await recordIdempotency(idempotencyKey, responsePayload, 200);
    }

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
