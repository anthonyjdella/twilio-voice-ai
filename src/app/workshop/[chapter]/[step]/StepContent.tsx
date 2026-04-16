"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { stepRegistry } from "@/content/registry";
import { StepRenderer } from "@/components/content/StepRenderer";

interface StepContentProps {
  chapterSlug: string;
  stepSlug: string;
}

export function StepContent({ chapterSlug, stepSlug }: StepContentProps) {
  const key = `${chapterSlug}/${stepSlug}`;
  const stepDef = useMemo(() => stepRegistry[key], [key]);

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
        <StepRenderer step={stepDef} />
      </motion.div>
    </AnimatePresence>
  );
}
