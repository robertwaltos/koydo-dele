import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Precios — DELE Premium",
  description: "Desbloquea practica ilimitada para el DELE con Koydo Premium.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
          &larr; Volver al inicio
        </Link>
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          DELE Premium
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Gratis: 10 preguntas/dia. Premium: todo ilimitado.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="mb-2 text-lg font-semibold">Gratis</h3>
            <p className="mb-4 text-3xl font-bold">$0</p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>&#10003; 10 preguntas por dia</li>
              <li>&#10003; Seguimiento de puntuacion</li>
              <li>&#10007; Tutor IA</li>
              <li>&#10007; Examenes simulados completos</li>
            </ul>
            <Link
              href="/learn"
              className="inline-block w-full rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Comenzar gratis
            </Link>
          </div>
          <div className="rounded-xl border-2 border-[var(--accent)] p-6">
            <h3 className="mb-2 text-lg font-semibold">Premium</h3>
            <p className="mb-4 text-3xl font-bold">$9.99<span className="text-base font-normal text-zinc-500">/mes</span></p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>&#10003; Preguntas ilimitadas</li>
              <li>&#10003; Tutor IA y explicaciones</li>
              <li>&#10003; Examenes simulados completos</li>
              <li>&#10003; Prediccion de puntuacion</li>
            </ul>
            <Link
              href="/learn"
              className="inline-block w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-dark)]"
            >
              Mejorar a Premium
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
