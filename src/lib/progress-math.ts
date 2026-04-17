import type { ChapterMeta } from "./types";

/**
 * Counts how many completed-step keys still exist in the live workshop config.
 * Storage can carry keys from a prior config (renamed/removed steps) that no
 * longer map to anything — counting them inflates totals past 100% and can
 * falsely mark the workshop "complete". Filter through live chapters/steps.
 */
export function countValidCompleted(
  completedSteps: readonly string[],
  chapters: readonly ChapterMeta[],
): number {
  const validKeys = new Set<string>();
  for (const c of chapters) {
    for (const s of c.steps) validKeys.add(`chapter-${c.id}:step-${s.id}`);
  }
  let count = 0;
  for (const key of completedSteps) {
    if (validKeys.has(key)) count++;
  }
  return count;
}

export function totalStepCount(chapters: readonly ChapterMeta[]): number {
  let total = 0;
  for (const c of chapters) total += c.steps.length;
  return total;
}
