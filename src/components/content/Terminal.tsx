"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";
import { useAudienceMode } from "@/lib/AudienceContext";
import { TerminalSquare, ChevronDown } from "lucide-react";

interface TerminalProps {
  commands: string;
}

export function Terminal({ commands }: TerminalProps) {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const { isExplorer } = useAudienceMode();
  const lines = commands.split("\n").filter(Boolean);

  const commandsOnly = lines
    .filter((l) => l.trimStart().startsWith("$"))
    .map((l) => l.trimStart().slice(2))
    .join("\n");

  const terminalContent = (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy-border bg-surface-1">
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
      <pre className="p-4 text-[13px] leading-relaxed font-mono overflow-x-auto">
        {lines.map((line, i) => {
          const isCommand = line.trimStart().startsWith("$");
          return (
            <div key={i}>
              {isCommand ? (
                <span className="text-green-400">{line}</span>
              ) : (
                <span className="text-text-muted">{line}</span>
              )}
            </div>
          );
        })}
      </pre>
    </>
  );

  if (isExplorer) {
    return (
      <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6">
        <button
          onClick={() => setExplorerOpen(!explorerOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-1 transition-colors"
        >
          <TerminalSquare className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-sm text-text-muted flex-1">Show Commands</span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${explorerOpen ? "rotate-180" : ""}`}
          />
        </button>
        {explorerOpen && <div className="border-t border-navy-border">{terminalContent}</div>}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6">
      {terminalContent}
    </div>
  );
}
