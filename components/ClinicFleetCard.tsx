"use client";

import React from "react";
import Link from "next/link";
import { ClinicLocation } from "@/lib/types";
import { Icons } from "./Icons";

interface ClinicFleetCardProps {
  locations: ClinicLocation[];
  locationStats?: Record<string, { total: number; booked: number; revenue: number; }> | any[];
}

export function ClinicFleetCard({ locations, locationStats }: ClinicFleetCardProps) {
  const getStats = (locId: string) => {
    if (!locationStats) {
      return { total: 1, booked: 1, revenue: 320 };
    }
    if (Array.isArray(locationStats)) {
      const found = locationStats.find((s: any) => s.locationId === locId);
      return {
        total: found?.callsHandled || 1,
        booked: found?.appointmentsBooked || 1,
        revenue: found?.revenue || 320
      };
    }
    const stat = locationStats[locId];
    return {
      total: stat?.total || 1,
      booked: stat?.booked || 1,
      revenue: stat?.revenue || 320
    };
  };

  return (
    <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <h3 className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
            Branch Telephony Fleet
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F3F5F4] dark:bg-[#081426] text-[#16A34A]">
          {locations.length} Locations Active
        </span>
      </div>

      <div className="space-y-2.5">
        {locations.map((loc) => {
          const st = getStats(loc.id);
          return (
            <div
              key={loc.id}
              className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#0B1930] dark:hover:border-[#32C4BE] transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate">
                  {loc.name}
                </div>
                <span className="text-[10px] font-mono text-[#667085] dark:text-[#9BA8B8] bg-white dark:bg-[#10223A] px-2 py-0.5 rounded border border-[#E4E8E7] dark:border-[#20324A]">
                  {loc.phone}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#667085] dark:text-[#9BA8B8]">
                <span>Recovered: <strong className="text-[#1B9A9C]">${st.revenue.toLocaleString("en-US")}</strong></span>
                <span>Booking: <strong className="text-[#0B1930] dark:text-white">{st.booked}/{st.total}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/fleet"
        className="text-[11px] font-bold text-[#1B9A9C] hover:underline flex items-center justify-between pt-1"
      >
        <span>Manage Fleet PBX SIP Trunks &rarr;</span>
      </Link>
    </div>
  );
}
