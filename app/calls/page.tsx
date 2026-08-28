"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CallTable } from "@/components/CallTable";
import { CallDrawer } from "@/components/CallDrawer";
import { TriggerModal } from "@/components/TriggerModal";
import { CallRecord, ClinicLocation, DashboardStats, RecallPatient } from "@/lib/types";
import { AuthGuard } from "@/components/AuthGuard";
import { ConsoleSkeleton } from "@/components/ConsoleSkeleton";
import { Icons } from "@/components/Icons";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [recallList, setRecallList] = useState<RecallPatient[]>([]);

  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [callsRes, statsRes, locsRes, recallRes] = await Promise.all([
        fetch("/api/call-results"),
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/locations?type=recall-list")
      ]);

      if (callsRes.ok) {
        const d = await callsRes.json();
        setCalls(d.calls || []);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
      if (recallRes.ok) {
        const d = await recallRes.json();
        setRecallList(d.recallList || []);
      }
    } catch (err) {
      console.error("Error fetching calls:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredCalls = calls.filter((c) => {
    if (activeFilter !== "all" && c.callType !== activeFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.patientName || "").toLowerCase().includes(q);
      const matchPhone = (c.phoneNumber || "").toLowerCase().includes(q);
      const matchNotes = (c.summary || c.structuredOutcome?.notes || "").toLowerCase().includes(q);
      const matchOutcome = (c.structuredOutcome?.outcome || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchNotes || matchOutcome;
    }
    return true;
  });

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} callCount={calls.length} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="Telephony Audit Stream"
            badge="CALL-E TRACE LOGS"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={fetchData}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
          />

          <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
            {calls.length === 0 && !stats ? (
              <ConsoleSkeleton type="dashboard" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold font-heading text-[#0B1930] dark:text-[#F8FAFC]">Full Operational Call Log</h2>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-0.5">
                      Inspect end-to-end conversation transcripts, entity extractions, and structured JSON output.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-[#667085] dark:text-[#9BA8B8] font-mono">
                      Total Records: <span className="text-[#0B1930] dark:text-[#F8FAFC] font-bold">{filteredCalls.length}</span>
                    </div>
                    <a
                      href="/api/export?format=csv"
                      download
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-mono font-bold text-[#1B9A9C] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Icons.Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </a>
                    <a
                      href="/api/export?format=json"
                      download
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-mono font-bold text-[#1B9A9C] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Icons.Download className="w-3.5 h-3.5" />
                      <span>Export JSON</span>
                    </a>
                  </div>
                </div>

                <CallTable
                  calls={filteredCalls}
                  locations={locations}
                  onSelectCall={(call) => setSelectedCall(call)}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
              </>
            )}
          </main>
        </div>

        <CallDrawer
          call={selectedCall}
          locations={locations}
          onClose={() => setSelectedCall(null)}
        />

        <TriggerModal
          isOpen={isTriggerModalOpen}
          locations={locations}
          recallList={recallList}
          onClose={() => setIsTriggerModalOpen(false)}
          onCallLaunched={fetchData}
        />
      </div>
    </AuthGuard>
  );
}
