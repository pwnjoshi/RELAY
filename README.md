# RELAY — Universal Autonomous Telephony & AI Voice Operations Platform

<p align="center">
  <img src="./public/logo.png" alt="RELAY Logo" width="150" />
</p>

<p align="center">
  <strong>Sub-15ms Async API Dispatch • Sub-Second Real-Time Neural Voice • Grounded Web RAG Engine • Amazon Bedrock Intelligence • Multi-Branch Google OAuth & CRM Sync</strong>
</p>

<p align="center">
  <a href="#key-features"><img src="https://img.shields.io/badge/Status-Production%20Ready-16A34A?style=for-the-badge&logo=vercel" alt="Status" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-16.3.3-000000?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Telephony-CALL--E%20REST-1B9A9C?style=for-the-badge" alt="CALL-E Telephony" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/AI%20Engine-Amazon%20Bedrock-FF9900?style=for-the-badge&logo=amazonaws" alt="Amazon Bedrock" /></a>
  <a href="#supported-industries"><img src="https://img.shields.io/badge/Industry-Universal%20Multi--Sector-0B1930?style=for-the-badge" alt="Universal Multi-Sector" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
</p>

---

## Overview

**RELAY** is an enterprise-grade autonomous voice operations platform engineered for **any business, enterprise, or service provider worldwide**. Whether operating real estate brokerages, software agencies, automotive service networks, law firms, hospitality groups, logistics operations, or healthcare facilities, RELAY eliminates missed customer calls, triages complex inquiries, and automates appointment scheduling 24/7 with zero human intervention.

By interconnecting low-latency PSTN telephony trunks (`https://api.heycall-e.com/v1`) with grounded website RAG knowledge bases and **Amazon Bedrock (Claude 3.5 Sonnet / Llama 3)** post-call neural intelligence (with Nebius DeepSeek Token Factory as a configurable alternate provider), RELAY places AI voice calls with sub-15ms API dispatch, triages customer intent, and enforces sweet, natural human voice personas across 7 global languages.

---

## Supported Industry Sectors

RELAY includes out-of-the-box preset nodes and customizable RAG prompt templates for every major industry around the globe:

| Industry Sector | Autonomous Use Cases | Key Capabilities |
|---|---|---|
| **Software & IT Services** | Technical consultation, project inquiry intake, architecture reviews | Web app consulting, cloud migration scheduling, lead qualification |
| **Real Estate & Leasing** | Walkthrough tour scheduling, property leasing availability, pre-screening | Private penthouse & townhome tour booking, tenant intake |
| **Automotive & Service** | Maintenance scheduling, inspection drop-offs, loaner fleet dispatch | Synthetic oil service, OEM recall triage, brake inspection |
| **Legal & Law Firms** | Client intake, consultation scheduling, conflict pre-screening | Managing partner consultation intake, case evaluation |
| **Hospitality & Hotels** | VIP concierge assistance, dining reservations, event booking | Michelin-starred dining booking, room upgrade assistance |
| **Logistics & Freight** | Manifest verification, cargo tracking updates, intermodal dispatch | Real-time transit updates, customs clearance triage |
| **Healthcare & Medical** | Routine recall, preventive consultation scheduling, acute triage | Appointment booking, provider callback escalation |
| **Finance & Insurance** | Claim reporting, policy consultation, advisor appointment scheduling | Zero-interest payment plan intake, claim triage |

---

## Key Platform Features

### 1. Sub-15ms Non-Blocking API Dispatch & Real-Time Status Stream
- **Instant Carrier Handshake**: HTTP POST requests dispatch call tasks in `<15ms`, running real-time status polling asynchronously in the background.
- **Sub-Second Voice Turn-Taking**: Live conversational speech operates with low-latency streaming (~400–600ms) over 24kHz Opus audio codecs.
- **Direct Carrier Status Stream**: Status transitions (`Queued` $\rightarrow$ `Ringing` $\rightarrow$ `In-Progress` $\rightarrow$ `Completed`) poll live PSTN handset state every 300ms.

