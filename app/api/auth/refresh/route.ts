/**
 * POST /api/auth/refresh
 * Refresh Token Rotation & Access Token Re-issuance
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  revokeRefreshToken,
  findUser,
  setAuthCookies,
  REFRESH_TOKEN_COOKIE
} from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE);

    // Also check authorization header or body if sent by mobile / API client
    let rawToken = refreshCookie?.value;
    if (!rawToken) {
      try {
        const body = await req.json();
        rawToken = body.refreshToken;
      } catch {}
    }

    if (!rawToken) {
      return NextResponse.json(
        { ok: false, error: "Refresh token is missing or expired." },
        { status: 401 }
      );
    }

    // 1. Cryptographically verify the refresh token
    const decoded = verifyRefreshToken(rawToken);
    if (!decoded) {
      return NextResponse.json(
        { ok: false, error: "Invalid or revoked refresh token. Please sign in again." },
        { status: 401 }
      );
    }

    // 2. Lookup the user
    const user = findUser(decoded.userId) || findUser(decoded.email);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User associated with token no longer exists." },
        { status: 401 }
      );
    }

    // 3. Revoke the old refresh token (Token Rotation Security)
    revokeRefreshToken(rawToken);

    // 4. Issue a new Access Token + Rotated Refresh Token
    const { accessToken, refreshToken } = await setAuthCookies(user);

    return NextResponse.json({
      ok: true,
      message: "Tokens refreshed successfully.",
      tokens: {
        accessToken,
        expiresIn: 900 // 15 minutes
      }
    });
  } catch (err: unknown) {
    logger.error("[Token Refresh Error]:", err);
    return NextResponse.json(
      { ok: false, error: "An error occurred while refreshing your session." },
      { status: 500 }
    );
  }
}
