"use client";

import { useMemo } from "react";
import { useProgressContext } from "@/components/layout/ProgressContext";
import { useWorkshop } from "@/lib/WorkshopContext";
import { MilestoneBadge } from "./MilestoneBadge";
import { StepCelebration } from "./StepCelebration";

export function CelebrationManager() {
  const { progress, dismissBadge, dismissStep } = useProgressContext();
  const { config, chapters } = useWorkshop();

  const pendingChapter = useMemo(() => {
    if (!progress.pendingBadge) return null;
    return chapters.find((c) => `chapter-${c.id}` === progress.pendingBadge);
  }, [progress.pendingBadge, chapters]);

  // Only treat as final if there IS a pending chapter AND it's the last one.
  // Without the explicit `!!pendingChapter` check, both sides resolve to
  // `undefined` when nothing's pending and `undefined === undefined` falsely
  // reports `isFinal = true`, which would send bogus isFinal signaling to
  // MilestoneBadge (the confetti gate downstream catches it, but the prop
  // still leaks elsewhere via `sharing`).
  const lastChapter = chapters[chapters.length - 1];
  const isFinal =
    !!pendingChapter && !!lastChapter && pendingChapter.id === lastChapter.id;

  return (
    <>
      {/* Step-level celebration (brief toast) */}
      <StepCelebration
        show={!!progress.pendingStep && !progress.pendingBadge}
        onDismiss={dismissStep}
      />

      {/* Chapter-level celebration (full confetti overlay) */}
      <MilestoneBadge
        show={!!pendingChapter}
        icon={pendingChapter?.badgeIcon ?? ""}
        title={pendingChapter?.badgeName ?? ""}
        subtitle={`Chapter ${pendingChapter?.id ?? ""}: ${pendingChapter?.title ?? ""} complete!`}
        onDismiss={dismissBadge}
        isFinal={isFinal}
        particleColor={pendingChapter?.particleColor}
        sharing={isFinal ? config.sharing : undefined}
        workshopTitle={config.title}
        totalChapters={chapters.length}
      />
    </>
  );
}
