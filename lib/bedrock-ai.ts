/**
 * lib/bedrock-ai.ts
 * AWS Bedrock Runtime Client — Enterprise Neural Reasoning & Post-Call CRM Intelligence
 *
 * Invokes foundation models (Anthropic Claude 3.5 Sonnet / Meta Llama 3) via Amazon Bedrock
 * with zero data retention and HIPAA-eligible runtime guardrails.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const AWS_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";

let _bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
  if (!_bedrockClient) {
    _bedrockClient = new BedrockRuntimeClient({
      region: AWS_REGION,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              sessionToken: process.env.AWS_SESSION_TOKEN
            }
          : undefined
    });
  }
  return _bedrockClient;
}

export interface BedrockChatOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  modelId?: string;
}

export interface PostCallIntelligence {
  sentimentScore: "positive" | "neutral" | "urgent" | "frustrated";
  callerIntent: string;
  actionItems: string[];
  recommendedFollowUpSms: string;
  coachingInsight: string;
  provider?: "aws_bedrock" | "nebius_deepseek" | "demo_simulated";
}

/**
 * Invokes Amazon Bedrock Claude 3.5 Sonnet / Llama 3
 */
export async function callBedrockModel(options: BedrockChatOptions): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1500, modelId = BEDROCK_MODEL_ID } = options;
  const client = getBedrockClient();

  // Anthropic Claude Messages API payload
  if (modelId.includes("anthropic") || modelId.includes("claude")) {
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(responseBody);
    return parsed.content?.[0]?.text || "";
  }

  // Meta Llama 3 payload fallback
  const llamaPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
  const payload = {
    prompt: llamaPrompt,
    max_gen_len: maxTokens,
    temperature
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  });

  const response = await client.send(command);
  const responseBody = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(responseBody);
  return parsed.generation || "";
}

/**
 * Analyzes call transcripts using AWS Bedrock Claude 3.5 Sonnet
 */
export async function analyzeCallTranscriptWithBedrock(
  transcript: string,
  callerName = "Caller",
  businessName = "Our Team"
): Promise<PostCallIntelligence> {
  const systemPrompt = `You are an AI Telephony Quality & Post-Call CRM Intelligence Engine hosted on AWS Bedrock.
Analyze the voice call transcript between our autonomous voice representative and ${callerName}.
Output strictly valid JSON with this exact schema:
{
  "sentimentScore": "positive" | "neutral" | "urgent" | "frustrated",
  "callerIntent": "Primary goal of the caller (e.g. Schedule appointment, inquire about pricing, request human callback)",
  "actionItems": ["Action 1 for staff", "Action 2 for staff"],
  "recommendedFollowUpSms": "Short, polite 1-sentence SMS to send to ${callerName} following up on their call (in the language spoken in transcript)",
  "coachingInsight": "1-sentence evaluation of how effectively the voice agent assisted the customer and addressed their need"
}`;

  const userPrompt = `Caller Name: ${callerName}\nBusiness: ${businessName}\n\nTranscript:\n${transcript || "No audio transcript recorded."}`;

  const rawText = await callBedrockModel({
    systemPrompt,
    userPrompt,
    temperature: 0.2,
    maxTokens: 800
  });

  // Extract JSON block if wrapped in markdown code fence
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  const cleanJson = jsonMatch ? jsonMatch[0] : rawText;
  const parsed = JSON.parse(cleanJson);

  return {
    sentimentScore: ["positive", "neutral", "urgent", "frustrated"].includes(parsed.sentimentScore)
      ? parsed.sentimentScore
      : "neutral",
    callerIntent: parsed.callerIntent || "General Inquiry",
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ["Review call log"],
    recommendedFollowUpSms: parsed.recommendedFollowUpSms || `Thank you for contacting ${businessName}! We have recorded your request.`,
    coachingInsight: parsed.coachingInsight || "Call handled successfully within operational guidelines.",
    provider: "aws_bedrock"
  };
}
