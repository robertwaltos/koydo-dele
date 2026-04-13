/**
 * Adaptive Diagnostic Engine for DELE
 *
 * Implements a 3-minute adaptive diagnostic that selects 8-12 questions
 * across compulsory DELE skills, scores them, classifies strengths/gaps and
 * learning style, and produces a diagnostic profile.
 *
 * The skill IDs follow the config.ts DELESkill type:
 * comprension-lectura | comprension-auditiva | expresion-escrita |
 * expresion-oral | gramatica
 */

import type { Question } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiagnosticConfig {
  /** DELE skills to test (compulsory skills always included) */
  selectedSubjects: string[];
  /** Target total question count (8-12) */
  targetQuestionCount?: number;
  /** Max time in seconds (default: 180 = 3 minutes) */
  maxTimeSeconds?: number;
}

export interface DiagnosticQuestion {
  id: string;
  subjectId: string;
  domain: string;
  stem: string;
  context?: string | undefined;
  options?: { id: string; text: string }[] | undefined;
  type: string;
  difficulty: number;
  /** Allocated time hint in seconds */
  timeHintSeconds: number;
}

export interface DiagnosticAnswer {
  questionId: string;
  answer: string | string[];
  timeMs: number;
}

export interface SubjectScore {
  correct: number;
  total: number;
  pct: number;
  avgTimeMs: number;
}

