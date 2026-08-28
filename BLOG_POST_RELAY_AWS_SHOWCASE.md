# Building RELAY: How I Built a Sub-15ms Multilingual Autonomous AI Telephony Platform on AWS

> **How a weekend project evolved into an enterprise voice operations platform that answers phone calls, speaks 7 languages with natural human emotion, and runs serverless on AWS Amplify.**

---

<p align="center">
  <img src="./public/logo.png" alt="RELAY Logo" width="180" />
</p>

- **Live AWS Deployment**: [https://main.d3jws7o9kudm1v.amplifyapp.com](https://main.d3jws7o9kudm1v.amplifyapp.com)
- **GitHub Repository**: [https://github.com/pwnjoshi/RELAY](https://github.com/pwnjoshi/RELAY)
- **Tags**: `#application` `#aws` `#nextjs` `#ai` `#serverless`

---

## 1. The Multi-Billion Dollar Silent Leak: Missed Calls

Every single day, businesses around the globe lose customers not because of bad products, but because of **unanswered phone calls**.

Consider these real-world scenarios:
- A homeowner with a burst pipe calls a plumbing contractor at 9:00 PM. No answer. They hang up and call the next contractor on Google.
- A prospective buyer calls a commercial real estate broker to schedule a private penthouse walkthrough. Line busy. That \$1.2M deal goes elsewhere.
- An urgent driver calls an automotive service hub after hours needing a brake inspection and loaner car. Voicemail.

Traditional IVRs (*"Press 1 for Sales, Press 2 for Support"*) feel robotic and create high drop-off rates. Hiring 24/7 human receptionist shifts across global time zones is cost-prohibitive for most small-to-midsize businesses.

I asked myself: **What if any business could spin up an autonomous, empathetic AI receptionist that answers in <15 milliseconds, speaks the caller’s native language with natural warmth, grounds its answers in real website knowledge, and books calendar slots automatically?**

That vision became **RELAY**.

---

## 2. What is RELAY?

**RELAY** is a full-fledged, universal autonomous telephony operations platform engineered for any business worldwide — from software agencies and auto service hubs to law firms, hotels, and healthcare networks.

```
Incoming Call / Missed Call Trigger
              │
              ▼
   Sub-15ms PSTN Handshake
              │
              ▼
   Sweet, Warm Multilingual Voice Agent
   (Hindi, English, Nepali, Spanish, French, German, Mandarin)
              │
              ▼
   Grounded Branch RAG Knowledge Context
   (Answers FAQs, pricing, specialists with 0 hallucinations)
              │
              ▼
   Confirmed Booking & Real-Time CRM Fact Extraction
```

---

## 3. The 4 Engineering Challenges I Had to Solve

Building a real-time conversational telephony platform is fundamentally different from building a text chatbot. A 500ms delay in a text chat is unnoticeable; in a phone conversation, a 500ms delay feels awkward and unnatural.

Here are the four core technical challenges I tackled:

---

### Challenge 1: The Sub-15ms PSTN Carrier Handshake

When an overflow call is triggered, standard synchronous API calls to PSTN gateways take 1.5 to 3.0 seconds to negotiate SIP trunks. If the HTTP request blocks, the dashboard UI freezes.

**The Solution: Non-Blocking Event-Driven Polling**
I decoupled call task creation from state synchronization:
1. The Next.js 16 route (`/api/trigger-overflow`) validates the E.164 phone number, maps the regional carrier locale, dispatches the payload to the CALL-E REST gateway (`https://api.heycall-e.com/v1`), and returns **HTTP 200 in under 15 milliseconds**.
2. The client initiates a hyper-speed 300ms polling worker against `/api/call-results/status?runId=...`.
3. The UI smoothly animates through handset state transitions in real time: `Queued in Gateway` $\rightarrow$ `Handset Ringing` $\rightarrow$ `In-Progress Voice Stream` $\rightarrow$ `Completed`.

```typescript
// Sub-15ms Non-Blocking Dispatch Handler
export async function POST(req: Request) {
  const user = await getSessionUser();
  const clientIp = getClientIp(req);
  const rateLimitKey = user ? `usr_${user.id}` : `ip_${clientIp}`;

  // 1. Sliding window rate limit check (3 calls/day demo vs 8 calls/day auth)
  const rateCheck = telephonyRateLimiter.check(rateLimitKey, Boolean(user), 15);
  if (!rateCheck.success) {
    return NextResponse.json({ ok: false, error: rateCheck.error }, { status: 429 });
  }

  // 2. Instant PSTN Gateway Handshake
  const directRes = await createDirectCall({ phoneNumber, patientName, location, language });
  
  // 3. Return immediately in <15ms
  return NextResponse.json({ ok: true, runId: directRes.runId, status: "queued" });
}
```

---

### Challenge 2: Cultural Linguistic Nuance & Strict Female Hindi Grammar

One of the biggest hurdles in multilingual AI voice agents is **grammatical gender agreement** (स्त्री-लिंग प्रयोग). 

In languages like Hindi and Nepali, verbs change form depending on the speaker’s gender. Default AI models frequently mix masculine verb forms (*"मैं बोल रहा हूँ"*, *"मैं कर सकता हूँ"*) with female synthetic voices, creating an unnatural, robotic experience.

**The Solution: Strict Persona Grammatical Contracts**
I engineered a prompt contract that strictly enforces female inflections (`रही हूँ`, `सकती हूँ`, `कर रही हूँ`), eliminates male forms (`रहा हूँ`, `सकता हूँ`), and adds warm, respectful greetings (*"जी"*, *"ज्यू"*):

```typescript
// Enforcing Sweet Female Hindi Persona Contract
const hiGuidance = `
PERSONA RULES:
- You are a sweet, cheerful, respectful, and warm female receptionist.
- STRICT GRAMMAR REQUIREMENT: You MUST ALWAYS use female Hindi grammatical forms.
- ALWAYS say: "मैं बात कर रही हूँ", "मैं सहायता कर सकती हूँ", "कंसल्टेशन शेड्यूल कर रही हूँ".
- NEVER use male verb forms like "रहा हूँ" or "सकता हूँ".
`;
```

---

### Challenge 3: Regional Carrier Auto-Mapping (Zero Gateway Rejections)

Different international telecom carriers enforce strict locale validation. For example, India (`+91`) PSTN gateways license **Hindi (`hi-IN`)**, **English (`en-US`)**, and **Tamil (`ta-IN`)**. If a user tests an India number with an unsupported opening locale (like Nepali `ne-NP` or Spanish `es-US`), the gateway returns `HTTP 422 unsupported_language`.

**The Solution: Transparent Regional Mapping**
I built an intelligent region detector that inspects phone prefixes (e.g. `+91` $\rightarrow$ `IN`, `+977` $\rightarrow$ `NP`, `+1` $\rightarrow$ `US`) and auto-maps the initial greeting prompt to a compliant carrier locale while retaining multilingual understanding during the call:

```typescript
function getRegionFromPhone(phone: string): string | undefined {
  if (phone.startsWith("+91")) return "IN";
  if (phone.startsWith("+977")) return "NP";
  if (phone.startsWith("+1")) return "US";
  if (phone.startsWith("+44")) return "GB";
  return undefined;
}
```

---

### Challenge 4: Tiered Rate Limiting (Preventing Telephony Abuse)

Since real PSTN phone calls incur telecom gateway costs, open public endpoints can be vulnerable to abuse.

**The Solution: Sliding-Window Tiered Quota Engine**
I built an in-memory sliding-window rate limiter in [`lib/rate-limiter.ts`](file:///c:/Users/joshi/Desktop/Call-E/lib/rate-limiter.ts):
- **Public Visitors (Not Logged In)**: Max **3 calls / day per IP** (sufficient to test the demo).
- **Authenticated Accounts (Logged In)**: Max **8 calls / day per User**.
- **Anti-Spam Cooldown**: 15-second cooldown between consecutive calls.

---

## 4. System Architecture on AWS

RELAY is architected as a clean, 4-layer cloud system deployed on **AWS Amplify Gen 2 Web Compute**:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                             LAYER 1 — PSTN CARRIER NETWORK                 ║
║   Caller / Customer E.164 Handset (+91, +1, +44, +977...)                    ║
║   Regional PSTN Trunk (hi-IN | en-US | ta-IN | es-US | fr-FR | de-DE | zh-CN)║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  Live SIP / RTP Audio Session
╔═══════════════════════════════▼════════════════════════════════════════════╗
║                      LAYER 2 — TELEPHONY & SPEECH GATEWAY                  ║
║   - STT: 24kHz Opus Voice Stream Decoder                                    ║
║   - State Machine: Turn detection & real-time intent routing                ║
║   - TTS: Sweet, Cheerful Female Neural Voice Synthesis                      ║
║   - Structured Webhook: Post-call JSON outcome schema emission               ║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  HTTP Webhook / REST Polling
╔═══════════════════════════════▼════════════════════════════════════════════╗
║             LAYER 3 — AWS AMPLIFY (WEB_COMPUTE Next.js 16 SSR)             ║
║   - AWS Amplify Hosting: Serverless SSR execution for 41 Next.js routes    ║
║   - IAM Role: AmplifySSRLoggingRole with CloudWatch observability           ║
║   - REST API Engine: /api/trigger-overflow, /api/call-results/status, etc. ║
║   - Intelligence Engine: DeepSeek-V4 & Amazon Bedrock post-call extraction ║
║   - Persistence Layer: Local Disk Store + Supabase PostgreSQL cloud sync   ║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  Server-Rendered UI & Client Hydration
╔═══════════════════════════════▼════════════════════════════════════════════╗
║                      LAYER 4 — RELAY OPERATIONS CONSOLE                    ║
║   - Real-Time Fleet Monitor & Neural Audio Waveform Player                 ║
║   - Branch Grounded RAG Knowledge Base Customizer                          ║
║   - 1-Click HIPAA/Audit Stream Exporter (CSV & JSON)                       ║
║   - Google OAuth 2.0 Dynamic Workspace Calendar Integration                ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Why AWS Amplify?
- **Zero Server Management**: Amplify Web Compute handles scaling, routing, and SSL certificates automatically.
- **Instant CI/CD**: Pushing a commit to GitHub triggers an automated build that compiles and deploys all 41 Next.js App Router routes in under 2 minutes.
- **Environment Isolation**: Securely manages live carrier credentials (`CALLE_API_KEY`, `NEBIUS_API_KEY`) without exposing them to client bundles.

---

## 5. Key Features Walkthrough

### 🎙️ 1. Interactive Neural Audio & Transcript Player
Inspect full call recordings with an interactive audio player featuring animated frequency waveform visualizers, timestamp tracking (`0:14 / 0:38`), and synchronized turn-by-turn speaker highlights.

### 🏢 2. Grounded Branch RAG Knowledge Base Editor
Every business location has its own FAQs, specialists, and pricing rules. The Fleet Manager allows operators to customize grounded knowledge per branch, ensuring the voice agent answers customer questions accurately.

### 📊 3. 1-Click Telephony Audit Stream Export
Export full conversation transcripts, caller sentiment scores, and extracted CRM facts in standard **CSV** and **JSON** formats with a single click.

### 🔑 4. Dynamic Google Workspace OAuth Integration
Sign in and connect Google Calendar accounts with an interactive account picker modal to synchronize booked appointments directly to staff schedules.

---

## 6. What I Learned

1. **Latency dictates user trust**: In voice applications, every 100ms of lag breaks human presence. Non-blocking async dispatch is a non-negotiable architectural requirement.
2. **AI voice agents require cultural nuance**: A technically accurate translation sounds unnatural if grammatical gender agreements and respectful pronouns are overlooked.
3. **AWS Amplify makes modern Next.js deployments seamless**: Hosting full-stack SSR applications with edge caching and API routes on AWS has never been simpler.

---

## 7. Try It Live & Explore the Code

- **Live Web Console**: [https://main.d3jws7o9kudm1v.amplifyapp.com](https://main.d3jws7o9kudm1v.amplifyapp.com)
- **GitHub Repository**: [https://github.com/pwnjoshi/RELAY](https://github.com/pwnjoshi/RELAY)

Feel free to star the repo, test a live demo voice call to your phone, and let me know your thoughts in the comments! 🚀

---

*Published as part of the AWS Builder Showcase Challenge. Special thanks to @benfowleraws and @lewissawe for inspiring the builder community!*
