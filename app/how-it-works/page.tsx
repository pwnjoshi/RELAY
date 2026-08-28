"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      num: "01",
      name: "INBOUND & OUTBOUND TRIGGER",
      title: "Telephony Signal Detection",
      desc: "Relay listens on your existing business PBX or triggers an automated outbound follow-up campaign from an uploaded client spreadsheet.",
      detail: "Supports SIP trunk bridging with Twilio, Telnyx, Asterisk, and FreePBX. Inbound calls are intercepted when front-desk lines ring past threshold.",
      badge: "INSTANT DETECTION",
      code: `// Webhook Payload on Ring\n{\n  "event": "call.initiated",\n  "caller_id": "+91 98100 12345",\n  "branch_id": "loc_downtown",\n  "timestamp": "2026-08-26T14:40:00Z"\n}`
    },
    {
      num: "02",
      name: "ZERO-LATENCY INTERCEPT",
      title: "SIP Trunk Audio Bridge",
      desc: "Instantly, Relay answers with full duplex 24kHz Opus audio stream, preventing callers from hanging up or leaving voicemail.",
      detail: "Eliminates frustrating hold queues and robotic IVR phone trees ('Press 1 for Sales'). Callers speak naturally from the first second.",
      badge: "ZERO HOLD TIME",
      code: `// Audio Stream Connection\n{\n  "codec": "OPUS_24KHZ",\n  "latency_ms": 13.8,\n  "carrier": "Direct SIP Interconnect",\n  "jitter_buffer": "adaptive_low_delay"\n}`
    },
    {
      num: "03",
      name: "MULTILINGUAL STT & INTENT",
      title: "Native Speech Understanding",
      desc: "Real-time streaming speech-to-text transcribes conversational nuance in Hindi, Nepali, Spanish, and English with 99.4% accuracy.",
      detail: "Understands colloquial speech, mixed accents (Hinglish, code-switching), background noise, and caller emotion with sub-600ms latency.",
      badge: "7 WORLD LOCALES",
      code: `// Real-Time Speech Extraction\n{\n  "detected_language": "hi-IN",\n  "intent": "reschedule_consultation",\n  "urgency_score": 0.15,\n  "confidence": 0.994\n}`
    },
    {
      num: "04",
      name: "PRIVACY & CALENDAR LOOKUP",
      title: "Zero-Leakage Availability Engine",
      desc: "Relay queries connected Google Calendars and practice databases using strict Free/Busy masking without exposing any private meeting titles.",
      detail: "Calculates open slots with 15-minute buffers and operating hours restrictions. Private calendar data remains completely invisible to callers.",
      badge: "ZERO-LEAKAGE PRIVACY",
      code: `// Safe Calendar Verification\n{\n  "status": "BUSY", // Masked: private details NEVER exposed\n  "available_slots": ["2026-08-28T11:30:00+05:30", "2026-08-28T15:00:00+05:30"],\n  "buffer_minutes": 15\n}`
    },
    {
      num: "05",
      name: "DEPARTMENTAL ROUTING",
      title: "Intelligent Permission Flow",
      desc: "Evaluates policy guidelines and routes queries to specific business units (e.g. General Consulting, Orthodontics, Billing, Marketing).",
      detail: "Configurable role-based access control (RBAC) ensures operators only see calls belonging to their authorized departmental queues.",
      badge: "RBAC ENFORCED",
      code: `// Department Assignment\n{\n  "assigned_dept": "dept_general",\n  "head_specialist": "Dr. Sarah Chen",\n  "extension": "101",\n  "permissions": ["owner", "dept_admin", "operator"]\n}`
    },
    {
      num: "06",
      name: "NATURAL VOICE RESOLUTION",
      title: "Autonomous Action Execution",
      desc: "Converses naturally to lock in appointments, resolve billing inquiries, provide follow-up care guidelines, or dispatch on-call alerts.",
      detail: "If critical distress is detected, Relay immediately halts automated prompts and sends emergency SMS notifications to managers.",
      badge: "HUMAN VOCAL CADENCE",
      code: `// Voice Dispatch Action\n{\n  "action": "book_appointment",\n  "slot": "Friday 11:30 AM",\n  "sms_confirmation_sent": true,\n  "sentiment": "positive"\n}`
    },
    {
      num: "07",
      name: "STRUCTURED CRM COMMIT",
      title: "Enterprise Database Sync",
      desc: "Every interaction is compiled into structured JSON and synced to your central CRM, EHR, Google Calendar, or PostgreSQL database.",
      detail: "Complete audio recording, bilingual transcript, key extracted facts, and recovered dollar value are logged with zero manual typing.",
      badge: "100% AUDITABLE JSON",
      code: `// Committed Audit Record\n{\n  "id": "call_9812",\n  "outcome": "booked",\n  "revenue_recovered": 320,\n  "booking_confirmed": true,\n  "calendar_event_id": "cal_evt_7721"\n}`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex flex-col animate-page-entrance">

      {/* 2. Hero Section */}
      <section className="px-6 sm:px-12 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold text-[#1B9A9C]">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <span>7-Stage Autonomous Voice Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
          How Relay Works From Ring to Resolution
        </h1>

        <p className="text-sm sm:text-base text-[#667085] dark:text-[#9BA8B8] max-w-2xl mx-auto leading-relaxed">
          Every inbound missed call or outbound batch campaign passes through an intelligent, deterministic 7-stage pipeline that guarantees instant answering, multilingual comprehension, and safe calendar booking.
        </p>
      </section>

      {/* 3. Interactive 7-Stage Pipeline Explorer */}
      <section className="px-6 sm:px-12 py-8 max-w-6xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stage Selector List (5 Cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {stages.map((st, i) => (
              <button
                key={st.num}
                onClick={() => setActiveStage(i)}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                  activeStage === i
                    ? "bg-white dark:bg-[#162A48] border-[#1B9A9C]/80 shadow-[0_4px_20px_rgba(27,154,156,0.12)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                    : "bg-[#FAFAF8] dark:bg-[#0E1E36] border-[#E4E8E7] dark:border-[#1E324F] hover:border-[#1B9A9C]/50 hover:bg-white/60 dark:hover:bg-[#162A48]/50"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                  activeStage === i
                    ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white"
                    : "bg-[#F3F5F4] dark:bg-[#10223A] text-[#667085] dark:text-[#9BA8B8]"
                }`}>
                  {st.num}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold text-[#1B9A9C] tracking-wider uppercase">
                      {st.name}
                    </span>
                    {activeStage === i && (
                      <span className="w-2 h-2 rounded-full bg-[#1B9A9C] shadow-[0_0_6px_#1B9A9C] animate-pulse" />
                    )}
                  </div>
                  <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate mt-0.5">
                    {st.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Active Stage Deep-Dive Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-8 shadow-elevated space-y-6">
            <div className="space-y-2 pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#1B9A9C] tracking-wider">
                  STAGE {stages[activeStage].num} &bull; {stages[activeStage].name}
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A]">
                  {stages[activeStage].badge}
                </span>
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                {stages[activeStage].title}
              </h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#0B1930] dark:text-[#F8FAFC] leading-relaxed">
                {stages[activeStage].desc}
              </p>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                {stages[activeStage].detail}
              </p>
            </div>

            {/* Live Schema / Payload Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#667085] dark:text-[#9BA8B8]">
                <span>Stage Execution Payload:</span>
                <span className="text-[#16A34A] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Validated Deterministic
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-[#081426] text-[#32C4BE] text-xs font-mono overflow-x-auto border border-[#20324A]">
                {stages[activeStage].code}
              </pre>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E4E8E7] dark:border-[#20324A]">
              <button
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] disabled:opacity-30 cursor-pointer"
              >
                &larr; Previous Stage
              </button>
              <button
                disabled={activeStage === stages.length - 1}
                onClick={() => setActiveStage((prev) => Math.min(stages.length - 1, prev + 1))}
                className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-semibold disabled:opacity-30 cursor-pointer shadow-sm"
              >
                Next Stage &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* 4. Public Footer */}
    <PublicFooter />
    </div>
  );
}
