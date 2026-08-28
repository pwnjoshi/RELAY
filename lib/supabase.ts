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

export interface DbCalendarConnection {
  id: string;
  branch_id: string;
  user_id?: string | null;
  google_email?: string | null;
  encrypted_refresh_token: string;
  calendar_id: string;
  access_token?: string | null;
  access_token_expires_at?: number | null;
  config_json?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbIdempotencyKey {
  key: string;
  response_json: Record<string, unknown>;
  status_code: number;
  created_at: string;
}

/**
 * Fetch calendar connection row for a given branch from Supabase
 */
export async function getDbCalendarConnection(branchId: string): Promise<DbCalendarConnection | null> {
  const client = getDirectClient();
  if (!client) return null;

  try {
    const { data, error } = await (client.from("calendar_connections") as any)
      .select("*")
      .eq("branch_id", branchId)
      .single();

    if (error || !data) return null;
    return data as DbCalendarConnection;
  } catch {
    return null;
  }
}

/**
 * Save or update calendar connection row in Supabase
 */
export async function saveDbCalendarConnection(record: Partial<DbCalendarConnection> & { branch_id: string }): Promise<boolean> {
  const client = getDirectClient();
  if (!client) return false;

  try {
    const { error } = await (client.from("calendar_connections") as any).upsert(
      {
        ...record,
        updated_at: new Date().toISOString()
      },
      { onConflict: "branch_id" }
    );

    if (error) {
      console.warn("[Supabase] Error saving calendar connection:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] Exception saving calendar connection:", err);
    return false;
  }
}

/**
 * Delete calendar connection row for a given branch from Supabase
 */
export async function deleteDbCalendarConnection(branchId: string): Promise<boolean> {
  const client = getDirectClient();
  if (!client) return false;

  try {
    const { error } = await (client.from("calendar_connections") as any)
      .delete()
      .eq("branch_id", branchId);

    if (error) {
      console.warn("[Supabase] Error deleting calendar connection:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch cached idempotency response from Supabase
 */
export async function getDbIdempotencyKey(key: string): Promise<DbIdempotencyKey | null> {
  const client = getDirectClient();
  if (!client) return null;

  try {
    const { data, error } = await (client.from("idempotency_keys") as any)
      .select("*")
      .eq("key", key)
      .single();

    if (error || !data) return null;
    return data as DbIdempotencyKey;
  } catch {
    return null;
  }
}

/**
 * Save cached idempotency response in Supabase
 */
export async function saveDbIdempotencyKey(key: string, responseJson: Record<string, unknown>, statusCode = 200): Promise<boolean> {
  const client = getDirectClient();
  if (!client) return false;

  try {
    const { error } = await (client.from("idempotency_keys") as any).upsert({
      key,
      response_json: responseJson,
      status_code: statusCode,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.warn("[Supabase] Error saving idempotency key:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get durable rate limit timestamps for an IP / user key
 */
export async function getDbRateLimit(key: string): Promise<number[] | null> {
  const client = getDirectClient();
  if (!client) return null;

  try {
    const { data, error } = await (client.from("rate_limits") as any)
      .select("timestamps_json")
      .eq("key", key)
      .single();

    if (error || !data || !Array.isArray(data.timestamps_json)) return null;
    return data.timestamps_json as number[];
  } catch {
    return null;
  }
}

/**
 * Save durable rate limit timestamps for an IP / user key
 */
export async function saveDbRateLimit(key: string, timestamps: number[]): Promise<boolean> {
  const client = getDirectClient();
  if (!client) return false;

  try {
    const { error } = await (client.from("rate_limits") as any).upsert({
      key,
      timestamps_json: timestamps,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn("[Supabase] Error saving rate limit:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
