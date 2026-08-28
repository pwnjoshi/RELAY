"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icons } from "@/components/Icons";

interface StageDetail {
  num: string;
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: keyof typeof Icons;
  tag: string;
  badge: string;
  telemetry: string;
  liveSnippet: string;
  color: string;
  glowColor: string;
}

const STAGES: StageDetail[] = [
  {
    num: "01",
    step: "CALL",
    title: "Inbound or Outbound Trigger",
    subtitle: "PSTN Main Line & Scheduled Campaign",
    desc: "A customer rings your main phone line or an autonomous scheduled Excel campaign initiates outbound contact runs across your target lists.",
    icon: "PhoneCall",
    tag: "PSTN INTERCONNECT",
    badge: "0ms INITIATION",
    telemetry: "E.164 Trunk Handshake",
    liveSnippet: 'INBOUND CALL: "+1 (555) 0199" • Direct PSTN Ring detected',
    color: "#3B82F6",
    glowColor: "rgba(59, 130, 246, 0.25)"
  },
  {
    num: "02",
    step: "RECEIVE",
    title: "Zero-Latency SIP Intercept",
    subtitle: "Carrier Trunk Allocation",
    desc: "Relay intercepts the audio connection in under 14 seconds without robotic hold queues, repetitive elevator music, or confusing IVR menus.",
    icon: "Zap",
    tag: "CARRIER GATEWAY",
    badge: "< 14.2s ZERO HOLD",
    telemetry: "Dedicated SIP Trunk #9921",
    liveSnippet: "CARRIER STATUS: Intercepted in 13.8s • 24kHz Opus Audio Stream Active",
    color: "#1B9A9C",
    glowColor: "rgba(27, 154, 156, 0.3)"
  },
  {
    num: "03",
    step: "UNDERSTAND",
    title: "Multilingual Natural Language",
    subtitle: "Real-Time Speech-to-Intent Extraction",
    desc: "Listens in Hindi, Nepali, Spanish, or English and extracts caller intent with sub-second phonetic precision and dialect fluency.",
    icon: "Globe",
    tag: "7 WORLD LOCALES",
    badge: "SUB-SECOND STT",
    telemetry: "99.4% Transcription Accuracy",
    liveSnippet: 'VOICE INTENT: "I need to schedule a consultation with Dr. Pawan on Friday"',
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.25)"
  },
  {
    num: "04",
    step: "DECIDE",
    title: "Intelligent Decision Engine",
    subtitle: "Amazon Bedrock & DeepSeek",
    desc: "Evaluates policy guidelines, calendar availability, and caller history grounded 100% in your scraped website facts with zero hallucinations.",
    icon: "Sparkles",
    tag: "NEURAL REASONING",
    badge: "157 TOKENS/SEC",
    telemetry: "Zero Hallucinations Policy",
    liveSnippet: "BEDROCK REASONING: Checking Free/Busy temporal masking • 11:30 AM slot open",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.25)"
  },
  {
    num: "05",
    step: "ROUTE",
    title: "Team & Department Routing",
    subtitle: "Skill-Based Enterprise Delegation",
    desc: "Directs calls to specialized departments, on-call specialists, managers, or triggers emergency SMS escalation alerts with tenant isolation.",
    icon: "Department",
    tag: "IAM & POLICY ESCALATION",
    badge: "MULTI-TENANT ISOLATION",
    telemetry: "Skill Node: Operations Main",
    liveSnippet: "DEPT ROUTING: Forwarded to 'Consultation & Services' • Manager SMS alert ready",
    color: "#8B5CF6",
    glowColor: "rgba(139, 92, 246, 0.25)"
  },
  {
    num: "06",
    step: "ACT",
    title: "Autonomous Resolution",
    subtitle: "Instant Appointment & Workflow Execution",
    desc: "Confirms appointment slots, answers complex queries, and dispatches automated SMS confirmations and calendar invites to the caller.",
    icon: "UserCheck",
    tag: "WORKFLOW RESOLUTION",
    badge: "INSTANT CONFIRMATION",
    telemetry: "Google Calendar & SMS Dispatch",
    liveSnippet: "DISPATCH RESOLUTION: Slot confirmed for Friday 11:30 AM • SMS sent to caller",
    color: "#32C4BE",
    glowColor: "rgba(50, 196, 190, 0.3)"
  },
  {
    num: "07",
    step: "OUTCOME",
    title: "Structured CRM & Database Sync",
    subtitle: "Post-Call Schema Commitment",
    desc: "Structured JSON facts, lead disposition, and coaching analytics committed directly to your PostgreSQL database, Salesforce, or EHR.",
    icon: "Layers",
    tag: "SCHEMA COMMIT",
    badge: "100% AUDIT DURABILITY",
    telemetry: "PostgreSQL & Webhook Sync",
    liveSnippet: '{ "disposition": "confirmed_booking", "revenue_secured": "$320", "synced": true }',
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.25)"
  }
];

