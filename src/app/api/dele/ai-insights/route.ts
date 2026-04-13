import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  generateWeeklyInsights,
  predictScores,
  computeStudyEfficiency,
  generateMasteryHeatmap,
} from "@/lib/dele/ai-insights";
import type { DELELevel } from "@/lib/dele/config";

const EXAM_ID = "dele";

// ---------------------------------------------------------------------------
// GET /api/dele/ai-insights
// Returns AI-generated insights, predicted DELE levels, efficiency metrics,
// and a mastery heatmap for the authenticated user.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const targetLevel = (url.searchParams.get("targetLevel") ?? "B2") as DELELevel;

  // Fetch recent attempt answers for practice history
  const { data: answers } = await supabase
    .from("testing_attempt_answers")
    .select("question_id, is_correct, time_spent_ms, created_at, subject_id, domain")
    .eq("user_id", user.id)
    .eq("exam_id", EXAM_ID)
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch completed attempts for per-subject scores
  const { data: attempts } = await supabase
    .from("testing_exam_attempts")
    .select("id, score, max_score, completed_at, metadata")
    .eq("user_id", user.id)
    .eq("exam_id", EXAM_ID)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(50);

  // Fetch gamification state for streak
  const { data: gamification } = await supabase
    .from("gamification_states")
    .select("streak_days")
    .eq("user_id", user.id)
    .single();

  const streakDays = (gamification as { streak_days?: number } | null)?.streak_days ?? 0;

  // Build diagnostic scores from attempt history (avg accuracy per subject)
  const subjectTotals: Record<string, { correct: number; total: number }> = {};
  for (const a of answers ?? []) {
    const sid = (a as Record<string, unknown>)["subject_id"] as string | null ?? "unknown";
    if (!subjectTotals[sid]) subjectTotals[sid] = { correct: 0, total: 0 };
    subjectTotals[sid]!.total++;
    if ((a as Record<string, unknown>)["is_correct"]) subjectTotals[sid]!.correct++;
  }

  const diagnosticScores: Record<string, number> = {};
  for (const [sid, totals] of Object.entries(subjectTotals)) {
    diagnosticScores[sid] = totals.total > 0
      ? Math.round((totals.correct / totals.total) * 100)
      : 0;
  }

  // Build practice history
  const practiceHistory = (answers ?? []).map((a) => {
    const row = a as Record<string, unknown>;
    return {
      subjectId: (row["subject_id"] as string | null) ?? "unknown",
      accuracy: row["is_correct"] ? 100 : 0,
      timeMs: (row["time_spent_ms"] as number | null) ?? 0,
      date: (row["created_at"] as string | null) ?? new Date().toISOString(),
    };
  });

  // Roadmap completion — derive from answered vs total available questions
  const { count: totalAvailable } = await supabase
    .from("testing_question_bank")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", EXAM_ID);

  const answeredCount = answers?.length ?? 0;
  const roadmapPct = totalAvailable && totalAvailable > 0
    ? Math.min(100, (answeredCount / totalAvailable) * 100)
    : 0;

  // Build subject/domain heatmap data
  const domainMap: Record<string, Record<string, { mastery: number; count: number; lastDate: string | null }>> = {};
  for (const a of answers ?? []) {
    const row = a as Record<string, unknown>;
    const sid = (row["subject_id"] as string | null) ?? "unknown";
    const domain = (row["domain"] as string | null) ?? "general";
    if (!domainMap[sid]) domainMap[sid] = {};
    if (!domainMap[sid]![domain]) {
      domainMap[sid]![domain] = { mastery: 0, count: 0, lastDate: null };
    }
    const cell = domainMap[sid]![domain]!;
    cell.count++;
    cell.mastery = ((cell.mastery * (cell.count - 1)) + (row["is_correct"] ? 100 : 0)) / cell.count;
    if (!cell.lastDate || (row["created_at"] as string) > cell.lastDate) {
      cell.lastDate = row["created_at"] as string;
    }
  }

  const insights = generateWeeklyInsights(
    diagnosticScores,
    practiceHistory,
    streakDays,
    roadmapPct,
    targetLevel,
  );

  const predictions = predictScores(diagnosticScores, practiceHistory, targetLevel);
  const efficiency = computeStudyEfficiency(practiceHistory);
  const heatmap = generateMasteryHeatmap(domainMap);

  return NextResponse.json({
    insights,
    predictions,
    efficiency,
    heatmap,
    meta: {
      targetLevel,
      diagnosticScores,
      streakDays,
      roadmapPct: Math.round(roadmapPct),
    },
  });
}
