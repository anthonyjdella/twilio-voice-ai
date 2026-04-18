"use client";

import { useCallback, useEffect, useState } from "react";
import { useAudienceMode, type AudienceMode } from "@/lib/AudienceContext";
import { Code, Eye } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import workshopConfig from "@/workshop.config";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { setMode } = useAudienceMode();
  const [selected, setSelected] = useState<AudienceMode>("builder");
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  const handleContinue = useCallback(() => {
    setMode(selected);
    onComplete();
  }, [setMode, selected, onComplete]);

  // Onboarding is a one-time, required choice: the whole point is to get an
  // explicit signal for Builder vs. Explorer. Previously Escape / backdrop /
  // X silently "confirmed" whatever was previewed (defaulting to Builder),
  // which meant an accidental Escape tap locked the learner into Builder
  // mode without a real choice. Now Escape and backdrop-click are no-ops;
  // the only exits are the two explicit option buttons or the Continue CTA.
  // The X button is removed for the same reason — there's nothing to dismiss
  // *to*; the modal blocks content until a track is picked.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Swallow Escape so focus stays trapped inside the modal.
        e.preventDefault();
        e.stopPropagation();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <div
        ref={trapRef}
        className="relative max-w-xl w-full mx-4 rounded-2xl bg-panel border border-navy-border shadow-2xl overflow-hidden"
      >
        {/* Accent stripe */}
        <div className="h-1 bg-twilio-red" />

        <div className="px-8 pt-10 pb-2 text-center">
          <h2
            id="onboarding-title"
            className="font-display font-extrabold text-3xl text-text-primary mb-2"
          >
            Welcome to {workshopConfig.shortTitle}
          </h2>
          <p
            id="onboarding-description"
            className="text-text-secondary text-base leading-relaxed mb-1"
          >
            {workshopConfig.description}
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Select a track to get started.
          </p>
        </div>

        <div className="px-8 pt-4 pb-4 grid grid-cols-5 gap-4">
          {/* Option 1: Builder — 3/5 width, primary */}
          <div className="col-span-3 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted/70 pl-1">
              Option 1
            </span>
            <button
              onClick={() => setSelected("builder")}
              className={`flex-1 group relative rounded-xl border-2 p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twilio-red ${
                selected === "builder"
                  ? "border-twilio-red bg-twilio-red/[0.1] ring-1 ring-twilio-red/30"
                  : "border-navy-border bg-surface-1 hover:border-twilio-red/40 hover:bg-twilio-red/[0.04]"
              }`}
            >
              <span className="absolute top-3 right-3 text-xs font-mono font-bold uppercase tracking-wider text-twilio-red bg-twilio-red/10 px-2 py-0.5 rounded-full">
                Recommended
              </span>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                selected === "builder" ? "bg-twilio-red/25" : "bg-twilio-red/10 group-hover:bg-twilio-red/20"
              }`}>
                <Code className="w-5 h-5 text-twilio-red" />
              </div>
              <h3 className="font-display font-extrabold text-xl text-text-primary mb-1.5">
                Builder
              </h3>
              <p className={`text-sm leading-relaxed ${
                selected === "builder" ? "text-text-secondary" : "text-text-muted"
              }`}>
                Code along step by step. You&apos;ll write a real voice AI agent from
                scratch with full code blocks, terminal commands, and solutions.
              </p>
            </button>
          </div>

          {/* Option 2: Explorer — 2/5 width, secondary */}
          <div className="col-span-2 flex flex-col gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted/70 pl-1">
              Option 2
            </span>
            <button
              onClick={() => setSelected("explorer")}
              className={`flex-1 group relative rounded-xl border-2 p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twilio-red ${
                selected === "explorer"
                  ? "border-twilio-red bg-twilio-red/[0.1] ring-1 ring-twilio-red/30"
                  : "border-navy-border bg-surface-1 hover:border-surface-5 hover:bg-surface-2"
              }`}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                selected === "explorer" ? "bg-twilio-red/25" : "bg-surface-3 group-hover:bg-surface-4"
              }`}>
                <Eye className={`w-5 h-5 ${selected === "explorer" ? "text-twilio-red" : "text-text-muted"}`} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-text-primary mb-1.5">
                Explorer
              </h3>
              <p className={`text-sm leading-relaxed ${
                selected === "explorer" ? "text-text-secondary" : "text-text-muted"
              }`}>
                Visual overviews and key concepts — no coding required.
              </p>
            </button>
          </div>
        </div>

        <div className="px-8 pb-3">
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-twilio-red text-white font-display font-extrabold text-base transition-all duration-200 hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twilio-red focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            Continue as {selected === "builder" ? "Builder" : "Explorer"}
          </button>
        </div>

        <div className="px-8 pb-8 pt-3 text-center">
          <p className="text-text-muted/60 text-xs leading-relaxed">
            You can switch anytime using the <strong className="text-text-muted/80">Builder / Explorer</strong> toggle in the top bar.
          </p>
        </div>
      </div>
    </div>
  );
}
