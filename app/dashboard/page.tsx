"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricsBar } from "@/components/MetricsBar";
import { CallTable } from "@/components/CallTable";
import { CallDrawer } from "@/components/CallDrawer";
import { TriggerModal } from "@/components/TriggerModal";
import { SafetyBanner } from "@/components/SafetyBanner";
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

          <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
            {!stats && calls.length === 0 ? (
              <ConsoleSkeleton type="dashboard" />
            ) : (
              <>
                {/* Top Operational Status Bar with Active Workspace Branding */}
                <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
                      <span className="text-sm sm:text-base font-extrabold font-heading text-[#0B1930] dark:text-[#F8FAFC]">
                        {activeWorkspace?.name || "Tech Sangi IT & AI Operations"}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#1B9A9C]/15 text-[#1B9A9C] px-2 py-0.5 rounded uppercase border border-[#1B9A9C]/20">
                        ISOLATED WORKSPACE CONTEXT
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                      {activeWorkspace?.description || "Software development agency & AI consulting firm handling incoming client discovery calls."} &bull; ({effectiveDepartments.length} Departments Configured)
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-[#1B9A9C] bg-[#1B9A9C]/10 px-3 py-1.5 rounded-xl border border-[#1B9A9C]/20">
                      {activeWorkspace?.badge || "ENTERPRISE OPS"}
                    </span>
                  </div>
                </div>

                {/* KPI Metrics Bar */}
                <MetricsBar stats={stats} />

                {/* Main Operational Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Live Telephony Call Table */}
                  <div className="lg:col-span-2 space-y-6">
                    <CallTable
                      calls={filteredCalls}
                      locations={locations}
                      onSelectCall={handleSelectCall}
                      activeFilter={filterType}
                      onFilterChange={setFilterType}
                    />
                  </div>

                  {/* Right Col: Fleet Telephony Nodes, RAG Knowledge & Safety Guardrails */}
                  <div className="space-y-6">
                    <WebRAGKnowledgeCard />
                    <ClinicFleetCard
                      locations={locations}
                      locationStats={stats?.locationStats}
                    />
                    <SafetyBanner />
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
