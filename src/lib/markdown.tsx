import { type ReactNode } from "react";

/**
 * Lightweight inline markdown to React JSX renderer.
 * Supports: **bold**, `code`, [text](url), and HTML entities.
 * No external dependencies. Returns safe React elements.
 */
export function renderMarkdown(text: string): ReactNode {
  // Handle line breaks: split on \n, render each line, join with <br />
  if (text.includes("\n")) {
    const lines = text.split("\n");
    return (
      <>
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {renderMarkdownLine(line)}
          </span>
        ))}
      </>
    );
  }
  return renderMarkdownLine(text);
}

function renderMarkdownLine(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const patterns: { regex: RegExp; handler: (match: RegExpExecArray) => ReactNode }[] = [
      {
        regex: /\*\*(.+?)\*\*/,
        handler: (m) => <strong key={key++}>{renderMarkdown(m[1])}</strong>,
      },
      {
        regex: /`([^`]+)`/,
        handler: (m) => (
          <code
            key={key++}
            className="bg-white/[0.06] px-1 py-0.5 rounded font-mono text-[0.9em]"
          >
            {m[1]}
          </code>
        ),
      },
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/,
        handler: (m) => (
          <a
            key={key++}
            href={m[2]}
            className="text-twilio-blue hover:underline"
            target={m[2].startsWith("http") ? "_blank" : undefined}
            rel={m[2].startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {m[1]}
          </a>
        ),
      },
    ];

    let earliestIndex = Infinity;
    let earliestMatch: RegExpExecArray | null = null;
    let earliestHandler: ((match: RegExpExecArray) => ReactNode) | null = null;

    for (const { regex, handler } of patterns) {
      const match = regex.exec(remaining);
      if (match && match.index < earliestIndex) {
        earliestIndex = match.index;
        earliestMatch = match;
        earliestHandler = handler;
      }
    }

    if (!earliestMatch || !earliestHandler) {
      parts.push(decodeEntities(remaining));
      break;
    }

    if (earliestIndex > 0) {
      parts.push(decodeEntities(remaining.slice(0, earliestIndex)));
    }

    parts.push(earliestHandler(earliestMatch));
    remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&apos;/g, "\u2019")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
