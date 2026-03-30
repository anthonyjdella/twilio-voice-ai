"use client";

import { useMemo } from "react";
import { stepRegistry } from "@/content/registry";

interface StepContentProps {
  chapterSlug: string;
  stepSlug: string;
}

export function StepContent({ chapterSlug, stepSlug }: StepContentProps) {
  const Component = useMemo(
    () => stepRegistry[`${chapterSlug}/${stepSlug}`],
    [chapterSlug, stepSlug]
  );

  if (!Component) {
    return (
      <div className="text-text-muted text-center py-20">
        <p className="text-lg mb-2">Content coming soon</p>
        <p className="text-sm">This step is under construction.</p>
      </div>
    );
  }

  return <Component />;
}
