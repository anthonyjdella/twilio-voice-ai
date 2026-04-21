"use client";

import { useState } from "react";
import { KeyRound, ChevronDown } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface SolutionFile {
  file: string;
  code: string;
  language?: string;
}

interface ShowSolutionProps {
  code?: string;
  file?: string;
  startLine?: number;
  language?: string;
  files?: SolutionFile[];
  explanation?: string;
}

export function ShowSolution({
  code,
  file,
  startLine,
  language = "javascript",
  files,
  explanation,
}: ShowSolutionProps) {
  const [open, setOpen] = useState(false);

  // Normalize to a files-array shape. Single-file callers pass `code`+`file`;
  // multi-file callers pass `files`. Either way the render path is identical.
  const tabs: SolutionFile[] =
    files && files.length > 0
      ? files
      : code
        ? [{ file: file ?? "solution", code, language }]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const active = tabs[activeIndex] ?? tabs[0];
  const isMultiFile = tabs.length > 1;

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-1 transition-colors"
      >
        <KeyRound className="w-5 h-5 text-warning shrink-0" />
        <span className="text-sm font-bold text-text-secondary flex-1">
          Stuck? Show Solution
          {isMultiFile && (
            <span className="ml-2 text-xs font-normal text-text-muted">
              ({tabs.length} files)
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && active && (
        <div className="border-t border-navy-border">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-text-muted mb-3">
              It&apos;s totally fine to use the solution. The goal is learning, not struggling.
            </p>
          </div>

          {isMultiFile && (
            <div
              role="tablist"
              aria-label="Solution files"
              className="px-4 flex flex-wrap gap-1 border-b border-navy-border"
            >
              {tabs.map((t, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={t.file}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIndex(i)}
                    className={`px-3 py-2 text-xs font-mono rounded-t-md -mb-px border-b-2 transition-colors ${
                      isActive
                        ? "border-twilio-red text-text-primary bg-surface-2"
                        : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface-2/50"
                    }`}
                  >
                    {t.file}
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-4 pt-4 pb-4">
            <CodeBlock
              code={active.code}
              file={active.file}
              startLine={startLine}
              language={active.language ?? "javascript"}
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
