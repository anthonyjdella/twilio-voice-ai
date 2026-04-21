"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle, Maximize2, RefreshCw, X, ArrowLeft } from "lucide-react";

const SHORTCUTS: Array<{ keys: string; label: string }> = [
  { keys: "→  Space  PageDown", label: "Next slide" },
  { keys: "←  PageUp", label: "Previous slide" },
  { keys: "Home", label: "First slide" },
  { keys: "End", label: "Last slide" },
  { keys: "F", label: "Fullscreen" },
  { keys: "Esc", label: "Exit fullscreen" },
  { keys: "R", label: "Reload slides (pick up Google edits)" },
  { keys: "\\  (backslash)", label: "Toggle slides ⇄ workshop (presenter only)" },
  { keys: "?  /  H", label: "Toggle this help" },
];

const PRESENTER_FLAG_KEY = "workshop-presenter-mode";

export default function SlidesHost() {
  const pathname = usePathname();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lastWorkshopPathRef = useRef<string>("/");
  // True when the current /slides visit was entered via the presenter toggle
  // (rather than a direct URL / admin link). Only then is history.back() safe
  // -- otherwise we'd bounce out of the app entirely.
  const cameFromWorkshopRef = useRef<boolean>(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Fetched from /api/slides-url at runtime so it picks up the Azure secret
  // value (injected into the container env after the Docker image was built).
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/slides-url", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { embedUrl: string | null }) => {
        if (!cancelled) setEmbedUrl(data.embedUrl);
      })
      .catch(() => {
        // Network error -- leave embedUrl null so the iframe stays hidden.
      });
    return () => {
      cancelled = true;
    };
  }, []);
  // Lazy initializer so the localStorage read runs once during mount state
  // construction rather than as a setState-in-effect (which ESLint flags as
  // a cascading-render hazard). SSR guard: localStorage is undefined on the
  // server, so we probe `typeof window` first.
  const [isPresenter] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(PRESENTER_FLAG_KEY) === "1";
    } catch {
      return false;
    }
  });

  const isSlidesRoute = pathname === "/slides";

  // Track the most recent non-slides path so `S` can bounce back to exactly
  // where the presenter was, even after navigating around inside /slides.
  useEffect(() => {
    if (pathname && pathname !== "/slides" && !pathname.startsWith("/slides/")) {
      lastWorkshopPathRef.current = pathname;
    }
  }, [pathname]);

  // Helper actions. Declared above the effects that reference them so ESLint
  // (react-hooks/immutability) doesn't flag temporal-dead-zone reads inside
  // the keydown handler.
  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const exitToWorkshop = useCallback(() => {
    // history.back() restores the exact scroll position Next.js saved for the
    // previous entry. router.push() would re-render from the top. Fall back
    // to pushing the tracked path if there's no history (e.g. /slides opened
    // directly in a new tab).
    if (cameFromWorkshopRef.current && typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push(lastWorkshopPathRef.current || "/");
    }
  }, [router]);

  const enterSlides = useCallback(() => {
    cameFromWorkshopRef.current = true;
    router.push("/slides");
  }, [router]);

  // Focus the iframe on route entry so arrow keys drive the deck immediately.
  // Tradeoff: while the iframe has focus, cross-origin rules prevent keydown
  // events from bubbling out, so "\" won't fire until the user clicks outside
  // the slide or uses the Workshop button in the top chrome. That button is
  // the always-works escape hatch.
  useEffect(() => {
    if (isSlidesRoute) iframeRef.current?.focus();
  }, [isSlidesRoute]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typingInField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // Presenter shortcut: toggle /slides ⇄ last workshop path. Active on
      // every route, but only for browsers that have set the flag via /admin.
      // Uses "\" because Google's embedded player doesn't bind it, and it's
      // not a common keystroke while teaching. Modifiers excluded so Cmd+\
      // etc. stay available.
      if (isPresenter && !typingInField && e.key === "\\" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        if (isSlidesRoute) exitToWorkshop();
        else enterSlides();
        return;
      }

      // The remaining shortcuts only make sense while the slides are visible.
      if (!isSlidesRoute) return;
      if (typingInField) return;

      if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setReloadKey((k) => k + 1);
        return;
      }
      // Arrow/space/PageUp/PageDown/Home/End are handled by Google's embedded
      // player -- but only once its iframe has focus. We deliberately don't
      // transfer focus to it here: doing so would break the "\" toggle. The
      // presenter clicks the slide once to drive navigation, then clicks
      // outside (or presses "\") to hand focus back.
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPresenter, isSlidesRoute, exitToWorkshop, enterSlides, toggleFullscreen]);

  // Render nothing when the URL isn't configured -- /slides itself will show
  // the configuration instructions.
  if (!embedUrl) return null;

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black flex flex-col z-[9999] outline-none"
      style={{ display: isSlidesRoute ? "flex" : "none" }}
      aria-hidden={!isSlidesRoute}
    >
      <div className="slides-chrome flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-white/10 text-white text-sm">
        <div className="flex items-center gap-3">
          {isPresenter && (
            <button
              onClick={exitToWorkshop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-twilio-red hover:bg-twilio-red/80 transition"
              title="Back to workshop (\ also works when the slide isn't focused)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Workshop</span>
            </button>
          )}
          <div className="font-display font-extrabold tracking-wide">Workshop Slides</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition"
            title="Reload deck (R)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Reload</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition"
            title="Fullscreen (F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Fullscreen</span>
          </button>
          <button
            onClick={() => setHelpOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition"
            title="Shortcuts (? or H)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Shortcuts</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[min(100%,calc((100vh-80px)*16/9))] aspect-video bg-black shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Workshop slide deck"
          />
        </div>
      </div>

      {!helpOpen && (
        <div className="slides-chrome absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-xs text-white/80 border border-white/10">
          Press <kbd className="font-mono text-white">?</kbd> for keyboard shortcuts
          {isPresenter && (
            <>
              {" · "}
              Workshop button (or <kbd className="font-mono text-white">\</kbd> when slide isn&apos;t focused)
            </>
          )}
        </div>
      )}

      {helpOpen && (
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 z-10"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-extrabold text-lg text-white">Keyboard shortcuts</div>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-2.5">
              {SHORTCUTS.map((s) => (
                <li key={s.keys} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-white/80">{s.label}</span>
                  <kbd className="font-mono text-white/90 text-xs bg-white/5 px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
            <p className="mt-5 pt-4 border-t border-white/10 text-xs text-white/50 leading-relaxed">
              Arrow keys, space, and fullscreen-from-player are handled by Google Slides directly.
              While the slide has focus, cross-origin rules block the
              <kbd className="font-mono text-white/80 text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mx-1">\</kbd>
              shortcut from firing &mdash; use the Workshop button in the top bar to return, or
              click outside the slide first.
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        :fullscreen .slides-chrome {
          display: none;
        }
        :fullscreen .aspect-video {
          max-width: 100vw !important;
          height: 100vh !important;
        }
      `}</style>
    </div>
  );
}
