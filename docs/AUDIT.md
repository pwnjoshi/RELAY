# RELAY Codebase Inventory & Current-State Audit

**Audit Date**: August 28, 2026  
**Auditor**: Antigravity Automated Verification Agent  
**Scope**: Full repository analysis (App Routes, API Endpoints, Libraries, UI Components, Persistence, Third-Party Claims, RBAC & Auth).

---

## 1. Route-by-Route Inventory (`app/` and `app/api/`)

| Route | Method | Purpose | Auth Required? | Real vs Mock Status | Implementation Details & Vendor Calls |
|---|---|---|---|---|---|
| `app/page.tsx` | UI | Public Landing Page | No | **Real UI / Hybrid** | Fetches `/api/auth/session` to conditionally show user state; interactive live demo triggers `/api/trigger-overflow`. |
| `app/about/page.tsx` | UI | Company & Platform Overview | No | **Static UI** | Renders company vision, SLA metrics, and architecture principles. |
| `app/solutions/page.tsx` | UI | Industry Solutions Showcase | No | **Static UI** | Interactive tabs for 8 industries with sample voice transcripts. |
| `app/how-it-works/page.tsx` | UI | 7-Stage Voice Pipeline Interactive Explorer | No | **Static UI** | Interactive walkthrough of SIP signal detection, STT, and booking. |
| `app/security/page.tsx` | UI | Security & Compliance Guarantees | No | **Static UI** | Documents encryption, role-based controls, and data protection policies. |
| `app/pricing/page.tsx` | UI | Plans, Minutes & ROI Calculator | No | **Static UI** | Interactive monthly/annual billing and ROI calculations. |
| `app/login/page.tsx` | UI | User Authentication Screen | No | **Real UI** | Submits credentials to `POST /api/auth/login`, manages JWT cookies and local state. |
| `app/dashboard/page.tsx` | UI | Main Operations Console | Yes (`AuthGuard`) | **Real Frontend** | Polls `/api/call-results`, `/api/call-results/stats`, `/api/locations`, `/api/iam` every 8s. |
| `app/calls/page.tsx` | UI | Call Audit Stream & Recording Drawer | Yes (`AuthGuard`) | **Real Frontend** | Fetches live calls from `/api/call-results`; includes 1-click export to `/api/export`. |
| `app/fleet/page.tsx` | UI | Branch Telephony Fleet Manager | Yes (`AuthGuard`) | **Real Frontend** | Manages branch PBX trunks, Grounded RAG knowledge editor via `BranchKnowledgeModal`. |
| `app/batch/page.tsx` | UI | Excel Batch Campaign Dialer | Yes (`AuthGuard`) | **Real Frontend** | Parses `.xlsx`/`.csv` spreadsheets and executes calls via `/api/batch/execute`. |
| `app/campaigns/page.tsx` | UI | Client Outreach Studio | Yes (`AuthGuard`) | **Real Frontend** | Manages outbound campaigns, recall rosters, and schedule cadences. |
| `app/analytics/page.tsx` | UI | Voice Analytics & Latency Graphs | Yes (`AuthGuard`) | **Real UI / In-Memory Data** | Visualizes conversion efficiency, language distributions, and hourly loads. |
| `app/integrations/page.tsx` | UI | Integrations Hub | Yes (`AuthGuard`) | **Real UI / Hybrid Mock** | Interactive Google Calendar OAuth modal, webhook toggle, and EHR status cards. |
| `app/iam/page.tsx` | UI | RBAC & Department Management | Yes (`AuthGuard`) | **Real Frontend** | Interacts with `/api/iam` to add team members, assign departments, and switch roles. |
| `app/billing/page.tsx` | UI | Plan Upgrades & Invoicing | Yes (`AuthGuard`) | **Mock UI** | Client-side plan switching and quota usage display without live Stripe webhook. |
| `app/settings/page.tsx` | UI | PBX & Audio Voice Configuration | Yes (`AuthGuard`) | **Real Frontend** | Configures prompt persona tone, test numbers, and SIP trunks via `store.ts`. |
| `app/diagnostics/page.tsx` | UI | CALL-E API Gateway Health | Yes (`AuthGuard`) | **Real / Synthetic** | Tests network connectivity to `https://api.heycall-e.com/v1` and Nebius AI. |
| `app/docs/page.tsx` | UI | Interactive Developer Documentation | No | **Static UI** | Full API endpoint references, webhook payload schemas, and SDK examples. |
| `app/api/auth/login/route.ts` | POST | Authenticate user & issue JWT tokens | No (Public) | **Real** | Validates credentials against `SEED_USERS` with bcrypt (12 rounds) and sets `HttpOnly` JWT cookie. |
| `app/api/auth/logout/route.ts` | POST | Revoke session & clear cookies | No | **Real** | Adds JWT ID to revocation set and clears `relay_access_token` and `relay_refresh_token` cookies. |
| `app/api/auth/refresh/route.ts` | POST | Rotate access token via refresh token | No | **Real** | Verifies refresh JWT, issues new access token, and sets refreshed cookie. |
| `app/api/auth/register/route.ts` | POST | Register new team user | No (Public) | **Real** | Hashes password with bcrypt and registers user into authentication registry. |
| `app/api/auth/session/route.ts` | GET | Validate active JWT session | No | **Real** | Parses `relay_access_token` cookie and returns safe user profile or unauthenticated status. |
| `app/api/batch/route.ts` | GET/POST | Query or upload batch campaigns | Yes (`getSessionUser`) | **In-Memory Store** | Reads/writes campaigns to in-memory `RelayStore`. |
| `app/api/batch/execute/route.ts` | POST | Trigger parallel calls for batch list | Yes (`getSessionUser`) | **Real External API** | Iterates over batch items and calls `createDirectCall` on CALL-E REST API. |
| `app/api/calendar/route.ts` | GET/POST/DELETE | Free/Busy query, booking, cancellation | Partial | **Mock / In-Memory** | Generates algorithmic free/busy slots and stores bookings in in-memory map. (Upgraded in Phase 4). |
| `app/api/call-results/route.ts` | GET | List call logs | No | **In-Memory / JSON** | Returns calls from `RelayStore` (seeded from `data/sample-calls.json`). |
| `app/api/call-results/stats/route.ts` | GET | Compute aggregate dashboard stats | No | **In-Memory Computed** | Aggregates call counts, conversion rates, and recovered revenue from `RelayStore`. |
| `app/api/call-results/status/route.ts` | GET | Poll live call status from carrier | No | **Real External API** | Queries `GET https://api.heycall-e.com/v1/calls/{runId}` with `CALLE_API_KEY`. |
| `app/api/export/route.ts` | GET | Export calls as CSV or JSON | Yes (`getSessionUser`) | **Real File Generator** | Streams CSV or JSON payload generated directly from `RelayStore`. |
| `app/api/iam/route.ts` | GET/POST | Read/update current user and depts | Partial | **In-Memory Store** | Modifies in-memory `RelayStore` user and department state. |
| `app/api/knowledge/extract/route.ts` | POST | Ingest public URL into grounded RAG | Yes (`getSessionUser`) | **Real External AI** | Fetches HTML and uses Nebius Token Factory (`DeepSeek-V4-Flash-0731`) to extract structured FAQs. |
| `app/api/locations/route.ts` | GET/POST | Query or update branch nodes | No | **Local JSON File** | Reads and persists branch locations directly to `data/locations.json`. |
| `app/api/trigger-overflow/route.ts` | POST | Dispatch inbound overflow voice call | No (Rate limited) | **Real External API** | Dispatches live call to `POST https://api.heycall-e.com/v1/calls` with RAG prompt. |
| `app/api/trigger-recall/route.ts` | POST | Dispatch outbound patient recall call | No (Rate limited) | **Real External API** | Dispatches recall call to `POST https://api.heycall-e.com/v1/calls` with recall context. |
| `app/api/webhooks/call-e/route.ts` | POST | Ingest post-call webhook from carrier | No (Public webhook) | **Real External Sync** | Receives structured outcome, runs Nebius AI post-call intelligence, and syncs to Supabase. |

