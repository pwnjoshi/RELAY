"use client";

import React from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function SecurityPage() {
  const pillars = [
    {
      icon: Icons.Lock,
      title: "Zero-Information Leakage Calendar Sync",
      desc: "When Relay or callers query Google Calendar availability, external meeting details (attendee names, meeting titles, video links, internal notes) are strictly masked as 'BUSY'.",
      badge: "CALENDAR PRIVACY"
    },
    {
      icon: Icons.Shield,
      title: "Zero-Harm & Fail-Closed Emergency Routing",
      desc: "If high-urgency keywords (severe pain, bleeding, legal emergency, panic) are detected, Relay immediately halts automated dialogue and dispatches priority SMS alerts to on-call directors.",
      badge: "100% FAIL-CLOSED"
    },
    {
      icon: Icons.ShieldAlert,
      title: "HIPAA & SOC-2 Compliance Architecture",
      desc: "All audio streams, customer transcripts, and database records are encrypted in transit with TLS 1.3 and at rest with AES-256 encryption. Full audit logging is maintained.",
      badge: "ENTERPRISE COMPLIANT"
    },
    {
      icon: Icons.Users,
      title: "Granular Role-Based Access Control (RBAC)",
      desc: "Staff access is restricted by department and clearance level. Marketing operators cannot view private clinical consultation notes; front desk staff only view active triage queues.",
      badge: "RBAC ENFORCED"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-6 sm:px-12 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold text-[#1B9A9C]">
          <Icons.Shield className="w-3.5 h-3.5" />
          <span>Security & Compliance Center</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
          Enterprise Security, Calendar Privacy & Fail-Closed Guardrails
        </h1>

        <p className="text-sm sm:text-base text-[#667085] dark:text-[#9BA8B8] max-w-2xl mx-auto leading-relaxed">
          Relay is architected for strict clinical, legal, and enterprise data confidentiality. We enforce deterministic privacy controls and fail-closed safety protocols on every voice stream.
        </p>
      </section>

      {/* 4 Pillars Grid */}
      <section className="px-6 sm:px-12 py-8 max-w-6xl mx-auto w-full flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-8 shadow-elevated space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-center text-[#1B9A9C]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAFAF8] dark:bg-[#081426] text-[#1B9A9C] border border-[#E4E8E7] dark:border-[#20324A]">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E4E8E7] dark:border-[#20324A] flex items-center gap-2 text-[11px] font-mono text-[#16A34A] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>Enforced Deterministically</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Privacy Visualizer Card */}
        <div className="bg-[#0B1930] border border-[#20324A] rounded-2xl p-6 sm:p-8 text-[#F8FAFC] space-y-5 shadow-elevated">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#1B9A9C] uppercase tracking-wider">
              Verification Example: What Google Calendar Exposes vs. What Relay Hides
            </span>
            <h3 className="text-xl font-heading font-bold text-white">
              Zero Information Leakage Guarantee
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#081426] border border-rose-900/40 space-y-2">
              <span className="text-rose-400 font-bold uppercase text-[10px] block">
                ❌ Unsafe Legacy Integrations (Exposes Private Data)
              </span>
              <p className="text-[#9BA8B8] leading-relaxed">
                &quot;Dr. Arthur is meeting with Patient John Doe regarding root canal surgery at 10:00 AM.&quot;
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#081426] border border-[#16A34A]/40 space-y-2">
              <span className="text-[#16A34A] font-bold uppercase text-[10px] block">
                ✅ Relay Zero-Leakage Engine (100% Masked)
              </span>
              <p className="text-[#32C4BE] leading-relaxed">
                &quot;10:00 AM &ndash; 11:00 AM: BUSY (No caller details or meeting subjects disclosed). Next open slot: 11:30 AM.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
