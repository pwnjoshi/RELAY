/**
 * lib/idempotency.ts
 * Multi-Tiered Durable Idempotency Engine with TTL Cache Eviction
 *
 * Tier 1: In-Memory cache with sliding-window TTL eviction to prevent memory leaks.
 * Tier 2: Supabase PostgreSQL table `idempotency_keys` for cross-serverless instance persistence.
 */

import { getDbIdempotencyKey, saveDbIdempotencyKey } from "./supabase";
import { logger } from "./logger";

interface InMemoryCacheEntry {
  responseJson: Record<string, unknown>;
  statusCode: number;
  expiresAt: number; // Unix timestamp ms
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (aligned with 24h daily quota retention)
const inMemoryIdempotencyCache = new Map<string, InMemoryCacheEntry>();

/**
 * Lazy and periodic eviction of expired in-memory idempotency entries
 */
export function evictExpiredInMemoryEntries(): number {
  const now = Date.now();
  let evictedCount = 0;

  inMemoryIdempotencyCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) {
      inMemoryIdempotencyCache.delete(key);
      evictedCount++;
    }
  });

  return evictedCount;
}

// Global periodic cleanup timer (guarded to run once per process lifetime)
let cleanupIntervalStarted = false;
function ensureCleanupTimer() {
  if (cleanupIntervalStarted || typeof setInterval === "undefined") return;
  cleanupIntervalStarted = true;
  const timer = setInterval(() => {
    evictExpiredInMemoryEntries();
  }, 10 * 60 * 1000); // Sweep every 10 minutes
  if (timer.unref) timer.unref(); // Allow Node process to exit gracefully
}

ensureCleanupTimer();

/**
 * Check if a request with this Idempotency-Key has already been processed.
 */
export async function checkIdempotency(
  key?: string | null
): Promise<{ isCached: boolean; responseJson?: Record<string, unknown>; statusCode?: number }> {
  if (!key || typeof key !== "string" || !key.trim()) {
    return { isCached: false };
  }

  const cleanKey = key.trim();
  const now = Date.now();

  // 1. Check in-memory fast tier
  const memEntry = inMemoryIdempotencyCache.get(cleanKey);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      return {
        isCached: true,
        responseJson: memEntry.responseJson,
        statusCode: memEntry.statusCode
      };
    }
    // Expired in-memory entry -> delete
    inMemoryIdempotencyCache.delete(cleanKey);
  }

  // 2. Check durable Supabase tier
  try {
    const dbRecord = await getDbIdempotencyKey(cleanKey);
    if (dbRecord) {
      // Repopulate fast tier with fresh TTL
      inMemoryIdempotencyCache.set(cleanKey, {
        responseJson: dbRecord.response_json,
        statusCode: dbRecord.status_code || 200,
        expiresAt: now + DEFAULT_TTL_MS
      });

      return {
        isCached: true,
        responseJson: dbRecord.response_json,
        statusCode: dbRecord.status_code || 200
      };
    }
  } catch (err: unknown) {
    logger.warn("[Idempotency] Supabase cache lookup exception:", err);
  }

  return { isCached: false };
}

/**
 * Persist processed response under the given Idempotency-Key.
 */
export async function recordIdempotency(
  key: string | null | undefined,
  responseJson: Record<string, unknown>,
  statusCode = 200,
  ttlMs = DEFAULT_TTL_MS
): Promise<void> {
  if (!key || typeof key !== "string" || !key.trim()) return;

  const cleanKey = key.trim();
  const expiresAt = Date.now() + ttlMs;

  // 1. Set in-memory cache
  inMemoryIdempotencyCache.set(cleanKey, {
    responseJson,
    statusCode,
    expiresAt
  });

  // 2. Save to durable Supabase table
  try {
    await saveDbIdempotencyKey(cleanKey, responseJson, statusCode);
  } catch (err: unknown) {
    logger.warn("[Idempotency] Supabase cache save exception:", err);
  }
}

/**
 * Get current in-memory cache size (useful for diagnostics and unit tests)
 */
export function getInMemoryCacheSize(): number {
  return inMemoryIdempotencyCache.size;
}

/**
 * Clear in-memory cache (for unit testing)
 */
export function clearInMemoryCache(): void {
  inMemoryIdempotencyCache.clear();
}
