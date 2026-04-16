"use client";

import { renderMarkdown } from "@/lib/markdown";

interface Step {
  icon: string;
  title: string;
  description: string;
}

interface VisualStepProps {
  steps: Step[];
}

function isIconPath(icon: string): boolean {
  return icon.startsWith("/");
}

export function VisualStep({ steps }: VisualStepProps) {
  return (
    <div className="mb-6 space-y-3">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-xl bg-surface-1 border border-navy-border p-4 hover:bg-surface-2 transition-colors"
        >
          {/* Step number + icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-twilio-red/10 shrink-0">
            {isIconPath(step.icon) ? (
              <img
                src={step.icon}
                alt=""
                className="w-5 h-5"
              />
            ) : (
              <span className="text-lg">{step.icon}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-twilio-red/70 uppercase tracking-wider">
                Step {i + 1}
              </span>
            </div>
            <h4 className="font-display font-semibold text-sm text-text-primary mb-1">
              {step.title}
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {renderMarkdown(step.description)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
