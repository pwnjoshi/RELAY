/**
 * lib/rate-limiter.ts
 * Production In-Memory Sliding Window Rate Limiter & Telephony Quota Engine
 * 
 * Enforces:
 * 1. Public Demo Calls (Unauthenticated): Max 3 calls per 24 hours per IP address.
 * 2. Authenticated Calls (Logged In): Max 8 calls per 24 hours per User / Account.
 * 3. Short Cooldown (15 seconds) between consecutive call dispatches to prevent race conditions.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check if an IP/key is allowed for authentication or generic API endpoints
   */
  public check(
    key: string,
    limit: number = 5,
    windowMs: number = 60 * 1000
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const resetTime = Math.ceil((oldest + windowMs - now) / 1000);
      return {
        success: false,
        limit,
        remaining: 0,
        resetTime: Math.max(1, resetTime)
      };
    }

    record.timestamps.push(now);
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - record.timestamps.length),
      resetTime: Math.ceil(windowMs / 1000)
    };
  }

  public reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    for (const [key, record] of Array.from(this.store.entries())) {
      record.timestamps = record.timestamps.filter((ts: number) => ts > oneHourAgo);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

interface TelephonyQuotaRecord {
  timestamps: number[];
}

import { getDbRateLimit, saveDbRateLimit } from "./supabase";

export interface RateLimitResult {
  success: boolean;
  dailyLimit: number;
  callsUsed: number;
  remainingDaily: number;
  resetTime: number;
  isLoggedIn: boolean;
  reason?: "cooldown" | "daily_limit";
  error?: string;
}

export class TelephonyQuotaRateLimiter {
  private store: Map<string, TelephonyQuotaRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 15 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Async durable quota check with Supabase persistence (for serverless environments)
   */
  public async checkAsync(
    key: string,
    isUserLoggedIn: boolean = false,
    cooldownSeconds: number = 15
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = isUserLoggedIn ? 8 : 3;

    // Load from memory or fallback to Supabase
    let record = this.store.get(key);
    if (!record) {
      const dbTimestamps = await getDbRateLimit(key);
      record = { timestamps: dbTimestamps || [] };
      this.store.set(key, record);
    }

    // Filter to calls within the last 24 hours
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    // 1. Check cooldown between calls
    if (cooldownSeconds > 0 && record.timestamps.length > 0) {
      const lastCall = record.timestamps[record.timestamps.length - 1];
      const timeSinceLast = (now - lastCall) / 1000;
      if (timeSinceLast < cooldownSeconds) {
        const waitSeconds = Math.ceil(cooldownSeconds - timeSinceLast);
        return {
          success: false,
          dailyLimit,
          callsUsed: record.timestamps.length,
          remainingDaily: Math.max(0, dailyLimit - record.timestamps.length),
          resetTime: waitSeconds,
          isLoggedIn: isUserLoggedIn,
          reason: "cooldown",
          error: `Please wait ${waitSeconds}s before dispatching another call.`
        };
      }
    }

    // 2. Check 24-hour daily quota
    if (record.timestamps.length >= dailyLimit) {
      const oldestCall = record.timestamps[0];
      const resetHours = Math.max(1, Math.ceil((oldestCall + ONE_DAY_MS - now) / (60 * 60 * 1000)));

      const errorMessage = isUserLoggedIn
        ? `Daily Account Quota Reached: You have reached the maximum of 8 calls per day for your account. Quota resets in ~${resetHours}h.`
        : `Daily Demo Quota Reached: Maximum 3 test calls per day reached for your IP. Sign in to your account to unlock up to 8 calls per day.`;

      return {
        success: false,
        dailyLimit,
        callsUsed: record.timestamps.length,
        remainingDaily: 0,
        resetTime: resetHours * 3600,
        isLoggedIn: isUserLoggedIn,
        reason: "daily_limit",
        error: errorMessage
      };
    }

    // Record this successful call in-memory and in Supabase
    record.timestamps.push(now);
    saveDbRateLimit(key, record.timestamps).catch(() => {});

    return {
      success: true,
      dailyLimit,
      callsUsed: record.timestamps.length,
      remainingDaily: Math.max(0, dailyLimit - record.timestamps.length),
      resetTime: Math.ceil(ONE_DAY_MS / 1000),
      isLoggedIn: isUserLoggedIn
    };
  }

  /**
   * Synchronous fallback check (also triggers async background sync)
   */
  public check(
    key: string,
    isUserLoggedIn: boolean = false,
    cooldownSeconds: number = 15
  ): RateLimitResult {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = isUserLoggedIn ? 8 : 3;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (cooldownSeconds > 0 && record.timestamps.length > 0) {
      const lastCall = record.timestamps[record.timestamps.length - 1];
      const timeSinceLast = (now - lastCall) / 1000;
      if (timeSinceLast < cooldownSeconds) {
        const waitSeconds = Math.ceil(cooldownSeconds - timeSinceLast);
        return {
          success: false,
          dailyLimit,
          callsUsed: record.timestamps.length,
          remainingDaily: Math.max(0, dailyLimit - record.timestamps.length),
          resetTime: waitSeconds,
          isLoggedIn: isUserLoggedIn,
          reason: "cooldown",
          error: `Please wait ${waitSeconds}s before dispatching another call.`
        };
      }
    }

    if (record.timestamps.length >= dailyLimit) {
      const oldestCall = record.timestamps[0];
      const resetHours = Math.max(1, Math.ceil((oldestCall + ONE_DAY_MS - now) / (60 * 60 * 1000)));
      const errorMessage = isUserLoggedIn
        ? `Daily Account Quota Reached: You have reached the maximum of 8 calls per day for your account. Quota resets in ~${resetHours}h.`
        : `Daily Demo Quota Reached: Maximum 3 test calls per day reached for your IP. Sign in to your account to unlock up to 8 calls per day.`;

      return {
        success: false,
        dailyLimit,
        callsUsed: record.timestamps.length,
        remainingDaily: 0,
        resetTime: resetHours * 3600,
        isLoggedIn: isUserLoggedIn,
        reason: "daily_limit",
        error: errorMessage
      };
    }

    record.timestamps.push(now);
    saveDbRateLimit(key, record.timestamps).catch(() => {});

    return {
      success: true,
      dailyLimit,
      callsUsed: record.timestamps.length,
      remainingDaily: Math.max(0, dailyLimit - record.timestamps.length),
      resetTime: Math.ceil(ONE_DAY_MS / 1000),
      isLoggedIn: isUserLoggedIn
    };
  }

  /**
   * Peek current quota usage without incrementing
   */
  public getQuota(key: string, isUserLoggedIn: boolean = false): {
    dailyLimit: number;
    callsUsed: number;
    remainingDaily: number;
    isLoggedIn: boolean;
  } {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = isUserLoggedIn ? 8 : 3;

    const record = this.store.get(key);
    const activeTimestamps = (record?.timestamps || []).filter((ts) => ts > windowStart);
    const callsUsed = activeTimestamps.length;

    return {
      dailyLimit,
      callsUsed,
      remainingDaily: Math.max(0, dailyLimit - callsUsed),
      isLoggedIn: isUserLoggedIn
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;
    for (const [key, record] of Array.from(this.store.entries())) {
      record.timestamps = record.timestamps.filter((ts) => ts > twoDaysAgo);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Global Singletons for Next.js hot-reloading
const globalForRateLimit = globalThis as unknown as {
  authRateLimiter: SlidingWindowRateLimiter;
  telephonyRateLimiter: TelephonyQuotaRateLimiter;
};

export const authRateLimiter =
  globalForRateLimit.authRateLimiter || new SlidingWindowRateLimiter();

export const telephonyRateLimiter =
  globalForRateLimit.telephonyRateLimiter || new TelephonyQuotaRateLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.authRateLimiter = authRateLimiter;
  globalForRateLimit.telephonyRateLimiter = telephonyRateLimiter;
}

/**
 * Extract client IP from Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