---

## 2. Library Inventory (`lib/`)

| [`lib/auth.ts`](../lib/auth.ts) | User session management, bcrypt hashing, cookie reading | `bcryptjs`, `next/headers` | **Real**: Full 12-round bcrypt hash verification and cookie lifecycle. |
| [`lib/jwt.ts`](../lib/jwt.ts) | Cryptographic HS256 JWT signature and verification | `crypto` (Node.js built-in) | **Real**: Dual-token architecture with in-memory revocation blocklist. |
| [`lib/calle-client.ts`](../lib/calle-client.ts) | REST client for CALL-E telephony API, prompt builders | `fetch` | **Real**: Live HTTP REST client connecting to `https://api.heycall-e.com/v1`. |
| [`lib/bedrock-ai.ts`](../lib/bedrock-ai.ts) | Amazon Bedrock Claude 3.5 Sonnet / Llama 3 engine | `@aws-sdk/client-bedrock-runtime` | **Real**: Enterprise foundation model reasoning with zero data retention. |
| [`lib/nebius-ai.ts`](../lib/nebius-ai.ts) | Client for Nebius DeepSeek-V4 neural reasoning | `fetch` | **Real**: Connects to `https://api.tokenfactory.us-central1.nebius.com/v1/`. |
| [`lib/ai-analyzer.ts`](../lib/ai-analyzer.ts) | Unified post-call intelligence dispatcher | Bedrock / Nebius / Demo | **Real**: Switches between AWS Bedrock, Nebius, and simulated demo mode. |
| [`lib/store.ts`](../lib/store.ts) | In-memory singleton store for calls, departments, campaigns | TypeScript Class | **Real / In-Memory**: Seeded from `data/sample-calls.json`. |
| [`lib/supabase.ts`](../lib/supabase.ts) | Supabase client and sync helpers | `@supabase/ssr`, `@supabase/supabase-js` | **Real**: Syncs call records and durable serverless rate limits to Supabase. |
| [`lib/rate-limiter.ts`](../lib/rate-limiter.ts) | Sliding-window IP and User rate limiting with Supabase | In-Memory + Supabase | **Real**: 3 calls/day demo, 8 calls/day authenticated, 15s cooldown. |
| [`lib/idempotency.ts`](../lib/idempotency.ts) | End-to-end multi-tier idempotency manager | In-Memory TTL + Supabase | **Real**: Deduplicates single calls and batch campaigns with 24h retention. |
| [`lib/calendar.ts`](../lib/calendar.ts) | Google Calendar OAuth, AES-256 tokens, Free/Busy | `googleapis`, `crypto` | **Real**: AES-256 multi-branch OAuth sync and Free/Busy masking. |
| [`lib/connectors.ts`](../lib/connectors.ts) | Generic CRM and webhook connector pipeline | TypeScript Interface | **Real**: Google Calendar, Slack webhooks, CRM JSON sync. |
| [`lib/logger.ts`](../lib/logger.ts) | Structured JSON logger with PII masking | TypeScript Module | **Real**: Replaces raw console logging with masked structured logs. |
| [`lib/types.ts`](../lib/types.ts) | TypeScript definitions & interfaces | None | **Real**: Strong type contracts across all layers. |
| [`lib/utils.ts`](../lib/utils.ts) | Formatting helpers (dates, currency, classes) | `clsx`, `tailwind-merge` | **Real**: Utility functions. |
| [`lib/console-context.tsx`](../lib/console-context.tsx) | React Context Provider for frontend console state | React | **Real**: Manages workspace switching and active language in browser memory. |

