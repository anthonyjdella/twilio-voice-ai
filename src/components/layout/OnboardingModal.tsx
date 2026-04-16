"use client";

import { useState } from "react";
import { useAudienceMode, type AudienceMode } from "@/lib/AudienceContext";
import { Code, Eye } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { setMode } = useAudienceMode();
  const [selected, setSelected] = useState<AudienceMode>("builder");

  if (!open) return null;

  function handleContinue() {
    setMode(selected);
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 backdrop-blur-sm">
      <div className="relative max-w-xl w-full mx-4 rounded-2xl bg-panel border border-navy-border shadow-2xl overflow-hidden">
        {/* Accent stripe */}
        <div className="h-1 bg-twilio-red" />

        <div className="px-8 pt-10 pb-2 text-center">
          <h2 className="font-display font-extrabold text-3xl text-text-primary mb-2">
            Welcome to Voice AI Workshop
          </h2>
          <p className="text-text-secondary text-base leading-relaxed mb-1">
            You're about to build an AI-powered phone agent with Twilio.
          </p>
          <p className="text-text-muted text-sm leading-relaxed">
            Select a track to get started.
          </p>
        </div>

        <div className="px-8 pt-4 pb-4 grid grid-cols-5 gap-4">
          {/* Option 1: Builder — 3/5 width, primary */}
          <div className="col-span-3 flex flex-col gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted/70 pl-1">
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
              <span className="absolute top-3 right-3 text-[10px] font-mono font-medium uppercase tracking-wider text-twilio-red bg-twilio-red/10 px-2 py-0.5 rounded-full">
                Recommended
              </span>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                selected === "builder" ? "bg-twilio-red/25" : "bg-twilio-red/10 group-hover:bg-twilio-red/20"
              }`}>
                <Code className="w-5 h-5 text-twilio-red" />
              </div>
              <h3 className="font-display font-bold text-xl text-text-primary mb-1.5">
                Builder
              </h3>
              <p className={`text-sm leading-relaxed ${
                selected === "builder" ? "text-text-secondary" : "text-text-muted"
              }`}>
                Code along step by step. You'll write a real voice AI agent from
                scratch with full code blocks, terminal commands, and solutions.
              </p>
            </button>
          </div>

          {/* Option 2: Explorer — 2/5 width, secondary */}
          <div className="col-span-2 flex flex-col gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-muted/70 pl-1">
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
              <h3 className="font-display font-bold text-lg text-text-primary mb-1.5">
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
            className="w-full py-3 rounded-xl bg-twilio-red text-white font-display font-bold text-base transition-all duration-200 hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twilio-red focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
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
