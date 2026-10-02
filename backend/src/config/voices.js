/**
 * Gemini 3.8 TTS prebuilt studio voices.
 * Source: Gemini TTS documentation — "Prebuilt voices" table.
 * Single source of truth for the app. Frontend fetches this via API.
 */
const PREBUILT_VOICES = [
  { value: "Zephyr", label: "Zephyr", description: "Bright" },
  { value: "Puck", label: "Puck", description: "Upbeat" },
  { value: "Charon", label: "Charon", description: "Informative" },
  { value: "Kore", label: "Kore", description: "Firm" },
  { value: "Fenrir", label: "Fenrir", description: "Excitable" },
  { value: "Leda", label: "Leda", description: "Youthful" },
  { value: "Orus", label: "Orus", description: "Firm" },
  { value: "Aoede", label: "Aoede", description: "Breezy" },
  { value: "Callirrhoe", label: "Callirrhoe", description: "Easy-going" },
  { value: "Autonoe", label: "Autonoe", description: "Bright" },
  { value: "Enceladus", label: "Enceladus", description: "Breathy" },
  { value: "Iapetus", label: "Iapetus", description: "Clear" },
  { value: "Umbriel", label: "Umbriel", description: "Easy-going" },
  { value: "Algieba", label: "Algieba", description: "Smooth" },
  { value: "Despina", label: "Despina", description: "Smooth" },
  { value: "Erinome", label: "Erinome", description: "Clear" },
  { value: "Algenib", label: "Algenib", description: "Gravelly" },
  { value: "Rasalgethi", label: "Rasalgethi", description: "Informative" },
  { value: "Laomedeia", label: "Laomedeia", description: "Upbeat" },
  { value: "Achernar", label: "Achernar", description: "Soft" },
  { value: "Alnilam", label: "Alnilam", description: "Firm" },
  { value: "Schedar", label: "Schedar", description: "Even" },
  { value: "Gacrux", label: "Gacrux", description: "Mature" },
  { value: "Pulcherrima", label: "Pulcherrima", description: "Forward" },
  { value: "Achird", label: "Achird", description: "Friendly" },
  { value: "Zubenelgenubi", label: "Zubenelgenubi", description: "Casual" },
  { value: "Vindemiatrix", label: "Vindemiatrix", description: "Gentle" },
  { value: "Sadachbia", label: "Sadachbia", description: "Lively" },
  { value: "Sadaltager", label: "Sadaltager", description: "Knowledgeable" },
  { value: "Sulafat", label: "Sulafat", description: "Warm" },
];

const DEFAULT_VOICE = "Kore";

const SPEED_INSTRUCTIONS = {
  0.5: "speaking very slowly and clearly",
  0.75: "speaking slowly and clearly",
  1: "", // normal pace → no instruction injected
  1.25: "speaking slightly faster than normal",
  1.5: "speaking faster than normal",
  2: "speaking very rapidly",
};

const DEFAULT_SPEED = 1;

const normalizeSpeed = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_SPEED;
  return SPEED_INSTRUCTIONS[n] !== undefined ? n : DEFAULT_SPEED;
};

module.exports = {
  PREBUILT_VOICES,
  DEFAULT_VOICE,
  SPEED_INSTRUCTIONS,
  DEFAULT_SPEED,
  normalizeSpeed,
};
