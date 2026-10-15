import React from "react";
import { Link } from "react-router-dom";
import { User, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

export default function Settings() {
  const { user } = useAuth();

  const sections = [
    {
      to: "/profile",
      icon: User,
      title: "Profile",
      description: "Manage your name, email, and account details.",
    },
    {
      to: "/settings/security",
      icon: Shield,
      title: "Security",
      description: "Two-factor authentication and account protection.",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.to}
                to={section.to}
                className={`flex items-center gap-4 px-6 py-5 transition hover:bg-slate-50 ${
                  index !== 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {section.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {section.description}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
