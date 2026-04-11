"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  BarChart3,
  Flame,
  Zap,
  Target,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDELEDashboard } from "./_components/DELEDashboardProvider";
import { t } from "@/lib/dele/translations";
import { DELE_LEVELS } from "@/lib/dele/config";

/* ------------------------------------------------------------------ */
/*  Landing Page (guests)                                              */
/* ------------------------------------------------------------------ */

function GuestLanding() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-4 py-20 text-white">
        {/* Spanish mosaic pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Star className="h-4 w-4 text-amber-300" />
            Niveles A1 - C2
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {t.hero_title}
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            {t.hero_subtitle}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/learn"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
            >
              {t.hero_cta}
            </Link>
            <Link
              href="/precios"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              {t.hero_secondary_cta}
            </Link>
          </div>
        </div>
      </section>

      {/* CEFR Levels */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Todos los niveles CEFR
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DELE_LEVELS.map((level) => (
            <Link
              key={level.level}
              href={`/learn?level=${level.level}`}
              className="group rounded-xl border border-zinc-200 p-6 transition hover:border-transparent hover:shadow-lg dark:border-zinc-800"
              style={{ borderLeftWidth: 4, borderLeftColor: level.color }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-black" style={{ color: level.color }}>
                  {level.level}
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-300 transition group-hover:text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{level.name}</h3>
              <p className="mt-1 text-xs text-zinc-500">{level.totalDurationMinutes} min de examen</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-zinc-50 px-4 py-16 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Por que Koydo para el DELE?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Examenes simulados", desc: "Simula examenes DELE reales con tiempo limitado para cada nivel CEFR." },
              { title: "Tutor IA", desc: "Obtiene explicaciones instantaneas y recomendaciones de estudio personalizadas." },
              { title: "5 habilidades", desc: "Lectura, escucha, escritura, expresion oral y gramatica con vocabulario." },
              { title: "Estudia en cualquier lugar", desc: "Optimizado para movil. Estudia en cualquier momento y lugar." },
              { title: "Aprendizaje adaptativo", desc: "Centrate en tus areas mas debiles con seleccion inteligente de preguntas." },
              { title: "Gratis para empezar", desc: "10 preguntas gratis cada dia. Mejora para acceso ilimitado." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs text-zinc-500">
            {t.footer_disclaimer}
          </p>
          <nav className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">{t.footer_privacy}</Link>
            <Link href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">{t.footer_terms}</Link>
          </nav>
          <p className="mt-2 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Koydo. {t.footer_rights}
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard (logged in)                                              */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const dashboard = useDELEDashboard();

  if (!dashboard || dashboard.loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
          <p className="text-sm text-zinc-500">{t.loading}</p>
        </div>
      </main>
    );
  }

  const streakDays = dashboard.streak?.current_streak ?? 0;
  const xp = dashboard.xp;
  const level = dashboard.gamificationLevel;
  const dailyDone = dashboard.dailyQuestionsToday;
  const dailyGoal = dashboard.dailyGoal;
  const dailyPct = Math.min(100, Math.round((dailyDone / dailyGoal) * 100));

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t.dashboard_welcome} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t.dashboard_continue_practice}
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{streakDays}</p>
            <p className="text-xs text-zinc-500">{t.dashboard_streak_days}</p>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{xp}</p>
            <p className="text-xs text-zinc-500">{t.dashboard_xp}</p>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{level}</p>
            <p className="text-xs text-zinc-500">{t.dashboard_level}</p>
          </div>
        </div>

        {/* Daily goal */}
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Target className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{dailyDone}/{dailyGoal}</p>
            </div>
            <p className="text-xs text-zinc-500">{t.dashboard_daily_goal}</p>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skill Mastery + Quick Actions */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Skill mastery rings */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t.dashboard_skill_mastery}
          </h2>
          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { key: "comprension-lectura", label: t.skill_reading, color: "#2563eb" },
              { key: "comprension-auditiva", label: t.skill_listening, color: "#7c3aed" },
              { key: "expresion-escrita", label: t.skill_writing, color: "#dc2626" },
              { key: "expresion-oral", label: t.skill_speaking, color: "#f59e0b" },
              { key: "gramatica", label: t.skill_grammar, color: "#059669" },
            ].map((skill) => {
              const mastery = dashboard.skillMastery.find((s) => s.skill === skill.key)?.mastery ?? 0;
              const circumference = 2 * Math.PI * 36;
              const offset = circumference - (mastery / 100) * circumference;
              return (
                <div key={skill.key} className="flex flex-col items-center gap-2">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-100 dark:text-zinc-800" />
                      <circle
                        cx="40" cy="40" r="36" fill="none" stroke={skill.color} strokeWidth="6"
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {mastery}%
                    </span>
                  </div>
                  <span className="text-center text-[11px] leading-tight text-zinc-500">{skill.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <Link
            href="/learn"
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <BookOpen className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.dashboard_start_practice}</p>
              <p className="text-xs text-zinc-500">{t.learn_subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </Link>

          <Link
            href="/examen"
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.exam_title}</p>
              <p className="text-xs text-zinc-500">{t.exam_subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </Link>

          <Link
            href="/resultados"
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.results_title}</p>
              <p className="text-xs text-zinc-500">{t.results_subtitle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </Link>
        </div>
      </div>

      {/* Level progress cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t.dashboard_level_progress}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DELE_LEVELS.map((level) => (
            <Link
              key={level.level}
              href={`/learn?level=${level.level}`}
              className="group rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-black" style={{ color: level.color }}>
                  {level.level}
                </span>
                <span className="text-xs text-zinc-400">{level.totalDurationMinutes} min</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{level.name}</p>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: "0%", backgroundColor: level.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t.dashboard_recent_activity}
        </h2>
        {dashboard.recentAttempts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">{t.dashboard_no_activity}</p>
            <Link
              href="/learn"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            >
              <BookOpen className="h-4 w-4" />
              {t.dashboard_start_practice}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {dashboard.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Clock className="h-4 w-4 text-zinc-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {attempt.score !== null ? `${attempt.score}%` : "En progreso"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString("es-ES") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-center text-xs text-zinc-400">
          {t.footer_disclaimer}
        </p>
        <p className="mt-2 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} Koydo. {t.footer_rights}
        </p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Router                                                              */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  // Still checking auth
  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
      </main>
    );
  }

  return isAuthenticated ? <Dashboard /> : <GuestLanding />;
}
