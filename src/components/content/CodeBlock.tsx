"use client";

import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  code: string;
  language?: string;
  file?: string;
  startLine?: number;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "javascript",
  file,
  startLine,
  showLineNumbers = true,
}: CodeBlockProps) {
  const lines = code.split("\n");
  // Remove trailing empty line if present
  if (lines[lines.length - 1] === "") lines.pop();

  return (
    <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy-border bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs">
          {file && (
            <span className="font-mono text-text-secondary">
              {file}
              {startLine && (
                <span className="text-text-muted">:{startLine}</span>
              )}
            </span>
          )}
          {!file && language && (
            <span className="font-mono text-text-muted">{language}</span>
          )}
        </div>
        <CopyButton text={code} />
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-[13px] leading-relaxed font-mono">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="inline-block w-8 text-right pr-4 text-text-muted/50 select-none shrink-0 text-xs">
                  {(startLine || 1) + i}
                </span>
              )}
              <code className="text-text-primary/90 flex-1">{line || " "}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
