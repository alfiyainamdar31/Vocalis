import React from "react";
import { Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

function Contact() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Contact Vocalis
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          We'd love to hear from you.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Have a question, found a problem, or have an idea that could make
          Vocalis better? Get in touch with us.
        </p>
      </section>

      {/* Contact options */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <Mail className="h-7 w-7 text-indigo-600" />

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                General questions
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Have a question about Vocalis or how the platform works?
              </p>

              <a
                href="mailto:hello@vocalis.com"
                className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                hello@vocalis.com
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <Bug className="h-7 w-7 text-indigo-600" />

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Report a problem
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Found a bug or something that isn't working as expected? Let us
                know so we can investigate it.
              </p>

              <a
                href="mailto:support@vocalis.com"
                className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                support@vocalis.com
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <Lightbulb className="h-7 w-7 text-indigo-600" />

              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Feature ideas
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Have an idea for a voice, feature, or improvement? We'd love to
                hear your suggestions.
              </p>

              <a
                href="mailto:feedback@vocalis.com"
                className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                feedback@vocalis.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-indigo-600" />

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Send us a message
            </h2>

            <p className="mt-3 text-slate-600">Tell us how we can help.</p>
          </div>

          <form className="mt-10 space-y-6">
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
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-slate-700"
              >
                Message
              </label>

              <textarea
                id="message"
                rows="6"
                placeholder="How can we help?"
                className="mt-2 w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Send Message
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            The contact form will be connected to our support system soon.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Contact;
