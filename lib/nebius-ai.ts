/**
 * Nebius AI Token Factory - DeepSeek-V4-Flash-0731 Integration Client
 * Provides high-speed neural reasoning for Web RAG Knowledge Ingestion,
 * Deep Intent Classification, and Post-Call CRM Intelligence.
 */

function getNebiusApiKey(): string {
  const key = process.env.NEBIUS_API_KEY;
  if (!key) {
    throw new Error(
      "[Nebius AI Client] Missing required environment variable: NEBIUS_API_KEY. Please configure NEBIUS_API_KEY in your environment or .env.local file."
    );
  }
  return key;
}

const NEBIUS_BASE_URL =
  process.env.NEBIUS_BASE_URL ||
  "https://api.tokenfactory.us-central1.nebius.com/v1/";

const NEBIUS_MODEL =
  process.env.NEBIUS_MODEL || "deepseek-ai/DeepSeek-V4-Flash-0731";

export interface NebiusChatOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Generic execution wrapper for Nebius Token Factory DeepSeek-V4-Flash-0731
 */
export async function callNebiusDeepSeek(options: NebiusChatOptions): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1500, jsonMode = false } = options;

  const url = `${NEBIUS_BASE_URL.replace(/\/+$/, "")}/chat/completions`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  const body: any = {
    model: NEBIUS_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getNebiusApiKey()}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Nebius DeepSeek API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content || "";
  return content.trim();
}

export interface ExtractedWebsiteKnowledge {
  brandName: string;
  industry: string;
  overview: string;
  keyServices: string[];
  pricingOrFaqs: string[];
  knowledgeBase: string;
}

/**
 * 1. DeepSeek Neural Web RAG Extractor
 * Synthesizes dense, factual knowledge base from raw scraped website HTML/text
 */
export async function extractWebsiteKnowledgeWithDeepSeek(
  rawText: string,
  url: string
): Promise<ExtractedWebsiteKnowledge> {
  const systemPrompt = `You are an expert Enterprise Knowledge Extractor for real-time voice agents.
Your task is to analyze scraped website text from ${url} and extract structured business facts.
Output strictly valid JSON with this exact schema:
{
  "brandName": "Official company/practice name",
  "industry": "One of: Tech/Software, Healthcare, Automotive, Legal, Hospitality, Real Estate, Business Services",
  "overview": "Crisp 1-2 sentence high-level summary of what the company does",
  "keyServices": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5"],
  "pricingOrFaqs": ["Key pricing or FAQ highlight 1", "Key pricing or FAQ highlight 2"],
  "knowledgeBase": "Dense, structured Markdown grounding facts (under 1200 characters) designed for sub-second voice agent lookup. Include exact company name, offered services, hours/contact if mentioned, and key value propositions. NEVER invent facts not present in text."
}`;

  const userPrompt = `Website URL: ${url}\n\nScraped Content:\n${rawText.slice(0, 10000)}`;

  try {
    const rawJson = await callNebiusDeepSeek({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 1000,
      jsonMode: true
    });

    const parsed = JSON.parse(rawJson);
    return {
      brandName: parsed.brandName || "Enterprise Partner",
      industry: parsed.industry || "Business Services",
      overview: parsed.overview || "Professional service organization.",
      keyServices: Array.isArray(parsed.keyServices) ? parsed.keyServices : [],
      pricingOrFaqs: Array.isArray(parsed.pricingOrFaqs) ? parsed.pricingOrFaqs : [],
      knowledgeBase: parsed.knowledgeBase || `Company URL: ${url}\nServices: ${(parsed.keyServices || []).join(", ")}`
    };
  } catch (err: any) {
    console.warn("[Nebius DeepSeek] Fallback on parsing error:", err.message);
    return {
      brandName: "Verified Organization",
      industry: "Business Services",
      overview: rawText.slice(0, 200),
      keyServices: [],
      pricingOrFaqs: [],
      knowledgeBase: `URL: ${url}\nContent: ${rawText.slice(0, 800)}`
    };
  }
}

export interface PostCallIntelligence {
  sentimentScore: "positive" | "neutral" | "urgent" | "frustrated";
  callerIntent: string;
  actionItems: string[];
  recommendedFollowUpSms: string;
  coachingInsight: string;
}

/**
 * 2. DeepSeek Post-Call CRM Intelligence & Coaching
 * Analyzes voice call transcript and generates action items & follow-up recommendations.
 */
export async function analyzeCallTranscriptWithDeepSeek(
  transcript: string,
  callerName: string = "Caller",
  businessName: string = "Our Team"
): Promise<PostCallIntelligence> {
  const systemPrompt = `You are an AI Telephony Quality & Post-Call CRM Intelligence Engine.
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

  try {
    const rawJson = await callNebiusDeepSeek({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 800,
      jsonMode: true
    });

    const parsed = JSON.parse(rawJson);
    return {
      sentimentScore: ["positive", "neutral", "urgent", "frustrated"].includes(parsed.sentimentScore)
        ? parsed.sentimentScore
        : "neutral",
      callerIntent: parsed.callerIntent || "General Inquiry",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ["Review call log"],
      recommendedFollowUpSms: parsed.recommendedFollowUpSms || `Thank you for contacting ${businessName}! We have recorded your request.`,
      coachingInsight: parsed.coachingInsight || "Call handled successfully within operational guidelines."
    };
  } catch (err: any) {
    console.warn("[Nebius DeepSeek] Post-call analysis fallback:", err.message);
    return {
      sentimentScore: "neutral",
      callerIntent: "Inquiry",
      actionItems: ["Review transcript"],
      recommendedFollowUpSms: `Thank you for speaking with ${businessName}.`,
      coachingInsight: "Transcript processed via standard pipeline."
    };
  }
}
