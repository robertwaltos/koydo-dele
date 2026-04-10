import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Pagina no encontrada</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">La pagina que buscas no existe o ha sido movida.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
