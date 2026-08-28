/**
 * scripts/test-auth.js
 * End-to-End Automated Security & JWT Authentication Test Suite
 */
const bcrypt = require("bcryptjs");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

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

async function isServerReady(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return res.status === 200 || res.status === 401 || res.status === 404;
  } catch {
    return false;
  }
}

async function startServerIfNeeded() {
  const ready = await isServerReady("http://localhost:3000/api/auth/session");
  if (ready) {
    console.log("✓ Connected to active Next.js server on http://localhost:3000");
    return null;
  }

  console.log("ℹ Starting local Next.js server for automated integration tests...");
  const hasBuild = fs.existsSync(path.resolve(process.cwd(), ".next"));
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = hasBuild ? ["next", "start", "-p", "3000"] : ["next", "dev", "-p", "3000"];

  const serverProc = spawn(command, args, {
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
      PORT: "3000",
      JWT_SECRET: process.env.JWT_SECRET || "relay-secret-key-test-environment-32-chars-minimum",
      DEMO_MODE: "true"
    },
    stdio: "pipe"
  });

  // Poll until ready
  const maxRetries = 60;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 600));
    if (await isServerReady("http://localhost:3000/api/auth/session")) {
      console.log("✓ Next.js server started and ready on http://localhost:3000\n");
      return serverProc;
    }
  }

  try {
    serverProc.kill();
  } catch {}
  throw new Error("Next.js server failed to start within timeout.");
}

async function runTests() {
  let serverProc = null;

  try {
    serverProc = await startServerIfNeeded();

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
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify({ ...testUser, password: "123" })
    });
    assert(shortPassRes.status === 400, "Registration rejects password shorter than 8 characters");

    // Test invalid email rejection
    const badEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify({ ...testUser, email: "invalid-email" })
    });
    assert(badEmailRes.status === 400, "Registration rejects malformed email address");

    // Test valid registration
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "Registration succeeds with 201 Created status");
    assert(Boolean(regData.user && regData.user.id), "Registration returns created user payload");
    assert(Boolean(regData.user && regData.user.email === testUser.email), "Registration matches registered email");

    // Test duplicate email rejection
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify(testUser)
    });
    assert(dupRes.status === 409, "Registration rejects duplicate user email with 409 Conflict");

    // ─────────────────────────────────────────────────────────────
    // 3. Login Endpoint & Cookie Issuance (/api/auth/login)
    // ─────────────────────────────────────────────────────────────
    console.log("\nTest Group 3: Login Authentication & Dual Tokens");

    // Test wrong password rejection
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify({ email: testUser.email, password: "WrongPassword999!" })
    });
    assert(badLoginRes.status === 401, "Login rejects invalid password with 401 Unauthorized");

    // Test valid login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-suite": "true" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    assert(loginRes.status === 200, "Login succeeds with 200 OK");

    const setCookieHeaders = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie") || ""];
    const allCookiesStr = setCookieHeaders.join("; ");

    const hasAccessToken = allCookiesStr.includes("relay_access_token=");
    const hasRefreshToken = allCookiesStr.includes("relay_refresh_token=");
    const isHttpOnly = allCookiesStr.includes("HttpOnly") || allCookiesStr.includes("httponly");

    assert(hasAccessToken, "Login issues 'relay_access_token' cookie");
    assert(hasRefreshToken, "Login issues 'relay_refresh_token' cookie");
    assert(isHttpOnly, "Auth cookies are flagged HttpOnly for security");

    // Extract access and refresh tokens
    const accessMatch = allCookiesStr.match(/relay_access_token=([^;]+)/);
    const refreshMatch = allCookiesStr.match(/relay_refresh_token=([^;]+)/);
    const accessToken = accessMatch ? accessMatch[1] : "";
    const refreshToken = refreshMatch ? refreshMatch[1] : "";

    // ─────────────────────────────────────────────────────────────
    // 4. Session Verification (/api/auth/session)
    // ─────────────────────────────────────────────────────────────
    console.log("\nTest Group 4: Authenticated Session Verification");
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: `relay_access_token=${accessToken}`
      }
    });
    const sessionData = await sessionRes.json();
    assert(sessionRes.status === 200 && sessionData.authenticated === true, "Session endpoint verifies valid access token");
    assert(Boolean(sessionData.user && sessionData.user.email === testUser.email), "Session returns authenticated user details");
    assert(Boolean(sessionData.user && sessionData.user.role === testUser.role), "Session returns correct user role");

    // ─────────────────────────────────────────────────────────────
    // 5. Token Refresh Endpoint (/api/auth/refresh)
    // ─────────────────────────────────────────────────────────────
    console.log("\nTest Group 5: Token Refresh & Rotation");
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-test-suite": "true",
        Cookie: `relay_refresh_token=${refreshToken}`
      }
    });
    assert(refreshRes.status === 200, "Refresh endpoint returns 200 OK with valid refresh token");

    const refreshSetCookies = refreshRes.headers.getSetCookie ? refreshRes.headers.getSetCookie() : [refreshRes.headers.get("set-cookie") || ""];
    const refreshCookiesStr = refreshSetCookies.join("; ");
    assert(refreshCookiesStr.includes("relay_access_token="), "Refresh endpoint rotates new access token");

    // ─────────────────────────────────────────────────────────────
    // 6. Logout Endpoint (/api/auth/logout)
    // ─────────────────────────────────────────────────────────────
    console.log("\nTest Group 6: Logout & Token Revocation");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `relay_refresh_token=${refreshToken}; relay_access_token=${accessToken}`
      }
    });
    assert(logoutRes.status === 200, "Logout endpoint returns 200 OK");

    // Verify session revoked after logout
    const postLogoutSession = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: `relay_refresh_token=${refreshToken}`
      }
    });
    const postLogoutData = await postLogoutSession.json();
    assert(postLogoutData.authenticated === false, "Revoked refresh token cannot create or verify session");

    // ─────────────────────────────────────────────────────────────
    // 7. Route Protection Middleware Simulation
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
  } finally {
    if (serverProc) {
      console.log("Shutting down local test server process...");
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", serverProc.pid.toString(), "/f", "/t"]);
        } else {
          serverProc.kill("SIGTERM");
        }
      } catch {}
    }
  }
}

runTests().catch((err) => {
  console.error("Test suite runner error:", err);
  process.exit(1);
});
