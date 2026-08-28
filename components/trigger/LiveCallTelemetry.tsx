"use client";

import React from "react";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/types";

interface LiveCallTelemetryProps {
  progressPercent: number;
  dispatchStep: number;
  selectedLanguage: LanguageCode;
  fullE164Number: string;
}

export function LiveCallTelemetry({
  progressPercent,
  dispatchStep,
  selectedLanguage,
  fullE164Number
}: LiveCallTelemetryProps) {
  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || "Multilingual";

  return (
    <div className="p-4 rounded-2xl bg-[#081426] border border-[#1B9A9C]/40 space-y-3.5 shadow-elevated animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1B9A9C] animate-ping" />
          <span className="font-heading font-extrabold text-xs text-white">
            Live Telephony Handshake in Progress
          </span>
        </div>
        <span className="font-mono text-xs font-bold text-[#32C4BE]">
          {progressPercent}%
        </span>
      </div>

      {/* Glowing Progress Track */}
      <div className="w-full bg-[#10223A] h-2 rounded-full overflow-hidden border border-[#20324A]">
        <div
          className="h-full bg-gradient-to-r from-[#1B9A9C] to-[#32C4BE] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Dynamic Telemetry Steps */}
      <div className="space-y-2 pt-1 text-[11px]">
        <div className={`flex items-center gap-2.5 transition-all ${dispatchStep >= 1 ? "text-[#F8FAFC]" : "text-[#627284]"}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${dispatchStep > 1 ? "bg-[#16A34A] text-white" : dispatchStep === 1 ? "bg-[#1B9A9C] text-white animate-pulse" : "bg-[#20324A] text-[#9BA8B8]"}`}>
            {dispatchStep > 1 ? "✓" : "1"}
          </span>
          <span className={dispatchStep === 1 ? "font-bold text-[#32C4BE]" : ""}>
            Allocating Dedicated Carrier SIP Trunk (Sub-14s Latency)
          </span>
        </div>

        <div className={`flex items-center gap-2.5 transition-all ${dispatchStep >= 2 ? "text-[#F8FAFC]" : "text-[#627284]"}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${dispatchStep > 2 ? "bg-[#16A34A] text-white" : dispatchStep === 2 ? "bg-[#1B9A9C] text-white animate-pulse" : "bg-[#20324A] text-[#9BA8B8]"}`}>
            {dispatchStep > 2 ? "✓" : "2"}
          </span>
          <span className={dispatchStep === 2 ? "font-bold text-[#32C4BE]" : ""}>
            Synthesizing Neural Multilingual Voice ({langLabel})
          </span>
        </div>

        <div className={`flex items-center gap-2.5 transition-all ${dispatchStep >= 3 ? "text-[#F8FAFC]" : "text-[#627284]"}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${dispatchStep >= 4 ? "bg-[#16A34A] text-white" : dispatchStep === 3 ? "bg-[#1B9A9C] text-white animate-pulse" : "bg-[#20324A] text-[#9BA8B8]"}`}>
            {dispatchStep >= 4 ? "✓" : "3"}
          </span>
          <span className={dispatchStep === 3 ? "font-bold text-[#32C4BE]" : ""}>
            Dispatching Live Carrier Gateway to {fullE164Number}
          </span>
        </div>
      </div>
    </div>
  );
}
