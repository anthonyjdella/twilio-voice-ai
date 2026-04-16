"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
  const [mode, setModeState] = useState<AudienceMode>("builder");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "builder" || saved === "explorer") {
      setModeState(saved);
    } else {
      setNeedsOnboarding(true);
    }
  }, []);

  const setMode = (newMode: AudienceMode) => {
    setModeState(newMode);
    setNeedsOnboarding(false);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  return (
    <AudienceContext.Provider
      value={{
        mode,
        setMode,
        isBuilder: mode === "builder",
        isExplorer: mode === "explorer",
        needsOnboarding,
      }}
    >
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudienceMode(): AudienceContextValue {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudienceMode must be used within AudienceProvider");
  return ctx;
}
