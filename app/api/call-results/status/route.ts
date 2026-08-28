import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getDirectCall } from "@/lib/calle-client";

// Map status strings from vendor to normalized UI statuses
function normalizeStatus(raw: string): string {
  const s = (raw || "").toLowerCase().trim();
  if (s === "completed" || s === "done" || s === "finished") return "completed";
  if (s === "failed" || s === "cancelled" || s === "canceled" || s === "error") return "failed";
  if (s === "in_progress" || s === "in-progress" || s === "active" || s === "answered" || s === "running") return "in-progress";
  if (s === "dialing" || s === "ringing" || s === "connecting") return "ringing";
  return "queued";
}

function extractSummary(data: any): string {
  const r = data?.recipients?.[0];
  return (
    data?.summary ||
    r?.summary ||
    r?.structured_result?.summary ||
    r?.structured_result?.notes ||
    data?.structured_result?.summary ||
    ""
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return NextResponse.json({ ok: false, error: "runId is required" }, { status: 400 });
  }

  try {
    // 1. Always attempt a live direct vendor API call first (most accurate, real-time)
    //    The runId may be the real vendor call_* id OR a local fallback call_* id.
    //    Try vendor API first — it will 404 for local fallback ids, and we fall through.
    const directRes = await getDirectCall(runId);

    if (directRes.ok && directRes.result) {
      const callData = directRes.result;
      const recipient = callData.recipients?.[0];

      // Prefer recipient-level status as it reflects the actual handset state
      const rawStatus = (recipient?.status || callData.status || "queued").toLowerCase();
      const normalizedStatus = normalizeStatus(rawStatus);
      const summary = extractSummary(callData);

      // Also update local store with the fresh vendor data so dashboards stay in sync
      const localCall = store.getCalls().find((c) => c.runId === runId || c.id === runId);
      const recordingUrl =
        callData.recording_url ||
        recipient?.recording_url ||
        recipient?.attempts?.[0]?.recording_url ||
        callData.audio_url ||
        undefined;
      const durationSeconds =
        callData.duration_seconds ||
        recipient?.duration_seconds ||
        recipient?.attempts?.[0]?.duration_seconds ||
        undefined;

      if (localCall) {
        store.updateCall(localCall.id, {
          status: normalizedStatus as any,
          summary: summary || localCall.summary,
          completedAt: callData.completed_at || localCall.completedAt,
          recordingUrl: recordingUrl || localCall.recordingUrl,
          durationSeconds: durationSeconds || localCall.durationSeconds
        });
      }

      return NextResponse.json({
        ok: true,
        runId,
        status: normalizedStatus,
        rawVendorStatus: rawStatus,
        summary,
        attempts: recipient?.attempts?.length || 0,
        completedAt: callData.completed_at
      });
    }

    // 2. Vendor API returned 404 or error (likely a local fallback call id) —
    //    look up from local store in-memory which gets updated by the background poller.
    const localCall = store.getCalls().find((c) => c.runId === runId || c.id === runId);
    if (localCall) {
      const mappedStatus = localCall.status === "running" ? "in-progress" : localCall.status;
      const summary = localCall.summary || localCall.structuredOutcome?.notes || "";

      // If local store has a real vendor runId different from what was queried,
      // try fetching that real runId from the vendor now
      if (localCall.runId && localCall.runId !== runId && !localCall.runId.startsWith("call_sim_")) {
        const realRes = await getDirectCall(localCall.runId);
        if (realRes.ok && realRes.result) {
          const callData = realRes.result;
          const recipient = callData.recipients?.[0];
          const rawStatus = (recipient?.status || callData.status || "queued").toLowerCase();
          const normalizedStatus = normalizeStatus(rawStatus);
          const liveSummary = extractSummary(callData);

          store.updateCall(localCall.id, {
            status: normalizedStatus as any,
            summary: liveSummary || summary,
            completedAt: callData.completed_at || localCall.completedAt
          });

          return NextResponse.json({
            ok: true,
            runId,
            status: normalizedStatus,
            rawVendorStatus: rawStatus,
            summary: liveSummary || summary,
            completedAt: callData.completed_at
          });
        }
      }

      return NextResponse.json({
        ok: true,
        runId,
        status: mappedStatus,
        summary,
        completedAt: localCall.completedAt
      });
    }

    // 3. Fallback — nothing found, return queued
    return NextResponse.json({
      ok: true,
      runId,
      status: "queued",
      summary: "Routing to destination carrier..."
    });
  } catch (err: any) {
    return NextResponse.json({ ok: true, runId, status: "queued", summary: err.message }, { status: 200 });
  }
}
