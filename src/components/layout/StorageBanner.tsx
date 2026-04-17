"use client";

import { AlertTriangle, X } from "lucide-react";
import { useProgressContext } from "./ProgressContext";

/**
 * Shown when a localStorage write has failed (quota exceeded, disabled in
 * private-browsing, blocked by site settings). Renders at the top of the
 * workshop pane so the learner knows their progress will be lost on reload —
 * without this, silent failure means a learner could complete half the workshop,
 * refresh, and discover everything gone.
 */
export function StorageBanner() {
  const { storageFailed, dismissStorageWarning } = useProgressContext();
  if (!storageFailed) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mx-4 mt-4 mb-2 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
    >
      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-display font-extrabold text-text-primary">
          Progress not saving
        </div>
        <p className="text-text-muted mt-0.5">
          Your browser blocked local storage (private browsing, out of space,
          or site settings). You can keep working, but progress will reset if
          you reload.
        </p>
      </div>
      <button
        type="button"
        onClick={dismissStorageWarning}
        aria-label="Dismiss storage warning"
        className="shrink-0 rounded p-1 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
