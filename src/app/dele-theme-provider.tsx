"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";

const ThemeCtx = createContext<{
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}>({
  themeMode: "system",
  setThemeMode: () => {},
  resolvedTheme: "dark",
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export function DELEThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("koydo.dele.theme.mode") as ThemeMode | null;
    if (stored) setThemeMode(stored);
  }, []);

  useEffect(() => {
    let r: "light" | "dark";
    if (themeMode === "system") {
      r = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      r = themeMode;
    }
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
    localStorage.setItem("koydo.dele.theme.mode", themeMode);
  }, [themeMode]);

  return (
    <ThemeCtx.Provider value={{ themeMode, setThemeMode, resolvedTheme: resolved }}>
      {children}
    </ThemeCtx.Provider>
  );
}
