"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { t } from "@/lib/dele/translations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/cuenta`,
    });
    if (resetError) {
      setError(t.error);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
          <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t.auth_check_email}
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            {t.auth_check_email_desc}
          </p>
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            {t.auth_return_to_login}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <GraduationCap className="h-10 w-10 text-red-600" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t.auth_reset_password}
          </h1>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t.auth_email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t.auth_reset_password}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/auth/sign-in" className="font-medium text-red-600 hover:text-red-700 dark:text-red-400">
            {t.auth_return_to_login}
          </Link>
        </p>
      </div>
    </main>
  );
}
