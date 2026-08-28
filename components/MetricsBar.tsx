"use client";

import React from "react";
import { DashboardStats } from "@/lib/types";
import { Icons } from "./Icons";

interface MetricsBarProps {
  stats: DashboardStats | null;
}

export function MetricsBar({ stats }: MetricsBarProps) {
  const cards = [
    {
      title: "Live Calls Captured",
      value: stats ? stats.totalCalls.toString() : "0",
      subtext: `${stats?.completedCalls || 0} completed • 1 active`,
      icon: Icons.PhoneCall,
      highlight: true
    },
    {
      title: "Appointment Conversion",
      value: stats ? `${stats.captureRate}%` : "0%",
      subtext: `${stats?.bookedCalls || 0} slots confirmed`,
      icon: Icons.Calendar,
      highlight: false
    },
    {
      title: "Revenue Recovered",
      value: stats ? `$${stats.totalRevenueRecovered.toLocaleString("en-US")}` : "$0",
      subtext: "From missed front-desk rings",
      icon: Icons.DollarSign,
      highlight: false
    },
    {
      title: "Avg Speed to Answer",
      value: "14.2s",
      subtext: "Target: < 30s PBX intercept",
      icon: Icons.Clock,
      highlight: false
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 shadow-subtle hover:border-[#0B1930] dark:hover:border-[#F8FAFC] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085] dark:text-[#9BA8B8]">{card.title}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex items-center justify-center border border-[#E4E8E7] dark:border-[#20324A]">
              <card.icon className="w-4 h-4 text-[#1B9A9C]" />
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-2xl font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: card.subtext }} />
          </div>
        </div>
      ))}
    </div>
  );
}
