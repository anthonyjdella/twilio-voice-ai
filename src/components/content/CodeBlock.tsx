"use client";

import { useState, useEffect, useMemo } from "react";
import { CopyButton } from "./CopyButton";
import { getHighlighter, CODE_THEME_DARK, CODE_THEME_LIGHT } from "@/lib/highlighter";
import { useAudienceMode } from "@/lib/AudienceContext";
import { useTheme } from "@/lib/ThemeContext";
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

function parseHighlightSpec(spec: (number | string)[]): Set<number> {
  const lines = new Set<number>();
  for (const item of spec) {
    if (typeof item === "number") {
      lines.add(item);
    } else {
      const match = item.match(/^(\d+)-(\d+)$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        for (let i = start; i <= end; i++) lines.add(i);
      }
    }
  }
  return lines;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  file?: string;
  startLine?: number;
  showLineNumbers?: boolean;
  highlight?: (number | string)[];
}

export function CodeBlock({
  code,
  language = "javascript",
  file,
  startLine,
  showLineNumbers = true,
  highlight,
}: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const { isExplorer } = useAudienceMode();
  const { isDark } = useTheme();

  const resolvedLang = LANG_ALIASES[language] ?? language;
  const canHighlight = SUPPORTED_LANGS.has(resolvedLang);
  const codeTheme = isDark ? CODE_THEME_DARK : CODE_THEME_LIGHT;

  const highlightedLines = useMemo(
    () => (highlight ? parseHighlightSpec(highlight) : null),
    [highlight]
  );

  useEffect(() => {
    if (!canHighlight) return;

    let cancelled = false;

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const html = highlighter.codeToHtml(code, {
          lang: resolvedLang,
          theme: codeTheme,
        });
        setHighlightedHtml(html);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [code, resolvedLang, canHighlight, codeTheme]);

  const lines = code.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();

  const isLineHighlighted = (lineIndex: number) => {
    if (!highlightedLines) return false;
    const lineNum = lineIndex + 1;
    return highlightedLines.has(lineNum);
  };

  if (isExplorer) {
    return (
      <div className="rounded-xl bg-navy-light border border-navy-border overflow-hidden mb-6">
        <button
          onClick={() => setExplorerOpen(!explorerOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-1 transition-colors"
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
            <div className="flex justify-end px-4 py-2 bg-surface-1">
              <CopyButton text={code} />
            </div>
            <div className="overflow-x-auto" data-scroll-x="true">
              {highlightedHtml ? (
                <ShikiWithHighlight html={highlightedHtml} highlightedLines={highlightedLines} />
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-navy-border bg-surface-1">
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

      <div className="overflow-x-auto">
        {highlightedHtml ? (
          <ShikiWithHighlight html={highlightedHtml} highlightedLines={highlightedLines} />
        ) : (
          <pre className="p-4 text-[13px] leading-relaxed font-mono">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`flex ${isLineHighlighted(i) ? "bg-twilio-blue/10 -mx-4 px-4 border-l-2 border-twilio-blue" : ""}`}
              >
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

function ShikiWithHighlight({
  html,
  highlightedLines,
}: {
  html: string;
  highlightedLines: Set<number> | null;
}) {
  const id = useMemo(() => `hl-${Math.random().toString(36).slice(2, 9)}`, []);

  if (!highlightedLines || highlightedLines.size === 0) {
    return (
      <div
        className="shiki-container p-4 text-[13px] leading-relaxed font-mono [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const css = generateHighlightCSS(id, highlightedLines);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        id={id}
        className="shiki-container p-4 text-[13px] leading-relaxed font-mono [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

function generateHighlightCSS(id: string, lines: Set<number>): string {
  const sel = `#${id}`;
  const rules = [
    `${sel} pre code { display: flex; flex-direction: column; }`,
    `${sel} .line { margin-left: -1rem; margin-right: -1rem; padding-left: 1rem; padding-right: 1rem; border-left: 2px solid transparent; }`,
    ...Array.from(lines).map(
      (n) =>
        `${sel} .line:nth-child(${n}) { border-left-color: var(--color-twilio-blue); background: color-mix(in srgb, var(--color-twilio-blue) 10%, transparent); }`
    ),
  ];
  return rules.join("\n");
}
