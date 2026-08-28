"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TeamMember, Department, ClinicLocation, DashboardStats, LanguageCode } from "./types";
import { DomainConfig, WorkspaceMember, getSavedWorkspaces, addTeamMemberToWorkspace, addDepartmentToWorkspace } from "./domains";

interface ConsoleContextType {
  currentUser: TeamMember | null;
  activeLanguage: LanguageCode;
  departments: Department[];
  activeDeptId: string;
  locations: ClinicLocation[];
  stats: DashboardStats | null;
  isLoading: boolean;
  activeWorkspaceId: string;
  activeWorkspace: DomainConfig;
  workspacesMap: Record<string, DomainConfig>;
  setActiveWorkspaceId: (workspaceId: string) => void;
  setActiveDeptId: (deptId: string) => void;
  setActiveLanguage: (lang: LanguageCode) => void;
  refreshConsoleData: () => Promise<void>;
  refreshWorkspaces: () => void;
  addTeamMemberToActiveWorkspace: (member: Omit<WorkspaceMember, "id">) => void;
  addDepartmentToActiveWorkspaceState: (department: Department) => void;
}

const defaultWorkspaces = getSavedWorkspaces();
const defaultWsId = typeof window !== "undefined" && localStorage.getItem("relay_active_workspace") 
  ? (localStorage.getItem("relay_active_workspace")! in defaultWorkspaces ? localStorage.getItem("relay_active_workspace")! : "tech_sangi") 
  : "tech_sangi";

const ConsoleContext = createContext<ConsoleContextType>({
  currentUser: null,
  activeLanguage: "en",
  departments: [],
  activeDeptId: "all",
  locations: [],
  stats: null,
  isLoading: true,
  activeWorkspaceId: defaultWsId,
  activeWorkspace: defaultWorkspaces[defaultWsId] || defaultWorkspaces["tech_sangi"],
  workspacesMap: defaultWorkspaces,
  setActiveWorkspaceId: () => {},
  setActiveDeptId: () => {},
  setActiveLanguage: () => {},
  refreshConsoleData: async () => {},
  refreshWorkspaces: () => {},
  addTeamMemberToActiveWorkspace: () => {},
  addDepartmentToActiveWorkspaceState: () => {}
});

// Module-level persistent cache across page changes
let cachedCurrentUser: TeamMember | null = null;
const cachedDepartments: Department[] = [];
let cachedLocations: ClinicLocation[] = [];
let cachedStats: DashboardStats | null = null;
let cachedLang: LanguageCode = "en";
let cachedDeptId: string = "all";
let hasInitialized = false;

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(cachedCurrentUser);
  const [activeLanguage, setActiveLangState] = useState<LanguageCode>(cachedLang);
  const [workspacesMap, setWorkspacesMap] = useState<Record<string, DomainConfig>>(() => getSavedWorkspaces());
  
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("relay_active_workspace");
      if (stored && stored in workspacesMap) return stored;
    }
    return "tech_sangi";
  });

  const activeWorkspace = workspacesMap[activeWorkspaceId] || workspacesMap["tech_sangi"] || Object.values(workspacesMap)[0];
  const [departments, setDepartments] = useState<Department[]>(activeWorkspace?.departments || cachedDepartments);
  const [activeDeptId, setActiveDeptIdState] = useState<string>(cachedDeptId);
  const [locations, setLocations] = useState<ClinicLocation[]>(cachedLocations);
  const [stats, setStats] = useState<DashboardStats | null>(cachedStats);
  const [isLoading, setIsLoading] = useState<boolean>(!hasInitialized);

  const refreshWorkspaces = useCallback(() => {
    const updatedMap = getSavedWorkspaces();
    setWorkspacesMap(updatedMap);
  }, []);

  const setActiveWorkspaceId = (wsId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("relay_active_workspace", wsId);
    }
    setActiveWorkspaceIdState(wsId);
    const targetWs = workspacesMap[wsId];
    if (targetWs && targetWs.departments) {
      setDepartments(targetWs.departments);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("relay_workspace_changed", { detail: { workspaceId: wsId } }));
    }
  };

  const addTeamMemberToActiveWorkspace = (member: Omit<WorkspaceMember, "id">) => {
    const newMember: WorkspaceMember = {
      ...member,
      id: `usr_${Date.now()}`
    };
    addTeamMemberToWorkspace(activeWorkspaceId, newMember);
    refreshWorkspaces();
  };

  const addDepartmentToActiveWorkspaceState = (department: Department) => {
    addDepartmentToWorkspace(activeWorkspaceId, department);
    refreshWorkspaces();
    setDepartments((prev) => [...prev, department]);
  };

  const fetchConsoleData = useCallback(async () => {
    try {
      const [iamRes, locsRes, statsRes] = await Promise.all([
        fetch("/api/iam"),
        fetch("/api/locations"),
        fetch("/api/call-results/stats")
      ]);

      if (iamRes.ok) {
        const d = await iamRes.json();
        if (d.ok) {
          cachedCurrentUser = d.currentUser;
          cachedLang = d.activeLanguage || "en";
          setCurrentUser(cachedCurrentUser);
          setActiveLangState(cachedLang);
        }
      }

      if (locsRes.ok) {
        const d = await locsRes.json();
        cachedLocations = d.locations || [];
        setLocations(cachedLocations);
      }

      if (statsRes.ok) {
        const d = await statsRes.json();
        cachedStats = d.stats || null;
        setStats(cachedStats);
      }

      hasInitialized = true;
    } catch (err) {
      console.warn("Console data load warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsoleData();
  }, [fetchConsoleData]);

  const setActiveDeptId = async (deptId: string) => {
    cachedDeptId = deptId;
    setActiveDeptIdState(deptId);
    try {
      await fetch("/api/iam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_department", departmentId: deptId })
      });
    } catch {}
  };

  const setActiveLanguage = async (lang: LanguageCode) => {
    cachedLang = lang;
    setActiveLangState(lang);
    try {
      await fetch("/api/iam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_language", language: lang })
      });
    } catch {}
  };

  return (
    <ConsoleContext.Provider
      value={{
        currentUser,
        activeLanguage,
        departments,
        activeDeptId,
        locations,
        stats,
        isLoading,
        activeWorkspaceId,
        activeWorkspace,
        workspacesMap,
        setActiveWorkspaceId,
        setActiveDeptId,
        setActiveLanguage,
        refreshConsoleData: fetchConsoleData,
        refreshWorkspaces,
        addTeamMemberToActiveWorkspace,
        addDepartmentToActiveWorkspaceState
      }}
    >
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  return useContext(ConsoleContext);
}
