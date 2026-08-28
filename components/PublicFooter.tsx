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
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-[#20324A] bg-[#081426] text-[#F8FAFC] selection:bg-[#1B9A9C]/20 transition-colors">
      {/* Top CTA Banner Strip */}
      <div className="border-b border-[#20324A] py-12 px-6 sm:px-12 bg-gradient-to-b from-[#0B1930] to-[#081426]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10223A] border border-[#20324A] text-xs font-mono font-bold text-[#1B9A9C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Zero Infrastructure Changes Required</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Ready to recover missed calls and automate phone bookings?
            </h3>
            <p className="text-xs sm:text-sm text-[#9BA8B8] leading-relaxed">
              Connect your existing business PBX or upload client recall spreadsheets in minutes.
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <Icons.Activity className="w-4 h-4" />
              <span>Launch Live Telephony Demo &rarr;</span>
            </Link>
            <Link
              href="/solutions"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#10223A] hover:bg-[#15294A] text-[#F8FAFC] border border-[#20324A] font-semibold text-xs transition-all text-center"
            >
              Explore Industry Solutions
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Navigation Directory */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        {/* Brand Column (2 cols wide on desktop) */}
        <div className="col-span-2 space-y-4">
          <RelayLogo size="md" variant="white" />
          <p className="text-xs text-[#9BA8B8] leading-relaxed max-w-sm">
            Relay is the enterprise autonomous voice operations platform designed to capture missed customer demand, automate multi-lingual batch recalls, and sync appointments with zero information leakage.
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs text-[#9BA8B8]">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#16A34A] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              SIP Gateway: 99.99% Uptime
            </span>
          </div>

          {/* Quick Newsletter Signup */}
          <div className="pt-3 max-w-sm space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA8B8] font-bold block">
              Subscribe to Voice AI Product Updates
            </span>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="bg-[#10223A] border border-[#20324A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#627284] outline-none focus:border-[#1B9A9C] w-full"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs transition-all flex-shrink-0 cursor-pointer"
              >
                Join
              </button>
            </form>
            {subscribed && (
              <span className="text-[11px] text-[#16A34A] font-mono font-semibold block animate-fade-in">
                &check; Thank you for subscribing to Relay updates!
              </span>
            )}
          </div>
        </div>

        {/* Solutions Column */}
        <div className="space-y-3">
          <span className="text-xs font-heading font-bold text-white uppercase tracking-wider font-mono">
            Solutions
          </span>
          <ul className="space-y-2 text-xs text-[#9BA8B8]">
            <li><Link href="/solutions" className="hover:text-white transition-colors">Healthcare & Clinics</Link></li>
            <li><Link href="/solutions" className="hover:text-white transition-colors">Automotive Dealerships</Link></li>
            <li><Link href="/solutions" className="hover:text-white transition-colors">Legal & Corporate Advisory</Link></li>
            <li><Link href="/solutions" className="hover:text-white transition-colors">24/7 Field & Emergency</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">7-Stage Voice Engine</Link></li>
          </ul>
        </div>

        {/* Trust & Security Column */}
        <div className="space-y-3">
          <span className="text-xs font-heading font-bold text-white uppercase tracking-wider font-mono">
            Trust & Security
          </span>
          <ul className="space-y-2 text-xs text-[#9BA8B8]">
            <li><Link href="/security" className="hover:text-white transition-colors">Calendar Privacy (Masked)</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">Fail-Closed Safety Engine</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">HIPAA Compliance Ready</Link></li>
            <li><Link href="/security" className="hover:text-white transition-colors">SOC-2 & Encryption</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Transparent Pricing</Link></li>
          </ul>
        </div>

        {/* Company & Resources Column */}
        <div className="space-y-3">
          <span className="text-xs font-heading font-bold text-white uppercase tracking-wider font-mono">
            Company & Resources
          </span>
          <ul className="space-y-2 text-xs text-[#9BA8B8]">
            <li><Link href="/about" className="hover:text-white transition-colors">About Relay Origin</Link></li>
            <li><Link href="/docs" className="hover:text-white transition-colors">Developer & API Docs</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">7-Stage Voice Engine</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><a href="https://docs.heycall-e.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1"><span>CALL-E Platform Docs</span> <Icons.ArrowUpRight className="w-3 h-3 text-[#1B9A9C]" /></a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright and Regulatory Legal Bar */}
      <div className="border-t border-[#20324A] py-6 px-6 sm:px-12 bg-[#06101E]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9BA8B8]">
          <div className="flex items-center gap-4 flex-wrap text-center md:text-left">
            <span>&copy; 2026 Relay Autonomous Voice Operations. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#9BA8B8]">
            <Link href="/security" className="hover:text-white transition-colors">Privacy & Compliance</Link>
            <Link href="/solutions" className="hover:text-white transition-colors">Enterprise Solutions</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Plans</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
