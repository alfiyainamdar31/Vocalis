import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
            {getUserInitial()}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {user?.name || "User"}
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
            <User className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Name
              </p>
              <p className="text-sm font-medium text-slate-900">
                {user?.name || "Not set"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
            <Mail className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="text-sm font-medium text-slate-900">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
            <Shield className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Two-Factor Authentication
              </p>
              <p className="text-sm font-medium text-slate-900">
                {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
