"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";
import {
  DomainConfig,
  WorkspaceMember,
  updateWorkspaceDetails,
  deleteWorkspace,
  deleteTeamMemberFromWorkspace,
  deleteDepartmentFromWorkspace,
  addTeamMemberToWorkspace,
  addDepartmentToWorkspace
} from "@/lib/domains";
import { Department } from "@/lib/types";
import { useConsole } from "@/lib/console-context";

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  workspace: DomainConfig | null;
  onClose: () => void;
}

export function WorkspaceSettingsModal({
  isOpen,
  workspace,
  onClose
}: WorkspaceSettingsModalProps) {
  const { refreshWorkspaces, setActiveWorkspaceId, activeWorkspaceId } = useConsole();
  const [activeTab, setActiveTab] = useState<"general" | "team" | "departments" | "danger">("general");

  // Form State
  const [wsName, setWsName] = useState(workspace?.name || "");
  const [wsTagline, setWsTagline] = useState(workspace?.tagline || "");
  const [wsPromptPreset, setWsPromptPreset] = useState(workspace?.systemPromptPreset || "");
  const [wsDefaultGoal, setWsDefaultGoal] = useState(workspace?.defaultPromptGoal || "");

  // Add Member State
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"owner" | "dept_admin" | "operator">("operator");

  // Add Department State
  const [deptName, setDeptName] = useState("");
  const [deptExt, setDeptExt] = useState("105");
  const [deptQuota, setDeptQuota] = useState("1000");

  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  useEffect(() => {
    if (workspace) {
      setWsName(workspace.name);
      setWsTagline(workspace.tagline);
      setWsPromptPreset(workspace.systemPromptPreset || "");
      setWsDefaultGoal(workspace.defaultPromptGoal || "");
    }
  }, [workspace]);

  if (!isOpen || !workspace) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceDetails(workspace.id, {
      name: wsName,
      tagline: wsTagline,
      systemPromptPreset: wsPromptPreset,
      defaultPromptGoal: wsDefaultGoal
    });
    refreshWorkspaces();
    setSavedSuccessMsg("Workspace settings updated successfully.");
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberEmail) return;

    const newMember: WorkspaceMember = {
      id: `usr_${Date.now()}`,
      name: memberName,
      email: memberEmail,
      role: memberRole,
      department: workspace.departments[0]?.name || "Operations"
    };

    addTeamMemberToWorkspace(workspace.id, newMember);
    refreshWorkspaces();
    setMemberName("");
    setMemberEmail("");
    setSavedSuccessMsg(`Added team member ${memberName}.`);
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleDeleteMember = (memberId: string) => {
    deleteTeamMemberFromWorkspace(workspace.id, memberId);
    refreshWorkspaces();
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;

    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: deptName,
      code: deptName.substring(0, 4).toUpperCase(),
      description: `Primary ${deptName} trunk for ${workspace.name}`,
      locationId: "loc_custom",
      headDoctor: "Operations Lead",
      phoneExtension: deptExt,
      activeCallsCount: 0,
      monthlyQuota: Number(deptQuota) || 500,
      monthlyUsed: 0,
      allowedRoles: ["owner", "dept_admin", "operator"]
    };

    addDepartmentToWorkspace(workspace.id, newDept);
    refreshWorkspaces();
    setDeptName("");
    setSavedSuccessMsg(`Added department ${deptName}.`);
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleDeleteDepartment = (deptId: string) => {
    deleteDepartmentFromWorkspace(workspace.id, deptId);
    refreshWorkspaces();
  };

  const handleDeleteWorkspaceConfirm = () => {
    if (confirm(`Are you sure you want to delete workspace "${workspace.name}"? This action cannot be undone.`)) {
      deleteWorkspace(workspace.id);
      refreshWorkspaces();
      if (activeWorkspaceId === workspace.id) {
        setActiveWorkspaceId("tech_sangi");
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in text-xs relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E8E7] dark:border-[#20324A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1930] text-white flex items-center justify-center font-bold text-sm font-mono">
              {workspace.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-[#0B1930] dark:text-[#F8FAFC]">
                  {workspace.name}
                </h3>
                {workspace.isCustom && (
                  <span className="text-[9px] font-mono font-bold bg-[#1B9A9C]/20 text-[#1B9A9C] px-1.5 py-0.5 rounded">
                    CUSTOM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#667085] dark:text-[#9BA8B8]">{workspace.tagline}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
          >
            <Icons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Saved Success Notification */}
        {savedSuccessMsg && (
          <div className="p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] font-bold text-xs animate-fade-in flex items-center justify-between">
            <span>{savedSuccessMsg}</span>
            <Icons.Check className="w-4 h-4" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#E4E8E7] dark:border-[#20324A] pb-2">
          {(
            [
              { id: "general", label: "General & AI Prompt" },
              { id: "team", label: `Team Members (${workspace.teamMembers?.length || 0})` },
              { id: "departments", label: `Departments (${workspace.departments?.length || 0})` },
              { id: "danger", label: "Danger Zone" }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#0B1930] text-white shadow-sm"
                  : "text-[#667085] dark:text-[#9BA8B8] hover:bg-[#FAFAF8] dark:hover:bg-[#081426]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: General & AI Telephony Prompt */}
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Tagline / Sector
                </label>
                <input
                  type="text"
                  value={wsTagline}
                  onChange={(e) => setWsTagline(e.target.value)}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                AI Telephony System Prompt Persona
              </label>
              <textarea
                rows={3}
                value={wsPromptPreset}
                onChange={(e) => setWsPromptPreset(e.target.value)}
                placeholder="Instruct the AI calling agent on tone, business context, and operational guidelines..."
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl p-3 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C] leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                Default Call Prompt Goal
              </label>
              <textarea
                rows={2}
                value={wsDefaultGoal}
                onChange={(e) => setWsDefaultGoal(e.target.value)}
                placeholder="Primary objective during caller interaction..."
                className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl p-3 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C] leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold shadow-card transition-all cursor-pointer"
              >
                Save Workspace Settings
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Team Members & Staff Roles */}
        {activeTab === "team" && (
          <div className="space-y-5">
            <form onSubmit={handleAddMember} className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
              <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] block">
                + Add Team Member to {workspace.name}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-1.5 text-xs text-[#0B1930] dark:text-white outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-1.5 text-xs text-[#0B1930] dark:text-white outline-none"
                />
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as "owner" | "dept_admin" | "operator")}
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs text-[#0B1930] dark:text-[#F8FAFC] focus:outline-none"
                >
                  <option value="owner">Owner / Admin</option>
                  <option value="dept_admin">Department Lead</option>
                  <option value="operator">Operator / Specialist</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#1B9A9C] hover:bg-[#157A7C] text-white font-bold text-xs cursor-pointer shadow-subtle"
                >
                  Add Staff Member
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="font-bold text-[#667085] dark:text-[#9BA8B8] text-[10px] uppercase font-mono tracking-wider">
                Assigned Team Members ({workspace.teamMembers?.length || 0})
              </span>
              <div className="space-y-2">
                {workspace.teamMembers?.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">{m.name}</div>
                      <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">{m.email} &bull; {m.department}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-white uppercase">
                        {m.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-rose-500 hover:text-rose-600 font-bold px-2 py-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Departments & Practice Trunks */}
        {activeTab === "departments" && (
          <div className="space-y-5">
            <form onSubmit={handleAddDepartment} className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
              <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] block">
                + Add Department Node to {workspace.name}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-1.5 text-xs text-[#0B1930] dark:text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Extension (e.g. 104)"
                  value={deptExt}
                  onChange={(e) => setDeptExt(e.target.value)}
                  className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-1.5 text-xs text-[#0B1930] dark:text-white outline-none font-mono"
                />
                <input
                  type="number"
                  placeholder="Monthly Call Quota"
                  value={deptQuota}
                  onChange={(e) => setDeptQuota(e.target.value)}
                  className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-1.5 text-xs text-[#0B1930] dark:text-white outline-none font-mono"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs cursor-pointer shadow-subtle"
                >
                  Create Department Node
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="font-bold text-[#667085] dark:text-[#9BA8B8] text-[10px] uppercase font-mono tracking-wider">
                Active Departments ({workspace.departments?.length || 0})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workspace.departments?.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#0B1930] dark:text-[#F8FAFC]">{d.name}</div>
                      <div className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">Ext: {d.phoneExtension} &bull; Lead: {d.headDoctor}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(d.id)}
                      className="text-rose-500 hover:text-rose-600 font-bold text-xs px-2 py-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Danger Zone (Delete Workspace) */}
        {activeTab === "danger" && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-4">
            <div>
              <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                Delete Enterprise Workspace
              </h4>
              <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-1 leading-relaxed">
                Permanently remove <strong>{workspace.name}</strong>, all department configurations, team assignments, and prompt presets. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDeleteWorkspaceConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-card transition-all cursor-pointer"
            >
              Permanently Delete Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
