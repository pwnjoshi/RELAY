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

  const navItems = [
    { href: "/dashboard", label: "Operations Console", icon: Icons.Activity, section: "VOICE OPERATIONS" },
    { href: "/batch", label: "Excel Batch Engine", icon: Icons.FileSpreadsheet, badge: "NEW", section: "VOICE OPERATIONS" },
    { href: "/analytics", label: "Voice Analytics", icon: Icons.Activity, badge: "CHARTS", section: "VOICE OPERATIONS" },
    { href: "/calls", label: "Call Audit Stream", icon: Icons.PhoneIncoming, count: callCount, section: "VOICE OPERATIONS" },
    { href: "/campaigns", label: "Client Outreach Studio", icon: Icons.Users, section: "VOICE OPERATIONS" },
    { href: "/integrations", label: "Integrations Hub", icon: Icons.Layers, badge: "SYNC", section: "NETWORK" },
    { href: "/fleet", label: "Branch Telephony Fleet", icon: Icons.Building, section: "NETWORK" },
    { href: "/iam", label: "Team & Departments", icon: Icons.Shield, badge: "ROLES", section: "ADMINISTRATION" },
    { href: "/billing", label: "Plans & Subscription", icon: Icons.CreditCard, section: "ADMINISTRATION" },
    { href: "/settings", label: "PBX & Integrations", icon: Icons.Settings, section: "ADMINISTRATION" },
    { href: "/diagnostics", label: "CALL-E API Gateway", icon: Icons.Cpu, section: "INFRASTRUCTURE" },
    { href: "/docs", label: "Developer Docs", icon: Icons.FileText, badge: "API", section: "INFRASTRUCTURE" },
  ];

  const selectedDeptObj = deptList.find((d) => d.id === currentDept);

  return (
    <aside className="w-64 bg-white dark:bg-[#10223A] border-r border-[#E4E8E7] dark:border-[#20324A] flex flex-col p-4 flex-shrink-0 h-screen sticky top-0 z-30 transition-colors overflow-hidden select-none">
      {/* Brand Header with Single Official Relay Logo Signature */}
      <div className="flex items-center justify-between mb-4 px-1">
        <RelayLogo size="md" />
      </div>



      {/* Department Selector Dropdown */}
      <div className="mb-4 relative" ref={deptDropdownRef}>
        <button
          type="button"
          onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
          className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] transition-all flex items-center justify-between text-left text-xs cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icons.Building className="w-3.5 h-3.5 text-[#1B9A9C] flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC] truncate">
                {selectedDeptObj ? selectedDeptObj.name : "All Departments"}
              </div>
              <div className="text-[9px] text-[#667085] dark:text-[#9BA8B8] truncate">
                Apex Enterprise Network
              </div>
            </div>
          </div>
          <Icons.ChevronDown className="w-3.5 h-3.5 text-[#98A2B3] flex-shrink-0 ml-1" />
        </button>

        {isDeptMenuOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated py-1.5 z-50 text-xs animate-fade-in divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
            <div className="px-3.5 py-1.5 text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider font-mono">
              Switch Department
            </div>
            <div className="p-1 space-y-0.5 max-h-52 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleDeptSelect("all")}
                className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors cursor-pointer ${
                  currentDept === "all" ? "font-bold text-[#1B9A9C] bg-[#FAFAF8] dark:bg-[#081426]" : "text-[#0B1930] dark:text-[#F8FAFC]"
                }`}
              >
                <span>All Departments</span>
                {currentDept === "all" && <Icons.Check className="w-3.5 h-3.5 text-[#1B9A9C]" />}
              </button>
              {deptList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleDeptSelect(d.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors cursor-pointer ${
                    currentDept === d.id ? "font-bold text-[#1B9A9C] bg-[#FAFAF8] dark:bg-[#081426]" : "text-[#0B1930] dark:text-[#F8FAFC]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{d.name}</div>
                    <div className="text-[9px] text-[#98A2B3] font-mono">{d.code}</div>
                  </div>
                  {currentDept === d.id && <Icons.Check className="w-3.5 h-3.5 text-[#1B9A9C]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links grouped by Section */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {["VOICE OPERATIONS", "NETWORK", "ADMINISTRATION", "INFRASTRUCTURE"].map((sec) => {
          const items = navItems.filter((i) => i.section === sec);
          if (items.length === 0) return null;

          return (
            <div key={sec} className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-wider text-[#98A2B3] px-2.5 py-1 uppercase">
                {sec}
              </div>
              {items.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                      isActive
                        ? "bg-[#0B1930] text-white shadow-card font-bold"
                        : "text-[#667085] dark:text-[#9BA8B8] hover:text-[#0B1930] dark:hover:text-white hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? "text-[#1B9A9C]" : "text-[#667085] dark:text-[#9BA8B8]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-[#1B9A9C] text-white" : "bg-[#1B9A9C]/15 text-[#1B9A9C]"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]"
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Monthly Voice Minutes Quota Card */}
      <div className="mt-auto pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
        <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">Voice Minutes Pool</span>
            <span className="font-mono text-[#1B9A9C] font-bold">1,280 / 2,000</span>
          </div>
          <div className="w-full h-1.5 bg-[#E4E8E7] dark:bg-[#20324A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1B9A9C] rounded-full transition-all duration-500"
              style={{ width: `64%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#667085] dark:text-[#9BA8B8] font-mono">
            <span>SIP Auto-Replenish</span>
            <span className="text-[#16A34A] font-bold">ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
