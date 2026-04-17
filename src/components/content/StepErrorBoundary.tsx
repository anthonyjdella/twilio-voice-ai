"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import workshopConfig from "@/workshop.config";

interface StepErrorBoundaryProps {
  children: ReactNode;
  chapterSlug: string;
  stepSlug: string;
}

/**
 * Compute the next step slug across the whole workshop (chapter rollover
 * included). Pure, no hooks — the error boundary is a class component and
 * we render this during the error branch, so we read from the static config.
 */
function nextStepHref(chapterSlug: string, stepSlug: string): string | null {
  const flat: Array<{ chapterSlug: string; stepSlug: string }> = [];
  for (const c of workshopConfig.chapters) {
    for (const s of c.steps) {
      flat.push({ chapterSlug: c.slug, stepSlug: s.slug });
    }
  }
  const idx = flat.findIndex(
    (s) => s.chapterSlug === chapterSlug && s.stepSlug === stepSlug
  );
  if (idx < 0 || idx >= flat.length - 1) return null;
  const next = flat[idx + 1];
  return `/workshop/${next.chapterSlug}/${next.stepSlug}`;
}

interface StepErrorBoundaryState {
  error: Error | null;
}

// Per-step boundary so a bad content block doesn't blank the whole workshop
// shell (nav, progress, sidebar). The error is scoped to the step pane and
// users can still move on to the next step or reset progress.
export class StepErrorBoundary extends Component<
  StepErrorBoundaryProps,
  StepErrorBoundaryState
> {
  state: StepErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): StepErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error(
      `[StepErrorBoundary] ${this.props.chapterSlug}/${this.props.stepSlug} failed to render:`,
      error,
      info.componentStack
    );
  }

  componentDidUpdate(prev: StepErrorBoundaryProps) {
    if (
      this.state.error &&
      (prev.chapterSlug !== this.props.chapterSlug ||
        prev.stepSlug !== this.props.stepSlug)
    ) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="rounded-xl border border-error/30 bg-error/5 p-6 mb-6">
        <div className="text-xs font-mono text-error uppercase tracking-wider mb-2">
          Step failed to render
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-3">
          Something went wrong loading{" "}
          <code className="font-mono text-xs bg-surface-3 px-1.5 py-0.5 rounded">
            {this.props.chapterSlug}/{this.props.stepSlug}
          </code>
          . This is likely a bug in the content — the rest of the workshop
          still works.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <pre className="text-xs font-mono text-error/80 bg-surface-1 p-3 rounded overflow-x-auto mb-3">
            {this.state.error.message}
          </pre>
        )}
        <div className="flex items-center gap-4">
          <button
            onClick={this.handleRetry}
            className="text-xs font-bold text-twilio-blue hover:underline"
          >
            Try again
          </button>
          {(() => {
            const nextHref = nextStepHref(
              this.props.chapterSlug,
              this.props.stepSlug
            );
            if (!nextHref) return null;
            return (
              <Link
                href={nextHref}
                className="text-xs font-bold text-text-muted hover:text-text-primary hover:underline"
              >
                Skip to next step →
              </Link>
            );
          })()}
        </div>
      </div>
    );
  }
}
