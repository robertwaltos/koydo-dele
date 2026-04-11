"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[DELE Error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Algo salio mal
        </h1>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Ha ocurrido un error inesperado. Por favor, intentalo de nuevo.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400">Referencia: {error.digest}</p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
