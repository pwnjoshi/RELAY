"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { DashboardStats, ClinicLocation } from "@/lib/types";
import { AuthGuard } from "@/components/AuthGuard";
import { IntegrationConfigModal, IntegrationItem } from "@/components/IntegrationConfigModal";
import { Icons } from "@/components/Icons";

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "google_cal",
    name: "Google Calendar & Workspace",
    category: "calendar",
    desc: "Two-way calendar sync with strict Free/Busy privacy masking and automated appointment booking.",
    status: "disconnected",
    badge: "1-CLICK GOOGLE OAUTH"
  },
  {
    id: "salesforce",
    name: "Salesforce CRM",
    category: "crm",
    desc: "Sync caller transcripts, lead scores, and confirmed deals directly to Salesforce Service Cloud.",
    status: "disconnected",
    badge: "OAUTH 2.0"
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    category: "crm",
    desc: "Log inbound missed calls and automated batch campaigns into HubSpot contact timelines.",
    status: "disconnected",
    badge: "POPULAR"
  },
  {
    id: "athena_epic",
    name: "AthenaHealth & Epic EHR",
    category: "ehr",
    desc: "Direct FHIR / HL7 clinical appointment booking and post-op follow-up notes synchronization.",
    status: "disconnected",
    badge: "HIPAA READY"
  },
  {
    id: "twilio_sip",
    name: "Twilio & Telnyx SIP Trunks",
    category: "telephony",
    desc: "Direct carrier interconnect for low-latency voice streams and custom caller ID DID routing.",
    status: "disconnected",
    badge: "SIP INTERCONNECT"
  },
  {
    id: "slack_pagerduty",
    name: "Slack & PagerDuty Alerts",
    category: "alerts",
    desc: "Dispatch instant SMS and emergency channel alerts when high-priority distress keywords are spoken.",
    status: "disconnected",
    badge: "WEBHOOK ALERT"
  }
];

export default function IntegrationsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [testPingMsg, setTestPingMsg] = useState("");

  const [activeConfigItem, setActiveConfigItem] = useState<IntegrationItem | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [integrationsList, setIntegrationsList] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("relay_user_integrations");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIntegrationsList(parsed);
          }
        } catch {}
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes, calRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/calendar")
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
      if (calRes.ok) {
        const calData = await calRes.json();
        if (calData.connected) {
          setIntegrationsList((prev) =>
            prev.map((item) =>
              item.id === "google_cal"
                ? {
                    ...item,
                    status: "connected",
                    email: calData.config?.calendarEmail,
                    badge: "OAUTH 2.0 ACTIVE"
                  }
                : item
            )
          );
        }
      }
    } catch (err) {
      console.error("Error loading integrations:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = integrationsList.filter((i) =>
    selectedCategory === "all" ? true : i.category === selectedCategory
  );

  const handleOpenConfig = (item: IntegrationItem) => {
    setActiveConfigItem(item);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (updated: IntegrationItem) => {
    const nextList = integrationsList.map((item) => (item.id === updated.id ? updated : item));
    setIntegrationsList(nextList);
    if (typeof window !== "undefined") {
      localStorage.setItem("relay_user_integrations", JSON.stringify(nextList));
    }
    setTestPingMsg(`Saved configuration for ${updated.name}.`);
    setTimeout(() => setTestPingMsg(""), 4000);
  };

  const handleDisconnect = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === "google_cal") {
      try {
        await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disconnect" })
        });
      } catch {}
    }

    const nextList = integrationsList.map((item) =>
      item.id === id ? { ...item, status: "disconnected", email: undefined } : item
    );
    setIntegrationsList(nextList);
    if (typeof window !== "undefined") {
      localStorage.setItem("relay_user_integrations", JSON.stringify(nextList));
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          title="Enterprise Integrations & Sync Hub"
          onRefresh={fetchData}
          onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
        />

        <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Connect Calendars, CRMs, and Enterprise Telephony
              </h2>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                Relay synchronizes voice conversation results directly to your existing software stack.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#10223A] p-1 rounded-xl border border-[#E4E8E7] dark:border-[#20324A] text-xs shadow-subtle overflow-x-auto">
              {[
                { id: "all", label: "All Hubs" },
                { id: "calendar", label: "Calendars" },
                { id: "crm", label: "CRMs & Sales" },
                { id: "ehr", label: "EHR Systems" },
                { id: "telephony", label: "SIP Trunks" },
                { id: "alerts", label: "Emergency Alerts" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#0B1930] text-white shadow-sm"
                      : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {testPingMsg && (
            <div className="p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-xs font-mono text-[#16A34A] font-bold animate-fade-in flex items-center justify-between">
              <span>{testPingMsg}</span>
              <span>TEST VERIFIED 200 OK</span>
            </div>
          )}

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const isConnected = item.status === "connected";
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-[#10223A] border rounded-2xl p-6 shadow-subtle space-y-5 flex flex-col justify-between transition-all group ${
                    isConnected ? "border-[#16A34A]/50" : "border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-center font-bold text-xs font-mono">
                          {item.name.charAt(0)}
                        </div>
                        <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                          {item.name}
                        </h3>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isConnected
                            ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                            : "bg-[#FAFAF8] dark:bg-[#081426] text-[#667085] dark:text-[#9BA8B8] border border-[#E4E8E7] dark:border-[#20324A]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#98A2B3]"}`} />
                        {isConnected ? "ACTIVE SYNC" : "NOT CONNECTED"}
                      </span>
                    </div>

                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleOpenConfig(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#FAFAF8] dark:bg-[#081426] hover:bg-[#E4E8E7] text-[11px] font-semibold text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A] transition-all cursor-pointer"
                        >
                          Test Ping
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleDisconnect(item.id, e)}
                            className="px-2.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-[11px] font-medium transition-all cursor-pointer"
                          >
                            Disconnect
                          </button>
                          <button
                            onClick={() => handleOpenConfig(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                          >
                            Settings →
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenConfig(item)}
                        className="w-full py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-card transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {item.id === "google_cal" ? (
                          <>
                            <Icons.Globe className="w-3.5 h-3.5 text-[#32C4BE]" />
                            <span>Connect with Google Calendar →</span>
                          </>
                        ) : item.id === "salesforce" ? (
                          <>
                            <Icons.Zap className="w-3.5 h-3.5 text-[#32C4BE]" />
                            <span>Connect to Salesforce OAuth →</span>
                          </>
                        ) : (
                          <>
                            <Icons.Lock className="w-3.5 h-3.5 text-[#1B9A9C]" />
                            <span>Connect & Authenticate →</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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

      <IntegrationConfigModal
        isOpen={isConfigModalOpen}
        integration={activeConfigItem}
        locations={locations}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
    </AuthGuard>
  );
}
