import Link from "next/link";

export const metadata = { title: "Politica de privacidad" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
        &larr; Volver al inicio
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Politica de privacidad</h1>
      <div className="prose dark:prose-invert">
        <p>Koydo recopila los datos personales minimos necesarios para proporcionar servicios de preparacion para el examen DELE.</p>
        <h2>Datos que recopilamos</h2>
        <ul>
          <li>Informacion de la cuenta (correo electronico, nombre)</li>
          <li>Progreso de estudio y puntuaciones de examenes</li>
          <li>Analisis de dispositivo y uso</li>
        </ul>
        <h2>Como usamos los datos</h2>
        <p>Tus datos se utilizan exclusivamente para personalizar tu experiencia de estudio, seguir tu progreso y mejorar nuestro servicio.</p>
        <h2>Compartir datos</h2>
        <p>No vendemos tus datos personales. Solo compartimos datos con proveedores de servicios esenciales (Supabase para base de datos, Vercel para alojamiento).</p>
        <h2>Contacto</h2>
        <p>Para consultas de privacidad: privacy@koydo.app</p>
      </div>
    </main>
  );
}
