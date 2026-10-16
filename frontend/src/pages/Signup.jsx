import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AudioLines,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export default function Signup() {
  const { signup, verifyEmailOtp, resendSignupOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [requiresVerification, setRequiresVerification] = useState(false);
  const [partialToken, setPartialToken] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const timerRef = useRef(null);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    if (requiresVerification) {
      setResendTimer(60);
      setCanResend(false);

      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [requiresVerification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Please enter a valid name (at least 2 characters).");
      return;
    }

    setSubmitting(true);

    try {
      const result = await signup({ name, email, password });

      if (result.requiresEmailVerification) {
        setRequiresVerification(true);
        setPartialToken(result.partialToken);
        setSuccessMessage("Verification code sent to your email.");
      }
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setSubmitting(true);

    try {
      await verifyEmailOtp({ partialToken, otp });

      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await resendSignupOtp({ partialToken });
      setSuccessMessage("New verification code sent to your email.");
      setResendTimer(60);
      setCanResend(false);

      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to resend code.");
    } finally {
      setSubmitting(false);
    }
  };

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
              Your account will be created after you enter the correct code.
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
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-mono tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && <ErrorBox message={error} />}
            {successMessage && <SuccessBox message={successMessage} />}

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

          <div className="mt-5 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || submitting}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {canResend
                ? "Resend verification code"
                : `Resend code in ${resendTimer}s`}
            </button>

            <button
              type="button"
              onClick={() => {
                setRequiresVerification(false);
                setPartialToken("");
                setOtp("");
                setError("");
                setSuccessMessage("");
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to signup
            </button>
          </div>
        </div>
      </main>
    );
  }

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
                if (error) setError("");
              }}
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

          {error && <ErrorBox message={error} />}
          {successMessage && <SuccessBox message={successMessage} />}

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

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SuccessBox({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
