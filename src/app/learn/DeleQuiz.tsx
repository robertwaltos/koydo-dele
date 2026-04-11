"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type ApiQuestion = {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string | null;
  domain: string | null;
  options: unknown;
  correct_answer: unknown;
  explanation: string | null;
};

type ParsedQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain: string;
};

type AnswerRecord = {
  questionIndex: number;
  selectedIndex: number | null;
  correct: boolean;
};

// ── Constants ────────────────────────────────────────────────────────────────

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const SKILL_AREAS = [
  { id: "comprension-lectura", label: "Comprension de lectura" },
  { id: "gramatica", label: "Gramatica y vocabulario" },
  { id: "comprension-auditiva", label: "Comprension auditiva" },
  { id: "expresion-escrita", label: "Expresion escrita" },
  { id: "expresion-oral", label: "Expresion oral" },
] as const;

const LEVEL_COLORS: Record<string, string> = {
  A1: "#22c55e",
  A2: "#16a34a",
  B1: "#2563eb",
  B2: "#1d4ed8",
  C1: "#9333ea",
  C2: "#7c3aed",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseQuestion(q: ApiQuestion): ParsedQuestion {
  let opts: string[] = [];
  if (Array.isArray(q.options)) {
    opts = q.options.map((o: unknown) => {
      if (typeof o === "string") return o;
      if (typeof o === "object" && o !== null && "text" in o) return String((o as { text: string }).text);
      return String(o);
    });
  } else if (typeof q.options === "string") {
    try {
      const parsed = JSON.parse(q.options);
      if (Array.isArray(parsed)) opts = parsed.map(String);
    } catch { /* skip */ }
  }

  let correctIndex = 0;
  const raw = typeof q.correct_answer === "string" ? q.correct_answer : JSON.stringify(q.correct_answer);
  const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const upper = raw.trim().toUpperCase();
  if (letterMap[upper] !== undefined) {
    correctIndex = letterMap[upper];
  } else {
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
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function DeleQuiz() {
  const [level, setLevel] = useState<string | null>(null);
  const [skill, setSkill] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "20" });
      // Build domain filter from level + skill
      const domainParts: string[] = [];
      if (level) domainParts.push(level.toLowerCase());
      if (skill) domainParts.push(skill);
      if (domainParts.length > 0) {
        params.set("domain", domainParts.join("-"));
      }
      const res = await fetch(`/api/dele/questions?${params.toString()}`);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      const raw: ApiQuestion[] = data.questions ?? [];
      if (raw.length === 0) {
        setError("No se encontraron preguntas para estos filtros. Intenta con otra combinacion.");
        return;
      }
      const parsed = raw.map(parseQuestion).filter((q) => q.options.length >= 2);
      setQuestions(parsed);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setShowResult(false);
      setAnswers([]);
      setFinished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar preguntas");
    } finally {
      setLoading(false);
    }
  }, [level, skill]);

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return;
    if (!showResult) {
      setShowResult(true);
      const correct = selectedIndex === questions[currentIndex]?.correctIndex;
      setAnswers((prev) => [...prev, { questionIndex: currentIndex, selectedIndex, correct }]);
      return;
    }
    // Move to next or finish
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((p) => p + 1);
      setSelectedIndex(null);
      setShowResult(false);
    }
  }, [selectedIndex, showResult, currentIndex, questions]);

  const handleReset = useCallback(() => {
    setQuestions([]);
    setLevel(null);
    setSkill(null);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setShowResult(false);
    setAnswers([]);
    setFinished(false);
    setError(null);
  }, []);

  // ── Selection screen ───────────────────────────────────────────────────────

  if (questions.length === 0 && !loading) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
            &larr; Volver al inicio
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Centro de estudio DELE
          </h1>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400">
            Selecciona tu nivel CEFR y area de habilidad para comenzar la practica.
          </p>

          {/* CEFR Level Selector */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Nivel CEFR
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {CEFR_LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(level === l ? null : l)}
                  className={[
                    "rounded-xl border-2 px-4 py-3 text-center font-bold transition-all",
                    level === l
                      ? "text-white shadow-md"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                  ].join(" ")}
                  style={level === l ? { backgroundColor: LEVEL_COLORS[l], borderColor: LEVEL_COLORS[l] } : undefined}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>

          {/* Skill Area Tabs */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Area de habilidad
            </h2>
            <div className="flex flex-wrap gap-2">
              {SKILL_AREAS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSkill(skill === s.id ? null : s.id)}
                  className={[
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    skill === s.id
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-red-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Start Button */}
          <button
            type="button"
            onClick={fetchQuestions}
            disabled={loading}
            className="w-full rounded-xl bg-red-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Cargando..." : "Comenzar practica"}
          </button>
        </div>
      </main>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
          <p className="text-sm text-zinc-500">Cargando preguntas...</p>
        </div>
      </main>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = pct >= 70;

    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className={[
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-8",
                passed ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950",
              ].join(" ")}
            >
              <span className={["text-5xl font-black", passed ? "text-green-600" : "text-red-600"].join(" ")}>
                {pct}%
              </span>
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {correct}/{total} correctas
              </span>
              <span
                className={[
                  "mt-1 rounded-full px-4 py-1 text-sm font-bold text-white",
                  passed ? "bg-green-600" : "bg-red-600",
                ].join(" ")}
              >
                {passed ? "APROBADO" : "SIGUE PRACTICANDO"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchQuestions}
                className="rounded-xl border border-red-600 px-6 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Repetir
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Cambiar filtros
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <motion.div
                className="h-full rounded-full bg-red-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-5"
          >
            {/* Question */}
            <h2 className="text-lg font-bold leading-relaxed text-zinc-900 dark:text-zinc-100">
              {currentQ.text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showCorrectness = showResult;

                let borderClass = "border-zinc-200 dark:border-zinc-700";
                let bgClass = "bg-white dark:bg-zinc-900";

                if (showCorrectness && isCorrect) {
                  borderClass = "border-green-500";
                  bgClass = "bg-green-50 dark:bg-green-950";
                } else if (showCorrectness && isSelected && !isCorrect) {
                  borderClass = "border-red-500";
                  bgClass = "bg-red-50 dark:bg-red-950";
                } else if (isSelected && !showCorrectness) {
                  borderClass = "border-red-500";
                  bgClass = "bg-red-50 dark:bg-red-950";
                }

                return (
                  <button
                    key={`${currentQ.id}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={showResult}
                    className={[
                      "flex items-start gap-3 rounded-xl border p-4 text-start transition-all",
                      borderClass,
                      bgClass,
                      showResult ? "cursor-default" : "cursor-pointer hover:border-red-300",
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

            {/* Explanation */}
            {showResult && currentQ.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-red-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Explicacion
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40"
          >
            {!showResult
              ? "Comprobar"
              : currentIndex >= questions.length - 1
                ? "Ver resultados"
                : "Siguiente"}
          </button>
        </div>
      </div>
    </main>
  );
}
