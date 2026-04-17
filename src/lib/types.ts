export interface ChapterMeta {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  badgeName: string;
  badgeIcon: string;
  particleColor: string;
  steps: StepMeta[];
}

export interface StepMeta {
  id: number;
  slug: string;
  title: string;
}

/**
 * Bump this whenever the shape of the persisted Progress object changes in a
 * way that can't be safely migrated by a spread-over-defaults. Stored blobs
 * with a different version are discarded on load unless a migration exists
 * in `src/hooks/useProgress.ts#MIGRATIONS`.
 *
 * Current version: 2 (initial shipping version). The v1 → v2 jump predates
 * any public release — no v1 blobs exist in the wild, so there is no v1
 * migration. Bumps from v2 onward MUST register a migration entry so real
 * users don't lose progress on a release.
 */
export const PROGRESS_SCHEMA_VERSION = 2;

export interface Progress {
  /** Schema version so we can detect/discard incompatible stored blobs. */
  schemaVersion: number;
  completedSteps: string[]; // "chapter-1:step-2"
  workshopState: Record<string, string>;
  badges: string[];
  callCount: number;
  /** Ephemeral: which chapter badge was just earned (triggers celebration) */
  pendingBadge: string | null;
  /** Ephemeral: which step was just completed (triggers mini-celebration) */
  pendingStep: string | null;
}

export const DEFAULT_PROGRESS: Progress = {
  schemaVersion: PROGRESS_SCHEMA_VERSION,
  completedSteps: [],
  workshopState: {},
  badges: [],
  callCount: 0,
  pendingBadge: null,
  pendingStep: null,
};
