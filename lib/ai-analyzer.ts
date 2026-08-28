/**
 * lib/ai-analyzer.ts
 * Unified Telephony Intelligence Dispatcher
 * Defaults to AWS Bedrock (Claude 3.5 Sonnet / Llama 3) with Nebius DeepSeek-V4-Flash fallback
 */

import { analyzeCallTranscriptWithBedrock, PostCallIntelligence } from "./bedrock-ai";
import { analyzeCallTranscriptWithDeepSeek } from "./nebius-ai";

export async function analyzeCallTranscript(
  transcript: string,
  callerName = "Caller",
  businessName = "Our Team"
): Promise<PostCallIntelligence> {
  const provider = (process.env.LLM_PROVIDER || "bedrock").toLowerCase();
  const isDemo = process.env.DEMO_MODE === "true";

  // 1. Primary: AWS Bedrock
  if (provider === "bedrock" && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION)) {
    try {
      return await analyzeCallTranscriptWithBedrock(transcript, callerName, businessName);
    } catch (err: any) {
      console.warn("[Bedrock AI] Bedrock analysis failed, evaluating fallback:", err.message);
    }
  }

  // 2. Secondary / Configured Alternate: Nebius DeepSeek Token Factory
  if (provider === "nebius" || process.env.NEBIUS_API_KEY) {
    try {
      const res = await analyzeCallTranscriptWithDeepSeek(transcript, callerName, businessName);
      return { ...res, provider: "nebius_deepseek" };
    } catch (err: any) {
      console.warn("[Nebius DeepSeek] Nebius analysis failed:", err.message);
    }
  }

  // 3. Explicit Demo Mode Simulation
  if (isDemo) {
    const isUrgent = transcript.toLowerCase().includes("urgent") || transcript.toLowerCase().includes("pain") || transcript.toLowerCase().includes("emergency");
    const isBooked = transcript.toLowerCase().includes("booked") || transcript.toLowerCase().includes("confirm") || transcript.toLowerCase().includes("schedule");

    return {
      sentimentScore: isUrgent ? "urgent" : isBooked ? "positive" : "neutral",
      callerIntent: isBooked ? "Appointment Booking & Scheduling" : "General Inquiry",
      actionItems: isBooked
        ? ["Calendar slot verified & sync logged", "Send SMS confirmation reminder"]
        : ["Review caller inquiry notes", "Assign to department queue"],
      recommendedFollowUpSms: `Hello ${callerName}! Thank you for contacting ${businessName}. Your request has been confirmed.`,
      coachingInsight: "Voice representative successfully resolved caller inquiry with sub-18ms latency.",
      provider: "demo_simulated"
    };
  }

  // 4. If nothing configured and not in demo mode, return explicit unconfigured state
  return {
    sentimentScore: "neutral",
    callerIntent: "Unclassified (AI Unconfigured)",
    actionItems: ["Configure AWS Bedrock or Nebius API Key in environment"],
    recommendedFollowUpSms: `Thank you for speaking with ${businessName}.`,
    coachingInsight: "AI Intelligence Engine is not configured in production environment.",
    provider: "demo_simulated"
  };
}

export type { PostCallIntelligence };
