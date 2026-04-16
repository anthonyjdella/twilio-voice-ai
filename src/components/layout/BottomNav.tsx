"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useProgressContext } from "./ProgressContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BottomNav() {
  const params = useParams();
  const router = useRouter();
  const chapterSlug = params.chapter as string;
  const stepSlug = params.step as string;
  const { getAdjacentSteps } = useWorkshop();
  const { completionPercentage } = useProgressContext();
  const pct = completionPercentage();

  const adjacent = chapterSlug && stepSlug
    ? getAdjacentSteps(chapterSlug, stepSlug)
    : null;

  useEffect(() => {
    if (!adjacent) return;

    function handleKeyDown(e: KeyboardEvent) {
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
    <footer className="h-16 border-t border-navy-border bg-navy/80 backdrop-blur-md flex items-center px-6 shrink-0 z-30">
      {/* Previous */}
      <div className="w-52 shrink-0">
        {prev && (
          <Link
            href={`/workshop/${prev.chapter.slug}/${prev.step.slug}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate">{prev.step.title}</span>
          </Link>
        )}
      </div>

      {/* Center: Progress bar */}
      <div className="flex-1 flex flex-col items-center gap-1.5 px-6">
        <div className="w-full max-w-md h-2.5 rounded-full bg-surface-3 overflow-hidden border border-navy-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-twilio-red via-red-400 to-success transition-all duration-700 ease-out relative"
            style={{ width: `${pct}%` }}
          >
            {/* Shine effect on the bar */}
            {pct > 0 && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style={{ animationDelay: "0s" }} />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
          <span>Step {currentIndex + 1}/{totalSteps}</span>
          <span className="text-text-muted">|</span>
          <span className={pct === 100 ? "text-success font-semibold" : ""}>{pct}% complete</span>
        </div>
      </div>

      {/* Next */}
      <div className="w-52 flex justify-end shrink-0">
        {next && (
          <Link
            href={`/workshop/${next.chapter.slug}/${next.step.slug}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="font-medium truncate">{next.step.title}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        )}
      </div>
    </footer>
  );
}
