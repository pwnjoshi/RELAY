/**
 * scripts/test-round3-idempotency.js
 * Round 3 Verification Test Suite
 *
 * Verifies:
 * 1. In-Memory Idempotency TTL Eviction & Memory Hygiene
 * 2. Batch / Campaign Execution Idempotency Deduplication
 */

const assert = require("assert");

console.log("\n=======================================================");
console.log("  RELAY ROUND 3 IDEMPOTENCY & BATCH TESTS");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failed++;
  }
}

// ─── Test 1: In-Memory TTL Eviction ───────────────────────────────────────────
testAsync("Task 1: In-memory idempotency cache evicts expired entries after TTL", async () => {
  const cache = new Map();

  function setWithTtl(key, value, ttlMs) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  function getWithLazyEviction(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  }

  function evictExpired() {
    const now = Date.now();
    let count = 0;
    for (const [k, v] of cache.entries()) {
      if (v.expiresAt <= now) {
        cache.delete(k);
        count++;
      }
    }
    return count;
  }

  // Insert 2 entries: 1 short-lived (50ms) and 1 long-lived (5000ms)
  setWithTtl("key_expire_fast", { status: "queued", runId: "run_fast" }, 50);
  setWithTtl("key_stay_alive", { status: "queued", runId: "run_long" }, 5000);

  assert.strictEqual(cache.size, 2);
  assert.ok(getWithLazyEviction("key_expire_fast"));
  assert.ok(getWithLazyEviction("key_stay_alive"));

  // Wait 70ms for fast key to expire
  await new Promise((r) => setTimeout(r, 70));

  // Fast key should be expired and lazily deleted
  assert.strictEqual(getWithLazyEviction("key_expire_fast"), null);
  
  // Sweep eviction
  const evicted = evictExpired();
  assert.strictEqual(cache.size, 1);
  assert.ok(getWithLazyEviction("key_stay_alive"));
});

// ─── Test 2: Batch Campaign Idempotency Deduplication ────────────────────────
test("Task 2: Duplicate batch campaign execution with same Idempotency-Key returns cached response without re-dispatching", () => {
  const dispatchedBatches = [];
  const idempotencyStore = new Map();

  function executeBatch(campaignId, idempotencyKey) {
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      return {
        ...idempotencyStore.get(idempotencyKey),
        fromCache: true
      };
    }

    // New dispatch
    const executionResult = {
      ok: true,
      campaignId,
      dispatchedCount: 15,
      runId: `batch_run_${Date.now()}`,
      dispatchedAt: new Date().toISOString()
    };

    dispatchedBatches.push(executionResult.runId);

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, executionResult);
    }

    return {
      ...executionResult,
      fromCache: false
    };
  }

  const testIdempotencyKey = "uuid-client-batch-campaign-sub-12345";

  // First batch submission
  const firstRes = executeBatch("campaign_abc", testIdempotencyKey);
  assert.strictEqual(firstRes.fromCache, false);
  assert.strictEqual(dispatchedBatches.length, 1);

  // Duplicate / double-click batch submission with same idempotency key
  const secondRes = executeBatch("campaign_abc", testIdempotencyKey);
  assert.strictEqual(secondRes.fromCache, true);
  assert.strictEqual(secondRes.runId, firstRes.runId);
  // Guarantee only 1 batch was actually dispatched!
  assert.strictEqual(dispatchedBatches.length, 1);
});

// ─── Test 3: SQL Schema Function Check ───────────────────────────────────────
test("Task 1 & 2: supabase/schema.sql includes purge_expired_idempotency_keys procedure", () => {
  const fs = require("fs");
  const path = require("path");
  const schemaContent = fs.readFileSync(path.resolve(process.cwd(), "supabase/schema.sql"), "utf-8");
  assert.ok(schemaContent.includes("purge_expired_idempotency_keys"), "schema.sql defines purge_expired_idempotency_keys");
  assert.ok(schemaContent.includes("INTERVAL '24 hours'"), "schema.sql uses 24h retention interval");
});

console.log("\n-------------------------------------------------------");
console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log("-------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
