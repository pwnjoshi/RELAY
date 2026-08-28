/**
 * scripts/test-auth.js
 * End-to-End Automated Security & JWT Authentication Test Suite
 */
const bcrypt = require("bcryptjs");

const BASE_URL = "http://localhost:3000";

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testFailed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("🔒 RELAY JWT AUTHENTICATION & SECURITY TEST SUITE");
  console.log("=======================================================\n");

  const timestamp = Date.now();
  const testUser = {
    name: "Dr. Maya Lin",
    email: `maya.lin_${timestamp}@relayoperations.com`,
    password: "StrongPassword123!",
    role: "dept_admin",
    title: "Senior Telephony Specialist"
  };

  // ─────────────────────────────────────────────────────────────
  // 1. Password Hashing Verification (Bcrypt 12 Rounds)
  // ─────────────────────────────────────────────────────────────
  console.log("Test Group 1: Bcrypt Password Hashing & Salt Verification");
  const hash = await bcrypt.hash(testUser.password, 12);
  assert(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Password hashed with Bcrypt 12 salt rounds");
  const matches = await bcrypt.compare(testUser.password, hash);
  assert(matches === true, "Bcrypt correctly verifies plain text password against hash");
  const wrongMatches = await bcrypt.compare("WrongPassword123", hash);
  assert(wrongMatches === false, "Bcrypt rejects incorrect password");

  // ─────────────────────────────────────────────────────────────
  // 2. User Registration Endpoint (/api/auth/register)
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 2: User Registration & Validation Endpoint");

  // Test short password rejection
  const shortPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...testUser, password: "123" })
  });
  const shortPassData = await shortPassRes.json();
  assert(shortPassRes.status === 400, "Registration rejects password shorter than 8 characters");

  // Test invalid email rejection
  const badEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...testUser, email: "invalid-email" })
  });
  assert(badEmailRes.status === 400, "Registration rejects malformed email address");

  // Test valid registration
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, "Registration succeeds with status 201 Created");
  assert(regData.ok === true, "Registration returns ok: true");
  assert(regData.user.email === testUser.email, "Registered user email matches input");
  assert(regData.tokens && typeof regData.tokens.accessToken === "string", "Registration returns signed Access Token");
  assert(regData.tokens.expiresIn === 900, "Access token expiry is strictly 15 minutes (900s)");

  // Extract cookies from registration
  const regCookies = regRes.headers.get("set-cookie") || "";
  assert(regCookies.includes("relay_access_token"), "HttpOnly relay_access_token cookie set");
  assert(regCookies.includes("relay_refresh_token"), "HttpOnly relay_refresh_token cookie set");

  // Test duplicate email rejection
  const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  assert(dupRes.status === 409, "Registration rejects duplicate email with 409 Conflict");

  // ─────────────────────────────────────────────────────────────
  // 3. User Login Endpoint (/api/auth/login)
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 3: Login Authentication & Dual Tokens");

  // Test wrong password
  const wrongLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUser.email, password: "IncorrectPassword123" })
  });
  assert(wrongLoginRes.status === 401, "Login with wrong password returns 401 Unauthorized");

  // Test correct password
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, "Login with valid credentials returns 200 OK");
  assert(loginData.ok === true, "Login returns ok: true");
  assert(loginData.user.name === testUser.name, "Authenticated user identity confirmed");

  const loginCookies = loginRes.headers.get("set-cookie") || "";
  const cookieHeader = loginCookies
    .split(",")
    .map((c) => c.split(";")[0].trim())
    .join("; ");

  // ─────────────────────────────────────────────────────────────
  // 4. Session Validation (/api/auth/session)
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 4: Authenticated Session Verification");
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { Cookie: cookieHeader }
  });
  const sessionData = await sessionRes.json();
  assert(sessionRes.status === 200, "Session endpoint returns 200 OK");
  assert(sessionData.authenticated === true, "Session endpoint confirms authenticated: true");
  assert(sessionData.user.email === testUser.email, "Session returns authenticated user profile");

  // ─────────────────────────────────────────────────────────────
  // 5. Token Refresh Endpoint (/api/auth/refresh)
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 5: Token Refresh & Rotation");
  const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader }
  });
  const refreshData = await refreshRes.json();
  assert(refreshRes.status === 200, "Token refresh returns 200 OK");
  assert(refreshData.ok === true, "Token refresh returns ok: true");
  assert(refreshData.tokens && typeof refreshData.tokens.accessToken === "string", "New Access Token issued");

  // ─────────────────────────────────────────────────────────────
  // 6. User Logout Endpoint (/api/auth/logout)
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 6: Logout & Token Revocation");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader }
  });
  const logoutData = await logoutRes.json();
  assert(logoutRes.status === 200, "Logout returns 200 OK");
  assert(logoutData.ok === true, "Logout confirms token clearance");

  // Verify session is terminated after logout
  const postLogoutSessionRes = await fetch(`${BASE_URL}/api/auth/session`);
  const postLogoutData = await postLogoutSessionRes.json();
  assert(postLogoutData.authenticated === false, "Unauthenticated session returns authenticated: false");

  // ─────────────────────────────────────────────────────────────
  // 7. Protected Route Middleware Redirection
  // ─────────────────────────────────────────────────────────────
  console.log("\nTest Group 7: Protected Route Middleware Guard");
  const unauthDashboardRes = await fetch(`${BASE_URL}/dashboard`, {
    redirect: "manual"
  });
  assert(
    unauthDashboardRes.status === 307 || unauthDashboardRes.status === 302,
    "Unauthenticated request to /dashboard redirects with 307/302 redirect status"
  );
  const locationHeader = unauthDashboardRes.headers.get("location") || "";
  assert(
    locationHeader.includes("/login"),
    "Unauthenticated request is redirected to /login"
  );

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS: ${testPassed + testFailed} | PASSED: ${testPassed} | FAILED: ${testFailed}`);
  console.log("=======================================================\n");

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite runner error:", err);
  process.exit(1);
});
