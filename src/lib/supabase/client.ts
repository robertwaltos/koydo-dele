import { createBrowserClient } from "@supabase/ssr";

// CRITICAL: NEXT_PUBLIC_* must be referenced directly as process.env.NEXT_PUBLIC_X
// so Next.js/Turbopack can inline them at build time.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Set these environment variables before running the app."
    );
  }

  const domain =
    typeof window !== "undefined" &&
    (window.location.hostname === "koydo.app" ||
      window.location.hostname.endsWith(".koydo.app"))
      ? ".koydo.app"
      : undefined;

  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    domain ? { cookieOptions: { domain } } : undefined,
  );
}
