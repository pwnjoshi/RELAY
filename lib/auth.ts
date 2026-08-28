/**
 * lib/auth.ts
 * Enterprise Authentication & RBAC Engine
 * Bcrypt Hashing (12 Rounds), Dual-Token Management, and Cookie Controls
 */
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { UserRole } from "./types";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  JwtUserPayload,
  JwtPayload
} from "./jwt";

export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  type JwtUserPayload,
  type JwtPayload
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentIds: string[];
  avatarColor: string;
  title: string;
  allowedPaths: string[];
  createdAt: string;
}

export const ACCESS_TOKEN_COOKIE = "relay_access_token";
export const REFRESH_TOKEN_COOKIE = "relay_refresh_token";

// Standard salt rounds for enterprise security
const BCRYPT_SALT_ROUNDS = 12;

// Default pre-hashed demo accounts (Password: "password123")
// Pre-computed hash of "password123" with 12 salt rounds for instant startup
const DEFAULT_DEMO_HASH = bcrypt.hashSync("password123", BCRYPT_SALT_ROUNDS);

const SEED_USERS: AuthUser[] = [
  {
    id: "usr_owner_1",
    name: "Alexander Sterling",
    email: "alexander@relayoperations.com",
    passwordHash: DEFAULT_DEMO_HASH,
    role: "owner",
    departmentIds: ["dept_general", "dept_ortho", "dept_emergency", "dept_billing", "dept_pr_media"],
    avatarColor: "#1B9A9C",
    title: "Operations Director & Managing Partner",
    allowedPaths: [
      "/dashboard",
      "/batch",
      "/analytics",
      "/integrations",
      "/calls",
      "/campaigns",
      "/fleet",
      "/iam",
      "/billing",
      "/settings",
      "/diagnostics"
    ],
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "usr_admin_services",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@relayoperations.com",
    passwordHash: DEFAULT_DEMO_HASH,
    role: "dept_admin",
    departmentIds: ["dept_general"],
    avatarColor: "#0B1930",
    title: "Head of Client Services & Consultation",
    allowedPaths: ["/dashboard", "/calls", "/campaigns", "/batch", "/analytics", "/fleet", "/settings"],
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "usr_media_pr",
    name: "Amanda Cruz",
    email: "amanda@relayoperations.com",
    passwordHash: DEFAULT_DEMO_HASH,
    role: "media_pr",
    departmentIds: ["dept_pr_media"],
    avatarColor: "#16A34A",
    title: "Client Growth & Outreach Lead",
    allowedPaths: ["/dashboard", "/batch", "/campaigns", "/analytics", "/calls"],
    createdAt: "2026-01-03T00:00:00.000Z"
  },
  {
    id: "usr_frontdesk_1",
    name: "Alex Rivera",
    email: "alex@relayoperations.com",
    passwordHash: DEFAULT_DEMO_HASH,
    role: "operator",
    departmentIds: ["dept_general", "dept_ortho"],
    avatarColor: "#F59E0B",
    title: "Front Desk & Triage Coordinator",
    allowedPaths: ["/dashboard", "/calls"],
    createdAt: "2026-01-04T00:00:00.000Z"
  }
];

// In-Memory Persistent User Map for dynamic user registrations
const globalForUsers = globalThis as unknown as { authUsers: Map<string, AuthUser> };
const userStore = globalForUsers.authUsers || new Map<string, AuthUser>();
if (process.env.NODE_ENV !== "production") {
  globalForUsers.authUsers = userStore;
}

// Seed on startup if empty
if (userStore.size === 0) {
  SEED_USERS.forEach((u) => {
    userStore.set(u.email.toLowerCase(), u);
  });
}

/**
 * Returns all active users
 */
export function getAllUsers(): AuthUser[] {
  return Array.from(userStore.values());
}

/**
 * Find user by ID or Email
 */
export function findUser(idOrEmail: string): AuthUser | null {
  const query = idOrEmail.toLowerCase().trim();
  const users = Array.from(userStore.values());
  for (const user of users) {
    if (user.id.toLowerCase() === query || user.email.toLowerCase() === query) {
      return user;
    }
  }
  return null;
}

