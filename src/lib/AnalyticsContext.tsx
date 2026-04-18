"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

type AnalyticsContextType = ReturnType<typeof useAnalytics>;

const noopEmit = () => {};
const noopRef = { current: "" };
const NOOP_ANALYTICS: AnalyticsContextType = { emit: noopEmit, sessionId: noopRef };

const AnalyticsContext = createContext<AnalyticsContextType>(NOOP_ANALYTICS);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const analytics = useAnalytics();
  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  return useContext(AnalyticsContext);
}
