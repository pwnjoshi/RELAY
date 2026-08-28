# ⚡ RELAY — Autonomous Telephony & Real-Time AI Voice Operations Platform

<p align="center">
  <img src="./public/logo.png" alt="RELAY Logo" width="160" />
</p>

<p align="center">
  <strong>Sub-15ms PSTN Interconnect • Multilingual Sweet AI Voice Agent • Grounded Web RAG Engine • Enterprise EHR/CRM Sync</strong>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Status-Production%20Ready-16A34A?style=for-the-badge&logo=vercel" alt="Status" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Next.js-16.3.3-000000?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Telephony-CALL--E%20REST-1B9A9C?style=for-the-badge" alt="CALL-E Telephony" /></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
</p>

---

## 📖 Overview

**RELAY** is an enterprise-grade autonomous voice operations platform designed to eliminate missed customer calls, triage complex inquiries, and automate appointment scheduling 24/7 across physical business branches.

By interconnecting real-time PSTN telephony trunks (`https://api.heycall-e.com/v1`) with grounded RAG knowledge bases and **DeepSeek-V4** post-call CRM intelligence, RELAY places hyper-fast AI voice calls, triages customer urgency, and enforces sweet, natural human voice personas across 7 global languages.

---

## ✨ Key Platform Features

### 1. ⚡ Sub-15ms Non-Blocking PSTN Call Dispatch
- **Instant Carrier Handshake**: HTTP POST requests dispatch call tasks in `<15ms`, running real-time status polling asynchronously in the background.
- **Direct Carrier Status Stream**: Status transitions (`Queued` $\rightarrow$ `Ringing` $\rightarrow$ `In-Progress` $\rightarrow$ `Completed`) poll live PSTN handset state every 300ms.

### 2. 🎀 Sweet, Cute & Respectful AI Voice Persona
- **Female Hindi Grammatical Agreement (स्त्री-लिंग प्रयोग)**: Strictly enforces natural female Hindi verb inflections (`रही हूँ`, `सकती हूँ`, `कर रही हूँ`) and eliminates unnatural male verb forms.
- **Warm & Joyful Expressions**: Opens with cute, cheerful greetings (*"नमस्ते Hardik जी! 😊 मैं Apex Health से बहुत प्यार से बोल रही हूँ..."*).

### 3. 🌐 Grounded Branch RAG Knowledge Base Editor
- **Custom Branch Context**: Configure practice FAQs, on-call lead specialists, offered specialties, and pricing catalogs per physical location node.
- **Factually Grounded Voice Prompting**: Prevents AI hallucinations by grounding responses directly in official company knowledge bases.

### 4. 🌍 Regional Carrier Compliance & Multilingual Adaptability
- **Supported Languages**: **हिन्दी (Hindi)**, **English (US/UK)**, **नेपाली (Nepali)**, **Español (Spanish)**, **Français (French)**, **Deutsch (German)**, and **中文 (Mandarin)**.
- **Auto-Region Mapping**: Automatically maps destination numbers (e.g. India `+91`) to supported carrier locales (`hi-IN` / `en-US`), ensuring `HTTP 201 Created` acceptance without carrier 422 errors.

### 5. 🎙️ Neural Audio Player & Turn-by-Turn Transcript Viewer
- **Audio Waveform Player**: Playback call audio tracks with interactive frequency visualizers, playback speed controls, and timestamp trackers.
- **Speaker Dialogue Breakdown**: Inspect turn-by-turn interactions between the AI Voice Agent and the caller with speaker badges and sentiment metrics.

### 6. 📊 1-Click Compliance Export & Google OAuth 2.0 Integration
- **Audit Export**: Export HIPAA-ready call logs, extracted EHR facts, and revenue recovery metrics in **CSV** or **JSON** formats with 1 click.
- **Google Workspace OAuth**: Sign in and switch Google Calendar & Workspace accounts dynamically from an interactive account picker modal.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │   PSTN Destination Phone    │
                                  └──────────────┬──────────────┘
                                                 │
                                       (Live Handset Ringing)
                                                 │
                                                 ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│  DeepSeek-V4 / Nebius AI    │           │  CALL-E Telephony Gateway   │
│  - Post-Call Intelligence   │◄─────────►│  - Real-Time STT + TTS Voice│
│  - CRM Fact Extraction      │           │  - 24kHz Opus Voice Stream  │
└──────────────┬──────────────┘           └──────────────┬──────────────┘
               │                                         │
               │ (Extracted Facts & Analytics)           │ (Live Status & Summary)
               ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    RELAY Operations Platform                          │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Multi-Clinic Fleet    │  │ REST APIs (/api/trigger-overflow)    │  │
│  │ Telephony Audit Stream│  │ Grounded Branch RAG Engine           │  │
│  │ Neural Audio Player   │  │ Sliding Window Rate Limiter          │  │
│  └───────────────────────┘  └──────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.3.3 (Turbopack, App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS, Custom Glassmorphism Theme
- **Telephony API**: CALL-E Direct REST API (`https://api.heycall-e.com/v1`)
- **AI Intelligence**: DeepSeek-V4-Flash-0731 on Nebius Token Factory
- **Database**: Dual Persistence Architecture (Local Disk Store + Supabase Cloud PostgreSQL)
- **State Management**: In-Memory Thread-Safe Store (`SwitchboardStore`)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

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
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# CALL-E Telephony API Key
CALLE_API_KEY=iams_live_your_api_key_here

# Optional Supabase Cloud PostgreSQL Sync
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 Key REST API Endpoints

### 1. Dispatch Overflow Voice Call
```http
POST /api/trigger-overflow
Content-Type: application/json

{
  "phoneNumber": "+917201921920",
  "patientName": "Hardik Bandhiya",
  "language": "hi",
  "locationId": "loc_downtown",
  "extraContext": "Customer requested urgent software consultation appointment."
}
```

**Response (`200 OK`)**:
```json
{
  "ok": true,
  "message": "Call dispatched on regional carrier gateway",
  "callId": "call_1787764666579",
  "runId": "call_bQ41dU2925qUEVYcBWHePA",
  "status": "queued",
  "location": "Apex Health - Downtown Metro"
}
```

### 2. Query Live Carrier Call Status
```http
GET /api/call-results/status?runId=call_bQ41dU2925qUEVYcBWHePA
```

**Response (`200 OK`)**:
```json
{
  "ok": true,
  "runId": "call_bQ41dU2925qUEVYcBWHePA",
  "status": "completed",
  "summary": "Caller confirmed appointment slot for tomorrow at 10:00 AM.",
  "completedAt": "2026-08-28T08:44:00Z"
}
```

### 3. Export Telephony Audit Stream (CSV / JSON)
```http
GET /api/export?format=csv
GET /api/export?format=json
```

---

## 📄 License & Compliance

- **License**: [MIT License](LICENSE)
- **HIPAA & Data Privacy**: Fail-closed data isolation. Temporal free/busy availability masking ensures caller PII and private notes are never exposed across tenants.
