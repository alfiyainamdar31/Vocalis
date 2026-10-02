require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");
const { PREBUILT_VOICES, DEFAULT_VOICE } = require("../config/voices.js");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 60000 },
});

const SUPPORTED_LANGUAGES = ["en-US", "hi-IN", "mr-IN", "ur-IN"];

const getPreviewUrl = (voiceId, language) => {
  return `/voice-previews/${language}/${voiceId}.wav`;
};

const listExtendedVoices = async (filters = {}) => {
  const language =
    typeof filters.language_code === "string"
      ? filters.language_code
      : SUPPORTED_LANGUAGES[0];

  const response = await ai.voices.list({
    language_code: [language],
    type: ["prebuilt"],
    page_size: filters.page_size || 100,
  });

  const voices = (response.voices ?? []).map((v) => ({
    value: v.id,
    label: v.display_name || v.id,
    description: v.description || v.accent || "",
    language: v.language_code || language,
    accent: v.accent,
    gender: v.gender,
    pitch: v.pitch,
    extended: true,
    previewUrl: getPreviewUrl(v.id, v.language_code || language),
  }));

  return voices;
};

const getAllVoices = async (includeExtended = false, language = "en-US") => {
  const curated = PREBUILT_VOICES.map((v) => ({
    ...v,
    language,
    extended: false,
    previewUrl: getPreviewUrl(v.value, language),
  }));

  if (!includeExtended) return curated;

  try {
    const extended = await listExtendedVoices({
      language_code: language,
    });

    const seen = new Set(curated.map((v) => v.value.toLowerCase()));
    const merged = [...curated];

    for (const v of extended) {
      const key = v.value.toLowerCase();

      if (!seen.has(key)) {
        merged.push(v);
        seen.add(key);
      }
    }

    return merged;
  } catch (err) {
    console.error(
      `Extended voices fetch failed for ${language}, falling back to curated:`,
      err.message,
    );

    return curated;
  }
};

const getDefaultVoice = (language) => {
  return DEFAULT_VOICE;
};

module.exports = {
  SUPPORTED_LANGUAGES,
  listExtendedVoices,
  getAllVoices,
  getDefaultVoice,
};
