import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { parseRestCallOutcome } from "@/lib/calle-client";
import { analyzeCallTranscriptWithDeepSeek } from "@/lib/nebius-ai";
import { runPostCallActionPipeline } from "@/lib/connectors";
import type { CallRecord } from "@/lib/types";
import fs from "fs";
import path from "path";

function getLocations() {
  const locPath = path.resolve(process.cwd(), "data/locations.json");
  return JSON.parse(fs.readFileSync(locPath, "utf-8"));
}

/**
 * CALL-E Terminal Webhook Receiver
 * Matches OpenAPI 3.1.0 /calle/webhook specification
 */
export async function POST(req: Request) {
  try {
    const eventId = req.headers.get("CALL-E-Event-Id") || req.headers.get("call-e-event-id");
    const payload = await req.json();

    console.log(`[CALL-E Webhook] Received event ${eventId || payload.id} (type: ${payload.type})`);

    const callTask = payload.data || payload;
    const callId = callTask.metadata?.call_id || callTask.id;
    const locationId = callTask.metadata?.location_id || "loc_downtown";
    const callType = (callTask.metadata?.call_type || "inbound_overflow") as "inbound_overflow" | "outbound_recall";

    const locations = getLocations();
    const location = locations.find((l: any) => l.id === locationId) || locations[0];

    const structuredOutcome = parseRestCallOutcome(callTask, {
      callId,
      locationId: location.id,
      callType
    });

    const revenue = structuredOutcome.appointment.booked ? (location.average_ticket_value || 320) : 0;

    // Check if call exists in store
    const existing = store.getCalls().find(c => c.id === callId || c.runId === callTask.id);
    const callerName = callTask.metadata?.patient_name || existing?.patientName || "Valued Caller";
    const callerPhone = callTask.recipients?.[0]?.phones?.[0] || existing?.phoneNumber || "+15550000000";

    // DeepSeek-V4-Flash-0731 Post-Call Intelligence
    let aiIntelligence;
    try {
      const transcriptText = callTask.transcript || callTask.summary || structuredOutcome.notes || "";
      if (transcriptText) {
        aiIntelligence = await analyzeCallTranscriptWithDeepSeek(transcriptText, callerName, location.name);
      }
    } catch (aiErr: any) {
      console.warn("[CALL-E Webhook] AI intelligence skipped on error:", aiErr.message);
    }

    const statusVal: CallRecord["status"] = callTask.status === "failed" ? "failed" : "completed";
    const updatedRecord: CallRecord = {
      id: callId,
      runId: callTask.id,
      phoneNumber: callerPhone,
      patientName: callerName,
      locationId: location.id,
      callType,
      status: statusVal,
      createdAt: callTask.created_at || new Date().toISOString(),
      completedAt: callTask.completed_at || new Date().toISOString(),
      structuredOutcome,
      recoveredRevenue: revenue,
      summary: structuredOutcome.notes,
      aiIntelligence,
      rawCalleData: callTask
    };

    if (existing) {
      store.updateCall(existing.id, updatedRecord);
    } else {
      store.addCall(updatedRecord);
    }

    // Run Post-Call Action Pipeline (Google Calendar, Slack, CRM)
    try {
      await runPostCallActionPipeline(updatedRecord as any, structuredOutcome, location.name);
    } catch (pipelineErr) {
      console.warn("[CALL-E Webhook] Connector pipeline warning:", pipelineErr);
    }

    return NextResponse.json({ ok: true, received: true, callId });
  } catch (err: any) {
    console.error("[CALL-E Webhook] Processing error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to process webhook" }, { status: 400 });
  }
}
