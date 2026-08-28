import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const stats = store.getStats();
  return NextResponse.json({
    ok: true,
    stats
  });
}
