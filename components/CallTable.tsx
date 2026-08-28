"use client";

import React from "react";
import { Icons } from "./Icons";
import { CallRecord, ClinicLocation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface CallTableProps {
  calls: CallRecord[];
  locations: ClinicLocation[];
  onSelectCall: (call: CallRecord) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CallTable({
  calls,
  locations,
  onSelectCall,
  activeFilter,
  onFilterChange
}: CallTableProps) {
  const getLocationName = (locId: string) => {
    return locations.find((l) => l.id === locId)?.name || locId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            COMPLETED
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2F6FED]/10 text-[#2F6FED] border border-[#2F6FED]/30 animate-pulse font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED]" />
            LIVE DIALING
          </span>
        );
      case "planning":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            PLANNING
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
            NO ANSWER
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "inbound_missed":
      case "inbound_overflow":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A]">
            Inbound
          </span>
        );
      case "batch_followup":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20">
            Excel Batch
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3F5F4] dark:bg-[#081426] text-[#667085] dark:text-[#9BA8B8] border border-[#E4E8E7] dark:border-[#20324A]">
            Outreach
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
          <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">
            Live Telephony & Intake Stream
          </h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F3F5F4] dark:bg-[#081426] text-[#667085] dark:text-[#9BA8B8] border border-[#E4E8E7] dark:border-[#20324A]">
            {calls.length} Interactions
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#FAFAF8] dark:bg-[#081426] p-1 rounded-xl border border-[#E4E8E7] dark:border-[#20324A] text-xs">
          {[
            { id: "all", label: "All Streams" },
            { id: "inbound_missed", label: "Inbound Overflow" },
            { id: "batch_followup", label: "Excel Batch" },
            { id: "outbound_recall", label: "Client Recall" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === f.id
                  ? "bg-white dark:bg-[#10223A] text-[#0B1930] dark:text-[#F8FAFC] shadow-sm"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-[#FAFAF8] dark:bg-[#081426] text-[10px] uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8] font-bold font-mono">
              <th className="py-3.5 px-4">Caller / Contact</th>
              <th className="py-3.5 px-4">Stream</th>
              <th className="py-3.5 px-4">Branch Node</th>
              <th className="py-3.5 px-4">Outcome & Structured Notes</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
            {calls.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[#667085] dark:text-[#9BA8B8]">
                  No call records found matching active filter.
                </td>
              </tr>
            ) : (
              calls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call)}
                  className="hover:bg-[#FAFAF8] dark:hover:bg-[#081426]/70 transition-colors cursor-pointer group"
                >
                  {/* Caller info with NO unwrapped phone number */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] group-hover:text-[#1B9A9C] transition-colors">
                      {call.patientName}
                    </div>
                    <div className="text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8] whitespace-nowrap">
                      {call.phoneNumber}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTypeBadge(call.callType)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#0B1930] dark:text-[#F8FAFC]">
                    {getLocationName(call.locationId)}
                  </td>

                  {/* Outcome & Notes */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate">
                      {call.structuredOutcome?.notes || "Interaction completed and synced."}
                    </div>
                    {call.structuredOutcome?.appointment?.booked && (
                      <span className="text-[10px] text-[#1B9A9C] font-mono font-semibold block mt-0.5">
                        • Slot Booked: {call.structuredOutcome.appointment.datetime || "Confirmed"}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(call.status)}
                  </td>

                  {/* Revenue */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                    {call.recoveredRevenue
                      ? `$${call.recoveredRevenue.toLocaleString("en-US")}`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
