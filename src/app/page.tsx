import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Koydo DELE — Preparacion gratuita para el examen",
  description: "Preparacion integral para el DELE. Pruebas de practica, tutor IA, seguimiento de puntuacion. Esta aplicacion es una herramienta de estudio basada en programas y patrones de examen publicos. No esta afiliada a ninguna autoridad oficial de examenes.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Prepara el DELE con Koydo
          </h1>
          <p className="mb-8 text-lg text-white/90 sm:text-xl">
            Preguntas de practica · Tutor IA · Prediccion de puntuacion
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/learn"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
            >
              Practicar gratis
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Por que Koydo para el DELE?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Pruebas de practica", desc: "Cientos de preguntas que coinciden con el formato real del DELE." },
            { title: "Tutor IA", desc: "Obtiene explicaciones instantaneas y recomendaciones de estudio personalizadas." },
            { title: "Prediccion de puntuacion", desc: "Sigue tu progreso y predice tu puntuacion con analisis de IA." },
            { title: "Estudia en cualquier lugar", desc: "Optimizado para movil, estudia en cualquier momento, incluso sin conexion." },
            { title: "Aprendizaje adaptativo", desc: "Centrate en tus areas mas debiles con seleccion inteligente de preguntas." },
            { title: "Gratis para empezar", desc: "10 preguntas gratis cada dia. Mejora para acceso ilimitado." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs text-zinc-500">
            Esta aplicacion es una herramienta de estudio basada en programas de estudio y patrones de examen disponibles publicamente. No esta afiliada a ninguna autoridad oficial de examenes.
          </p>
          <nav className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">Privacidad</Link>
            <Link href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">Terminos</Link>
          </nav>
          <p className="mt-2 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Koydo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
