"use client";

import { useState } from "react";
import { GraduationCap, CreditCard, Check, Loader2, Shield } from "lucide-react";
import { t } from "@/lib/dele/translations";

/**
 * Subscription start page — Stripe checkout integration.
 * Redirects to Stripe Checkout for payment.
 */
export default function SuscripcionStartPage() {
  const [cadence, setCadence] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    // Redirect to Stripe checkout via Koydo billing
    const checkoutUrl = `https://koydo.app/billing/dele/start?cadence=${cadence}`;
    window.location.href = checkoutUrl;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <GraduationCap className="h-10 w-10 text-red-600" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t.pricing_premium_title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.pricing_premium_desc}
          </p>
        </div>

        {/* Cadence toggle */}
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setCadence("monthly")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              cadence === "monthly"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setCadence("annual")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              cadence === "annual"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Anual
            <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">-17%</span>
          </button>
        </div>

        {/* Price display */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {cadence === "monthly" ? "6,99\u20ac" : "5,83\u20ac"}
            </span>
            <span className="text-sm text-zinc-400">/mes</span>
          </div>
          {cadence === "annual" && (
            <p className="mt-1 text-xs text-zinc-500">Facturado como 69,99\u20ac/ano</p>
          )}
        </div>

        {/* Features list */}
        <ul className="mb-8 space-y-3">
          {t.pricing_features_premium.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-bold text-white shadow-lg transition hover:from-red-700 hover:to-rose-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {loading ? t.loading : t.pricing_premium_cta}
        </button>

        <p className="mt-3 text-center text-xs text-zinc-400">
          {t.pricing_free_trial}. Cancela en cualquier momento.
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <Shield className="h-3 w-3" />
          Pagos seguros con Stripe
        </div>
      </div>
    </main>
  );
}
