import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Session required to export audit records." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const calls = store.getCalls();

  if (format === "json") {
    return new NextResponse(JSON.stringify(calls, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="relay-call-audit-${Date.now()}.json"`
      }
    });
  }

  // CSV format
  const headers = [
    "Call ID",
    "Created At",
    "Patient Name",
    "Phone Number",
    "Location ID",
    "Call Type",
    "Status",
    "Disposition Outcome",
    "Booked Appointment",
    "Appointment Date",
    "Service Type",
    "Callback Priority",
    "Sentiment",
    "Revenue Recovered",
    "Notes"
  ];

  const rows = calls.map((c) => {
    const o = c.structuredOutcome;
    return [
      c.id,
      c.createdAt,
      `"${c.patientName.replace(/"/g, '""')}"`,
      `"${c.phoneNumber}"`,
      c.locationId,
      c.callType,
      c.status,
      o?.outcome || "unresolved",
      o?.appointment?.booked ? "TRUE" : "FALSE",
      o?.appointment?.datetime || "",
      `"${(o?.appointment?.service_type || "").replace(/"/g, '""')}"`,
      o?.callback?.priority || "none",
      o?.sentiment || "neutral",
      c.recoveredRevenue || 0,
      `"${(o?.notes || c.summary || "").replace(/"/g, '""')}"`
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relay-call-audit-${Date.now()}.csv"`
    }
  });
}
