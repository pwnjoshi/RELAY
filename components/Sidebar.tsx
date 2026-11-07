"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RelayLogo } from "./RelayLogo";
import { Icons } from "./Icons";
import { BudgetStatus, Department } from "@/lib/types";
import { useConsole } from "@/lib/console-context";

interface SidebarProps {
  budget?: BudgetStatus;
  callCount?: number;
  departments?: Department[];
  activeDeptId?: string;
  onDepartmentChange?: (deptId: string) => void;
}

export function Sidebar({
  callCount = 0,
  onDepartmentChange
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, departments: deptList, activeDeptId: currentDept, setActiveDeptId } = useConsole();
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setIsDeptMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeptSelect = async (deptId: string) => {
    setActiveDeptId(deptId);
    setIsDeptMenuOpen(false);
    if (onDepartmentChange) onDepartmentChange(deptId);
  };

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { href: "/dashboard", label: "Operations Console", icon: Icons.Activity },
        { href: "/calls", label: "Call Stream", icon: Icons.PhoneIncoming, count: callCount },
        { href: "/batch", label: "Batch Recall", icon: Icons.FileSpreadsheet },
        { href: "/analytics", label: "Voice Analytics", icon: Icons.BarChart },
        { href: "/campaigns", label: "Outreach Studio", icon: Icons.Users },
      ]
    },
    {
      title: "NETWORK",
      items: [
        { href: "/fleet", label: "Telephony Fleet", icon: Icons.Building },
        { href: "/integrations", label: "Integrations", icon: Icons.Layers },
      ]
    },
    {
      title: "ADMINISTRATION",
      items: [
        { href: "/iam", label: "Team & Access", icon: Icons.Shield },
        { href: "/billing", label: "Plans & Usage", icon: Icons.CreditCard },
        { href: "/settings", label: "PBX & Settings", icon: Icons.Settings },
      ]
    },
    {
      title: "DEVELOPERS",
      items: [
        { href: "/diagnostics", label: "Gateway Diagnostics", icon: Icons.Cpu },
        { href: "/docs", label: "Developer Docs", icon: Icons.FileText },
      ]
    }
  ];

  const selectedDeptObj = deptList.find((d) => d.id === currentDept);

  return (
    <aside className="w-64 bg-white dark:bg-[#0E1B2E] border-r border-[#E4E8E7] dark:border-[#1E3048] flex flex-col p-4 flex-shrink-0 h-screen sticky top-0 z-30 transition-colors select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <RelayLogo size="md" />
      </div>

      {/* Department Selector */}
      <div className="mb-4 relative" ref={deptDropdownRef}>
        <button
          type="button"
          onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
          className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081220] border border-[#E4E8E7] dark:border-[#1E3048] hover:border-[#1B9A9C] dark:hover:border-[#2EC4C0] transition-colors flex items-center justify-between text-left text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icons.Building className="w-3.5 h-3.5 text-[#1B9A9C] dark:text-[#2EC4C0] flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate">
                {selectedDeptObj ? selectedDeptObj.name : "All Departments"}
              </div>
              <div className="text-[10px] text-[#5B6B82] dark:text-[#94A3B8] font-mono truncate">
                Apex Enterprise Network
              </div>
            </div>
          </div>
          <Icons.ChevronDown className="w-3.5 h-3.5 text-[#5B6B82] dark:text-[#94A3B8] flex-shrink-0 ml-1" />
        </button>

        {isDeptMenuOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0E1B2E] border border-[#E4E8E7] dark:border-[#1E3048] rounded-xl shadow-lg py-1.5 z-50 text-xs animate-page-entrance">
            <div className="px-3.5 py-1 text-[10px] font-mono font-semibold text-[#5B6B82] dark:text-[#94A3B8] uppercase tracking-wider">
              Filter By Department
            </div>
            <div className="p-1 space-y-0.5 max-h-52 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleDeptSelect("all")}
                className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                  currentDept === "all"
                    ? "font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] bg-[#F3F5F4] dark:bg-[#13243C]"
                    : "text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#F3F5F4] dark:hover:bg-[#13243C]"
                }`}
              >
                <span>All Departments</span>
                {currentDept === "all" && <Icons.Check className="w-3.5 h-3.5 text-[#1B9A9C] dark:text-[#2EC4C0]" />}
              </button>
              {deptList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDeptSelect(d.id)}
                  className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                    currentDept === d.id
                      ? "font-semibold text-[#1B9A9C] dark:text-[#2EC4C0] bg-[#F3F5F4] dark:bg-[#13243C]"
                      : "text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#F3F5F4] dark:hover:bg-[#13243C]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{d.name}</div>
                    <div className="text-[10px] text-[#5B6B82] dark:text-[#94A3B8] font-mono">{d.code}</div>
                  </div>
                  {currentDept === d.id && <Icons.Check className="w-3.5 h-3.5 text-[#1B9A9C] dark:text-[#2EC4C0]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto space-y-4 pr-1">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#5B6B82] dark:text-[#94A3B8]">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#0B1930] dark:bg-[#2EC4C0] text-white dark:text-[#081220] font-semibold"
                        : "text-[#5B6B82] dark:text-[#94A3B8] hover:bg-[#F3F5F4] dark:hover:bg-[#13243C] hover:text-[#0B1930] dark:hover:text-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white dark:text-[#081220]" : "text-[#5B6B82] dark:text-[#94A3B8]"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-[#081220]/20 dark:text-[#081220]"
                          : "bg-[#F3F5F4] dark:bg-[#13243C] text-[#5B6B82] dark:text-[#94A3B8]"
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Workspace Footer */}
      <div className="pt-3 border-t border-[#E4E8E7] dark:border-[#1E3048] flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#1B9A9C]/15 dark:bg-[#2EC4C0]/20 text-[#1B9A9C] dark:text-[#2EC4C0] font-semibold flex items-center justify-center text-xs">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] truncate">
              {currentUser?.name || "Administrator"}
            </div>
            <div className="text-[10px] text-[#5B6B82] dark:text-[#94A3B8] font-mono uppercase truncate">
              {currentUser?.role || "Owner"}
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs text-[#5B6B82] dark:text-[#94A3B8] hover:text-[#0B1930] dark:hover:text-white p-1 rounded transition-colors"
          title="Exit to Public Site"
        >
          <Icons.ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
