"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

export default function SolutionsPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<"healthcare" | "automotive" | "legal" | "homeservices">("healthcare");

  const solutions = {
    healthcare: {
      title: "Healthcare Networks & Multi-Branch Clinics",
      tagline: "Preventive Recall, Post-Op Care & Emergency Triage",
      desc: "Healthcare practices lose uncaptured revenue when patients ring during peak hours or neglect preventive checkups. Relay intercepts overflow calls in under 14 seconds and executes multilingual batch recalls with verified EHR calendar commitments.",
      metrics: [
        { label: "Hygiene Recall Conversion", val: "42.8%" },
        { label: "Speed to Intercept", val: "< 14s" },
        { label: "Patient Satisfaction", val: "98.2%" }
      ],
      features: [
        "Automated post-operative follow-up calls in the patient's native dialect (Hindi, Nepali, Spanish, English).",
        "Direct Google Calendar and EHR appointment booking with Free/Busy slot verification.",
        "Zero-Harm Fail-Closed protocol: critical distress keywords immediately halt automation and alert the on-call medical director via SMS.",
        "Excel batch engine: upload overdue recall patient lists and schedule autonomous calls with regulated pacing."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Namaste Aarav! I noticed you called our dental clinic earlier. Dr. Sarah has an opening for your follow-up checkup on Friday at 11:30 AM. Would you like me to reserve that slot for you?"
      }
    },
    automotive: {
      title: "Automotive Dealerships & Service Centers",
      tagline: "Factory Recall Campaigns, Service Bay Booking & Inbound Lead Capture",
      desc: "Dealership service bays run under capacity while parts recall campaigns stall in manual phone queues. Relay contacts vehicle owners, explains parts readiness, and reserves technician service bays.",
      metrics: [
        { label: "Recall Campaign Booking Rate", val: "51.4%" },
        { label: "Service Bay Utilization", val: "+28%" },
        { label: "Average Value per Completed Recall", val: "$480" }
      ],
      features: [
        "Instant manufacturer VIN recall notifications with direct calendar slot booking for repairs.",
        "Inbound sales overflow: capture buyers asking about new inventory before they call competing dealers.",
        "Scheduled maintenance reminders (oil changes, tire rotations, brake inspections) synced to CRM.",
        "Automatic SMS confirmations with dealership address and technician check-in instructions."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Hello Priya! Apex Motors is reaching out regarding your vehicle's scheduled 30,000-mile inspection. Our certified master technician has an open service bay on Tuesday at 9:00 AM. Shall I confirm that appointment?"
      }
    },
    legal: {
      title: "Legal Practices & Corporate Advisory",
      tagline: "High-Value Client Intake, Confidential Triage & Retainer Scheduling",
      desc: "Prospective legal clients calling after hours or during trials often hire the first firm that answers. Relay answers immediately with professional confidentiality, logs structured case facts, and books paid consultation slots.",
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
      title: "Field Operations & Emergency Dispatch",
      tagline: "24/7 Missed Call Intercept, Urgent Dispatch & Job Scheduling",
      desc: "Contractors miss high-ticket emergency jobs when technicians are on site or driving. Relay answers immediately 24/7, captures the job address and urgency, and alerts the closest team.",
      metrics: [
        { label: "Emergency Call Capture", val: "99.1%" },
        { label: "Average Job Value", val: "$620" },
        { label: "Dispatch Response Time", val: "< 2 mins" }
      ],
      features: [
        "24/7/365 live voice answering with zero hold time and zero answering service delays.",
        "Urgent emergency failure triage with instant SMS push to on-call master technicians.",
        "Address parsing and automated job slot reservation in the dispatch calendar.",
        "Two-way SMS updates sent to the property owner with technician arrival estimates."
      ],
      sampleTurn: {
        speaker: "Sarah (Relay AI)",
        text: "Thank you for calling Apex 24/7 Emergency Services. I understand you have an urgent HVAC failure at your location. I have logged your address and dispatched our on-call specialist to contact you in under two minutes."
      }
    }
  };

  const curr = solutions[selectedIndustry];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#081220] text-[#0B1930] dark:text-[#F8FAFC] flex flex-col selection:bg-[#1B9A9C]/20 transition-colors">
      <PublicHeader />

      <main className="flex-1 flex flex-col animate-page-entrance">
        {/* Hero Section */}
        <section className="px-6 sm:px-10 lg:px-16 pt-16 pb-10 max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] text-xs font-semibold text-[#1B9A9C] dark:text-[#2EC4C0]">
            <span className="w-2 h-2 rounded-full bg-[#1B9A9C] dark:bg-[#2EC4C0]" />
            <span>Industry Solutions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-[#0B1930] dark:text-[#F8FAFC]">
            Autonomous Voice Operations Built for Your Industry
          </h1>

          <p className="text-sm sm:text-base text-[#5B6B82] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Whether you run a multi-location clinic network, automotive dealership, or legal advisory practice, Relay eliminates missed revenue and automates phone workflows.
          </p>

          {/* Industry Tabs */}
          <div className="pt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#F3F5F4] dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] flex-wrap justify-center">
              {(
                [
                  { id: "healthcare", label: "Healthcare & Dental", icon: Icons.Activity },
                  { id: "automotive", label: "Automotive & Fleet", icon: Icons.Cpu },
                  { id: "legal", label: "Legal & Advisory", icon: Icons.Layers },
                  { id: "homeservices", label: "Field & Emergency", icon: Icons.PhoneIncoming }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isSel = selectedIndustry === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedIndustry(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSel
                        ? "bg-white dark:bg-[#13243C] text-[#0B1930] dark:text-[#F8FAFC] shadow-xs"
                        : "text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930] dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSel ? "text-[#1B9A9C] dark:text-[#2EC4C0]" : "text-[#5B6B82] dark:text-[#94A3B8]"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Selected Industry Detail */}
        <section className="px-6 sm:px-10 lg:px-16 py-8 max-w-6xl mx-auto w-full flex-1">
          <div className="bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
            <div className="space-y-2 pb-6 border-b border-[#E4E8E7] dark:border-[#1E3048]">
              <span className="text-xs font-mono font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] uppercase tracking-wider">
                {curr.tagline}
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                {curr.title}
              </h2>
              <p className="text-sm text-[#5B6B82] dark:text-[#94A3B8] max-w-3xl leading-relaxed pt-1">
                {curr.desc}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {curr.metrics.map((m, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] space-y-1 text-center sm:text-left"
                >
                  <span className="text-[11px] font-mono uppercase text-[#5B6B82] dark:text-[#94A3B8] font-semibold">
                    {m.label}
                  </span>
                  <div className="text-3xl font-heading font-extrabold text-[#1B9A9C] dark:text-[#2EC4C0]">
                    {m.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Capabilities */}
            <div className="space-y-4">
              <h3 className="text-base font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Autonomous Workflow Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {curr.features.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] flex items-start gap-3"
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

            {/* Sample Turn */}
            <div className="p-5 rounded-xl bg-[#0B1930] dark:bg-[#081220] border border-[#1E3048] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-[#2EC4C0]">
                <span>SAMPLE CONVERSATIONAL TURN • {curr.sampleTurn.speaker}</span>
                <span className="text-[#16A34A] flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Verified Neural Voice
                </span>
              </div>
              <p className="text-[#F8FAFC] leading-relaxed text-sm">
                &ldquo;{curr.sampleTurn.text}&rdquo;
              </p>
            </div>

            {/* Call to Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E4E8E7] dark:border-[#1E3048]">
              <div>
                <div className="text-sm font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Ready to deploy Relay for your organization?
                </div>
                <div className="text-xs text-[#5B6B82] dark:text-[#94A3B8]">
                  Connect your business phone trunks in under 5 minutes with zero hardware changes.
                </div>
              </div>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#0B1930] dark:bg-[#2EC4C0] dark:text-[#081220] hover:bg-[#15294A] text-white font-semibold text-xs shadow-xs transition-colors flex-shrink-0"
              >
                Sign In to Console &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
