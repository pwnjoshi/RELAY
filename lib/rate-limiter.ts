/**
 * lib/rate-limiter.ts
 * Production In-Memory Sliding Window Rate Limiter & Telephony Quota Engine
 * 
 * Enforces:
 * 1. Unified Telephony Quota: 2 calls per 24 hours per network IP / session (shared counter for logged and non-logged in users).
 * 2. Localhost Admin Exemption: In localhost / development environments, administrators have unlimited calls.
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
  isUnlimitedAdmin?: boolean;
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
    cooldownSeconds: number = 15,
    isUnlimitedAdmin: boolean = false
  ): Promise<RateLimitResult> {
    // Localhost admin exemption
    if (isUnlimitedAdmin) {
      return {
        success: true,
        dailyLimit: 999999,
        callsUsed: 0,
        remainingDaily: 999999,
        resetTime: 0,
        isLoggedIn: true,
        isUnlimitedAdmin: true
      };
    }

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = 2; // Unified 2 calls per day for both logged in and non-logged in users

    // Merge timestamps from in-memory cache and Supabase to guarantee serverless instance durability
    const dbTimestamps = await getDbRateLimit(key);
    let record = this.store.get(key);
    const combined = Array.from(
      new Set([...(record?.timestamps || []), ...(dbTimestamps || [])])
    ).sort((a, b) => a - b);
    record = { timestamps: combined };
    this.store.set(key, record);

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

    // 2. Check 24-hour daily quota (2 calls/day)
    if (record.timestamps.length >= dailyLimit) {
      const oldestCall = record.timestamps[0];
      const resetHours = Math.max(1, Math.ceil((oldestCall + ONE_DAY_MS - now) / (60 * 60 * 1000)));

      const errorMessage = `Daily Telephony Quota Reached: Maximum 2 calls per day limit reached for this network session. Quota resets in ~${resetHours}h.`;

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
    try {
      await saveDbRateLimit(key, record.timestamps);
    } catch {}

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
    cooldownSeconds: number = 15,
    isUnlimitedAdmin: boolean = false
  ): RateLimitResult {
    if (isUnlimitedAdmin) {
      return {
        success: true,
        dailyLimit: 999999,
        callsUsed: 0,
        remainingDaily: 999999,
        resetTime: 0,
        isLoggedIn: true,
        isUnlimitedAdmin: true
      };
    }

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = 2;

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
      const errorMessage = `Daily Telephony Quota Reached: Maximum 2 calls per day limit reached for this network session. Quota resets in ~${resetHours}h.`;

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
  public getQuota(
    key: string,
    isUserLoggedIn: boolean = false,
    isUnlimitedAdmin: boolean = false
  ): {
    dailyLimit: number;
    callsUsed: number;
    remainingDaily: number;
    isLoggedIn: boolean;
    isUnlimitedAdmin?: boolean;
  } {
    if (isUnlimitedAdmin) {
      return {
        dailyLimit: 999999,
        callsUsed: 0,
        remainingDaily: 999999,
        isLoggedIn: true,
        isUnlimitedAdmin: true
      };
    }

    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const windowStart = now - ONE_DAY_MS;
    const dailyLimit = 2;

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

  public reset(key: string): void {
    this.store.delete(key);
  }

  public async resetAsync(key: string): Promise<void> {
    this.store.delete(key);
    try {
      await saveDbRateLimit(key, []);
    } catch {}
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
 * Extract Client IP from Standard Proxy Headers
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1";
}
