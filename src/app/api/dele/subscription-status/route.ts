import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Wire to Supabase auth + subscription check
    console.warn("[DELE API] /api/dele/subscription-status returning stub data — Supabase not wired");
    return NextResponse.json({
      isAuthenticated: false,
      active: false,
      premiumActive: false,
    });
  } catch (error) {
    console.error("[DELE API] /api/dele/subscription-status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
