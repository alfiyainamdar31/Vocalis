// server/src/controllers/ttsController.js
const { generateTTS, TTSError } = require("../services/ttsService.js");

const {
  getAllVoices,
  getDefaultVoice,
  SUPPORTED_LANGUAGES,
} = require("../services/voiceService.js");

const { normalizeSpeed, DEFAULT_SPEED } = require("../config/voices.js");

/* ------------------------------------------------------------------ */
/*  GET /api/tts/voices                                                */
/* ------------------------------------------------------------------ */
const getVoicesController = async (req, res) => {
  try {
    const includeExtended = req.query.extended === "true";
    const requested = req.query.language || "en-US";
    const language = SUPPORTED_LANGUAGES.includes(requested)
      ? requested
      : "en-US";

    const voices = await getAllVoices(includeExtended, language);

    res.json({
      success: true,
      language,
      voices,
      defaultVoice: getDefaultVoice(language),
    });
  } catch (err) {
    console.error("Voices Error:", err.message);
    res.status(500).json({
      success: false,
      code: "voices_unavailable",
      message: "Failed to load voices.",
    });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/tts/generate                                             */
/* ------------------------------------------------------------------ */
const generateTTSController = async (req, res) => {
  try {
    const { text, voice, speed } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        code: "invalid_input",
        message: "Text is required.",
      });
    }

    const normalizedSpeed = normalizeSpeed(speed);

    const { base64, mimeType } = await generateTTS(
      text,
      voice,
      normalizedSpeed,
    );

    res.json({
      success: true,
      audio: base64,
      mimeType,
      speed: normalizedSpeed,
    });
  } catch (err) {
    // -------- Typed errors from ttsService --------
    if (err instanceof TTSError) {
      const payload = {
        success: false,
        code: err.code,
        message: err.message,
      };

      if (err.retryAfterMs) {
        payload.retryAfterMs = err.retryAfterMs;
        res.set("Retry-After", Math.ceil(err.retryAfterMs / 1000));
      }

      return res.status(err.status).json(payload);
    }

    // -------- Truly unexpected --------
    console.error("Unhandled TTS Error:", err);
    res.status(500).json({
      success: false,
      code: "internal_error",
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  generateTTSController,
  getVoicesController,
  DEFAULT_SPEED,
};
