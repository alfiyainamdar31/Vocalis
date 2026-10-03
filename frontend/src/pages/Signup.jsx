// client/src/pages/Signup.jsx

import React, { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  AudioLines,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { signup, verifyEmailOtp } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  /*
   * Signup form
   */

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /*
   * Email verification
   */

  const [requiresVerification, setRequiresVerification] = useState(false);

  const [partialToken, setPartialToken] = useState("");

  const [otp, setOtp] = useState("");

  /*
   * Frontend email validation
   *
   * Backend ALSO validates this.
   */

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  /*
   |--------------------------------------------------------------------------
   | Submit signup
   |--------------------------------------------------------------------------
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
     * Validate email before
     * sending request.
     */

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");

      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");

      return;
    }

    setSubmitting(true);

    try {
      const result = await signup({
        name,
        email,
        password,
      });

      /*
       * Signup successful but
       * account is not created yet.
       */

      if (result.requiresEmailVerification) {
        setRequiresVerification(true);

        setPartialToken(result.partialToken);
      }
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
   |--------------------------------------------------------------------------
   | Verify OTP
   |--------------------------------------------------------------------------
   */

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");

      return;
    }

    setSubmitting(true);

    try {
      await verifyEmailOtp({
        partialToken,
        otp,
      });

      /*
       * Account has now been created
       * in MongoDB.
       */

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
   | Verification screen
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
              We sent a 6-digit verification code to <strong>{email}</strong>
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Your account will be created only after you enter the correct
              code.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="signup-otp"
                className="block text-sm font-medium text-slate-700"
              >
                Verification Code
              </label>

              <input
                id="signup-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />

                <span>{error}</span>
              </div>
            )}

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
                "Verify Email & Create Account"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setRequiresVerification(false);
              setPartialToken("");
              setOtp("");
              setError("");
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to signup
          </button>
        </div>
      </main>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Signup form
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
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-600">Start using Vocalis.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Name */}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Email */}

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
              onChange={(e) => {
                setEmail(e.target.value);

                /*
                 * Clear an old email
                 * error while typing.
                 */

                if (error) {
                  setError("");
                }
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Password */}

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Minimum 8 characters.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending verification code…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
