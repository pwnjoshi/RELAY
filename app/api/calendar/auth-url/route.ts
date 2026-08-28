import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/calendar";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state") || "relay_auth";
    const url = getGoogleOAuthUrl(state);

    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
