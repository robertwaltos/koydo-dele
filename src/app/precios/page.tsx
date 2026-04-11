import type { Metadata } from "next";
import { Check, Sparkles, ChevronDown } from "lucide-react";
import { t } from "@/lib/dele/translations";

export const metadata: Metadata = {
  title: "Precios \u2014 Koydo DELE",
  description:
    "Planes de precios de Koydo DELE. Cuenta gratuita o Premium por 6,99\u20ac al mes con acceso ilimitado, tutor IA y examenes simulados.",
};

export default function PreciosPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {t.pricing_title}
        </h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          {t.pricing_subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Free tier */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t.pricing_free_title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t.pricing_free_desc}
          </p>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {t.pricing_free_price}
            </span>
            <span className="text-sm text-zinc-400">{t.pricing_per_month}</span>
          </div>

          <ul className="mt-8 flex-1 space-y-3">
            {t.pricing_features_free.map((feature) => (
              <FeatureItem key={feature}>{feature}</FeatureItem>
            ))}
          </ul>

          <a
            href="/auth/sign-up"
            className="mt-8 block rounded-xl border border-zinc-300 bg-white px-6 py-3 text-center text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {t.pricing_free_cta}
          </a>
        </div>

        {/* Premium tier */}
        <div className="relative flex flex-col rounded-2xl border-2 border-red-200 bg-gradient-to-br from-white via-white to-red-50/40 p-8 dark:border-red-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-red-950/20">
          <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
            <Sparkles className="h-3 w-3" />
            {t.pricing_popular}
          </span>

          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t.pricing_premium_title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t.pricing_premium_desc}
          </p>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {t.pricing_premium_price}
            </span>
            <span className="text-sm text-zinc-400">{t.pricing_per_month}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">{t.pricing_annual_note}</p>

          <ul className="mt-8 flex-1 space-y-3">
            {t.pricing_features_premium.map((feature) => (
              <FeatureItem key={feature}>{feature}</FeatureItem>
            ))}
          </ul>

          <a
            href="/suscripcion/start"
            className="mt-8 block rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:from-red-700 hover:to-rose-700"
          >
            {t.pricing_premium_cta}
          </a>
          <p className="mt-2 text-center text-xs text-zinc-400">{t.pricing_free_trial}</p>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {t.faq_title}
        </h2>
        <div className="mx-auto max-w-2xl divide-y divide-zinc-200 dark:divide-zinc-800">
          {t.faq_items.map((item) => (
            <details
              key={item.q}
              className="group py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      {children}
    </li>
  );
}
