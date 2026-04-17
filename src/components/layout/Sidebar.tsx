"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useProgressContext } from "./ProgressContext";
import { ConfirmModal } from "./ConfirmModal";
import { RotateCcw } from "lucide-react";

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
  return <div className="w-5 h-5 rounded-full border border-surface-5 shrink-0" />;
}

export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const chapterSlug = params.chapter as string | undefined;
  const stepSlug = params.step as string | undefined;
  // The /workshop/complete page renders its own full-bleed layout — no sidebar.
  const onCompletePage = pathname === "/workshop/complete";
  const { config, chapters, getChapter } = useWorkshop();
  const chapter = chapterSlug ? getChapter(chapterSlug) : chapters[0];
  const { progress, resetProgress, completionPercentage } = useProgressContext();

  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Flattened step list so we can reason about absolute "step position" across
  // chapters (chapter 1 step 3 vs. chapter 2 step 1).
  const allSteps = chapters.flatMap((c) =>
    c.steps.map((s) => ({ chapterId: c.id, stepId: s.id, chapterSlug: c.slug, stepSlug: s.slug }))
  );

  function positionOf(chId: number, stId: number): number {
    return allSteps.findIndex((s) => s.chapterId === chId && s.stepId === stId);
  }

  // The furthest step the learner has completed (−1 if nothing complete yet).
  const maxCompletedPosition = progress.completedSteps.reduce((max, key) => {
    const m = key.match(/^chapter-(\d+):step-(\d+)$/);
    if (!m) return max;
    const pos = positionOf(Number(m[1]), Number(m[2]));
    return pos > max ? pos : max;
  }, -1);

  const currentPosition =
    chapter && stepSlug
      ? positionOf(
          chapter.id,
          chapter.steps.find((s) => s.slug === stepSlug)?.id ?? -1
        )
      : -1;

  function handleStepClick(
    e: React.MouseEvent,
    targetChapterId: number,
    targetStepId: number,
    href: string
  ) {
    const targetPos = positionOf(targetChapterId, targetStepId);
    // Allowed without confirm: backward nav, same step, or "next-available" step
    // (one past their furthest completion, or one past where they currently are).
    const maxAllowed = Math.max(maxCompletedPosition + 1, currentPosition);
    if (targetPos <= maxAllowed) return;

    e.preventDefault();
    setPendingHref(href);
  }

  if (!chapter || onCompletePage) return null;

  const sidebarConfig = config.sidebar;

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

          const href = `/workshop/${chapter.slug}/${step.slug}`;
          return (
            <Link
              key={step.id}
              href={href}
              onClick={(e) => handleStepClick(e, chapter.id, step.id, href)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                ${
                  isActive
                    ? "bg-surface-3 text-text-primary"
                    : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
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

      {/* Agent profile widget */}
      {sidebarConfig.widget === "custom" && sidebarConfig.fields && (
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-b from-surface-2 to-surface-1 border border-twilio-red/20 p-4 relative overflow-hidden">
            {/* Accent glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-twilio-red/40 to-transparent" />

            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-twilio-red/15 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF223A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-xs font-display font-bold text-text-primary uppercase tracking-wider">
                {sidebarConfig.title || "Workshop State"}
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              {sidebarConfig.fields.map((field) => {
                const val = progress.workshopState[field.key];
                return (
                  <div key={field.key} className="flex justify-between items-center">
                    <span className="text-text-muted text-xs">{field.label}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                      val
                        ? "bg-twilio-red/10 text-twilio-red border border-twilio-red/20"
                        : "bg-surface-1 text-text-muted border border-navy-border"
                    }`}>
                      {val || "\u2014"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            {progress.badges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-navy-border">
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">Badges</div>
                <div className="flex flex-wrap gap-2">
                  {progress.badges.map((badge) => {
                    const ch = chapters.find((c) => `chapter-${c.id}` === badge);
                    if (!ch) return null;
                    return (
                      <div
                        key={badge}
                        className="w-7 h-7 rounded-lg bg-surface-3 border border-surface-4 flex items-center justify-center"
                        title={ch.badgeName}
                      >
                        {ch.badgeIcon.startsWith("/") ? (
                          <img src={ch.badgeIcon} alt="" className="w-4 h-4 theme-icon" />
                        ) : (
                          <span className="text-sm">{ch.badgeIcon}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset progress */}
      {completionPercentage() > 0 && (
        <>
          <div className="h-px bg-navy-border mx-4" />
          <div className="p-4">
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-twilio-red transition-colors w-full px-3 py-2 rounded-lg hover:bg-surface-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset progress
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        open={showResetModal}
        title="Reset Progress"
        message="This will clear all completed steps, badges, and celebrations. You'll start the workshop from scratch."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Progress"
        onConfirm={() => {
          resetProgress();
          setShowResetModal(false);
        }}
        onCancel={() => setShowResetModal(false)}
      />

      <ConfirmModal
        open={pendingHref !== null}
        title="Skip ahead?"
        message="You haven't finished the previous steps. Jumping ahead means you'll miss context that later steps rely on. Continue anyway?"
        confirmLabel="Jump ahead"
        cancelLabel="Stay here"
        onConfirm={() => {
          if (pendingHref) router.push(pendingHref);
          setPendingHref(null);
        }}
        onCancel={() => setPendingHref(null)}
      />
    </aside>
  );
}
