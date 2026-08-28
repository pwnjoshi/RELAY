/**
 * lib/mcp-bridge.ts
 * Telephony REST Gateway & Connector Bridge
 * 
 * Replaced legacy child_process CLI execution with direct typed HTTP REST calls
 * to eliminate command-injection risks and server-side binary dependencies.
 */

import { createDirectCall, getDirectCall, parseRestCallOutcome } from "./calle-client";
import { runPostCallActionPipeline, activeConnectors } from "./connectors";
import type { StructuredCallOutcome, ClinicLocation, LanguageCode } from "./types";

export interface BridgeCallResult<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
}

/**
 * Direct REST API dispatcher for telephony calls
 */
export async function dispatchTelephonyBridge(params: {
  phoneNumber: string;
  patientName: string;
  location: ClinicLocation;
  callType?: "inbound_overflow" | "outbound_recall" | "batch_followup";
  language?: LanguageCode;
}): Promise<BridgeCallResult> {
  const res = await createDirectCall({
    phoneNumber: params.phoneNumber,
    patientName: params.patientName,
    location: params.location,
    callType: params.callType || "inbound_overflow",
    language: params.language
  });

  return res;
}

/**
 * Direct REST query for live call task status
 */
export async function queryTelephonyBridgeStatus(callId: string): Promise<BridgeCallResult> {
  return await getDirectCall(callId);
}

export { runPostCallActionPipeline, activeConnectors, parseRestCallOutcome };
