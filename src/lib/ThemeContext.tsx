"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import workshopConfig from "@/workshop.config";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const STORAGE_KEY = `workshop-${workshopConfig.id}-theme`;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  defaultTheme = "dark",
  children,
}: {
  defaultTheme?: Theme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Sync with localStorage on mount (the inline script already set data-theme
  // to prevent FOUC, so this just picks up the same value for React state)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        isLight: theme === "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
