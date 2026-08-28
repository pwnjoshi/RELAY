import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || searchParams.get("locationId") || "loc_downtown";
    const state = searchParams.get("state") || "relay_auth";
    const url = getGoogleOAuthUrl({ branchId, state });

    return NextResponse.json({ ok: true, url, branchId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
