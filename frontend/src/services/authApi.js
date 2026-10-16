const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

const TOKEN_KEY = "vocalis_auth_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.code = data.code;
    error.status = response.status;
    throw error;
  }

  return data;
};

export const signupApi = ({ name, email, password }) =>
  request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const resendSignupOtpApi = ({ partialToken }) =>
  request("/api/auth/signup/resend-otp", {
    method: "POST",
    body: JSON.stringify({ partialToken }),
  });

export const verifyEmailOtpApi = ({ partialToken, otp }) =>
  request("/api/auth/signup/verify-otp", {
    method: "POST",
    body: JSON.stringify({ partialToken, otp }),
  });

export const loginApi = ({ email, password }) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const resendLoginOtpApi = ({ partialToken }) =>
  request("/api/auth/login/resend-otp", {
    method: "POST",
    body: JSON.stringify({ partialToken }),
  });

export const verifyLoginOtpApi = ({ partialToken, otp }) =>
  request("/api/auth/login/verify-otp", {
    method: "POST",
    body: JSON.stringify({ partialToken, otp }),
  });

export const verify2FALoginApi = ({ partialToken, otp }) =>
  request("/api/auth/login/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ partialToken, otp }),
  });

export const meApi = () => request("/api/auth/me");

export const logoutApi = () => request("/api/auth/logout", { method: "POST" });

export const generate2FASetupApi = () =>
  request("/api/auth/2fa/setup", { method: "POST" });

export const verify2FASetupApi = ({ otp }) =>
  request("/api/auth/2fa/verify-setup", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });

export const disable2FAApi = ({ otp }) =>
  request("/api/auth/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
