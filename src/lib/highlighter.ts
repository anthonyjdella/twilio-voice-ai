import type { Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

/** Dark theme for code blocks */
export const CODE_THEME_DARK = "tokyo-night";
/** Light theme for code blocks */
export const CODE_THEME_LIGHT = "github-light";

/**
 * Returns a singleton shiki highlighter instance.
 * Lazy-loaded on first call — subsequent calls return the same promise.
 * Loads both dark and light themes so code blocks can switch instantly.
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((shiki) =>
      shiki.createHighlighter({
        themes: [CODE_THEME_DARK, CODE_THEME_LIGHT],
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
