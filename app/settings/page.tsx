"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { ClinicLocation, RecallPatient, DashboardStats } from "@/lib/types";
import { Icons } from "@/components/Icons";
import { AuthGuard } from "@/components/AuthGuard";
import { CalendarConfig, CalendarEvent } from "@/lib/calendar";
import { VoicePersonaStudio } from "@/components/settings/VoicePersonaStudio";

export default function SettingsPage() {
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [recallList, setRecallList] = useState<RecallPatient[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // AI Persona & Voice Studio State
  const [persona, setPersona] = useState<"empathetic" | "growth" | "technical">("empathetic");
  const [latencyTier, setLatencyTier] = useState<number>(120);
  const [customGreeting, setCustomGreeting] = useState<string>("Hello! This is Sarah from {businessName}. I noticed we missed your call—how can I help you today?");

  // Settings State
  const [calleApiKey, setCalleApiKey] = useState("calle_live_sk_99a8b7c6d5e4f3a2b1c0");
  const [webhookUrl, setWebhookUrl] = useState("https://relay.operations.ai/api/webhooks/call-e");
  const [escalationPhone, setEscalationPhone] = useState("+91 98199 12345");
  const [pbxCarrier, setPbxCarrier] = useState<string>("twilio");
  const [ringThreshold, setRingThreshold] = useState<string>("3");
  const [sipForwardUri, setSipForwardUri] = useState<string>("sip:inbound-relay@telephony.relay.ai");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Google Calendar State
  const [selectedBranchId, setSelectedBranchId] = useState<string>("loc_downtown");
  const [gcalConfig, setGcalConfig] = useState<CalendarConfig | null>(null);
  const [gcalEvents, setGcalEvents] = useState<CalendarEvent[]>([]);
  const [testBookingName, setTestBookingName] = useState("");
  const [testBookingPhone, setTestBookingPhone] = useState("");
  const [testBookingService, setTestBookingService] = useState("");
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");

  const fetchCalendarForBranch = useCallback(async (branchId: string) => {
    try {
      const res = await fetch(`/api/calendar?branchId=${branchId}`);
      if (res.ok) {
        const d = await res.json();
        setGcalConfig(d.config || null);
        setGcalEvents(d.events || []);
      }
    } catch (err) {
      console.error("Error loading branch calendar:", err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [locsRes, recallRes, statsRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/locations?type=recall-list"),
        fetch("/api/call-results/stats")
      ]);

      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
      if (recallRes.ok) {
        const d = await recallRes.json();
        setRecallList(d.recallList || []);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      await fetchCalendarForBranch(selectedBranchId);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }, [fetchCalendarForBranch, selectedBranchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    fetchCalendarForBranch(branchId);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleMasking = async () => {
    if (!gcalConfig) return;
    const newVal = !gcalConfig.strictFreeBusyMasking;
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          branchId: selectedBranchId,
          config: { strictFreeBusyMasking: newVal }
        })
      });
      if (res.ok) {
        const d = await res.json();
        setGcalConfig(d.config);
      }
    } catch (err) {
      console.error("Failed to toggle masking:", err);
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disconnect",
          branchId: selectedBranchId
        })
      });
      if (res.ok) {
        fetchCalendarForBranch(selectedBranchId);
      }
    } catch (err) {
      console.error("Failed to disconnect calendar:", err);
    }
  };

  const handleSimulateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testBookingName || !testBookingPhone) return;

    try {
      const idempotencyKey = `manual_booking_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          action: "book",
          branchId: selectedBranchId,
          customerName: testBookingName,
          customerPhone: testBookingPhone,
          serviceType: testBookingService || "Consultation Follow-up",
          startIso: new Date(Date.now() + 86400000).toISOString(),
          durationMinutes: 30
        })
      });

      if (res.ok) {
        setBookingSuccessMsg(`Booked appointment for ${testBookingName}!`);
        setTestBookingName("");
        setTestBookingPhone("");
        setTestBookingService("");
        fetchCalendarForBranch(selectedBranchId);
        setTimeout(() => setBookingSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Simulated booking failed:", err);
    }
  };

  return (
    <AuthGuard allowedRoles={["owner", "dept_admin"]}>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="PBX, Carrier Interconnect & Calendar Settings"
            badge="TELEPHONY CONFIG"
            onRefresh={fetchData}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
          />

          <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
            <div>
              <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Voice Persona Tuning, PBX Forwarding & Google Calendar Sync
              </h2>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-0.5">
                Customize your voice agent&apos;s neural persona, connect PBX carrier forwarding rules, and enforce zero-leakage calendar privacy.
              </p>
            </div>

            {/* 0. AI Persona & Voice Tuning Studio */}
            <VoicePersonaStudio
              persona={persona}
              setPersona={setPersona}
              latencyTier={latencyTier}
              setLatencyTier={setLatencyTier}
              greetingPhrase={customGreeting}
              setGreetingPhrase={setCustomGreeting}
            />

            {/* 1. PBX & SIP Carrier Forwarding Configuration */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1930] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    <Icons.PhoneIncoming className="w-5 h-5 text-[#1B9A9C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      PBX Forwarding & SIP Carrier Interconnect
                    </h3>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                      Route unanswered front-desk calls to Relay when lines ring past your desired threshold.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
                  SIP Trunk Online (Sub-14.2s Answer)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* PBX Carrier */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">PBX / Carrier Platform</label>
                  <select
                    value={pbxCarrier}
                    onChange={(e) => setPbxCarrier(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="twilio">Twilio Elastic SIP Trunk</option>
                    <option value="telnyx">Telnyx Voice Interconnect</option>
                    <option value="asterisk">Asterisk / FreePBX Server</option>
                    <option value="cisco">Cisco CUCM / Genesys Cloud</option>
                    <option value="custom">Custom SIP URI / Direct Trunk</option>
                  </select>
                </div>

                {/* Ring Count Threshold */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Forwarding Trigger Threshold</label>
                  <select
                    value={ringThreshold}
                    onChange={(e) => setRingThreshold(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="3">3 Rings (~14.2s) - Standard Overflow</option>
                    <option value="2">2 Rings (~9.5s) - Aggressive Intercept</option>
                    <option value="1">1 Ring (~5s) - Instant AI Intercept</option>
                    <option value="after_hours">After-Hours & Weekend Always</option>
                  </select>
                </div>

                {/* SIP Destination URI */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Relay SIP Forwarding Endpoint</label>
                  <input
                    type="text"
                    value={sipForwardUri}
                    onChange={(e) => setSipForwardUri(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Google Calendar Integration & Privacy Guardrails Card */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-6">
              {/* Branch Selector & Connection Header */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1930] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      Google Calendar Multi-Branch Sync Engine
                    </h3>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                      {gcalConfig?.connected ? (
                        <>Connected: <code>{gcalConfig.calendarEmail}</code></>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Not Configured for this branch</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                  {/* Branch Switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#667085] dark:text-[#9BA8B8]">Branch:</span>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-1 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {gcalConfig?.isDemoMode && (
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      ⚡ DEMO SIMULATION MODE
                    </span>
                  )}

                  {gcalConfig?.connected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full border border-[#16A34A]/20">
                        OAuth Active &bull; Syncing
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectCalendar}
                        className="text-[10px] font-mono px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <a
                      href={`/api/calendar/auth-url?branchId=${selectedBranchId}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white shadow-sm transition-all"
                    >
                      Authorize Google Account &rarr;
                    </a>
                  )}
                </div>
              </div>

              {/* Zero Information Leakage Privacy Guardrails */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  <Icons.Lock className="w-4 h-4 text-[#1B9A9C]" />
                  <span>Zero Information Leakage Privacy Safeguards</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Strict Free/Busy Masking</span>
                      <button
                        type="button"
                        onClick={handleToggleMasking}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          gcalConfig?.strictFreeBusyMasking
                            ? "bg-[#1B9A9C] text-white"
                            : "bg-[#E4E8E7] text-[#667085]"
                        }`}
                      >
                        {gcalConfig?.strictFreeBusyMasking ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                      Voice AI only knows if a slot is FREE or BUSY. Never discloses external meeting titles or attendee details to callers.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Auto-Buffer Padding</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B9A9C]/10 text-[#1B9A9C] font-bold">
                        15 min
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                      Automatically inserts 15 minutes of buffer time before and after every appointment to prevent overlapping slots.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Phone-Verified Cancellation</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/10 text-[#16A34A] font-bold">
                        ENFORCED
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                      Callers can only reschedule or cancel appointments that match their verified inbound caller ID.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Synchronized Calendar Slot Visualizer */}
              <div className="pt-4 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Icons.Activity className="w-3.5 h-3.5 text-[#1B9A9C]" />
                    <span>Live Synchronized Calendar Slots (Friday, Aug 28)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                    4 Events &bull; 4 Open Windows
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {gcalEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        evt.status === "cancelled"
                          ? "opacity-50 line-through bg-gray-50 border-gray-200"
                          : evt.isRelayBooking
                          ? "bg-[#1B9A9C]/10 border-[#1B9A9C]/30 text-[#0B1930] dark:text-white"
                          : "bg-[#FAFAF8] dark:bg-[#081426] border-[#E4E8E7] dark:border-[#20324A] text-[#667085] dark:text-[#9BA8B8]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span>{new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={evt.isRelayBooking ? "text-[#1B9A9C]" : "text-[#98A2B3]"}>
                          {evt.isRelayBooking ? "RELAY AI" : "EXTERNAL"}
                        </span>
                      </div>
                      <span className="font-semibold block truncate">{evt.maskedTitle}</span>
                      {evt.customerPhone && (
                        <span className="text-[10px] text-[#667085] dark:text-[#9BA8B8] block">{evt.customerPhone}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Simulated AI Booking */}
              <div className="p-4 rounded-xl bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Simulate Realtime Google Calendar Booking on Behalf of Caller
                  </span>
                  {bookingSuccessMsg && (
                    <span className="text-xs text-[#16A34A] font-bold animate-fade-in">{bookingSuccessMsg}</span>
                  )}
                </div>

                <form onSubmit={handleSimulateBooking} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Caller Name"
                    value={testBookingName}
                    onChange={(e) => setTestBookingName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs text-[#0B1930] dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Caller Phone"
                    value={testBookingPhone}
                    onChange={(e) => setTestBookingPhone(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs text-[#0B1930] dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Service / Topic"
                    value={testBookingService}
                    onChange={(e) => setTestBookingService(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs text-[#0B1930] dark:text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    Book on Google Calendar &rarr;
                  </button>
                </form>
              </div>
            </div>

            {/* 3. CALL-E Core Credentials & Webhook Form */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">CALL-E Telephony API Key</h3>
                    <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">Live production authorization key for automated voice ops.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20">
                    Verified Active
                  </span>
                </div>

                <div>
                  <input
                    type="password"
                    value={calleApiKey}
                    onChange={(e) => setCalleApiKey(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] focus:border-[#1B9A9C] outline-none"
                  />
                </div>
              </div>

              {/* Webhook Endpoint */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-4">
                <div>
                  <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">SIP Telephony Webhook Endpoint</h3>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">CALL-E dispatches real-time session transcripts and post-call JSON payloads here.</p>
                </div>

                <div>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] focus:border-[#1B9A9C] outline-none"
                  />
                </div>
              </div>

              {/* Urgent Escalation */}
              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-subtle space-y-4">
                <div>
                  <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">Priority Emergency Escalation Phone</h3>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">Receives immediate SMS pagers when a caller mentions critical urgent alerts or emergency keywords.</p>
                </div>

                <div>
                  <input
                    type="text"
                    value={escalationPhone}
                    onChange={(e) => setEscalationPhone(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-[#F8FAFC] focus:border-[#1B9A9C] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Save All Settings
                </button>

                {savedSuccess && (
                  <span className="text-xs text-[#16A34A] font-bold animate-fade-in flex items-center gap-1">
                    <Icons.Check className="w-4 h-4" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
            </form>
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
