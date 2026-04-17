"use client";

import { useState } from "react";
import { KeyRound, ChevronDown } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface ShowSolutionProps {
  code: string;
  file?: string;
  startLine?: number;
  language?: string;
  explanation?: string;
}

export function ShowSolution({
  code,
  file,
  startLine,
  language = "javascript",
  explanation,
}: ShowSolutionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-1 transition-colors"
      >
        <KeyRound className="w-5 h-5 text-warning shrink-0" />
        <span className="text-sm font-bold text-text-secondary flex-1">
          Stuck? Show Solution
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-navy-border">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-text-muted mb-3">
              It&apos;s totally fine to use the solution. The goal is learning, not struggling.
            </p>
          </div>
          <div className="px-4 pb-4">
            <CodeBlock
              code={code}
              file={file}
              startLine={startLine}
              language={language}
            />
          </div>
          {explanation && (
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-twilio-blue/5 border border-twilio-blue/10 text-sm text-text-secondary leading-relaxed">
                {explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
