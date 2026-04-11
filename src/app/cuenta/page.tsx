"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Bell,
  Shield,
  Trash2,
  LogOut,
  ChevronRight,
  Loader2,
  Check,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { t } from "@/lib/dele/translations";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Profile {
  display_name: string;
  email: string;
}

interface Subscription {
  status: string;
  product_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function CuentaPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/auth/sign-in?returnTo=/cuenta";
        return;
      }
      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile({
        display_name: profileData?.display_name ?? user.email?.split("@")[0] ?? "Estudiante",
        email: user.email ?? "",
      });

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, product_id, current_period_end, cancel_at_period_end")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setSubscription(sub ?? null);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const handleSaveName = useCallback(async () => {
    if (!newName.trim() || !userId) return;
    setSavingName(true);
    await supabase
      .from("user_profiles")
      .update({ display_name: newName.trim() })
      .eq("user_id", userId);
    setProfile((p) => p ? { ...p, display_name: newName.trim() } : p);
    setSavingName(false);
    setNameSaved(true);
    setEditingName(false);
    setTimeout(() => setNameSaved(false), 2000);
  }, [newName, userId, supabase]);

  const handleChangeEmail = useCallback(async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    setEmailSent(true);
    setEditingEmail(false);
  }, [newEmail, supabase]);

  const handleResetPassword = useCallback(async () => {
    if (!profile?.email) return;
    setChangingPassword(true);
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/cuenta`,
    });
    setChangingPassword(false);
    setPasswordSent(true);
  }, [profile?.email, supabase]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!profile) return null;

  const planLabel = subscription
    ? subscription.product_id?.includes("dele") ? t.cuenta_premium_plan : "Premium"
    : t.cuenta_free_plan;

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.cuenta_back}
      </button>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-xl font-bold text-white shadow-lg">
          {profile.display_name[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{profile.display_name}</h1>
          <p className="text-sm text-zinc-400">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Display Name */}
        <SettingsSection>
          {editingName ? (
            <div className="flex items-center gap-2 px-4 py-3">
              <User className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder={t.cuenta_new_name}
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <button onClick={handleSaveName} disabled={savingName} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : t.save}
              </button>
              <button onClick={() => setEditingName(false)} className="text-sm text-zinc-400 hover:text-zinc-600">{t.cancel}</button>
            </div>
          ) : (
            <SettingsRow
              icon={User}
              label={t.cuenta_display_name}
              value={profile.display_name}
              action={nameSaved ? <Check className="h-4 w-4 text-emerald-500" /> : <ChevronRight className="h-4 w-4 text-zinc-300" />}
              onClick={() => { setNewName(profile.display_name); setEditingName(true); }}
            />
          )}
        </SettingsSection>

        {/* Email */}
        <SettingsSection>
          {editingEmail ? (
            <div className="flex items-center gap-2 px-4 py-3">
              <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                autoFocus
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChangeEmail()}
                placeholder={t.cuenta_new_email}
                className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <button onClick={handleChangeEmail} disabled={savingEmail} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : t.edit}
              </button>
              <button onClick={() => setEditingEmail(false)} className="text-sm text-zinc-400 hover:text-zinc-600">{t.cancel}</button>
            </div>
          ) : (
            <SettingsRow
              icon={Mail}
              label={t.cuenta_email}
              value={emailSent ? t.cuenta_verification_sent : profile.email}
              action={emailSent ? <Check className="h-4 w-4 text-emerald-500" /> : <ChevronRight className="h-4 w-4 text-zinc-300" />}
              onClick={() => { setNewEmail(""); setEditingEmail(true); }}
            />
          )}
        </SettingsSection>

        {/* Password */}
        <SettingsSection>
          <SettingsRow
            icon={Lock}
            label={t.cuenta_password}
            value={passwordSent ? t.cuenta_password_reset_sent : t.cuenta_change_password}
            action={
              changingPassword ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> :
              passwordSent ? <Check className="h-4 w-4 text-emerald-500" /> :
              <ChevronRight className="h-4 w-4 text-zinc-300" />
            }
            onClick={handleResetPassword}
          />
        </SettingsSection>

        {/* Subscription */}
        <SettingsSection>
          <div className="flex items-center gap-3 px-4 py-3">
            <CreditCard className="h-4 w-4 shrink-0 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{planLabel}</p>
              {subscription ? (
                <p className="text-xs text-zinc-400">
                  {subscription.cancel_at_period_end
                    ? `${t.cuenta_cancelled} ${periodEnd}`
                    : `${t.cuenta_renews} ${periodEnd}`}
                </p>
              ) : (
                <p className="text-xs text-zinc-400">{t.cuenta_free_desc}</p>
              )}
            </div>
            {!subscription && (
              <a
                href="/suscripcion/start"
                className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:from-red-600 hover:to-rose-600"
              >
                {t.cuenta_upgrade}
              </a>
            )}
          </div>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection>
          <SettingsRow
            icon={Shield}
            label={t.cuenta_privacy}
            value={t.cuenta_privacy_desc}
            action={<ChevronRight className="h-4 w-4 text-zinc-300" />}
            onClick={() => router.push("/privacy")}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection>
          <SettingsRow
            icon={Bell}
            label={t.cuenta_notifications}
            value={t.cuenta_notifications_desc}
            action={<ChevronRight className="h-4 w-4 text-zinc-300" />}
            onClick={() => {}}
          />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            {t.cuenta_logout}
          </button>
        </SettingsSection>

        {/* Delete Account */}
        <SettingsSection>
          {showDeleteConfirm ? (
            <div className="px-4 py-3">
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                {t.cuenta_delete_confirm}
              </p>
              <div className="flex gap-2">
                <a
                  href="mailto:support@koydo.app?subject=Solicitud de eliminacion de cuenta DELE"
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  {t.cuenta_delete_contact}
                </a>
                <button onClick={() => setShowDeleteConfirm(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <SettingsRow
              icon={Trash2}
              label={t.cuenta_delete}
              value={t.cuenta_delete_desc}
              action={<ChevronRight className="h-4 w-4 text-zinc-300" />}
              onClick={() => setShowDeleteConfirm(true)}
              danger
            />
          )}
        </SettingsSection>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-300 dark:text-zinc-600">
        <GraduationCap className="h-3.5 w-3.5" />
        {t.app_name}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SettingsSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {children}
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  action,
  onClick,
  danger,
}: {
  icon: typeof User;
  label: string;
  value: string;
  action: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${danger ? "text-red-600 dark:text-red-400" : ""}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${danger ? "text-red-400" : "text-zinc-400"}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "" : "text-zinc-800 dark:text-zinc-100"}`}>{label}</p>
        <p className={`truncate text-xs ${danger ? "text-red-400/70" : "text-zinc-400"}`}>{value}</p>
      </div>
      {action}
    </button>
  );
}
