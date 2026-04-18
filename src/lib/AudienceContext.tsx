"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import workshopConfig from "@/workshop.config";
import { useAnalyticsContext } from "@/lib/AnalyticsContext";

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
  const { emit } = useAnalyticsContext();
  const [mode, setModeState] = useState<AudienceMode>("builder");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const hasEmittedSession = useRef(false);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-audience");
    if (attr === "builder" || attr === "explorer") {
      queueMicrotask(() => setModeState(attr));
      if (!hasEmittedSession.current) {
        hasEmittedSession.current = true;
        emit("session_started", { audience: attr });
      }
    } else {
      queueMicrotask(() => setNeedsOnboarding(true));
    }
  }, [emit]);

  const setMode = useCallback((newMode: AudienceMode) => {
    const oldMode = mode;
    setModeState(newMode);
    setNeedsOnboarding(false);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (err) {
      console.warn("[workshop] Could not persist audience mode", err);
    }
    document.documentElement.setAttribute("data-audience", newMode);
    if (!hasEmittedSession.current) {
      hasEmittedSession.current = true;
      emit("session_started", { audience: newMode });
    } else if (oldMode !== newMode) {
      emit("audience_changed", { from: oldMode, to: newMode });
    }
  }, [mode, emit]);

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
