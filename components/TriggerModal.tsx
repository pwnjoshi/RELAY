"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { ClinicLocation, RecallPatient, SUPPORTED_LANGUAGES, SUPPORTED_COUNTRIES, LanguageCode } from "@/lib/types";
import { LiveCallTelemetry } from "./trigger/LiveCallTelemetry";
import { CallResultBanner } from "./trigger/CallResultBanner";

interface TriggerModalProps {
  isOpen: boolean;
  locations: ClinicLocation[];
  recallList: RecallPatient[];
  onClose: () => void;
  onCallLaunched?: () => void;
}

const DEFAULT_INDUSTRY_LOCATIONS: ClinicLocation[] = [
  {
    id: "loc_downtown",
    name: "Apex Health - Downtown Metro",
    industry: "Healthcare",
    phone: "+1-555-0100",
    address: "450 Sutter St, Suite 1200, San Francisco, CA",
    hours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM",
    services: [
      "Preventive Hygiene & Cleaning",
      "Comprehensive Oral Exam",
      "Emergency Triage & Pain Relief",
      "Invisalign Consultation",
      "Crowns & Restorative Care"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Sarah Chen, DDS",
    average_ticket_value: 320,
    defaultContext: "Caller is requesting next available appointment for tooth pain."
  },
  {
    id: "loc_westside",
    name: "Apex Health - Westside Family Clinic",
    industry: "Healthcare",
    phone: "+1-555-0200",
    address: "2100 Olympic Blvd, Los Angeles, CA",
    hours: "Mon-Fri: 8:30 AM - 5:30 PM",
    services: [
      "Routine Health & Wellness Exam",
      "Pediatric Checkups",
      "Hygiene & Teeth Whitening",
      "Chronic Condition Follow-up"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Marcus Vance, MD",
    average_ticket_value: 280,
    defaultContext: "Patient following up on annual wellness checkup and lab results."
  },
  {
    id: "loc_highland",
    name: "Apex Health - Highland Urgent & Specialty",
    industry: "Healthcare",
    phone: "+1-555-0300",
    address: "880 North Highland Ave, Austin, TX",
    hours: "24/7 Acute Triage & Urgent Walk-ins",
    services: [
      "24/7 Acute Pain Triage",
      "Advanced Dental Implants",
      "Oral Surgery & Extraction",
      "Emergency Trauma Relief"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dr. Elena Rostova, DMD",
    average_ticket_value: 550,
    defaultContext: "Caller with acute discomfort requesting immediate emergency surgical evaluation."
  },
  {
    id: "loc_auto_metro",
    name: "Apex Velocity - Metro Auto Group & Service",
    industry: "Automotive",
    phone: "+1-555-0400",
    address: "1200 Motor Speedway Blvd, Dallas, TX",
    hours: "Mon-Sat: 7:00 AM - 6:00 PM",
    services: [
      "15k / 30k Synthetic Oil Service",
      "OEM Safety Recalls & Diagnostics",
      "Brake Rotor & Pad Replacement",
      "Complimentary Shuttle & Loaner Fleet"
    ],
    payment_plans_available: true,
    on_call_doctor: "Dave Miller (Lead Service Advisor)",
    average_ticket_value: 450,
    defaultContext: "Customer inquiring about 15,000-mile brake inspection and loaner car reservation."
  },
  {
    id: "loc_auto_west",
    name: "Apex Velocity - Collision & Express Fleet Hub",
    industry: "Automotive",
    phone: "+1-555-0450",
    address: "740 Industrial Parkway, Chicago, IL",
    hours: "Mon-Fri: 7:30 AM - 5:30 PM",
    services: [
      "Direct Insurance Collision Repair",
      "Commercial Fleet Maintenance",
      "Transmission Diagnostics",
      "Tire Alignment & Precision Balance"
    ],
    payment_plans_available: true,
    on_call_doctor: "Jessica Hayes (Collision & Fleet Manager)",
    average_ticket_value: 680,
    defaultContext: "Fleet manager scheduling multi-vehicle preventative maintenance inspection."
  },
  {
    id: "loc_legal_hq",
    name: "Apex Legal - Downtown Litigation & Advisory",
    industry: "Legal",
    phone: "+1-555-0500",
    address: "100 Wall Street, 28th Floor, New York, NY",
    hours: "Mon-Fri: 8:30 AM - 6:30 PM",
    services: [
      "Commercial Breach of Contract",
      "Corporate Shareholder Arbitration",
      "Client Intake & Conflict Checks",
      "Partner Strategy Consultation"
    ],
    payment_plans_available: false,
    on_call_doctor: "Morgan Blake, Esq. (Managing Partner)",
    average_ticket_value: 1200,
    defaultContext: "Prospective corporate client seeking initial partner consultation for contract dispute."
  },
  {
    id: "loc_legal_trusts",
    "name": "Apex Legal - Century City Estate & Wealth Hub",
    industry: "Legal",
    phone: "+1-555-0550",
    address: "1999 Avenue of the Stars, Los Angeles, CA",
    hours: "Mon-Fri: 9:00 AM - 5:00 PM",
    services: [
      "Revocable Living Trusts & Wills",
      "High Net-Worth Asset Protection",
      "Probate Administration",
      "Tax Strategy & Succession Planning"
    ],
    payment_plans_available: false,
    on_call_doctor: "Claire Sterling, JD (Senior Partner)",
    average_ticket_value: 950,
    defaultContext: "Client requesting appointment to update family estate trust and asset protection plan."
  },
  {
    id: "loc_grand_apex",
    name: "The Grand Apex - Luxury Hotel Concierge & Dining",
    industry: "Hospitality",
    phone: "+1-555-0600",
    address: "500 Oceanfront Promenade, Miami Beach, FL",
    hours: "24/7 VIP Concierge & Guest Services",
    services: [
      "Michelin-Starred Dining Reservations",
      "VIP Suite Inquiries & Upgrades",
      "Airport Chauffeur Dispatch",
      "Private Event & Cabana Booking"
    ],
    payment_plans_available: false,
    on_call_doctor: "Henri Dupond (Head Concierge)",
    average_ticket_value: 750,
    defaultContext: "Guest inquiring about dinner reservation for 4 at the rooftop lounge this Saturday."
  },
  {
    id: "loc_apex_living",
    name: "Apex Living - Premier Residential & Property Ops",
    industry: "Real Estate",
    phone: "+1-555-0700",
    address: "350 Seattle Waterfront Ave, Seattle, WA",
    hours: "Mon-Sat: 9:00 AM - 6:00 PM",
    services: [
      "Private Penthouse & Townhome Tours",
      "Lease Application Pre-screening",
      "Tenant Maintenance Dispatch",
      "Property Acquisition Inquiries"
    ],
    payment_plans_available: false,
    on_call_doctor: "Samantha Vance (Lead Leasing Broker)",
    average_ticket_value: 850,
    defaultContext: "Prospective tenant requesting private weekend walkthrough tour of 2-bedroom unit."
  }
];

export function TriggerModal({
  isOpen,
  locations = [],
  recallList,
  onClose,
  onCallLaunched
}: TriggerModalProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [subscriberNumber, setSubscriberNumber] = useState<string>("9810012345");
  const [patientName, setPatientName] = useState("Alex Taylor");

  const selectedCountry = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];
  const fullE164Number = selectedCountry.dialCode + subscriberNumber.replace(/\D/g, "");

  const effectiveLocations = locations.length > 0 ? locations : DEFAULT_INDUSTRY_LOCATIONS;

  const [selectedLocationId, setSelectedLocationId] = useState<string>("loc_downtown");
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(false);
  const [customNodeName, setCustomNodeName] = useState<string>("Apex Global Solutions - North Branch");
  const [customIndustry, setCustomIndustry] = useState<string>("Healthcare");
  const [customDoctor, setCustomDoctor] = useState<string>("Dr. Jordan Lee, Specialist");
  const [customServices, setCustomServices] = useState<string>("Emergency Consultation, Rapid Booking, VIP Support");

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("hi");
  const [extraContext, setExtraContext] = useState("Caller is requesting next available appointment for consultation.");
  const [isCalling, setIsCalling] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [resultMessage, setResultMessage] = useState<{ ok: boolean; text: string; runId?: string } | null>(null);
  const [liveCallStatus, setLiveCallStatus] = useState<string>("queued");
  const [liveCallSummary, setLiveCallSummary] = useState<string>("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const idempotencyKeyRef = React.useRef<string>("");

  useEffect(() => {
    if (isOpen && !idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    if (!isOpen) {
      idempotencyKeyRef.current = "";
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("relay_auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isLoggedIn) setIsUserLoggedIn(true);
      }
    } catch {}

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.authenticated) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      })
      .catch(() => setIsUserLoggedIn(false));
  }, []);

  // Live ultra-responsive polling for run status from carrier (800ms polling interval)
  useEffect(() => {
    if (!resultMessage?.ok || !resultMessage.runId) return;

    setLiveCallStatus("queued");
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/call-results/status?runId=${resultMessage.runId}`);
        const data = await res.json();
        if (data.ok && data.status) {
          setLiveCallStatus(data.status);
          if (data.summary) setLiveCallSummary(data.summary);
          if (data.status === "completed" || data.status === "failed" || attempts >= 600) {
            clearInterval(interval);
            if (onCallLaunched) onCallLaunched();
          }
        }
      } catch {
        // silent fallback
      }
    }, 500);

    return () => clearInterval(interval);
  }, [resultMessage, onCallLaunched]);

  // Sync default context when location changes
  useEffect(() => {
    if (!isCustomLocation) {
      const match = effectiveLocations.find((l) => l.id === selectedLocationId);
      if (match && match.defaultContext) {
        setExtraContext(match.defaultContext);
      }
    }
  }, [selectedLocationId, isCustomLocation, effectiveLocations]);

  if (!isOpen) return null;

  const handleLocationSelect = (locId: string) => {
    if (locId === "custom_manual") {
      setIsCustomLocation(true);
      setSelectedLocationId("custom_manual");
      setExtraContext("Caller is inquiring about service details, scheduling, and next steps.");
    } else {
      setIsCustomLocation(false);
      setSelectedLocationId(locId);
      const match = effectiveLocations.find((l) => l.id === locId);
      if (match && match.defaultContext) {
        setExtraContext(match.defaultContext);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalling(true);
    setResultMessage(null);
    setDispatchStep(1);
    setProgressPercent(25);

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    const stepInterval = setInterval(() => {
      setDispatchStep((prev) => {
        if (prev === 1) {
          setProgressPercent(60);
          return 2;
        }
        if (prev === 2) {
          setProgressPercent(88);
          return 3;
        }
        return prev;
      });
    }, 20);

    const customLocationPayload = isCustomLocation
      ? {
          id: `loc_custom_${Date.now()}`,
          name: customNodeName.trim() || "Custom Practice Branch",
          industry: customIndustry,
          phone: fullE164Number,
          address: "Enterprise Dedicated SIP Node",
          hours: "Mon-Sat: 8:00 AM - 6:00 PM",
          services: customServices.split(",").map((s) => s.trim()).filter(Boolean),
          on_call_doctor: customDoctor.trim() || "Lead Specialist",
          average_ticket_value: 400
        }
      : undefined;

    const payload = {
      phoneNumber: fullE164Number,
      patientName: patientName.trim(),
      locationId: isCustomLocation ? undefined : selectedLocationId,
      customLocation: customLocationPayload,
      language: selectedLanguage,
      extraContext: extraContext.trim()
    };

    try {
      const res = await fetch("/api/trigger-overflow", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      clearInterval(stepInterval);
      setProgressPercent(100);
      setDispatchStep(4);

      if (data.ok) {
        setResultMessage({
          ok: true,
          text: `Live Call Dispatched! Run ID: ${data.runId}. Carrier gateway connected to ${fullE164Number}.`,
          runId: data.runId
        });
        if (onCallLaunched) onCallLaunched();
      } else {
        const errorText = data.error || (typeof data.details === "string" ? data.details : data.details?.error?.message) || "Telephony gateway returned an error.";
        setResultMessage({
          ok: false,
          text: errorText
        });
      }
    } catch {
      clearInterval(stepInterval);
      setResultMessage({
        ok: false,
        text: "Network handshake timeout connecting to CALL-E telephony gateway."
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
                Initiate Voice Call
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1B9A9C]/10 border border-[#1B9A9C]/20 text-[#1B9A9C]">
                {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && isUserLoggedIn
                  ? "⚡ Localhost Admin: Unlimited calls"
                  : "🛡️ 2 calls/day"}
              </span>
            </div>
            <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
              Experience autonomous sub-second voice operations in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#F3F5F4] dark:hover:bg-[#081426] transition-colors"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Destination Number & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Phone Number <span className="text-[#1B9A9C]">*</span>
              </label>

              {/* Country & Subscriber Number Selector */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#0B1930] dark:text-white outline-none cursor-pointer focus:border-[#1B9A9C]"
                  title="Select Target Country Code"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={subscriberNumber}
                  onChange={(e) => setSubscriberNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={selectedCountry.exampleNumber || "9810012345"}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Contact Name <span className="text-[#1B9A9C]">*</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Alex Taylor or Pawan Joshi"
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
              />
            </div>
          </div>

          {/* Spoken Language */}
          <div className="space-y-1">
            <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Spoken Language
            </label>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
              AI greets in selected language and automatically adapts if caller switches languages.
            </p>
          </div>

          {/* Practice Branch Node Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Branch Node / Location
              </label>
              <button
                type="button"
                onClick={() => handleLocationSelect(isCustomLocation ? "loc_downtown" : "custom_manual")}
                className="text-[11px] font-bold text-[#1B9A9C] hover:underline"
              >
                {isCustomLocation ? "← Choose Preset Node" : "+ Custom Branch Node"}
              </button>
            </div>

            {!isCustomLocation ? (
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
              >
                <optgroup label="Healthcare & Medical Networks">
                  {effectiveLocations
                    .filter((l) => !l.industry || l.industry === "Healthcare")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Automotive Dealerships & Service Hubs">
                  {effectiveLocations
                    .filter((l) => l.industry === "Automotive")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Legal & Corporate Advisory">
                  {effectiveLocations
                    .filter((l) => l.industry === "Legal")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Hospitality & Concierge">
                  {effectiveLocations
                    .filter((l) => l.industry === "Hospitality")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Real Estate & Property Management">
                  {effectiveLocations
                    .filter((l) => l.industry === "Real Estate")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.on_call_doctor})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Custom Options">
                  <option value="custom_manual">+ Custom Practice Branch Node (Manual Entry)...</option>
                </optgroup>
              </select>
            ) : (
              /* Custom Branch Builder Inputs */
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#1B9A9C]/40 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1B9A9C] uppercase tracking-wider font-mono">
                    Custom Manual Node Configuration
                  </span>
                  <span className="text-[10px] bg-[#1B9A9C]/10 text-[#1B9A9C] px-2 py-0.5 rounded-full font-bold">
                    Custom Node Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Business / Practice Name
                    </label>
                    <input
                      type="text"
                      value={customNodeName}
                      onChange={(e) => setCustomNodeName(e.target.value)}
                      placeholder="e.g. Apex Global Solutions"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    >
                      <option value="Healthcare">Healthcare & Medical</option>
                      <option value="Automotive">Automotive & Fleet</option>
                      <option value="Legal">Legal & Advisory</option>
                      <option value="Hospitality">Hospitality & Concierge</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="General">General Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      On-Call Specialist
                    </label>
                    <input
                      type="text"
                      value={customDoctor}
                      onChange={(e) => setCustomDoctor(e.target.value)}
                      placeholder="e.g. Dr. Jordan Lee, Specialist"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#667085] dark:text-[#9BA8B8] mb-1">
                      Offered Specialties
                    </label>
                    <input
                      type="text"
                      value={customServices}
                      onChange={(e) => setCustomServices(e.target.value)}
                      placeholder="e.g. Inquiries, Repairs, VIP Booking"
                      className="w-full bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-2.5 py-1.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Context / Prompt Goals */}
          <div className="space-y-1">
            <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Context & Special Instructions
            </label>
            <textarea
              rows={2}
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="e.g. Confirm follow-up appointment or inquire about project consultation."
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl p-2.5 text-xs text-[#0B1930] dark:text-white focus:border-[#1B9A9C] outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Live Multi-Step Telemetry Pipeline while calling */}
          {isCalling && (
            <LiveCallTelemetry
              progressPercent={progressPercent}
              dispatchStep={dispatchStep}
              selectedLanguage={selectedLanguage}
              fullE164Number={fullE164Number}
            />
          )}

          {/* Result / Error Banner */}
          <CallResultBanner
            resultMessage={resultMessage}
            liveCallStatus={liveCallStatus}
            liveCallSummary={liveCallSummary}
            fullE164Number={fullE164Number}
          />

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#F3F5F4] dark:bg-[#081426] hover:bg-[#E4E8E7] text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC] transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isCalling}
              className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-elevated transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Icons.PhoneCall className="w-4 h-4 text-[#1B9A9C]" />
              <span>{isCalling ? "Connecting Telephony..." : "Place Real Audio Call"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