export function RelayLifecycleRoadmap() {
  const [activeStage, setActiveStage] = useState(0);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax Scroll Tracking to dynamically highlight roadmap stations
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far through the roadmap section the user has scrolled
      const start = rect.top - windowHeight * 0.4;
      const total = rect.height;
      const progress = Math.max(0, Math.min(1, -start / total));
      setScrollProgress(progress);

      const targetIndex = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length));
      setActiveStage(targetIndex);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transmit Signal Pulse Animation trigger
  const handleTransmitSignal = () => {
    setIsTransmitting(true);
    let step = 0;
    setActiveStage(0);

    const interval = setInterval(() => {
      step++;
      if (step < STAGES.length) {
        setActiveStage(step);
      } else {
        clearInterval(interval);
        setIsTransmitting(false);
      }
    }, 600);
  };

  return (
    <div ref={sectionRef} className="space-y-12 relative w-full select-none">
      {/* Top Interactive Signal Control Bar */}
      <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-4 sm:p-5 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#0B1930] dark:bg-[#081426] text-[#1B9A9C] flex items-center justify-center font-bold shadow-sm border border-[#1B9A9C]/30 flex-shrink-0">
            <Icons.Zap className={`w-5 h-5 ${isTransmitting ? "animate-bounce text-[#32C4BE]" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xs sm:text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                Autonomous Telephony Pipeline
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/15 text-[#1B9A9C]">
                Active Signal: 0{activeStage + 1} / 07
              </span>
            </div>
            <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              Scroll or click any node to trace the sub-second signal flow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleTransmitSignal}
            disabled={isTransmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] dark:bg-[#1B9A9C] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className={`w-2 h-2 rounded-full ${isTransmitting ? "bg-[#32C4BE] animate-ping" : "bg-[#16A34A]"}`} />
            <span>{isTransmitting ? `Transmitting Node 0${activeStage + 1}...` : "Transmit Signal Pulse ⚡"}</span>
          </button>
        </div>
      </div>

      {/* Main Roadmap Container with Central Glowing Neural Spine (Zig-Zag Alternating Layout) */}
      <div className="relative py-4">
        {/* Central Vertical Glowing Pipeline (Hidden on mobile, centered on md+) */}
        <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 bg-[#E4E8E7] dark:bg-[#20324A] rounded-full overflow-hidden">
          {/* Animated Laser Beam traveling down the spine */}
          <div
            className="w-full bg-gradient-to-b from-[#1B9A9C] via-[#32C4BE] to-[#06B6D4] transition-all duration-500 rounded-full shadow-[0_0_12px_#1B9A9C]"
            style={{
              height: `${Math.max(12, ((activeStage + 1) / STAGES.length) * 100)}%`
            }}
          />
        </div>

        {/* Mobile Left-Aligned Spine */}
        <div className="md:hidden absolute left-6 top-8 bottom-8 w-1 bg-[#E4E8E7] dark:bg-[#20324A] rounded-full overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-[#1B9A9C] via-[#32C4BE] to-[#06B6D4] transition-all duration-500 rounded-full shadow-[0_0_12px_#1B9A9C]"
            style={{
              height: `${Math.max(12, ((activeStage + 1) / STAGES.length) * 100)}%`
            }}
          />
        </div>

        {/* 7 Interactive Stage Nodes in Alternating Zig-Zag Flow */}
        <div className="space-y-8 md:space-y-12">
          {STAGES.map((s, index) => {
            const IconComponent = Icons[s.icon] || Icons.Zap;
            const isLeft = index % 2 === 0;
            const isActive = index === activeStage;
            const isPassed = index < activeStage;

            return (
              <div
                key={s.step}
                onClick={() => setActiveStage(index)}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 transition-all duration-500 cursor-pointer group ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content Card Side (Half Width on Desktop) */}
                <div
                  className={`w-full md:w-[45%] pl-12 md:pl-0 ${
                    isLeft ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"
                  }`}
                >
                  <div
                    className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
                      isActive
                        ? "bg-white dark:bg-[#10223A] border-[#1B9A9C] shadow-2xl scale-[1.02] ring-2 ring-[#1B9A9C]/30"
                        : isPassed
                        ? "bg-white/80 dark:bg-[#10223A]/80 border-[#1B9A9C]/40 shadow-subtle hover:border-[#1B9A9C]"
                        : "bg-white/60 dark:bg-[#0E1E36]/60 border-[#E4E8E7] dark:border-[#1E324F] hover:border-[#9BA8B8]"
                    }`}
                  >
                    {/* Glowing Ambient Corner Accent */}
                    {isActive && (
                      <div
                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                        style={{ backgroundColor: s.color }}
                      />
                    )}

                    {/* Step Header Badges */}
                    <div
                      className={`flex items-center gap-2 mb-2 ${
                        isLeft ? "md:justify-end" : "md:justify-start"
                      }`}
                    >
                      <span className="font-mono font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20">
                        {s.tag}
                      </span>
                      <span className="font-mono text-[10px] text-[#667085] dark:text-[#9BA8B8] font-bold">
                        {s.badge}
                      </span>
                    </div>

                    {/* Action Step & Title */}
                    <div className="space-y-1">
                      <div className="font-heading font-extrabold text-sm sm:text-base text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                        {s.num}. {s.title}
                      </div>
                      <div className="text-xs font-semibold text-[#1B9A9C]">{s.subtitle}</div>
                    </div>

                    {/* Narrative Description */}
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-2.5 leading-relaxed">
                      {s.desc}
                    </p>

                    {/* Live Telemetry Code / Terminal Output Chip */}
                    <div className="mt-3.5 pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
                      <div className="p-2.5 rounded-xl bg-[#081426] text-[#32C4BE] font-mono text-[10.5px] leading-relaxed border border-[#20324A] text-left flex items-start gap-2 shadow-inner">
                        <span className="text-[#16A34A] font-bold select-none">&gt;</span>
                        <span className="truncate">{s.liveSnippet}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Central Node Icon Pod (Positioned exactly over the spine) */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border-2 ${
                      isActive
                        ? "bg-[#0B1930] text-white border-[#1B9A9C] scale-110 shadow-[0_0_25px_rgba(27,154,156,0.5)] ring-4 ring-[#1B9A9C]/20"
                        : isPassed
                        ? "bg-[#0B1930] text-[#32C4BE] border-[#1B9A9C]/60 hover:scale-105"
                        : "bg-white dark:bg-[#10223A] text-[#667085] dark:text-[#9BA8B8] border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C]"
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${
                        isActive ? "scale-110 text-[#1B9A9C]" : ""
                      }`}
                    />

                    {/* Pulsing Active Node Beacon */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B9A9C] opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#1B9A9C]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Empty Balancing Spacer Side for Desktop Symmetry */}
                <div className="hidden md:block w-[45%]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
