const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

const TOKEN_KEY = "vocalis.auth.token";

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const parseError = async (res) => {
  let body = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  return new ApiError(body.message || `Request failed (${res.status})`, {
    status: res.status,
    code: body.code || "unknown_error",
  });
};

const authFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) throw await parseError(res);
  return res.json();
};

export const signupApi = ({ name, email, password }) =>
  authFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const loginApi = ({ email, password }) =>
  authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const meApi = () => authFetch("/auth/me");

export const logoutApi = () => authFetch("/auth/logout", { method: "POST" });
