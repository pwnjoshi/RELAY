"use client";

import React from "react";
import { Icons } from "@/components/Icons";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function SecurityPage() {
  const pillars = [
    {
      icon: Icons.Lock,
      title: "Zero-Information Leakage Calendar Sync",
      desc: "When Relay or callers query Google Calendar availability, external meeting details (attendee names, event subjects, internal notes) are strictly masked as 'BUSY'.",
      badge: "CALENDAR PRIVACY"
    },
    {
      icon: Icons.Shield,
      title: "Zero-Harm & Fail-Closed Emergency Routing",
      desc: "If high-urgency keywords (severe pain, acute trauma, breathing distress, chest pain) are detected, Relay immediately halts automated dialogue and triggers urgent escalation alerts to on-call directors.",
      badge: "FAIL-CLOSED PROTOCOL"
    },
    {
      icon: Icons.ShieldAlert,
      title: "HIPAA & SOC-2 Compliant Architecture",
      desc: "All audio streams, customer transcripts, and database records are encrypted in transit with TLS 1.3 and at rest with AES-256 encryption. Immutable audit logging is maintained for every turn.",
      badge: "ENTERPRISE SECURITY"
    },
    {
      icon: Icons.Users,
      title: "Granular Role-Based Access Control (RBAC)",
      desc: "Staff access is restricted by department and clearance level. General operators cannot view restricted clinical notes, ensuring strict internal privilege separation.",
      badge: "RBAC ENFORCED"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex flex-col animate-page-entrance">
        {/* Hero Section */}
        <section className="px-6 sm:px-10 lg:px-16 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-semibold text-[#1B9A9C] dark:text-[#2EC4C0]">
            <Icons.Shield className="w-3.5 h-3.5" />
            <span>Security & Compliance Center</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
            Enterprise Security, Calendar Privacy & Fail-Closed Guardrails
          </h1>

          <p className="text-sm sm:text-base text-[#5B6B82] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Relay is architected for strict clinical, legal, and enterprise data confidentiality. We enforce deterministic privacy controls and fail-closed safety protocols on every voice stream.
          </p>
        </section>

        {/* 4 Pillars Grid */}
        <section className="px-6 sm:px-10 lg:px-16 py-8 max-w-6xl mx-auto w-full flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-xl p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F5F4] dark:bg-[#13243C] border border-[#E4E8E7] dark:border-[#1E3048] flex items-center justify-center text-[#1B9A9C] dark:text-[#2EC4C0]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FAFAF8] dark:bg-[#081220] text-[#1B9A9C] dark:text-[#2EC4C0] border border-[#E4E8E7] dark:border-[#1E3048]">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      {p.title}
                    </h3>

                    <p className="text-xs text-[#5B6B82] dark:text-[#94A3B8] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E4E8E7] dark:border-[#1E3048] flex items-center gap-2 text-[11px] font-mono text-[#16A34A] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    <span>Enforced Deterministically</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Privacy Visualizer Card */}
          <div className="bg-[#0B1930] dark:bg-[#0E1B2E] border border-[#1E3048] rounded-xl p-6 sm:p-8 text-[#F8FAFC] space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold text-[#2EC4C0] uppercase tracking-wider">
                Verification Architecture: What Calendars Expose vs. What Relay Discloses
              </span>
              <h3 className="text-xl font-heading font-bold text-white">
                Zero Information Leakage Guarantee
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#081220] border border-rose-900/40 space-y-2">
                <span className="text-rose-400 font-semibold uppercase text-[10px] flex items-center gap-1.5">
                  <Icons.Close className="w-3.5 h-3.5 text-rose-400" />
                  <span>Unsafe Integrations (Exposes Private Data)</span>
                </span>
                <p className="text-[#94A3B8] leading-relaxed">
                  &quot;Dr. Sarah is meeting with Patient John Doe regarding root canal surgery at 10:00 AM.&quot;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#081220] border border-[#16A34A]/40 space-y-2">
                <span className="text-[#16A34A] font-semibold uppercase text-[10px] flex items-center gap-1.5">
                  <Icons.Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Relay Zero-Leakage Engine (100% Masked)</span>
                </span>
                <p className="text-[#2EC4C0] leading-relaxed">
                  &quot;10:00 AM &ndash; 11:00 AM: BUSY (No caller details or meeting subjects disclosed). Next open slot: 11:30 AM.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
