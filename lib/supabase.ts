/**
 * lib/supabase.ts
 * Supabase client helpers and database sync utilities.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { CallRecord } from "./types";

export { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
export { createClient as createBrowserSupabaseClient } from "@/utils/supabase/client";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

let _directClient: ReturnType<typeof createSupabaseClient> | null = null;

function getDirectClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!_directClient) {
    _directClient = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return _directClient;
}

/**
 * Asynchronously syncs a CallRecord into the Supabase calls table.
 */
export async function syncCallToSupabase(call: CallRecord): Promise<void> {
  const client = getDirectClient();
  if (!client) return;

  try {
    const row: DbCallRecord = {
      id: call.id,
      run_id: call.runId || null,
      phone_number: call.phoneNumber,
      patient_name: call.patientName,
      location_id: call.locationId || "loc_downtown",
      department_id: call.departmentId || "dept_general",
      call_type: call.callType,
      status: call.status,
      language: call.language || "en",
      custom_goal: call.customGoal || null,
      summary: call.summary || null,
      structured_outcome: (call.structuredOutcome as unknown as Record<string, unknown>) || null,
      recovered_revenue: call.recoveredRevenue || 0,
      created_at: call.createdAt || new Date().toISOString(),
      completed_at: call.completedAt || null
    };

    const { error } = await (client.from("calls") as any).upsert({
      ...row,
      org_id: "org_apex"
    });

    if (error) {
      console.warn("[Supabase Sync] Error syncing call:", error.message);
    }
  } catch (err) {
    console.warn("[Supabase Sync] Exception while syncing call to Supabase:", err);
  }
}

// ─── Typed DB Row Interfaces ─────────────────────────────────────────────────

export interface DbCallRecord {
  id: string;
  run_id: string | null;
  phone_number: string;
  patient_name: string;
  location_id: string;
  department_id: string | null;
  call_type: "inbound_overflow" | "outbound_recall" | "batch_followup";
  status: "planning" | "running" | "queued" | "ringing" | "in-progress" | "completed" | "failed";
  created_at: string;
  completed_at: string | null;
  structured_outcome: Record<string, unknown> | null;
  summary: string | null;
  recovered_revenue: number;
  language: string | null;
  custom_goal: string | null;
}

export interface DbBatchCampaign {
  id: string;
  title: string;
  department_id: string;
  created_at: string;
  total_contacts: number;
  completed_count: number;
  booked_count: number;
  status: "draft" | "processing" | "completed" | "paused";
}

export interface DbBatchItem {
  id: string;
  campaign_id: string;
  patient_name: string;
  phone_number: string;
  department_id: string;
  reason: string;
  custom_goal: string;
  language: string;
  status: "queued" | "dialing" | "completed" | "failed";
  call_id: string | null;
  outcome: string | null;
  notes: string | null;
}

export interface DbDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  location_id: string;
  head_doctor: string;
  phone_extension: string;
  active_calls_count: number;
  monthly_quota: number;
  monthly_used: number;
  allowed_roles: string[];
}

export interface DbAuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  actor_id: string | null;
  created_at: string;
}
