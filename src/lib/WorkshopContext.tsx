"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { WorkshopConfig } from "./workshop-config";
import type { ChapterMeta } from "./types";
import workshopConfig from "@/workshop.config";

// ─── Context Value ──────────────────────────────────────────────────

interface WorkshopContextValue {
  config: WorkshopConfig;
  chapters: ChapterMeta[];
  getChapter: (slug: string) => ChapterMeta | undefined;
  getStep: (
    chapterSlug: string,
    stepSlug: string
  ) => { chapter: ChapterMeta; step: ChapterMeta["steps"][0] } | undefined;
  getAdjacentSteps: (
    chapterSlug: string,
    stepSlug: string
  ) => {
    prev: { chapter: ChapterMeta; step: ChapterMeta["steps"][0] } | null;
    next: { chapter: ChapterMeta; step: ChapterMeta["steps"][0] } | null;
    currentIndex: number;
    totalSteps: number;
  };
  totalSteps: number;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

// ─── Module-scope computation ───────────────────────────────────────
// Workshop config is a static import, so the context value is
// deterministic and can be built once per module load. Building it
// here (rather than inside the provider) avoids re-creating function
// identities on every render of any ancestor component.

const { chapters } = workshopConfig;

const allSteps = chapters.flatMap((chapter) =>
  chapter.steps.map((step) => ({ chapter, step }))
);

const totalSteps = allSteps.length;

function getChapter(slug: string) {
  return chapters.find((c) => c.slug === slug);
}

function getStep(chapterSlug: string, stepSlug: string) {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return undefined;
  const step = chapter.steps.find((s) => s.slug === stepSlug);
  if (!step) return undefined;
  return { chapter, step };
}

function getAdjacentSteps(chapterSlug: string, stepSlug: string) {
  const currentIndex = allSteps.findIndex(
    (s) => s.chapter.slug === chapterSlug && s.step.slug === stepSlug
  );
  return {
    prev: currentIndex > 0 ? allSteps[currentIndex - 1] : null,
    next: currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null,
    currentIndex,
    totalSteps,
  };
}

const contextValue: WorkshopContextValue = {
  config: workshopConfig,
  chapters,
  getChapter,
  getStep,
  getAdjacentSteps,
  totalSteps,
};

// ─── Provider ───────────────────────────────────────────────────────

export function WorkshopProvider({ children }: { children: ReactNode }) {
  return <WorkshopContext.Provider value={contextValue}>{children}</WorkshopContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useWorkshop() {
  const ctx = useContext(WorkshopContext);
  if (!ctx) {
    throw new Error("useWorkshop must be used within a WorkshopProvider");
  }
  return ctx;
}
