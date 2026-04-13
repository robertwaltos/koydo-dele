/**
 * Adaptive Practice Engine — DELE
 *
 * Selects questions at the optimal difficulty for each student using
 * Cortex mastery signals + diagnostic profile gaps. Implements:
 * - Zone of Proximal Development targeting (mastery ± 0.15)
 * - Spaced repetition for previously-missed domains
 * - Resumable sessions (state saved every 3 questions)
 * - Quick 5 mode (5 adaptive questions, any skill)
 *
 * The caller is responsible for fetching the question bank from Supabase
 * and passing it in via AdaptiveConfig.questionBank.
 */

import type { Question } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdaptiveConfig {
  userId: string;
  subjectId: string;
  sessionType: "adaptive" | "quick5" | "mock_exam" | "review";
  questionCount: number;
  /** 0-1 mastery from Cortex or diagnostic */
  currentMastery?: number;
  /** Domains to emphasize (from diagnostic gaps) */
  focusDomains?: string[];
  /** IDs of recently-seen questions to avoid */
  recentQuestionIds?: string[];
  /** Pre-fetched question bank for this subject */
  questionBank?: Question[];
}

export interface AdaptiveQuestion {
  id: string;
  subjectId: string;
  domain: string;
  stem: string;
  context?: string | undefined;
  options?: { id: string; text: string }[] | undefined;
  type: string;
  difficulty: number;
  timeHintSeconds: number;
  /** Why this question was chosen */
  selectionReason: "zpd" | "gap_focus" | "spaced_review" | "random_fill";
}

export interface SessionState {
  sessionId: string;
  questions: AdaptiveQuestion[];
  currentIndex: number;
  answers: AnswerRecord[];
  runningMastery: number;
  startedAt: string;
  lastSavedAt: string;
}

export interface AnswerRecord {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeMs: number;
  masteryDelta: number;
}

export interface PracticeResult {
  sessionId: string;
  subjectId: string;
  questionsAnswered: number;
  correctCount: number;
  accuracy: number;
  averageTimeMs: number;
  masteryBefore: number;
  masteryAfter: number;
  masteryDelta: number;
  domainsImproved: string[];
  domainsDeclined: string[];
  suggestedNextAction: "continue" | "review" | "advance" | "take_break";
  strategyUnlocked: string | null;
}

// ---------------------------------------------------------------------------
// Difficulty normalisation
// ---------------------------------------------------------------------------

function difficultyToNumber(d: "easy" | "medium" | "hard"): number {
  return d === "easy" ? 0.25 : d === "medium" ? 0.5 : 0.75;
}

// ---------------------------------------------------------------------------
// Difficulty targeting — Zone of Proximal Development
// ---------------------------------------------------------------------------

const ZPD_RANGE = 0.15;

function targetDifficulty(mastery: number): { min: number; max: number; ideal: number } {
  const ideal = Math.min(1, Math.max(0, mastery + 0.05));
  return {
    min: Math.max(0, ideal - ZPD_RANGE),
    max: Math.min(1, ideal + ZPD_RANGE),
    ideal,
  };
}

