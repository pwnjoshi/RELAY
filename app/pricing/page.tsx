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
  const [avgTicket, setAvgTicket] = useState(50); // USD base
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ROI calculations
  const recoveredRevenueUsd = Math.round(missedCalls * 0.42 * avgTicket);
  const monthlyCostProUsd = billingCycle === "annual" ? 119 : 139;
  const netRoiUsd = Math.max(0, recoveredRevenueUsd - monthlyCostProUsd);
  const roiMultiplier = ((recoveredRevenueUsd / monthlyCostProUsd) || 0).toFixed(1);

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
      badge: "RECOMMENDED",
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
        "Priority Carrier Trunk Interconnect"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Multi-Branch",
      badge: "NETWORKS",
      desc: "For enterprise healthcare networks, hospital systems, and multi-location corporate advisory practices.",
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
      a: "Yes. Our Excel Batch Engine allows you to drop any .xlsx or .csv sheet with client names, phone numbers, and care goals. Relay will autonomously dial each contact in their native language and log the confirmed appointment."
    },
    {
      q: "What happens if a caller has a critical medical or legal emergency?",
      a: "Relay utilizes a deterministic, fail-closed Zero-Harm safety engine. If distress keywords (e.g. severe pain, bleeding, acute distress) are detected, Relay immediately halts automated prompts and dispatches high-priority SMS alerts to your on-call supervisor."
    },
    {
      q: "Can I cancel or upgrade my subscription at any time?",
      a: "Yes. All plans are month-to-month with no lock-in contracts. You can upgrade, downgrade, or add credit minute top-ups directly from your console."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex flex-col animate-page-entrance">
        {/* Hero Section */}
        <section className="px-6 sm:px-10 lg:px-16 pt-16 pb-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] shadow-xs">
            <span>{currencyConfig.flag}</span>
            <span>Showing localized pricing for <strong>{detectedCountry}</strong> ({currencyConfig.code})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
            Predictable Pricing for Guaranteed Revenue Recovery
          </h1>

          <p className="text-sm sm:text-base text-[#5B6B82] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Zero per-seat penalties. Pay for the voice capacity you actually use, with sub-second answer guarantees and native multilingual speech.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-[#13243C] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs"
                    : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-white dark:bg-[#13243C] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs"
                    : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930]"
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full bg-[#16A34A] text-white text-[10px] font-mono font-bold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 sm:px-10 lg:px-16 py-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => {
              const priceUsd = billingCycle === "annual" ? p.priceAnnualUsd : p.priceMonthlyUsd;
              const formattedPrice = formatPrice(priceUsd);

              return (
                <div
                  key={p.id}
                  className={`rounded-xl p-6 sm:p-8 flex flex-col justify-between transition-colors border ${
                    p.popular
                      ? "bg-white dark:bg-[#0E1B2E] border-[#1B9A9C] dark:border-[#2EC4C0] shadow-sm relative ring-1 ring-[#1B9A9C] dark:ring-[#2EC4C0]"
                      : "bg-white dark:bg-[#0E1B2E] border-[#E4E8E7] dark:border-[#1E3048] shadow-xs"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1B9A9C] dark:bg-[#2EC4C0] text-white dark:text-[#081220] font-mono font-bold text-[10px] uppercase tracking-wider">
                      {p.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] tracking-wider uppercase">
                        {p.name}
                      </span>
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-4xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
                          {formattedPrice}
                        </span>
                        <span className="text-xs text-[#5B6B82] dark:text-[#94A3B8] font-medium">
                          / month
                        </span>
                      </div>
                      {billingCycle === "annual" && (
                        <div className="text-[10px] font-mono text-[#16A34A] font-semibold">
                          Billed annually (Save {formatPrice(p.priceMonthlyUsd * 12 - p.priceAnnualUsd * 12)}/yr)
                        </div>
                      )}
                      <p className="text-xs text-[#5B6B82] dark:text-[#94A3B8] leading-relaxed pt-2">
                        {p.desc}
                      </p>
                    </div>

                    {/* Capacity */}
                    <div className="p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] space-y-1 text-xs font-mono">
                      <div className="text-[#0B1930] dark:text-[#F8FAFC] font-semibold">
                        {p.minutes}
                      </div>
                      <div className="text-[11px] text-[#5B6B82] dark:text-[#94A3B8]">
                        {p.lines}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-2.5">
                        Plan Includes:
                      </div>
                      <ul className="space-y-2 text-xs">
                        {p.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#5B6B82] dark:text-[#94A3B8]">
                            <Icons.Check className="w-3.5 h-3.5 text-[#1B9A9C] dark:text-[#2EC4C0] flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/login"
                      className={`w-full py-2.5 rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        p.popular
                          ? "bg-[#1B9A9C] dark:bg-[#2EC4C0] text-white dark:text-[#081220] hover:bg-[#27B5B2]"
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

        {/* ROI Simulator */}
        <section className="px-6 sm:px-10 lg:px-16 py-14 max-w-5xl mx-auto w-full">
          <div className="bg-[#0B1930] dark:bg-[#0E1B2E] text-[#F8FAFC] border border-[#1E3048] rounded-2xl p-6 sm:p-10 space-y-8">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#081220] border border-[#1E3048] text-xs font-mono font-semibold text-[#2EC4C0]">
                <span>Interactive ROI Calculator ({currencyConfig.code})</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Estimate Recovered Revenue in {currencyConfig.name}
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Based on benchmark conversion averages (42% conversion rate for captured overflow calls and preventive recalls).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
              <div className="space-y-6 bg-[#081220] p-6 rounded-xl border border-[#1E3048]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label htmlFor="missedCallsInput" className="text-[#F8FAFC]">
                      Estimated Missed Calls per Month:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id="missedCallsInput"
                        type="number"
                        min="1"
                        max="10000"
                        value={missedCalls}
                        onChange={(e) => setMissedCalls(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2.5 py-1 rounded-lg bg-[#0E1B2E] border border-[#1E3048] focus:border-[#2EC4C0] text-right font-mono font-bold text-xs text-[#2EC4C0] outline-none"
                      />
                      <span className="font-mono text-xs text-[#94A3B8]">calls</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="1000"
                    step="5"
                    value={missedCalls}
                    onChange={(e) => setMissedCalls(Number(e.target.value))}
                    className="w-full accent-[#2EC4C0] cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label htmlFor="avgRevenueInput" className="text-[#F8FAFC]">
                      Average Revenue per Appointment:
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs text-[#94A3B8]">{currencyConfig.symbol}</span>
                      <input
                        id="avgRevenueInput"
                        type="number"
                        min="1"
                        max="5000000"
                        value={localTicketValue}
                        onChange={(e) => handleLocalTicketChange(parseFloat(e.target.value) || 1)}
                        className="w-24 px-2.5 py-1 rounded-lg bg-[#0E1B2E] border border-[#1E3048] focus:border-[#2EC4C0] text-right font-mono font-bold text-xs text-[#2EC4C0] outline-none"
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
                    className="w-full accent-[#2EC4C0] cursor-pointer"
                  />
                </div>

                <div className="pt-2 text-xs text-[#94A3B8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Relay Conversion Benchmark:</span>
                    <span className="font-mono font-bold text-white">42.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Answer Turnaround:</span>
                    <span className="font-mono font-bold text-white">&lt; 14s</span>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div className="p-6 sm:p-8 rounded-xl bg-[#081220] border border-[#1E3048] space-y-4 text-center">
                <span className="text-xs font-mono font-semibold text-[#94A3B8] uppercase tracking-wider block">
                  Estimated Monthly Revenue Recovered
                </span>
                <div className="text-4xl sm:text-5xl font-heading font-extrabold text-[#16A34A]">
                  {formatPrice(recoveredRevenueUsd)}
                </div>
                <div className="p-3 rounded-lg bg-[#0E1B2E] border border-[#1E3048] text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>Projected Annual Recaptured:</span>
                    <span className="text-white font-bold">{formatPrice(recoveredRevenueUsd * 12)} / yr</span>
                  </div>
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>Net Annual Profit Uplift:</span>
                    <span className="text-[#2EC4C0] font-bold">{formatPrice(netRoiUsd * 12)}</span>
                  </div>
                </div>
                <div className="text-xs text-[#94A3B8] flex items-center justify-center gap-4 pt-1 font-mono">
                  <span>ROI Multiple: <strong className="text-[#2EC4C0]">{roiMultiplier}x Return</strong></span>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B9A9C] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#27B5B2] text-white font-semibold text-xs shadow-xs transition-colors mt-2"
                >
                  <span>Launch Operations Console &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="px-6 sm:px-10 lg:px-16 py-12 max-w-4xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#5B6B82] dark:text-[#94A3B8]">
              Everything you need to know about Relay telephony, carrier interconnect, and privacy guardrails.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-[#E4E8E7] dark:border-[#1E3048] bg-white dark:bg-[#0E1B2E] overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] cursor-pointer hover:bg-[#FAFAF8] dark:hover:bg-[#081220] transition-colors"
                  >
                    <span>{f.q}</span>
                    <span className="text-base text-[#1B9A9C] dark:text-[#2EC4C0] font-mono">{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-[#5B6B82] dark:text-[#94A3B8] leading-relaxed border-t border-[#E4E8E7] dark:border-[#1E3048]">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
