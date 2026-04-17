"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import workshopConfig from "@/workshop.config";

export type AudienceMode = "builder" | "explorer";

interface AudienceContextValue {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
  isBuilder: boolean;
  isExplorer: boolean;
  needsOnboarding: boolean;
}

const STORAGE_KEY = `workshop-${workshopConfig.id}-audience-mode`;

const AudienceContext = createContext<AudienceContextValue | null>(null);

export function AudienceProvider({ children }: { children: ReactNode }) {
  // SSR and first client render must match, so we initialize to the default
  // ("builder"). The inline AudienceScript has already set `data-audience` on
  // <html> from localStorage before paint; CSS selectors on that attribute
  // prevent FOUC for block visibility. React state syncs in the effect below.
  const [mode, setModeState] = useState<AudienceMode>("builder");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Trust the attribute the inline script set — it read the same localStorage
    // key, but synchronously before hydration. Reading the attribute avoids a
    // second localStorage hit and keeps the two sources of truth aligned.
    const attr = document.documentElement.getAttribute("data-audience");
    if (attr === "builder" || attr === "explorer") {
      setModeState(attr);
    } else {
      setNeedsOnboarding(true);
    }
  }, []);

  const setMode = useCallback((newMode: AudienceMode) => {
    setModeState(newMode);
    setNeedsOnboarding(false);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (err) {
      console.warn("[workshop] Could not persist audience mode", err);
    }
    document.documentElement.setAttribute("data-audience", newMode);
  }, []);

  const value = useMemo<AudienceContextValue>(
    () => ({
      mode,
      setMode,
      isBuilder: mode === "builder",
      isExplorer: mode === "explorer",
      needsOnboarding,
    }),
    [mode, setMode, needsOnboarding],
  );

  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudienceMode(): AudienceContextValue {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudienceMode must be used within AudienceProvider");
  return ctx;
}
