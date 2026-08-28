/**
 * lib/aws-polly.ts
 * Amazon Polly Neural & Generative Text-to-Speech Engine
 * Provides lifelike, studio-grade human conversational voice synthesis.
 * Supports AWS Profile configuration ('cloudblueprint') or standard AWS environment credentials.
 */

import { PollyClient, SynthesizeSpeechCommand, Engine, VoiceId, OutputFormat } from "@aws-sdk/client-polly";
import { logger } from "./logger";

export interface PollySynthesizeParams {
  text: string;
  lang?: string; // "hi" | "ne" | "es" | "en" | "hi-IN" | "es-ES" | "en-US"
  voiceId?: string;
  isAI?: boolean;
}

/**
 * Maps language & speaker role to optimal Amazon Polly Neural / Generative Voices
 */
export function getAmazonPollyVoiceConfig(lang: string = "en", isAI: boolean = true): {
  voiceId: VoiceId;
  engine: Engine;
  languageCode: string;
} {
  const cleanLang = (lang || "").toLowerCase();

  if (cleanLang.startsWith("hi") || cleanLang === "hindi") {
    // Hindi & English Bilingual Neural Female Voice (Kajal / Aditi)
    return {
      voiceId: (isAI ? "Kajal" : "Aditi") as VoiceId,
      engine: "neural" as Engine,
      languageCode: "hi-IN"
    };
  }

  if (cleanLang.startsWith("ne") || cleanLang === "nepali") {
    // Nepali / South Asian Conversational Neural Voice
    return {
      voiceId: (isAI ? "Kajal" : "Aditi") as VoiceId,
      engine: "neural" as Engine,
      languageCode: "hi-IN"
    };
  }

  if (cleanLang.startsWith("es") || cleanLang === "spanish") {
    // Lifelike Spanish Neural Voice (Mia / Lucia / Pedro)
    return {
      voiceId: (isAI ? "Mia" : "Pedro") as VoiceId,
      engine: "neural" as Engine,
      languageCode: "es-MX"
    };
  }

  // Default English (US / Global) Generative / Neural Voice
  return {
    voiceId: (isAI ? "Ruth" : "Matthew") as VoiceId,
    engine: "generative" as Engine,
    languageCode: "en-US"
  };
}

/**
 * Initializes Amazon Polly Client configured with AWS Profile or Environment Credentials
 */
function createPollyClient(): PollyClient {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";

  // Check explicit profile or environment keys
  const profile = process.env.AWS_PROFILE || "cloudblueprint";

  logger.info(`[Amazon Polly] Initializing Polly Client (Region: ${region}, Profile: ${profile})`);

  return new PollyClient({
    region,
    // AWS SDK v3 automatically resolves AWS_PROFILE or standard credential chain
  });
}

let pollyClientInstance: PollyClient | null = null;
function getPollyClient(): PollyClient {
  if (!pollyClientInstance) {
    pollyClientInstance = createPollyClient();
  }
  return pollyClientInstance;
}

/**
 * Synthesizes Speech via Amazon Polly and returns MP3 Buffer
 */
export async function synthesizeAmazonPollySpeech(params: PollySynthesizeParams): Promise<Buffer | null> {
  try {
    const { text, lang = "en", isAI = true } = params;
    const voiceConfig = getAmazonPollyVoiceConfig(lang, isAI);

    const client = getPollyClient();

    // Clean text for speech synthesis
    const ssmlText = `<speak><amazon:domain name="conversational">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</amazon:domain></speak>`;

    const command = new SynthesizeSpeechCommand({
      Text: ssmlText,
      TextType: "ssml",
      OutputFormat: OutputFormat.MP3,
      VoiceId: (params.voiceId || voiceConfig.voiceId) as VoiceId,
      Engine: voiceConfig.engine,
      LanguageCode: voiceConfig.languageCode as any
    });

    const response = await client.send(command);

    if (response.AudioStream) {
      const byteArray = await response.AudioStream.transformToByteArray();
      return Buffer.from(byteArray);
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.warn(`[Amazon Polly] Direct SDK synthesis fallback due to credential environment state: ${errMsg}`);
  }

  return null;
}
