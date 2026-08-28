import { Department, LanguageCode } from "./types";
import { logger } from "./logger";

export type IndustryDomain = string;

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "dept_admin" | "operator";
  department: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  industryCategory?: string;
  description: string;
  defaultPromptGoal: string;
  departments: Department[];
  teamMembers?: WorkspaceMember[];
  connectedWorkspaceIds?: string[];
  isCustom?: boolean;
  sampleContacts: {
    name: string;
    phone: string;
    reason: string;
    customGoal: string;
    language: LanguageCode;
  }[];
  systemPromptPreset: string;
}

export const INITIAL_DOMAINS: Record<string, DomainConfig> = {
  tech_sangi: {
    id: "tech_sangi",
    name: "Tech Sangi IT & AI Operations",
    tagline: "Software Development, Cloud Ops & AI Consulting",
    badge: "ENTERPRISE TECH OPS",
    icon: "Cpu",
    industryCategory: "tech",
    description: "Software development agency & AI consulting firm handling incoming client discovery calls, project quotes, and system integrations.",
    defaultPromptGoal: "Gather high-level software requirements, schedule discovery consultation with Pawan Joshi, and provide estimated timeline.",
    departments: [
      {
        id: "dept_soft_dev",
        name: "Software Architecture & Dev",
        code: "TECH-DEV",
        description: "Full-stack web & mobile app development, API integration, and MVP builds.",
        locationId: "loc_techsangi",
        headDoctor: "Pawan Joshi (Lead Architect)",
        phoneExtension: "401",
        activeCallsCount: 2,
        monthlyQuota: 1200,
        monthlyUsed: 410,
        allowedRoles: ["owner", "dept_admin", "operator"]
      },
      {
        id: "dept_ai_cloud",
        name: "AI Systems & Cloud Ops",
        code: "TECH-AI",
        description: "LLM fine-tuning, RAG deployment, vector search, and AWS/GCP cloud setup.",
        locationId: "loc_techsangi",
        headDoctor: "Pawan Sehansha (AI Director)",
        phoneExtension: "402",
        activeCallsCount: 1,
        monthlyQuota: 1000,
        monthlyUsed: 350,
        allowedRoles: ["owner", "dept_admin", "operator"]
      }
    ],
    teamMembers: [
      { id: "usr_pawan", name: "Pawan Joshi", email: "pawan@techsangi.com", role: "owner", department: "Software Architecture & Dev" },
      { id: "usr_neev", name: "Neev Badu", email: "neev@techsangi.com", role: "dept_admin", department: "AI Systems & Cloud Ops" }
    ],
    sampleContacts: [
      {
        name: "Neev Badu",
        phone: "+9779742494897",
        reason: "Web Development & AI Engineering Discovery Session",
        customGoal: "Schedule meeting with Pawan Joshi to discuss AI web platform implementation.",
        language: "ne"
      }
    ],
    systemPromptPreset: "You are Priya, the AI operations coordinator for Tech Sangi. You assist prospective clients in scheduling technical discovery sessions with Pawan Joshi and explaining software development services."
  },

  healthcare: {
    id: "healthcare",
    name: "Apex Health & Medical Network",
    tagline: "Preventive Hygiene, Post-Op Care & Zero-Harm Triage",
    badge: "CLINICAL TELEPHONY",
    icon: "ShieldAlert",
    industryCategory: "health",
    description: "Multi-branch dental and medical practices capturing missed front-desk rings and running multilingual recall campaigns.",
    defaultPromptGoal: "Confirm patient follow-up, check on recovery discomfort, offer available appointment slots, and verify insurance eligibility.",
    departments: [
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
      }
    ],
    teamMembers: [
      { id: "usr_sarah", name: "Dr. Sarah Chen, DDS", email: "sarah.chen@apexhealth.com", role: "owner", department: "General Dentistry & Hygiene" },
      { id: "usr_marcus", name: "Dr. Marcus Vance", email: "marcus.vance@apexhealth.com", role: "dept_admin", department: "Orthodontics & Implants" }
    ],
    sampleContacts: [
      {
        name: "Aarav Sharma",
        phone: "+919810012345",
        reason: "3-Day Post-Op Root Canal Hygiene Follow-up",
        customGoal: "Check if swelling subsided after Tuesday's root canal and confirm follow-up checkup on Friday.",
        language: "hi"
      }
    ],
    systemPromptPreset: "You are Sarah, the dedicated clinical voice coordinator for Apex Health. You speak warmly, concisely, and empathetically in the patient's preferred language."
  }
};

