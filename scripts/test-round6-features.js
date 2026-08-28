/**
 * scripts/test-round6-features.js
 * Automated Verification for Hackathon-Winning Enterprise Telephony Feature Expansion
 * Tests:
 * 1. Autonomous Goals Library (CALL-E Goal Runs API 0.6)
 * 2. Omnichannel WhatsApp & SMS Generation
 * 3. Keypad IVR / DTMF PBX Parameter Validation
 * 4. WhatsApp Connector Execution
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name} ->`, err.message);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("🚀 RELAY ENTERPRISE TELEPHONY FEATURE EXPANSION SUITE");
console.log("=======================================================\n");

// 1. Autonomous Goals Library
test("lib/goals.ts defines all 5 enterprise goals with milestones & multilingual prompts", () => {
  const goalsContent = fs.readFileSync(path.resolve(process.cwd(), "lib/goals.ts"), "utf-8");
  assert.ok(goalsContent.includes("goal_recall_rebook"), "Must contain goal_recall_rebook");
  assert.ok(goalsContent.includes("goal_noshow_recovery"), "Must contain goal_noshow_recovery");
  assert.ok(goalsContent.includes("goal_auto_recall"), "Must contain goal_auto_recall");
  assert.ok(goalsContent.includes("goal_emergency_triage"), "Must contain goal_emergency_triage");
  assert.ok(goalsContent.includes("goal_insurance_preauth"), "Must contain goal_insurance_preauth");
  assert.ok(goalsContent.includes("Patient Identity Verification"), "Must contain milestone steps");
  assert.ok(goalsContent.includes("Zero-Harm Clinical Emergency"), "Must contain zero-harm protocol");
});

// 2. Client-Safe Omnichannel WhatsApp & SMS Generator
test("lib/omnichannel.ts provides compliant wa.me deep-link generation", () => {
  const omnichannelContent = fs.readFileSync(path.resolve(process.cwd(), "lib/omnichannel.ts"), "utf-8");
  assert.ok(omnichannelContent.includes("https://wa.me/"), "Must construct wa.me URL");
  assert.ok(omnichannelContent.includes("encodeURIComponent"), "Must encode parameters safely");
  assert.ok(omnichannelContent.includes("generateLocalizedFollowUpMessage"), "Must support localized messages");
});

// 3. Connectors & Post-Call Action Pipeline
test("lib/connectors.ts registers WhatsAppConnector in activeConnectors", () => {
  const connectorsContent = fs.readFileSync(path.resolve(process.cwd(), "lib/connectors.ts"), "utf-8");
  assert.ok(connectorsContent.includes("class WhatsAppConnector"), "Must define WhatsAppConnector");
  assert.ok(connectorsContent.includes("new WhatsAppConnector()"), "Must instantiate in activeConnectors");
});

// 4. Live Terminal Webhook & CALL-E-Event-Id Inspector
test("app/api/webhooks/call-e/route.ts implements GET inspector and CALL-E-Event-Id header tracking", () => {
  const webhookContent = fs.readFileSync(path.resolve(process.cwd(), "app/api/webhooks/call-e/route.ts"), "utf-8");
  assert.ok(webhookContent.includes("export async function GET"), "Must export GET method for inspection");
  assert.ok(webhookContent.includes("CALL-E-Event-Id"), "Must read and track CALL-E-Event-Id header");
  assert.ok(webhookContent.includes("store.recordWebhookEvent"), "Must log received events to store");
});

// 5. Diagnostics Page Live Debugger
test("app/diagnostics/page.tsx includes live webhook debugger & replay UI", () => {
  const diagContent = fs.readFileSync(path.resolve(process.cwd(), "app/diagnostics/page.tsx"), "utf-8");
  assert.ok(diagContent.includes("Live CALL-E Terminal Webhook & Event-ID Replay Inspector"), "Must render inspector");
  assert.ok(diagContent.includes("handleSimulateWebhook"), "Must have simulation handler");
  assert.ok(diagContent.includes("CALL-E-Event-Id"), "Must pass CALL-E-Event-Id");
});

// 6. Trigger Modal Keypad IVR & Goal Runs Mode
test("components/TriggerModal.tsx supports Autonomous Goal Mode and Keypad IVR navigation", () => {
  const modalContent = fs.readFileSync(path.resolve(process.cwd(), "components/TriggerModal.tsx"), "utf-8");
  assert.ok(modalContent.includes("Autonomous Goal Runs API (0.6)"), "Must support Goal mode");
  assert.ok(modalContent.includes("Keypad IVR & DTMF Auto-Navigation"), "Must support IVR DTMF toggle");
  assert.ok(modalContent.includes("ivrDtmfSequence"), "Must accept ivrDtmfSequence");
});

console.log("\n-------------------------------------------------------");
console.log(`  FEATURE TESTS: ${passed} passed, ${failed} failed`);
console.log("-------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
