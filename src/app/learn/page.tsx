import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aprender — Practica DELE",
  description: "Estudia y practica para el DELE. Elige tu tema y comienza a prepararte.",
};

export default function LearnPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          &larr; Volver al inicio
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Centro de estudio DELE
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          Selecciona un tema o inicia una prueba de practica completa.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            Los modulos de estudio estaran disponibles pronto. Los agentes de contenido poblaran esta area con practica especifica por tema.
          </p>
        </div>
      </div>
    </main>
  );
}
