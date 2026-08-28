"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { RelayLogo } from "@/components/RelayLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form State
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("healthcare");
  const [primaryLang, setPrimaryLang] = useState("hi");
  const [operatingHours, setOperatingHours] = useState("09:00 - 18:00");
  const [forwardingPhone, setForwardingPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.user) {
          setCurrentUser(d.user);
          if (!workspaceName && d.user.name) {
            setWorkspaceName(`${d.user.name}'s Organization`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleComplete = () => {
    setIsSaving(true);
    // Save preferences in sessionStorage
    try {
      sessionStorage.setItem(
        "relay_onboarding_config",
        JSON.stringify({
          workspaceName: workspaceName || "Main Workspace",
          industry,
          primaryLang,
          operatingHours,
          forwardingPhone
        })
      );
    } catch {}

    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-[#1B9A9C]/20 transition-colors">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RelayLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC]">
            Welcome to Relay Voice Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-[#9BA8B8]">
            Let&apos;s configure your workspace in a few quick steps.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] shadow-sm">
          {[
            { num: 1, label: "Workspace" },
            { num: 2, label: "Voice & Language" },
            { num: 3, label: "Staff & IAM" }
          ].map((st, i) => (
            <div key={st.num} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  step === st.num
                    ? "bg-[#0B1930] dark:bg-[#1B9A9C] text-white"
                    : step > st.num
                    ? "bg-[#16A34A] text-white"
                    : "bg-[#FAFAF8] dark:bg-[#081426] text-[#98A2B3] border border-[#E4E8E7] dark:border-[#20324A]"
                }`}
              >
                {step > st.num ? "✓" : st.num}
              </span>
              <span className="text-xs font-heading font-semibold text-[#0B1930] dark:text-[#F8FAFC] hidden sm:inline">
                {st.label}
              </span>
              {i < 2 && <span className="text-[#E4E8E7] dark:text-[#20324A] mx-2">─</span>}
            </div>
          ))}
        </div>

        {/* Step Cards Container */}
        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-8 shadow-elevated space-y-6">
          {/* STEP 1: Workspace & Industry */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Step 1: Organization Workspace
                </h2>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                  Set up your business profile and industry operational model.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                  Workspace / Organization Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Apex Health & Dental Clinic"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                  Primary Industry Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "healthcare", label: "Healthcare & Clinics", icon: Icons.Shield },
                    { id: "automotive", label: "Auto Dealerships", icon: Icons.Building },
                    { id: "legal", label: "Legal & Advisory", icon: Icons.Layers },
                    { id: "homeservices", label: "Field & Home Services", icon: Icons.PhoneIncoming }
                  ].map((ind) => {
                    const Icon = ind.icon;
                    const isSel = industry === ind.id;
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => setIndustry(ind.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#1B9A9C]/10 border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] font-bold shadow-sm"
                            : "bg-[#FAFAF8] dark:bg-[#081426] border-[#E4E8E7] dark:border-[#20324A] text-[#667085] dark:text-[#9BA8B8] hover:border-[#1B9A9C]/50"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSel ? "text-[#1B9A9C]" : "text-[#98A2B3]"}`} />
                        <span className="text-xs">{ind.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 cursor-pointer"
                >
                  Continue to Voice Setup &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Voice & Telephony */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Step 2: Voice & Answering Rules
                </h2>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                  Choose your default AI agent dialect and business answering schedule.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                  Default Speech Language
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "hi", label: "हिन्दी / Hindi & English", sub: "Automatic code-switching" },
                    { id: "ne", label: "नेपाली / Nepali", sub: "Fluent natural voice" },
                    { id: "es", label: "Español / Spanish", sub: "Latin American & European" },
                    { id: "en", label: "English", sub: "US & UK native models" }
                  ].map((lang) => {
                    const isSel = primaryLang === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setPrimaryLang(lang.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#1B9A9C]/10 border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] shadow-sm"
                            : "bg-[#FAFAF8] dark:bg-[#081426] border-[#E4E8E7] dark:border-[#20324A] text-[#667085] dark:text-[#9BA8B8] hover:border-[#1B9A9C]/50"
                        }`}
                      >
                        <div className="text-xs font-bold">{lang.label}</div>
                        <div className="text-[10px] text-[#98A2B3]">{lang.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="09:00 - 18:00"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC]">
                    Emergency On-Call Mobile
                  </label>
                  <input
                    type="tel"
                    value={forwardingPhone}
                    onChange={(e) => setForwardingPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none focus:border-[#1B9A9C] transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 cursor-pointer"
                >
                  Continue to Staff & IAM &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Staff & IAM Overview */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Step 3: Staff Management & IAM Roles
                </h2>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                  How user permissions work in your Relay workspace.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1B9A9C]/10 border border-[#1B9A9C]/20 flex items-center justify-center flex-shrink-0 text-[#1B9A9C]">
                    <Icons.Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                      Admin-Controlled Staff Provisioning
                    </div>
                    <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8] leading-relaxed">
                      Staff, operator, and clinic branch accounts are created and managed by administrators directly inside the <strong>IAM & Access Management</strong> console.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E4E8E7]/50 dark:border-[#20324A]/50">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[11px]">
                    <div className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">🛡️ Workspace Admin (You)</div>
                    <div className="text-[#667085] dark:text-[#9BA8B8] text-[10px] mt-0.5">Full access to telephony, billing, and IAM staff invitations.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-[11px]">
                    <div className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">👥 Operators & Staff</div>
                    <div className="text-[#667085] dark:text-[#9BA8B8] text-[10px] mt-0.5">Assigned to specific department queues and call logs.</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleComplete}
                  className="px-7 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching Console...</span>
                    </>
                  ) : (
                    <span>Launch Operations Console &rarr;</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
