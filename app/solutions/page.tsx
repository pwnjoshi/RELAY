"use client";
import React, { useState } from "react";
import Link from "next/link";
import { RelayLogo } from "@/components/RelayLogo";
import { Icons } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function SolutionsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<"healthcare" | "automotive" | "legal" | "homeservices">("healthcare");

  const solutions = {
    healthcare: {
      title: "Healthcare Networks & Multi-Branch Clinics",
      tagline: "Preventive Recall, Post-Op Care & Zero-Harm Emergency Triage",
      desc: "Healthcare practices lose thousands in uncaptured revenue when patients ring during peak hours or neglect annual hygiene appointments. Relay intercepts overflow calls in under 14s and runs multilingual batch recalls.",
      metrics: [
        { label: "Hygiene Recall Conversion", val: "42.8%" },
        { label: "Speed to Intercept", val: "< 14s" },
        { label: "Patient Satisfaction (CSAT)", val: "98.2%" }
      ],
      features: [
        "Automated post-operative follow-up calls in patient's native dialect (Hindi, Nepali, Spanish, English).",
        "Direct Google Calendar & EHR appointment booking with Free/Busy slot verification.",
        "Zero-Harm Fail-Closed protocol: critical distress keywords immediately halt automation and alert the on-call medical director via SMS.",
        "Excel batch engine: upload 500 overdue recall patients and schedule autonomous calls in parallel."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Namaste Aarav! I noticed you called our dental clinic earlier. Dr. Sarah has an opening for your follow-up checkup on Friday at 11:30 AM. Would you like me to reserve that slot for you?"
      }
    },
    automotive: {
      title: "Automotive Dealerships & Service Centers",
      tagline: "Factory Recall Campaigns, Service Bay Booking & Inbound Lead Capture",
      desc: "Dealership service bays run under-capacity while parts recall campaigns stall in manual phone queues. Relay dials hundreds of affected vehicle owners simultaneously and schedules technician time slots.",
      metrics: [
        { label: "Recall Campaign Booking Rate", val: "51.4%" },
        { label: "Service Bay Utilization", val: "+28%" },
        { label: "Avg Revenue per Completed Recall", val: "$480" }
      ],
      features: [
        "Instant manufacturer VIN recall notifications with direct calendar slot booking for repairs.",
        "Inbound sales overflow: capture buyers asking about new inventory before they call competing dealers.",
        "Scheduled maintenance reminders (oil changes, tire rotations, brake inspections) synced to CRM.",
        "Automatic SMS confirmations with dealership address and technician instructions."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Hello Priya! Apex Motors is reaching out regarding your vehicle's scheduled 30,000-mile inspection. Our certified master technician has an open service bay on Tuesday at 9:00 AM. Shall I confirm that appointment?"
      }
    },
    legal: {
      title: "Legal Practices & Corporate Advisory",
      tagline: "High-Value Client Intake, Confidential Triage & Retainer Scheduling",
      desc: "Prospective legal clients calling after-hours or during trials often hire the first firm that answers. Relay answers instantly with professional confidentiality, logs structured case facts, and books paid consultation slots.",
      metrics: [
        { label: "Lead Capture Rate", val: "94.6%" },
        { label: "Average Consultation Fee", val: "$450" },
        { label: "Client Data Privacy", val: "100% Masked" }
      ],
      features: [
        "Confidential multi-step intake triage with customizable legal questionnaires.",
        "Zero-Leakage calendar booking: attorney schedules are queried as 'Busy' without exposing private client names.",
        "Emergency retainer triage: urgent court or custody filings trigger instant SMS to partner attorneys.",
        "Complete auditable call transcripts and structured JSON notes committed to practice management software."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Good afternoon. You've reached Sterling & Associates Legal Advisory. I can schedule your initial confidential consultation with Managing Partner Alexander Sterling for Thursday at 2:00 PM. Would you like me to reserve this time?"
      }
    },
    homeservices: {
      title: "Home Services & Emergency Field Dispatch",
      tagline: "24/7 Missed Call Intercept, Urgent Dispatch & Job Quoting",
      desc: "Plumbing, electrical, and HVAC contractors miss high-ticket emergency jobs when technicians are in the field. Relay answers immediately 24/7, captures the job address and urgency, and dispatches the closest team.",
      metrics: [
        { label: "Emergency Call Capture", val: "99.1%" },
        { label: "Average Job Value", val: "$620" },
        { label: "Dispatch Response Time", val: "< 2 mins" }
      ],
      features: [
        "24/7/365 live voice answering with zero hold time and zero answering service delays.",
        "Urgent emergency water/heating failure triage with instant SMS push to on-call master technicians.",
        "Address geocoding and automated job slot reservation in field service calendar.",
        "Two-way SMS updates sent to the homeowner with technician arrival estimates."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Thank you for calling Apex 24/7 Emergency Home Services. I understand you have a heating failure at your home. I have logged your address and dispatched our on-call HVAC specialist to contact you in under two minutes."
      }
    }
  };

  const curr = solutions[selectedIndustry];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors animate-page-entrance">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-6 sm:px-12 pt-16 pb-10 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] text-xs font-semibold text-[#1B9A9C]">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <span>Industry Solutions</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
          Autonomous Voice Operations Built for Your Industry
        </h1>

        <p className="text-sm sm:text-base text-[#667085] dark:text-[#9BA8B8] max-w-2xl mx-auto leading-relaxed">
          Whether you run a multi-location clinic network, auto dealership, or legal practice, Relay eliminates missed revenue and automates phone workflows.
        </p>

        {/* Industry Tabs */}
        <div className="pt-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#F4F6F5]/90 dark:bg-[#0E1E36]/90 border border-[#E2E8E7] dark:border-[#1E324F] shadow-inner backdrop-blur-md flex-wrap justify-center">
            {[
              { id: "healthcare", label: "Healthcare & Clinics", icon: Icons.Shield },
              { id: "automotive", label: "Auto Dealerships", icon: Icons.Building },
              { id: "legal", label: "Legal & Advisory", icon: Icons.Layers },
              { id: "homeservices", label: "Field & Home Services", icon: Icons.PhoneIncoming }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = selectedIndustry === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedIndustry(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSel
                      ? "bg-white dark:bg-[#162A48] text-[#0B1930] dark:text-[#F8FAFC] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.35)] border border-[#E2E8E7]/90 dark:border-[#2A4368]"
                      : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white hover:bg-white/40 dark:hover:bg-[#162A48]/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSel ? "text-[#1B9A9C]" : "text-[#98A2B3]"}`} />
                  <span>{tab.label}</span>
                  {isSel && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C] shadow-[0_0_6px_#1B9A9C] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Selected Industry Detail Showcase */}
      <section className="px-6 sm:px-12 py-8 max-w-6xl mx-auto w-full flex-1">
        <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 sm:p-10 shadow-elevated space-y-8">
          <div className="space-y-2 pb-6 border-b border-[#E4E8E7] dark:border-[#20324A]">
            <span className="text-xs font-mono font-bold text-[#1B9A9C] uppercase tracking-wider">
              {curr.tagline}
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              {curr.title}
            </h2>
            <p className="text-sm text-[#667085] dark:text-[#9BA8B8] max-w-3xl leading-relaxed pt-1">
              {curr.desc}
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {curr.metrics.map((m, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-1 text-center sm:text-left"
              >
                <span className="text-[11px] font-mono uppercase text-[#667085] dark:text-[#9BA8B8] font-bold">
                  {m.label}
                </span>
                <div className="text-3xl font-heading font-black text-[#1B9A9C]">
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* Key Workflow Capabilities */}
          <div className="space-y-4">
            <h3 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Autonomous Workflow Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {curr.features.map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-[#0B1930] dark:text-[#F8FAFC] leading-relaxed">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Dialogue Bubble */}
          <div className="p-5 rounded-xl bg-[#081426] border border-[#20324A] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#32C4BE]">
              <span>SAMPLE VOICE TURN &bull; {curr.sampleTurn.speaker}</span>
              <span className="text-[#16A34A] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Live Neural Voice Audio
              </span>
            </div>
            <p className="text-[#F8FAFC] leading-relaxed font-sans text-sm">
              &quot;{curr.sampleTurn.text}&quot;
            </p>
          </div>

          {/* Call to Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E4E8E7] dark:border-[#20324A]">
            <div>
              <div className="text-sm font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Ready to deploy Relay for {curr.title.split(" ")[0]}?
              </div>
              <div className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                Connect your business phone system in under 5 minutes with zero infrastructure changes.
              </div>
            </div>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 flex-shrink-0"
            >
              Sign In to Deploy &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