### 2. Sweet, Respectful & Warm AI Voice Persona
- **Female Hindi Grammatical Agreement (स्त्री-लिंग प्रयोग)**: Strictly enforces natural female Hindi verb inflections (`रही हूँ`, `सकती हूँ`, `कर रही हूँ`) and eliminates unnatural male verb forms.
- **Warm & Professional Expressions**: Opens with courteous, cheerful greetings (*"नमस्ते Hardik जी! 😊 मैं Apex Group से बात कर रही हूँ..."*).

### 3. Amazon Bedrock & Neural Post-Call Intelligence
- **Amazon Bedrock (Primary)**: Uses `@aws-sdk/client-bedrock-runtime` with Claude 3.5 Sonnet / Llama 3 for HIPAA-ready, zero-retention transcript analysis and fact extraction.
- **Nebius DeepSeek-V4 (Configurable Alternate)**: Full token factory driver supported via `LLM_PROVIDER="nebius"`.

### 4. Grounded Branch RAG Knowledge Base Editor
- **Custom Branch Context**: Configure company FAQs, on-call specialists, offered service catalogs, and pricing rules per physical location node.
- **Factually Grounded Voice Prompting**: Prevents AI hallucinations by grounding responses directly in official company knowledge bases.

### 5. Multi-Branch Google Calendar OAuth & 2-Way Sync
- **Location-Scoped Persistence**: Each branch location independently owns its Google OAuth 2.0 refresh tokens, encrypted with AES-256 and persisted in Supabase PostgreSQL (`calendar_connections` table).
- **Free/Busy Privacy Masking**: Exposes open time slots while masking caller PII and private calendar titles.

### 6. Durable End-to-End Idempotency & TTL Cache
- **Multi-Tier Deduplication**: Client-side UUIDs passed via `Idempotency-Key` headers on single calls, recalls, and batch campaigns.
- **Sliding-Window TTL Eviction**: In-memory cache evicts entries after 24 hours to prevent memory leaks in long-running processes, backed by Supabase `idempotency_keys`.

---

