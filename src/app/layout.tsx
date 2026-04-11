import type { Metadata } from "next";
import { DELEThemeProvider } from "./dele-theme-provider";
import { DELENavBar } from "./_components/DELENavBar";
import { DELEDashboardProvider } from "./_components/DELEDashboardProvider";
import { DELEStudyPlayer } from "./_components/DELEStudyPlayer";
import "./globals.css";

const BASE_URL = "https://dele.koydo.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Koydo DELE",
    default: "DELE 2026 \u2014 Preparacion gratuita para el examen | Koydo",
  },
  description:
    "Preparate para el DELE 2026. Miles de preguntas de practica para todos los niveles CEFR (A1-C2). Examenes simulados, tutor IA y seguimiento de progreso. Gratis.",
  keywords: [
    "DELE",
    "examen DELE",
    "preparacion DELE",
    "espanol",
    "CEFR",
    "Instituto Cervantes",
    "practica DELE",
    "examen espanol",
    "aprender espanol",
    "koydo DELE",
  ],
  authors: [{ name: "Koydo", url: "https://koydo.app" }],
  creator: "Koydo",
  publisher: "Koydo",
  category: "education",
  alternates: {
    canonical: BASE_URL,
    languages: {
      "es-ES": BASE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "Koydo DELE",
    title: "DELE 2026 \u2014 Preparacion gratuita para el examen | Koydo",
    description:
      "Preparate para el DELE 2026. Preguntas de practica, examenes simulados y tutor IA para todos los niveles CEFR.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Koydo DELE \u2014 Preparate para el examen DELE 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@KoydoApp",
    creator: "@KoydoApp",
    title: "DELE 2026 \u2014 Preparacion gratuita para el examen | Koydo",
    description:
      "Practica el DELE online \u2014 preguntas, examenes simulados y seguimiento de progreso. Gratis.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${BASE_URL}/#organization`,
        name: "Koydo DELE",
        url: BASE_URL,
        logo: `${BASE_URL}/opengraph-image`,
        description:
          "Plataforma educativa para la preparacion del examen DELE con preguntas de practica y examenes simulados.",
        sameAs: ["https://koydo.app"],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Koydo DELE",
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: "es-ES",
      },
      {
        "@type": "Course",
        "@id": `${BASE_URL}/#course-dele-b2`,
        name: "Preparacion DELE B2",
        description:
          "Preguntas de practica y examenes simulados para el DELE nivel B2. Comprension lectora, auditiva, expresion escrita y oral.",
        provider: { "@id": `${BASE_URL}/#organization` },
        url: `${BASE_URL}/learn`,
        inLanguage: "es-ES",
        educationalLevel: "B2",
        teaches: "Espanol como lengua extranjera \u2014 nivel B2 avanzado",
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Es Koydo DELE gratuito?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Si \u2014 las sesiones de practica basicas y el seguimiento de puntuacion son gratuitos. Para acceso ilimitado, examenes simulados completos y tutor IA, esta disponible la suscripcion Premium.",
            },
          },
          {
            "@type": "Question",
            name: "Las preguntas siguen el formato real del DELE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Si. Todas las preguntas estan basadas en el formato de examen DELE del Instituto Cervantes, cubriendo los 6 niveles CEFR (A1-C2).",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#DC2626" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow-lg dark:focus:bg-zinc-900 dark:focus:text-white"
        >
          Ir al contenido
        </a>
        <DELEThemeProvider>
          <DELEDashboardProvider>
            <DELENavBar />
            {children}
            <DELEStudyPlayer />
          </DELEDashboardProvider>
        </DELEThemeProvider>
      </body>
    </html>
  );
}
