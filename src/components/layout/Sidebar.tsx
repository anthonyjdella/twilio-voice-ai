"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { chapters, getChapter } from "@/content/chapters";
import { useProgressContext } from "./ProgressContext";

function StepIcon({ state }: { state: "pending" | "active" | "completed" }) {
  if (state === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-twilio-red flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-twilio-red animate-pulse-glow" />
      </div>
    );
  }
  return <div className="w-5 h-5 rounded-full border border-white/15 shrink-0" />;
}

export function Sidebar() {
  const params = useParams();
  const chapterSlug = params.chapter as string | undefined;
  const stepSlug = params.step as string | undefined;
  const chapter = chapterSlug ? getChapter(chapterSlug) : chapters[0];
  const { progress } = useProgressContext();

  if (!chapter) return null;

  return (
    <aside className="w-72 border-r border-navy-border bg-navy/50 flex flex-col shrink-0 overflow-hidden">
      {/* Chapter title */}
      <div className="p-5 pb-4">
        <div className="text-xs font-mono text-twilio-red uppercase tracking-wider mb-1">
          Chapter {chapter.id}
        </div>
        <h2 className="font-display font-bold text-lg text-text-primary">
          {chapter.title}
        </h2>
        <p className="text-xs text-text-muted mt-1">{chapter.subtitle}</p>
      </div>

      <div className="h-px bg-navy-border mx-4" />

      {/* Step navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {chapter.steps.map((step) => {
          const isActive = step.slug === stepSlug;
          const isCompleted = progress.completedSteps.includes(
            `chapter-${chapter.id}:step-${step.id}`
          );
          const state = isCompleted ? "completed" : isActive ? "active" : "pending";

          return (
            <Link
              key={step.id}
              href={`/workshop/${chapter.slug}/${step.slug}`}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                ${
                  isActive
                    ? "bg-white/[0.06] text-text-primary"
                    : "text-text-secondary hover:bg-white/[0.03] hover:text-text-primary"
                }
              `}
            >
              <StepIcon state={state} />
              <span className="font-medium">{step.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="h-px bg-navy-border mx-4" />

      {/* Agent card */}
      <div className="p-4">
        <div className="rounded-xl bg-white/[0.03] border border-navy-border p-4">
          <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
            Your Agent
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Name</span>
              <span className="text-text-primary font-medium">
                {progress.agentConfig.name || "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Voice</span>
              <span className="text-text-primary font-medium">
                {progress.agentConfig.voice || "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Language</span>
              <span className="text-text-primary font-medium">
                {progress.agentConfig.language || "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Calls</span>
              <span className="text-text-primary font-mono font-medium">
                {progress.callCount}
              </span>
            </div>
          </div>

          {/* Badges */}
          {progress.badges.length > 0 && (
            <div className="mt-3 pt-3 border-t border-navy-border">
              <div className="flex flex-wrap gap-1.5">
                {progress.badges.map((badge) => {
                  const ch = chapters.find((c) => `chapter-${c.id}` === badge);
                  if (!ch) return null;
                  return (
                    <span
                      key={badge}
                      className="text-base"
                      title={ch.badgeName}
                    >
                      {ch.badgeIcon}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
