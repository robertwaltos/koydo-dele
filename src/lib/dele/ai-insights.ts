/**
 * AI-Powered Insights Engine — DELE
 *
 * Uses diagnostic profile + practice history to generate:
 * - Weekly focus recommendations
 * - Predicted DELE level (A1–C2) readiness
 * - Study efficiency metrics
 * - Mastery heatmap data
 */

import type { DELELevel } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIInsight {
  id: string;
  type: InsightType;
  priority: "critical" | "high" | "medium" | "low";
  titleKey: string;
  descriptionKey: string;
  /** Dynamic values to interpolate into i18n strings */
  params: Record<string, string | number>;
  actionUrl?: string | undefined;
  generatedAt: string;
}

export type InsightType =
  | "weekly_focus"
  | "days_until_ready"
  | "efficiency_alert"
  | "mastery_milestone"
  | "streak_encouragement"
  | "roadmap_adjustment"
  | "exam_countdown";

export interface MasteryHeatmapCell {
  subjectId: string;
  domain: string;
  mastery: number;
  questionsAttempted: number;
  trend: "improving" | "stable" | "declining";
  lastPracticed: string | null;
}

export interface PredictedScore {
  subjectId: string;
  currentMastery: number;
  predictedLevel: DELELevel;
  predictedMastery: number;
  confidenceInterval: { low: number; high: number };
  daysUntilTarget: number | null;
  targetMastery: number;
}

export interface StudyEfficiency {
  questionsPerHour: number;
  accuracyTrend: number[];
  optimalStudyTime: string;
  fatiguePenalty: number;
  recommendedSessionLength: number;
}

// ---------------------------------------------------------------------------
// DELE level thresholds (mastery % → CEFR level)
// ---------------------------------------------------------------------------

const LEVEL_THRESHOLDS: { level: DELELevel; min: number }[] = [
  { level: "C2", min: 90 },
  { level: "C1", min: 75 },
  { level: "B2", min: 60 },
  { level: "B1", min: 45 },
  { level: "A2", min: 30 },
  { level: "A1", min: 0 },
];

export function masteryToLevel(mastery: number): DELELevel {
  for (const { level, min } of LEVEL_THRESHOLDS) {
    if (mastery >= min) return level;
  }
  return "A1";
}

/** Mastery threshold required to achieve a given level */
const LEVEL_TO_THRESHOLD: Record<DELELevel, number> = {
  A1: 30,
  A2: 45,
  B1: 60,
  B2: 75,
  C1: 90,
  C2: 95,
};

export function levelToTargetMastery(level: DELELevel): number {
  return LEVEL_TO_THRESHOLD[level];
}

// ---------------------------------------------------------------------------
// Helpers — next DELE exam session
// ---------------------------------------------------------------------------

/**
 * DELE sessions are held in Jan, Apr/May, and Nov each year.
 * Returns the ISO date string of the nearest upcoming session.
 */
function getNextDELESession(): Date {
  const now = new Date();
  const year = now.getFullYear();

  const sessions = [
    new Date(`${year}-01-20`),
    new Date(`${year}-05-10`),
    new Date(`${year}-11-15`),
    new Date(`${year + 1}-01-20`),
  ];

  const upcoming = sessions.find((d) => d.getTime() > now.getTime());
  return upcoming ?? sessions[sessions.length - 1]!;
}

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

