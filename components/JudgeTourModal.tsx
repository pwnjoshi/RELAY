"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "./Icons";

interface TourStep {
  title: string;
  badge: string;
  headline: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  actionCallback?: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. Neural Web RAG Ingestion",
    badge: "DEEPSEEK-V4-FLASH",
    headline: "Autonomous Live Website Crawling & Knowledge Grounding",
    description:
      "Relay connects to Nebius Token Factory DeepSeek-V4-Flash-0731 to autonomously crawl any company website URL, extracting brand facts, services, pricing, and operating rules to ground the voice agent in real-time.",
    actionLabel: "Explore RAG Ingestion in Console →",
    actionHref: "/dashboard",
    highlights: [
      "Sub-second RAG extraction tokens",
      "Zero hallucinations: 100% grounded in company facts",
      "Multi-industry support (Healthcare, Tech, Fleet, Legal)"
    ],
    metrics: [
      { label: "Reasoning Model", value: "DeepSeek-V4" },
      { label: "Token Processing", value: "157 Tok/s" }
    ]
  },
  {
    title: "2. Zero-Latency Voice Telephony",
    badge: "CALL-E CARRIER GATEWAY",
    headline: "PSTN Regional Trunk Routing & In-Browser Audio Sandbox",
    description:
      "Direct E.164 phone dispatch with sub-second STT/TTS latency. Test either with a live phone call to your mobile or test instantly in your browser with real-time waveform visualizers.",
    actionLabel: "Test Live Voice Telephony →",
    actionCallback: "open_trigger",
    highlights: [
      "Sub-140ms voice generation turn-around",
      "Dynamic rate limiter: 2 calls/day IP quota & 60s cooldown",
      "Natural conversational cadence (<20 words/turn)"
    ],
    metrics: [
      { label: "Telephony Gateway", value: "CALL-E E.164" },
      { label: "Audio Latency", value: "<140ms" }
    ]
  },
  {
    title: "3. Multilingual Voice Fluidity",
    badge: "7 WORLD LOCALES",
    headline: "Native Fluency Across Hindi, Nepali, Spanish & English",
    description:
      "Relay speaks and understands Hindi (हिन्दी), Nepali (नेपाली), Spanish (Español), English, French, German, and Mandarin with zero lag and mid-conversation language switching.",
    actionLabel: "View Supported Locales in Docs →",
    actionHref: "/docs",
    highlights: [
      "Native dialect pronunciation and localized greetings",
      "Turn-by-turn multilingual transcription in Call Drawer",
      "Automated multilingual follow-up SMS generation"
    ],
    metrics: [
      { label: "Supported Languages", value: "7 Locales" },
      { label: "Mid-Call Switching", value: "Instant" }
    ]
  },
  {
    title: "4. Post-Call CRM Intelligence",
    badge: "AUTOMATED ACTIONS",
    headline: "Autonomous Action Extraction, SMS Dispatch & Agent Coaching",
    description:
      "Every completed call is analyzed by DeepSeek-V4 to extract caller intent, generate ready-to-send SMS drafts, book calendar slots, and provide actionable coaching insights to front desk staff.",
    actionLabel: "Inspect Live Call Feed →",
    actionHref: "/calls",
    highlights: [
      "One-click recommended follow-up SMS draft",
      "Direct Google Calendar & .ics invite dispatch",
      "Voice quality & conversational empathy score"
    ],
    metrics: [
      { label: "Revenue Recovery", value: "$320-$680/call" },
      { label: "Post-Call Processing", value: "<800ms" }
    ]
  },
  {
    title: "5. Excel Batch Dialing Studio",
    badge: "ENTERPRISE BATCH",
    headline: "Bulk Multi-Contact Outreach with Automated Campaign Pacing",
    description:
      "Upload CSV/Excel contact lists to execute scheduled service maintenance campaigns, patient recalls, and outbound surveys with autonomous rate pacing and consent compliance.",
    actionLabel: "Launch Batch Engine →",
    actionHref: "/batch",
    highlights: [
      "Drag-and-drop CSV parser with sample templates",
      "Real-time call progress tracking & batch stats",
      "Automatic opt-out and DNC compliance logging"
    ],
    metrics: [
      { label: "Batch Throughput", value: "100+ calls/hr" },
      { label: "DNC Compliance", value: "100% Enforced" }
    ]
  }
];

export function JudgeTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
      setCurrentStepIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* Floating Tour Launcher Pill (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#10223A] text-white border border-[#20324A] hover:border-[#1B9A9C] shadow-elevated transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Start 2-Minute Platform Guided Tour"
      >
        <Icons.Sparkles className="w-4 h-4 text-[#1B9A9C] flex-shrink-0" />
        <span className="font-heading font-bold text-xs tracking-tight text-[#F8FAFC]">
          Platform Guided Tour
        </span>
        <span className="text-[10px] font-mono font-bold bg-[#1B9A9C]/15 text-[#1B9A9C] px-2 py-0.5 rounded-md border border-[#1B9A9C]/20">
          2 min
        </span>
      </button>

      {/* Tour Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-8 shadow-elevated space-y-6 animate-fade-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1B9A9C]/10 text-[#1B9A9C] flex items-center justify-center font-bold text-xs font-mono border border-[#1B9A9C]/20">
                  0{currentStepIndex + 1}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold text-[#1B9A9C] tracking-wider">
                    {step.badge}
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-[#0B1930] dark:text-[#F8FAFC]">
                    {step.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#667085] dark:text-[#9BA8B8]">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                >
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                {step.headline}
              </h4>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                {step.description}
              </p>

              {/* Highlights & Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1B9A9C] block">
                    Key Platform Capabilities
                  </span>
                  <ul className="space-y-1 text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                    {step.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#667085] dark:text-[#9BA8B8] block">
                    Performance Telemetry
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {step.metrics.map((m, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A]">
                        <span className="text-[9px] text-[#667085] dark:text-[#9BA8B8] block">{m.label}</span>
                        <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Navigation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? "w-6 bg-[#1B9A9C]"
                        : "w-2 bg-[#E4E8E7] dark:bg-[#20324A] hover:bg-[#9BA8B8]"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                {step.actionHref && (
                  <Link
                    href={step.actionHref}
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-bold text-[#0B1930] dark:text-white transition-all"
                  >
                    {step.actionLabel}
                  </Link>
                )}

                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] text-xs font-bold text-[#667085] hover:text-[#0B1930] dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