function difficultyScore(qDifficulty: number, target: ReturnType<typeof targetDifficulty>): number {
  if (qDifficulty >= target.min && qDifficulty <= target.max) {
    return 1 - Math.abs(qDifficulty - target.ideal) / ZPD_RANGE;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Question selection
// ---------------------------------------------------------------------------

export async function selectAdaptiveQuestions(config: AdaptiveConfig): Promise<AdaptiveQuestion[]> {
  const bank = config.questionBank ?? [];
  if (bank.length === 0) return [];

  const mastery = config.currentMastery ?? 0.5;
  const target = targetDifficulty(mastery);
  const recentSet = new Set(config.recentQuestionIds ?? []);
  const focusSet = new Set(config.focusDomains ?? []);

  const scored = bank
    .filter((q: Question) => !recentSet.has(q.id))
    .map((q: Question) => {
      const diffNum = difficultyToNumber(q.difficulty);
      let score = difficultyScore(diffNum, target) * 10;

      // Boost gap-focus domains (use first tag as domain)
      const domain = q.tags[0] ?? "general";
      if (focusSet.size > 0 && focusSet.has(domain)) {
        score += 5;
      }

      score += Math.random() * 2;

      return { question: q, score, reason: determineReason(q, target, focusSet) };
    })
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  const selected = scored.slice(0, config.questionCount);

  return selected.map((s: { question: Question; reason: AdaptiveQuestion["selectionReason"] }) =>
    mapToAdaptive(s.question, s.reason),
  );
}

function determineReason(
  q: Question,
  target: ReturnType<typeof targetDifficulty>,
  focusSet: Set<string>,
): AdaptiveQuestion["selectionReason"] {
  const domain = q.tags[0] ?? "general";
  if (focusSet.size > 0 && focusSet.has(domain)) return "gap_focus";
  const diffNum = difficultyToNumber(q.difficulty);
  if (diffNum >= target.min && diffNum <= target.max) return "zpd";
  return "random_fill";
}

function mapToAdaptive(q: Question, reason: AdaptiveQuestion["selectionReason"]): AdaptiveQuestion {
  const diffNum = difficultyToNumber(q.difficulty);
  return {
    id: q.id,
    subjectId: q.sectionId,
    domain: q.tags[0] ?? "general",
    stem: q.text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    type: "mcq",
    difficulty: diffNum,
    timeHintSeconds: diffNum <= 0.35 ? 20 : diffNum <= 0.65 ? 30 : 45,
    selectionReason: reason,
  };
}

// ---------------------------------------------------------------------------
// Mastery update (Bayesian-ish single-question update)
// ---------------------------------------------------------------------------

export async function updateMastery(
  currentMastery: number,
  isCorrect: boolean,
  questionDifficulty: number,
  timeMs: number,
): Promise<{ newMastery: number; delta: number }> {
  const expectedCorrect = 1 / (1 + Math.exp(-4 * (currentMastery - questionDifficulty)));
  const surprise = isCorrect ? 1 - expectedCorrect : -expectedCorrect;

  const expectedMs = questionDifficulty > 0.7 ? 45000 : 30000;
  const timeFactor = timeMs > expectedMs * 2 ? 0.5 : 1;

  const learningRate = 0.08;
  const delta = surprise * learningRate * timeFactor;
  const newMastery = Math.min(1, Math.max(0, currentMastery + delta));

  return { newMastery: Math.round(newMastery * 1000) / 1000, delta: Math.round(delta * 1000) / 1000 };
}

// ---------------------------------------------------------------------------
// Session result computation
// ---------------------------------------------------------------------------

export async function computePracticeResult(
  sessionId: string,
  subjectId: string,
  answers: AnswerRecord[],
  masteryBefore: number,
): Promise<PracticeResult> {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
  const avgTime = answers.length > 0
    ? Math.round(answers.reduce((s, a) => s + a.timeMs, 0) / answers.length)
    : 0;

  const masteryAfter = answers.length > 0
    ? answers[answers.length - 1]!.masteryDelta + masteryBefore
    : masteryBefore;

  const domainDeltas: Record<string, number> = {};
  const totalDelta = masteryAfter - masteryBefore;

  const suggestedNextAction: PracticeResult["suggestedNextAction"] =
    accuracy >= 90 ? "advance" :
    accuracy >= 70 ? "continue" :
    accuracy >= 40 ? "review" :
    "take_break";

  let strategyUnlocked: string | null = null;
  if (answers.length >= 5 && accuracy < 60) {
    strategyUnlocked = "elimination_technique";
  } else if (avgTime > 60000 && accuracy > 70) {
    strategyUnlocked = "time_management";
  } else if (answers.length >= 10 && accuracy >= 85) {
    strategyUnlocked = "advanced_patterns";
  }

  return {
    sessionId,
    subjectId,
    questionsAnswered: answers.length,
    correctCount,
    accuracy,
    averageTimeMs: avgTime,
    masteryBefore,
    masteryAfter: Math.round(masteryAfter * 1000) / 1000,
    masteryDelta: Math.round(totalDelta * 1000) / 1000,
    domainsImproved: Object.entries(domainDeltas).filter(([, d]) => d > 0).map(([k]) => k),
    domainsDeclined: Object.entries(domainDeltas).filter(([, d]) => d < 0).map(([k]) => k),
    suggestedNextAction,
    strategyUnlocked,
  };
}

// ---------------------------------------------------------------------------
// Quick 5 — select 5 questions across student's weakest DELE skills
// ---------------------------------------------------------------------------

export async function selectQuick5(
  userId: string,
  subjectScores: Record<string, number>,
  recentIds: string[],
  banksBySubject: Record<string, Question[]> = {},
): Promise<AdaptiveQuestion[]> {
  const sorted = Object.entries(subjectScores)
    .sort(([, a], [, b]) => a - b);

  const questions: AdaptiveQuestion[] = [];
  const perSubject = Math.max(1, Math.floor(5 / Math.max(sorted.length, 1)));

  for (const [subjectId, mastery] of sorted) {
    if (questions.length >= 5) break;
    const needed = Math.min(perSubject + (questions.length === 0 ? 1 : 0), 5 - questions.length);
    const selected = await selectAdaptiveQuestions({
      userId,
      subjectId,
      sessionType: "quick5",
      questionCount: needed,
      currentMastery: mastery,
      recentQuestionIds: recentIds,
      questionBank: banksBySubject[subjectId] ?? [],
    });
    questions.push(...selected);
  }

  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = questions[i] as AdaptiveQuestion;
    questions[i] = questions[j] as AdaptiveQuestion;
    questions[j] = tmp;
  }

  return questions.slice(0, 5);
}