export function generateWeeklyInsights(
  diagnosticScores: Record<string, number>,
  practiceHistory: { subjectId: string; accuracy: number; timeMs: number; date: string }[],
  streakDays: number,
  roadmapCompletionPct: number,
  targetLevel: DELELevel = "B2",
): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();
  const nextSession = getNextDELESession();
  const daysLeft = Math.max(0, Math.ceil((nextSession.getTime() - now.getTime()) / 86400000));

  // 1. Exam countdown urgency
  if (daysLeft <= 30) {
    insights.push({
      id: `countdown_${daysLeft}`,
      type: "exam_countdown",
      priority: daysLeft <= 7 ? "critical" : "high",
      titleKey: "dele_insight_countdown_title",
      descriptionKey: "dele_insight_countdown_desc",
      params: { days: daysLeft },
      generatedAt: now.toISOString(),
    });
  }

  // 2. Weekly focus — find 3 weakest skills
  const sortedSubjects = Object.entries(diagnosticScores)
    .sort(([, a], [, b]) => a - b);
  const weakest = sortedSubjects.slice(0, 3);
  if (weakest.length > 0) {
    insights.push({
      id: `focus_${now.toISOString().slice(0, 10)}`,
      type: "weekly_focus",
      priority: "high",
      titleKey: "dele_insight_focus_title",
      descriptionKey: "dele_insight_focus_desc",
      params: {
        subject1: weakest[0]?.[0] ?? "",
        score1: weakest[0]?.[1] ?? 0,
        subject2: weakest[1]?.[0] ?? "",
        score2: weakest[1]?.[1] ?? 0,
        subject3: weakest[2]?.[0] ?? "",
        score3: weakest[2]?.[1] ?? 0,
      },
      actionUrl: weakest[0] ? `/dele/habilidad/${weakest[0][0]}` : undefined,
      generatedAt: now.toISOString(),
    });
  }

  // 3. Days until ready prediction
  const overallMastery = Object.values(diagnosticScores).length > 0
    ? Object.values(diagnosticScores).reduce((s, v) => s + v, 0) / Object.values(diagnosticScores).length
    : 0;

  const targetMastery = levelToTargetMastery(targetLevel);

  if (overallMastery < targetMastery) {
    const recentPractice = practiceHistory.filter((p) => {
      const pDate = new Date(p.date);
      return (now.getTime() - pDate.getTime()) < 7 * 86400000;
    });
    const weeklyImprovement = recentPractice.length > 0
      ? recentPractice.reduce((s, p) => s + p.accuracy, 0) / recentPractice.length - overallMastery
      : 2;
    const daysNeeded = weeklyImprovement > 0
      ? Math.ceil(((targetMastery - overallMastery) / weeklyImprovement) * 7)
      : null;

    insights.push({
      id: `ready_${now.toISOString().slice(0, 10)}`,
      type: "days_until_ready",
      priority: daysNeeded != null && daysNeeded > daysLeft ? "critical" : "medium",
      titleKey: "dele_insight_ready_title",
      descriptionKey: "dele_insight_ready_desc",
      params: {
        daysNeeded: daysNeeded ?? -1,
        daysLeft,
        currentMastery: Math.round(overallMastery),
        currentLevel: masteryToLevel(overallMastery),
        targetLevel,
      },
      generatedAt: now.toISOString(),
    });
  }

  // 4. Streak encouragement
  if (streakDays >= 3) {
    insights.push({
      id: `streak_${streakDays}`,
      type: "streak_encouragement",
      priority: "low",
      titleKey: "dele_insight_streak_title",
      descriptionKey: "dele_insight_streak_desc",
      params: { days: streakDays },
      generatedAt: now.toISOString(),
    });
  }

  // 5. Roadmap adherence
  if (roadmapCompletionPct < 50 && daysLeft < 30) {
    insights.push({
      id: `roadmap_behind_${now.toISOString().slice(0, 10)}`,
      type: "roadmap_adjustment",
      priority: "high",
      titleKey: "dele_insight_roadmap_behind_title",
      descriptionKey: "dele_insight_roadmap_behind_desc",
      params: { completionPct: Math.round(roadmapCompletionPct) },
      actionUrl: "/dele",
      generatedAt: now.toISOString(),
    });
  }

  return insights.sort((a, b) => {
    const prio = { critical: 0, high: 1, medium: 2, low: 3 };
    return prio[a.priority] - prio[b.priority];
  });
}

// ---------------------------------------------------------------------------
// Predicted level computation
// ---------------------------------------------------------------------------

