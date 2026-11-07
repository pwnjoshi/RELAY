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
      title: "Calls Handled",
      value: stats ? stats.totalCalls.toLocaleString() : "0",
      subtext: `${stats?.completedCalls || 0} completed • ${stats?.urgentEscalations || 0} urgent escalations`,
      icon: Icons.PhoneCall,
    },
    {
      title: "Booking Capture Rate",
      value: stats ? `${stats.captureRate}%` : "0%",
      subtext: `${stats?.bookedCalls || 0} appointments confirmed`,
      icon: Icons.Calendar,
    },
    {
      title: "Recovered Revenue",
      value: stats ? `$${stats.totalRevenueRecovered.toLocaleString("en-US")}` : "$0",
      subtext: "Recaptured from overflow & recalls",
      icon: Icons.DollarSign,
    },
    {
      title: "Average Answer Latency",
      value: "< 14s",
      subtext: "PBX SIP carrier intercept",
      icon: Icons.Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-xl p-5 shadow-xs hover:border-[#1B9A9C] dark:hover:border-[#2EC4C0] transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5B6B82] dark:text-[#94A3B8]">
                {card.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F3F5F4] dark:bg-[#13243C] text-[#1B9A9C] dark:text-[#2EC4C0] flex items-center justify-center border border-[#E4E8E7] dark:border-[#1E3048]">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-2xl font-bold font-heading text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-[#5B6B82] dark:text-[#94A3B8]">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
