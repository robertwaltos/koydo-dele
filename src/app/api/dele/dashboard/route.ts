import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Wire to Supabase — parallel fetch dashboard payload
    console.warn("[DELE API] /api/dele/dashboard returning stub data — Supabase not wired");
    return NextResponse.json({
      examId: "EXAM023",
      slug: "dele",
      examName: "DELE",
      stats: { totalQuestions: 0, completedQuestions: 0, averageScore: 0 },
      recentAttempts: [],
    });
  } catch (error) {
    console.error("[DELE API] /api/dele/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
