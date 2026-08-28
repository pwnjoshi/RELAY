/**
 * POST /api/auth/login
 * Production Login with Rate Limiting, Bcrypt verification, and Dual JWT issuance
 */
import { NextResponse } from "next/server";
import { validateCredentials, setAuthCookies } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";
import { authRateLimiter, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  // 1. Rate Limiting (5 attempts / minute per IP)
  const clientIp = getClientIp(req);
  const rateLimit = authRateLimiter.check(`login_${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many login attempts. Please wait ${rateLimit.resetTime} seconds before trying again.`
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetTime),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0"
        }
      }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    // 2. Validate input
    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      return NextResponse.json({ ok: false, error: emailVal.error }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
    }

    // 3. Authenticate with constant-time Bcrypt verify
    const user = await validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid email address or password. Please check your credentials."
        },
        {
          status: 401,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining)
          }
        }
      );
    }

    // 4. Reset rate limiter on successful authentication
    authRateLimiter.reset(`login_${clientIp}`);

    // 5. Issue Dual JWT Tokens (15m Access Token + 7d HttpOnly Refresh Token)
    const { accessToken, refreshToken } = await setAuthCookies(user);

    return NextResponse.json(
      {
        ok: true,
        message: `Welcome back, ${user.name}!`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          departmentIds: user.departmentIds,
          allowedPaths: user.allowedPaths
        },
        tokens: {
          accessToken,
          expiresIn: 900 // 15 minutes
        }
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        }
      }
    );
  } catch (err: any) {
    console.error("[Login Error]:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}
