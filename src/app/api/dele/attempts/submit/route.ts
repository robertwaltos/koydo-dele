import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { attemptId, score, totalQuestions, answers } = body;

  // Update attempt with score
  const { error: updateError } = await supabase
    .from("testing_exam_attempts")
    .update({
      score,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Insert individual answers for analytics
  if (Array.isArray(answers) && answers.length > 0) {
    const answerRows = answers.map((a: { questionId: string; selectedIndex: number; correct: boolean; timeMs?: number }) => ({
      user_id: user.id,
      attempt_id: attemptId,
      question_id: a.questionId,
      answer: String(a.selectedIndex),
      is_correct: a.correct,
      time_spent_ms: a.timeMs ?? 0,
    }));

    await supabase
      .from("testing_attempt_answers")
      .insert(answerRows);
  }

  // Update study streak
  const today = new Date().toISOString().slice(0, 10);
  const { data: streakData } = await supabase
    .from("study_streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (streakData) {
    const lastDate = streakData.last_study_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak = streakData.current_streak;

    if (lastDate === today) {
      // Already studied today, no change
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await supabase
      .from("study_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streakData.longest_streak),
        total_study_days: streakData.total_study_days + (lastDate !== today ? 1 : 0),
        last_study_date: today,
      })
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("study_streaks")
      .insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        total_study_days: 1,
        last_study_date: today,
      });
  }

  return NextResponse.json({ success: true, score });
}
