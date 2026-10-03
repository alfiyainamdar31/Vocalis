// client/src/pages/Login.jsx

import React, { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { AudioLines, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { login, verifyEmailOtp, verify2FALogin } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  /*
  |--------------------------------------------------------------------------
  | Login state
  |--------------------------------------------------------------------------
  */

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Email verification state
  |--------------------------------------------------------------------------
  */

  const [requiresVerification, setRequiresVerification] = useState(false);

  const [emailPartialToken, setEmailPartialToken] = useState("");

  const [otp, setOtp] = useState("");

  /*
  |--------------------------------------------------------------------------
  | 2FA login state
  |--------------------------------------------------------------------------
  */

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const [twoFactorPartialToken, setTwoFactorPartialToken] = useState("");

  const [twoFactorCode, setTwoFactorCode] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Normal login
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const result = await login({
        email,
        password,
      });

      if (result.requiresEmailVerification) {
        setRequiresVerification(true);

        setEmailPartialToken(result.partialToken);

        return;
      }

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);

        setTwoFactorPartialToken(result.partialToken);

        return;
      }

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Email OTP
  |--------------------------------------------------------------------------
  */

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const result = await verifyEmailOtp({
        partialToken: emailPartialToken,
        otp,
      });

      if (result?.requiresTwoFactor) {
        setRequiresVerification(false);

        setRequiresTwoFactor(true);

        setTwoFactorPartialToken(result.partialToken);

        setOtp("");

        return;
      }

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 2FA login
  |--------------------------------------------------------------------------
  */

  const handleVerify2FA = async (e) => {
    e.preventDefault();

    if (twoFactorCode.length !== 6) {
      setError("Enter the 6-digit authenticator code.");

      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await verify2FALogin({
        partialToken: twoFactorPartialToken,
        token: twoFactorCode,
      });

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Invalid authenticator code.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Email verification screen
  |--------------------------------------------------------------------------
  */

  if (requiresVerification) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Verify your email
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              We sent a 6-digit code to <strong>{email}</strong>.
            </p>
          </div>

          <form onSubmit={handleVerifyEmailOtp} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email-otp"
                className="block text-sm font-medium text-slate-700"
              >
                Verification Code
              </label>

              <input
                id="email-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={otp.length !== 6 || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | 2FA screen
  |--------------------------------------------------------------------------
  */

  if (requiresTwoFactor) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Two-factor authentication
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open your authenticator app and enter the 6-digit code for your
              Vocalis account.
            </p>
          </div>

          <form onSubmit={handleVerify2FA} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="two-factor-code"
                className="block text-sm font-medium text-slate-700"
              >
                Authenticator Code
              </label>

              <input
                id="two-factor-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                placeholder="000000"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && <ErrorBox message={error} />}

            <button
              type="submit"
              disabled={twoFactorCode.length !== 6 || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify and Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            The code changes automatically every few seconds. Make sure your
            phone's date and time are set automatically.
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normal login screen
  |--------------------------------------------------------------------------
  */

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-16 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <AudioLines className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue to Vocalis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />

      <span>{message}</span>
    </div>
  );
}