export const DOMAINS: Record<string, DomainConfig> = { ...INITIAL_DOMAINS };

/**
 * Load dynamic workspaces saved by Admin
 */
export function getSavedWorkspaces(): Record<string, DomainConfig> {
  if (typeof window === "undefined") return DOMAINS;
  try {
    const raw = localStorage.getItem("relay_custom_workspaces");
    if (raw) {
      const customMap = JSON.parse(raw);
      return { ...DOMAINS, ...customMap };
    }
  } catch (e: unknown) {
    logger.warn("Failed to load custom workspaces", e);
  }
  return DOMAINS;
}

/**
 * Register a newly created Admin Workspace / Organization
 */
export function saveCustomWorkspace(config: DomainConfig): void {
  DOMAINS[config.id] = config;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("relay_custom_workspaces");
      const existing = raw ? JSON.parse(raw) : {};
      existing[config.id] = config;
      localStorage.setItem("relay_custom_workspaces", JSON.stringify(existing));
    } catch (e: unknown) {
      logger.warn("Failed to save custom workspace", e);
    }
  }
}

/**
 * Add a new Department / Branch Node to an existing workspace
 */
export function addDepartmentToWorkspace(workspaceId: string, department: Department): void {
  const ws = DOMAINS[workspaceId];
  if (ws) {
    ws.departments.push(department);
    saveCustomWorkspace(ws);
  }
}

/**
 * Link/Bridge two workspaces for cross-organization admin escalation
 */
export function toggleWorkspaceBridge(fromWorkspaceId: string, targetWorkspaceId: string): void {
  const ws = DOMAINS[fromWorkspaceId];
  if (ws) {
    if (!ws.connectedWorkspaceIds) ws.connectedWorkspaceIds = [];
    const idx = ws.connectedWorkspaceIds.indexOf(targetWorkspaceId);
    if (idx >= 0) {
      ws.connectedWorkspaceIds.splice(idx, 1);
    } else {
      ws.connectedWorkspaceIds.push(targetWorkspaceId);
    }
    saveCustomWorkspace(ws);
  }
}

/**
 * Add a Team Member to an existing workspace
 */
export function addTeamMemberToWorkspace(workspaceId: string, member: WorkspaceMember): void {
  const ws = DOMAINS[workspaceId];
  if (ws) {
    if (!ws.teamMembers) ws.teamMembers = [];
    ws.teamMembers.push(member);
    saveCustomWorkspace(ws);
  }
}

/**
 * Delete a custom workspace
 */
export function deleteWorkspace(workspaceId: string): void {
  delete DOMAINS[workspaceId];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("relay_custom_workspaces");
      if (raw) {
        const existing = JSON.parse(raw);
        delete existing[workspaceId];
        localStorage.setItem("relay_custom_workspaces", JSON.stringify(existing));
      }
    } catch (e: unknown) {
      logger.warn("Failed to delete custom workspace", e);
    }
  }
}

/**
 * Edit / Customize workspace metadata & AI instructions
 */
export function updateWorkspaceDetails(workspaceId: string, updates: Partial<DomainConfig>): void {
  const ws = DOMAINS[workspaceId];
  if (ws) {
    Object.assign(ws, updates);
    saveCustomWorkspace(ws);
  }
}

/**
 * Remove a team member from a workspace
 */
export function deleteTeamMemberFromWorkspace(workspaceId: string, memberId: string): void {
  const ws = DOMAINS[workspaceId];
  if (ws && ws.teamMembers) {
    ws.teamMembers = ws.teamMembers.filter(m => m.id !== memberId);
    saveCustomWorkspace(ws);
  }
}

/**
 * Remove a department node from a workspace
 */
export function deleteDepartmentFromWorkspace(workspaceId: string, deptId: string): void {
  const ws = DOMAINS[workspaceId];
  if (ws && ws.departments) {
    ws.departments = ws.departments.filter(d => d.id !== deptId);
    saveCustomWorkspace(ws);
  }
}
