"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  BookOpen,
} from "lucide-react";
import { DELE_LEVELS, getDELELevel, type DELELevel, type DELESkill } from "@/lib/dele/config";
import { t } from "@/lib/dele/translations";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain: string;
}

type ExamPhase = "select" | "loading" | "active" | "confirming" | "submitted";

/* ------------------------------------------------------------------ */
/*  Timer hook                                                        */
/* ------------------------------------------------------------------ */

function useTimer(totalSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const isLow = remaining < 300; // < 5 min

  return { remaining, formatted, isLow };
}

/* ------------------------------------------------------------------ */
/*  Exam Content                                                      */
/* ------------------------------------------------------------------ */

function ExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [phase, setPhase] = useState<ExamPhase>("select");
  const [level, setLevel] = useState<DELELevel | null>(
    (searchParams.get("nivel") as DELELevel) ?? null,
  );
  const [skill, setSkill] = useState<DELESkill | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const levelConfig = level ? getDELELevel(level) : null;
  const skillConfig = levelConfig?.skills.find((s) => s.id === skill);
  const durationMinutes = skillConfig?.durationMinutes ?? 60;
  const timer = useTimer(durationMinutes * 60, phase === "active");

  // Auto-submit when time runs out
  useEffect(() => {
    if (timer.remaining === 0 && phase === "active") {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.remaining, phase]);

  const fetchQuestions = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "30" });
      const domainParts: string[] = [];
      if (level) domainParts.push(level.toLowerCase());
      if (skill) domainParts.push(skill);
      if (domainParts.length > 0) params.set("domain", domainParts.join("-"));

      const res = await fetch(`/api/dele/questions?${params.toString()}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      const raw = data.questions ?? [];
      if (raw.length === 0) {
        setError(t.learn_no_questions);
        setPhase("select");
        return;
      }

      const parsed: ExamQuestion[] = raw.map((q: any) => {
        let opts: string[] = [];
        if (Array.isArray(q.options)) {
          opts = q.options.map((o: any) => typeof o === "string" ? o : String(o?.text ?? o));
        }
        let correctIndex = 0;
        const raw = typeof q.correct_answer === "string" ? q.correct_answer : JSON.stringify(q.correct_answer);
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        const upper = raw.trim().toUpperCase();
        if (letterMap[upper] !== undefined) correctIndex = letterMap[upper];
        else {
          const idx = opts.findIndex((o) => o.trim().toLowerCase() === raw.trim().toLowerCase());
          if (idx >= 0) correctIndex = idx;
        }
        return {
          id: q.id,
          text: q.question_text,
          options: opts,
          correctIndex,
          explanation: q.explanation ?? "",
          domain: q.domain ?? "",
        };
      }).filter((q: ExamQuestion) => q.options.length >= 2);

      setQuestions(parsed);
      setAnswers({});
      setFlagged(new Set());
      setCurrentIndex(0);
      setScore(null);
      setPhase("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setPhase("select");
    }
  }, [level, skill]);

  function handleSubmit() {
    const correct = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(pct);
    setPhase("submitted");
  }

  function toggleFlag(id: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Selection screen ──
  if (phase === "select") {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {t.exam_title}
          </h1>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400">
            {t.exam_subtitle}
          </p>

          {/* Level selector */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {t.exam_select_level}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {DELE_LEVELS.map((l) => (
                <button
                  key={l.level}
                  onClick={() => { setLevel(l.level); setSkill(null); }}
                  className={[
                    "rounded-xl border-2 px-4 py-3 text-center font-bold transition-all",
                    level === l.level
                      ? "text-white shadow-md"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                  ].join(" ")}
                  style={level === l.level ? { backgroundColor: l.color, borderColor: l.color } : undefined}
                >
                  {l.level}
                </button>
              ))}
            </div>
          </section>

          {/* Skill selector */}
          {level && levelConfig && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {t.exam_select_skill}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {levelConfig.skills.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSkill(s.id)}
                    className={[
                      "rounded-xl border p-4 text-left transition-all",
                      skill === s.id
                        ? "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950"
                        : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{s.durationMinutes} minutos</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={fetchQuestions}
            disabled={!level || !skill}
            className="rounded-xl bg-red-600 px-8 py-3 text-lg font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
          >
            {t.exam_start}
          </button>
        </div>
      </main>
    );
  }

  // ── Loading ──
  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-sm text-zinc-500">{t.learn_loading}</p>
        </div>
      </main>
    );
  }

  // ── Submitted / Results ──
  if (phase === "submitted" && score !== null) {
    const passed = score >= (levelConfig?.overallPassThreshold ?? 60);
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-6">
            <div
              className={[
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-8",
                passed ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950",
              ].join(" ")}
            >
              {passed ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-red-500" />
              )}
              <span className={["text-5xl font-black", passed ? "text-emerald-600" : "text-red-600"].join(" ")}>
                {score}%
              </span>
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {questions.filter((q) => answers[q.id] === q.correctIndex).length}/{questions.length} {t.learn_correct}
              </span>
              <span
                className={[
                  "mt-1 rounded-full px-4 py-1 text-sm font-bold text-white",
                  passed ? "bg-emerald-600" : "bg-red-600",
                ].join(" ")}
              >
                {passed ? t.learn_passed : t.learn_keep_practicing}
              </span>
              {level && (
                <span className="text-xs text-zinc-500">
                  {level} \u2014 {skillConfig?.name ?? ""}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPhase("select"); setLevel(null); setSkill(null); }}
                className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                {t.learn_change_filters}
              </button>
              <button
                onClick={() => router.push("/resultados")}
                className="rounded-xl border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
              >
                {t.results_view_details}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Confirming submission ──
  if (phase === "confirming") {
    const answered = Object.keys(answers).length;
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h2 className="mb-2 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t.exam_submit}
          </h2>
          <p className="mb-4 text-center text-sm text-zinc-500">
            {t.exam_submit_confirm}
          </p>
          <p className="mb-6 text-center text-xs text-zinc-400">
            {answered}/{questions.length} preguntas respondidas \u2022 {flagged.size} marcadas
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setPhase("active")}
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Active exam ──
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isFlagged = flagged.has(currentQ.id);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Timer + progress bar */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
              timer.isLow
                ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {timer.formatted}
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Question */}
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold leading-relaxed text-zinc-900 dark:text-zinc-100">
            {currentQ.text}
          </h2>
          <button
            onClick={() => toggleFlag(currentQ.id)}
            className={`ml-3 shrink-0 rounded-lg p-2 transition ${
              isFlagged
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            aria-label={isFlagged ? t.exam_unflag : t.exam_flag}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = answers[currentQ.id] === idx;
            return (
              <button
                key={`${currentQ.id}-${idx}`}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }))}
                className={[
                  "flex items-start gap-3 rounded-xl border p-4 text-start transition-all",
                  isSelected
                    ? "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950"
                    : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                  ].join(" ")}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="pt-0.5 text-sm text-zinc-800 dark:text-zinc-200">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setPhase("confirming")}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            {t.exam_submit}
          </button>

          <button
            onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Question map */}
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{t.exam_question} {t.exam_of} {questions.length}</span>
            <span>{t.exam_flagged}: {flagged.size}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlag = flagged.has(q.id);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition",
                    isCurrent ? "ring-2 ring-red-500" : "",
                    isFlag
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      : isAnswered
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                  ].join(" ")}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ExamenPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>}>
      <ExamContent />
    </Suspense>
  );
}
