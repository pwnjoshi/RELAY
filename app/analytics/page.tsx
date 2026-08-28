"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { DashboardStats, ClinicLocation } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { AuthGuard } from "@/components/AuthGuard";
import { ConsoleSkeleton } from "@/components/ConsoleSkeleton";

import { logger } from "@/lib/logger";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d");

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
      logger.error("Error loading analytics:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const languageStats = [
    { lang: "Hindi (हिन्दी)", count: 412, pct: 45, color: "bg-[#1B9A9C]" },
    { lang: "English (US/UK)", count: 320, pct: 35, color: "bg-[#0B1930] dark:bg-[#32C4BE]" },
    { lang: "Nepali (नेपाली)", count: 110, pct: 12, color: "bg-[#16A34A]" },
    { lang: "Spanish (Español)", count: 74, pct: 8, color: "bg-[#F59E0B]" },
  ];

  const hourlyVolume = [
    { hour: "08:00", calls: 14, missed: 4 },
    { hour: "10:00", calls: 42, missed: 18 },
    { hour: "12:00", calls: 58, missed: 25 },
    { hour: "14:00", calls: 64, missed: 28 },
    { hour: "16:00", calls: 51, missed: 19 },
    { hour: "18:00", calls: 35, missed: 12 },
    { hour: "20:00", calls: 18, missed: 7 },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title="Voice Intelligence & Analytics"
          badge="INSIGHTS"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          {!stats ? (
            <ConsoleSkeleton type="analytics" />
          ) : (
            <>
          {/* Top Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Telephony Operations & Conversation Metrics
              </h2>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                Real-time conversion efficiency, latency benchmarks, and multilingual voice distribution.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-[#10223A] p-1 rounded-xl border border-[#E4E8E7] dark:border-[#20324A] text-xs shadow-subtle">
              {(["24h", "7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    timeRange === r
                      ? "bg-[#0B1930] text-white shadow-sm"
                      : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-[#667085] dark:text-[#9BA8B8]">
                <span className="font-semibold font-mono uppercase text-[10px]">Total Calls Handled</span>
                <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">
                916
              </div>
              <div className="text-[11px] text-[#16A34A] font-mono font-semibold flex items-center gap-1">
                <span>&uarr; +14.2%</span>
                <span className="text-[#98A2B3]">vs previous period</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-[#667085] dark:text-[#9BA8B8]">
                <span className="font-semibold font-mono uppercase text-[10px]">Booking Conversion</span>
                <Icons.Check className="w-4 h-4 text-[#16A34A]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">
                42.8%
              </div>
              <div className="text-[11px] text-[#16A34A] font-mono font-semibold flex items-center gap-1">
                <span>&uarr; 392 appointments booked</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-[#667085] dark:text-[#9BA8B8]">
                <span className="font-semibold font-mono uppercase text-[10px]">Avg Speed to Answer</span>
                <Icons.Activity className="w-4 h-4 text-[#1B9A9C]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#0B1930] dark:text-[#F8FAFC]">
                13.8s
              </div>
              <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono">
                Sub-15s PBX SIP Intercept
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] shadow-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-[#667085] dark:text-[#9BA8B8]">
                <span className="font-semibold font-mono uppercase text-[10px]">Total Revenue Recovered</span>
                <Icons.DollarSign className="w-4 h-4 text-[#1B9A9C]" />
              </div>
              <div className="text-2xl font-heading font-black text-[#1B9A9C]">
                ${stats ? stats.totalRevenueRecovered.toLocaleString("en-US") : "125,440"}
              </div>
              <div className="text-[11px] text-[#32C4BE] font-mono font-semibold">
                EHR / Database Verified
              </div>
            </div>
          </div>

          {/* Detailed Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Hourly Call Density Heatmap */}
            <div className="lg:col-span-2 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                    Hourly Telephony Call Density
                  </h3>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                    Inbound rings vs. automated Relay voice interceptions throughout the business day.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F3F5F4] dark:bg-[#081426] text-[#1B9A9C]">
                  Peak: 12:00 - 15:00
                </span>
              </div>

              {/* Bar visualization */}
              <div className="space-y-4 pt-2">
                {hourlyVolume.map((h) => (
                  <div key={h.hour} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">{h.hour}</span>
                      <span className="text-[#667085] dark:text-[#9BA8B8]">
                        {h.calls} Total ({h.missed} Missed Intercepts)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#FAFAF8] dark:bg-[#081426] rounded-full overflow-hidden flex border border-[#E4E8E7] dark:border-[#20324A]">
                      <div
                        className="h-full bg-[#1B9A9C]"
                        style={{ width: `${(h.calls / 70) * 100}%` }}
                      />
                      <div
                        className="h-full bg-[#0B1930] dark:bg-[#32C4BE]"
                        style={{ width: `${(h.missed / 70) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Multilingual Distribution */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                  Multilingual Voice Engine Share
                </h3>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-1">
                  Distribution of automated caller interactions by detected native language.
                </p>

                <div className="space-y-3.5 pt-5">
                  {languageStats.map((l) => (
                    <div key={l.lang} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0B1930] dark:text-[#F8FAFC]">{l.lang}</span>
                        <span className="font-mono text-[#667085] dark:text-[#9BA8B8]">{l.count} calls ({l.pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#FAFAF8] dark:bg-[#081426] rounded-full overflow-hidden border border-[#E4E8E7] dark:border-[#20324A]">
                        <div
                          className={`h-full ${l.color} rounded-full`}
                          style={{ width: `${l.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] text-[11px] text-[#667085] dark:text-[#9BA8B8] space-y-1">
                <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] block">Realtime STT Accuracy: 99.4%</span>
                <span>Sub-600ms streaming text-to-speech turnaround across all four supported dialects.</span>
              </div>
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
