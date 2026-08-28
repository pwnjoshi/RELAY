"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";
import { useCurrency } from "@/lib/currency";

export default function PublicPricingPage() {
  const { formatPrice, currencyConfig, detectedCountry } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [missedCalls, setMissedCalls] = useState(20);
  const [avgTicket, setAvgTicket] = useState(50); // in USD base
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations for ROI Guarantee
  const recoveredRevenueUsd = Math.round(missedCalls * 0.42 * avgTicket);
  const monthlyCostProUsd = billingCycle === "annual" ? 119 : 139;
  const netRoiUsd = Math.max(0, recoveredRevenueUsd - monthlyCostProUsd);
  const roiMultiplier = ((recoveredRevenueUsd / monthlyCostProUsd) || 0).toFixed(1);

  // Local currency ticket value
  const localTicketValue = Math.round(avgTicket * currencyConfig.rate);

  const handleLocalTicketChange = (val: number) => {
    const safeVal = Math.max(1, isNaN(val) ? 1 : val);
    setAvgTicket(safeVal / currencyConfig.rate);
  };

  const plans = [
    {
      id: "starter",
      name: "Starter Clinic",
      badge: "SINGLE LOCATION",
      desc: "For independent practices and single-office clinics looking to eliminate hold times and capture missed calls.",
      priceMonthlyUsd: 49,
      priceAnnualUsd: 39,
      minutes: "400 Voice Minutes / mo",
      lines: "1 Dedicated SIP Line",
      popular: false,
      cta: "Start 14-Day Free Trial",
      features: [
        "Instant Zero-Latency Answering",
        "Bilingual English & Spanish Voice",
        "Google Calendar Free/Busy Slot Booking",
        "Basic SMS Appointment Confirmations",
        "Standard Business Hours Schedule",
        "Email & Community Support"
      ]
    },
    {
      id: "growth",
      name: "Professional Growth",
      badge: "MOST POPULAR",
      desc: "For high-volume practices, multi-specialty clinics, and auto dealerships running active outbound recall campaigns.",
      priceMonthlyUsd: 139,
      priceAnnualUsd: 119,
      minutes: "1,500 Voice Minutes / mo",
      lines: "Up to 5 Dedicated SIP Lines",
      popular: true,
      cta: "Launch Live Telephony Plan",
      features: [
        "Everything in Starter, plus:",
        "Multilingual AI in Hindi, Nepali, Spanish & English",
        "Automated Excel / CSV Batch Follow-up Engine",
        "Two-Way Zero-Information Leakage Calendar Sync",
        "Fail-Closed Emergency Guardrails & SMS Dispatch",
        "Departmental Routing & Role-Based Access Control",
        "Priority Slack & Telephony Carrier Support"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Multi-Branch",
      badge: "MULTI-LOCATION NETWORKS",
      desc: "For enterprise healthcare hospital chains, dealership networks, and national corporate advisory firms.",
      priceMonthlyUsd: 499,
      priceAnnualUsd: 399,
      minutes: "6,000 Voice Minutes / mo",
      lines: "Unlimited Branch SIP Trunks",
      popular: false,
      cta: "Contact Enterprise Sales",
      features: [
        "Everything in Professional Growth, plus:",
        "Custom Fine-Tuned Domain Voice Models",
        "Direct EHR (AthenaHealth / Epic / Dentrix) Integrations",
        "Dedicated Low-Latency SIP Trunk Carrier Interconnect",
        "Custom SLA (99.99% Guaranteed Telephony Uptime)",
        "Dedicated Solutions Architect & 24/7 Phone Support",
        "Custom Business Associate Agreement (BAA / HIPAA)"
      ]
    }
  ];

  const faqs = [
    {
      q: "How does Relay connect to my existing business phone system?",
      a: "Relay connects via SIP forwarding or direct carrier interconnect (Twilio, Telnyx, Asterisk, FreePBX). You simply configure a call forwarding rule on your existing PBX when lines ring past your desired threshold (e.g. 3 rings)."
    },
    {
      q: "Does Relay expose private Google Calendar details to callers?",
      a: "Never. Relay enforces strict Zero-Information Leakage privacy masking. When checking availability, your private meetings, subjects, attendee names, and descriptions are strictly treated as 'BUSY'. Callers only learn whether a slot is open or unavailable."
    },
    {
      q: "Can I upload my own patient or client spreadsheets for outbound follow-ups?",
      a: "Yes! Our Excel Batch Engine allows you to drop any .xlsx or .csv sheet with client names, phone numbers, and care goals. Relay will autonomously dial each contact in their native language and log the confirmed appointment."
    },
    {
      q: "What happens if a caller has a critical medical or legal emergency?",
      a: "Relay utilizes a deterministic, fail-closed Zero-Harm safety engine. If distress keywords (e.g. severe pain, bleeding, emergency) are detected, Relay immediately halts automated prompts and dispatches high-priority SMS alerts to your on-call supervisor."
    },
    {
      q: "Can I cancel or upgrade my subscription at any time?",
      a: "Yes. All plans are month-to-month with no lock-in contracts. You can upgrade, downgrade, or add credit minute top-ups directly from your console."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors overflow-x-clip animate-page-entrance">
      {/* 1. Public Header */}
      <PublicHeader />

      {/* 2. Hero Section */}
      <section className="px-6 sm:px-12 pt-16 pb-10 max-w-5xl mx-auto text-center space-y-4">
        {/* Geo-Currency Auto-Detection Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] shadow-sm">
          <span className="text-base">{currencyConfig.flag}</span>
          <span>Showing real-time localized pricing for <strong>{detectedCountry}</strong> ({currencyConfig.code})</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
          Predictable Telephony Pricing for Guaranteed Revenue Recovery
        </h1>

        <p className="text-sm sm:text-base text-[#667085] dark:text-[#9BA8B8] max-w-2xl mx-auto leading-relaxed">
          Zero per-seat penalties. Pay for the voice capacity you actually use, with instant answer guarantees and native multilingual speech.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F4F6F5]/90 dark:bg-[#0E1E36]/90 border border-[#E2E8E7] dark:border-[#1E324F] shadow-inner backdrop-blur-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-[#162A48] text-[#0B1930] dark:text-[#F8FAFC] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.35)] border border-[#E2E8E7]/90 dark:border-[#2A4368]"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white hover:bg-white/40 dark:hover:bg-[#162A48]/40"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-[#162A48] text-[#0B1930] dark:text-[#F8FAFC] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.35)] border border-[#E2E8E7]/90 dark:border-[#2A4368]"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white hover:bg-white/40 dark:hover:bg-[#162A48]/40"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[10px] font-mono font-bold shadow-sm">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Pricing Cards Grid */}
      <section className="px-6 sm:px-12 py-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const priceUsd = billingCycle === "annual" ? p.priceAnnualUsd : p.priceMonthlyUsd;
            const formattedPrice = formatPrice(priceUsd);

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all border ${
                  p.popular
                    ? "bg-white dark:bg-[#10223A] border-[#1B9A9C] ring-2 ring-[#1B9A9C]/20 shadow-elevated relative"
                    : "bg-white dark:bg-[#10223A] border-[#E4E8E7] dark:border-[#20324A] shadow-card hover:border-[#0B1930]"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1B9A9C] text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#1B9A9C] tracking-wider uppercase">
                      {p.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-4xl font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">
                        {formattedPrice}
                      </span>
                      <span className="text-xs text-[#667085] dark:text-[#9BA8B8] font-semibold">
                        / month
                      </span>
                    </div>
                    {billingCycle === "annual" && (
                      <div className="text-[10px] font-mono text-[#16A34A] font-bold">
                        Billed annually (Save {formatPrice(p.priceMonthlyUsd * 12 - p.priceAnnualUsd * 12)}/yr)
                      </div>
                    )}
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed pt-2">
                      {p.desc}
                    </p>
                  </div>

                  {/* Included Capacity Stats */}
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-[#0B1930] dark:text-[#F8FAFC] font-bold">
                      <span>{p.minutes}</span>
                    </div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                      {p.lines}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-2.5">
                      Plan Includes:
                    </div>
                    <ul className="space-y-2 text-xs">
                      {p.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#667085] dark:text-[#9BA8B8]">
                          <Icons.Check className="w-4 h-4 text-[#1B9A9C] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/login"
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      p.popular
                        ? "bg-[#1B9A9C] hover:bg-[#27B5B2] text-white"
                        : "bg-[#0B1930] hover:bg-[#15294A] text-white"
                    }`}
                  >
                    <span>{p.cta} &rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive ROI Recovery Simulator (Localized & Manual Input Supported) */}
      <section className="px-6 sm:px-12 py-16 max-w-5xl mx-auto w-full">
        <div className="bg-[#0B1930] text-[#F8FAFC] border border-[#20324A] rounded-2xl p-6 sm:p-10 shadow-elevated space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10223A] border border-[#20324A] text-xs font-mono font-bold text-[#1B9A9C]">
              <span>Interactive ROI Calculator ({currencyConfig.code})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              See How Much Missed Revenue Relay Recovers in {currencyConfig.name}
            </h2>
            <p className="text-xs text-[#9BA8B8] leading-relaxed">
              Based on industry benchmark averages (42% conversion rate for captured overflow calls and preventive recalls).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            {/* Left Controls with Manual Inputs and Sliders */}
            <div className="space-y-6 bg-[#081426] p-6 rounded-xl border border-[#20324A]">
              {/* Missed Calls Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="missedCallsInput" className="text-[#F8FAFC]">Estimated Missed Calls per Month:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="missedCallsInput"
                      type="number"
                      min="1"
                      max="10000"
                      value={missedCalls}
                      onChange={(e) => setMissedCalls(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-2.5 py-1 rounded-lg bg-[#10223A] border border-[#20324A] focus:border-[#1B9A9C] text-right font-mono font-bold text-sm text-[#32C4BE] outline-none"
                    />
                    <span className="font-mono text-xs text-[#9BA8B8]">calls</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={missedCalls}
                  onChange={(e) => setMissedCalls(Number(e.target.value))}
                  className="w-full accent-[#1B9A9C] cursor-pointer"
                />
              </div>

              {/* Revenue per Appointment Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="avgRevenueInput" className="text-[#F8FAFC]">Average Revenue per Client / Appointment:</label>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-[#9BA8B8]">{currencyConfig.symbol}</span>
                    <input
                      id="avgRevenueInput"
                      type="number"
                      min="1"
                      max="5000000"
                      value={localTicketValue}
                      onChange={(e) => handleLocalTicketChange(parseFloat(e.target.value) || 1)}
                      className="w-28 px-2.5 py-1 rounded-lg bg-[#10223A] border border-[#20324A] focus:border-[#1B9A9C] text-right font-mono font-bold text-sm text-[#32C4BE] outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1500"
                  step="10"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full accent-[#1B9A9C] cursor-pointer"
                />
              </div>

              <div className="pt-2 text-xs text-[#9BA8B8] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Relay Conversion Benchmark:</span>
                  <span className="font-mono font-bold text-white">42.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Answer Turnaround:</span>
                  <span className="font-mono font-bold text-white">&lt; 14.2s</span>
                </div>
              </div>
            </div>

            {/* Right Result Card */}
            <div className="p-6 sm:p-8 rounded-xl bg-[#10223A] border border-[#20324A] space-y-4 text-center">
              <span className="text-xs font-mono font-bold text-[#9BA8B8] uppercase tracking-wider block">
                Estimated Monthly Revenue Recovered
              </span>
              <div className="text-4xl sm:text-5xl font-heading font-black text-[#16A34A]">
                {formatPrice(recoveredRevenueUsd)}
              </div>
              <div className="p-3 rounded-lg bg-[#081426] border border-[#20324A] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-[#9BA8B8]">
                  <span>Projected Annual Recaptured:</span>
                  <span className="text-white font-bold">{formatPrice(recoveredRevenueUsd * 12)} / yr</span>
                </div>
                <div className="flex items-center justify-between text-[#9BA8B8]">
                  <span>Net Annual Profit Uplift:</span>
                  <span className="text-[#32C4BE] font-bold">{formatPrice(netRoiUsd * 12)}</span>
                </div>
              </div>
              <div className="text-xs text-[#9BA8B8] flex items-center justify-center gap-4 pt-1 font-mono">
                <span>ROI Multiple: <strong className="text-[#32C4BE]">{roiMultiplier}x Return</strong></span>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B9A9C] hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card transition-all active:scale-95 mt-2"
              >
                <span>Launch Operations Console & Recapture Revenue &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="px-6 sm:px-12 py-12 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
            Everything you need to know about Relay telephony, carrier interconnect, and privacy guardrails.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-[#E4E8E7] dark:border-[#20324A] bg-white dark:bg-[#10223A] overflow-hidden transition-all shadow-subtle"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC] cursor-pointer hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                >
                  <span>{f.q}</span>
                  <span className="text-base text-[#1B9A9C] font-mono">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed border-t border-[#E4E8E7]/50 dark:border-[#20324A]/50">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Footer */}
      <PublicFooter />
    </div>
  );
}
