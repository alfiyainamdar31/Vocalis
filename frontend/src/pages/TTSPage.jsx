import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AudioLines,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  AlertCircle,
  Languages,
  Search,
  User,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";

import { fetchVoices, generateTTS } from "../services/ttsApi.js";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English" },
  { value: "hi-IN", label: "Hindi" },
  { value: "mr-IN", label: "Marathi" },
  { value: "ur-IN", label: "Urdu" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unknown", label: "Unknown" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "curated", label: "Curated" },
  { value: "extended", label: "Extended" },
];

const PITCH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const normalizePitch = (pitch) => {
  if (!pitch) return null;

  const p = String(pitch).toLowerCase();

  if (p.includes("high")) return "high";
  if (p.includes("medium") || p.includes("mid")) return "medium";
  if (p.includes("low")) return "low";

  return null;
};

function TTSPage() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [voices, setVoices] = useState([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState("");

  const [language, setLanguage] = useState("en-US");
  const [speed, setSpeed] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [audioUrl, setAudioUrl] = useState(null);
  const [audioMimeType, setAudioMimeType] = useState("audio/wav");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [previewVoice, setPreviewVoice] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(null);
  const [previewError, setPreviewError] = useState("");

  const [voiceSearch, setVoiceSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pitchFilter, setPitchFilter] = useState("all");
  const [accentFilter, setAccentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const previewAudioRef = useRef(null);
  const audioRef = useRef(null);

  const maxChars = 5000;
  const charCount = text.length;

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

  const PREVIEW_BASE = API_BASE.replace(/\/api\/?$/, "");

  const getPreviewUrl = (previewUrl) => {
    if (!previewUrl) return "";

    if (previewUrl.startsWith("http://") || previewUrl.startsWith("https://")) {
      return previewUrl;
    }

    return `${PREVIEW_BASE}${previewUrl}`;
  };

  const availableAccents = useMemo(() => {
    const set = new Set();

    voices.forEach((v) => {
      if (v.accent && v.accent.trim()) {
        set.add(v.accent.trim());
      }
    });

    return Array.from(set).sort();
  }, [voices]);

  const hasGenderData = useMemo(() => voices.some((v) => v.gender), [voices]);

  const hasPitchData = useMemo(() => voices.some((v) => v.pitch), [voices]);

  const hasAccentData = useMemo(() => voices.some((v) => v.accent), [voices]);

  const filteredVoices = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase();

    return voices.filter((v) => {
      if (q) {
        const matchesSearch =
          v.label?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.value?.toLowerCase().includes(q) ||
          v.accent?.toLowerCase().includes(q);

        if (!matchesSearch) return false;
      }

      if (genderFilter !== "all") {
        const g = (v.gender || "unknown").toLowerCase();

        if (genderFilter === "unknown") {
          if (v.gender) return false;
        } else if (g !== genderFilter) {
          return false;
        }
      }

      if (typeFilter !== "all") {
        if (typeFilter === "curated" && v.extended) return false;
        if (typeFilter === "extended" && !v.extended) return false;
      }

      if (pitchFilter !== "all") {
        const p = normalizePitch(v.pitch);

        if (p !== pitchFilter) return false;
      }

      if (accentFilter !== "all") {
        if ((v.accent || "").trim() !== accentFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    voices,
    voiceSearch,
    genderFilter,
    typeFilter,
    pitchFilter,
    accentFilter,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (genderFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    if (pitchFilter !== "all") count++;
    if (accentFilter !== "all") count++;

    return count;
  }, [genderFilter, typeFilter, pitchFilter, accentFilter]);

  const clearAllFilters = () => {
    setGenderFilter("all");
    setTypeFilter("all");
    setPitchFilter("all");
    setAccentFilter("all");
    setVoiceSearch("");
  };

  useEffect(() => {
    if (!cooldownUntil) return;

    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [cooldownUntil]);

  useEffect(() => {
    if (cooldownUntil && now >= cooldownUntil) {
      setCooldownUntil(0);
    }
  }, [now, cooldownUntil]);

  const inCooldown = cooldownUntil > now;

  const cooldownSeconds = inCooldown
    ? Math.ceil((cooldownUntil - now) / 1000)
    : 0;

  const cooldownMinutes = Math.ceil(cooldownSeconds / 60);

  const canGenerate =
    text.trim().length > 0 &&
    charCount <= maxChars &&
    !isLoading &&
    !voicesLoading &&
    voice !== "" &&
    !inCooldown;

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    let cancelled = false;

    const loadVoices = async () => {
      try {
        setVoicesLoading(true);
        setVoicesError("");

        const data = await fetchVoices({
          extended: true,
          language,
        });

        if (cancelled) return;

        if (!data.success) {
          throw new Error(data.message || "Failed to load voices.");
        }

        const loaded = data.voices || [];

        setVoices(loaded);

        setVoice((previousVoice) => {
          const stillExists = loaded.some(
            (item) => item.value === previousVoice,
          );

          if (stillExists) return previousVoice;

          const defaultExists = loaded.some(
            (item) => item.value === data.defaultVoice,
          );

          if (defaultExists) return data.defaultVoice;

          return loaded[0]?.value || "";
        });

        setAccentFilter("all");
      } catch (err) {
        if (cancelled) return;

        console.error("Voice loading error:", err);

        setVoices([]);
        setVoice("");

        setVoicesError(
          err.message || "Unable to load voices. Please refresh the page.",
        );
      } finally {
        if (!cancelled) {
          setVoicesLoading(false);
        }
      }
    };

    loadVoices();

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secondsPart = Math.floor(seconds % 60);

    return `${minutes}:${secondsPart.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = "";
      }
    };
  }, []);

  const handlePreview = async (voiceItem) => {
    const previewUrl = getPreviewUrl(voiceItem.previewUrl);

    if (!previewUrl) {
      setPreviewError("Preview is not available for this voice.");
      return;
    }

    if (previewVoice === voiceItem.value) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }

      setPreviewVoice(null);
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }

    setPreviewError("");
    setPreviewLoading(voiceItem.value);
    setPreviewVoice(null);

    const audio = new Audio(previewUrl);

    previewAudioRef.current = audio;

    audio.onplay = () => {
      setPreviewLoading(null);
      setPreviewVoice(voiceItem.value);
    };

    audio.onended = () => {
      setPreviewVoice(null);
      previewAudioRef.current = null;
    };

    audio.onerror = () => {
      setPreviewLoading(null);
      setPreviewVoice(null);

      setPreviewError(
        `Preview unavailable for ${voiceItem.label || voiceItem.value}.`,
      );

      previewAudioRef.current = null;
    };

    try {
      await audio.play();
    } catch (err) {
      console.error("Voice preview error:", err);

      setPreviewLoading(null);
      setPreviewVoice(null);

      setPreviewError(
        `Preview unavailable for ${voiceItem.label || voiceItem.value}.`,
      );

      previewAudioRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setCurrentTime(0);
    setDuration(0);

    try {
      const data = await generateTTS({
        text,
        voice,
        language,
        speed,
      });

      if (!data.success || !data.audio) {
        throw new Error(data.message || "Failed to generate audio.");
      }

      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const mimeType = data.mimeType || "audio/wav";

      const blob = new Blob([byteArray], {
        type: mimeType,
      });

      const url = URL.createObjectURL(blob);

      setAudioMimeType(mimeType);
      setAudioUrl(url);
      setError(null);
      setIsMuted(false);
    } catch (err) {
      console.error("TTS generation error:", err);

      if (err.code === "unauthorized" || err.code === "invalid_token") {
        navigate("/login", { state: { from: { pathname: "/" } } });
        return;
      }

      if (err.retryAfterMs) {
        const retryMs = Number(err.retryAfterMs);

        if (Number.isFinite(retryMs) && retryMs > 0) {
          setCooldownUntil(Date.now() + retryMs);
          setNow(Date.now());
        }
      }

      let message = err.message || "Something went wrong. Please try again.";

      if (err.code === "quota_exceeded") {
        message = "Daily generation limit reached.";
      } else if (err.code === "rate_limit_exceeded") {
        message = "Too many requests.";
      } else if (err.code === "invalid_input") {
        message = err.message || "Please check the text you entered.";
      } else if (err.code === "upstream_error") {
        message = "The speech service is temporarily unavailable.";
      }

      setError({
        code: err.code || "unknown_error",
        message,
        retryAfterMs: err.retryAfterMs || null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error("Audio playback error:", err);

      setError({
        code: "audio_playback_error",
        message: "Could not play the generated audio.",
        retryAfterMs: null,
      });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    const nextMuted = !audioRef.current.muted;

    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    let extension = "audio";

    if (audioMimeType.includes("mpeg")) {
      extension = "mp3";
    } else if (audioMimeType.includes("wav")) {
      extension = "wav";
    } else if (audioMimeType.includes("ogg")) {
      extension = "ogg";
    }

    const link = document.createElement("a");

    link.href = audioUrl;
    link.download = `vocalis-${voice}-${language}-${Date.now()}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progress =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const isQuotaError = error?.code === "quota_exceeded";
  const isRateLimitError = error?.code === "rate_limit_exceeded";

  const isTemporaryError = isQuotaError || isRateLimitError;

  const selectedVoiceObj = voices.find((v) => v.value === voice);

  const selectedLanguageObj = LANGUAGE_OPTIONS.find(
    (l) => l.value === language,
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 pb-24 sm:pb-0">
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-10 sm:pt-16 lg:pt-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm sm:h-14 sm:w-14">
          <AudioLines className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:mt-6 sm:text-4xl md:text-5xl">
          Turn text into speech
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
          Paste your text, pick a language and voice, and generate
          natural-sounding audio in seconds.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-3 pb-12 sm:px-6 sm:pb-20">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                <span>Your text</span>
              </div>

              <span
                className={`whitespace-nowrap text-xs ${
                  charCount > maxChars
                    ? "font-medium text-red-500"
                    : "text-slate-500"
                }`}
              >
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste the text you want to convert to speech..."
            rows={8}
            maxLength={maxChars}
            aria-label="Text to convert to speech"
            className="block min-h-[190px] w-full resize-y bg-transparent px-4 py-5 text-sm leading-7 text-slate-800 placeholder:text-slate-400 focus:outline-none sm:min-h-[220px] sm:px-6 sm:text-base"
          />

          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="min-w-0">
                <label
                  htmlFor="language"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
                >
                  <Languages className="h-4 w-4 text-slate-500" />
                  Language
                </label>

                <div className="relative mt-2">
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-10 text-sm text-slate-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Voices are filtered by the selected language.
                </p>
              </div>

              <div className="min-w-0">
                <span className="block text-sm font-medium text-slate-700">
                  Speed
                </span>

                <div className="mt-2 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                  {SPEED_OPTIONS.map((value) => {
                    const active = speed === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSpeed(value)}
                        aria-pressed={active}
                        className={`rounded-xl px-2 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:rounded-full sm:px-3.5 sm:py-1.5 ${
                          active
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {value}x
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Controls how fast the voice reads your text.
                </p>
              </div>
            </div>

            <div className="mt-7 min-w-0 sm:mt-8">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Voice
                </label>

                {!voicesLoading && voices.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                    {filteredVoices.length}
                    {filteredVoices.length !== voices.length
                      ? ` / ${voices.length}`
                      : ""}{" "}
                    available
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  aria-expanded={showFilters}
                  className={`ml-auto inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    showFilters || activeFilterCount > 0
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filters</span>

                  {activeFilterCount > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {!voicesLoading && voices.length > 0 && (
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    placeholder="Search voices..."
                    aria-label="Search voices"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />

                  {voiceSearch && (
                    <button
                      type="button"
                      onClick={() => setVoiceSearch("")}
                      aria-label="Clear voice search"
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {showFilters && !voicesLoading && voices.length > 0 && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {hasGenderData && (
                      <div>
                        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <User className="h-3 w-3" />
                          Gender
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {GENDER_OPTIONS.map((g) => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => setGenderFilter(g.value)}
                              className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                genderFilter === g.value
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {TYPE_OPTIONS.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setTypeFilter(t.value)}
                            className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              typeFilter === t.value
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {hasPitchData && (
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Pitch
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {PITCH_OPTIONS.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setPitchFilter(p.value)}
                              className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                pitchFilter === p.value
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasAccentData && (
                      <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Accent
                        </p>

                        <select
                          value={accentFilter}
                          onChange={(e) => setAccentFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="all">All accents</option>

                          {availableAccents.map((accent) => (
                            <option key={accent} value={accent}>
                              {accent}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="mt-4 flex justify-end border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-indigo-600"
                      >
                        <X className="h-3 w-3" />
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {previewError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{previewError}</span>

                  <button
                    type="button"
                    onClick={() => setPreviewError("")}
                    className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700"
                    aria-label="Dismiss preview error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {voicesLoading ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="h-4 w-4 flex-shrink-0 animate-pulse rounded-full bg-slate-200" />

                      <div className="min-w-0 flex-1">
                        <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
                      </div>

                      <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : filteredVoices.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <Search className="h-4 w-4" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {voices.length === 0
                      ? "No voices available"
                      : "No voices match your search"}
                  </p>

                  {(voiceSearch || activeFilterCount > 0) && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Clear search and filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative mt-3">
                  <div className="max-h-[360px] overflow-y-auto overscroll-contain px-0.5 pb-1 sm:max-h-[380px]">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredVoices.map((v) => {
                        const selected = voice === v.value;
                        const playing = previewVoice === v.value;
                        const loading = previewLoading === v.value;
                        const hasPreview = Boolean(v.previewUrl);
                        const pitch = normalizePitch(v.pitch);
                        const isGenerating = isLoading && selected;

                        return (
                          <div
                            key={v.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (isLoading) return;
                              setVoice(v.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();

                                if (!isLoading) {
                                  setVoice(v.value);
                                }
                              }
                            }}
                            className={`group relative flex min-w-0 items-start gap-2.5 rounded-xl border p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:gap-3 ${
                              isLoading
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } ${
                              isGenerating
                                ? "border-indigo-500 bg-indigo-50/80 shadow-sm ring-2 ring-inset ring-indigo-400"
                                : selected
                                ? "border-indigo-500 bg-indigo-50/60 shadow-sm ring-1 ring-inset ring-indigo-500"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 hover:shadow-sm"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-indigo-600 bg-indigo-600"
                                  : "border-slate-300 bg-white group-hover:border-indigo-400"
                              }`}
                            >
                              {selected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="min-w-0 truncate text-sm font-semibold text-slate-900">
                                  {v.label}
                                </span>

                                {isGenerating && (
                                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    <span className="hidden xs:inline">
                                      Generating
                                    </span>
                                  </span>
                                )}
                              </div>

                              {v.description && (
                                <p
                                  className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500"
                                  title={v.description}
                                >
                                  {v.description}
                                </p>
                              )}

                              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
                                {v.gender && (
                                  <span
                                    className={`inline-flex max-w-full items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${
                                      v.gender === "female"
                                        ? "bg-pink-50 text-pink-700"
                                        : v.gender === "male"
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {v.gender}
                                  </span>
                                )}

                                {pitch && (
                                  <span className="inline-flex rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium capitalize text-violet-700">
                                    {pitch}
                                  </span>
                                )}

                                {v.accent && (
                                  <span
                                    className="inline-flex max-w-[120px] truncate rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                    title={v.accent}
                                  >
                                    {v.accent}
                                  </span>
                                )}

                                {v.extended && (
                                  <span className="inline-flex rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                    Ext
                                  </span>
                                )}
                              </div>
                            </div>

                            {hasPreview ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  if (isLoading) return;

                                  handlePreview(v);
                                }}
                                disabled={loading || isLoading}
                                aria-label={
                                  playing
                                    ? `Stop preview for ${v.label}`
                                    : `Preview ${v.label}`
                                }
                                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                  playing
                                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-500 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 disabled:opacity-50"
                                }`}
                              >
                                {loading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : playing ? (
                                  <Pause className="h-3.5 w-3.5" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                                )}
                              </button>
                            ) : (
                              <span
                                title="Preview not available"
                                className="mt-0.5 hidden h-8 flex-shrink-0 items-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-2.5 text-[10px] font-medium text-slate-400 sm:flex"
                              >
                                No preview
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {filteredVoices.length > 4 && (
                    <div className="pointer-events-none absolute bottom-0 left-1 right-1 h-7 bg-gradient-to-t from-white to-transparent" />
                  )}
                </div>
              )}

              {voicesError && (
                <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{voicesError}</span>
                </div>
              )}

              <p className="mt-2 hidden text-xs leading-5 text-slate-400 sm:block">
                Click a voice to select it. Use the{" "}
                <Play className="inline h-3 w-3 translate-y-[-1px]" /> button to
                preview without changing your selection.
              </p>
            </div>

            {error && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-xl border px-3.5 py-3 sm:mt-6 sm:px-4 ${
                  isTemporaryError
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold">{error.message}</p>

                  <p className="mt-0.5 text-xs leading-5 opacity-80">
                    {isQuotaError
                      ? "You've reached today's available generation limit. Please try again later."
                      : isRateLimitError
                      ? "Please wait a moment before generating again."
                      : error.code === "invalid_input"
                      ? "Please check the text and settings you've entered."
                      : error.code === "upstream_error"
                      ? "The speech service is temporarily unavailable. Please try again later."
                      : "If this keeps happening, refresh the page and try again."}
                  </p>

                  {error.retryAfterMs && error.retryAfterMs > 0 && (
                    <p className="mt-1 text-xs opacity-70">
                      Retry in approximately{" "}
                      {Math.ceil(error.retryAfterMs / 60000)} min
                    </p>
                  )}
                </div>
              </div>
            )}

            {inCooldown && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 sm:px-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">
                    Generation temporarily unavailable.
                  </span>

                  <span className="flex-shrink-0 font-semibold">
                    {cooldownMinutes} min
                  </span>
                </div>

                <p className="mt-1 text-xs opacity-80">
                  Please wait before trying again.
                </p>
              </div>
            )}

            <div className="h-3 sm:h-4" />
          </div>

          <div className="hidden border-t border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:block sm:px-6 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <GenerateStatus
                isLoading={isLoading}
                inCooldown={inCooldown}
                cooldownMinutes={cooldownMinutes}
                voice={voice}
                selectedVoiceObj={selectedVoiceObj}
                selectedLanguageObj={selectedLanguageObj}
              />

              <GenerateButton
                canGenerate={canGenerate}
                isLoading={isLoading}
                inCooldown={inCooldown}
                onClick={handleGenerate}
              />
            </div>
          </div>
        </div>

        {audioUrl && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              onError={() =>
                setError({
                  code: "audio_playback_error",
                  message: "Could not play the generated audio.",
                  retryAfterMs: null,
                })
              }
            />

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 translate-x-[1px]" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    Your generated audio
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    onClick={toggleMute}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    aria-label="Download audio"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-9 text-right text-[11px] tabular-nums text-slate-400">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    const audio = audioRef.current;

                    if (!audio || !duration) return;

                    const newTime =
                      (parseFloat(e.target.value) / 100) * duration;

                    audio.currentTime = newTime;
                    setCurrentTime(newTime);
                  }}
                  aria-label="Audio progress"
                  className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 ${progress}%, #e2e8f0 ${progress}%)`,
                  }}
                />

                <span className="w-9 text-[11px] tabular-nums text-slate-400">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {!audioUrl && !isLoading && (
          <p className="mt-5 text-center text-xs text-slate-400 sm:mt-6 sm:text-sm">
            Your generated audio will appear here.
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <GenerateStatus
              isLoading={isLoading}
              inCooldown={inCooldown}
              cooldownMinutes={cooldownMinutes}
              voice={voice}
              selectedVoiceObj={selectedVoiceObj}
              selectedLanguageObj={selectedLanguageObj}
              mobile
            />
          </div>

          <GenerateButton
            canGenerate={canGenerate}
            isLoading={isLoading}
            inCooldown={inCooldown}
            onClick={handleGenerate}
            mobile
          />
        </div>
      </div>
    </main>
  );
}

function GenerateStatus({
  isLoading,
  inCooldown,
  cooldownMinutes,
  voice,
  selectedVoiceObj,
  selectedLanguageObj,
  mobile = false,
}) {
  if (isLoading) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-indigo-600 ${
          mobile ? "text-[11px]" : "text-xs"
        }`}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Generating audio…</span>
      </span>
    );
  }

  if (inCooldown) {
    return (
      <span
        className={`block truncate text-amber-700 ${
          mobile ? "text-[11px]" : "text-xs"
        }`}
      >
        Cooldown active · {cooldownMinutes} min remaining
      </span>
    );
  }

  if (voice) {
    return (
      <span
        className={`block truncate text-slate-500 ${
          mobile ? "text-[11px]" : "text-xs"
        }`}
      >
        Ready with{" "}
        <strong className="font-semibold text-slate-700">
          {selectedVoiceObj?.label || voice}
        </strong>
        {selectedLanguageObj && (
          <>
            {" "}
            ·{" "}
            <strong className="font-semibold text-slate-700">
              {selectedLanguageObj.label}
            </strong>
          </>
        )}
      </span>
    );
  }

  return (
    <span
      className={
        mobile ? "text-[11px] text-slate-500" : "text-xs text-slate-500"
      }
    >
      Select a voice to begin.
    </span>
  );
}

function GenerateButton({
  canGenerate,
  isLoading,
  inCooldown,
  onClick,
  mobile = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canGenerate}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${
        mobile
          ? "min-w-[145px] px-4 py-3 text-xs"
          : "w-full px-6 py-3 text-sm sm:w-auto sm:min-w-[190px]"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : inCooldown ? (
        <>
          <ClockIcon />
          <span>Try again later</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          <span>Generate speech</span>
        </>
      )}
    </button>
  );
}

function ClockIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-current">
      <span className="h-1.5 w-px translate-y-[-1px] bg-current" />
    </span>
  );
}

export default TTSPage;
