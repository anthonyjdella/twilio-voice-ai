"use client";

import { useState, useCallback } from "react";
import type { Progress, AgentConfig } from "@/lib/types";
import { DEFAULT_PROGRESS } from "@/lib/types";

const STORAGE_KEY = "twilio-voice-ai-progress";

function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return DEFAULT_PROGRESS;
    return loadProgress();
  });
  const loaded = typeof window !== "undefined";

  const update = useCallback((partial: Partial<Progress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...partial };
      saveProgress(next);
      return next;
    });
  }, []);

  const completeStep = useCallback((chapterId: number, stepId: number) => {
    const key = `chapter-${chapterId}:step-${stepId}`;
    setProgress((prev) => {
      if (prev.completedSteps.includes(key)) return prev;
      const next = {
        ...prev,
        completedSteps: [...prev.completedSteps, key],
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const isStepCompleted = useCallback(
    (chapterId: number, stepId: number) => {
      return progress.completedSteps.includes(`chapter-${chapterId}:step-${stepId}`);
    },
    [progress.completedSteps]
  );

  const earnBadge = useCallback((badgeId: string) => {
    setProgress((prev) => {
      if (prev.badges.includes(badgeId)) return prev;
      const next = { ...prev, badges: [...prev.badges, badgeId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const updateAgentConfig = useCallback((partial: Partial<AgentConfig>) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        agentConfig: { ...prev.agentConfig, ...partial },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const incrementCalls = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, callCount: prev.callCount + 1 };
      saveProgress(next);
      return next;
    });
  }, []);

  const completionPercentage = useCallback(() => {
    // Total steps across all chapters
    const totalSteps = 29; // 5+5+5+5+5+4
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }, [progress.completedSteps]);

  return {
    progress,
    loaded,
    update,
    completeStep,
    isStepCompleted,
    earnBadge,
    updateAgentConfig,
    incrementCalls,
    completionPercentage,
  };
}
