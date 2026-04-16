"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWorkshop } from "@/lib/WorkshopContext";
import { useAudienceMode, type AudienceMode } from "@/lib/AudienceContext";
import { useProgressContext } from "./ProgressContext";
import { Code, Eye, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MODE_INFO: Record<AudienceMode, { icon: typeof Code; label: string; description: string }> = {
  builder: {
    icon: Code,
    label: "Builder",
    description: "Full code blocks, terminal commands, diffs, and deep dives. You'll write real code step by step.",
  },
  explorer: {
    icon: Eye,
    label: "Explorer",
    description: "Visual summaries, concept cards, and high-level overviews. No coding required.",
  },
};

export function TopBar() {
  const params = useParams();
  const currentChapterSlug = params.chapter as string | undefined;
  const { config, chapters } = useWorkshop();
  const { mode, setMode } = useAudienceMode();
  const { progress } = useProgressContext();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const ActiveIcon = MODE_INFO[mode].icon;

  return (
    <header className="h-14 border-b border-navy-border bg-navy/80 backdrop-blur-md flex items-center px-6 shrink-0 z-30">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mr-8 shrink-0">
        <img src="/images/twilio-bug-red.svg" alt="Twilio" className="w-7 h-7" />
        <span className="font-display font-bold text-sm text-text-primary whitespace-nowrap">
          {config.shortTitle}
        </span>
      </Link>

      {/* Chapter dots */}
      <nav className="flex items-center gap-1.5 flex-1 justify-center">
        {chapters.map((chapter) => {
          const isCurrent = chapter.slug === currentChapterSlug;
          const isCompleted = progress.badges.includes(`chapter-${chapter.id}`);
          const allStepsCompleted = chapter.steps.every((s) =>
            progress.completedSteps.includes(`chapter-${chapter.id}:step-${s.id}`)
          );

          return (
            <Link
              key={chapter.id}
              href={`/workshop/${chapter.slug}/${chapter.steps[0].slug}`}
              className="group flex items-center gap-1.5"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
                  ${
                    isCurrent
                      ? "bg-twilio-red text-white shadow-[0_0_12px_rgba(239,34,58,0.4)]"
                      : isCompleted || allStepsCompleted
                        ? "bg-success/20 text-success"
                        : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-secondary"
                  }
                `}
                title={chapter.title}
              >
                {isCompleted || allStepsCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  chapter.id
                )}
              </div>
              <span
                className={`text-xs font-medium hidden lg:block transition-colors ${
                  isCurrent ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                }`}
              >
                {chapter.title}
              </span>
              {chapter.id < chapters.length && (
                <div className="w-4 h-px bg-white/10 hidden lg:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Audience mode toggle with popover */}
      {config.features.audienceToggle && (
        <div className="relative shrink-0 ml-6" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-navy-border hover:bg-white/[0.07] transition-colors"
          >
            <ActiveIcon className="w-3.5 h-3.5 text-twilio-red" />
            <span className="text-xs font-medium text-text-primary">
              {MODE_INFO[mode].label}
            </span>
            <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${popoverOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {popoverOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-[#0d1b3e] border border-navy-border shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden z-50"
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-2">
                  <div className="text-xs font-mono text-text-muted uppercase tracking-wider">Experience Level</div>
                  <p className="text-[11px] text-text-muted/70 mt-1">
                    Choose how technical the content should be. You can switch anytime.
                  </p>
                </div>

                {/* Options */}
                <div className="px-3 pb-3 space-y-1">
                  {(["builder", "explorer"] as const).map((m) => {
                    const info = MODE_INFO[m];
                    const Icon = info.icon;
                    const isActive = mode === m;

                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m);
                          setPopoverOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-150 ${
                          isActive
                            ? "bg-twilio-red/10 border border-twilio-red/25"
                            : "hover:bg-white/[0.04] border border-transparent"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? "bg-twilio-red/20" : "bg-white/[0.05]"
                        }`}>
                          <Icon className={`w-4 h-4 ${isActive ? "text-twilio-red" : "text-text-muted"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-display font-bold ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                              {info.label}
                            </span>
                            {isActive && <Check className="w-3.5 h-3.5 text-twilio-red" />}
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                            {info.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  );
}
