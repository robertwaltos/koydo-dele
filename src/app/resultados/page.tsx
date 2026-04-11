"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, XCircle, Clock, TrendingUp, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { t } from "@/lib/dele/translations";

interface AttemptResult {
  id: string;
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
  level?: string;
  skill?: string;
}

interface SkillBreakdown {
  skill: string;
  label: string;
  attempts: number;
  avgScore: number;
  color: string;
}

const SKILL_COLORS: Record<string, string> = {
  "comprension-lectura": "#2563eb",
  "comprension-auditiva": "#7c3aed",
  "expresion-escrita": "#dc2626",
  "expresion-oral": "#f59e0b",
  "gramatica": "#059669",
};

const SKILL_LABELS: Record<string, string> = {
  "comprension-lectura": "Comprension de lectura",
  "comprension-auditiva": "Comprension auditiva",
  "expresion-escrita": "Expresion escrita",
  "expresion-oral": "Expresion oral",
  "gramatica": "Gramatica y vocabulario",
};

export default function ResultadosPage() {
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/sign-in?returnTo=/resultados";
        return;
      }

      const { data: attempts } = await supabase
        .from("testing_exam_attempts")
        .select("id, score, max_score, started_at, completed_at")
        .eq("user_id", user.id)
        .eq("exam_id", "dele")
        .order("started_at", { ascending: false })
        .limit(20);

      setResults(attempts ?? []);

      // Build skill breakdown (placeholder - would come from actual tagged data)
      const skills = Object.entries(SKILL_LABELS).map(([id, label]) => ({
        skill: id,
        label,
        attempts: Math.floor(Math.random() * 10),
        avgScore: 0,
        color: SKILL_COLORS[id] ?? "#6b7280",
      }));
      setSkillBreakdown(skills);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </main>
    );
  }

  const overallAvg = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length)
    : 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back_home}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t.results_title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t.results_subtitle}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
          <p className="text-sm text-zinc-500">{t.results_no_results}</p>
          <Link
            href="/learn"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            {t.dashboard_start_practice}
          </Link>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{overallAvg}%</p>
              <p className="text-xs text-zinc-500">{t.results_accuracy} media</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{results.length}</p>
              <p className="text-xs text-zinc-500">{t.results_total_questions}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Clock className="mx-auto mb-2 h-6 w-6 text-amber-500" />
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {results.filter((r) => (r.score ?? 0) >= 60).length}
              </p>
              <p className="text-xs text-zinc-500">{t.results_passed}</p>
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t.results_by_skill}
            </h2>
            <div className="space-y-4">
              {skillBreakdown.map((skill) => (
                <div key={skill.skill}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{skill.label}</span>
                    <span className="text-xs text-zinc-500">{skill.avgScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.avgScore}%`, backgroundColor: skill.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent results */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t.results_recent}
            </h2>
            <div className="space-y-2">
              {results.map((result) => {
                const pct = result.score ?? 0;
                const passed = pct >= 60;
                return (
                  <div
                    key={result.id}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {pct}%
                      </p>
                      <p className="text-xs text-zinc-400">
                        {result.completed_at
                          ? new Date(result.completed_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "En progreso"}
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full px-3 py-0.5 text-xs font-bold",
                        passed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                      ].join(" ")}
                    >
                      {passed ? t.results_passed : t.results_failed}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
