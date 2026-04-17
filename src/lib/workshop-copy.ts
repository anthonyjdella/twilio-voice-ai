/**
 * Centralized learner-facing copy. The skip-ahead confirmation appears in
 * two places (Sidebar + StepContent) and used to drift between them; keep
 * the strings here so they can't diverge and are easy to translate or tweak.
 */
export const SKIP_AHEAD_COPY = {
  title: "Skip ahead?",
  message:
    "You haven't finished the previous steps. Jumping ahead means you'll miss context that later steps rely on. Continue anyway?",
  confirmLabel: "Jump ahead",
  cancelLabel: "Stay here",
} as const;

export const RESET_COPY = {
  title: "Reset Progress",
  message:
    "This will clear all completed steps, badges, and celebrations. You'll start the workshop from scratch.",
  confirmLabel: "Reset Everything",
  cancelLabel: "Keep Progress",
} as const;
