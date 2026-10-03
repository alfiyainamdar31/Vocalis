// client/src/services/authApi.js

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

const TOKEN_KEY = "vocalis.auth.token";

/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/*
|--------------------------------------------------------------------------
| Token helpers
|--------------------------------------------------------------------------
*/

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/*
|--------------------------------------------------------------------------
| Error parser
|--------------------------------------------------------------------------
*/

const parseError = async (res) => {
  let body = {};

  try {
    body = await res.json();
  } catch {}

  return new ApiError(body.message || `Request failed (${res.status})`, {
    status: res.status,
    code: body.code || "unknown_error",
  });
};

/*
|--------------------------------------------------------------------------
| Authenticated fetch
|--------------------------------------------------------------------------
*/

const authFetch = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",

    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
};

/*
|--------------------------------------------------------------------------
| Signup
|--------------------------------------------------------------------------
*/

export const signupApi = ({ name, email, password }) => {
  return authFetch("/auth/signup", {
    method: "POST",

    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const loginApi = ({ email, password }) => {
  return authFetch("/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
};

/*
|--------------------------------------------------------------------------
| Signup email OTP
|--------------------------------------------------------------------------
*/

export const verifyEmailOtpApi = ({ partialToken, otp }) => {
  return authFetch("/auth/verify-email-otp", {
    method: "POST",

    body: JSON.stringify({
      partialToken,
      otp,
    }),
  });
};

/*
|--------------------------------------------------------------------------
| 2FA login
|--------------------------------------------------------------------------
*/

export const verify2FALoginApi = ({ partialToken, otp }) => {
  return authFetch("/auth/verify-2fa-login", {
    method: "POST",

    body: JSON.stringify({
      partialToken,
      otp,
    }),
  });
};

/*
|--------------------------------------------------------------------------
| Current user
|--------------------------------------------------------------------------
*/

export const meApi = () => {
  return authFetch("/auth/me");
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logoutApi = () => {
  return authFetch("/auth/logout", {
    method: "POST",
  });
};

/*
|--------------------------------------------------------------------------
| 2FA setup
|--------------------------------------------------------------------------
*/

export const generate2FASetupApi = () => {
  return authFetch("/auth/2fa/setup", {
    method: "POST",
  });
};

/*
|--------------------------------------------------------------------------
| Verify 2FA setup
|--------------------------------------------------------------------------
*/

export const verify2FASetupApi = ({ otp }) => {
  return authFetch("/auth/2fa/verify-setup", {
    method: "POST",

    body: JSON.stringify({
      otp,
    }),
  });
};

/*
|--------------------------------------------------------------------------
| Disable 2FA
|--------------------------------------------------------------------------
*/

export const disable2FAApi = ({ otp }) => {
  return authFetch("/auth/2fa/disable", {
    method: "POST",

    body: JSON.stringify({
      otp,
    }),
  });
};
