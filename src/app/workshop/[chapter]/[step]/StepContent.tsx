"use client";

import { useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stepRegistry } from "@/content/registry";
import { StepRenderer } from "@/components/content/StepRenderer";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useProgressContext } from "@/components/layout/ProgressContext";

interface StepContentProps {
  chapterSlug: string;
  stepSlug: string;
}

export function StepContent({ chapterSlug, stepSlug }: StepContentProps) {
  const key = `${chapterSlug}/${stepSlug}`;
  const stepDef = useMemo(() => stepRegistry[key], [key]);
  const { getStep } = useWorkshop();
  const { completeStep, isStepCompleted, loaded } = useProgressContext();

  const resolved = useMemo(
    () => getStep(chapterSlug, stepSlug),
    [getStep, chapterSlug, stepSlug]
  );

  const chapterId = resolved?.chapter.id;
  const stepId = resolved?.step.id;

  // Does this step have any verify blocks?
  const hasVerify = useMemo(
    () => stepDef?.blocks.some((b) => b.type === "verify") ?? false,
    [stepDef]
  );

  // Auto-complete non-verify steps when visited
  // Steps with verify blocks are only completed via the Verify button
  // Gate on `loaded` to avoid racing with localStorage hydration
  useEffect(() => {
    if (loaded && !hasVerify && chapterId && stepId && !isStepCompleted(chapterId, stepId)) {
      completeStep(chapterId, stepId);
    }
  }, [loaded, hasVerify, chapterId, stepId, completeStep, isStepCompleted]);

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
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <StepRenderer
          step={stepDef}
          chapterId={chapterId}
          stepId={stepId}
          onVerifySuccess={handleVerifySuccess}
        />
      </motion.div>
    </AnimatePresence>
  );
}
