"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useAudienceMode } from "@/lib/AudienceContext";
import { useProgressContext } from "./ProgressContext";
import { Code, Eye } from "lucide-react";

export function TopBar() {
  const params = useParams();
  const currentChapterSlug = params.chapter as string | undefined;
  const { config, chapters } = useWorkshop();
  const { mode, setMode } = useAudienceMode();
  const { progress, completionPercentage } = useProgressContext();
  const pct = completionPercentage();

  return (
    <header className="h-14 border-b border-navy-border bg-navy/80 backdrop-blur-md flex items-center px-6 shrink-0 z-30">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mr-8 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-twilio-red flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="2.5" fill="white" />
            <circle cx="16" cy="8" r="2.5" fill="white" />
            <circle cx="8" cy="16" r="2.5" fill="white" />
            <circle cx="16" cy="16" r="2.5" fill="white" />
          </svg>
        </div>
        <span className="font-display font-bold text-sm text-text-primary whitespace-nowrap">
          {config.shortTitle}
        </span>
      </Link>

      {/* Chapter dots */}
      <nav className="flex items-center gap-1.5 flex-1 justify-center">
        {chapters.map((chapter) => {
          const isCurrent = chapter.slug === currentChapterSlug;
          const isCompleted = progress.badges.includes(`chapter-${chapter.id}`);
          const allStepsCompleted = chapter.steps.every((s) =>
            progress.completedSteps.includes(`chapter-${chapter.id}:step-${s.id}`)
          );

          return (
            <Link
              key={chapter.id}
              href={`/workshop/${chapter.slug}/${chapter.steps[0].slug}`}
              className="group flex items-center gap-1.5"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                  ${
                    isCurrent
                      ? "bg-twilio-red text-white shadow-[0_0_12px_rgba(239,34,58,0.4)]"
                      : isCompleted || allStepsCompleted
                        ? "bg-success/20 text-success"
                        : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-secondary"
                  }
                `}
                title={chapter.title}
              >
                {isCompleted || allStepsCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  chapter.id
                )}
              </div>
              <span
                className={`text-xs font-medium hidden lg:block transition-colors ${
                  isCurrent ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                }`}
              >
                {chapter.title}
              </span>
              {chapter.id < chapters.length && (
                <div className="w-4 h-px bg-white/10 hidden lg:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Audience mode toggle */}
      {config.features.audienceToggle && (
        <div className="flex items-center shrink-0 ml-6 mr-2">
          <div className="flex rounded-lg bg-white/[0.04] border border-navy-border p-0.5">
            <button
              onClick={() => setMode("builder")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                mode === "builder"
                  ? "bg-twilio-red text-white shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Code className="w-3 h-3" />
              Builder
            </button>
            <button
              onClick={() => setMode("explorer")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                mode === "explorer"
                  ? "bg-twilio-red text-white shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Eye className="w-3 h-3" />
              Explorer
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3 shrink-0 ml-8">
        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-twilio-red to-success transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-text-muted w-8 text-right">{pct}%</span>
      </div>
    </header>
  );
}
