# RELAY Developer Documentation

Welcome to the **RELAY** codebase. This guide is written for engineers contributing to or deploying the platform.

---

## 1. Actual System Architecture & Data Flow

```
[Browser / Client Console]
         │
         │  1. HTTP POST (Cookie Session / E.164 Payload)
         ▼
[Next.js 16 App Router API Routes]
         │
         ├──► Auth & Quota: lib/auth.ts (JWT HS256) & lib/rate-limiter.ts (Sliding Window)
         │
         ├──► Telephony Gateway Hop:
         │    POST https://api.heycall-e.com/v1/calls (Auth: Bearer CALLE_API_KEY)
         │
         ├──► Post-Call Intelligence Hop:
         │    POST https://api.tokenfactory.us-central1.nebius.com/v1/ (Auth: Bearer NEBIUS_API_KEY)
         │
         ├──► Local Storage:
         │    lib/store.ts (In-Memory Singleton) & data/*.json (Disk)
         │
         └──► Optional Cloud Persistence:
              Supabase PostgreSQL (Auth: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
```

### Credential & Security Boundaries:
- **Client-Side (Browser)**: Only has access to public environment variables (`NEXT_PUBLIC_*`). Never receives `CALLE_API_KEY`, `NEBIUS_API_KEY`, or `JWT_SECRET`.
- **Next.js Server API Layer**: Securely accesses `process.env.CALLE_API_KEY` and `process.env.NEBIUS_API_KEY` to communicate with external vendors.
- **Session Tokens**: JWT stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies (`relay_access_token`).

---

## 2. Local Setup & Environment Variables

### Quickstart (3 Steps):
1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/pwnjoshi/RELAY.git
   cd RELAY
   npm install
   ```
2. **Configure environment**:
   Copy `.env.example` to `.env.local` and add your vendor API keys:
   ```bash
   cp .env.example .env.local
   ```
3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables Reference:

| Variable Name | Required? | What Breaks If Missing |
|---|---|---|
| `CALLE_API_KEY` | **Yes (for live calls)** | Dispatching live PSTN phone calls will throw an explicit error from `lib/calle-client.ts`. |
| `NEBIUS_API_KEY` | **Yes (for AI features)** | Web RAG URL scraping and post-call CRM fact extraction will throw an error from `lib/nebius-ai.ts`. |
| `JWT_SECRET` | **Yes (Production)** | Defaults to local fallback in development; required in production for signing session tokens. |
| `GOOGLE_CLIENT_ID` | Optional | Google Calendar OAuth will not be able to generate authorization redirect URLs. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google Calendar token exchange will fail during the OAuth callback phase. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Platform operates using local JSON store; cloud database sync is gracefully skipped. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Cloud database sync skipped if omitted. |

---

## 3. Directory-by-Directory Guide

- **`app/`**: Next.js 16 App Router pages and API routes. Public landing and marketing pages reside at root (`/`, `/about`, `/solutions`, `/pricing`, `/how-it-works`), while operational console views reside under protected routes (`/dashboard`, `/calls`, `/fleet`, `/batch`, `/campaigns`, `/analytics`, `/iam`). API endpoints under `app/api/` handle authentication, call dispatch, calendar booking, and carrier webhooks.
- **`components/`**: Reusable React UI components and layouts. Contains the console navigation shell (`Sidebar.tsx`, `Header.tsx`), data views (`CallTable.tsx`, `MetricsBar.tsx`, `CallDrawer.tsx`), modal workflows (`TriggerModal.tsx`, `BranchKnowledgeModal.tsx`), and the centralized icon registry (`Icons.tsx`).
- **`lib/`**: Core backend business logic and typed client abstractions. Houses the CALL-E REST client (`calle-client.ts`), Nebius AI reasoning wrapper (`nebius-ai.ts`), cryptographic JWT and authentication engine (`jwt.ts`, `auth.ts`), rate limiting engine (`rate-limiter.ts`), and memory/database stores (`store.ts`, `supabase.ts`).
- **`data/`**: Static seed files and local file persistence. Contains `data/locations.json` (enterprise branch locations and grounded RAG knowledge) and `data/sample-calls.json` (default seeded call history).
- **`supabase/`**: PostgreSQL migration scripts and database schemas. Defines the schema for the `calls`, `locations`, and `appointments` tables.
- **`scripts/`**: Automation and testing scripts for developer verification and continuous integration checks.

---

## 4. End-to-End Call Lifecycle

```
1. Operator clicks "Initiate Call" in Console or Inbound Webhook arrives
                             │
                             ▼
2. POST /api/trigger-overflow validates E.164 phone & checks rate limit
                             │
                             ▼
3. Non-blocking createDirectCall() sends payload to CALL-E REST API (<15ms)
                             │
                             ▼
4. PSTN Carrier initiates live SIP audio stream & connects destination handset
                             │
                             ▼
5. Real-time polling (/api/call-results/status) tracks: Queued → Ringing → In-Progress
                             │
                             ▼
6. Call completes → Webhook hits /api/webhooks/call-e
                             │
                             ├──► Nebius DeepSeek-V4 extracts structured CRM facts
                             ├──► Post-Call Pipeline triggers Connectors (Google Calendar, Slack, SMS)
                             └──► Record persisted to Store & Supabase PostgreSQL
```

### ⚠️ Serverless Reliability Caveat (Background Polling):
In local Node.js environments, `setInterval` polling loops survive in process memory. However, in serverless environments (AWS Lambda / Amplify), container execution freezes once the HTTP response finishes. Therefore, RELAY is architected to rely primarily on **inbound webhooks (`/api/webhooks/call-e`)** for durable state updates, using client-side polling only as an interactive frontend preview.

---

## 5. Deployment & Production Operations

### AWS Amplify Deployment (Gen 2 Web Compute):
The platform includes an automated `amplify.yml` build specification:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Manual Steps for Full Production Setup:
1. **Google Cloud Console**: Register OAuth 2.0 Client ID with Authorized Redirect URI: `https://<your-domain>/api/calendar/callback`.
2. **Supabase Setup**: Run the SQL migration in `supabase/migrations/20260826_init.sql` to initialize cloud tables.
3. **Amplify Environment Variables**: Add `CALLE_API_KEY`, `NEBIUS_API_KEY`, `JWT_SECRET` in Amplify Console $\rightarrow$ Environment Variables.

---

## 6. Known Implementation Gaps

For a detailed breakdown of claimed capabilities versus current implementation status, see [**`docs/GAPS.md`**](file:///c:/Users/joshi/Desktop/Call-E/docs/GAPS.md).
