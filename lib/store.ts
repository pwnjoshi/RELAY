import {
  CallRecord,
  DashboardStats,
  BudgetStatus,
  Department,
  TeamMember,
  BatchCampaign,
  LanguageCode
} from "./types";
import { syncCallToSupabase } from "./supabase";
import fs from "fs";
import path from "path";

function loadSeedCalls(): CallRecord[] {
  try {
    const filePath = path.resolve(process.cwd(), "data/sample-calls.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not load sample-calls.json, starting with clean array", err);
  }
  return [];
}

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: "dept_general",
    name: "General Dentistry & Hygiene",
    code: "GEN-DENT",
    description: "Routine checkups, hygiene cleanings, cavity fillings, and preventive care.",
    locationId: "loc_downtown",
    headDoctor: "Dr. Sarah Chen, DDS",
    phoneExtension: "101",
    activeCallsCount: 2,
    monthlyQuota: 1000,
    monthlyUsed: 384,
    allowedRoles: ["owner", "dept_admin", "operator"]
  },
  {
    id: "dept_ortho",
    name: "Orthodontics & Implants",
    code: "ORTHO-IMP",
    description: "Invisalign aligners, braces adjustments, titanium implants, and cosmetic veneers.",
    locationId: "loc_westside",
    headDoctor: "Dr. Marcus Vance, DDS, MS",
    phoneExtension: "102",
    activeCallsCount: 1,
    monthlyQuota: 800,
    monthlyUsed: 210,
    allowedRoles: ["owner", "dept_admin", "operator"]
  },
  {
    id: "dept_emergency",
    name: "Emergency & Oral Surgery",
    code: "EMERG-SURG",
    description: "24/7 Acute pain triage, wisdom tooth extractions, abscesses, and trauma relief.",
    locationId: "loc_highland",
    headDoctor: "Dr. Elena Rostova, MD, DMD",
    phoneExtension: "911",
    activeCallsCount: 1,
    monthlyQuota: 500,
    monthlyUsed: 142,
    allowedRoles: ["owner", "dept_admin", "operator"]
  },
  {
    id: "dept_billing",
    name: "Billing, Claims & CareCredit",
    code: "BILL-FIN",
    description: "Patient insurance verification, zero-interest payment plans, and claim reconciliations.",
    locationId: "loc_downtown",
    headDoctor: "Finance Manager Lisa Wong",
    phoneExtension: "104",
    activeCallsCount: 0,
    monthlyQuota: 400,
    monthlyUsed: 95,
    allowedRoles: ["owner", "dept_admin", "operator"]
  },
  {
    id: "dept_pr_media",
    name: "Patient Relations, Media & PR",
    code: "PR-MEDIA",
    description: "Patient satisfaction outreach, community health drives, PR follow-ups, and review campaigns.",
    locationId: "loc_downtown",
    headDoctor: "Director Amanda Cruz",
    phoneExtension: "105",
    activeCallsCount: 0,
    monthlyQuota: 600,
    monthlyUsed: 180,
    allowedRoles: ["owner", "dept_admin", "media_pr"]
  }
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "usr_owner_1",
    name: "Dr. Arthur Pendelton",
    email: "arthur@apexhealth.com",
    role: "owner",
    departmentIds: ["dept_general", "dept_ortho", "dept_emergency", "dept_billing", "dept_pr_media"],
    lastActive: "Just now",
    status: "active"
  },
  {
    id: "usr_admin_dental",
    name: "Dr. Sarah Chen, DDS",
    email: "sarah.chen@apexhealth.com",
    role: "dept_admin",
    departmentIds: ["dept_general"],
    lastActive: "12m ago",
    status: "active"
  },
  {
    id: "usr_admin_ortho",
    name: "Dr. Marcus Vance",
    email: "marcus.vance@apexhealth.com",
    role: "dept_admin",
    departmentIds: ["dept_ortho"],
    lastActive: "1h ago",
    status: "active"
  },
  {
    id: "usr_media_pr",
    name: "Amanda Cruz (PR & Media)",
    email: "pr.team@apexhealth.com",
    role: "media_pr",
    departmentIds: ["dept_pr_media"],
    lastActive: "25m ago",
    status: "active"
  },
  {
    id: "usr_frontdesk_1",
    name: "Alex Rivera (Lead Receptionist)",
    email: "frontdesk@apexhealth.com",
    role: "operator",
    departmentIds: ["dept_general", "dept_billing"],
    lastActive: "3m ago",
    status: "active"
  }
];

