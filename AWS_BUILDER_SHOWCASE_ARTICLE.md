# Weekend Showcase Challenge: RELAY — Universal Autonomous AI Voice Operations Platform

**Tag:** `#application`

---

## 🌟 Vision & The Problem It Solves

Every day, businesses around the world lose millions in revenue due to missed customer phone calls. When a potential buyer calls a real estate broker to book a property tour, a client reaches out to an IT consultancy for architecture review, or an urgent driver calls an automotive service hub after hours, unanswered calls lead directly to lost deals. Traditional interactive voice response (IVR) phone trees (*"Press 1 for sales, Press 2 for support"*) frustrate callers, and hiring around-the-clock human phone staff is cost-prohibitive for most companies.

**RELAY** is an enterprise-grade autonomous voice operations platform engineered to solve this challenge for **any business, enterprise, or service provider worldwide**. 

RELAY connects physical telephone lines (PSTN), customer relationship management (CRM) systems, and grounded website knowledge bases to conversational AI voice agents. When an incoming call goes unanswered, RELAY initiates a sub-15ms automated callback, engages the caller in natural conversation across 7 global languages, answers questions factually using grounded branch FAQs, and books confirmed calendar appointments with zero human intervention.

---

## 🏗️ How I Built It: Process, Key Decisions & Challenges

Building an enterprise-ready telephony application requires solving three hard engineering challenges: **ultra-low voice latency**, **multilingual voice persona contracts**, and **preventing AI hallucinations**.

### 1. Sub-15ms Asynchronous Telephony Architecture
In traditional synchronous architectures, waiting for a carrier SIP trunk handshake blocks the server thread for 1.5 to 3 seconds. To achieve instant user responsiveness, I architected a non-blocking asynchronous dispatch pipeline in Next.js 16 App Router. When a call task is triggered, the `/api/trigger-overflow` endpoint performs E.164 phone number validation, maps regional carrier locales, dispatches the call payload to the CALL-E REST gateway (`https://api.heycall-e.com/v1`), and returns an HTTP 200 response in **under 15 milliseconds**. The frontend then establishes a 300ms hyper-speed status polling stream to track live handset events (`Queued` → `Ringing` → `In-Progress` → `Completed`) in real time.

### 2. Sweet Female Voice Persona & Strict Hindi Grammatical Agreement
One of the most challenging aspects of multilingual conversational voice agents is grammatical gender inflection. In languages like Hindi and Nepali, female voice agents must strictly use feminine verb agreements (*"मैं बात कर रही हूँ"*, *"मैं आपकी सहायता कर सकती हूँ"*) rather than default masculine verb forms (*"कर रहा हूँ"*). I designed a sweet, cheerful, and respectful voice persona prompt contract with explicit feminine grammatical constraints across all regional greetings.

### 3. Regional Carrier Auto-Mapping & Grounded RAG Knowledge
Different global PSTN carrier gateways enforce regional language restrictions. For instance, India (`+91`) destination numbers require licensed opening locales like `hi-IN` or `en-US`. I implemented automated region detection that transparently maps incoming requests to compliant carrier opening locales, completely preventing `422 unsupported_language` gateway rejections. Additionally, each business branch features an interactive Grounded RAG Knowledge Base editor that allows operators to customize on-call specialists, pricing rules, and official website FAQs, eliminating AI hallucinations during live calls.

---

## ☁️ AWS Services Used & Architecture Overview

RELAY is architected as an event-driven, 4-layer cloud system hosted on **AWS Amplify (Gen 2 Web Compute)**:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                             LAYER 1 — PSTN CARRIER NETWORK                 ║
║   Caller / Customer E.164 Handset (+91, +1, +44, +977...)                    ║
║   Regional PSTN Trunk (hi-IN | en-US | ta-IN | es-US | fr-FR | de-DE | zh-CN)║
╚═══════════════════════════════╦════════════════════════════════════════════╝
                                ║  Live SIP / RTP Opus Audio Session
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

### Key AWS Components:
- **AWS Amplify (WEB_COMPUTE)**: Hosts the entire Next.js 16 application with full server-side rendering (SSR), dynamic API routes, and automated CI/CD builds directly from GitHub.
- **AWS IAM & CloudWatch**: Grants least-privilege logging permissions (`AmplifySSRLoggingRole`) for real-time observability over telephony webhook invocations and API error rates.
- **Amazon Bedrock (Nova / Claude)**: Configured for automated post-call intelligence, extracting structured caller intent, drafting personalized follow-up SMS messages, and generating quality coaching scores.

---

## 📚 What I Learned Across the Summer

This summer build journey reinforced three core software engineering principles:
1. **Telephony is an ultra-latency-sensitive domain**: In voice applications, every 100ms of delay degrades the illusion of human presence. Offloading heavy computation to asynchronous workers while providing instant UI optimistic updates is essential.
2. **Global voice AI requires linguistic cultural nuance**: Language models cannot be treated as one-size-fits-all translators. Tone, respectful pronouns (*"जी"*, *"ज्यू"*), and feminine grammatical agreement are critical for customer trust.
3. **AWS Amplify makes full-stack Next.js deployment effortless**: Being able to deploy Next.js 16 App Router apps with serverless SSR, environment variable isolation, and global CDN distribution in a single command dramatically shortens time-to-market.

---

## 🔗 Links & Community Credit

- **GitHub Repository**: [https://github.com/pwnjoshi/RELAY](https://github.com/pwnjoshi/RELAY)
- **Live AWS Amplify Deployment**: [https://main.d3jws7o9kudm1v.amplifyapp.com](https://main.d3jws7o9kudm1v.amplifyapp.com)

**Inspiration & Community Shoutout**:
Special thanks to **@benfowleraws** and **@lewissawe** for inspiring the community with the Summer Build Series and showing how autonomous agent workflows can be taken from experimental prototypes to production-grade cloud architectures!
