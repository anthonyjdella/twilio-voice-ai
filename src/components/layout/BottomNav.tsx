"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BottomNav() {
  const params = useParams();
  const chapterSlug = params.chapter as string;
  const stepSlug = params.step as string;
  const { getAdjacentSteps } = useWorkshop();

  if (!chapterSlug || !stepSlug) return null;

  const { prev, next, currentIndex, totalSteps } = getAdjacentSteps(chapterSlug, stepSlug);

  return (
    <footer className="h-14 border-t border-navy-border bg-navy/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30">
      {/* Previous */}
      <div className="w-48">
        {prev && (
          <Link
            href={`/workshop/${prev.chapter.slug}/${prev.step.slug}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium">{prev.step.title}</span>
          </Link>
        )}
      </div>

      {/* Step indicator */}
      <div className="text-xs font-mono text-text-muted">
        Step {currentIndex + 1} of {totalSteps}
      </div>

      {/* Next */}
      <div className="w-48 flex justify-end">
        {next && (
          <Link
            href={`/workshop/${next.chapter.slug}/${next.step.slug}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="font-medium">{next.step.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </footer>
  );
}
