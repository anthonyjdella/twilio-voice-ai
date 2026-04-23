"use client";

import { ArrowRight } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

interface BuilderOnlyProps {
  context?: string;
  illustration?: string;
}

export function BuilderOnly({ context, illustration }: BuilderOnlyProps) {
  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-8 mb-6 text-center">
      <img
        src={illustration ?? "/images/illustrations/no-result.svg"}
        alt=""
        className="mx-auto mb-4 w-full max-w-[220px] h-auto"
      />
      <p className="text-sm font-bold text-text-primary mb-2">
        This step is for Builders
      </p>
      <div className="text-sm text-text-muted mb-4 text-left [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_strong]:text-text-primary [&_strong]:font-bold [&_a]:text-twilio-blue [&_a:hover]:underline [&_p]:mb-3 [&_p:last-child]:mb-0">
        {context
          ? renderMarkdown(context)
          : "Nothing to do here — continue to the next step."}
      </div>
      <div className="flex items-center justify-center gap-1 text-xs text-twilio-blue">
        <span>Keep going</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