---

## 3. Component Inventory (`components/`)

| Component | UI & State Owned | Backend Action vs Local State |
|---|---|---|
| `components/Sidebar.tsx` | Nav links, active route highlight, department switcher | Updates `activeDeptId` in `ConsoleContext` and calls `POST /api/iam`. |
| `components/Header.tsx` | Page title, search bar input, refresh button, live indicator | Triggers parent `onRefresh` (fetches `/api/call-results`) and updates search filter state. |
| `components/PublicHeader.tsx` | Top navigation, theme toggle, dynamic auth button (`Sign In` vs `Go to Console`) | Fetches `/api/auth/session` on mount; navigates to `/login` or `/dashboard`. |
| `components/MetricsBar.tsx` | 4 KPI summary cards (Total Calls, Conversion %, Recovered Revenue, Speed) | Pure presentation from `stats` prop. |
| `components/CallTable.tsx` | Table roster of call records, filter pills, search filtering | Filter changes update parent state; clicking a row opens `CallDrawer`. |
| `components/CallDrawer.tsx` | Side slide-over drawer with transcript, audio player bar, and CRM tabs | Audio visualizer plays static MP3 preview or synthetic speech; renders structured facts. |
| `components/TriggerModal.tsx` | Interactive modal to initiate live phone calls | Submits `POST /api/trigger-overflow`, polls status every 500ms, and updates progress bar. |
| `components/BranchKnowledgeModal.tsx` | Modal editor for branch RAG FAQs, specialists, and pricing rules | Updates `locations.json` via `POST /api/locations` with new knowledge base text. |
| `components/ClinicFleetCard.tsx` | Compact widget showing top 4 active telephony nodes | Link navigates to `/fleet`. |
| `components/WebRAGKnowledgeCard.tsx` | Ingestion input to scrape knowledge from any URL | Submits `POST /api/knowledge/extract` with target URL to extract structured FAQs. |
| `components/SafetyBanner.tsx` | Guardrail status banner (HIPAA, Rate Limiting, Audit Logs) | Static presentation component. |
| `components/AuthGuard.tsx` | Client-side route protection wrapper | Checks `/api/auth/session` and redirects to `/login?redirect=...` if unauthenticated. |
| `components/ThemeToggle.tsx` | Light/dark mode toggle button | Modifies HTML `class="dark"` and stores preference in `localStorage`. |
| `components/RelayLogo.tsx` | Brand SVG logomark and wordmark | Pure presentation component. |
| `components/Icons.tsx` | Centralized Hugeicons and Lucide SVG icon collection | Pure presentation component. |

