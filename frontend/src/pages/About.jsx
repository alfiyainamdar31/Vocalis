import React from "react";
import { AudioLines, Sparkles, Users, Rocket } from "lucide-react";

function About() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          <AudioLines className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Give your words a voice.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Vocalis is a text-to-speech platform designed to help you turn written
          content into natural-sounding speech quickly and easily.
        </p>
      </section>

      {/* Mission */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Our mission
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                Make voice creation simple.
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                Creating voice content shouldn't require complicated software or
                expensive equipment. Vocalis is being built to make high-quality
                voice generation accessible to creators, students, businesses,
                developers, and anyone who wants to bring their written ideas to
                life.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Write your content, choose a voice, generate your audio, and
                keep creating.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <AudioLines className="h-10 w-10 text-indigo-600" />

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                From text to voice
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Our goal is to remove unnecessary complexity from the
                text-to-speech workflow and provide a clean experience that lets
                you focus on your content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we are building */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              What we're building
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Built around creators
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Vocalis is being developed with a focus on simplicity,
              accessibility, and useful tools for modern content creation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Sparkles className="h-7 w-7 text-indigo-600" />

              <h3 className="mt-5 font-semibold text-slate-900">Simple</h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                A clean interface that keeps the voice-generation process
                straightforward.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Users className="h-7 w-7 text-indigo-600" />

              <h3 className="mt-5 font-semibold text-slate-900">
                For everyone
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Designed for creators, students, businesses, developers, and
                everyday users.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <Rocket className="h-7 w-7 text-indigo-600" />

              <h3 className="mt-5 font-semibold text-slate-900">
                Always improving
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Vocalis will continue evolving with new voices, features, and
                improvements based on user needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">
            Your words deserve to be heard.
          </h2>

          <p className="mt-5 leading-7 text-slate-300">
            Whether you're creating videos, podcasts, educational content,
            presentations, or simply experimenting with voice technology,
            Vocalis is here to help turn your text into audio.
          </p>
        </div>
      </section>
    </main>
  );
}

export default About;
