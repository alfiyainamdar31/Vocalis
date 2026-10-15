import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  signupApi,
  loginApi,
  meApi,
  logoutApi,
  verifyEmailOtpApi,
  resendSignupOtpApi,
  resendLoginOtpApi,
  verifyLoginOtpApi,
  verify2FALoginApi,
  generate2FASetupApi,
  verify2FASetupApi,
  disable2FAApi,
  getToken,
  setToken,
  clearToken,
} from "../services/authApi.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) setInitializing(false);
        return;
      }

      try {
        const data = await meApi();
        if (!cancelled) setUser(data.user);
      } catch {
        clearToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    return signupApi({ name, email, password });
  }, []);

  const resendSignupOtp = useCallback(async ({ partialToken }) => {
    return resendSignupOtpApi({ partialToken });
  }, []);

  const verifyEmailOtp = useCallback(async ({ partialToken, otp }) => {
    const data = await verifyEmailOtpApi({ partialToken, otp });
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    return loginApi({ email, password });
  }, []);

  const resendLoginOtp = useCallback(async ({ partialToken }) => {
    return resendLoginOtpApi({ partialToken });
  }, []);

  const verifyLoginOtp = useCallback(async ({ partialToken, otp }) => {
    const data = await verifyLoginOtpApi({ partialToken, otp });

    if (data.requiresTwoFactor) {
      return data;
    }

    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const verify2FALogin = useCallback(async ({ partialToken, otp }) => {
    const data = await verify2FALoginApi({ partialToken, otp });
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const generate2FASetup = useCallback(async () => {
    return generate2FASetupApi();
  }, []);

  const verify2FASetup = useCallback(async ({ otp }) => {
    const data = await verify2FASetupApi({ otp });
    setUser(data.user);
    return data.user;
  }, []);

  const disable2FA = useCallback(async ({ otp }) => {
    const data = await disable2FAApi({ otp });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore errors on logout
    }
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      signup,
      resendSignupOtp,
      verifyEmailOtp,
      login,
      resendLoginOtp,
      verifyLoginOtp,
      verify2FALogin,
      generate2FASetup,
      verify2FASetup,
      disable2FA,
      logout,
    }),
    [
      user,
      initializing,
      signup,
      resendSignupOtp,
      verifyEmailOtp,
      login,
      resendLoginOtp,
      verifyLoginOtp,
      verify2FALogin,
      generate2FASetup,
      verify2FASetup,
      disable2FA,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
