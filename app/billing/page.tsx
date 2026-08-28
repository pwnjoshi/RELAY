"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { DashboardStats, ClinicLocation } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { useCurrency } from "@/lib/currency";
import { ConsoleSkeleton } from "@/components/ConsoleSkeleton";
import { AuthGuard } from "@/components/AuthGuard";

export default function BillingPage() {
  const { formatPrice, currencyConfig } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("scale");
  const [topupSuccessMsg, setTopupSuccessMsg] = useState("");
  const [autoReplenish, setAutoReplenish] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations")
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
    } catch (err) {
      console.error("Error loading billing data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBuyTopup = (mins: number, usd: number) => {
    setTopupSuccessMsg(`Successfully added ${mins} Voice Minutes (${formatPrice(usd)}) to your pooled account.`);
    setTimeout(() => setTopupSuccessMsg(""), 4000);
  };

  const plans = [
    {
      id: "starter",
      name: "Starter Operations",
      priceUsd: 49,
      period: "/month",
      desc: "Ideal for single-location businesses capturing missed front-desk customer overflow.",
      features: [
        "1 Branch PBX SIP Trunk",
        "400 Inbound Voice Minutes",
        "CRM & Database Sync",
        "English & Spanish AI Agents",
        "Standard Business Hours Routing",
        "Instant Email & SMS Alerts"
      ],
      popular: false
    },
    {
      id: "scale",
      name: "Multi-Branch Pro",
      priceUsd: 139,
      period: "/month",
      desc: "For growing organizations running inbound overflow & automated Excel batch campaigns.",
      features: [
        "Up to 5 Branch Trunks & SIP Extensions",
        "1,500 Voice Minutes Included",
        "Excel Batch Dialing Engine",
        "7 Native Languages (HI, NE, ES, EN)",
        "24/7 After-Hours Triage & Escalation",
        "Department-level Quotas & Role IAM"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise Fleet",
      priceUsd: 499,
      period: "/month",
      desc: "For multi-location regional networks requiring custom carrier SIP & dedicated SLAs.",
      features: [
        "Unlimited Branch Telephony Nodes",
        "6,000 Voice Minutes Pool",
        "Dedicated Low-Latency SIP Trunk",
        "Custom Voice Domain Models",
        "HIPAA / SOC2 BAA Agreement",
        "24/7 Priority SLA & Carrier Engineer"
      ],
      popular: false
    }
  ];

  return (
    <AuthGuard allowedRoles={["owner"]}>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="Billing, Minutes & Carrier Plans"
          badge="AUTOMATIC TOP-UP"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          {!stats ? (
            <ConsoleSkeleton type="cards" />
          ) : (
            <>
              {/* Top Usage Overview Banner */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
                    <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      Active Telephony Plan: Multi-Branch Pro ({currencyConfig.code})
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                    Month-to-month subscription with no lock-in contracts. Upgrade, downgrade, or cancel anytime.
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#98A2B3] block font-mono">Used Minutes</span>
                    <span className="text-lg font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">1,280 / 2,000</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#98A2B3] block font-mono">Recovered Value</span>
                    <span className="text-lg font-heading font-black text-[#1B9A9C]">
                      {formatPrice(stats.totalRevenueRecovered)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Credit & Minutes Top-Up Card */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-2">
                      <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C]" />
                      <span>Instant Voice Minute Top-Ups</span>
                    </h3>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-0.5">
                      Need extra capacity for large batch campaigns? Purchase rollover minutes with no expiration.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoReplenish}
                        onChange={(e) => setAutoReplenish(e.target.checked)}
                        className="accent-[#1B9A9C]"
                      />
                      <span>Auto-Replenish at &lt; 100 mins</span>
                    </label>
                  </div>
                </div>

                {topupSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[#16A34A] font-bold animate-fade-in flex items-center gap-2">
                    <Icons.Check className="w-4 h-4" />
                    <span>{topupSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { mins: 250, usd: 25, label: "250 Minutes" },
                    { mins: 600, usd: 50, label: "600 Minutes" },
                    { mins: 1500, usd: 100, label: "1,500 Minutes" },
                    { mins: 4000, usd: 250, label: "4,000 Minutes" }
                  ].map((top) => (
                    <button
                      key={top.mins}
                      type="button"
                      onClick={() => handleBuyTopup(top.mins, top.usd)}
                      className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-left transition-all active:scale-95 cursor-pointer shadow-subtle group"
                    >
                      <div className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC] group-hover:text-[#1B9A9C] transition-colors">
                        +{top.label}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#1B9A9C] pt-1">
                        {formatPrice(top.usd)}
                      </div>
                      <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8] font-mono pt-1">
                        1-Click Instant Add &rarr;
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Plans Grid */}
              <div className="space-y-4">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-2xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                    Transparent Telephony Pricing ({currencyConfig.code})
                  </h2>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                    Every plan includes zero-latency SIP connectivity, call transcripts, and structured database synchronization.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {plans.map((p) => {
                    const isSelected = selectedPlan === p.id;
                    const formattedPrice = formatPrice(p.priceUsd);

                    return (
                      <div
                        key={p.id}
                        className={`bg-white dark:bg-[#10223A] border rounded-2xl p-6 space-y-5 transition-all shadow-subtle flex flex-col justify-between ${
                          p.popular
                            ? "border-[#0B1930] dark:border-[#32C4BE] ring-1 ring-[#0B1930] dark:ring-[#32C4BE]"
                            : "border-[#E4E8E7] dark:border-[#20324A] hover:border-[#0B1930]"
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-heading font-bold text-base text-[#0B1930] dark:text-[#F8FAFC]">{p.name}</h3>
                            {p.popular && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0B1930] text-white">
                                POPULAR
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">{formattedPrice}</span>
                            <span className="text-xs text-[#667085] dark:text-[#9BA8B8] font-semibold">{p.period}</span>
                          </div>

                          <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">{p.desc}</p>

                          <ul className="space-y-2.5 pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] text-xs">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-[#0B1930] dark:text-[#F8FAFC]">
                                <Icons.Check className="w-4 h-4 text-[#1B9A9C] flex-shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedPlan(p.id)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all mt-6 active:scale-95 cursor-pointer ${
                            isSelected
                              ? "bg-[#0B1930] hover:bg-[#15294A] text-white"
                              : "bg-[#F3F5F4] dark:bg-[#081426] hover:bg-[#E4E8E7] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A]"
                          }`}
                        >
                          {isSelected ? "Current Active Plan" : "Switch to " + p.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <TriggerModal
        isOpen={isTriggerModalOpen}
        locations={locations}
        recallList={[]}
        onClose={() => setIsTriggerModalOpen(false)}
        onCallLaunched={fetchData}
      />
    </div>
    </AuthGuard>
  );
}