---

## 4. Data Persistence Layer Architecture

RELAY currently operates on a **dual-tier persistence architecture**:

```
                              ┌────────────────────────┐
                              │    Next.js Process     │
                              │       Memory Store     │
                              │     (lib/store.ts)     │
                              └───────────┬────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │   Local Disk Storage   │                      │  Supabase PostgreSQL   │
     │  data/sample-calls.json│                      │      (Cloud DB)        │
     │   data/locations.json  │                      │   lib/supabase.ts      │
     └────────────────────────┘                      └────────────────────────┘
```

1. **In-Memory Store (`lib/store.ts`)**:
   - Holds singleton `RelayStore` with arrays of `calls`, `departments`, `teamMembers`, `campaigns`, and `budget`.
   - **Limitation in Serverless Environments (AWS Amplify / Vercel)**: In serverless environments, each Lambda container instance maintains its own memory. When an instance is recycled or multiple containers handle traffic, memory state is not shared between instances.
2. **Local Disk Storage (`data/*.json`)**:
   - `data/locations.json`: Persists business branch locations and Grounded RAG knowledge bases.
   - `data/sample-calls.json`: Read on initial startup to seed default call records.
3. **Supabase Cloud PostgreSQL (`lib/supabase.ts`)**:
   - When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured, `syncCallToSupabase()` asynchronously upserts completed call records to the cloud `calls` table.

