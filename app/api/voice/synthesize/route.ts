import { NextResponse } from "next/server";
import { synthesizeAmazonPollySpeech, getAmazonPollyVoiceConfig } from "@/lib/aws-polly";
import { logger } from "@/lib/logger";

/**
 * POST /api/voice/synthesize
 * Amazon Polly Neural Voice Synthesizer Gateway
 * Accepts: { text: string, lang: string, isAI?: boolean, voiceId?: string }
 * Returns: audio/mpeg binary stream
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, lang = "en", isAI = true, voiceId } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text parameter is required for voice synthesis" }, { status: 400 });
    }

    const voiceConfig = getAmazonPollyVoiceConfig(lang, isAI);
    logger.info(`[Voice Gateway] Synthesizing via Amazon Polly (${voiceConfig.voiceId}, ${voiceConfig.engine}, lang: ${lang})`);

    // 1. Synthesize via Amazon Polly SDK
    const audioBuffer = await synthesizeAmazonPollySpeech({
      text,
      lang,
      isAI,
      voiceId
    });

    if (audioBuffer && audioBuffer.length > 0) {
      return new Response(new Uint8Array(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400, immutable",
          "X-Voice-Provider": "Amazon Polly",
          "X-Voice-Engine": voiceConfig.engine,
          "X-Voice-Id": voiceConfig.voiceId
        }
      });
    }

    // 2. High-fidelity audio fallback response for dev environments
    return NextResponse.json(
      {
        ok: false,
        fallbackToSpeechSynth: true,
        text,
        lang: voiceConfig.languageCode,
        voiceId: voiceConfig.voiceId,
        provider: "Amazon Polly (Neural)",
        message: "AWS Credentials not configured locally; fallback to browser speech synthesis engine."
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("[Voice Gateway] Error synthesizing speech:", err);
    return NextResponse.json({ error: errMsg || "Speech synthesis failed" }, { status: 500 });
  }
}
