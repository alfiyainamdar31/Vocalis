// client/src/pages/TwoFactorSettings.jsx

import React, { useState } from "react";

import {
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth.js";

export default function TwoFactorSettings() {
  const { user, generate2FASetup, verify2FASetup, disable2FA } = useAuth();

  const [setup, setSetup] = useState(null);

  const [code, setCode] = useState("");

  const [disableCode, setDisableCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [disableLoading, setDisableLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const isEnabled = Boolean(user?.twoFactorEnabled);

  /*
  |--------------------------------------------------------------------------
  | Start setup
  |--------------------------------------------------------------------------
  */

  const startSetup = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await generate2FASetup();

      setSetup({
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
        qrCodeDataUrl: data.qrCodeDataUrl,
      });

      setCode("");
    } catch (err) {
      setError(err.message || "Unable to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Verify setup
  |--------------------------------------------------------------------------
  */

  const verifySetup = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Enter the 6-digit authenticator code.");

      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verify2FASetup({
        token: code,
      });

      setSetup(null);
      setCode("");

      setSuccess("Two-factor authentication is now enabled.");
    } catch (err) {
      setError(err.message || "Unable to verify authenticator code.");
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Disable
  |--------------------------------------------------------------------------
  */

  const disable = async (e) => {
    e.preventDefault();

    if (disableCode.length !== 6) {
      setError("Enter your current 6-digit authenticator code.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to disable two-factor authentication?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDisableLoading(true);

    try {
      await disable2FA({
        token: disableCode,
      });

      setDisableCode("");

      setSuccess("Two-factor authentication has been disabled.");
    } catch (err) {
      setError(err.message || "Unable to disable two-factor authentication.");
    } finally {
      setDisableLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Copy secret
  |--------------------------------------------------------------------------
  */

  const copySecret = async () => {
    if (!setup?.secret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(setup.secret);

      setSuccess("Secret key copied to clipboard.");

      setError("");
    } catch {
      setError("Unable to copy the secret key.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Code input
  |--------------------------------------------------------------------------
  */

  const handleCodeChange = (setter, value) => {
    setter(value.replace(/\D/g, "").slice(0, 6));
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">Security</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Two-factor authentication
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Add an authenticator app as an additional layer of protection for
            your Vocalis account.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isEnabled
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isEnabled ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <ShieldOff className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Authenticator app
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {isEnabled
                      ? "Your account is protected with two-factor authentication."
                      : "Use an authenticator app to generate secure login codes."}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  isEnabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isEnabled ? "Enabled" : "Not enabled"}
              </span>
            </div>
          </div>

          {/* Before setup */}
          {!isEnabled && !setup && (
            <div className="p-6 sm:p-8">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex gap-3">
                  <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                  <div>
                    <h3 className="font-medium text-slate-900">
                      Before you begin
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Install an authenticator app such as Google Authenticator,
                      Microsoft Authenticator, or Authy on your phone.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startSetup}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing setup…
                  </>
                ) : (
                  "Set up authenticator"
                )}
              </button>
            </div>
          )}

          {/* Setup */}
          {!isEnabled && setup && (
            <div className="p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* QR */}
                <div>
                  <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
                    {setup.qrCodeDataUrl ? (
                      <img
                        src={setup.qrCodeDataUrl}
                        alt="Scan this QR code with your authenticator app"
                        className="h-56 w-56"
                      />
                    ) : (
                      <div className="text-sm text-slate-500">
                        QR code unavailable.
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    Scan this QR code using your authenticator app.
                  </p>
                </div>

                {/* Verification */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Complete setup
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    After scanning the QR code, enter the 6-digit code displayed
                    by your authenticator app.
                  </p>

                  <form onSubmit={verifySetup} className="mt-5">
                    <label
                      htmlFor="setup-code"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Authenticator code
                    </label>

                    <input
                      id="setup-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      value={code}
                      onChange={(e) =>
                        handleCodeChange(setCode, e.target.value)
                      }
                      placeholder="000000"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="submit"
                      disabled={code.length !== 6 || loading}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        "Enable 2FA"
                      )}
                    </button>
                  </form>

                  {/* Manual secret */}
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-700">
                      Can't scan the QR code?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enter this setup key manually in your authenticator app.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs text-slate-600">
                        {setup.secret}
                      </code>

                      <button
                        type="button"
                        onClick={copySecret}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        title="Copy secret"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSetup(null);
                  setCode("");
                  setError("");
                }}
                className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel setup
              </button>
            </div>
          )}

          {/* Enabled */}
          {isEnabled && (
            <div className="p-6 sm:p-8">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <h3 className="font-semibold text-amber-900">
                      2FA is active
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Your authenticator code will be required every time you
                      sign in.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={disable} className="mt-8 max-w-md">
                <h3 className="text-base font-semibold text-slate-900">
                  Disable two-factor authentication
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Enter your current authenticator code to disable 2FA.
                </p>

                <label
                  htmlFor="disable-code"
                  className="mt-5 block text-sm font-medium text-slate-700"
                >
                  Current authenticator code
                </label>

                <input
                  id="disable-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) =>
                    handleCodeChange(setDisableCode, e.target.value)
                  }
                  placeholder="000000"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

                <button
                  type="submit"
                  disabled={disableCode.length !== 6 || disableLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {disableLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Disabling…
                    </>
                  ) : (
                    "Disable 2FA"
                  )}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
