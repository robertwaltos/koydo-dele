import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Precios — DELE Premium",
  description: "Desbloquea practica ilimitada del DELE con Koydo Premium.",
};

export default function PricingPage() {
  const checkoutUrl = `https://koydo.app/pricing?exam=dele&cadence=annual`;

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
        >
          &larr; Volver al inicio
        </Link>
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          DELE Premium
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Plan gratuito: 10 preguntas al dia. Premium: todo ilimitado.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="mb-2 text-lg font-semibold">Gratuito</h3>
            <p className="mb-4 text-3xl font-bold">0&euro;</p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>&#10003; 10 preguntas al dia</li>
              <li>&#10003; Seguimiento de puntuacion</li>
              <li>&#10007; Tutor IA</li>
              <li>&#10007; Examenes simulados completos</li>
            </ul>
            <span className="inline-block rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Plan actual
            </span>
          </div>
          <div className="rounded-xl border-2 border-amber-500 p-6 dark:border-amber-400">
            <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              RECOMENDADO
            </div>
            <h3 className="mb-2 text-lg font-semibold">Premium</h3>
            <p className="mb-1 text-3xl font-bold">
              6,99&euro;<span className="text-base font-normal text-zinc-500">/mes</span>
            </p>
            <p className="mb-4 text-xs text-zinc-500">facturado anualmente a 69,99&euro;/ano</p>
            <ul className="mb-6 space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <li>&#10003; Preguntas ilimitadas</li>
              <li>&#10003; Tutor IA y explicaciones</li>
              <li>&#10003; Examenes simulados completos</li>
              <li>&#10003; Prediccion de puntuacion</li>
              <li>&#10003; Acceso sin conexion</li>
            </ul>
            <a
              href={checkoutUrl}
              className="inline-block w-full rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              Comenzar prueba gratuita &rarr;
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
          7 dias de prueba gratuita. Cancela en cualquier momento. Pagos seguros con Stripe.
        </p>
      </div>
    </main>
  );
}
