import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Auth-gated question fetch from Supabase
    console.warn("[DELE API] /api/dele/questions returning stub data — Supabase not wired");
    return NextResponse.json({
      examId: "EXAM023",
      questions: [],
      dailyLimit: 10,
      remaining: 10,
    });
  } catch (error) {
    console.error("[DELE API] /api/dele/questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
