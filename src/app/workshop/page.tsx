"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import workshopConfig from "@/workshop.config";
import { PROGRESS_SCHEMA_VERSION } from "@/lib/types";
import { countValidCompleted, totalStepCount } from "@/lib/progress-math";

const STORAGE_KEY = `workshop-${workshopConfig.id}-progress`;

/**
 * Resume entry point. If the learner has progress stored, jump them to the
 * first *incomplete* step. Otherwise start at step 1 of chapter 1. Done
 * client-side because progress lives in localStorage; SSR redirect can't see
 * it. Fallback-safe: if parsing fails or nothing is stored, we still land on
 * the first step with zero jank.
 */
export default function WorkshopIndex() {
  const router = useRouter();

  useEffect(() => {
    const first = workshopConfig.chapters[0];
    const firstHref = `/workshop/${first.slug}/${first.steps[0].slug}`;

    let target = firstHref;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.schemaVersion === PROGRESS_SCHEMA_VERSION &&
          Array.isArray(parsed.completedSteps)
        ) {
          const completed = new Set<string>(parsed.completedSteps);
          // Walk chapters → steps in order; first one not in `completed` wins.
          outer: for (const chapter of workshopConfig.chapters) {
            for (const step of chapter.steps) {
              const key = `chapter-${chapter.id}:step-${step.id}`;
              if (!completed.has(key)) {
                target = `/workshop/${chapter.slug}/${step.slug}`;
                break outer;
              }
            }
          }
          // If every step is complete, send them to the celebration page.
          // Filter through live config so stale keys from a prior step list
          // don't trick us into a false "all done".
          if (target === firstHref && completed.size > 0) {
            const totalSteps = totalStepCount(workshopConfig.chapters);
            const validDone = countValidCompleted(
              parsed.completedSteps,
              workshopConfig.chapters,
            );
            if (validDone >= totalSteps) target = "/workshop/complete";
          }
        }
      }
    } catch {
      // corrupt/unavailable storage → land on first step
    }
    router.replace(target);
  }, [router]);

  // Render a subtle loading shim instead of `null`. On a cold visit the
  // redirect is near-instant, but slow devices / spotty networks can show a
  // blank screen for a beat — the shim keeps the shell visually stable.
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div
        className="flex items-center gap-3 text-text-muted"
        role="status"
        aria-live="polite"
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-twilio-red/30 border-t-twilio-red animate-spin"
          aria-hidden="true"
        />
        <span className="text-sm font-mono">Loading workshop…</span>
      </div>
    </div>
  );
}
