"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import { ClinicLocation } from "@/lib/types";

interface BranchKnowledgeModalProps {
  isOpen: boolean;
  location: ClinicLocation | null;
  onClose: () => void;
  onSave: (updatedLocation: ClinicLocation) => void;
}

export function BranchKnowledgeModal({
  isOpen,
  location,
  onClose,
  onSave
}: BranchKnowledgeModalProps) {
  const [knowledgeText, setKnowledgeText] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  const [ticketValue, setTicketValue] = useState(400);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (location) {
      setKnowledgeText(
        location.knowledge_base ||
          `Official grounded FAQ context for ${location.name}. Services offered: ${location.services?.join(", ") || "General Services"}. On-call specialist: ${location.on_call_doctor || "Lead Specialist"}.`
      );
      setDoctorName(location.on_call_doctor || "Lead Specialist");
      setServicesInput(location.services?.join(", ") || "Consultation & Services");
      setTicketValue(location.average_ticket_value || 400);
      setSaveSuccess(false);
    }
  }, [location]);

  if (!isOpen || !location) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClinicLocation = {
      ...location,
      on_call_doctor: doctorName.trim(),
      services: servicesInput.split(",").map((s) => s.trim()).filter(Boolean),
      average_ticket_value: Number(ticketValue) || 400,
      knowledge_base: knowledgeText.trim()
    };
    onSave(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in relative text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20 flex items-center justify-center font-bold font-mono text-sm">
              <Icons.BookOpen className="w-4 h-4 text-[#1B9A9C]" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-[#1B9A9C] uppercase tracking-wider block">
                Grounded RAG Knowledge Base
              </span>
              <h3 className="font-heading font-extrabold text-base text-[#0B1930] dark:text-[#F8FAFC]">
                {location.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                On-Call Lead Specialist
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Average Ticket / Consultation Value ($)
              </label>
              <input
                type="number"
                value={ticketValue}
                onChange={(e) => setTicketValue(Number(e.target.value))}
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
              Offered Specialties & Services (Comma separated)
            </label>
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Branch RAG Knowledge Base & FAQ Context
              </label>
              <span className="text-[10px] font-mono text-[#1B9A9C]">
                Neural RAG Ingestion Active
              </span>
            </div>
            <textarea
              rows={5}
              value={knowledgeText}
              onChange={(e) => setKnowledgeText(e.target.value)}
              placeholder="Paste grounded website FAQs, pricing lists, branch policies, or special instructions here..."
              className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl p-3 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C] leading-relaxed"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-mono text-[#16A34A] font-bold animate-fade-in flex items-center justify-between">
              <span>✓ RAG Knowledge Base Synced for {location.name}!</span>
              <span>VECTOR DB INDEXED</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8E7] dark:border-[#20324A]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#0B1930] dark:hover:text-white font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold shadow-card transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Icons.Zap className="w-3.5 h-3.5 text-[#32C4BE]" />
              <span>Sync Knowledge Base</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
