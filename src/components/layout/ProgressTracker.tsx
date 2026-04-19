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
 *
 * Guard against skip-ahead leaks: if the step they just left was *past* the
 * natural progression point (i.e., more than one position beyond their
 * furthest completed step), they either deep-linked or used the chapter-dots
 * to jump ahead. Silently completing those defeats the skip-ahead gate in
 * StepContent — don't auto-complete a step the learner only "visited" but
 * never unlocked through the modal flow.
 */
export function ProgressTracker() {
  const params = useParams();
  const chapterSlug = params.chapter as string | undefined;
  const stepSlug = params.step as string | undefined;
  const { getStep, chapters } = useWorkshop();
  const { completeStep, isStepCompleted, loaded, completedStepsSet } =
    useProgressContext();

  const prevRef = useRef<{ chapterSlug?: string; stepSlug?: string }>({});

  useEffect(() => {
    if (!loaded) return;

    const prev = prevRef.current;

    // If the step changed, check if the PREVIOUS step was incomplete
    if (prev.chapterSlug && prev.stepSlug &&
        (prev.chapterSlug !== chapterSlug || prev.stepSlug !== stepSlug)) {
      const resolved = getStep(prev.chapterSlug, prev.stepSlug);
      if (resolved && !isStepCompleted(resolved.chapter.id, resolved.step.id)) {
        // Build flat step order, figure out position of the step we're
        // leaving, and compute the furthest position the learner has
        // actually completed. If we're leaving a position more than one
        // past the furthest-completed, it was a skip-ahead visit — don't
        // silently count it as done.
        let leavingPos = -1;
        let maxCompletedPos = -1;
        let pos = 0;
        for (const c of chapters) {
          for (const s of c.steps) {
            if (
              c.slug === prev.chapterSlug &&
              s.slug === prev.stepSlug
            ) {
              leavingPos = pos;
            }
            if (completedStepsSet.has(`chapter-${c.id}:step-${s.id}`)) {
              if (pos > maxCompletedPos) maxCompletedPos = pos;
            }
            pos++;
          }
        }
        const isNaturalProgress =
          leavingPos >= 0 && leavingPos <= maxCompletedPos + 1;
        if (isNaturalProgress) {
          // Fire the step celebration as the learner advances past the step
          // they just left — this is the only moment "step complete" is
          // unambiguously true without stepping on their reading flow.
          completeStep(resolved.chapter.id, resolved.step.id);
        }
      }
    }

    prevRef.current = { chapterSlug, stepSlug };
  }, [
    loaded,
    chapterSlug,
    stepSlug,
    getStep,
    completeStep,
    isStepCompleted,
    chapters,
    completedStepsSet,
  ]);

  return null;
}
