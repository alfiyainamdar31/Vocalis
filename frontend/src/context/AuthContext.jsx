// client/src/context/AuthContext.jsx

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

  /*
   * Restore authenticated session
   */

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setInitializing(false);
        }

        return;
      }

      try {
        const data = await meApi();

        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        clearToken();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Signup
   |--------------------------------------------------------------------------
   */

  const signup = useCallback(async ({ name, email, password }) => {
    const data = await signupApi({
      name,
      email,
      password,
    });

    /*
     * User is NOT authenticated yet.
     *
     * They must verify the email OTP.
     */

    if (data.requiresEmailVerification) {
      return {
        requiresEmailVerification: true,

        partialToken: data.partialToken,
      };
    }

    /*
     * This should normally not happen
     * with the current signup flow,
     * but keep this fallback.
     */

    if (data.token) {
      setToken(data.token);
    }

    if (data.user) {
      setUser(data.user);
    }

    return {
      user: data.user,
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Login
   |--------------------------------------------------------------------------
   */

  const login = useCallback(async ({ email, password }) => {
    const data = await loginApi({
      email,
      password,
    });

    /*
     * 2FA required
     */

    if (data.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,

        partialToken: data.partialToken,
      };
    }

    /*
     * Normal login
     */

    if (data.token) {
      setToken(data.token);
    }

    if (data.user) {
      setUser(data.user);
    }

    return {
      user: data.user,
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Verify signup email OTP
   |--------------------------------------------------------------------------
   */

  const verifyEmailOtp = useCallback(async ({ partialToken, otp }) => {
    const data = await verifyEmailOtpApi({
      partialToken,
      otp,
    });

    /*
     * The account is now actually
     * created and authenticated.
     */

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Verify 2FA login
   |--------------------------------------------------------------------------
   */

  const verify2FALogin = useCallback(async ({ partialToken, otp }) => {
    const data = await verify2FALoginApi({
      partialToken,
      otp,
    });

    /*
     * Only now do we store the
     * full access token.
     */

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Generate 2FA setup
   |--------------------------------------------------------------------------
   */

  const generate2FASetup = useCallback(async () => {
    return generate2FASetupApi();
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Verify 2FA setup
   |--------------------------------------------------------------------------
   */

  const verify2FASetup = useCallback(async ({ otp }) => {
    const data = await verify2FASetupApi({
      otp,
    });

    setUser(data.user);

    return data.user;
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Disable 2FA
   |--------------------------------------------------------------------------
   */

  const disable2FA = useCallback(async ({ otp }) => {
    const data = await disable2FAApi({
      otp,
    });

    setUser(data.user);

    return data.user;
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Logout
   |--------------------------------------------------------------------------
   */

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Even if the server request fails,
      // remove the local session.
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
      login,

      verifyEmailOtp,
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
      login,

      verifyEmailOtp,
      verify2FALogin,

      generate2FASetup,
      verify2FASetup,
      disable2FA,

      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
