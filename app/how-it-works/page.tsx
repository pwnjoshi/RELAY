"use client";

import React, { useState } from "react";
import { Icons } from "@/components/Icons";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      num: "01",
      name: "INBOUND & OUTBOUND TRIGGER",
      title: "Telephony Signal Ingress",
      desc: "Relay connects to your existing business phone trunks (SIP) or initiates automated outbound patient recall runs from structured CSV/Excel uploads.",
      detail: "Supports SIP trunk bridging with carriers like Twilio, Telnyx, Asterisk, and FreePBX. Inbound calls are intercepted automatically when front-desk lines ring past threshold.",
      badge: "INSTANT INGRESS",
      code: `// Carrier Ingress Webhook\n{\n  "event": "call.initiated",\n  "caller_id": "+91 98100 12345",\n  "branch_id": "loc_downtown",\n  "timestamp": "2026-08-26T14:40:00Z"\n}`
    },
    {
      num: "02",
      name: "ZERO-LATENCY INTERCEPT",
      title: "SIP Trunk Audio Bridge",
      desc: "Relay establishes a full-duplex 24kHz Opus audio stream with sub-14s latency, preventing callers from abandoning or leaving voicemail.",
      detail: "Eliminates frustrating hold queues and rigid touch-tone menus ('Press 1 for Appointments'). Callers speak naturally from the first second.",
      badge: "ZERO HOLD TIME",
      code: `// Audio Stream Session\n{\n  "codec": "OPUS_24KHZ",\n  "latency_ms": 13.8,\n  "carrier": "Direct SIP Trunk",\n  "jitter_buffer": "adaptive_low_delay"\n}`
    },
    {
      num: "03",
      name: "MULTILINGUAL SPEECH & INTENT",
      title: "Phonetic & Dialect Understanding",
      desc: "Streaming speech-to-text decodes conversational nuances in Hindi, Nepali, Spanish, and English with high acoustic accuracy.",
      detail: "Handles mixed language phrasing (Hinglish, code-switching), regional accents, and acoustic background noise with sub-second turnaround.",
      badge: "4 CORE LOCALES",
      code: `// Real-Time Speech Extraction\n{\n  "detected_language": "hi-IN",\n  "intent": "reschedule_consultation",\n  "urgency_score": 0.15,\n  "confidence": 0.994\n}`
    },
    {
      num: "04",
      name: "CALENDAR LOOKUP & PRIVACY",
      title: "Free/Busy Availability Engine",
      desc: "Relay queries connected Google Calendars and practice databases using strict temporal masking without exposing private appointment details.",
      detail: "Calculates available openings with 15-minute buffers and office hours restrictions. Third-party private calendar entries remain completely protected.",
      badge: "FREE/BUSY MASKING",
      code: `// Calendar Availability Lookup\n{\n  "status": "BUSY", // Masked: private event titles NEVER exposed\n  "available_slots": ["2026-08-28T11:30:00+05:30", "2026-08-28T15:00:00+05:30"],\n  "buffer_minutes": 15\n}`
    },
    {
      num: "05",
      name: "DEPARTMENT ROUTING & RBAC",
      title: "Access Control & Branch Delegation",
      desc: "Evaluates policy guidelines and routes queries to authorized branch nodes (Consultation, Specialty Surgery, Billing, Emergency).",
      detail: "Enforces tenant and departmental access control. Staff members only access audit records and recordings authorized for their role.",
      badge: "RBAC ENFORCED",
      code: `// Department Assignment\n{\n  "assigned_dept": "dept_general",\n  "head_specialist": "Dr. Sarah Chen",\n  "extension": "101",\n  "permissions": ["owner", "dept_admin", "operator"]\n}`
    },
    {
      num: "06",
      name: "AUTONOMOUS VOICE RESOLUTION",
      title: "Goal Resolution & Action Execution",
      desc: "Converses naturally to confirm slots, answer questions, provide follow-up care instructions, and trigger automated SMS confirmations.",
      detail: "If critical distress or clinical red flags are detected, Relay immediately halts automated dialog and alerts the on-call physician via SMS.",
      badge: "GOAL RESOLUTION",
      code: `// Voice Resolution Outcome\n{\n  "action": "book_appointment",\n  "slot": "Friday 11:30 AM",\n  "sms_confirmation_sent": true,\n  "sentiment": "positive"\n}`
    },
    {
      num: "07",
      name: "STRUCTURED CRM COMMIT",
      title: "Telemetry & Schema Commitment",
      desc: "Every interaction is compiled into structured JSON and synced to your central database, EHR, Google Calendar, or Webhook endpoint.",
      detail: "Complete audio recording, bilingual transcript turns, extracted structured facts, and disposition codes are committed with zero manual entry.",
      badge: "AUDITABLE TELEMETRY",
      code: `// Committed Audit Record\n{\n  "id": "call_9812",\n  "outcome": "booked",\n  "revenue_recovered": 320,\n  "booking_confirmed": true,\n  "calendar_event_id": "cal_evt_7721"\n}`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex flex-col animate-page-entrance">
        {/* Hero Section */}
        <section className="px-6 sm:px-10 lg:px-16 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-semibold text-[#1B9A9C] dark:text-[#2EC4C0]">
            <span className="w-2 h-2 rounded-full bg-[#1B9A9C] dark:bg-[#2EC4C0]" />
            <span>7-Stage Autonomous Voice Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
            How Relay Works From Ring to Resolution
          </h1>

          <p className="text-sm sm:text-base text-[#5B6B82] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Every inbound call or outbound batch campaign passes through a deterministic 7-stage pipeline that guarantees rapid answering, multilingual comprehension, and safe calendar booking.
          </p>
        </section>

        {/* 7-Stage Pipeline Explorer */}
        <section className="px-6 sm:px-10 lg:px-16 py-8 max-w-6xl mx-auto w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Stage Selector List (5 Cols) */}
            <div className="lg:col-span-5 space-y-2">
              {stages.map((st, i) => (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setActiveStage(i)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 cursor-pointer ${
                    activeStage === i
                      ? "bg-white dark:bg-[#13243C] border-[#1B9A9C] dark:border-[#2EC4C0] shadow-xs"
                      : "bg-[#FAFAF8] dark:bg-[#0E1B2E] border-[#E4E8E7] dark:border-[#1E3048] hover:border-[#1B9A9C]/50"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                    activeStage === i
                      ? "bg-[#0B1930] dark:bg-[#2EC4C0] text-white dark:text-[#081220]"
                      : "bg-[#F3F5F4] dark:bg-[#081220] text-[#5B6B82] dark:text-[#94A3B8]"
                  }`}>
                    {st.num}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] tracking-wider uppercase">
                        {st.name}
                      </span>
                      {activeStage === i && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C] dark:bg-[#2EC4C0]" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate mt-0.5">
                      {st.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Column: Active Stage Deep-Dive Card (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2 pb-4 border-b border-[#E4E8E7] dark:border-[#1E3048]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] tracking-wider">
                    STAGE {stages[activeStage].num} • {stages[activeStage].name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#1E3048]">
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
                <p className="text-xs text-[#5B6B82] dark:text-[#94A3B8] leading-relaxed">
                  {stages[activeStage].detail}
                </p>
              </div>

              {/* Payload Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#5B6B82] dark:text-[#94A3B8]">
                  <span>Telemetry Payload:</span>
                  <span className="text-[#16A34A] flex items-center gap-1 font-semibold">
                    <Icons.Check className="w-3.5 h-3.5" />
                    Schema Validated
                  </span>
                </div>
                <pre className="p-4 rounded-lg bg-[#081220] text-[#2EC4C0] text-xs font-mono overflow-x-auto border border-[#1E3048]">
                  {stages[activeStage].code}
                </pre>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E4E8E7] dark:border-[#1E3048]">
                <button
                  type="button"
                  disabled={activeStage === 0}
                  onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] disabled:opacity-30 cursor-pointer"
                >
                  &larr; Previous Stage
                </button>
                <button
                  type="button"
                  disabled={activeStage === stages.length - 1}
                  onClick={() => setActiveStage((prev) => Math.min(stages.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white dark:bg-[#2EC4C0] dark:text-[#081220] text-xs font-semibold disabled:opacity-30 cursor-pointer shadow-xs"
                >
                  Next Stage &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
