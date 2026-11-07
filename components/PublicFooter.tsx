"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RelayLogo } from "./RelayLogo";
import { Icons } from "./Icons";

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-[#E4E8E7] dark:border-[#1E3048] bg-white dark:bg-[#060D17] text-[#0B1930] dark:text-[#F8FAFC] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Mission Column */}
        <div className="lg:col-span-2 space-y-4">
          <RelayLogo size="md" />
          <p className="text-xs text-[#5B6B82] dark:text-[#94A3B8] max-w-sm leading-relaxed">
            Relay is the autonomous voice operations platform built on CALL-E. We handle inbound call overflow, patient recall campaigns, and multi-location scheduling with sub-second latency and verified EHR/CRM sync.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-[11px] font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>All Telephony Trunks Operational (99.99%)</span>
            </div>
          </div>
        </div>

        {/* Solutions Column */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5B6B82] dark:text-[#94A3B8]">
            Solutions
          </span>
          <ul className="space-y-2 text-xs text-[#5B6B82] dark:text-[#94A3B8]">
            <li><Link href="/solutions" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Healthcare & Dental Clinics</Link></li>
            <li><Link href="/solutions" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Automotive & Fleet Service</Link></li>
            <li><Link href="/solutions" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Legal & Corporate Advisory</Link></li>
            <li><Link href="/solutions" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Emergency Triage Protocol</Link></li>
            <li><Link href="/how-it-works" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">7-Stage Voice Architecture</Link></li>
          </ul>
        </div>

        {/* Security & Platform Column */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5B6B82] dark:text-[#94A3B8]">
            Security & Trust
          </span>
          <ul className="space-y-2 text-xs text-[#5B6B82] dark:text-[#94A3B8]">
            <li><Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Calendar Free/Busy Masking</Link></li>
            <li><Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Caller Phone Verification</Link></li>
            <li><Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">AES-256 Token Encryption</Link></li>
            <li><Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">HIPAA-Ready Architecture</Link></li>
            <li><Link href="/pricing" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Transparent Pricing</Link></li>
          </ul>
        </div>

        {/* Developer & Resources Column */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5B6B82] dark:text-[#94A3B8]">
            Developers
          </span>
          <ul className="space-y-2 text-xs text-[#5B6B82] dark:text-[#94A3B8]">
            <li><Link href="/docs" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">API Reference</Link></li>
            <li><Link href="/diagnostics" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Live Webhook Inspector</Link></li>
            <li><Link href="/about" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">About Relay</Link></li>
            <li><Link href="/login" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Console Sign In</Link></li>
            <li>
              <a
                href="https://docs.heycall-e.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0B1930] dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>CALL-E Docs</span>
                <Icons.ArrowUpRight className="w-3 h-3 text-[#1B9A9C] dark:text-[#2EC4C0]" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#E4E8E7] dark:border-[#1E3048] py-6 px-6 sm:px-10 lg:px-16 text-xs text-[#5B6B82] dark:text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Relay Telephony Operations. Powered by CALL-E.</p>
          <div className="flex items-center gap-6">
            <Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/security" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Security</Link>
            <Link href="/pricing" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-[#0B1930] dark:hover:text-white transition-colors">API Docs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