const DEFAULT_BATCH_CAMPAIGNS: BatchCampaign[] = [
  {
    id: "camp_hygiene_q3",
    title: "Q3 Preventive Hygiene Recall & Fluoride",
    departmentId: "dept_general",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalContacts: 14,
    completedCount: 14,
    bookedCount: 11,
    status: "completed",
    items: []
  },
  {
    id: "camp_ortho_invisalign",
    title: "Summer Invisalign & Smile Scan Outreach",
    departmentId: "dept_ortho",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    totalContacts: 8,
    completedCount: 6,
    bookedCount: 5,
    status: "processing",
    items: []
  }
];

export class RelayStore {
  private calls: Map<string, CallRecord> = new Map();
  private budget: BudgetStatus = {
    initialBudget: 20,
    liveCallsUsed: 0,
    remaining: 20,
    reservedForDemo: 8
  };
  private departments: Map<string, Department> = new Map();
  private teamMembers: Map<string, TeamMember> = new Map();
  private batchCampaigns: Map<string, BatchCampaign> = new Map();
  private activeDepartmentId: string = "all";
  private currentUserId: string = "usr_owner_1";
  private activeLanguage: LanguageCode = "en";

  constructor() {
    // Seed initial calls
    const seed = loadSeedCalls();
    seed.forEach((call) => {
      this.calls.set(call.id, {
        ...call,
        departmentId: call.departmentId || "dept_general",
        language: call.language || "en"
      });
    });

    // Seed departments
    DEFAULT_DEPARTMENTS.forEach((dept) => {
      this.departments.set(dept.id, dept);
    });

    // Seed team members
    DEFAULT_TEAM_MEMBERS.forEach((m) => {
      this.teamMembers.set(m.id, m);
    });

    // Seed batch campaigns
    DEFAULT_BATCH_CAMPAIGNS.forEach((c) => {
      this.batchCampaigns.set(c.id, c);
    });
  }

  // --- Multi-Tenant Departments ---
  getDepartments(): Department[] {
    return Array.from(this.departments.values());
  }

  getDepartment(id: string): Department | undefined {
    return this.departments.get(id);
  }

  addDepartment(dept: Department): void {
    this.departments.set(dept.id, dept);
  }

  getActiveDepartmentId(): string {
    return this.activeDepartmentId;
  }

  setActiveDepartmentId(deptId: string): void {
    this.activeDepartmentId = deptId;
  }

  // --- IAM & Team Members ---
  getTeamMembers(): TeamMember[] {
    return Array.from(this.teamMembers.values());
  }

  getTeamMember(id: string): TeamMember | undefined {
    return this.teamMembers.get(id);
  }

  addTeamMember(member: TeamMember): void {
    this.teamMembers.set(member.id, member);
  }

  removeTeamMember(id: string): boolean {
    return this.teamMembers.delete(id);
  }

  getCurrentUser(): TeamMember {
    return this.teamMembers.get(this.currentUserId) || DEFAULT_TEAM_MEMBERS[0];
  }

  setCurrentUser(userId: string): void {
    if (this.teamMembers.has(userId)) {
      this.currentUserId = userId;
    }
  }

  // --- Global Language State ---
  getActiveLanguage(): LanguageCode {
    return this.activeLanguage;
  }

  setActiveLanguage(lang: LanguageCode): void {
    this.activeLanguage = lang;
  }

