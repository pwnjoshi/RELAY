"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icons } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/types";
import { DOMAINS, IndustryDomain, getSavedWorkspaces, saveCustomWorkspace, DomainConfig } from "@/lib/domains";
import { useConsole } from "@/lib/console-context";
import { WorkspaceSettingsModal } from "./WorkspaceSettingsModal";

interface HeaderProps {
  title: string;
  badge?: string;
  onRefresh?: () => void;
  onOpenTriggerModal?: () => void;
  onSearchChange?: (q: string) => void;
  searchValue?: string;
  showExport?: boolean;
}

export function Header({
  title,
  onRefresh,
  onOpenTriggerModal,
  onSearchChange,
  searchValue = "",
  showExport = true
}: HeaderProps) {
  const {
    currentUser,
    activeLanguage: activeLang,
    setActiveLanguage,
    activeWorkspaceId,
    activeWorkspace,
    workspacesMap,
    setActiveWorkspaceId,
    refreshWorkspaces
  } = useConsole();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isWsSettingsOpen, setIsWsSettingsOpen] = useState(false);

  // Dynamic Workspace Creation State
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsIndustry, setNewWsIndustry] = useState("IT & Software Services");
  const [newWsDeptName, setNewWsDeptName] = useState("");
  const [newWsSpecialist, setNewWsSpecialist] = useState("");

  const currentDomainObj = activeWorkspace || DOMAINS[activeWorkspaceId] || Object.values(DOMAINS)[0];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const slug = newWsName.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + Date.now();
    const createdConfig: DomainConfig = {
      id: slug,
      name: newWsName,
      tagline: `${newWsIndustry} • Enterprise Workspace`,
      badge: "ENTERPRISE WORKSPACE",
      icon: "Building",
      industryCategory: "general",
      isCustom: true,
      description: `Isolated corporate workspace for ${newWsName} managing customer operations and automated voice dispatch.`,
      defaultPromptGoal: `Assist callers contacting ${newWsName} regarding ${newWsDeptName || "services"} and schedule consultations with ${newWsSpecialist || "on-call representative"}.`,
      departments: [
        {
          id: `dept_${slug}_main`,
          name: newWsDeptName || "General Operations & Services",
          code: "OPS-MAIN",
          description: `Primary department node for ${newWsName}.`,
          locationId: `loc_${slug}`,
          headDoctor: newWsSpecialist || "Operations Manager",
          phoneExtension: "101",
          activeCallsCount: 0,
          monthlyQuota: 1000,
          monthlyUsed: 0,
          allowedRoles: ["owner", "dept_admin", "operator"]
        }
      ],
      sampleContacts: [
        {
          name: "Enterprise Client",
          phone: "+919810012345",
          reason: `${newWsName} Inquiry`,
          customGoal: "Schedule initial consultation",
          language: "en"
        }
      ],
      systemPromptPreset: `You are the automated AI operations assistant for ${newWsName}. Assist callers warmly and accurately.`
    };

    saveCustomWorkspace(createdConfig);
    refreshWorkspaces();
    setActiveWorkspaceId(slug);
    setIsCreateWsOpen(false);
    setNewWsName("");
    setNewWsDeptName("");
    setNewWsSpecialist("");
  };

  const domainRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Click-outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (domainRef.current && !domainRef.current.contains(target)) {
        setIsDomainOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = async (code: LanguageCode) => {
    setActiveLanguage(code);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  };

  const notifications = [
    { id: "n1", title: "Consultation Booked (+91 98100 12345)", time: "2 min ago", type: "success" },
    { id: "n2", title: "Google Calendar Synced 4 open slots", time: "14 min ago", type: "info" },
    { id: "n3", title: "Excel Batch dialed 12 contacts in Nepali", time: "1 hour ago", type: "batch" }
  ];

  return (
    <>
      <header className="min-h-[76px] py-3.5 px-6 sm:px-8 border-b border-[#E4E8E7] dark:border-[#20324A] bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 transition-all shadow-subtle">
        {/* Left: Page Title + Domain Mode Pill */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-heading font-extrabold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight truncate">
              {title}
            </h1>
          </div>

          <div className="h-6 w-[1px] bg-[#E4E8E7] dark:bg-[#20324A] hidden md:block flex-shrink-0" />

          {/* Quick Domain Preset Switcher */}
          <div className="relative hidden sm:block flex-shrink-0" ref={domainRef}>
            <button
              type="button"
              onClick={() => setIsDomainOpen(!isDomainOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-semibold text-[#0B1930] dark:text-[#F8FAFC] transition-all cursor-pointer shadow-subtle hover:bg-white dark:hover:bg-[#15294A] active:scale-95"
              title="Switch Active Enterprise Workspace"
            >
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono font-bold text-[#0B1930] dark:text-[#F8FAFC] truncate max-w-[170px]">
                {currentDomainObj.name}
              </span>
              <Icons.ChevronDown className="w-3.5 h-3.5 text-[#98A2B3] ml-0.5 flex-shrink-0" />
            </button>

            {isDomainOpen && (
              <div className="absolute left-0 mt-2.5 w-80 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated py-2 z-50 text-xs animate-fade-in divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
                <div className="px-3.5 py-1.5 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-[#98A2B3] uppercase tracking-wider">
                    Active Enterprise Workspaces ({Object.keys(workspacesMap).length})
                  </span>
                  <span className="text-[9px] font-mono text-[#16A34A] font-bold bg-[#16A34A]/10 px-1.5 py-0.5 rounded">
                    ISOLATED DATA
                  </span>
                </div>
                <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
                  {Object.entries(workspacesMap).map(([key, dom]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveWorkspaceId(key);
                        setIsDomainOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                        activeWorkspaceId === key
                          ? "bg-[#0B1930] text-white font-bold"
                          : "hover:bg-[#FAFAF8] dark:hover:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{dom.name}</span>
                          {dom.isCustom && (
                            <span className="text-[9px] font-mono bg-[#1B9A9C]/20 text-[#1B9A9C] px-1.5 py-0.2 rounded font-bold">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] truncate ${activeWorkspaceId === key ? "text-[#9BA8B8]" : "text-[#667085]"}`}>
                          {dom.tagline} • ({dom.departments?.length || 1} Departments)
                        </div>
                      </div>
                      {activeWorkspaceId === key && <Icons.Check className="w-4 h-4 text-[#1B9A9C] flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Action: Create & Settings */}
                <div className="p-2 bg-[#FAFAF8] dark:bg-[#081426] space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDomainOpen(false);
                      setIsWsSettingsOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-subtle active:scale-95"
                  >
                    ⚙ Customize Active Workspace Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDomainOpen(false);
                      setIsCreateWsOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#1B9A9C] hover:bg-[#157A7C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-subtle active:scale-95"
                  >
                    + Create New Workspace / Organization
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Right: Search, Notifications, Theme, Refresh & Staff Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {onSearchChange && (
          <div className="relative hidden md:block">
            <Icons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search calls & contacts..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl pl-8 pr-3.5 py-2 text-xs text-[#0B1930] dark:text-[#F8FAFC] outline-none w-44 lg:w-60 focus:w-68 focus:border-[#1B9A9C] transition-all placeholder:text-[#98A2B3] font-medium"
            />
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] transition-all cursor-pointer active:scale-95 shadow-subtle hover:bg-white dark:hover:bg-[#15294A]"
            title="Refresh Telemetry Data"
          >
            <Icons.Refresh className="w-4 h-4 text-[#667085] dark:text-[#9BA8B8]" />
          </button>
        )}

        {/* Realtime Telephony Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-[#0B1930] dark:text-[#F8FAFC] relative transition-all cursor-pointer active:scale-95 shadow-subtle hover:bg-white dark:hover:bg-[#15294A]"
            title="Realtime Activity Notifications"
          >
            <Icons.Activity className="w-4 h-4 text-[#1B9A9C]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#16A34A]" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated py-2.5 z-50 text-xs animate-fade-in divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
              <div className="px-4 pb-2 flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">Telephony Stream</span>
                <span className="text-[10px] font-mono text-[#16A34A] font-bold bg-[#16A34A]/10 px-2 py-0.5 rounded-full">3 NEW</span>
              </div>
              <div className="p-1.5 space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl hover:bg-[#FAFAF8] dark:hover:bg-[#081426] space-y-0.5 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-xs text-[#0B1930] dark:text-[#F8FAFC] leading-tight">
                      {n.title}
                    </div>
                    <div className="text-[10px] text-[#98A2B3] font-mono">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Primary Simulate Call Action */}
        {onOpenTriggerModal && (
          <button
            type="button"
            onClick={onOpenTriggerModal}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-card transition-all active:scale-95 cursor-pointer hover:shadow-elevated flex-shrink-0"
          >
            <Icons.PhoneCall className="w-3.5 h-3.5 text-[#1B9A9C]" />
            <span className="hidden sm:inline">Simulate Call</span>
            <span className="sm:hidden">Call</span>
          </button>
        )}

        {/* Clean Unified User & Actions Dropdown Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-10 h-10 rounded-xl bg-[#0B1930] text-white border border-[#20324A] hover:border-[#1B9A9C] font-bold text-xs flex items-center justify-center font-mono transition-all cursor-pointer shadow-subtle hover:scale-105 active:scale-95 flex-shrink-0"
            title="User Profile & Quick Settings"
          >
            {currentUser ? currentUser.name.charAt(0).toUpperCase() : "A"}
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated py-2.5 z-50 text-xs animate-fade-in divide-y divide-[#E4E8E7] dark:divide-[#20324A]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Profile summary */}
              <div className="px-4 py-2">
                <div className="font-heading font-bold text-xs text-[#0B1930] dark:text-[#F8FAFC]">
                  {currentUser?.name || "Pawan Joshi"}
                </div>
                <div className="text-[10px] font-mono text-[#1B9A9C] font-semibold uppercase pt-0.5">
                  {currentUser?.role || "Owner / Administrator"}
                </div>
                <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8] truncate pt-0.5">
                  {currentUser?.email || "pawan@techsangi.com"}
                </div>
              </div>

              {/* Navigation Quick Links */}
              <div className="py-1.5 px-1.5 space-y-0.5">
                <Link
                  href="/analytics"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                >
                  <Icons.Activity className="w-3.5 h-3.5 text-[#1B9A9C]" />
                  <span>Voice Analytics</span>
                </Link>
                <Link
                  href="/integrations"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                >
                  <Icons.Layers className="w-3.5 h-3.5 text-[#1B9A9C]" />
                  <span>Integrations Hub</span>
                </Link>
                {showExport && (
                  <Link
                    href="/api/export?format=csv"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                  >
                    <Icons.Download className="w-3.5 h-3.5 text-[#667085]" />
                    <span>Export Call CSV</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#0B1930] dark:text-[#F8FAFC] hover:bg-[#FAFAF8] dark:hover:bg-[#081426] transition-colors"
                >
                  <Icons.Settings className="w-3.5 h-3.5 text-[#667085]" />
                  <span>PBX & Calendar Settings</span>
                </Link>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#E5484D] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left font-bold"
                >
                  <Icons.Lock className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* Dynamic Create New Workspace / Company Modal */}
      {isCreateWsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B1930] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl shadow-elevated max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
              <div>
                <h3 className="text-base font-bold text-[#0B1930] dark:text-white">
                  + Create Isolated Enterprise Workspace
                </h3>
                <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                  Establish a new corporate entity, company, or practice domain with isolated data & departments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateWsOpen(false)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5">
              <div>
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC] mb-1">
                  Organization / Company Name <span className="text-[#1B9A9C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Logistics, Tech Sangi, Sterling Law"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC] mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={newWsIndustry}
                    onChange={(e) => setNewWsIndustry(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  >
                    <option value="IT & Software Services">IT & Software Services</option>
                    <option value="Healthcare & Clinic Networks">Healthcare & Medical</option>
                    <option value="Automotive Dealerships">Automotive & Fleet</option>
                    <option value="Legal & Advisory Practices">Legal & Advisory</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Financial & Corporate">Financial & Corporate</option>
                    <option value="General Business Operations">General Business Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC] mb-1">
                    Primary Department / Node
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatch & Operations"
                    value={newWsDeptName}
                    onChange={(e) => setNewWsDeptName(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC] mb-1">
                  On-Call Lead Specialist / Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Captain David Vance, Lead Director"
                  value={newWsSpecialist}
                  onChange={(e) => setNewWsSpecialist(e.target.value)}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#1B9A9C]/10 border border-[#1B9A9C]/20 text-[10px] text-[#0B1930] dark:text-[#F8FAFC] leading-tight space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#1B9A9C]">
                  🔒 Multi-Tenant Data Isolation Guarantee:
                </div>
                <div>
                  This workspace will maintain 100% isolated telemetry records, call history, staff roles, and RAG knowledge bases. Cross-workspace bridging can be enabled by Admins whenever necessary.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8E7] dark:border-[#20324A]">
                <button
                  type="button"
                  onClick={() => setIsCreateWsOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#0B1930] dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1930] dark:bg-[#1B9A9C] text-white font-bold hover:opacity-90 shadow-card active:scale-95 cursor-pointer"
                >
                  Provision Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isWsSettingsOpen}
        workspace={currentDomainObj}
        onClose={() => setIsWsSettingsOpen(false)}
      />
    </>
  );
}
