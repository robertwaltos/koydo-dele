"use client";

/**
 * DELEDashboardProvider — Single-fetch data provider.
 *
 * Replaces cascading waterfall of independent client-side fetches
 * with one combined request to /api/dele/dashboard. All child components
 * consume pre-fetched data via context.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecentAttempt {
  id: string;
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  total_study_days: number;
  last_study_date: string | null;
}

interface SkillMastery {
  skill: string;
  mastery: number; // 0-100
}

export interface DELEDashboardData {
  /** Whether the fetch is still in flight */
  loading: boolean;
  /** Whether the user is logged in */
  isAuthenticated: boolean;
  /** Whether the user has an active paid entitlement */
  premiumActive: boolean;
  /** Current subscription cadence */
  subscriptionPlan: "monthly" | "annual" | "free";
  /** Next expiry / renewal boundary */
  subscriptionExpiresAt: string | null;
  /** Current CEFR target level */
  targetLevel: string | null;
  /** Total questions available */
  totalQuestions: number;
  /** Total questions completed by user */
  completedQuestions: number;
  /** Average score across attempts */
  averageScore: number;
  /** Last 5 completed attempts */
  recentAttempts: RecentAttempt[];
  /** Study streak stats */
  streak: StudyStreak | null;
  /** Mastery per skill */
  skillMastery: SkillMastery[];
  /** XP total */
  xp: number;
  /** Gamification level */
  gamificationLevel: number;
  /** Daily questions completed today */
  dailyQuestionsToday: number;
  /** Daily goal target */
  dailyGoal: number;
  /** Force refetch all data */
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DELEDashboardCtx = createContext<DELEDashboardData | null>(null);

/**
 * Read combined dashboard data. Returns null when used outside provider.
 */
export function useDELEDashboard(): DELEDashboardData | null {
  return useContext(DELEDashboardCtx);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DELEDashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<Omit<DELEDashboardData, "loading" | "refetch"> | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch("/api/dele/dashboard").then((r) => r.ok ? r.json() : null),
      fetch("/api/dele/subscription-status").then((r) => r.ok ? r.json() : null),
      fetch("/api/dele/gamification").then((r) => r.ok ? r.json() : null),
    ])
      .then(([dashData, subData, gamData]) => {
        if (cancelled) return;
        setPayload({
          isAuthenticated: subData?.isAuthenticated ?? false,
          premiumActive: subData?.premiumActive ?? false,
          subscriptionPlan: subData?.plan ?? "free",
          subscriptionExpiresAt: subData?.expiresAt ?? null,
          targetLevel: dashData?.targetLevel ?? null,
          totalQuestions: dashData?.stats?.totalQuestions ?? 0,
          completedQuestions: dashData?.stats?.completedQuestions ?? 0,
          averageScore: dashData?.stats?.averageScore ?? 0,
          recentAttempts: dashData?.recentAttempts ?? [],
          streak: gamData?.streak ?? null,
          skillMastery: gamData?.skillMastery ?? [],
          xp: gamData?.xp ?? 0,
          gamificationLevel: gamData?.level ?? 1,
          dailyQuestionsToday: gamData?.dailyQuestionsToday ?? 0,
          dailyGoal: gamData?.dailyGoal ?? 10,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setPayload({
          isAuthenticated: false,
          premiumActive: false,
          subscriptionPlan: "free",
          subscriptionExpiresAt: null,
          targetLevel: null,
          totalQuestions: 0,
          completedQuestions: 0,
          averageScore: 0,
          recentAttempts: [],
          streak: null,
          skillMastery: [],
          xp: 0,
          gamificationLevel: 1,
          dailyQuestionsToday: 0,
          dailyGoal: 10,
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const refetch = () => setFetchKey((k) => k + 1);

  const value: DELEDashboardData = {
    loading,
    isAuthenticated: payload?.isAuthenticated ?? false,
    premiumActive: payload?.premiumActive ?? false,
    subscriptionPlan: payload?.subscriptionPlan ?? "free",
    subscriptionExpiresAt: payload?.subscriptionExpiresAt ?? null,
    targetLevel: payload?.targetLevel ?? null,
    totalQuestions: payload?.totalQuestions ?? 0,
    completedQuestions: payload?.completedQuestions ?? 0,
    averageScore: payload?.averageScore ?? 0,
    recentAttempts: payload?.recentAttempts ?? [],
    streak: payload?.streak ?? null,
    skillMastery: payload?.skillMastery ?? [],
    xp: payload?.xp ?? 0,
    gamificationLevel: payload?.gamificationLevel ?? 1,
    dailyQuestionsToday: payload?.dailyQuestionsToday ?? 0,
    dailyGoal: payload?.dailyGoal ?? 10,
    refetch,
  };

  return (
    <DELEDashboardCtx.Provider value={value}>
      {children}
    </DELEDashboardCtx.Provider>
  );
}
