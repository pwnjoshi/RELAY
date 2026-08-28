import { NextRequest, NextResponse } from "next/server";
import {
  getCalendarStatus,
  updateCalendarConfig,
  getAvailableSlots,
  bookCalendarAppointment,
  cancelCalendarAppointment
} from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "availability") {
    const date = searchParams.get("date") || "2026-08-28";
    const slots = getAvailableSlots(date);
    return NextResponse.json({ ok: true, slots });
  }

  const status = getCalendarStatus();
  return NextResponse.json({ ok: true, ...status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "update_config") {
      const updated = updateCalendarConfig(body.config || {});
      return NextResponse.json({ ok: true, config: updated });
    }

    if (action === "book") {
      const { customerName, customerPhone, serviceType, startIso, durationMinutes, notes } = body;
      if (!customerName || !customerPhone || !startIso) {
        return NextResponse.json({ ok: false, error: "Missing required booking details (customerName, customerPhone, startIso)." }, { status: 400 });
      }

      const res = bookCalendarAppointment({
        customerName,
        customerPhone,
        serviceType: serviceType || "General Consultation",
        startIso,
        durationMinutes: durationMinutes || 45,
        notes
      });

      return NextResponse.json({ ok: res.success, event: res.event, error: res.error });
    }

    if (action === "cancel") {
      const { eventId, verificationPhone } = body;
      if (!eventId || !verificationPhone) {
        return NextResponse.json({ ok: false, error: "Missing eventId or verificationPhone." }, { status: 400 });
      }

      const res = cancelCalendarAppointment(eventId, verificationPhone);
      return NextResponse.json({ ok: res.success, error: res.error });
    }

    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
