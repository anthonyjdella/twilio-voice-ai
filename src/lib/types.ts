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

export interface Progress {
  completedSteps: string[]; // "chapter-1:step-2"
  currentChapter: number;
  currentStep: number;
  workshopState: Record<string, string>;
  badges: string[];
  callCount: number;
  /** Ephemeral: which chapter badge was just earned (triggers celebration) */
  pendingBadge: string | null;
  /** Ephemeral: which step was just completed (triggers mini-celebration) */
  pendingStep: string | null;
}

export const DEFAULT_PROGRESS: Progress = {
  completedSteps: [],
  currentChapter: 1,
  currentStep: 1,
  workshopState: {},
  badges: [],
  callCount: 0,
  pendingBadge: null,
  pendingStep: null,
};
