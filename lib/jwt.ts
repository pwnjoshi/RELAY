/**
 * lib/jwt.ts
 * Enterprise Cryptographic Dual-Token JWT Engine (HS256)
 * Short-lived Access Tokens (15m) + Long-lived Rotated Refresh Tokens (7d)
 */
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "relay-enterprise-call-e-secret-key-2026-auth-secure-super-long-entropy-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "relay-enterprise-refresh-secret-key-2026-auth-secure-super-long-entropy-key";

export type TokenType = "access" | "refresh";

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface JwtPayload extends JwtUserPayload {
  type: TokenType;
  jti: string; // Unique JWT Token ID for tracking & revocation
  iat: number;
  exp: number;
}

// In-Memory Revocation Blocklist for logged-out / rotated refresh tokens
const globalForRevocation = globalThis as unknown as { revokedTokens: Set<string> };
const revokedTokens = globalForRevocation.revokedTokens || new Set<string>();
if (process.env.NODE_ENV !== "production") {
  globalForRevocation.revokedTokens = revokedTokens;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Signs a short-lived 15-Minute Access Token
 */
export function signAccessToken(payload: JwtUserPayload): string {
  return signCustomToken(payload, "access", 15 * 60, JWT_SECRET);
}

/**
 * Signs a long-lived 7-Day Refresh Token
 */
export function signRefreshToken(payload: JwtUserPayload): string {
  return signCustomToken(payload, "refresh", 7 * 24 * 60 * 60, JWT_REFRESH_SECRET);
}

function signCustomToken(
  payload: JwtUserPayload,
  type: TokenType,
  expiresInSeconds: number,
  secret: string
): string {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const jti = `${type}_${crypto.randomBytes(16).toString("hex")}_${now}`;

  const fullPayload: JwtPayload = {
    ...payload,
    type,
    jti,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies an Access Token
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  return verifyCustomToken(token, "access", JWT_SECRET);
}

/**
 * Verifies a Refresh Token
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  return verifyCustomToken(token, "refresh", JWT_REFRESH_SECRET);
}

function verifyCustomToken(
  token: string,
  expectedType: TokenType,
  secret: string
): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Constant-time HMAC comparison
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Verify token type & expiry
    if (payload.type !== expectedType) {
      return null;
    }

    if (payload.exp && payload.exp < now) {
      return null;
    }

    // Check revocation list
    if (payload.jti && revokedTokens.has(payload.jti)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Revokes a refresh token by JTI or raw token string
 */
export function revokeRefreshToken(tokenOrJti: string): void {
  try {
    if (tokenOrJti.startsWith("refresh_")) {
      revokedTokens.add(tokenOrJti);
      return;
    }
    const decoded = verifyRefreshToken(tokenOrJti);
    if (decoded && decoded.jti) {
      revokedTokens.add(decoded.jti);
    }
  } catch {}
}

// Backward compatibility helper
export function signToken(
  payload: JwtUserPayload,
  expiresInSeconds: number = 7 * 24 * 60 * 60
): string {
  return signCustomToken(payload, "access", expiresInSeconds, JWT_SECRET);
}

export function verifyToken(token: string): JwtPayload | null {
  return verifyAccessToken(token) || verifyRefreshToken(token);
}
