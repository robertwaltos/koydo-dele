import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://dele.koydo.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Koydo DELE",
    default: "Koydo DELE — Exam Prep",
  },
  description: "Preparacion para el examen DELE. Preguntas de practica, examenes simulados y herramientas de estudio con IA. Esta aplicacion es una herramienta de estudio. No esta afiliada a ninguna autoridad oficial de examenes.",
  authors: [{ name: "Koydo", url: "https://koydo.app" }],
  creator: "Koydo",
  publisher: "Koydo",
  category: "education",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
