const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const { PREBUILT_VOICES } = require("../src/config/voices.js");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 60000 },
});

const PREVIEW_TEXT =
  "Hello, and welcome. This is how I sound when reading your text aloud — clear, natural, and ready to bring your words to life.";

const OUTPUT_DIR = path.join(
  __dirname,
  "..",
  "assets",
  "voice-previews",
  "en-US",
);

const MODEL = "gemini-3.8-flash-tts";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const voiceToFilename = (voice) => `${voice.trim().toLowerCase()}.wav`;

const generatePreview = async (voice) => {
  console.log(`\n🎙️ Generating preview for: ${voice}`);

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: [
      {
        type: "user_input",
        content: [
          {
            type: "text",
            text: PREVIEW_TEXT,
          },
        ],
      },
    ],
    response_format: {
      type: "audio",
      mime_type: "audio/wav",
    },
    generation_config: {
      speech_config: [
        {
          voice,
        },
      ],
    },
  });

  if (!interaction?.output_audio?.data) {
    throw new Error(`Gemini returned no audio data for ${voice}.`);
  }

  const outputPath = path.join(OUTPUT_DIR, voiceToFilename(voice));

  const audioBuffer = Buffer.from(interaction.output_audio.data, "base64");

  fs.writeFileSync(outputPath, audioBuffer);

  console.log(`✅ Saved: ${outputPath}`);
};

const main = async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from your .env file.");
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("========================================");
  console.log(" Vocalis Voice Preview Generator");
  console.log("========================================");
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Voices: ${PREBUILT_VOICES.length}`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const voiceItem of PREBUILT_VOICES) {
    const voice = voiceItem.value;
    const filename = voiceToFilename(voice);
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Never overwrite an existing preview.
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${voice} — ${filename} already exists.`);
      skipped += 1;
      continue;
    }

    try {
      await generatePreview(voice);

      generated += 1;

      // Small delay between requests.
      await sleep(1500);
    } catch (error) {
      failed += 1;

      const message =
        error?.error?.message || error?.message || "Unknown Gemini error";

      console.error(`❌ Failed for ${voice}: ${message}`);

      // Stop if Gemini quota/rate limit has been reached.
      const status =
        error?.status || error?.statusCode || error?.httpMeta?.response?.status;

      if (status === 429 || /quota|rate limit|per day|daily/i.test(message)) {
        console.error("\n🛑 Gemini quota/rate limit reached.");
        console.error(
          "Existing previews were preserved. Run this script again after the quota resets.",
        );
        break;
      }

      // Continue with the next voice for non-quota errors.
      await sleep(1500);
    }
  }

  console.log("\n========================================");
  console.log(" Preview generation finished");
  console.log("========================================");
  console.log(`Generated: ${generated}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`Failed:    ${failed}`);
};

main().catch((error) => {
  console.error("\n❌ Preview generator failed:");
  console.error(error?.message || error);
  process.exit(1);
});
