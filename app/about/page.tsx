"use client";

import React from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-6 sm:px-12 pt-16 pb-12 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold text-[#1B9A9C]">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <span>Our Vision & Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
          Autonomous Voice Operations for Every Business
        </h1>

        <p className="text-sm sm:text-base text-[#667085] dark:text-[#9BA8B8] max-w-2xl mx-auto leading-relaxed">
          Relay is built on a fundamental principle: telephony should not be an unorganized stream of missed rings and lost revenue.
        </p>
      </section>

      {/* Main Philosophy Section */}
      <section className="px-6 sm:px-12 py-8 max-w-5xl mx-auto w-full space-y-8 flex-1">
        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-10 shadow-elevated space-y-6">
          <div className="space-y-3 pb-6 border-b border-[#E4E8E7] dark:border-[#20324A]">
            <h2 className="text-2xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              The Relay Philosophy
            </h2>
            <p className="text-sm text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
              In telecommunications and physics, a <strong className="text-[#0B1930] dark:text-[#F8FAFC]">relay</strong> is a device that receives an incoming signal, strengthens it, and delivers it cleanly to its destination.
            </p>
            <p className="text-sm text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
              We engineered Relay because businesses lose over 30% of incoming customer demand due to busy front desks, closed after-hours lines, and manual spreadsheet follow-ups that take days. Relay automates this entire chain into a deterministic 7-stage voice engine.
            </p>
          </div>

          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-1.5">
              <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] block">
                Zero Hold Time
              </span>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                Instant AI answering eliminates customer frustration and captures appointments in the moment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-1.5">
              <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] block">
                Multilingual Fluency
              </span>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                Fluent conversational speech in Hindi, Nepali, Spanish, and English breaks communication barriers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-1.5">
              <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] block">
                100% Auditable Sync
              </span>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                Every call produces structured JSON, recordings, and calendar reservations without manual data entry.
              </p>
            </div>
          </div>
        </div>

        {/* Hackathon Architecture Banner */}
        <div className="p-6 rounded-2xl bg-[#0B1930] text-[#F8FAFC] border border-[#20324A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-elevated">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#1B9A9C] uppercase">
              CALL-E Autonomous Telephony Platform
            </span>
            <div className="text-lg font-heading font-bold text-white">
              Enterprise Voice Telephony Integration
            </div>
          </div>
          <Link
            href="/how-it-works"
            className="px-5 py-2.5 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs shadow-sm transition-all flex-shrink-0"
          >
            Explore 7-Stage Architecture &rarr;
          </Link>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
