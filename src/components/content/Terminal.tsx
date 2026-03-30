"use client";

import { CopyButton } from "./CopyButton";

interface TerminalProps {
  commands: string;
}

export function Terminal({ commands }: TerminalProps) {
  const lines = commands.split("\n").filter(Boolean);

  // Extract just the commands (lines starting with $) for copy
  const commandsOnly = lines
    .filter((l) => l.trimStart().startsWith("$"))
    .map((l) => l.trimStart().slice(2))
    .join("\n");

  return (
    <div className="rounded-xl bg-black border border-navy-border overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="text-xs font-mono text-text-muted ml-2">
            TERMINAL
          </span>
        </div>
        <CopyButton text={commandsOnly} />
      </div>

      {/* Content */}
      <pre className="p-4 text-[13px] leading-relaxed font-mono overflow-x-auto">
        {lines.map((line, i) => {
          const isCommand = line.trimStart().startsWith("$");
          return (
            <div key={i}>
              {isCommand ? (
                <span className="text-green-400">{line}</span>
              ) : (
                <span className="text-white/40">{line}</span>
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
