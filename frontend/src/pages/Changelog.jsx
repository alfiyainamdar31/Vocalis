import React from "react";
import { Sparkles, Rocket, CheckCircle2, Clock } from "lucide-react";

const RELEASES = [
  {
    version: "v0.1.0",
    label: "Initial Release",
    date: "October 2026",
    current: true,
    sections: [
      {
        title: "Text-to-Speech",
        items: [
          "Convert text into natural-sounding speech.",
          "Support for English, Hindi, Marathi, and Urdu.",
          "Adjustable speech speed from 0.5× to 2×.",
          "Multiple voice options with voice descriptions.",
        ],
      },
      {
        title: "Voice Library",
        items: [
          "Curated voice collection.",
          "Extended voice library.",
          "Search voices by name, style, or accent.",
          "Filter voices by gender, type, pitch, and accent.",
          "Voice preview support where audio previews are available.",
        ],
      },
      {
        title: "Audio",
        items: [
          "In-browser audio playback.",
          "Playback progress controls.",
          "Mute and unmute controls.",
          "Download generated audio.",
          "Automatic scrolling to newly generated audio.",
        ],
      },
      {
        title: "Authentication",
        items: [
          "User account creation and login.",
          "Email verification with one-time verification codes.",
          "Protected user sessions.",
          "Two-factor authentication with authenticator apps.",
          "Secure password handling.",
        ],
      },
      {
        title: "Experience",
        items: [
          "Responsive interface for desktop and mobile.",
          "Clear generation and error states.",
          "Loading states for voices and generation.",
          "Character counter with a 5,000-character limit.",
        ],
      },
    ],
  },
];

const UPCOMING = [
  {
    version: "v0.2.0",
    label: "Usage & Credits",
    items: [
      "Usage tracking and limits.",
      "Per-user generation history.",
      "Credit-based usage system.",
      "Usage information in the user account.",
    ],
  },
  {
    version: "v0.3.0",
    label: "Payments",
    items: [
      "Plans and subscriptions.",
      "Credit top-ups.",
      "Pro account features.",
      "Payment and subscription management.",
    ],
  },
  {
    version: "v0.4.0",
    label: "Voice & Audio",
    items: [
      "Expanded voice preview library.",
      "Additional languages.",
      "Improved audio generation experience.",
      "Further voice and playback improvements.",
    ],
  },
  {
    version: "v0.5.0",
    label: "Product Experience",
    items: [
      "Saved projects and generated audio.",
      "Improved generation history.",
      "Additional personalization features.",
      "Further interface and workflow improvements.",
    ],
  },
];

function Changelog() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 sm:text-sm">
          Changelog
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          What's new in Vocalis.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
          Every improvement, feature, and fix — tracked release by release.
        </p>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 sm:text-sm">
              Shipped
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Released versions
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base">
              Features that are live in the product right now.
            </p>
          </div>

          <div className="mt-10 space-y-8 sm:mt-12 sm:space-y-10">
            {RELEASES.map((release) => (
              <article
                key={release.version}
                className={`rounded-2xl border p-5 shadow-sm sm:p-8 ${
                  release.current
                    ? "border-indigo-100 bg-indigo-50/40"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <header className="border-b border-slate-200 pb-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        {release.version}
                      </h3>

                      <span className="text-sm font-medium text-slate-600">
                        {release.label}
                      </span>

                      {release.current && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 sm:text-[11px]">
                          <CheckCircle2
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          Current
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400 sm:ml-auto">
                      {release.date}
                    </span>
                  </div>
                </header>

                <div className="mt-6 space-y-7 sm:mt-7">
                  {release.sections.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 sm:text-sm">
                        {section.title}
                      </h4>

                      <ul className="mt-3.5 space-y-3 sm:mt-4">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                          >
                            <span
                              className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 sm:text-sm">
              Roadmap
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Coming next
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base">
              Vocalis is actively growing. Here's what we're working on — in
              rough order of priority.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
            {UPCOMING.map((item, index) => (
              <article
                key={item.version}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    {index === 0 ? (
                      <Rocket className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                        {item.version}
                      </h3>

                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {item.items.map((entry) => (
                    <li
                      key={entry}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span
                        className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300"
                        aria-hidden="true"
                      />
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-slate-400 sm:mt-10">
            Roadmap items are subject to change. Priorities may shift as the
            product evolves.
          </p>
        </div>
      </section>

      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Sparkles
            className="mx-auto h-8 w-8 text-indigo-400"
            aria-hidden="true"
          />

          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Built in the open. Shipped often.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-300 sm:mt-5 sm:text-base sm:leading-7">
            This changelog is updated with every release. Check back to see
            what's new.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Changelog;
