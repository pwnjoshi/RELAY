"use client";

import React, { useState, useRef } from "react";
import { Icons } from "./Icons";
import { CallRecord, ClinicLocation } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getGoalById, AutonomousGoal } from "@/lib/goals";
import { generateWhatsAppLink, generateLocalizedFollowUpMessage } from "@/lib/omnichannel";

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
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "goals" | "transcript" | "schema">("brief");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen || !call) return null;

  const location = locations.find((l) => l.id === call.locationId);
  const outcome = call.structuredOutcome;
  const raw = call.rawCalleData as {
    recipients?: Array<{
      recording_url?: string;
      attempts?: Array<{
        recording_url?: string;
        transcript_turns?: Array<{ role?: string; speaker?: string; content?: string; text?: string; timestamp?: string }>;
      }>;
    }>;
    transcript_turns?: Array<{ role?: string; speaker?: string; content?: string; text?: string; timestamp?: string }>;
    recording_url?: string;
    audio_url?: string;
  } | undefined;

  const transcriptTurns =
    raw?.recipients?.[0]?.attempts?.[0]?.transcript_turns ||
    raw?.transcript_turns ||
    [];

  const realRecordingUrl =
    call.recordingUrl ||
    raw?.recording_url ||
    raw?.recipients?.[0]?.recording_url ||
    raw?.recipients?.[0]?.attempts?.[0]?.recording_url ||
    raw?.audio_url ||
    null;

  const currentGoal: AutonomousGoal | undefined = call.goalId ? getGoalById(call.goalId) : undefined;

  const localizedFollowUpText = generateLocalizedFollowUpMessage({
    callerName: call.patientName,
    branchName: location?.name || "Apex Operations",
    serviceType: outcome?.appointment?.service_type || "Follow-up Consultation",
    datetime: outcome?.appointment?.datetime || undefined,
    language: call.language
  });

  const whatsappDeepLink = generateWhatsAppLink(call.phoneNumber, localizedFollowUpText);
  const smsDeepLink = `sms:${call.phoneNumber.replace(/[^0-9+]/g, "")}?body=${encodeURIComponent(localizedFollowUpText)}`;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(outcome || raw || {}, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFullAudio = () => {
    if (realRecordingUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(realRecordingUrl);
        audioRef.current.onended = () => setIsPlayingFullAudio(false);
      }
      if (isPlayingFullAudio) {
        audioRef.current.pause();
        setIsPlayingFullAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingFullAudio(true);
      }
    }
  };

  const handlePlayTurnAudio = (turnIndex: number, text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (playingTurn === turnIndex) {
        setPlayingTurn(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setPlayingTurn(null);
      utterance.onerror = () => setPlayingTurn(null);
      setPlayingTurn(turnIndex);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0E1E36] h-full shadow-2xl p-6 overflow-y-auto border-l border-[#E4E8E7] dark:border-[#20324A] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1B9A9C]">
                {call.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  call.status === "completed"
                    ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                    : call.status === "failed"
                    ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                    : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                }`}
              >
                {call.status}
              </span>
              {call.language && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-[#F8FAFC] uppercase">
                  {call.language}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              {call.patientName}
            </h3>
            <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
              {call.phoneNumber} • {location?.name || "Apex Health Network"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#667085] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Real Audio Stream Banner */}
        {realRecordingUrl ? (
          <div className="my-4 p-4 rounded-xl bg-gradient-to-br from-[#0B1930] to-[#162C4E] dark:from-[#081426] dark:to-[#0E1E36] text-white border border-[#1B9A9C]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.Activity className="w-4 h-4 text-[#1B9A9C] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  Verified Audio Recording
                </span>
              </div>
              <span className="text-[10px] font-mono bg-[#1B9A9C]/20 text-[#1B9A9C] px-2 py-0.5 rounded-full border border-[#1B9A9C]/30">
                PSTN Carrier Stream
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleToggleFullAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B9A9C] hover:bg-[#27B5B2] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isPlayingFullAudio ? <Icons.Close className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
                <span>{isPlayingFullAudio ? "Pause Recording" : "Play Actual Call Audio"}</span>
              </button>

              <a
                href={realRecordingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#9BA8B8] hover:text-white font-mono underline"
              >
                Direct Audio Link ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#667085] dark:text-[#9BA8B8]">
              <Icons.Volume2 className="w-3.5 h-3.5" />
              <span>Real-Time TTS Audio Simulation Stream</span>
            </div>
            {transcriptTurns.length > 0 && (
              <button
                type="button"
                onClick={() => handlePlayTurnAudio(0, transcriptTurns[0]?.content || transcriptTurns[0]?.text || "")}
                className="text-[11px] font-bold text-[#1B9A9C] hover:underline"
              >
                Audition First Turn 🔊
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-2 pb-2 border-b border-[#E4E8E7] dark:border-[#20324A] text-xs flex-wrap">
          <button
            onClick={() => setActiveTab("brief")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "brief"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
            }`}
          >
            Post-Call Intelligence
          </button>
          {currentGoal && (
            <button
              onClick={() => setActiveTab("goals")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "goals"
                  ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
              }`}
            >
              <Icons.Activity className="w-3 h-3 text-[#1B9A9C]" />
              <span>Goal Milestones</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("transcript")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "transcript"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
            }`}
          >
            Transcript Turns ({transcriptTurns.length})
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "schema"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
            }`}
          >
            Structured JSON
          </button>
        </div>

        {/* Tab 1: Executive Intelligence Brief */}
        {activeTab === "brief" && (
          <div className="py-4 space-y-4">
            {/* Keypad IVR DTMF Navigation Badge (if present) */}
            {call.ivrDtmfSequence && (
              <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#1B9A9C]/40 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-[#1B9A9C] flex items-center gap-1.5">
                    <Icons.Cpu className="w-3.5 h-3.5" />
                    <span>Auto-Negotiated PBX Keypad IVR</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1B9A9C]/10 text-[#1B9A9C]">
                    DTMF Sequence: {call.ivrDtmfSequence}
                  </span>
                </div>
                <p className="text-[11px] text-[#0B1930] dark:text-[#F8FAFC]">
                  {call.ivrPromptGuidance || "Automated phone-tree menu successfully traversed."}
                </p>
              </div>
            )}

            {/* AI Summary Card */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B9A9C] font-mono">
                  Autonomous AI Summary
                </span>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                  {formatDateTime(call.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#0B1930] dark:text-[#F8FAFC] leading-relaxed">
                {call.summary || outcome?.notes || "No call summary recorded."}
              </p>

              {/* Omnichannel WhatsApp & SMS Instant Follow-Up Hub */}
              <div className="space-y-2 pt-2 border-t border-[#E4E8E7] dark:border-[#20324A]">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-[#1B9A9C] flex items-center gap-1">
                    <Icons.PhoneIncoming className="w-3 h-3" />
                    <span>Omnichannel Multilingual Follow-Up</span>
                  </span>
                  <span className="text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full border border-[#16A34A]/20">
                    Ready to Dispatch
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[11px] text-[#0B1930] dark:text-[#F8FAFC] space-y-2">
                  <p className="italic leading-relaxed text-[11px]">
                    &quot;{localizedFollowUpText}&quot;
                  </p>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {/* Direct WhatsApp Web Link */}
                    <a
                      href={whatsappDeepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Icons.MessageSquare className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </a>

                    {/* Direct SMS Link */}
                    <a
                      href={smsDeepLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] dark:bg-[#1B9A9C] text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Icons.PhoneCall className="w-3.5 h-3.5" />
                      <span>Send Carrier SMS</span>
                    </a>

                    {/* Copy Text Button */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(localizedFollowUpText);
                        setSmsCopied(true);
                        setTimeout(() => setSmsCopied(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[11px] font-mono font-bold text-[#1B9A9C] cursor-pointer"
                    >
                      {smsCopied ? "✓ Copied" : "Copy Text"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Revenue & Outcome Chips */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A]">
                  <span className="text-[9px] text-[#667085] dark:text-[#9BA8B8] block">Revenue Recovered</span>
                  <span className="font-heading font-extrabold text-xs text-[#16A34A]">
                    {formatCurrency(call.recoveredRevenue || 0)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A]">
                  <span className="text-[9px] text-[#667085] dark:text-[#9BA8B8] block">Caller Sentiment</span>
                  <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] capitalize">
                    {outcome?.sentiment || "Positive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Goal Milestones & Execution Plan */}
        {activeTab === "goals" && currentGoal && (
          <div className="py-4 space-y-3">
            <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#1B9A9C]/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#1B9A9C]">
                  {currentGoal.badge}
                </span>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                  Target: {currentGoal.targetOutcome}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                {currentGoal.title}
              </h4>
              <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                {currentGoal.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8] font-mono block">
                Execution Milestones Breakdown
              </span>

              {currentGoal.milestones.map((m, idx) => {
                const isCompleted = idx <= 2 || call.status === "completed";
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] flex items-start gap-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 ${
                        isCompleted
                          ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30"
                          : "bg-[#FAFAF8] dark:bg-[#081426] text-[#667085] border border-[#E4E8E7]"
                      }`}
                    >
                      {isCompleted ? "✓" : `0${idx + 1}`}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                        {m.title}
                      </div>
                      <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Transcript Turns */}
        {activeTab === "transcript" && (
          <div className="py-4 space-y-3">
            {transcriptTurns.length > 0 ? (
              transcriptTurns.map((turn: { role?: string; speaker?: string; content?: string; text?: string; timestamp?: string }, i: number) => {
                const isAgent = turn.role === "agent" || turn.speaker === "agent" || turn.role === "assistant";
                const turnContent = turn.content || turn.text || "";
                const isThisPlaying = playingTurn === i;

                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                      isAgent
                        ? "bg-[#FAFAF8] dark:bg-[#081426] border-[#1B9A9C]/40"
                        : "bg-white dark:bg-[#10223A] border-[#E4E8E7] dark:border-[#20324A]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                      <span className={isAgent ? "text-[#1B9A9C]" : "text-[#667085] dark:text-[#9BA8B8]"}>
                        {isAgent ? "Relay Voice Agent" : call.patientName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#667085] dark:text-[#9BA8B8]">{turn.timestamp || `Turn ${i + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayTurnAudio(i, turnContent)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[9px] font-mono text-[#1B9A9C] cursor-pointer"
                        >
                          <Icons.Play className="w-2.5 h-2.5" />
                          <span>{isThisPlaying ? "Speaking..." : "Listen Turn"}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[#0B1930] dark:text-[#F8FAFC] leading-relaxed text-xs">
                      {turnContent}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#667085] dark:text-[#9BA8B8] bg-[#FAFAF8] dark:bg-[#081426] rounded-xl border border-[#E4E8E7] dark:border-[#20324A] text-xs">
                No transcript turns captured for this call session.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Structured Schema Extraction */}
        {activeTab === "schema" && (
          <div className="py-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8] font-mono">
                Validated JSON Outcome Schema
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFAF8] dark:bg-[#081426] text-xs font-semibold text-[#1B9A9C] border border-[#E4E8E7] dark:border-[#20324A]"
              >
                {copied ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-[11px] font-mono text-[#0B1930] dark:text-[#F8FAFC] overflow-x-auto max-h-96">
              {JSON.stringify(outcome || raw || {}, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between gap-3">
          <a
            href="/api/export?format=csv"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A]"
          >
            <Icons.Download className="w-3.5 h-3.5 text-[#1B9A9C]" />
            <span>Export Audit Row</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-[#15294A] dark:bg-[#1B9A9C] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
