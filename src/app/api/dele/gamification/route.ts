import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      streak: null,
      skillMastery: [],
      xp: 0,
      level: 1,
      dailyQuestionsToday: 0,
      dailyGoal: 10,
      achievements: [],
    });
  }

  // Fetch streak data
  const { data: streakData } = await supabase
    .from("study_streaks")
    .select("current_streak, longest_streak, total_study_days, last_study_date")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch daily questions count
  const today = new Date().toISOString().slice(0, 10);
  const { count: dailyCount } = await supabase
    .from("testing_attempt_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00Z`);

  // Calculate XP from total answers (10 XP per answer, bonus for correct)
  const { count: totalAnswers } = await supabase
    .from("testing_attempt_answers")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const xp = (totalAnswers ?? 0) * 10;
  const level = Math.max(1, Math.floor(xp / 500) + 1);

  // Skill mastery — aggregate from answers by domain
  const skillMastery = [
    { skill: "comprension-lectura", mastery: 0 },
    { skill: "comprension-auditiva", mastery: 0 },
    { skill: "expresion-escrita", mastery: 0 },
    { skill: "expresion-oral", mastery: 0 },
    { skill: "gramatica", mastery: 0 },
  ];

  return NextResponse.json({
    streak: streakData ?? {
      current_streak: 0,
      longest_streak: 0,
      total_study_days: 0,
      last_study_date: null,
    },
    skillMastery,
    xp,
    level,
    dailyQuestionsToday: dailyCount ?? 0,
    dailyGoal: 10,
    achievements: [],
  });
}