export interface DiagnosticResult {
  scores: Record<string, SubjectScore>;
  strengths: string[];
  gaps: string[];
  learningStyle: "visual" | "textual" | "practice" | "mixed";
  overallReadiness: number;
  totalTimeMs: number;
  questionCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMPULSORY_SUBJECTS = ["comprension-lectura", "comprension-auditiva", "gramatica"];
const DEFAULT_QUESTION_COUNT = 10;
const MIN_QUESTIONS = 8;
const MAX_QUESTIONS = 12;

/** Compulsory skills receive proportionally more diagnostic questions */
const COMPULSORY_WEIGHT = 2;
const EXTENDED_WEIGHT = 1;

const STRENGTH_THRESHOLD = 70;
const GAP_THRESHOLD = 50;

const DIFFICULTY_LEVELS = {
  easy: { min: 0, max: 0.35 },
  medium: { min: 0.35, max: 0.65 },
  hard: { min: 0.65, max: 1 },
};

// ---------------------------------------------------------------------------
// Difficulty normalisation: DELE Question.difficulty → 0-1 number
// ---------------------------------------------------------------------------

function difficultyToNumber(d: "easy" | "medium" | "hard"): number {
  return d === "easy" ? 0.25 : d === "medium" ? 0.5 : 0.75;
}

// ---------------------------------------------------------------------------
// Question Selection (Adaptive)
// ---------------------------------------------------------------------------

/**
 * Select diagnostic questions adaptively across DELE skills.
 * Ensures at least 1 question per compulsory skill; rest distributed.
 */
export async function selectDiagnosticQuestions(
  config: DiagnosticConfig,
  questionLoader: (subjectId: string) => Promise<Question[]>,
): Promise<DiagnosticQuestion[]> {
  const targetCount = Math.min(
    MAX_QUESTIONS,
    Math.max(MIN_QUESTIONS, config.targetQuestionCount ?? DEFAULT_QUESTION_COUNT),
  );

  const allSubjects = [
    ...new Set([...COMPULSORY_SUBJECTS, ...config.selectedSubjects]),
  ];

  const allocation = allocateQuestions(allSubjects, targetCount);
  const diagnosticQuestions: DiagnosticQuestion[] = [];

  for (const [subjectId, count] of Object.entries(allocation)) {
    const bank = await questionLoader(subjectId);
    if (bank.length === 0) continue;

    const selected = pickDiverseQuestions(bank, count);

    for (const q of selected) {
      const diffNum = difficultyToNumber(q.difficulty);
      diagnosticQuestions.push({
        id: q.id,
        subjectId: q.sectionId,
        domain: q.tags[0] ?? "general",
        stem: q.text,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        type: "mcq",
        difficulty: diffNum,
        timeHintSeconds: getTimeHint(diffNum),
      } satisfies DiagnosticQuestion);
    }
  }

  return shuffleArray(diagnosticQuestions);
}

function allocateQuestions(
  subjects: string[],
  totalTarget: number,
): Record<string, number> {
  const allocation: Record<string, number> = {};

  let totalWeight = 0;
  for (const s of subjects) {
    const w = COMPULSORY_SUBJECTS.includes(s) ? COMPULSORY_WEIGHT : EXTENDED_WEIGHT;
    totalWeight += w;
  }

  let remaining = totalTarget;
  for (const s of subjects) {
    const w = COMPULSORY_SUBJECTS.includes(s) ? COMPULSORY_WEIGHT : EXTENDED_WEIGHT;
    const count = Math.max(1, Math.round((w / totalWeight) * totalTarget));
    allocation[s] = count;
    remaining -= count;
  }

  if (remaining > 0) {
    for (const s of COMPULSORY_SUBJECTS) {
      if (remaining <= 0) break;
      const cur = allocation[s];
      if (cur != null) {
        allocation[s] = cur + 1;
        remaining--;
      }
    }
  }

  while (remaining < 0) {
    for (const s of subjects) {
      if (remaining >= 0) break;
      const cur = allocation[s];
      if (!COMPULSORY_SUBJECTS.includes(s) && cur != null && cur > 1) {
        allocation[s] = cur - 1;
        remaining++;
      }
    }
    if (remaining < 0) break;
  }

  return allocation;
}

function pickDiverseQuestions(bank: Question[], count: number): Question[] {
  if (bank.length <= count) return bank;

  const sorted = [...bank].sort(
    (a, b) => difficultyToNumber(a.difficulty) - difficultyToNumber(b.difficulty),
  );
  const result: Question[] = [];

  if (count >= 3) {
    const easyPool = sorted.filter(
      (q) => difficultyToNumber(q.difficulty) <= DIFFICULTY_LEVELS.easy.max,
    );
    const medPool = sorted.filter(
      (q) =>
        difficultyToNumber(q.difficulty) > DIFFICULTY_LEVELS.easy.max &&
        difficultyToNumber(q.difficulty) <= DIFFICULTY_LEVELS.medium.max,
    );
    const hardPool = sorted.filter(
      (q) => difficultyToNumber(q.difficulty) > DIFFICULTY_LEVELS.medium.max,
    );

    if (easyPool.length > 0) result.push(randomPick(easyPool));
    if (hardPool.length > 0) result.push(randomPick(hardPool));

    const medCount = count - result.length;
    const medPicked = randomPickN(
      medPool.length > 0 ? medPool : sorted,
      medCount,
      new Set(result.map((q) => q.id)),
    );
    result.push(...medPicked);
  } else {
    result.push(...randomPickN(sorted, count, new Set()));
  }

  return result.slice(0, count);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function scoreDiagnostic(
  questions: DiagnosticQuestion[],
  answers: DiagnosticAnswer[],
  originalQuestions: Question[],
): DiagnosticResult {
  const questionMap = new Map(originalQuestions.map((q) => [q.id, q]));
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const subjectScores: Record<string, { correct: number; total: number; timesMs: number[] }> = {};

  for (const dq of questions) {
    let ss = subjectScores[dq.subjectId];
    if (!ss) {
      ss = { correct: 0, total: 0, timesMs: [] };
      subjectScores[dq.subjectId] = ss;
    }
    ss.total++;

    const answer = answerMap.get(dq.id);
    const original = questionMap.get(dq.id);
    if (!answer || !original) continue;

    ss.timesMs.push(answer.timeMs);

    const isCorrect = checkAnswer(answer.answer, original.correctOptionId);
    if (isCorrect) ss.correct++;
  }

  const scores: Record<string, SubjectScore> = {};
  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalTimeMs = 0;

  for (const [subjectId, ssEntry] of Object.entries(subjectScores)) {
    const ss = ssEntry!;
    const pct = ss.total > 0 ? Math.round((ss.correct / ss.total) * 100) : 0;
    const avgTimeMs = ss.timesMs.length > 0
      ? Math.round(ss.timesMs.reduce((a, b) => a + b, 0) / ss.timesMs.length)
      : 0;
    scores[subjectId] = { correct: ss.correct, total: ss.total, pct, avgTimeMs };
    totalCorrect += ss.correct;
    totalQuestions += ss.total;
    totalTimeMs += ss.timesMs.reduce((a, b) => a + b, 0);
  }

  const strengths = Object.entries(scores)
    .filter(([, s]) => s.pct >= STRENGTH_THRESHOLD)
    .map(([id]) => id);
  const gaps = Object.entries(scores)
    .filter(([, s]) => s.pct < GAP_THRESHOLD)
    .map(([id]) => id);

  const learningStyle = inferLearningStyle(answers, questions);
  const overallReadiness = computeOverallReadiness(scores);

  return {
    scores,
    strengths,
    gaps,
    learningStyle,
    overallReadiness,
    totalTimeMs,
    questionCount: totalQuestions,
  };
}

// ---------------------------------------------------------------------------
// Learning Style Inference
// ---------------------------------------------------------------------------

function inferLearningStyle(
  answers: DiagnosticAnswer[],
  questions: DiagnosticQuestion[],
): "visual" | "textual" | "practice" | "mixed" {
  if (answers.length === 0) return "mixed";

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let fastCount = 0;
  let slowCount = 0;
  let contextUsed = 0;

  for (const a of answers) {
    const q = questionMap.get(a.questionId);
    if (!q) continue;

    const expectedMs = q.timeHintSeconds * 1000;
    if (a.timeMs < expectedMs * 0.6) fastCount++;
    if (a.timeMs > expectedMs * 1.4) slowCount++;
    if (q.context) contextUsed++;
  }

  const totalAnswered = answers.length;
  const fastRatio = fastCount / totalAnswered;
  const slowRatio = slowCount / totalAnswered;

  if (fastRatio > 0.5) return "practice";
  if (slowRatio > 0.4 && contextUsed > totalAnswered * 0.5) return "visual";
  if (slowRatio > 0.3) return "textual";

  return "mixed";
}

// ---------------------------------------------------------------------------
// Readiness Score
// ---------------------------------------------------------------------------

function computeOverallReadiness(scores: Record<string, SubjectScore>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [subjectId, score] of Object.entries(scores)) {
    const weight = COMPULSORY_SUBJECTS.includes(subjectId) ? 3 : 1;
    weightedSum += score.pct * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function checkAnswer(given: string | string[], correctOptionId: string): boolean {
  const normalize = (v: string) => String(v).trim().toLowerCase();
  const givenStr = Array.isArray(given) ? given[0] : given;
  return normalize(givenStr ?? "") === normalize(correctOptionId);
}

function getTimeHint(difficultyNum: number): number {
  if (difficultyNum <= 0.35) return 20;
  if (difficultyNum <= 0.65) return 30;
  return 45;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomPickN<T extends { id: string }>(
  arr: T[],
  n: number,
  exclude: Set<string>,
): T[] {
  const available = arr.filter((item) => !exclude.has(item.id));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, n);
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    [result[i], result[j]] = [result[j]!, tmp];
  }
  return result;
}
