"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { ClinicLocation, DashboardStats, RecallPatient } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { AuthGuard } from "@/components/AuthGuard";

export default function CampaignsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [recallList, setRecallList] = useState<RecallPatient[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchedSuccessIds, setDispatchedSuccessIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes, recallRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/locations?type=recall-list")
      ]);

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
      console.error("Error fetching campaigns:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickDispatch = async (patient: RecallPatient) => {
    setDispatchingId(patient.id);
    try {
      const res = await fetch("/api/trigger-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: patient.phone,
          patientName: patient.name,
          locationId: patient.location_id,
          dueFor: patient.due_for,
          language: patient.preferred_language || "en",
          extraContext: `Preferred days: ${patient.preferred_days.join(", ")}. Notes: ${patient.notes}`
        })
      });
      const data = await res.json();
      if (data.ok) {
        setDispatchedSuccessIds((prev) => new Set(prev).add(patient.id));
      }
    } catch (err) {
      console.error("Error dispatching recall call:", err);
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={["owner", "media_pr", "dept_admin"]}>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="Outbound Client Recall & Outreach Studio"
            badge="PROACTIVE REVENUE"
            onRefresh={fetchData}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
          />

          <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
            {/* Top Cohort Overview */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-subtle">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B9A9C] bg-[#1B9A9C]/10 px-2 py-0.5 rounded-full font-mono">
                    Active Cohort
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFF8E6] dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                    Direct Calendar Booking Active
                  </span>
                </div>
                <h2 className="text-xl font-bold font-heading text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                  Scheduled Consultation & Routine Follow-up Batch
                </h2>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                  Targeting clients due for follow-up reviews. Autonomous Relay voice agent handles scheduling objections, verifies availability with Google Calendar, and books directly into your practice database.
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] min-w-[90px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#98A2B3] block">Eligible</span>
                  <span className="text-xl font-black font-mono text-[#0B1930] dark:text-[#F8FAFC]">{recallList.length}</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] min-w-[90px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#98A2B3] block">Dialed</span>
                  <span className="text-xl font-black font-mono text-[#16A34A]">{dispatchedSuccessIds.size}</span>
                </div>
              </div>
            </div>

            {/* Patients Recall List */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
              <div className="p-4 border-b border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between">
                <h3 className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                  Due For Outreach ({recallList.length} Contacts)
                </h3>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                  Automated Voice Dispatch Available
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-[#FAFAF8] dark:bg-[#081426] text-[10px] uppercase font-bold text-[#667085] dark:text-[#9BA8B8] font-mono">
                      <th className="py-3 px-4">Client / Contact</th>
                      <th className="py-3 px-4">Due For</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Preferred Slot</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
                    {recallList.map((patient) => {
                      const isDispatched = dispatchedSuccessIds.has(patient.id);
                      const isCalling = dispatchingId === patient.id;

                      return (
                        <tr key={patient.id} className="hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">{patient.name}</div>
                            <div className="text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8] whitespace-nowrap">{patient.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-[#0B1930] dark:text-[#F8FAFC]">{patient.due_for}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A] uppercase">
                              {patient.preferred_language || "en"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#667085] dark:text-[#9BA8B8]">
                            {Array.isArray(patient.preferred_days)
                              ? patient.preferred_days.join(", ")
                              : (patient.preferred_days || "Mon - Fri")}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {isDispatched ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full border border-[#16A34A]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                DIALED & CONFIRMED
                              </span>
                            ) : (
                              <button
                                disabled={isCalling}
                                onClick={() => handleQuickDispatch(patient)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                              >
                                <Icons.PhoneOutgoing className="w-3 h-3" />
                                <span>{isCalling ? "Dialing..." : "Dispatch Call"}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

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
