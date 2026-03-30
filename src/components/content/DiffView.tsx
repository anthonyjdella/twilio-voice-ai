"use client";

import { CopyButton } from "./CopyButton";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

interface DiffViewProps {
  file: string;
  lines: DiffLine[];
}

export function DiffView({ file, lines }: DiffViewProps) {
  // Copy only the "after" version (added + context lines)
  const afterCode = lines
    .filter((l) => l.type !== "remove")
    .map((l) => l.content)
    .join("\n");

  return (
    <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy-border bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-text-secondary">{file}</span>
          <span className="font-mono text-warning">CHANGES</span>
        </div>
        <CopyButton text={afterCode} />
      </div>

      {/* Diff */}
      <pre className="p-4 text-[13px] leading-relaxed font-mono overflow-x-auto">
        {lines.map((line, i) => {
          const prefix =
            line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
          const bg =
            line.type === "add"
              ? "bg-success/10"
              : line.type === "remove"
                ? "bg-error/10"
                : "";
          const textColor =
            line.type === "add"
              ? "text-success"
              : line.type === "remove"
                ? "text-error/70"
                : "text-text-primary/70";

          return (
            <div key={i} className={`${bg} -mx-4 px-4`}>
              <span className="text-text-muted/40 select-none">{prefix} </span>
              <span className={textColor}>{line.content}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
