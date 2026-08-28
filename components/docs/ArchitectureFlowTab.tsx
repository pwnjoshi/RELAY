"use client";

import React from "react";
import { Icons } from "@/components/Icons";

export function ArchitectureFlowTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
          System Architecture & Telephony Protocol
        </h1>
        <p className="text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
          How RELAY orchestrates sub-second voice synthesis, live web grounding, and multi-tenant EHR privacy.
        </p>
      </div>

      {/* High-Level Architecture Flowchart Diagram */}
      <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 space-y-6 shadow-subtle">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
            End-to-End Realtime Telephony & RAG Sync Topology
          </span>
          <span className="text-[10px] font-mono text-[#16A34A] font-bold bg-[#16A34A]/10 px-2 py-0.5 rounded">
            HTTP / WebSocket / SIP Interconnect
          </span>
        </div>

        {/* Flow Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative text-xs">
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1B9A9C]">
              <span>STAGE 01</span>
              <Icons.PhoneCall className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-[#0B1930] dark:text-white">1. Trigger & Interconnect</div>
            <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              Inbound PSTN ring, REST API trigger, or scheduled Excel batch campaign.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#32C4BE]">
              <span>STAGE 02</span>
              <Icons.Zap className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-[#0B1930] dark:text-white">2. Neural Voice & Web RAG</div>
            <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              24kHz Opus audio stream + real-time website knowledge retrieval.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1B9A9C]">
              <span>STAGE 03</span>
              <Icons.Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-[#0B1930] dark:text-white">3. Privacy Free/Busy Check</div>
            <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              Strict temporal privacy masking for calendar availability & EHR slots.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#16A34A]">
              <span>STAGE 04</span>
              <Icons.Check className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-[#0B1930] dark:text-white">4. Fact Extract & CRM Sync</div>
            <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              Extracts JSON facts, lead score, and dispatches webhook notifications.
            </div>
          </div>
        </div>
      </div>

      {/* Data Isolation & Security Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
          <div className="flex items-center gap-2 font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
            <Icons.Shield className="w-4 h-4 text-[#1B9A9C]" />
            <span>Multi-Tenant Enterprise Isolation</span>
          </div>
          <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
            Each corporate entity operates inside an isolated workspace context with isolated call records, staff roles, and vector search embeddings.
          </p>
        </div>

        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
          <div className="flex items-center gap-2 font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
            <Icons.Lock className="w-4 h-4 text-[#16A34A]" />
            <span>Privacy-Preserving Free/Busy Masking</span>
          </div>
          <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
            Only open time windows are exposed to conversational agents. Caller PII and confidential notes are never leaked between tenant environments.
          </p>
        </div>
      </div>
    </div>
  );
}
