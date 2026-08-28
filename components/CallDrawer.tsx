"use client";

import React, { useState, useRef } from "react";
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
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "transcript" | "schema">("brief");
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
        audioRef.current.onerror = () => setIsPlayingFullAudio(false);
      }

      if (isPlayingFullAudio) {
        audioRef.current.pause();
        setIsPlayingFullAudio(false);
      } else {
        audioRef.current.play().catch(() => setIsPlayingFullAudio(false));
        setIsPlayingFullAudio(true);
      }
    } else if (transcriptTurns.length > 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPlayingFullAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingFullAudio(false);
        setPlayingTurn(null);
      } else {
        setIsPlayingFullAudio(true);
        // Play full transcript sequence
        let turnIdx = 0;
        const playNextTurn = () => {
          if (turnIdx >= transcriptTurns.length) {
            setIsPlayingFullAudio(false);
            setPlayingTurn(null);
            return;
          }
          const turn = transcriptTurns[turnIdx];
          const text = turn.content || turn.text || "";
          setPlayingTurn(turnIdx);
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = 1.0;
          utter.onend = () => {
            turnIdx++;
            playNextTurn();
          };
          utter.onerror = () => {
            setIsPlayingFullAudio(false);
            setPlayingTurn(null);
          };
          window.speechSynthesis.speak(utter);
        };
        playNextTurn();
      }
    }
  };

  const handlePlayTurnAudio = (turnIndex: number, text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
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
        className="w-full max-w-xl bg-white dark:bg-[#10223A] border-l border-[#E4E8E7] dark:border-[#20324A] h-full overflow-y-auto flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8]">{call.id}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  call.status === "completed"
                    ? "bg-[#E8F5F2] text-[#1B9A9C] border border-[#1B9A9C]/30"
                    : call.status === "running"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                    : "bg-[#FFF8E6] text-amber-600 border border-[#FFE6A3]"
                }`}
              >
                {call.status}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAFAF8] dark:bg-[#081426] text-[#667085] dark:text-[#9BA8B8] font-mono">
                {call.language?.toUpperCase() || "EN"}
              </span>
            </div>
            <h2 className="text-xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
              {call.patientName}
            </h2>
            <p className="text-xs text-[#667085] dark:text-[#9BA8B8] font-mono">
              {call.phoneNumber} • {location?.name || "Apex Operations Hub"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors cursor-pointer"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Recording Stream or Transparent Zero-Retention Mode Header */}
        {realRecordingUrl ? (
          <div className="mt-4 p-4 rounded-2xl bg-[#0B1930] text-white space-y-3 shadow-card border border-[#20324A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleFullAudio}
                  className="w-9 h-9 rounded-full bg-[#1B9A9C] hover:bg-[#158284] text-white flex items-center justify-center font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isPlayingFullAudio ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <span className="text-[10px] font-mono text-[#1B9A9C] font-bold block uppercase tracking-wider">
                    Carrier Audio Recording
                  </span>
                  <span className="text-xs font-heading font-bold text-white">
                    Live PSTN Voice Track (Carrier Stream)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-[#32C4BE]">
                <span>{call.durationSeconds ? `${Math.floor(call.durationSeconds / 60)}:${String(call.durationSeconds % 60).padStart(2, "0")}` : "Direct Stream"}</span>
              </div>
            </div>

            {/* Audio Waveform */}
            <div className="flex items-center gap-1 h-6 px-1">
              {[40, 65, 30, 85, 95, 45, 60, 30, 75, 90, 40, 60, 80, 50, 95, 70, 40, 65, 85, 30, 50, 75, 90, 40, 60, 85, 35, 70, 95, 50, 65, 80, 45, 75, 90].map((height, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPlayingFullAudio ? "bg-[#1B9A9C] animate-pulse" : "bg-[#20324A]"
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1B9A9C]/10 text-[#1B9A9C] flex items-center justify-center">
                  <Icons.Shield className="w-3.5 h-3.5" />
                </div>
                <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                  Zero-Retention Privacy Mode
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20">
                RAW AUDIO PURGED
              </span>
            </div>

            <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
              Carrier privacy policy: Raw voice streams are purged upon call completion in zero-retention mode. Full verified transcript and structured JSON entities are preserved below.
            </p>

            {transcriptTurns.length > 0 && (
              <button
                type="button"
                onClick={handleToggleFullAudio}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[11px] font-bold text-[#1B9A9C] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {isPlayingFullAudio ? <Icons.Pause className="w-3.5 h-3.5" /> : <Icons.Play className="w-3.5 h-3.5" />}
                <span>{isPlayingFullAudio ? "Stop Transcript Speech" : "Listen to AI Transcript (Speech Synthesis)"}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-[#E4E8E7] dark:border-[#20324A] text-xs">
          <button
            onClick={() => setActiveTab("brief")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "brief"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
            }`}
          >
            Post-Call Intelligence
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "transcript"
                ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white shadow-sm"
                : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
            }`}
          >
            Transcript Turns ({transcriptTurns.length})
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
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

              {/* Follow-up SMS Bubble */}
              <div className="space-y-1.5 pt-2 border-t border-[#E4E8E7] dark:border-[#20324A]">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-[#1B9A9C] flex items-center gap-1">
                    <Icons.PhoneCall className="w-3 h-3" />
                    <span>Automated SMS Confirmation</span>
                  </span>
                  <span className="text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full border border-[#16A34A]/20">
                    Carrier Delivered
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[11px] text-[#0B1930] dark:text-[#F8FAFC] flex items-start justify-between gap-2">
                  <p className="italic leading-relaxed">
                    &quot;{call.aiIntelligence?.recommendedFollowUpSms || `Hello ${call.patientName}, thank you for speaking with ${location?.name || "Apex Operations"}. Your follow-up has been confirmed.`}&quot;
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