---

## 5. Third-Party Integration Audit (Claims vs Implementation)

| Integration Claimed | Source File & Line | Claimed Capability | Actual Implementation Status |
|---|---|---|---|
| **Google Calendar** | `app/integrations/page.tsx:12`, `README.md:120` | Real-time two-way slot availability & booking | **Mock in v1.0 $\rightarrow$ Real in Phase 4**: v1.0 used in-memory algorithms. Phase 4 implements genuine Google OAuth2 and Calendar REST API. |
| **CALL-E PSTN Gateway** | `lib/calle-client.ts:10`, `app/api/trigger-overflow/route.ts:117` | Real PSTN phone dialing, live STT/TTS | **Fully Real**: Live REST dispatch to `https://api.heycall-e.com/v1/calls` with dynamic E.164 phone numbers. |
| **Nebius AI / DeepSeek-V4** | `lib/nebius-ai.ts:8`, `app/api/webhooks/call-e/route.ts:40` | Post-call CRM intelligence & Web RAG extraction | **Fully Real**: Live token factory API calls to `DeepSeek-V4-Flash-0731`. |
| **Amazon Bedrock (Nova / Claude)** | `AWS_BUILDER_SHOWCASE_ARTICLE.md:105` | Post-call analysis on AWS | **Architectural Compatibility**: Code currently uses Nebius DeepSeek-V4; structured to allow Bedrock drop-in replacement. |
| **EHR / FHIR (Epic, Cerner)** | `app/docs/page.tsx:420`, `app/security/page.tsx:85` | HL7/FHIR health record synchronization | **UI Mockup Only**: Documentation references FHIR JSON structures, but no direct Epic/Cerner API client is wired. |
| **Salesforce & HubSpot CRM** | `app/integrations/page.tsx:35` | Automatic lead & contact creation | **UI Mockup in v1.0 $\rightarrow$ Real Connector in Phase 5**: Phase 5 provides an extensible connector pipeline. |
| **AthenaHealth EHR** | `app/integrations/page.tsx:42` | Patient schedule sync | **UI Mockup Only**: Status card in integrations tab with simulated sync state. |

---

## 6. Authentication & RBAC System Audit

1. **Authentication Engine (`lib/auth.ts` & `lib/jwt.ts`)**:
   - **Password Security**: Bcrypt with 12 salt rounds (`BCRYPT_SALT_ROUNDS = 12`).
   - **Token Management**: Dual-token architecture:
     - `relay_access_token`: Short-lived (15 minutes), signed with `JWT_SECRET` (HS256), stored in `HttpOnly`, `SameSite=Lax` cookie.
     - `relay_refresh_token`: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, revocable via in-memory JTI blocklist.
2. **Role-Based Access Control (RBAC)**:
   - User roles supported: `owner`, `admin`, `dept_admin`, `doctor`, `operator`, `auditor`.
   - Route permission matrix:
     - Public Routes: `/`, `/about`, `/solutions`, `/how-it-works`, `/security`, `/pricing`, `/login`, `/docs`.
     - Protected Console Routes: `/dashboard`, `/calls`, `/fleet`, `/batch`, `/campaigns`, `/analytics`, `/integrations`, `/iam`, `/billing`, `/settings`, `/diagnostics` enforced by `AuthGuard.tsx`.
   - **API Route-Level Enforcement**:
     - `POST /api/batch/execute`: Enforces `getSessionUser()` (Returns 401 if unauthenticated).
     - `GET /api/export`: Enforces `getSessionUser()` (Returns 401 if unauthenticated).
     - `POST /api/knowledge/extract`: Enforces `getSessionUser()` (Returns 401 if unauthenticated).
     - `POST /api/trigger-overflow`: Tiered rate limiting (3 calls/day for public guests, 8 calls/day for authenticated users).
