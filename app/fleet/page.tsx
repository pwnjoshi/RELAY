"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { ClinicLocation, DashboardStats } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { AuthGuard } from "@/components/AuthGuard";

import { BranchKnowledgeModal } from "@/components/BranchKnowledgeModal";

export default function FleetPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedLocationForRag, setSelectedLocationForRag] = useState<ClinicLocation | null>(null);

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
      console.error("Error loading fleet data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateLocation = (updatedLoc: ClinicLocation) => {
    setLocations((prev) => prev.map((l) => (l.id === updatedLoc.id ? updatedLoc : l)));
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title="Multi-Branch Telephony Fleet"
          badge="FLEET INFRASTRUCTURE"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-[#151515] dark:text-[#FAFAF8] tracking-tight">Enterprise Telephony Nodes</h2>
            <p className="text-xs text-[#666666] dark:text-[#9E9E9E] mt-1">
              Active physical business branches routed through CALL-E zero-latency telephony SIP infrastructure across all industry sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((loc) => {
              const locStat = stats?.locationStats?.[loc.id] || { total: 0, booked: 0, revenue: 0 };

              return (
                <div
                  key={loc.id}
                  className="bg-white dark:bg-[#1C1C1C] border border-[#E8E8E4] dark:border-[#2C2C2C] hover:border-[#0F8F78] rounded-2xl p-6 space-y-5 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8F5F2] dark:bg-[#0F8F78]/20 text-[#0F8F78]">
                        {loc.id}
                      </span>
                      <h3 className="text-base font-bold text-[#151515] dark:text-[#FAFAF8] mt-1">{loc.name}</h3>
                      <p className="text-xs text-[#666666] dark:text-[#9E9E9E]">{loc.address}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-[#E8E8E4] dark:border-[#2C2C2C] pt-3">
                    <div className="flex items-center justify-between text-[#666666] dark:text-[#9E9E9E]">
                      <span>Inbound Number:</span>
                      <span className="font-mono text-[#151515] dark:text-[#FAFAF8] font-semibold">{loc.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#666666] dark:text-[#9E9E9E]">
                      <span>On-Call Doctor:</span>
                      <span className="font-medium text-[#151515] dark:text-[#FAFAF8]">{loc.on_call_doctor}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#666666] dark:text-[#9E9E9E]">
                      <span>Avg Ticket Value:</span>
                      <span className="font-mono text-[#0F8F78] font-bold">${loc.average_ticket_value}</span>
                    </div>
                  </div>

                  <div className="bg-[#F7F7F5] dark:bg-[#161616] p-3.5 rounded-xl border border-[#E8E8E4] dark:border-[#2C2C2C] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] font-mono block">
                      Node Performance
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666666] dark:text-[#9E9E9E]">Revenue Recovered:</span>
                      <span className="font-mono font-bold text-[#0F8F78]">${locStat.revenue.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#666666] dark:text-[#9E9E9E]">Booked Conversion:</span>
                      <span className="font-mono font-bold text-[#151515] dark:text-[#FAFAF8]">{locStat.booked} / {locStat.total} calls</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLocationForRag(loc)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-bold text-[#1B9A9C] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Icons.BookOpen className="w-3.5 h-3.5" />
                    <span>Configure Grounded RAG Knowledge</span>
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <TriggerModal
        isOpen={isTriggerModalOpen}
        locations={locations}
        recallList={[]}
        onClose={() => setIsTriggerModalOpen(false)}
        onCallLaunched={fetchData}
      />

      <BranchKnowledgeModal
        isOpen={selectedLocationForRag !== null}
        location={selectedLocationForRag}
        onClose={() => setSelectedLocationForRag(null)}
        onSave={handleUpdateLocation}
      />
    </div>
    </AuthGuard>
  );
}
