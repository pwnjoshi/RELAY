/**
 * POST /api/auth/logout
 * Invalidate Refresh Token & Clear All Session Cookies
 */
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({
    ok: true,
    message: "Logged out successfully. All authentication tokens cleared."
  });
}
