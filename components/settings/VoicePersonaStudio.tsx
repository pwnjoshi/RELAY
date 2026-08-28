"use client";

import React, { useState } from "react";
import { Icons } from "@/components/Icons";

interface VoicePersonaStudioProps {
  persona: "empathetic" | "growth" | "technical";
  setPersona: (p: "empathetic" | "growth" | "technical") => void;
  latencyTier: number;
  setLatencyTier: (l: number) => void;
  greetingPhrase: string;
  setGreetingPhrase: (g: string) => void;
}

export function VoicePersonaStudio({
  persona,
  setPersona,
  latencyTier,
  setLatencyTier,
  greetingPhrase,
  setGreetingPhrase
}: VoicePersonaStudioProps) {
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  return (
    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B1930] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Icons.Zap className="w-5 h-5 text-[#1B9A9C]" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              AI Voice Persona & Dynamic Cadence Studio
            </h3>
            <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
              Tune conversational tone, target response latency, and opening phraseology.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/30">
          Powered by Amazon Bedrock & Neural Voice
        </span>
      </div>

      {/* Persona Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: "empathetic" as const,
            title: "Empathetic Care Coordinator",
            desc: "Warm active listening, gentle pacing, clinical reassurance. Best for healthcare, wellness & advisory.",
            icon: Icons.Activity
          },
          {
            id: "growth" as const,
            title: "High-Energy Growth Advisor",
            desc: "Enthusiastic, proactive objection handling, value-driven. Best for sales, auto fleets & customer leads.",
            icon: Icons.TrendingUp
          },
          {
            id: "technical" as const,
            title: "Precise Technical Consultant",
            desc: "Structured, concise facts, diagnostic focus. Best for software engineering & diagnostic dispatch.",
            icon: Icons.Cpu
          }
        ].map((item) => {
          const isSelected = persona === item.id;
          const ItemIcon = item.icon || Icons.Zap;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPersona(item.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? "bg-[#E8F5F2] dark:bg-[#1B9A9C]/15 border-[#1B9A9C] ring-2 ring-[#1B9A9C]/30 shadow-sm"
                  : "bg-[#FAFAF8] dark:bg-[#081426] border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ItemIcon className={`w-4 h-4 ${isSelected ? "text-[#1B9A9C]" : "text-[#667085]"}`} />
                  <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                    {item.title}
                  </span>
                </div>
                {isSelected && <span className="text-[10px] font-mono font-bold text-[#1B9A9C]">ACTIVE</span>}
              </div>
              <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Latency & Greeting Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
        <div className="space-y-2 p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]">
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Target Response Latency Threshold
            </label>
            <span className="font-mono font-bold text-[#1B9A9C]">{latencyTier}ms (Sub-second)</span>
          </div>
          <input
            type="range"
            min="80"
            max="300"
            step="20"
            value={latencyTier}
            onChange={(e) => setLatencyTier(Number(e.target.value))}
            className="w-full accent-[#1B9A9C] cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-[#667085] dark:text-[#9BA8B8] font-mono">
            <span>Ultra-Fast Intercept (80ms)</span>
            <span>Thoughtful Pacing (300ms)</span>
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]">
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Opening Greeting Phrase
            </label>
            <button
              type="button"
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="text-[11px] font-mono text-[#1B9A9C] hover:underline"
            >
              {showPromptPreview ? "Hide Preview" : "Preview Persona System Prompt"}
            </button>
          </div>
          <input
            type="text"
            value={greetingPhrase}
            onChange={(e) => setGreetingPhrase(e.target.value)}
            placeholder="e.g. Hello! I'm calling to help confirm your upcoming appointment."
            className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
          />
          <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
            Injected as the primary dynamic conversation starter for all outbound recall dispatches.
          </p>
        </div>
      </div>

      {showPromptPreview && (
        <div className="p-4 rounded-xl bg-[#081426] border border-[#1B9A9C]/30 text-[#F8FAFC] font-mono text-[11px] space-y-2 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#20324A]">
            <span className="text-[#32C4BE] font-bold">Dynamic Persona Directive: {persona.toUpperCase()}</span>
            <span className="text-[10px] text-[#9BA8B8]">Target Latency: {latencyTier}ms</span>
          </div>
          <p className="text-[#9BA8B8] leading-relaxed">
            {persona === "empathetic"
              ? "You are an empathetic, calm, and highly attentive coordinator. Always listen actively, validate patient comfort, and maintain warm feminine inflection."
              : persona === "growth"
              ? "You are an energetic, consultative growth partner. Focus on customer value, offer clear appointment options, and politely navigate scheduling objections."
              : "You are a precise technical advisor. Focus on diagnostic facts, system parameters, and exact appointment time slots."}
          </p>
        </div>
      )}
    </div>
  );
}
