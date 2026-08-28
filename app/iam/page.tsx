"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TriggerModal } from "@/components/TriggerModal";
import { Icons } from "@/components/Icons";
import { ClinicLocation, DashboardStats, Department, TeamMember, UserRole } from "@/lib/types";
import { AuthGuard } from "@/components/AuthGuard";
import { ConsoleSkeleton } from "@/components/ConsoleSkeleton";
import { logger } from "@/lib/logger";

import { useConsole } from "@/lib/console-context";

export default function TeamPage() {
  const {
    activeWorkspace,
    activeWorkspaceId,
    departments: contextDepts,
    addTeamMemberToActiveWorkspace,
    addDepartmentToActiveWorkspaceState
  } = useConsole();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<ClinicLocation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

  // Modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("dept_admin");
  const [newDeptIds, setNewDeptIds] = useState<string[]>(["dept_general"]);

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptDoctor, setDeptDoctor] = useState("");
  const [deptExt, setDeptExt] = useState("");
  const [deptQuota, setDeptQuota] = useState("500");

  const effectiveDepartments = activeWorkspace?.departments?.length > 0 ? activeWorkspace.departments : contextDepts;
  const effectiveMembers = activeWorkspace?.teamMembers && activeWorkspace.teamMembers.length > 0
    ? activeWorkspace.teamMembers.map(m => ({ id: m.id, name: m.name, email: m.email, role: m.role as UserRole, departmentIds: [m.department] }))
    : teamMembers;

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, locsRes, iamRes] = await Promise.all([
        fetch("/api/call-results/stats"),
        fetch("/api/locations"),
        fetch("/api/iam")
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats || null);
      }
      if (locsRes.ok) {
        const d = await locsRes.json();
        setLocations(d.locations || []);
      }
      if (iamRes.ok) {
        const d = await iamRes.json();
        if (teamMembers.length === 0) setTeamMembers(d.teamMembers || []);
        setCurrentUser(d.currentUser || null);
      }
    } catch (err) {
      logger.error("Error loading team data:", err);
    }
  }, [teamMembers.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSwitchUser = async (userId: string) => {
    await fetch("/api/iam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch_user", userId })
    });
    fetchData();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    addTeamMemberToActiveWorkspace({
      name: newName,
      email: newEmail,
      role: newRole === "media_pr" ? "operator" : newRole,
      department: effectiveDepartments[0]?.name || "General Operations"
    });

    setTeamMembers((prev) => [
      ...prev,
      {
        id: `usr_${Date.now()}`,
        name: newName,
        email: newEmail,
        role: newRole,
        departmentIds: newDeptIds,
        lastActive: "Just now",
        status: "active"
      }
    ]);

    setIsAddMemberOpen(false);
    setNewName("");
    setNewEmail("");
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName) return;

    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: deptName,
      code: deptCode || deptName.substring(0, 4).toUpperCase(),
      description: deptDesc || `Primary ${deptName} node`,
      locationId: "loc_custom",
      headDoctor: deptDoctor || "Department Lead",
      phoneExtension: deptExt || "105",
      activeCallsCount: 0,
      monthlyQuota: Number(deptQuota) || 500,
      monthlyUsed: 0,
      allowedRoles: ["owner", "dept_admin", "operator"]
    };

    addDepartmentToActiveWorkspaceState(newDept);

    setIsAddDeptOpen(false);
    setDeptName("");
    setDeptCode("");
  };

  return (
    <AuthGuard allowedRoles={["owner", "dept_admin"]}>
      <div className="flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-[#081426]">
        <Sidebar budget={stats?.budget} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header
            title="Team & Department Management"
            badge="STAFF PERMISSIONS"
            onRefresh={fetchData}
            onOpenTriggerModal={() => setIsTriggerModalOpen(true)}
          />

          <main className="p-6 sm:p-8 space-y-8 flex-1 max-w-[1600px] w-full animate-fade-in">
            {/* Quick Role Switcher Banner */}
            <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B9A9C]" />
                  <span className="text-xs font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Active Account: {currentUser?.name} &bull; {currentUser?.email}
                  </span>
                </div>
                <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                  Switch between clinical leads, marketing teams, or front desk staff to test role-tailored workspaces.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {effectiveMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSwitchUser(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentUser?.id === m.id
                        ? "bg-[#0B1930] text-white shadow-sm"
                        : "bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#0B1930]"
                    }`}
                  >
                    {m.name.split(" ")[0]} ({m.role === "owner" ? "Owner" : m.role === "dept_admin" ? "Lead" : "Operator"})
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Practice Departments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                    {activeWorkspace?.name || "Practice"} Departments & Specialization Trunks
                  </h2>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                    Each department in {activeWorkspace?.name} has its own extension number, assigned specialist, and voice quota.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddDeptOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Icons.Plus className="w-3.5 h-3.5 text-[#1B9A9C]" />
                  <span>Add Department</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {effectiveDepartments.map((dept) => {
                  const usedPct = Math.round((dept.monthlyUsed / (dept.monthlyQuota || 1)) * 100);

                  return (
                    <div
                      key={dept.id}
                      className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#0B1930] rounded-2xl p-5 space-y-4 transition-all shadow-subtle"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] flex items-center justify-center font-bold font-mono text-xs border border-[#E4E8E7] dark:border-[#20324A]">
                          {dept.code.substring(0, 3)}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F3F5F4] dark:bg-[#081426] text-[#667085] dark:text-[#9BA8B8]">
                          Ext: {dept.phoneExtension}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC]">{dept.name}</h3>
                        <p className="text-xs text-[#667085] dark:text-[#9BA8B8] mt-1 line-clamp-2">{dept.description}</p>
                      </div>

                      <div className="pt-2 border-t border-[#E4E8E7] dark:border-[#20324A] space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[#667085] dark:text-[#9BA8B8]">
                          <span>Lead Provider:</span>
                          <span className="font-semibold text-[#0B1930] dark:text-[#F8FAFC]">{dept.headDoctor}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#667085] dark:text-[#9BA8B8]">
                            <span>Monthly Voice Minutes:</span>
                            <span className="font-mono font-medium">{dept.monthlyUsed} / {dept.monthlyQuota}m</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E4E8E7] dark:bg-[#20324A] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0B1930] dark:bg-[#1B9A9C] rounded-full"
                              style={{ width: `${Math.min(100, usedPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Team Members Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#0B1930] dark:text-[#F8FAFC] tracking-tight">
                    Team Members & Access Roles
                  </h2>
                  <p className="text-xs text-[#667085] dark:text-[#9BA8B8]">
                    Granular permissions for doctors, marketing leads, billing staff, and front desk operators.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#0B1930] text-[#0B1930] dark:text-[#F8FAFC] text-xs font-semibold transition-all shadow-subtle"
                >
                  <Icons.UserPlus className="w-3.5 h-3.5 text-[#1B9A9C]" />
                  <span>Invite Team Member</span>
                </button>
              </div>

              <div className="bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl overflow-hidden shadow-subtle">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E8E7] dark:border-[#20324A] bg-[#F3F5F4] dark:bg-[#081426] text-[10px] uppercase tracking-wider text-[#667085] dark:text-[#9BA8B8] font-semibold">
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Role & Access Level</th>
                      <th className="py-3.5 px-4">Assigned Departments</th>
                      <th className="py-3.5 px-4">Last Active</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8E7] dark:divide-[#20324A]">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#FAFAF8] dark:hover:bg-[#0D1C30] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#0B1930] text-white font-bold flex items-center justify-center text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-[#0B1930] dark:text-[#F8FAFC] block">{member.name}</span>
                              <span className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] border border-[#E4E8E7] dark:border-[#20324A]">
                            {member.role === "owner" ? "SuperAdmin" : member.role === "dept_admin" ? "Clinical Lead" : member.role === "media_pr" ? "Marketing & PR" : "Front Desk"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {member.departmentIds.map((dId) => {
                              const dObj = effectiveDepartments.find((d: Department) => d.id === dId || d.name === dId);
                              return (
                                <span key={dId} className="text-[10px] px-2 py-0.5 rounded bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] font-mono">
                                  {dObj?.code || dId}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#667085] dark:text-[#9BA8B8] text-[11px]">{member.lastActive}</td>

                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-semibold text-[#0B1930] dark:text-[#1B9A9C] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1B9A9C]" />
                            Active
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSwitchUser(member.id)}
                            className="px-2.5 py-1 rounded bg-[#F3F5F4] dark:bg-[#081426] hover:bg-[#E4E8E7] text-[11px] font-semibold text-[#0B1930] dark:text-[#F8FAFC] transition-colors"
                          >
                            Switch User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        {/* Modals */}
        {isAddMemberOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddMemberOpen(false)}>
            <div className="w-full max-w-md bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
                <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">Invite Team Member</h3>
                <button onClick={() => setIsAddMemberOpen(false)} className="text-[#667085] hover:text-[#0B1930] dark:hover:text-white">
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jordan Lee"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@apexhealth.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Role & Permission Policy</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none"
                  >
                    <option value="dept_admin">Clinical Lead (Manage Specialization & Staff)</option>
                    <option value="operator">Front Desk Staff (Triage & Calls)</option>
                    <option value="media_pr">Marketing & Outreach (Batch Campaigns & Reviews)</option>
                    <option value="owner">Super Admin / Clinic Owner (Full Access)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddMemberOpen(false)} className="px-3 py-1.5 rounded-lg bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white font-semibold">
                    Grant Access
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddDeptOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddDeptOpen(false)}>
            <div className="w-full max-w-md bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
                <h3 className="font-heading font-bold text-sm text-[#0B1930] dark:text-[#F8FAFC]">Create Practice Department</h3>
                <button onClick={() => setIsAddDeptOpen(false)} className="text-[#667085] hover:text-[#0B1930] dark:hover:text-white">
                  <Icons.Close className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Client Solutions & Architecture"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Dept Code</label>
                    <input
                      type="text"
                      placeholder="ENG-SOL"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Extension</label>
                    <input
                      type="text"
                      placeholder="106"
                      value={deptExt}
                      onChange={(e) => setDeptExt(e.target.value)}
                      className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Lead Doctor / Provider</label>
                  <input
                    type="text"
                    placeholder="Dr. Maya Patel, DMD"
                    value={deptDoctor}
                    onChange={(e) => setDeptDoctor(e.target.value)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1930] dark:text-[#F8FAFC] mb-1">Monthly Minute Quota</label>
                  <input
                    type="number"
                    value={deptQuota}
                    onChange={(e) => setDeptQuota(e.target.value)}
                    className="w-full bg-[#F3F5F4] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-lg px-3 py-2 text-[#0B1930] dark:text-white focus:border-[#0B1930] outline-none font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddDeptOpen(false)} className="px-3 py-1.5 rounded-lg bg-[#F3F5F4] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC]">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white font-semibold">
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <TriggerModal
          isOpen={isTriggerModalOpen}
          locations={locations}
          recallList={[]}
          onClose={() => setIsTriggerModalOpen(false)}
          onCallLaunched={fetchData}
        />
      </div>
    </AuthGuard>
  );
}
