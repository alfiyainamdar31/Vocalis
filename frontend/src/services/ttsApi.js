import { getToken } from "./authApi.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

export class ApiError extends Error {
  constructor(message, { status, code, retryAfterMs } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs || null;
  }
}

async function parseErrorResponse(res) {
  let body = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  return new ApiError(body.message || `Request failed (${res.status})`, {
    status: res.status,
    code: body.code || "unknown_error",
    retryAfterMs: body.retryAfterMs || null,
  });
}

export async function fetchVoices({ extended = false, language } = {}) {
  const params = new URLSearchParams();
  if (extended) params.set("extended", "true");
  if (language) params.set("language", language);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/tts/voices${query ? `?${query}` : ""}`);
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}

export async function generateTTS({ text, voice, language, speed }) {
  const token = getToken();

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/tts/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, voice, language, speed }),
  });

  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}
