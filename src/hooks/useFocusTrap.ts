"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Confines Tab/Shift-Tab cycling to the element returned by this hook while
 * `active` is true, and restores focus to the previously-focused element on
 * deactivation. Pair with `role="dialog"` / `aria-modal="true"` for modals.
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;

    const container = containerRef.current;
    if (!container) return;

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => !el.hasAttribute("aria-hidden"));

    focusables[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("aria-hidden"));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return containerRef;
}
