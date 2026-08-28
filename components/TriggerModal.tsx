"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { ClinicLocation, RecallPatient, SUPPORTED_LANGUAGES, SUPPORTED_COUNTRIES, LanguageCode } from "@/lib/types";
import { AUTONOMOUS_GOALS, AutonomousGoal, getGoalById } from "@/lib/goals";
import { LiveCallTelemetry } from "./trigger/LiveCallTelemetry";
import { CallResultBanner } from "./trigger/CallResultBanner";

interface TriggerModalProps {
  isOpen: boolean;
  locations: ClinicLocation[];
  recallList: RecallPatient[];
  onClose: () => void;
  onCallLaunched?: () => void;
}

const DEFAULT_INDUSTRY_LOCATIONS: ClinicLocation[] = [
  {
    id: "loc_downtown",
    name: "Apex Health - Downtown Metro",
    industry: "Healthcare",
    phone: "+1-555-0100",
    address: "450 Sutter St, Suite 1200, San Francisco, CA",
    hours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM",
    services: [
      "Preventive Hygiene & Cleaning",
      "Comprehensive Oral Exam",
      "Emergency Triage & Pain Relief",
      "Invisalign Consultation",
      "Crowns & Restorative Care"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Sarah Chen, DDS",
    average_ticket_value: 320,
    defaultContext: "Caller is requesting next available appointment for tooth pain."
  },
  {
    id: "loc_westside",
    name: "Apex Health - Westside Family Clinic",
    industry: "Healthcare",
    phone: "+1-555-0200",
    address: "2100 Olympic Blvd, Los Angeles, CA",
    hours: "Mon-Fri: 8:30 AM - 5:30 PM",
    services: [
      "Routine Health & Wellness Exam",
      "Pediatric Checkups",
      "Hygiene & Teeth Whitening",
      "Chronic Condition Follow-up"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Marcus Vance, MD",
    average_ticket_value: 280,
    defaultContext: "Patient following up on annual wellness checkup and lab results."
  },
  {
    id: "loc_highland",
    name: "Apex Health - Highland Urgent & Specialty",
    industry: "Healthcare",
    phone: "+1-555-0300",
    address: "880 North Highland Ave, Austin, TX",
    hours: "24/7 Acute Triage & Urgent Walk-ins",
    services: [
      "24/7 Acute Pain Triage",
      "Advanced Dental Implants",
      "Oral Surgery & Extraction",
      "Emergency Trauma Relief"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Elena Rostova, DMD",
    average_ticket_value: 550,
    defaultContext: "Caller with acute discomfort requesting immediate emergency surgical evaluation."
  },
  {
    id: "loc_auto_metro",
    name: "Apex Velocity - Metro Auto Group & Service",
    industry: "Automotive",
    phone: "+1-555-0400",
    address: "1200 Motor Speedway Blvd, Dallas, TX",
    hours: "Mon-Sat: 7:00 AM - 6:00 PM",
    services: [
      "Diagnostic Engine Analysis",
      "Factory Recall Campaigns",
      "Express Brake & Rotor Service",
      "Fleet Maintenance Logistics"
    ],
    payment_plans_available: true,
    on_call_doctor: "Marcus Vance, Master Tech",
    average_ticket_value: 480,
    defaultContext: "Customer inquiring about active safety recall and scheduling service drop-off."
  },
  {
    id: "loc_legal_summit",
    name: "Apex Counsel - Corporate & Trial Practice",
    industry: "Legal",
    phone: "+1-555-0500",
    address: "100 Congress Ave, Suite 2100, Austin, TX",
    hours: "Mon-Fri: 8:30 AM - 6:30 PM",
    services: [
      "Corporate Entity Structuring",
      "Contract Risk Assessment",
      "IP & Patent Protection",
      "Emergency Litigation Retainers"
    ],
    payment_plans_available: true,
    on_call_doctor: "Elena Rostova, Managing Partner",
    average_ticket_value: 750,
    defaultContext: "Corporate client requesting urgent advisory retainer consultation."
  }
];

export function TriggerModal({ isOpen, locations, onClose, onCallLaunched }: TriggerModalProps) {
  const effectiveLocations = locations.length > 0 ? locations : DEFAULT_INDUSTRY_LOCATIONS;

  const [executionMode, setExecutionMode] = useState<"goal" | "custom">("goal");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("goal_recall_rebook");

  const [enableIvr, setEnableIvr] = useState<boolean>(false);
  const [ivrDtmfSequence, setIvrDtmfSequence] = useState<string>("1,w,2");
  const [ivrPromptGuidance, setIvrPromptGuidance] = useState<string>("Press 1 for Front Desk, then Press 2 for Appointments");

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [subscriberNumber, setSubscriberNumber] = useState<string>("8755441404");
  const selectedCountry = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];
  const fullE164Number = `${selectedCountry.dialCode}${subscriberNumber}`;

  const [patientName, setPatientName] = useState("Aaditya");
  const [selectedLocationId, setSelectedLocationId] = useState(effectiveLocations[0]?.id || "loc_downtown");

  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);
  const [customNodeName, setCustomNodeName] = useState<string>("Apex Global Solutions - North Branch");
  const [customIndustry, setCustomIndustry] = useState<string>("Healthcare");
  const [customDoctor, setCustomDoctor] = useState<string>("Dr. Jordan Lee, Specialist");
  const [customServices, setCustomServices] = useState<string>("Emergency Consultation, Rapid Booking, VIP Support");

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("hi");
  const [extraContext, setExtraContext] = useState("Caller is requesting next available appointment for consultation.");
  const [goalCarouselIndex, setGoalCarouselIndex] = useState(0);
  const extraContextRef = React.useRef<HTMLTextAreaElement>(null);

  const [isCalling, setIsCalling] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [resultMessage, setResultMessage] = useState<{ ok: boolean; text: string; runId?: string } | null>(null);
  const [liveCallStatus, setLiveCallStatus] = useState<string>("queued");
  const [liveCallSummary, setLiveCallSummary] = useState<string>("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const idempotencyKeyRef = React.useRef<string>("");

  const currentGoal: AutonomousGoal | undefined = getGoalById(selectedGoalId);

  const handlePrevGoal = () => {
    setGoalCarouselIndex((prev) => (prev - 1 + AUTONOMOUS_GOALS.length) % AUTONOMOUS_GOALS.length);
  };

  const handleNextGoal = () => {
    setGoalCarouselIndex((prev) => (prev + 1) % AUTONOMOUS_GOALS.length);
  };

  const adjustTextareaHeight = () => {
    if (extraContextRef.current) {
      extraContextRef.current.style.height = "auto";
      extraContextRef.current.style.height = `${Math.max(90, extraContextRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [extraContext, isOpen]);

  useEffect(() => {
    if (isOpen && !idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    if (!isOpen) {
      idempotencyKeyRef.current = "";
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isLoggedIn) setIsUserLoggedIn(true);
      }
    } catch {}

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.authenticated) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      })
      .catch(() => setIsUserLoggedIn(false));
  }, []);

  // Live ultra-responsive polling for run status from carrier (500ms polling interval)
  useEffect(() => {
    if (!resultMessage?.ok || !resultMessage.runId) return;

    setLiveCallStatus("queued");
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/call-results/status?runId=${resultMessage.runId}`);
        const data = await res.json();
        if (data.ok && data.status) {
          setLiveCallStatus(data.status);
          if (data.summary) setLiveCallSummary(data.summary);
          if (data.status === "completed" || data.status === "failed" || attempts >= 600) {
            clearInterval(interval);
            if (onCallLaunched) onCallLaunched();
          }
        }
      } catch {
        // silent fallback
      }
    }, 500);

    return () => clearInterval(interval);
  }, [resultMessage, onCallLaunched]);

  // Sync context when goal or language changes
  useEffect(() => {
    if (executionMode === "goal" && currentGoal) {
      const promptInfo = currentGoal.localizedPrompts[selectedLanguage] || currentGoal.localizedPrompts.en;
      setExtraContext(`[CALL-E AUTONOMOUS GOAL: ${currentGoal.title}]\nTarget: ${currentGoal.targetOutcome}\nGuidance: ${promptInfo.systemInstruction}`);
    }
  }, [executionMode, selectedGoalId, selectedLanguage, currentGoal]);

  if (!isOpen) return null;

  const handleLocationSelect = (locId: string) => {
    if (locId === "custom_manual") {
      setIsCustomLocation(true);
    } else {
      setIsCustomLocation(false);
      setSelectedLocationId(locId);
      const match = effectiveLocations.find((l) => l.id === locId);
      if (match && match.defaultContext && executionMode === "custom") {
        setExtraContext(match.defaultContext);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalling(true);
    setResultMessage(null);
    setProgressPercent(10);
    setDispatchStep(0);

    const stepInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
      setDispatchStep((prev) => {
        if (prev === 0) return 1;
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        return prev;
      });
    }, 25);

    const customLocationPayload = isCustomLocation
      ? {
          id: `loc_custom_${Date.now()}`,
          name: customNodeName.trim() || "Custom Practice Branch",
          industry: customIndustry,
          phone: fullE164Number,
          address: "Enterprise Dedicated SIP Node",
          hours: "Mon-Sat: 8:00 AM - 6:00 PM",
          services: customServices.split(",").map((s) => s.trim()).filter(Boolean),
          on_call_doctor: customDoctor.trim() || "Lead Specialist",
          average_ticket_value: 400
        }
      : undefined;

    const payload = {
      phoneNumber: fullE164Number,
      patientName: patientName.trim(),
      locationId: isCustomLocation ? undefined : selectedLocationId,
      customLocation: customLocationPayload,
      language: selectedLanguage,
      extraContext: extraContext.trim(),
      goalId: executionMode === "goal" ? selectedGoalId : undefined,
      ivrDtmfSequence: enableIvr ? ivrDtmfSequence : undefined,
      ivrPromptGuidance: enableIvr ? ivrPromptGuidance : undefined
    };

    try {
      const res = await fetch("/api/trigger-overflow", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      clearInterval(stepInterval);
      setProgressPercent(100);
      setDispatchStep(4);

      if (data.ok) {
        setResultMessage({
          ok: true,
          text: `Live Call Dispatched! Run ID: ${data.runId}. Carrier gateway connected to ${fullE164Number}.`,
          runId: data.runId
        });
        if (onCallLaunched) onCallLaunched();
      } else {
        const errorText = data.error || (typeof data.details === "string" ? data.details : data.details?.error?.message) || "Telephony gateway returned an error.";
        setResultMessage({
          ok: false,
          text: errorText
        });
      }
    } catch {
      clearInterval(stepInterval);
      setResultMessage({
        ok: false,
        text: "Network handshake timeout connecting to CALL-E telephony gateway."
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#0E1E36] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Quota & Mode Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Initiate Autonomous Voice Call
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 border border-[#1B9A9C]/20 text-[#1B9A9C]">
                {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && isUserLoggedIn
                  ? "⚡ Localhost Admin: Unlimited calls"
                  : "🛡️ 2 calls/day"}
              </span>
            </div>
            <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              CALL-E Goal Runs API 0.6 & Sub-140ms Telephony Gateway
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#F3F5F4] dark:hover:bg-[#081426] transition-colors"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher: Autonomous Goal Runs vs Custom Prompt */}
        <div className="flex items-center p-1 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]">
          <button
            type="button"
            onClick={() => setExecutionMode("goal")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              executionMode === "goal"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930]"
            }`}
          >
            <Icons.Activity className="w-3.5 h-3.5" />
            <span>Autonomous Goal Runs API (0.6)</span>
          </button>
          <button
            type="button"
            onClick={() => setExecutionMode("custom")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              executionMode === "custom"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930]"
            }`}
          >
            <Icons.Layers className="w-3.5 h-3.5" />
            <span>Custom Script / RAG Mode</span>
          </button>
        </div>

        {/* Goal Selection Carousel / Cards (Exactly 2 Visible at a Time with Arrow Navigation) */}
        {executionMode === "goal" && (
          <div className="space-y-3 p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Select Autonomous Task Goal
                </label>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20">
                  {goalCarouselIndex + 1}-{Math.min(goalCarouselIndex + 2, AUTONOMOUS_GOALS.length)} of {AUTONOMOUS_GOALS.length}
                </span>
              </div>

              {/* Navigation Arrow Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevGoal}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#1B9A9C] hover:text-white dark:hover:bg-[#1B9A9C] transition-all shadow-sm cursor-pointer"
                  title="Previous Goals"
                >
                  <Icons.ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextGoal}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#1B9A9C] hover:text-white dark:hover:bg-[#1B9A9C] transition-all shadow-sm cursor-pointer"
                  title="Next Goals"
                >
                  <Icons.ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exactly 2 Goal Cards Visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                AUTONOMOUS_GOALS[goalCarouselIndex],
                AUTONOMOUS_GOALS[(goalCarouselIndex + 1) % AUTONOMOUS_GOALS.length]
              ].map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 relative overflow-hidden group ${
                      isSelected
                        ? "bg-[#1B9A9C]/10 dark:bg-[#1B9A9C]/20 border-[#1B9A9C] shadow-md ring-1 ring-[#1B9A9C]"
                        : "bg-white dark:bg-[#10223A] border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C]/60 hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#1B9A9C] rounded-bl-lg flex items-center justify-center">
                        <Icons.Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-[#1B9A9C]/20 text-[#1B9A9C]">
                        {goal.badge}
                      </span>
                      <span className="text-[10px] text-[#667085] dark:text-[#9BA8B8] font-mono flex items-center gap-1">
                        <Icons.Clock className="w-3 h-3 text-[#1B9A9C]" />
                        {goal.estimatedDuration}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] leading-snug">
                      {goal.title}
                    </h4>
                    <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8] line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Premium Enhanced Autonomous Milestone Preview UI */}
            {currentGoal && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icons.Activity className="w-3.5 h-3.5 text-[#1B9A9C] animate-pulse" />
                    <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      Autonomous Milestones Sequence
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C] font-bold">
                      {currentGoal.milestones.length} Steps
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-[#667085] dark:text-[#9BA8B8] font-mono flex items-center gap-1">
                    <span className="text-[#1B9A9C] font-bold">Target:</span> {currentGoal.targetOutcome}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentGoal.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-[10px] space-y-1 hover:border-[#1B9A9C]/40 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1B9A9C] font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1B9A9C]/10 border border-[#1B9A9C]/20">
                          Step 0{idx + 1}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
                      </div>
                      <div className="text-[#0B1930] dark:text-[#F8FAFC] font-semibold leading-tight line-clamp-2 pt-0.5">
                        {m.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Destination Number & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Phone Number <span className="text-[#1B9A9C]">*</span>
              </label>

              {/* Country & Subscriber Number Selector */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#0B1930] dark:text-white outline-none cursor-pointer focus:border-[#1B9A9C]"
                  title="Select Target Country Code"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={subscriberNumber}
                  onChange={(e) => setSubscriberNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={selectedCountry.exampleNumber || "9810012345"}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Contact Name <span className="text-[#1B9A9C]">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Alex Taylor or Pawan Joshi"
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
              />
            </div>
          </div>

          {/* Spoken Language */}
          <div className="space-y-1">
            <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Opening Primary Language
            </label>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
              AI opens in chosen language and fluidly adapts if caller responds in Hindi, Nepali, Spanish, or English.
            </p>
          </div>

          {/* Practice Branch Node Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Branch Node / Grounded Entity
              </label>
              <button
                type="button"
                onClick={() => handleLocationSelect(isCustomLocation ? "loc_downtown" : "custom_manual")}
                className="text-[11px] font-bold text-[#1B9A9C] hover:underline"
              >
                {isCustomLocation ? "← Choose Preset Node" : "+ Custom Branch Node"}
              </button>
            </div>

            {!isCustomLocation ? (
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
              >
                <optgroup label="Healthcare & Medical Networks">
                  {effectiveLocations
                    .filter((l) => !l.industry || l.industry === "Healthcare")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Automotive Dealerships & Service Hubs">
                  {effectiveLocations
                    .filter((l) => l.industry === "Automotive")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Legal & Corporate Advisory">
                  {effectiveLocations
                    .filter((l) => l.industry === "Legal")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Hospitality & Concierge">
                  {effectiveLocations
                    .filter((l) => l.industry === "Hospitality")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Real Estate & Property Management">
                  {effectiveLocations
                    .filter((l) => l.industry === "Real Estate")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Custom Options">
                  <option value="custom_manual">+ Custom Practice Branch Node (Manual Entry)...</option>
                </optgroup>
              </select>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#1B9A9C]/40 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1B9A9C] uppercase tracking-wider font-mono">
                    Custom Manual Node Configuration
                  </span>
                  <span className="text-[10px] bg-[#1B9A9C]/10 text-[#1B9A9C] px-2 py-0.5 rounded-full font-bold">
                    Custom Node Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Business / Practice Name
                    </label>
                    <input
                      type="text"
                      value={customNodeName}
                      onChange={(e) => setCustomNodeName(e.target.value)}
                      placeholder="e.g. Apex Global Solutions"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    >
                      <option value="Healthcare">Healthcare & Medical</option>
                      <option value="Automotive">Automotive & Fleet</option>
                      <option value="Legal">Legal & Advisory</option>
                      <option value="Hospitality">Hospitality & Concierge</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="General">General Business</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Keypad IVR & DTMF PBX Tree Navigation (CALL-E August 15 Feature) */}
          <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableIvr}
                  onChange={(e) => setEnableIvr(e.target.checked)}
                  className="rounded text-[#1B9A9C] focus:ring-[#1B9A9C] h-3.5 w-3.5 cursor-pointer"
                />
                <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Keypad IVR & DTMF Auto-Navigation
                </span>
              </label>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C]">
                CALL-E Aug 15 Feature
              </span>
            </div>

            {enableIvr && (
              <div className="pt-2 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-2 animate-fade-in">
                <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
                  Automatically navigate complex phone trees by dialing DTMF digits upon hearing automated menus.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      DTMF Keypad Sequence (e.g. 1,w,2)
                    </label>
                    <input
                      type="text"
                      value={ivrDtmfSequence}
                      onChange={(e) => setIvrDtmfSequence(e.target.value)}
                      placeholder="1,w,2 (w = 0.5s pause)"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Menu Option Guidance
                    </label>
                    <input
                      type="text"
                      value={ivrPromptGuidance}
                      onChange={(e) => setIvrPromptGuidance(e.target.value)}
                      placeholder="Press 1 for Front Desk, 2 for Booking"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Context / Prompt Goals */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Task Instructions & Grounded Context
              </label>
              <span className="text-[10px] font-mono text-[#1B9A9C] font-semibold">
                Auto-Expanding Editor
              </span>
            </div>
            <textarea
              ref={extraContextRef}
              value={extraContext}
              onChange={(e) => {
                setExtraContext(e.target.value);
                adjustTextareaHeight();
              }}
              onInput={adjustTextareaHeight}
              placeholder="Enter detailed task instructions, specific patient context, constraints, or on-call instructions..."
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl p-3 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] focus:ring-1 focus:ring-[#1B9A9C] outline-none min-h-[90px] overflow-hidden leading-relaxed font-mono transition-all"
            />
          </div>

          {/* Live Multi-Step Telemetry Pipeline while calling */}
          {isCalling && (
            <LiveCallTelemetry
              progressPercent={progressPercent}
              dispatchStep={dispatchStep}
              selectedLanguage={selectedLanguage}
              fullE164Number={fullE164Number}
            />
          )}

          {/* Result / Error Banner */}
          <CallResultBanner
            resultMessage={resultMessage}
            liveCallStatus={liveCallStatus}
            liveCallSummary={liveCallSummary}
            fullE164Number={fullE164Number}
          />

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#F3F5F4] dark:bg-[#081426] hover:bg-[#E4E8E7] text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isCalling}
              className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-elevated transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C]" />
              <span>{isCalling ? "Connecting Telephony..." : "Place Real Audio Call"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
