import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Returns a singleton shiki highlighter instance.
 * Lazy-loaded on first call — subsequent calls return the same promise.
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((shiki) =>
      shiki.createHighlighter({
        themes: ["tokyo-night"],
        langs: [
          "javascript",
          "typescript",
          "json",
          "bash",
          "xml",
          "html",
          "css",
          "python",
          "shell",
        ],
      })
    );
  }
  return highlighterPromise;
}
