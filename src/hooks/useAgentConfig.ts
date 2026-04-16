"use client";

import { useProgressContext } from "@/components/layout/ProgressContext";

/** Generic workshop state hook — reads/writes to progress.workshopState */
export function useWorkshopState() {
  const { progress, updateWorkshopState } = useProgressContext();

  return {
    state: progress.workshopState,
    update: (partial: Record<string, string>) => updateWorkshopState(partial),
  };
}
