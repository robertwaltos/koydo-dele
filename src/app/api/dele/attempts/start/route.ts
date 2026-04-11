import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EXAM_ID = "dele";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { level, skill, questionCount } = body;

  const { data: attempt, error } = await supabase
    .from("testing_exam_attempts")
    .insert({
      user_id: user.id,
      exam_id: EXAM_ID,
      max_score: questionCount ?? 30,
      metadata: { level, skill },
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attemptId: attempt.id });
}
