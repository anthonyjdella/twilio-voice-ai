"use client";

import { useRef, useCallback, useEffect } from "react";

const SESSION_KEY = "workshop-analytics-session";
const FLUSH_INTERVAL_MS = 5000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface QueuedEvent {
  type: string;
  payload?: Record<string, unknown>;
}

export function useAnalytics() {
  const queue = useRef<QueuedEvent[]>([]);
  const sessionId = useRef("");

  const flush = useCallback(() => {
    if (!sessionId.current) sessionId.current = getSessionId();
    if (queue.current.length === 0 || !sessionId.current) return;
    const events = queue.current.splice(0);
    const body = JSON.stringify({ sessionId: sessionId.current, events });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/events", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    const onUnload = () => flush();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onUnload);
      flush();
    };
  }, [flush]);

  const emit = useCallback((type: string, payload?: Record<string, unknown>) => {
    queue.current.push({ type, payload });
  }, []);

  return { emit, sessionId };
}
