"use client";

import React from "react";
import { Icons } from "./Icons";

export function SafetyBanner() {
  return (
    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-3 shadow-subtle">
      <div className="flex items-center gap-2">
        <Icons.Shield className="w-4 h-4 text-[#1B9A9C]" />
        <h3 className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
          Priority Guardrails & Urgent Escalation
        </h3>
      </div>

      <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
        Strict safety boundaries enforced. If callers express critical distress or urgent high-priority escalations, Relay halts automated scripts and dispatches immediate SMS alerts to on-call directors.
      </p>

      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#16A34A] pt-1 border-t border-[#E4E8E7] dark:border-[#20324A]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Zero-Harm Protocol Active
        </span>
        <span className="text-[#667085] dark:text-[#9BA8B8]">100% Fail-Closed</span>
      </div>
    </div>
  );
}
