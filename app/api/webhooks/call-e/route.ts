import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { parseRestCallOutcome } from "@/lib/calle-client";
import { analyzeCallTranscript } from "@/lib/ai-analyzer";
import { runPostCallActionPipeline } from "@/lib/connectors";
import type { CallRecord, ClinicLocation } from "@/lib/types";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

function getLocations(): ClinicLocation[] {
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

    logger.info(`[CALL-E Webhook] Received event ${eventId || payload.id} (type: ${payload.type})`);

    const callTask = payload.data || payload;
    const callId = callTask.metadata?.call_id || callTask.id;
    const locationId = callTask.metadata?.location_id || "loc_downtown";
    const callType = (callTask.metadata?.call_type || "inbound_overflow") as "inbound_overflow" | "outbound_recall";

    const locations = getLocations();
    const location = locations.find((l: ClinicLocation) => l.id === locationId) || locations[0];

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

    // AWS Bedrock (Claude 3.5 Sonnet / Llama 3) & Nebius Post-Call Intelligence
    let aiIntelligence;
    try {
      const transcriptText = callTask.transcript || callTask.summary || structuredOutcome.notes || "";
      if (transcriptText) {
        aiIntelligence = await analyzeCallTranscript(transcriptText, callerName, location.name);
      }
    } catch (aiErr: unknown) {
      const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      logger.warn(`[CALL-E Webhook] AI intelligence skipped on error: ${errMsg}`);
    }

    const recordingUrl =
      callTask.recording_url ||
      callTask.recipients?.[0]?.recording_url ||
      callTask.recipients?.[0]?.attempts?.[0]?.recording_url ||
      callTask.audio_url ||
      undefined;

    const durationSeconds =
      callTask.duration_seconds ||
      callTask.recipients?.[0]?.duration_seconds ||
      callTask.recipients?.[0]?.attempts?.[0]?.duration_seconds ||
      undefined;

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
      rawCalleData: callTask,
      recordingUrl,
      durationSeconds
    };

    if (existing) {
      store.updateCall(existing.id, updatedRecord);
    } else {
      store.addCall(updatedRecord);
    }

    // Run Post-Call Action Pipeline (Google Calendar, Slack, CRM)
    try {
      await runPostCallActionPipeline(updatedRecord, structuredOutcome, location.name);
    } catch (pipelineErr: unknown) {
      logger.warn("[CALL-E Webhook] Connector pipeline warning:", pipelineErr);
    }

    return NextResponse.json({ ok: true, received: true, callId });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("[CALL-E Webhook] Processing error:", err);
    return NextResponse.json({ ok: false, error: errMsg || "Failed to process webhook" }, { status: 400 });
  }
}
