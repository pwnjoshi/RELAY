import { NextRequest, NextResponse } from "next/server";
import {
  getCalendarConfig,
  saveBranchCalendarConnection,
  deleteBranchCalendarConnection,
  getAvailableSlots,
  bookCalendarAppointment,
  deleteCalendarAppointment,
  getAllCalendarEvents,
  getCalendarAuditTrail
} from "@/lib/calendar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || searchParams.get("locationId") || "loc_downtown";
    const action = searchParams.get("action");

    if (action === "availability") {
      const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
      const duration = Number(searchParams.get("duration")) || 30;
      const slots = await getAvailableSlots(date, duration, branchId);
      return NextResponse.json({ ok: true, slots, branchId });
    }

    if (action === "events") {
      const events = getAllCalendarEvents(branchId);
      return NextResponse.json({ ok: true, events, branchId });
    }

    if (action === "audit") {
      const audit = getCalendarAuditTrail(branchId);
      return NextResponse.json({ ok: true, audit, branchId });
    }

    const config = await getCalendarConfig(branchId);
    return NextResponse.json({
      ok: true,
      branchId,
      connected: config.connected,
      config,
      events: getAllCalendarEvents(branchId),
      auditTrail: getCalendarAuditTrail(branchId)
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const branchId = body.branchId || body.locationId || "loc_downtown";
    const { action } = body;

    if (action === "update_config") {
      await saveBranchCalendarConnection(branchId, {
        config_json: body.config || {}
      });
      const updated = await getCalendarConfig(branchId);
      return NextResponse.json({ ok: true, config: updated, branchId });
    }

    if (action === "disconnect") {
      await deleteBranchCalendarConnection(branchId);
      return NextResponse.json({ ok: true, disconnected: true, branchId });
    }

    if (action === "book") {
      const { customerName, customerPhone, serviceType, startIso, durationMinutes, notes, sourceCallId } = body;
      if (!customerName || !customerPhone || !startIso) {
        return NextResponse.json(
          { ok: false, error: "Missing required booking details (customerName, customerPhone, startIso)." },
          { status: 400 }
        );
      }

      const res = await bookCalendarAppointment({
        customerName,
        customerPhone,
        serviceType: serviceType || "General Consultation",
        startIso,
        durationMinutes: durationMinutes || 30,
        notes,
        sourceCallId,
        branchId
      });

      return NextResponse.json({ ok: res.success, event: res.event, error: res.error, branchId });
    }

    if (action === "cancel") {
      const { eventId } = body;
      if (!eventId) {
        return NextResponse.json(
          { ok: false, error: "Missing eventId." },
          { status: 400 }
        );
      }

      const res = await deleteCalendarAppointment(eventId, branchId);
      return NextResponse.json({ ok: res.success, error: res.error, branchId });
    }

    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
