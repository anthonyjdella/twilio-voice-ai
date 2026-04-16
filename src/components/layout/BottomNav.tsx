"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BottomNav() {
  const params = useParams();
  const router = useRouter();
  const chapterSlug = params.chapter as string;
  const stepSlug = params.step as string;
  const { getAdjacentSteps } = useWorkshop();

  const adjacent = chapterSlug && stepSlug
    ? getAdjacentSteps(chapterSlug, stepSlug)
    : null;

  useEffect(() => {
    if (!adjacent) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack typing in inputs, textareas, or contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      if (e.key === "ArrowLeft" && adjacent!.prev) {
        e.preventDefault();
        router.push(`/workshop/${adjacent!.prev.chapter.slug}/${adjacent!.prev.step.slug}`);
      } else if (e.key === "ArrowRight" && adjacent!.next) {
        e.preventDefault();
        router.push(`/workshop/${adjacent!.next.chapter.slug}/${adjacent!.next.step.slug}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjacent, router]);

  if (!adjacent) return null;

  const { prev, next, currentIndex, totalSteps } = adjacent;

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