  // --- Batch Campaigns ---
  getBatchCampaigns(): BatchCampaign[] {
    return Array.from(this.batchCampaigns.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getBatchCampaign(id: string): BatchCampaign | undefined {
    return this.batchCampaigns.get(id);
  }

  addBatchCampaign(camp: BatchCampaign): void {
    this.batchCampaigns.set(camp.id, camp);
  }

  updateBatchCampaign(id: string, updates: Partial<BatchCampaign>): void {
    const existing = this.batchCampaigns.get(id);
    if (existing) {
      this.batchCampaigns.set(id, { ...existing, ...updates });
    }
  }

  // --- Calls & Telemetry ---
  getCalls(departmentId?: string): CallRecord[] {
    const dept = departmentId || (this.activeDepartmentId !== "all" ? this.activeDepartmentId : undefined);
    const all = Array.from(this.calls.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (dept) {
      return all.filter((c) => c.departmentId === dept || !c.departmentId);
    }
    return all;
  }

  getCall(id: string): CallRecord | undefined {
    return this.calls.get(id);
  }

  private persistCalls(): void {
    try {
      const filePath = path.resolve(process.cwd(), "data/sample-calls.json");
      const callsArray = Array.from(this.calls.values());
      fs.writeFileSync(filePath, JSON.stringify(callsArray, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist calls to disk:", err);
    }
  }

  addCall(call: CallRecord): void {
    const deptId = call.departmentId || "dept_general";
    this.calls.set(call.id, {
      ...call,
      departmentId: deptId,
      language: call.language || this.activeLanguage
    });
    this.budget.liveCallsUsed += 1;
    this.budget.remaining = Math.max(0, this.budget.initialBudget - this.budget.liveCallsUsed);

    const dept = this.departments.get(deptId);
    if (dept) {
      dept.activeCallsCount += 1;
      dept.monthlyUsed += 1;
    }
    this.persistCalls();
    syncCallToSupabase(this.calls.get(call.id)!);
  }

  updateCall(id: string, updates: Partial<CallRecord>): void {
    const existing = this.calls.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.calls.set(id, updated);
      this.persistCalls();
      syncCallToSupabase(updated);
    }
  }

  getStats(departmentId?: string): DashboardStats {
    const allCalls = this.getCalls(departmentId);
    const totalCalls = allCalls.length;
    const completedCalls = allCalls.filter((c) => c.status === "completed").length;
    const bookedCalls = allCalls.filter(
      (c) =>
        c.structuredOutcome?.appointment?.booked === true ||
        c.structuredOutcome?.outcome === "booked" ||
        c.structuredOutcome?.outcome === "rescheduled"
    ).length;

    const urgentEscalations = allCalls.filter(
      (c) =>
        c.structuredOutcome?.outcome === "escalated_urgent" ||
        c.structuredOutcome?.callback?.priority === "urgent"
    ).length;

    const totalRevenueRecovered = allCalls.reduce(
      (acc, c) => acc + (c.recoveredRevenue || 0),
      0
    );

    const captureRate = totalCalls > 0 ? Math.round((bookedCalls / totalCalls) * 100) : 0;

    const locationStats: Record<string, { total: number; booked: number; revenue: number }> = {};
    const departmentStats: Record<string, { total: number; booked: number; revenue: number }> = {};

    allCalls.forEach((call) => {
      const locId = call.locationId || "loc_downtown";
      const deptId = call.departmentId || "dept_general";
      const isBooked =
        call.structuredOutcome?.appointment?.booked === true ||
        call.structuredOutcome?.outcome === "booked" ||
        call.structuredOutcome?.outcome === "rescheduled";
      const rev = call.recoveredRevenue || 0;

      if (!locationStats[locId]) {
        locationStats[locId] = { total: 0, booked: 0, revenue: 0 };
      }
      locationStats[locId].total += 1;
      if (isBooked) locationStats[locId].booked += 1;
      locationStats[locId].revenue += rev;

      if (!departmentStats[deptId]) {
        departmentStats[deptId] = { total: 0, booked: 0, revenue: 0 };
      }
      departmentStats[deptId].total += 1;
      if (isBooked) departmentStats[deptId].booked += 1;
      departmentStats[deptId].revenue += rev;
    });

    return {
      totalCalls,
      completedCalls,
      bookedCalls,
      urgentEscalations,
      totalRevenueRecovered,
      captureRate,
      locationStats,
      departmentStats,
      budget: { ...this.budget }
    };
  }
}

// Global Singleton
export { RelayStore as SwitchboardStore };
const globalForStore = globalThis as unknown as { relayStore: RelayStore };
export const store = globalForStore.relayStore || new RelayStore();
if (process.env.NODE_ENV !== "production") globalForStore.relayStore = store;
