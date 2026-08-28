import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/proxy";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/analytics",
  "/batch",
  "/billing",
  "/calls",
  "/campaigns",
  "/diagnostics",
  "/fleet",
  "/iam",
  "/integrations",
  "/settings"
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Supabase session refresh if configured
  let response = NextResponse.next({ request });
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    try {
      const { supabaseResponse } = createClient(request);
      response = supabaseResponse;
    } catch {}
  }

  // 2. Strict Route Protection for Dashboard and Console routes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const accessToken = request.cookies.get("relay_access_token")?.value;
    const refreshToken = request.cookies.get("relay_refresh_token")?.value;

    let isAuthenticated = false;

    // Check Access Token
    if (accessToken) {
      const validAccess = verifyAccessToken(accessToken);
      if (validAccess) {
        isAuthenticated = true;
      }
    }

    // Fallback: Check Refresh Token
    if (!isAuthenticated && refreshToken) {
      const validRefresh = verifyRefreshToken(refreshToken);
      if (validRefresh) {
        isAuthenticated = true;
      }
    }

    // Also support legacy token during migration window if present
    if (!isAuthenticated) {
      const legacyToken = request.cookies.get("relay_jwt_token")?.value;
      if (legacyToken && verifyAccessToken(legacyToken)) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      // Redirect unauthenticated requests to login page
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Inject Production Security Headers (Helmet Equivalent)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png (favicons)
     * - public files (images, audio, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg)$).*)",
  ],
};
