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

  const isFinal = pendingChapter?.id === chapters[chapters.length - 1]?.id;

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
      />
    </>
  );
}
