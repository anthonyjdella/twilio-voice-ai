"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "./CopyButton";
import { getHighlighter } from "@/lib/highlighter";
import { useAudienceMode } from "@/lib/AudienceContext";
import { Code, ChevronDown } from "lucide-react";

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  zsh: "bash",
  yml: "yaml",
  xml: "html",
};

const SUPPORTED_LANGS = new Set([
  "javascript",
  "typescript",
  "json",
  "bash",
  "xml",
  "html",
  "css",
  "python",
  "shell",
]);

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
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const { isExplorer } = useAudienceMode();

  const resolvedLang = LANG_ALIASES[language] ?? language;
  const canHighlight = SUPPORTED_LANGS.has(resolvedLang);

  useEffect(() => {
    if (!canHighlight) return;

    let cancelled = false;

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const html = highlighter.codeToHtml(code, {
          lang: resolvedLang,
          theme: "tokyo-night",
        });
        setHighlightedHtml(html);
      })
      .catch(() => {
        // Silently fall back to plain text
      });

    return () => {
      cancelled = true;
    };
  }, [code, resolvedLang, canHighlight]);

  const lines = code.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();

  // Explorer mode: collapsed with "View Code" button
  if (isExplorer) {
    return (
      <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6">
        <button
          onClick={() => setExplorerOpen(!explorerOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
        >
          <Code className="w-4 h-4 text-twilio-blue shrink-0" />
          <span className="text-sm text-text-muted flex-1">
            {file ? `View Code — ${file}` : `View Code (${language})`}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${explorerOpen ? "rotate-180" : ""}`}
          />
        </button>
        {explorerOpen && (
          <div className="border-t border-navy-border">
            <div className="flex justify-end px-4 py-2 bg-white/[0.02]">
              <CopyButton text={code} />
            </div>
            <div className="overflow-x-auto">
              {highlightedHtml ? (
                <div
                  className="shiki-container p-4 text-[13px] leading-relaxed font-mono [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              ) : (
                <pre className="p-4 text-[13px] leading-relaxed font-mono">
                  {lines.map((line, i) => (
                    <div key={i}>
                      <code className="text-text-primary/90">{line || " "}</code>
                    </div>
                  ))}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

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

      {/* Code — highlighted or plain fallback */}
      <div className="overflow-x-auto">
        {highlightedHtml ? (
          <div
            className="shiki-container p-4 text-[13px] leading-relaxed font-mono [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="p-4 text-[13px] leading-relaxed font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="inline-block w-8 text-right pr-4 text-text-muted/50 select-none shrink-0 text-xs">
                    {(startLine || 1) + i}
                  </span>
                )}
                <code className="text-text-primary/90 flex-1">
                  {line || " "}
                </code>
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
