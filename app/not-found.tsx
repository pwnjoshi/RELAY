"use client";

import React from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-[#1B9A9C]/20 transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-white/90 dark:bg-[#081426]/90 backdrop-blur-md px-6 sm:px-12 py-3.5 flex items-center justify-between">
        <RelayLogo size="md" />
        <Link
          href="/"
          className="text-xs font-semibold text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </header>

      {/* 404 Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-lg w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-8 sm:p-10 shadow-elevated text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-mono font-bold text-[#1B9A9C]">
              <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
              <span>SIP STATUS 404 &bull; ROUTE UNREACHABLE</span>
            </div>

            <h1 className="text-6xl font-heading font-black text-[#0B1930] dark:text-white tracking-tight">
              404
            </h1>

            <h2 className="text-lg font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              The requested voice trunk could not be located
            </h2>

            <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed max-w-sm mx-auto">
              The telephony endpoint, campaign, or configuration page you are looking for has been decommissioned or rerouted to a different branch.
            </p>
          </div>

          {/* Quick Reroute Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <Icons.Activity className="w-3.5 h-3.5 text-[#1B9A9C]" />
              <span>Operations Console</span>
            </Link>

            <Link
              href="/docs"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F3F5F4] dark:bg-[#081426] hover:bg-[#E4E8E7] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold border border-[#E4E8E7] dark:border-[#20324A] transition-all text-center flex items-center justify-center gap-2"
            >
              <Icons.FileText className="w-3.5 h-3.5 text-[#1B9A9C]" />
              <span>Documentation Hub</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] text-[11px] text-[#667085] dark:text-[#9BA8B8] flex items-center justify-between font-mono">
            <span>RELAY Autonomous PBX</span>
            <span className="text-[#16A34A] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Core Systems Online
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E8E7] dark:border-[#20324A] py-6 text-center text-xs text-[#667085] dark:text-[#9BA8B8]">
        &copy; 2026 Relay Voice Operations. Every call reaches the right outcome.
      </footer>
    </div>
  );
}
