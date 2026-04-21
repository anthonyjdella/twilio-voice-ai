"use client";

import { useProgressContext } from "@/components/layout/ProgressContext";

const TOOL_SCRIPT: Record<string, { label: string; line: string }> = {
  check_weather: {
    label: "Weather lookup",
    line: '"What is the weather in Austin?"',
  },
  lookup_order: {
    label: "Order lookup",
    line: '"Can you check the status of order ORD-12345?"',
  },
  tell_joke: {
    label: "Joke",
    line: '"Tell me a joke."',
  },
};

const ALL_TOOL_IDS = Object.keys(TOOL_SCRIPT);

function parseEnabledTools(stored: string | undefined): string[] {
  if (stored === undefined) return ALL_TOOL_IDS;
  if (stored === "") return [];
  return stored
    .split(",")
    .map((id) => id.trim())
    .filter((id) => TOOL_SCRIPT[id]);
}

export function DemoScript() {
  const { progress } = useProgressContext();
  const enabledTools = parseEnabledTools(progress.workshopState.enabledTools);
  const handoffOn = progress.workshopState.handoffEnabled === "true";

  const steps: { title: string; detail: string }[] = [
    {
      title: "Trigger a call",
      detail:
        "Use the Call Me button or your curl command, then let the agent greet you.",
    },
  ];

  for (const toolId of enabledTools) {
    const tool = TOOL_SCRIPT[toolId];
    steps.push({
      title: `Test the ${tool.label}`,
      detail: `Say: ${tool.line}`,
    });
  }

  steps.push({
    title: "Test interruption",
    detail:
      "Ask a long question, then start talking again before the agent finishes. The agent should stop and listen.",
  });

  steps.push({
    title: "Try the keypad",
    detail:
      "Press any number key on your phone mid-call to show DTMF handling.",
  });

  if (handoffOn) {
    steps.push({
      title: "Request a human",
      detail: 'Say: "I need to speak to a person." The agent should transfer the call.',
    });
  } else {
    steps.push({
      title: "Ask for a human (handoff is off)",
      detail:
        'Say: "Can I speak to a person?" The agent should politely decline and keep trying to help.',
    });
  }

  const hasAnyTools = enabledTools.length > 0;

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
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <span className="text-sm font-mono text-text-primary uppercase tracking-wider">
          Your Demo Script
        </span>
      </div>

      <p className="text-sm text-text-muted mb-4">
        This script matches the tools and handoff setting you picked earlier.
        Change any of those and the script updates.
      </p>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-twilio-red/15 text-twilio-red flex items-center justify-center text-xs font-mono font-semibold">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-text-primary">
                {step.title}
              </div>
              <div className="text-xs text-text-muted leading-relaxed mt-0.5">
                {step.detail}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {!hasAnyTools && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-twilio-red/5 border border-twilio-red/20">
          <span className="text-xs text-twilio-red">
            All tools are currently off. Turn at least one on in Chapter 5 if
            you want the demo to cover tool calling.
          </span>
        </div>
      )}
    </div>
  );
}
