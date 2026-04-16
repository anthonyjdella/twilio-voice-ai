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
    // pendingBadge/pendingStep are ephemeral — never restore from storage
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw), pendingBadge: null, pendingStep: null };
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
    const stored = loadProgress();
    setProgress(stored);
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

  const completeStep = useCallback((chapterId: number, stepId: number, options?: { silent?: boolean }) => {
    const key = `chapter-${chapterId}:step-${stepId}`;
    const silent = options?.silent ?? false;
    setProgress((prev) => {
      if (prev.completedSteps.includes(key)) return prev;
      const newCompleted = [...prev.completedSteps, key];

      // Check if all steps in this chapter are now complete → earn badge
      const chapter = workshopConfig.chapters.find((c) => c.id === chapterId);
      const badgeId = `chapter-${chapterId}`;
      let newBadges = prev.badges;
      let newPendingBadge = prev.pendingBadge;

      if (chapter && !prev.badges.includes(badgeId)) {
        const allDone = chapter.steps.every((s) =>
          newCompleted.includes(`chapter-${chapterId}:step-${s.id}`)
        );
        if (allDone) {
          newBadges = [...prev.badges, badgeId];
          newPendingBadge = badgeId;
        }
      }

      const next = {
        ...prev,
        completedSteps: newCompleted,
        badges: newBadges,
        pendingBadge: newPendingBadge,
        // Silent completions skip the step toast, but chapter celebrations still fire
        pendingStep: (silent || newPendingBadge) ? null : key,
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

  const dismissBadge = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, pendingBadge: null };
      saveProgress(next);
      return next;
    });
  }, []);

  const dismissStep = useCallback(() => {
    setProgress((prev) => {
      if (!prev.pendingStep) return prev;
      return { ...prev, pendingStep: null };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
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
    dismissBadge,
    dismissStep,
    resetProgress,
    updateWorkshopState,
    incrementCalls,
    completionPercentage,
  };
}
