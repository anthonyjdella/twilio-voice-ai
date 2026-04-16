"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useProgressContext } from "./ProgressContext";

/**
 * Lives in the workshop layout (persists across navigation).
 * When the user navigates away from any step that isn't completed yet,
 * silently marks it as complete. This catches skipped verify steps —
 * if they moved past it, they did the work and just forgot to click.
 */
export function ProgressTracker() {
  const params = useParams();
  const chapterSlug = params.chapter as string | undefined;
  const stepSlug = params.step as string | undefined;
  const { getStep } = useWorkshop();
  const { completeStep, isStepCompleted, loaded } = useProgressContext();

  const prevRef = useRef<{ chapterSlug?: string; stepSlug?: string }>({});

  useEffect(() => {
    if (!loaded) return;

    const prev = prevRef.current;

    // If the step changed, check if the PREVIOUS step was incomplete
    if (prev.chapterSlug && prev.stepSlug &&
        (prev.chapterSlug !== chapterSlug || prev.stepSlug !== stepSlug)) {
      const resolved = getStep(prev.chapterSlug, prev.stepSlug);
      if (resolved && !isStepCompleted(resolved.chapter.id, resolved.step.id)) {
        // Silent completion — no step toast, but chapter badge still fires
        completeStep(resolved.chapter.id, resolved.step.id, { silent: true });
      }
    }

    prevRef.current = { chapterSlug, stepSlug };
  }, [loaded, chapterSlug, stepSlug, getStep, completeStep, isStepCompleted]);

  return null;
}
