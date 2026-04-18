"use client";

import { useState } from "react";
import { useProgressContext } from "@/components/layout/ProgressContext";

const PERSONA_PRESETS = [
  {
    label: "Friendly Assistant",
    name: "Sam",
    personality:
      "warm, upbeat, and casual. You chat like a helpful friend and keep things light.",
    greeting: "Hey there! I'm Sam. What can I help you with today?",
  },
  {
    label: "Professional Concierge",
    name: "Ms. Chen",
    personality:
      "polished, courteous, and efficient. You are professional and precise with your words.",
    greeting:
      "Good day. This is Ms. Chen. How may I assist you?",
  },
  {
    label: "Casual Helper",
    name: "Jake",
    personality:
      "relaxed, fun, and approachable. You talk like a real person and keep things chill.",
    greeting: "Yo, what's up! I'm Jake. What do you need?",
  },
];

export function AgentConfig() {
  const { progress, updateWorkshopState } = useProgressContext();
  const [customName, setCustomName] = useState(
    progress.workshopState.agentName || ""
  );
  const [customPersonality, setCustomPersonality] = useState(
    progress.workshopState.personality || ""
  );
  const [customGreeting, setCustomGreeting] = useState(
    progress.workshopState.welcomeGreeting || ""
  );

  function applyPreset(preset: (typeof PERSONA_PRESETS)[number]) {
    setCustomName(preset.name);
    setCustomPersonality(preset.personality);
    setCustomGreeting(preset.greeting);
    updateWorkshopState({
      agentName: preset.name,
      personality: preset.personality,
      welcomeGreeting: preset.greeting,
    });
  }

  function applyCustom() {
    updateWorkshopState({
      agentName: customName.trim(),
      personality: customPersonality.trim(),
      welcomeGreeting: customGreeting.trim(),
    });
  }

  const activePreset = PERSONA_PRESETS.find(
    (p) =>
      p.name === progress.workshopState.agentName &&
      p.personality === progress.workshopState.personality
  );

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-twilio-red/15 flex items-center justify-center text-twilio-red">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span className="text-sm font-mono text-text-primary uppercase tracking-wider">
          Configure Your Agent
        </span>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Pick a preset persona or create your own. These settings apply to your
        next call.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
        {PERSONA_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              activePreset === preset
                ? "border-twilio-red bg-twilio-red/10"
                : "border-navy-border bg-surface-2 hover:border-text-muted/30"
            }`}
          >
            <div className="text-sm font-medium text-text-primary">
              {preset.label}
            </div>
            <div className="text-xs text-text-muted mt-1 line-clamp-2">
              {preset.name} &mdash; {preset.personality.split(".")[0]}.
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">
            Agent Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onBlur={applyCustom}
            placeholder="e.g. Aria, Sam, Ms. Chen"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-navy-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-twilio-red/50"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">
            Personality
          </label>
          <textarea
            value={customPersonality}
            onChange={(e) => setCustomPersonality(e.target.value)}
            onBlur={applyCustom}
            placeholder="e.g. warm, upbeat, and casual. You chat like a helpful friend."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-navy-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-twilio-red/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">
            Welcome Greeting
          </label>
          <input
            type="text"
            value={customGreeting}
            onChange={(e) => setCustomGreeting(e.target.value)}
            onBlur={applyCustom}
            placeholder="e.g. Hey there! I'm Sam. What can I help you with?"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-navy-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-twilio-red/50"
          />
        </div>
      </div>

      {progress.workshopState.agentName && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-twilio-red/5 border border-twilio-red/20">
          <span className="text-xs text-twilio-red">
            Active: {progress.workshopState.agentName}
            {progress.workshopState.personality &&
              ` \u2014 ${progress.workshopState.personality.split(".")[0]}.`}
          </span>
        </div>
      )}
    </div>
  );
}
