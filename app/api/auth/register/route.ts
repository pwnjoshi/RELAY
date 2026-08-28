/**
 * POST /api/auth/register
 * Register a new staff user with Bcrypt password hashing & Dual JWT cookies
 */
import { NextResponse } from "next/server";
import { createUser, setAuthCookies } from "@/lib/auth";
import { validateEmail, validatePassword, validateName, validateRole } from "@/lib/validation";
import { authRateLimiter, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  // 1. Rate Limiting (5 attempts / minute per IP)
  const clientIp = getClientIp(req);
  const rateLimit = authRateLimiter.check(`register_${clientIp}`, 5, 60 * 1000);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many registration attempts. Please try again in ${rateLimit.resetTime} seconds.`
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
    const { name, email, password, role, title, departmentIds } = body;

    // 2. Input Validation
    const nameVal = validateName(name);
    if (!nameVal.valid) {
      return NextResponse.json({ ok: false, error: nameVal.error }, { status: 400 });
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      return NextResponse.json({ ok: false, error: emailVal.error }, { status: 400 });
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      return NextResponse.json({ ok: false, error: passVal.error }, { status: 400 });
    }

    const roleVal = validateRole(role);

    // 3. Create User & Hash Password
    const { user, error } = await createUser({
      name,
      email,
      password,
      role: roleVal.role,
      title,
      departmentIds
    });

    if (error || !user) {
      return NextResponse.json({ ok: false, error: error || "Failed to create user." }, { status: 409 });
    }

    // 4. Issue Dual JWT Tokens & Set Secure Cookies
    const { accessToken, refreshToken } = await setAuthCookies(user);

    return NextResponse.json(
      {
        ok: true,
        message: "Account created successfully.",
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
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        }
      }
    );
  } catch (err: any) {
    console.error("[Register Error]:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected server error occurred during registration." },
      { status: 500 }
    );
  }
}
