// server/src/services/ttsService.js
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const {
  DEFAULT_VOICE,
  SPEED_INSTRUCTIONS,
  normalizeSpeed,
} = require("../config/voices.js");

// ---- Typed errors (safe to expose to the controller) ----
class TTSError extends Error {
  constructor(message, { code, status, retryAfterMs } = {}) {
    super(message);
    this.name = "TTSError";
    this.code = code || "tts_error";
    this.status = status || 500;
    this.retryAfterMs = retryAfterMs || null;
  }
}

class RateLimitError extends TTSError {
  constructor(message, retryAfterMs) {
    super(message, {
      code: "rate_limit_exceeded",
      status: 429,
      retryAfterMs,
    });
    this.name = "RateLimitError";
  }
}

class QuotaExceededError extends TTSError {
  constructor(message) {
    super(message, { code: "quota_exceeded", status: 429 });
    this.name = "QuotaExceededError";
  }
}

class InvalidInputError extends TTSError {
  constructor(message) {
    super(message, { code: "invalid_input", status: 400 });
    this.name = "InvalidInputError";
  }
}

class UpstreamError extends TTSError {
  constructor(message) {
    super(message, { code: "upstream_error", status: 502 });
    this.name = "UpstreamError";
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 60000 },
});

/**
 * Convert any thrown error from the SDK into one of our typed errors.
 * Never lets the raw SDK object escape.
 */
const normalizeGeminiError = (err) => {
  if (err instanceof TTSError) return err;

  const status =
    err?.status ||
    err?.statusCode ||
    err?.httpMeta?.response?.status ||
    err?.rawResponse?.status;

  const message =
    err?.error?.message || err?.message || "Unknown error from Gemini";

  // ---- 429: rate limit or quota ----
  if (status === 429) {
    const retryAfterHeader =
      err?.headers?.["retry-after"] ||
      err?.httpMeta?.response?.headers?.["retry-after"];

    const retryAfterMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : null;

    const isDailyQuota =
      typeof message === "string" && /per day|daily|quota/i.test(message);

    if (isDailyQuota) {
      return new QuotaExceededError(
        "Daily generation limit reached. Please try again after the quota resets.",
      );
    }

    return new RateLimitError(
      "Too many requests right now. Please slow down and try again shortly.",
      retryAfterMs,
    );
  }

  // ---- 400 / 401 / 403: bad input or auth ----
  if (status === 400) {
    return new InvalidInputError(message);
  }
  if (status === 401 || status === 403) {
    return new UpstreamError(
      "TTS service is temporarily unavailable. Please try again later.",
    );
  }

  // ---- Everything else ----
  return new UpstreamError(
    "TTS service is temporarily unavailable. Please try again later.",
  );
};

/**
 * Generate speech from text using Gemini TTS.
 *
 * @param {string} text
 * @param {string} [voice]
 * @param {number} [speed]
 * @returns {Promise<{base64: string, mimeType: string, speed: number}>}
 * @throws {TTSError}
 */
const generateTTS = async (text, voice, speed) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new InvalidInputError("Text is required.");
  }

  const selectedVoice =
    typeof voice === "string" && voice.trim() !== ""
      ? voice.trim()
      : DEFAULT_VOICE;

  const selectedSpeed = normalizeSpeed(speed);
  const paceStyle = SPEED_INSTRUCTIONS[selectedSpeed];

  const content = { type: "text", text };

  if (paceStyle) {
    content.annotations = [{ type: "speech_metadata", style: paceStyle }];
  }

  let interaction;
  try {
    interaction = await ai.interactions.create({
      model: "gemini-3.8-flash-tts",
      input: [{ type: "user_input", content: [content] }],
      response_format: { type: "audio", mime_type: "audio/wav" },
      generation_config: {
        speech_config: [{ voice: selectedVoice }],
      },
    });
  } catch (err) {
    // 👇 Log once, at the boundary. Do NOT log the full stack downstream.
    console.error(
      `[TTS] Gemini call failed (status=${err?.status ?? "?"}):`,
      err?.error?.message || err?.message,
    );
    throw normalizeGeminiError(err);
  }

  if (!interaction?.output_audio?.data) {
    throw new UpstreamError("Gemini returned no audio data.");
  }

  return {
    base64: interaction.output_audio.data,
    mimeType: interaction.output_audio.mimeType || "audio/wav",
    speed: selectedSpeed,
  };
};

module.exports = {
  generateTTS,
  TTSError,
  RateLimitError,
  QuotaExceededError,
  InvalidInputError,
  UpstreamError,
};
