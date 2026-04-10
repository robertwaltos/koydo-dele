import Link from "next/link";

export const metadata = { title: "Terminos de servicio" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
        &larr; Volver al inicio
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Terminos de servicio</h1>
      <div className="prose dark:prose-invert">
        <p>Al usar Koydo DELE Prep, aceptas estos terminos.</p>
        <h2>Descripcion del servicio</h2>
        <p>Koydo proporciona herramientas de preparacion para examenes, incluyendo preguntas de practica, examenes simulados y herramientas de estudio con IA. Esta aplicacion es una herramienta de estudio basada en programas y patrones de examen publicos. No esta afiliada a ninguna autoridad oficial de examenes.</p>
        <h2>Cuentas de usuario</h2>
        <p>Eres responsable de mantener la seguridad de las credenciales de tu cuenta.</p>
        <h2>Propiedad intelectual</h2>
        <p>Todo el contenido creado por Koydo es propiedad exclusiva. Las referencias a examenes se utilizan con fines educativos bajo uso justo.</p>
        <h2>Limitacion de responsabilidad</h2>
        <p>Koydo no garantiza resultados en examenes. Los resultados dependen del esfuerzo y preparacion individual.</p>
      </div>
    </main>
  );
}
