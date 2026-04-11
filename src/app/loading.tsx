export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando...</p>
      </div>
    </main>
  );
}