## System Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                             LAYER 1 — PSTN CARRIER NETWORK                 ║
║                                                                              ║
║   Caller / Customer / Lead                                                   ║
║         │                                                                    ║
║   E.164 Phone Number (+91, +1, +44, +977...)                                 ║
║         │                                                                    ║
║         ▼                                                                    ║
║   Regional PSTN Trunk (hi-IN | en-US | ta-IN | es-US | ...)                 ║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  Live SIP / RTP Audio Session
╔═══════════════════════════════▼════════════════════════════════════════════╗
║                      LAYER 2 — CALL-E TELEPHONY ENGINE                     ║
║                                                                              ║
║   ┌────────────────────────┐       ┌──────────────────────────────────┐     ║
║   │  STT — Speech-to-Text  │──────►│  Conversation State Machine      │     ║
║   │  24kHz Opus Decoder    │       │  Turn detection & intent routing  │     ║
║   └────────────────────────┘       └────────────────┬─────────────────┘     ║
║                                                      │                       ║
║   ┌────────────────────────┐       ┌────────────────▼─────────────────┐     ║
║   │  TTS — Neural Voice    │◄──────│  AI Response Generator           │     ║
║   │  Female Sweet Persona  │       │  (RAG-grounded prompt injection) │     ║
║   └────────────────────────┘       └──────────────────────────────────┘     ║
║                                                                              ║
║   POST-CALL: Structured JSON Outcome Webhook → /api/webhooks/call-e          ║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  HTTP Webhook (JSON Outcome Schema)
╔═══════════════════════════════▼════════════════════════════════════════════╗
║                      LAYER 3 — RELAY APPLICATION CORE (Next.js)            ║
║                                                                              ║
║   ┌──────────────────────────────────────────────────────────────────────┐  ║
║   │  REST API Layer                                                      │  ║
║   │  POST /api/trigger-overflow   — Dispatch inbound overflow recall     │  ║
║   │  POST /api/trigger-recall     — Outbound patient/client recall       │  ║
║   │  POST /api/batch/execute      — Bulk campaign call execution         │  ║
║   │  GET  /api/call-results/status — Live carrier poll                   │  ║
║   │  GET  /api/export             — CSV / JSON compliance export         │  ║
║   │  POST /api/integrations/verify — Live external connection probe      │  ║
║   └───────────────────────────────┬──────────────────────────────────────┘  ║
║                                   │                                          ║
║   ┌───────────────────────────────▼──────────────────────────────────────┐  ║
║   │  Business Logic & Intelligence Layer                                 │  ║
║   │  ├── CALL-E REST Client        (lib/calle-client.ts)                │  ║
║   │  ├── Amazon Bedrock Intelligence (lib/bedrock-ai.ts)                 │  ║
║   │  ├── Nebius Token Factory      (lib/nebius-ai.ts)                    │  ║
║   │  ├── Multi-Branch Calendar     (lib/calendar.ts)                     │  ║
║   │  ├── Durable Idempotency Engine(lib/idempotency.ts)                  │  ║
║   │  ├── JWT Auth & Session        (lib/auth.ts / lib/jwt.ts)            │  ║
║   │  └── Rate Limiter Engine       (lib/rate-limiter.ts)                 │  ║
║   └───────────────────────────────┬──────────────────────────────────────┘  ║
║                                   │                                          ║
║   ┌───────────────────────────────▼──────────────────────────────────────┐  ║
║   │  Persistence Layer                                                   │  ║
║   │  ├── Relay In-Memory Store     (lib/store.ts)                        │  ║
║   │  └── Supabase PostgreSQL Cloud (lib/supabase.ts)                     │  ║
║   └──────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  Server-Side Props / Client API Fetch
╔═══════════════════════════════▼════════════════════════════════════════════╗
║                      LAYER 4 — RELAY OPERATIONS CONSOLE (Browser)          ║
║                                                                              ║
║   ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐    ║
║   │  Dashboard &     │  │  Call Drawer &   │  │  Multi-Branch Fleet   │    ║
║   │  Live Metrics    │  │  Audio Player    │  │  & RAG Editor         │    ║
║   └──────────────────┘  └──────────────────┘  └───────────────────────┘    ║
║                                                                              ║
║   ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐    ║
║   │  Batch Campaign  │  │  Telephony Audit │  │  Integrations &       │    ║
║   │  Dialer          │  │  Stream Export   │  │  Google OAuth         │    ║
║   └──────────────────┘  └──────────────────┘  └───────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Tech Stack

- **Framework**: Next.js 16.3.3 (Turbopack, App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS, Custom Glassmorphism Theme
- **Telephony API**: CALL-E Direct REST API (`https://api.heycall-e.com/v1`)
- **Primary AI Intelligence**: Amazon Bedrock Claude 3.5 Sonnet / Llama 3 (`@aws-sdk/client-bedrock-runtime`)
- **Alternate AI Intelligence**: Nebius DeepSeek-V4 Flash (`DeepSeek-V4-Flash-0731`)
- **Database**: Dual Persistence Architecture (Relay Store + Supabase Cloud PostgreSQL)
- **Authentication**: Bcrypt-12 with Dual-Token HS256 JWT & Secure HTTP-Only Cookies

---

## Quick Start Guide

### 1. Clone Repository
```bash
git clone https://github.com/pwnjoshi/RELAY.git
cd RELAY
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Configure your environment variables in `.env.local`:
```env
# Telephony & AI Engine
CALLE_API_KEY=iams_live_your_api_key_here
AWS_REGION=us-east-1
LLM_PROVIDER=bedrock

# JWT & Cryptographic Security (>= 32 chars required)
JWT_SECRET=your-32-char-secure-secret-key-entropy-here

# Supabase Cloud PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Verification Test Suite
```bash
npm test
```

### 6. Build for Production
```bash
npm run build
npm start
```

---

## License & Compliance

- **License**: [MIT License](LICENSE)
- **Data Isolation**: Temporal free/busy availability masking ensures caller PII and private notes are never exposed across tenants.
