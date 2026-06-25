import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  BookOpen,
  ScrollText,
  Lightbulb,
  Users,
  Play,
  Pause,
  Loader2,
  Volume2,
} from "lucide-react";
import { PROPHETS, type Prophet } from "@/data/prophets-stories";

export default function ProphetsStoriesClient() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return PROPHETS;
    return PROPHETS.filter(
      (p) =>
        p.name.includes(q) ||
        p.title.includes(q) ||
        p.summary.includes(q)
    );
  }, [search]);

  const selected = useMemo<Prophet | null>(
    () => PROPHETS.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  if (selected) {
    return <ProphetDetail prophet={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="pt-24 pb-28" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-800/30 mb-4">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-cairo text-sm">قصص الأنبياء</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "Amiri, serif" }}
          >
            قصص الأنبياء
          </h1>
          <p className="text-gray-400 font-cairo">
            الأنبياء الخمسة والعشرون المذكورون في القرآن الكريم — قصصهم كاملة مع الآيات والعبر
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن نبي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl glass border border-emerald-800/40 bg-emerald-900/20 text-white placeholder-gray-500 font-cairo focus:outline-none focus:border-emerald-600"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 font-cairo py-12">
            لا توجد نتائج مطابقة لبحثك.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <AnimatePresence>
              {filtered.map((p, idx) => (
                <motion.button
                  key={p.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedId(p.id)}
                  className="group text-right glass-card rounded-2xl p-5 border border-emerald-900/40 hover:border-emerald-700/60 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-2xl font-bold text-emerald-400"
                        style={{ fontFamily: "Amiri, serif" }}
                      >
                        {p.name}
                      </h3>
                      <span className="w-9 h-9 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-emerald-300 text-xs font-cairo">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-emerald-300/80 text-sm font-cairo mb-2">{p.title}</p>
                    <p className="text-gray-400 text-sm font-cairo leading-relaxed line-clamp-3">
                      {p.summary}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-emerald-400 text-xs font-cairo group-hover:gap-2 transition-all">
                      اقرأ القصة كاملة
                      <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center">
          <Link
            to="/more"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/60 transition-all font-cairo"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمزيد</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProphetDetail({ prophet, onBack }: { prophet: Prophet; onBack: () => void }) {
  const [voice, setVoice] = useState<"male" | "female">("male");
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const loadedVoiceRef = useRef<"male" | "female" | null>(null);

  const storyText = useMemo(
    () => `${prophet.name} — ${prophet.title}.\n\n${prophet.story.join("\n\n")}`,
    [prophet]
  );

  // Cleanup audio + blob URL when leaving the detail view or changing prophet
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [prophet.id]);

  async function ensureAudio(): Promise<HTMLAudioElement> {
    if (audioRef.current && loadedVoiceRef.current === voice) {
      return audioRef.current;
    }
    // Voice changed (or first load) — fetch new audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    const res = await fetch("/api/public/tts/prophet-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: storyText, voice }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `فشل توليد الصوت (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    const audio = new Audio(url);
    audio.addEventListener("ended", () => setStatus("idle"));
    audio.addEventListener("pause", () => {
      // Only mark as paused if audio is not finished
      if (audio.currentTime < audio.duration) setStatus("paused");
    });
    audio.addEventListener("play", () => setStatus("playing"));
    audioRef.current = audio;
    loadedVoiceRef.current = voice;
    return audio;
  }

  async function handlePlayPause() {
    try {
      if (status === "playing" && audioRef.current) {
        audioRef.current.pause();
        return;
      }
      setErrorMsg(null);
      if (audioRef.current && loadedVoiceRef.current === voice && status === "paused") {
        await audioRef.current.play();
        return;
      }
      setStatus("loading");
      const audio = await ensureAudio();
      await audio.play();
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  function handleVoiceChange(v: "male" | "female") {
    if (v === voice) return;
    setVoice(v);
    // If audio was playing/paused with old voice, stop it; user can press play again
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    loadedVoiceRef.current = null;
    setStatus("idle");
    setErrorMsg(null);
  }

  return (
    <div className="pt-24 pb-28" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass border border-emerald-800/30 text-emerald-300 hover:text-emerald-200 transition font-cairo text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          كل الأنبياء
        </button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl md:text-5xl font-bold text-emerald-400 mb-3"
            style={{ fontFamily: "Amiri, serif" }}
          >
            {prophet.name}
          </h1>
          <p className="text-white font-cairo text-lg">{prophet.title}</p>
          <p className="text-gray-400 font-cairo text-sm mt-1">{prophet.period}</p>
        </motion.div>

        {/* AI Narrator */}
        <section className="mb-8 glass-card rounded-2xl p-5 border border-emerald-900/40">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-cairo">
              استمع للقصة بصوت راوٍ بالذكاء الاصطناعي
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="radiogroup"
              aria-label="اختر صوت الراوي"
              className="inline-flex rounded-xl bg-emerald-900/30 border border-emerald-800/40 p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={voice === "male"}
                onClick={() => handleVoiceChange("male")}
                className={`px-4 py-2 rounded-lg text-sm font-cairo transition ${
                  voice === "male"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                الاستماع بصوت رجل
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={voice === "female"}
                onClick={() => handleVoiceChange("female")}
                className={`px-4 py-2 rounded-lg text-sm font-cairo transition ${
                  voice === "female"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                الاستماع بصوت امرأة
              </button>
            </div>

            <button
              type="button"
              onClick={handlePlayPause}
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-wait text-white font-cairo text-sm font-bold transition"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحضير...
                </>
              ) : status === "playing" ? (
                <>
                  <Pause className="w-4 h-4" />
                  إيقاف مؤقت
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {status === "paused" ? "متابعة" : "استماع للقصة"}
                </>
              )}
            </button>
          </div>
          {errorMsg && (
            <p className="mt-3 text-sm text-red-300 font-cairo">{errorMsg}</p>
          )}
          <p className="mt-3 text-xs text-emerald-300/70 font-cairo">
            الصوت مُولَّد بالذكاء الاصطناعي بأسلوب روائي، وقد يستغرق تحضيره بضع ثوانٍ.
          </p>
        </section>

        {/* Story */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white font-cairo">القصة</h2>
          </div>
          <div className="space-y-4">
            {prophet.story.map((para, i) => (
              <p
                key={i}
                className="text-gray-200 leading-loose font-cairo text-[15px] md:text-base"
                style={{ textAlign: "justify" }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Verses */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <ScrollText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white font-cairo">الآيات المرتبطة</h2>
          </div>
          <div className="space-y-3">
            {prophet.verses.map((v, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-5 border border-emerald-900/40"
              >
                <p
                  className="text-emerald-100 text-lg leading-loose mb-2 text-center"
                  style={{ fontFamily: "Amiri, serif" }}
                >
                  ﴿{v.text}﴾
                </p>
                <p className="text-emerald-400/80 text-xs font-cairo text-center">{v.ref}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lessons */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white font-cairo">العبر والدروس</h2>
          </div>
          <ul className="space-y-3">
            {prophet.lessons.map((lesson, i) => (
              <li
                key={i}
                className="flex items-start gap-3 glass-card rounded-xl p-4 border border-emerald-900/40"
              >
                <span className="mt-1 w-6 h-6 shrink-0 rounded-full bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center text-emerald-300 text-xs font-cairo">
                  {i + 1}
                </span>
                <span className="text-gray-200 font-cairo leading-relaxed">{lesson}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/60 transition-all font-cairo"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الأنبياء</span>
          </button>
        </div>
      </div>
    </div>
  );
}
