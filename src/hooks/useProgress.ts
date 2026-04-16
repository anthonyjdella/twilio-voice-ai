"use client";

import { useState, useCallback, useEffect } from "react";
import type { Progress } from "@/lib/types";
import { DEFAULT_PROGRESS } from "@/lib/types";
import workshopConfig from "@/workshop.config";

const STORAGE_KEY = `workshop-${workshopConfig.id}-progress`;

function loadProgress(): Progress {
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
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  const totalSteps = workshopConfig.chapters.reduce(
    (sum, ch) => sum + ch.steps.length,
    0
  );

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

  const updateWorkshopState = useCallback((partial: Record<string, string>) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        workshopState: { ...prev.workshopState, ...partial },
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
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  }, [progress.completedSteps, totalSteps]);

  return {
    progress,
    loaded,
    update,
    completeStep,
    isStepCompleted,
    earnBadge,
    updateWorkshopState,
    incrementCalls,
    completionPercentage,
  };
}