export function predictScores(
  diagnosticScores: Record<string, number>,
  practiceHistory: { subjectId: string; accuracy: number; date: string }[],
  targetLevel: DELELevel = "B2",
): PredictedScore[] {
  const now = new Date();
  const nextSession = getNextDELESession();
  const daysLeft = Math.max(0, Math.ceil((nextSession.getTime() - now.getTime()) / 86400000));
  const targetMastery = levelToTargetMastery(targetLevel);

  return Object.entries(diagnosticScores).map(([subjectId, currentMastery]) => {
    const subjectPractice = practiceHistory
      .filter((p) => p.subjectId === subjectId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let improvementPerDay = 0.3;
    if (subjectPractice.length >= 3) {
      const first = subjectPractice[0];
      const last = subjectPractice[subjectPractice.length - 1];
      if (first && last) {
        const daySpan = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000);
        improvementPerDay = (last.accuracy - first.accuracy) / daySpan;
      }
    }

    const predictedMastery = Math.min(100, Math.max(0,
      currentMastery + improvementPerDay * daysLeft));
    const confidence = Math.min(15, Math.max(5, 20 - subjectPractice.length));

    const daysUntilTarget = currentMastery >= targetMastery
      ? 0
      : improvementPerDay > 0
        ? Math.ceil((targetMastery - currentMastery) / improvementPerDay)
        : null;

    return {
      subjectId,
      currentMastery,
      predictedLevel: masteryToLevel(Math.round(predictedMastery)),
      predictedMastery: Math.round(predictedMastery),
      confidenceInterval: {
        low: Math.round(Math.max(0, predictedMastery - confidence)),
        high: Math.round(Math.min(100, predictedMastery + confidence)),
      },
      daysUntilTarget,
      targetMastery,
    };
  });
}

// ---------------------------------------------------------------------------
// Study efficiency computation
// ---------------------------------------------------------------------------

export function computeStudyEfficiency(
  practiceHistory: { accuracy: number; timeMs: number; date: string }[],
): StudyEfficiency {
  if (practiceHistory.length === 0) {
    return {
      questionsPerHour: 0,
      accuracyTrend: [],
      optimalStudyTime: "18:00",
      fatiguePenalty: 0,
      recommendedSessionLength: 25,
    };
  }

  const totalTimeMs = practiceHistory.reduce((s, p) => s + p.timeMs, 0);
  const totalHours = totalTimeMs / 3600000;
  const questionsPerHour = totalHours > 0 ? Math.round(practiceHistory.length / totalHours) : 0;

  const recent = practiceHistory.slice(-7);
  const accuracyTrend = recent.map((p) => Math.round(p.accuracy));

  const avgTimeMs = totalTimeMs / practiceHistory.length;
  const fatiguePenalty = avgTimeMs > 60000 ? Math.min(15, Math.round((avgTimeMs - 60000) / 10000)) : 0;
  const recommendedSessionLength = fatiguePenalty > 10 ? 15 : fatiguePenalty > 5 ? 20 : 25;

  return {
    questionsPerHour,
    accuracyTrend,
    optimalStudyTime: "18:00",
    fatiguePenalty,
    recommendedSessionLength,
  };
}

// ---------------------------------------------------------------------------
// Mastery heatmap generation
// ---------------------------------------------------------------------------

export function generateMasteryHeatmap(
  subjectDomainScores: Record<string, Record<string, { mastery: number; count: number; lastDate: string | null }>>,
  previousSnapshot?: Record<string, Record<string, number>>,
): MasteryHeatmapCell[] {
  const cells: MasteryHeatmapCell[] = [];

  for (const [subjectId, domains] of Object.entries(subjectDomainScores)) {
    for (const [domain, data] of Object.entries(domains)) {
      const prevMastery = previousSnapshot?.[subjectId]?.[domain];
      let trend: MasteryHeatmapCell["trend"] = "stable";
      if (prevMastery != null) {
        if (data.mastery - prevMastery > 3) trend = "improving";
        else if (prevMastery - data.mastery > 3) trend = "declining";
      }

      cells.push({
        subjectId,
        domain,
        mastery: Math.round(data.mastery),
        questionsAttempted: data.count,
        trend,
        lastPracticed: data.lastDate,
      });
    }
  }

  return cells;
}
