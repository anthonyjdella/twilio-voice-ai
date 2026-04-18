"use client";

import { ArrowRight } from "lucide-react";

interface BuilderOnlyProps {
  context?: string;
}

export function BuilderOnly({ context }: BuilderOnlyProps) {
  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-8 mb-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-twilio-blue/10 mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-twilio-blue"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <p className="text-sm font-bold text-text-primary mb-2">
        This step is for Builders
      </p>
      <p className="text-sm text-text-muted mb-4">
        {context || "Nothing to do here — continue to the next step."}
      </p>
      <div className="flex items-center justify-center gap-1 text-xs text-twilio-blue">
        <span>Keep going</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
