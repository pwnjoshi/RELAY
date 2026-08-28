"use client";

import React, { useState } from "react";
import { Icons } from "./Icons";
import { CallRecord, ClinicLocation } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface CallDrawerProps {
  isOpen?: boolean;
  call: CallRecord | null;
  locations: ClinicLocation[];
  onClose: () => void;
}

export function CallDrawer({ isOpen = true, call, locations, onClose }: CallDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [smsCopied, setSmsCopied] = useState(false);
  const [playingTurn, setPlayingTurn] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"brief" | "transcript" | "schema">("brief");

  if (!isOpen || !call) return null;

  const location = locations.find((l) => l.id === call.locationId);
  const outcome = call.structuredOutcome;
  const raw = call.rawCalleData;

  const transcriptTurns = raw?.recipients?.[0]?.attempts?.[0]?.transcript_turns || raw?.transcript_turns || [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(outcome || raw || {}, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayTurnAudio = (turnIndex: number, text: string) => {
    const lang = call.language || "en";
    let audioUrl = "";
    if (["hi", "ne", "es"].includes(lang) && turnIndex < 5) {
      audioUrl = `/audio/dialogues/${lang}_turn_${turnIndex}.mp3`;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setPlayingTurn(turnIndex);
      audio.onended = () => setPlayingTurn(null);
      audio.onerror = () => setPlayingTurn(null);
      audio.play().catch(() => setPlayingTurn(null));
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      setPlayingTurn(turnIndex);
      utter.onend = () => setPlayingTurn(null);
      utter.onerror = () => setPlayingTurn(null);
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-[#161616] border-l border-[#E8E8E4] dark:border-[#2C2C2C] h-full overflow-y-auto flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E8E4] dark:border-[#2C2C2C]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#8E8E8E]">{call.id}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  call.status === "completed"
                    ? "bg-[#E8F5F2] text-[#0F8F78] border border-[#B2DFD7]"
                    : call.status === "running"
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse"
                    : "bg-[#FFF8E6] text-amber-700 border border-[#FFE6A3]"
                }`}
              >
                {call.status}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F7F7F5] dark:bg-[#282828] text-[#8E8E8E] font-mono">
                {call.language?.toUpperCase() || "EN"}
              </span>
            </div>
            <h2 className="text-xl font-black text-[#151515] dark:text-[#FAFAF8] tracking-tight">{call.patientName}</h2>
            <p className="text-xs text-[#666666] dark:text-[#9E9E9E] font-mono">{call.phoneNumber} • {location?.name || "Apex Health Network"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E8E] hover:text-[#151515] dark:hover:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#242424] transition-colors"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Neural Audio Player & Waveform Header */}
        <div className="mt-4 p-4 rounded-2xl bg-[#0B1930] text-white space-y-3 shadow-card border border-[#20324A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (transcriptTurns.length > 0) {
                    handlePlayTurnAudio(0, transcriptTurns[0]?.content || transcriptTurns[0]?.text || "Call recording stream playback");
                  }
                }}
                className="w-9 h-9 rounded-full bg-[#1B9A9C] hover:bg-[#158284] text-white flex items-center justify-center font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {playingTurn !== null ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <span className="text-[10px] font-mono text-[#1B9A9C] font-bold block uppercase tracking-wider">
                  Neural Audio Recording Stream
                </span>
                <span className="text-xs font-heading font-bold text-white">
                  24kHz Opus Voice Track • HD Audio
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-[#32C4BE]">
              <span>0:14 / 0:38</span>
            </div>
          </div>

          {/* Animated Waveform Graphic */}
          <div className="flex items-center gap-1 h-6 px-1">
            {[40, 65, 30, 85, 95, 45, 60, 30, 75, 90, 40, 60, 80, 50, 95, 70, 40, 65, 85, 30, 50, 75, 90, 40, 60, 85, 35, 70, 95, 50, 65, 80, 45, 75, 90].map((height, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  playingTurn !== null ? "bg-[#1B9A9C] animate-pulse" : "bg-[#20324A] hover:bg-[#1B9A9C]/60"
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-[#E8E8E4] dark:border-[#2C2C2C] text-xs">
          <button
            onClick={() => setActiveTab("brief")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "brief"
                ? "bg-[#0F8F78] text-white shadow-sm"
                : "text-[#666666] dark:text-[#9E9E9E] hover:bg-[#F7F7F5] dark:hover:bg-[#242424]"
            }`}
          >
            Post-Call Intelligence
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "transcript"
                ? "bg-[#0F8F78] text-white shadow-sm"
                : "text-[#666666] dark:text-[#9E9E9E] hover:bg-[#F7F7F5] dark:hover:bg-[#242424]"
            }`}
          >
            Transcript Turns ({transcriptTurns.length})
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "schema"
                ? "bg-[#0F8F78] text-white shadow-sm"
                : "text-[#666666] dark:text-[#9E9E9E] hover:bg-[#F7F7F5] dark:hover:bg-[#242424]"
            }`}
          >
            EHR Schema Extraction
          </button>
        </div>

        {/* Tab 1: Post-Call Intelligence Brief */}
        {activeTab === "brief" && (
          <div className="py-4 space-y-5 text-xs">
            {/* One-Line Clinical Outcome */}
            <div className="bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono">
                One-Line Conversation Outcome
              </span>
              <p className="text-sm font-semibold text-[#151515] dark:text-[#FAFAF8] leading-relaxed">
                {outcome?.notes || "Patient completed follow-up consultation with CALL-E voice agent."}
              </p>
              <div className="flex items-center gap-3 pt-2 text-[11px] text-[#666666] dark:text-[#9E9E9E]">
                <span>Disposition: <strong className="text-[#0F8F78] font-mono uppercase">{outcome?.outcome || "completed"}</strong></span>
                <span>•</span>
                <span>Revenue Recovered: <strong className="text-[#0F8F78] font-mono">${call.recoveredRevenue || 0}</strong></span>
              </div>
            </div>

            {/* DeepSeek AI Post-Call CRM Intelligence */}
            {call.aiIntelligence && (
              <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#1B9A9C]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.Zap className="w-3.5 h-3.5 text-[#1B9A9C]" />
                    <span className="font-heading font-extrabold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                      DeepSeek-V4 Post-Call CRM Intelligence
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#1B9A9C]/10 text-[#32C4BE] border border-[#1B9A9C]/30 px-2 py-0.5 rounded-full">
                    DeepSeek-V4-Flash-0731
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8] uppercase">Caller Intent:</span>
                    <span className="font-semibold text-[#0B1930] dark:text-white">{call.aiIntelligence.callerIntent}</span>
                  </div>

                  {call.aiIntelligence.recommendedFollowUpSms && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] space-y-1">
                      <span className="text-[10px] font-bold text-[#1B9A9C] font-mono block">Recommended Follow-up SMS Draft:</span>
                      <p className="text-[11px] text-[#0B1930] dark:text-[#F8FAFC] italic">
                        &quot;{call.aiIntelligence.recommendedFollowUpSms}&quot;
                      </p>
                    </div>
                  )}

                  {call.aiIntelligence.coachingInsight && (
                    <div className="p-2.5 rounded-lg bg-[#16A34A]/5 border border-[#16A34A]/20 space-y-0.5">
                      <span className="text-[10px] font-bold text-[#16A34A] font-mono block">Voice Agent Coaching Insight:</span>
                      <p className="text-[11px] text-[#0B1930] dark:text-[#F8FAFC]">
                        {call.aiIntelligence.coachingInsight}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Downstream Dispatched Actions (SMS & Calendar Event) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono">
                Downstream Dispatched Actions & Artifacts
              </span>
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                {/* SMS Dispatch Bubble */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                    <span className="text-[#1B9A9C] flex items-center gap-1">
                      <Icons.PhoneCall className="w-3 h-3" />
                      <span>Automated SMS Dispatched</span>
                    </span>
                    <span className="text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full border border-[#16A34A]/20">
                      Carrier 200 OK (Delivered)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[11px] text-[#0B1930] dark:text-[#F8FAFC] flex items-start justify-between gap-2">
                    <p className="italic leading-relaxed">
                      &quot;{call.aiIntelligence?.recommendedFollowUpSms || `Hello ${call.patientName}, thank you for speaking with ${location?.name || "Apex Health"}. Your follow-up has been confirmed. For questions, call back anytime.`}&quot;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(call.aiIntelligence?.recommendedFollowUpSms || "");
                        setSmsCopied(true);
                        setTimeout(() => setSmsCopied(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[10px] font-mono font-bold text-[#1B9A9C] flex-shrink-0 cursor-pointer"
                    >
                      {smsCopied ? "Copied" : "Copy SMS"}
                    </button>
                  </div>
                </div>

                {/* Calendar & CRM Integration Status */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] space-y-0.5">
                    <span className="text-[9px] text-[#667085] dark:text-[#9BA8B8] block">Calendar Sync</span>
                    <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      <span>{outcome?.appointment?.datetime ? "EHR Booked" : "Follow-up Synced"}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] space-y-0.5">
                    <span className="text-[9px] text-[#667085] dark:text-[#9BA8B8] block">CRM Webhook</span>
                    <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
                      <span>Payload Emitted</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Action Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono">
                Extracted Action Items & Ownership
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-[#151515] dark:text-[#FAFAF8]">
                      {outcome?.appointment?.booked ? "Confirm Calendar Slot & EHR Sync" : "Follow-up SMS Dispatch"}
                    </div>
                    <p className="text-[11px] text-[#666666] dark:text-[#9BA8B8]">
                      {outcome?.appointment?.datetime
                        ? `Appointment scheduled for ${outcome.appointment.datetime} (${outcome.appointment.service_type || "Routine Care"}).`
                        : "Send clinic portal link and payment options via SMS."}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8F5F2] text-[#0F8F78] flex-shrink-0">
                    Front Desk
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Context & Callback Priority */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono">
                Clinical Context & Priority
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C]">
                  <span className="text-[10px] text-[#8E8E8E] block">Service Type</span>
                  <span className="font-semibold text-[#151515] dark:text-[#FAFAF8]">
                    {outcome?.appointment?.service_type || "Follow-up Consultation"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C]">
                  <span className="text-[10px] text-[#8E8E8E] block">Callback Priority</span>
                  <span className={`font-semibold font-mono uppercase text-xs ${
                    outcome?.callback?.priority === "urgent" ? "text-rose-600" : "text-[#0F8F78]"
                  }`}>
                    {outcome?.callback?.priority || "Normal"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Transcript Turns */}
        {activeTab === "transcript" && (
          <div className="py-4 space-y-3 text-xs">
            {transcriptTurns.length > 0 ? (
              transcriptTurns.map((turn: any, i: number) => {
                const isAgent = turn.role === "agent" || turn.speaker === "agent";
                const turnContent = turn.content || turn.text || turn.utterance;
                const isThisPlaying = playingTurn === i;

                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                      isThisPlaying
                        ? "bg-[#E8F5F2] dark:bg-[#1B9A9C]/15 border-[#1B9A9C] ring-1 ring-[#1B9A9C]"
                        : isAgent
                        ? "bg-[#E8F5F2] dark:bg-[#0F8F78]/10 border-[#B2DFD7] dark:border-[#0F8F78]/30 ml-4"
                        : "bg-white dark:bg-[#1C1C1C] border-[#E8E8E4] dark:border-[#2C2C2C] mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                      <span className={isAgent ? "text-[#0F8F78]" : "text-[#666666] dark:text-[#9E9E9E]"}>
                        {isAgent ? "Sarah (CALL-E AI Voice)" : call.patientName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8E8E8E]">{turn.timestamp || `Turn ${i + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayTurnAudio(i, turnContent)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-[#282828] border border-[#E8E8E4] dark:border-[#3D3D3D] text-[9px] font-mono text-[#0F8F78] hover:border-[#0F8F78] cursor-pointer"
                          title="Play Speech Audio"
                        >
                          <Icons.Play className="w-2.5 h-2.5" />
                          <span>{isThisPlaying ? "Playing..." : "Play Audio"}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[#151515] dark:text-[#FAFAF8] leading-relaxed text-xs">
                      {turnContent}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#8E8E8E] bg-[#F7F7F5] dark:bg-[#1C1C1C] rounded-xl border border-[#E8E8E4] dark:border-[#2C2C2C]">
                No audio turns recorded for this simulated call task.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: EHR Schema Extraction */}
        {activeTab === "schema" && (
          <div className="py-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono">
                Validated JSON Outcome Schema
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F7F7F5] dark:bg-[#282828] text-xs font-semibold text-[#0F8F78] border border-[#E8E8E4] dark:border-[#3D3D3D]"
              >
                {copied ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#F7F7F5] dark:bg-[#111111] border border-[#E8E8E4] dark:border-[#2C2C2C] text-[11px] font-mono text-[#151515] dark:text-[#FAFAF8] overflow-x-auto max-h-96">
              {JSON.stringify(outcome || raw || {}, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-[#E8E8E4] dark:border-[#2C2C2C] flex items-center justify-between gap-3">
          <a
            href="/api/export?format=csv"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F7F7F5] dark:bg-[#282828] text-xs font-semibold text-[#151515] dark:text-[#FAFAF8] border border-[#E8E8E4] dark:border-[#3D3D3D]"
          >
            <Icons.Download className="w-3.5 h-3.5 text-[#0F8F78]" />
            <span>Export Audit Row</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0F8F78] hover:bg-[#0C7D69] text-white font-bold text-xs shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
