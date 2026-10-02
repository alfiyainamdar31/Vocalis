const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

export class ApiError extends Error {
  constructor(message, { status, code, retryAfterMs } = {}) {
    super(message);

    this.name = "ApiError";
    this.status = status ?? null;
    this.code = code || "unknown_error";
    this.retryAfterMs = retryAfterMs || null;
  }
}

async function parseErrorResponse(res) {
  let body = {};

  try {
    body = await res.json();
  } catch {
    // Server may return a non-JSON response.
  }

  return new ApiError(body.message || `Request failed (${res.status})`, {
    status: res.status,
    code: body.code || "unknown_error",
    retryAfterMs: body.retryAfterMs || null,
  });
}

export async function fetchVoices({ extended = false, language } = {}) {
  const params = new URLSearchParams();

  if (extended) {
    params.set("extended", "true");
  }

  if (language) {
    params.set("language", language);
  }

  const query = params.toString();

  const url = `${API_BASE}/tts/voices${query ? `?${query}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json();
}

export async function generateTTS({ text, voice, language, speed }) {
  const res = await fetch(`${API_BASE}/tts/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      language,
      speed,
    }),
  });

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json();
}
