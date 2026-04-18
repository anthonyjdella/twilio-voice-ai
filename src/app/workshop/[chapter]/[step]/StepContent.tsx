"use client";

import { useMemo, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { stepRegistry } from "@/content/registry";
import { StepRenderer } from "@/components/content/StepRenderer";
import { StepErrorBoundary } from "@/components/content/StepErrorBoundary";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useProgressContext } from "@/components/layout/ProgressContext";
import workshopConfig from "@/workshop.config";
import { SKIP_AHEAD_COPY } from "@/lib/workshop-copy";

const SKIP_UNLOCK_KEY = `workshop-${workshopConfig.id}-skip-unlock-position`;

interface StepContentProps {
  chapterSlug: string;
  stepSlug: string;
}

export function StepContent({ chapterSlug, stepSlug }: StepContentProps) {
  const key = `${chapterSlug}/${stepSlug}`;
  const stepDef = useMemo(() => stepRegistry[key], [key]);
  const router = useRouter();
  const { getStep, chapters } = useWorkshop();
  const { completeStep, isStepCompleted, loaded, completedStepsSet } =
    useProgressContext();

  const resolved = useMemo(
    () => getStep(chapterSlug, stepSlug),
    [getStep, chapterSlug, stepSlug]
  );

  const chapterId = resolved?.chapter.id;
  const stepId = resolved?.step.id;

  // Flat, ordered list of every step across the workshop. Used to detect when
  // a deep-link (or back/forward nav) lands the learner on a step further
  // ahead than their progress allows.
  const flatSteps = useMemo(
    () =>
      chapters.flatMap((c) =>
        c.steps.map((s) => ({
          chapterId: c.id,
          stepId: s.id,
          chapterSlug: c.slug,
          stepSlug: s.slug,
        }))
      ),
    [chapters]
  );

  const targetPosition = useMemo(
    () =>
      flatSteps.findIndex(
        (s) => s.chapterSlug === chapterSlug && s.stepSlug === stepSlug
      ),
    [flatSteps, chapterSlug, stepSlug]
  );

  const maxAllowedPosition = useMemo(() => {
    let max = -1;
    flatSteps.forEach((s, i) => {
      if (completedStepsSet.has(`chapter-${s.chapterId}:step-${s.stepId}`)) {
        if (i > max) max = i;
      }
    });
    return max + 1; // one past the furthest completed step
  }, [flatSteps, completedStepsSet]);

  const [skipConfirm, setSkipConfirm] = useState<
    "pending" | "allowed" | "declined"
  >("pending");

  // Session-scoped "furthest position the learner has explicitly unlocked by
  // confirming the skip-ahead modal." Persisting this across back/forward nav
  // means they won't be re-prompted for a position they already approved.
  // Keyed on session (not localStorage) so a fresh browser visit re-prompts.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(SKIP_UNLOCK_KEY);
    const unlocked = stored ? parseInt(stored, 10) : -1;
    if (Number.isFinite(unlocked) && targetPosition >= 0 && targetPosition <= unlocked) {
      queueMicrotask(() => setSkipConfirm("allowed"));
    } else {
      queueMicrotask(() => setSkipConfirm("pending"));
    }
  }, [chapterSlug, stepSlug, targetPosition]);

  // Does this step have any verify blocks?
  const hasVerify = useMemo(
    () => stepDef?.blocks.some((b) => b.type === "verify") ?? false,
    [stepDef]
  );

  const isAhead =
    loaded && targetPosition >= 0 && targetPosition > maxAllowedPosition;
  const showSkipModal = isAhead && skipConfirm === "pending";
  const blockContent = isAhead && skipConfirm !== "allowed";

  const allowSkip = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(SKIP_UNLOCK_KEY);
        const prev = stored ? parseInt(stored, 10) : -1;
        if (!Number.isFinite(prev) || targetPosition > prev) {
          sessionStorage.setItem(SKIP_UNLOCK_KEY, String(targetPosition));
        }
      } catch {
        // sessionStorage unavailable — still allow skip for this render
      }
    }
    setSkipConfirm("allowed");
    for (let i = maxAllowedPosition; i <= targetPosition; i++) {
      const s = flatSteps[i];
      if (!s) continue;
      const key = `chapter-${s.chapterId}:step-${s.stepId}`;
      if (!completedStepsSet.has(key)) {
        completeStep(s.chapterId, s.stepId, { silent: true });
      }
    }
  }, [targetPosition, maxAllowedPosition, flatSteps, completedStepsSet, completeStep]);

  const fallbackStep = flatSteps[Math.max(0, maxAllowedPosition)] ?? flatSteps[0];

  // Auto-complete non-verify steps when visited
  // Steps with verify blocks are only completed via the Verify button
  // Gate on `loaded` to avoid racing with localStorage hydration, and never
  // auto-complete a step the learner jumped ahead to — even after confirming
  // the skip-ahead modal. Confirming only *unblocks* the content; completion
  // still requires natural progression (forward-nav through ProgressTracker)
  // or the step's own verify action.
  useEffect(() => {
    if (
      loaded &&
      !hasVerify &&
      !isAhead &&
      chapterId &&
      stepId &&
      !isStepCompleted(chapterId, stepId)
    ) {
      const isColdStart = targetPosition === 0 && completedStepsSet.size === 0;
      completeStep(chapterId, stepId, { silent: isColdStart });
    }
  }, [
    loaded,
    hasVerify,
    isAhead,
    chapterId,
    stepId,
    completeStep,
    isStepCompleted,
    targetPosition,
    completedStepsSet,
  ]);

  // Verify callback: mark step complete when user confirms
  const handleVerifySuccess = useCallback(() => {
    if (chapterId && stepId) {
      completeStep(chapterId, stepId);
    }
  }, [chapterId, stepId, completeStep]);

  if (!stepDef) {
    return (
      <div className="text-text-muted text-center py-20">
        <p className="text-lg mb-2">Content coming soon</p>
        <p className="text-sm">This step is under construction.</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {!blockContent && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <StepErrorBoundary chapterSlug={chapterSlug} stepSlug={stepSlug}>
              <StepRenderer
                step={stepDef}
                chapterId={chapterId}
                stepId={stepId}
                onVerifySuccess={handleVerifySuccess}
              />
            </StepErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showSkipModal}
        title={SKIP_AHEAD_COPY.title}
        message={SKIP_AHEAD_COPY.message}
        confirmLabel={SKIP_AHEAD_COPY.confirmLabel}
        // StepContent's cancel = route back, so the label is "Go back" not
        // "Stay here" (Sidebar's cancel = keep the current ahead-step modal).
        cancelLabel="Go back"
        onConfirm={allowSkip}
        onCancel={() => {
          setSkipConfirm("declined");
          if (fallbackStep) {
            router.replace(
              `/workshop/${fallbackStep.chapterSlug}/${fallbackStep.stepSlug}`
            );
          }
        }}
      />
    </>
  );
}
