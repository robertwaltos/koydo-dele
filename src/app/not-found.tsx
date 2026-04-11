import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-6xl font-black text-zinc-200 dark:text-zinc-800">404</span>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Pagina no encontrada
        </h1>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          La pagina que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
