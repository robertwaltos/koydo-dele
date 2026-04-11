"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  X,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useTheme } from "@/app/dele-theme-provider";
import { useDELEDashboard } from "./DELEDashboardProvider";
import { t } from "@/lib/dele/translations";

/**
 * Persistent top navigation bar for DELE. Shows for authenticated users.
 * Falls back to hidden for unauthenticated visitors (no flash).
 */
export function DELENavBar() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setThemeMode } = useTheme();
  const dashboard = useDELEDashboard();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email, id: data.user.id } : null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email, id: session.user.id } : null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function toggleTheme() {
    setThemeMode(resolvedTheme === "dark" ? "light" : "dark");
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // Don't render for unauthenticated users
  if (!user) return null;

  const initials = (user.email ?? "U")[0].toUpperCase();
  const shouldShowPricingLink = !dashboard?.premiumActive;

  const quickLinks: Array<{ href: string; icon: typeof Home; label: string }> = [
    { href: "/", icon: Home, label: t.nav_inicio },
    { href: "/learn", icon: BookOpen, label: t.nav_aprender },
    { href: "/examen", icon: FileText, label: t.nav_examen },
    { href: "/resultados", icon: BarChart3, label: t.nav_progreso },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left -- Logo */}
          <a href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <GraduationCap className="h-6 w-6 text-red-600 dark:text-red-400" />
            <span className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              Koydo <span className="text-red-600 dark:text-red-400">DELE</span>
            </span>
          </a>

          {/* Center -- Quick links (desktop) */}
          <div className="hidden items-center gap-1 sm:flex">
            {quickLinks.map((link) => (
              <NavLink key={`${link.href}-${link.label}`} href={link.href} icon={link.icon} label={link.label} />
            ))}
            {shouldShowPricingLink && (
              <NavLink href="/precios" icon={CreditCard} label={t.nav_precios} />
            )}
          </div>

          {/* Right -- Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Cambiar tema"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Avatar + dropdown (desktop) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 transition hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
              >
                {initials}
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 truncate">
                      {user.email}
                    </div>
                    <hr className="my-1 border-zinc-100 dark:border-zinc-700" />
                    <DropdownItem href="/cuenta" icon={Settings} label={t.nav_cuenta} />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.auth_sign_out}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 sm:hidden dark:hover:bg-zinc-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-100 bg-white p-4 sm:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-1">
              {quickLinks.map((link) => (
                <MobileNavLink
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
              {shouldShowPricingLink && (
                <MobileNavLink href="/precios" icon={CreditCard} label={t.nav_precios} onClick={() => setMobileMenuOpen(false)} />
              )}
            </div>
            <hr className="my-3 border-zinc-100 dark:border-zinc-700" />
            <div className="space-y-1">
              <MobileNavLink href="/cuenta" icon={Settings} label={t.nav_cuenta} onClick={() => setMobileMenuOpen(false)} />
            </div>
            <hr className="my-3 border-zinc-100 dark:border-zinc-700" />
            <div className="flex items-center justify-between">
              <span className="truncate text-xs text-zinc-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t.auth_sign_out}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// --- Sub-components ---

function NavLink({ href, icon: Icon, label }: { href: string; icon: typeof Home; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function MobileNavLink({ href, icon: Icon, label, onClick }: { href: string; icon: typeof Home; label: string; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </a>
  );
}

function DropdownItem({ href, icon: Icon, label }: { href: string; icon: typeof User; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </a>
  );
}
