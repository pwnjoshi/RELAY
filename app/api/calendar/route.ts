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
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const duration = Number(searchParams.get("duration")) || 30;
    const slots = await getAvailableSlots(date, duration);
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
        sourceCallId
      });

      return NextResponse.json({ ok: res.success, event: res.event, error: res.error });
    }

    if (action === "cancel") {
      const { eventId, verificationPhone } = body;
      if (!eventId || !verificationPhone) {
        return NextResponse.json(
          { ok: false, error: "Missing eventId or verificationPhone." },
          { status: 400 }
        );
      }

      const res = await cancelCalendarAppointment(eventId, verificationPhone);
      return NextResponse.json({ ok: res.success, error: res.error });
    }

    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
