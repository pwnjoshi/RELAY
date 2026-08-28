"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricsBar } from "@/components/MetricsBar";
import { CallTable } from "@/components/CallTable";
import { CallDrawer } from "@/components/CallDrawer";
import { TriggerModal } from "@/components/TriggerModal";
import { ClinicFleetCard } from "@/components/ClinicFleetCard";
import { WebRAGKnowledgeCard } from "@/components/WebRAGKnowledgeCard";
import { AuthGuard } from "@/components/AuthGuard";
import { ConsoleSkeleton } from "@/components/ConsoleSkeleton";
import { CallRecord, ClinicLocation, DashboardStats, RecallPatient, Department } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { useConsole } from "@/lib/console-context";

export default function DashboardPage() {
  const { activeWorkspace, activeWorkspaceId, departments: contextDepts } = useConsole();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [recallList, setRecallList] = useState<RecallPatient[]>([]);

  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDeptId, setActiveDeptId] = useState<string>("all");
  const [sideTab, setSideTab] = useState<"fleet" | "rag">("fleet");

  const effectiveDepartments = activeWorkspace?.departments?.length > 0 ? activeWorkspace.departments : (departments.length > 0 ? departments : contextDepts);

  const fetchData = useCallback(async () => {
    try {
      const [callsRes, statsRes, locsRes, recallRes, iamRes, authRes] = await Promise.all([
        fetch("/api/call-results"),
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/locations?type=recall-list"),
        fetch("/api/iam"),
        fetch("/api/auth/session")
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
      if (iamRes.ok) {
        const d = await iamRes.json();
        setDepartments(d.departments || []);
        if (d.activeDepartmentId) setActiveDeptId(d.activeDepartmentId);
      }
      if (authRes.ok) {
        const d = await authRes.json();
        if (d.user) setCurrentUser(d.user);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
    setIsDrawerOpen(true);
  };

  // Filter calls by department, type, and search
  const filteredCalls = calls.filter((call) => {
    if (activeDeptId !== "all" && call.departmentId !== activeDeptId) {
      return false;
    }
    if (filterType !== "all" && call.callType !== filterType) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = call.patientName.toLowerCase().includes(q);
      const matchPhone = call.phoneNumber.toLowerCase().includes(q);
      const matchNotes = call.structuredOutcome?.notes?.toLowerCase().includes(q);
      return matchName || matchPhone || matchNotes;
    }
    return true;
  });

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]">
        <Sidebar
          budget={stats?.budget}
          callCount={calls.length}
          departments={effectiveDepartments}
          activeDeptId={activeDeptId}
          onDepartmentChange={(deptId) => setActiveDeptId(deptId)}
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="Operations Console"
            badge="TELEPHONY ACTIVE"
            onRefresh={fetchData}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="p-6 sm:p-8 space-y-7 flex-1 max-w-[1600px] w-full animate-fade-in">
            {!stats && calls.length === 0 ? (
              <ConsoleSkeleton type="dashboard" />
            ) : (
              <>
                {/* Clean Hero Welcome & Quick Action Card */}
                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-subtle">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                      <h2 className="text-lg sm:text-xl font-extrabold font-heading text-[#0B1930] dark:text-[#F8FAFC]">
                        {activeWorkspace?.name || "Enterprise Operations"}
                      </h2>
                      <span className="text-[10px] font-mono font-bold bg-[#1B9A9C]/10 text-[#1B9A9C] px-2.5 py-0.5 rounded-full border border-[#1B9A9C]/20">
                        {activeWorkspace?.badge || "ACTIVE TRUNKS"}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] max-w-2xl leading-relaxed">
                      {activeWorkspace?.description || "Autonomous multilingual telephony platform answering missed calls and scheduling appointments 24/7."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTriggerModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] hover:bg-[#15294A] dark:hover:bg-[#27B5B2] text-white font-bold text-xs shadow-card hover:shadow-elevated transition-all active:scale-95 cursor-pointer"
                    >
                      <Icons.PhoneCall className="w-3.5 h-3.5" />
                      <span>Initiate Live Call &rarr;</span>
                    </button>
                    <Link
                      href="/calls"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] font-bold text-xs transition-all cursor-pointer"
                    >
                      <Icons.FileText className="w-3.5 h-3.5 text-[#1B9A9C]" />
                      <span>Audit Logs</span>
                    </Link>
                  </div>
                </div>

                {/* KPI Metrics Bar */}
                <MetricsBar stats={stats} />

                {/* Main Content: Clean 2-Column Split */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
                  {/* Left Column (8 cols): Primary Telephony Stream */}
                  <div className="xl:col-span-8 space-y-6">
                    <CallTable
                      calls={filteredCalls}
                      locations={locations}
                      onSelectCall={handleSelectCall}
                      activeFilter={filterType}
                      onFilterChange={setFilterType}
                    />
                  </div>

                  {/* Right Column (4 cols): Tabbed Side Panel (Clean & Spacious) */}
                  <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
                      {/* Clean Tab Switcher */}
                      <div className="p-3 border-b border-[#E4E8E7] dark:border-[#20324A] flex items-center gap-2 bg-[#FAFAF8] dark:bg-[#081426]">
                        <button
                          type="button"
                          onClick={() => setSideTab("fleet")}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            sideTab === "fleet"
                              ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-[#F8FAFC] shadow-sm"
                              : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
                          }`}
                        >
                          <Icons.Building className="w-3.5 h-3.5 text-[#1B9A9C]" />
                          <span>Telephony Nodes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSideTab("rag")}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            sideTab === "rag"
                              ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-[#F8FAFC] shadow-sm"
                              : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
                          }`}
                        >
                          <Icons.BookOpen className="w-3.5 h-3.5 text-[#1B9A9C]" />
                          <span>Grounded RAG</span>
                        </button>
                      </div>

                      <div className="p-5">
                        {sideTab === "fleet" ? (
                          <ClinicFleetCard
                            locations={locations}
                            locationStats={stats?.locationStats}
                          />
                        ) : (
                          <WebRAGKnowledgeCard />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Call Transcript Inspection Drawer */}
        <CallDrawer
          call={selectedCall}
          locations={locations}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* Simulation Call Modal */}
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
