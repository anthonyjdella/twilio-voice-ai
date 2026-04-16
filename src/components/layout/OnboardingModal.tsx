"use client";

import { useAudienceMode, type AudienceMode } from "@/lib/AudienceContext";
import { Code, Eye } from "lucide-react";

const options: {
  mode: AudienceMode;
  icon: typeof Code;
  title: string;
  description: string;
}[] = [
  {
    mode: "builder",
    icon: Code,
    title: "Builder",
    description:
      "Follow along hands-on, writing code step by step to build a voice AI agent from scratch.",
  },
  {
    mode: "explorer",
    icon: Eye,
    title: "Explorer",
    description:
      "Get a visual, high-level overview of how voice AI works — no coding required.",
  },
];

export function OnboardingModal() {
  const { needsOnboarding, setMode } = useAudienceMode();

  if (!needsOnboarding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 backdrop-blur-sm">
      <div className="relative max-w-lg w-full mx-4 rounded-2xl bg-[#0d1f3c] border border-navy-border shadow-2xl overflow-hidden">
        {/* Accent stripe */}
        <div className="h-1 bg-twilio-red" />

        <div className="px-8 pt-8 pb-3 text-center">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
            Choose your experience
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            Pick the track that fits how you learn best.
          </p>
        </div>

        <div className="px-8 pb-4 grid grid-cols-2 gap-4">
          {options.map(({ mode, icon: Icon, title, description }) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className="group relative rounded-xl border border-navy-border bg-white/[0.03] p-6 text-left transition-all duration-200 hover:border-twilio-red/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-twilio-red"
            >
              <div className="w-10 h-10 rounded-lg bg-twilio-red/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-twilio-red/20">
                <Icon className="w-5 h-5 text-twilio-red" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-primary mb-1.5">
                {title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {description}
              </p>
            </button>
          ))}
        </div>

        <div className="px-8 pb-8 text-center">
          <p className="text-text-muted/70 text-xs leading-relaxed">
            You can switch anytime using the <strong className="text-text-muted">Builder / Explorer</strong> toggle in the top bar.
          </p>
        </div>
      </div>
    </div>
  );
}