/**
 * Register a new user with secure Bcrypt password hashing
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  departmentIds?: string[];
  title?: string;
}): Promise<{ user: AuthUser | null; error?: string }> {
  const email = data.email.toLowerCase().trim();
  if (userStore.has(email)) {
    return { user: null, error: "An account with this email address already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
  const role: UserRole = data.role || "operator";
  const defaultPaths: Record<UserRole, string[]> = {
    owner: [
      "/dashboard",
      "/batch",
      "/analytics",
      "/integrations",
      "/calls",
      "/campaigns",
      "/fleet",
      "/iam",
      "/billing",
      "/settings",
      "/diagnostics"
    ],
    dept_admin: ["/dashboard", "/calls", "/campaigns", "/batch", "/analytics", "/fleet", "/settings"],
    media_pr: ["/dashboard", "/batch", "/campaigns", "/analytics", "/calls"],
    operator: ["/dashboard", "/calls"]
  };

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email,
    passwordHash,
    role,
    departmentIds: data.departmentIds || ["dept_general"],
    avatarColor: "#1B9A9C",
    title: data.title || (role === "owner" ? "Managing Director" : "Voice Operations Coordinator"),
    allowedPaths: defaultPaths[role] || ["/dashboard", "/calls"],
    createdAt: new Date().toISOString()
  };

  userStore.set(email, newUser);
  return { user: newUser };
}

/**
 * Validate credentials using constant-time bcrypt compare
 */
export async function validateCredentials(
  email: string,
  plainTextPassword: string
): Promise<AuthUser | null> {
  const user = findUser(email);
  if (!user) return null;

  const matches = await bcrypt.compare(plainTextPassword, user.passwordHash);
  if (!matches) return null;

  return user;
}

/**
 * Retrieve current user from cookies (verifying Access Token or Refresh Token)
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();

    // 1. Check Access Token (15 min)
    const accessCookie = cookieStore.get(ACCESS_TOKEN_COOKIE);
    if (accessCookie?.value) {
      const decoded = verifyAccessToken(accessCookie.value);
      if (decoded) {
        const found = findUser(decoded.userId) || findUser(decoded.email);
        if (found) return found;
      }
    }

    // 2. Check Refresh Token (7 days)
    const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE);
    if (refreshCookie?.value) {
      const decodedRefresh = verifyRefreshToken(refreshCookie.value);
      if (decodedRefresh) {
        const found = findUser(decodedRefresh.userId) || findUser(decodedRefresh.email);
        if (found) return found;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Issue Dual JWT Tokens (Access 15m + Refresh 7d)
 */
export function issueAuthTokens(user: AuthUser): {
  accessToken: string;
  refreshToken: string;
  payload: JwtUserPayload;
} {
  const payload: JwtUserPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken, payload };
}

/**
 * Set Secure HttpOnly Cookies for Access & Refresh Tokens
 */
export async function setAuthCookies(
  user: AuthUser
): Promise<{ accessToken: string; refreshToken: string }> {
  const cookieStore = await cookies();
  const { accessToken, refreshToken } = issueAuthTokens(user);

  const isProd = process.env.NODE_ENV === "production";

  // Access Token: 15 minutes (900 seconds)
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 // 15 minutes
  });

  // Refresh Token: 7 days (604800 seconds)
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return { accessToken, refreshToken };
}

/**
 * Clear All Authentication Cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE);
  if (refreshCookie?.value) {
    revokeRefreshToken(refreshCookie.value);
  }

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  // Also clean up legacy cookie names if present
  cookieStore.delete("relay_jwt_token");
  cookieStore.delete("relay_auth_session");
}

export function isPathAuthorized(user: AuthUser, path: string): boolean {
  if (user.role === "owner") return true;
  return user.allowedPaths.some((p) => path === p || path.startsWith(`${p}/`));
}

// Backward compatibility export for legacy callers
export const USERS = Array.from(userStore.values());
