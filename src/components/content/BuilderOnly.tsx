"use client";

import { ArrowRight } from "lucide-react";

interface BuilderOnlyProps {
  context?: string;
}

export function BuilderOnly({ context }: BuilderOnlyProps) {
  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-8 mb-6 text-center">
      <img
        src="/images/illustrations/no-result.svg"
        alt=""
        className="mx-auto mb-4 w-full max-w-[220px] h-auto"
      />
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
