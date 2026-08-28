export type LanguageCode =
  | "en"
  | "hi"
  | "ne"
  | "es"
  | "fr"
  | "de"
  | "zh";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  locale: string;
  voiceProfile: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", locale: "en-US", voiceProfile: "Native Neural Voice" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳", locale: "hi-IN", voiceProfile: "Conversational Neural Voice" },
  { code: "ne", label: "Nepali", nativeLabel: "नेपाली", flag: "🇳🇵", locale: "ne-NP", voiceProfile: "Respectful Neural Voice" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸", locale: "es-US", voiceProfile: "Fluent Neural Voice" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷", locale: "fr-FR", voiceProfile: "Fluent Neural Voice" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪", locale: "de-DE", voiceProfile: "Fluent Neural Voice" },
  { code: "zh", label: "Mandarin", nativeLabel: "中文", flag: "🇨🇳", locale: "zh-CN", voiceProfile: "Fluent Neural Voice" }
];

export interface CountryOption {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
  carrierType: "Direct PSTN" | "Autonomous Gateway";
  exampleNumber: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "IN", dialCode: "+91", name: "India", flag: "🇮🇳", carrierType: "Direct PSTN", exampleNumber: "9810012345" },
  { code: "US", dialCode: "+1", name: "United States / CA", flag: "🇺🇸", carrierType: "Direct PSTN", exampleNumber: "4155552671" },
  { code: "GB", dialCode: "+44", name: "United Kingdom", flag: "🇬🇧", carrierType: "Direct PSTN", exampleNumber: "7911123456" },
  { code: "NP", dialCode: "+977", name: "Nepal", flag: "🇳🇵", carrierType: "Autonomous Gateway", exampleNumber: "9818975366" },
  { code: "ES", dialCode: "+34", name: "Spain / EU", flag: "🇪🇸", carrierType: "Direct PSTN", exampleNumber: "612345678" },
  { code: "FR", dialCode: "+33", name: "France", flag: "🇫🇷", carrierType: "Direct PSTN", exampleNumber: "612345678" },
  { code: "DE", dialCode: "+49", name: "Germany", flag: "🇩🇪", carrierType: "Direct PSTN", exampleNumber: "15123456789" },
  { code: "CN", dialCode: "+86", name: "China", flag: "🇨🇳", carrierType: "Direct PSTN", exampleNumber: "13800138000" }
];

export type UserRole = "owner" | "dept_admin" | "operator" | "media_pr";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  locationId: string;
  headDoctor: string;
  phoneExtension: string;
  activeCallsCount: number;
  monthlyQuota: number;
  monthlyUsed: number;
  allowedRoles: UserRole[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentIds: string[];
  avatarUrl?: string;
  lastActive: string;
  status: "active" | "invited" | "suspended";
}

export interface StructuredCallOutcome {
  call_id: string;
  location_id: string;
  department_id?: string;
  call_type: "inbound_overflow" | "outbound_recall" | "batch_followup";
  caller_verified: boolean;
  outcome:
    | "booked"
    | "rescheduled"
    | "declined"
    | "callback_requested"
    | "escalated_urgent"
    | "opt_out"
    | "voicemail_left"
    | "no_answer"
    | "unknown";
  appointment: {
    booked: boolean;
    datetime: string | null;
    service_type: string | null;
  };
  callback: {
    requested: boolean;
    priority: "standard" | "urgent" | null;
    reason: string | null;
  };
  opt_out: boolean;
  sentiment: "positive" | "neutral" | "frustrated" | "distressed" | "unknown";
  language?: LanguageCode;
  notes: string;
}

export interface PostCallAiIntelligence {
  sentimentScore: "positive" | "neutral" | "urgent" | "frustrated";
  callerIntent: string;
  actionItems: string[];
  recommendedFollowUpSms: string;
  coachingInsight: string;
  aiEngine?: string;
}

export interface CallRecord {
  id: string;
  runId?: string;
  phoneNumber: string;
  patientName: string;
  locationId: string;
  departmentId?: string;
  callType: "inbound_overflow" | "outbound_recall" | "batch_followup";
  status: "planning" | "running" | "queued" | "ringing" | "in-progress" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  structuredOutcome?: StructuredCallOutcome;
  summary?: string;
  aiIntelligence?: PostCallAiIntelligence;
  rawCalleData?: any;
  recoveredRevenue: number;
  language?: LanguageCode;
  customGoal?: string;
  recordingUrl?: string;
  durationSeconds?: number;
}

export interface BatchFollowupItem {
  id: string;
  patientName: string;
  phoneNumber: string;
  departmentId: string;
  reason: string;
  customGoal: string;
  language: LanguageCode;
  status: "queued" | "dialing" | "completed" | "failed";
  callId?: string;
  outcome?: string;
  notes?: string;
}

export interface BatchCampaign {
  id: string;
  title: string;
  departmentId: string;
  createdAt: string;
  totalContacts: number;
  completedCount: number;
  bookedCount: number;
  status: "draft" | "processing" | "completed" | "paused";
  items: BatchFollowupItem[];
}

export interface ClinicLocation {
  id: string;
  name: string;
  industry?: string;
  address: string;
  phone: string;
  on_call_doctor: string;
  on_call_doctor_phone?: string;
  timezone?: string;
  hours?: string | Record<string, string>;
  services: string[];
  website_url?: string;
  knowledge_base?: string;
  payment_plans_available?: boolean;
  average_ticket_value: number;
  defaultContext?: string;
  departments?: Department[];
}

export interface BudgetStatus {
  initialBudget: number;
  liveCallsUsed: number;
  remaining: number;
  reservedForDemo: number;
}

export interface DashboardStats {
  totalCalls: number;
  completedCalls: number;
  bookedCalls: number;
  urgentEscalations: number;
  totalRevenueRecovered: number;
  captureRate: number;
  locationStats: Record<string, { total: number; booked: number; revenue: number }>;
  departmentStats: Record<string, { total: number; booked: number; revenue: number }>;
  budget: BudgetStatus;
}

export interface RecallPatient {
  id: string;
  name: string;
  phone: string;
  location_id: string;
  department_id?: string;
  last_visit: string;
  due_for: string;
  preferred_days: string[];
  notes: string;
  preferred_language?: LanguageCode;
}
