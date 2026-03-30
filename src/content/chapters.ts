import type { ChapterMeta } from "@/lib/types";

export const chapters: ChapterMeta[] = [
  {
    id: 1,
    slug: "mission-briefing",
    title: "Mission Briefing",
    subtitle: "Understand what we're building and get set up",
    duration: "10 min",
    badgeName: "Mission Ready",
    badgeIcon: "\u{1F3AF}",
    particleColor: "#0263E0",
    steps: [
      { id: 1, slug: "overview", title: "What We're Building" },
      { id: 2, slug: "architecture", title: "Architecture Overview" },
      { id: 3, slug: "setup", title: "Environment Setup" },
      { id: 4, slug: "twilio-config", title: "Configure Twilio" },
      { id: 5, slug: "verify", title: "Verify Setup" },
    ],
  },
  {
    id: 2,
    slug: "first-contact",
    title: "First Contact",
    subtitle: "Make your first AI-powered phone call",
    duration: "15 min",
    badgeName: "First Contact",
    badgeIcon: "\u{1F680}",
    particleColor: "#EF223A",
    steps: [
      { id: 1, slug: "websocket-server", title: "WebSocket Server" },
      { id: 2, slug: "twiml-setup", title: "TwiML Setup" },
      { id: 3, slug: "handle-speech", title: "Handle Incoming Speech" },
      { id: 4, slug: "stream-response", title: "Stream LLM Response" },
      { id: 5, slug: "first-call", title: "Make Your First Call" },
    ],
  },
  {
    id: 3,
    slug: "identity",
    title: "Identity",
    subtitle: "Design your agent's personality and voice",
    duration: "15 min",
    badgeName: "Identity Forged",
    badgeIcon: "\u{1F3AD}",
    particleColor: "#A855F7",
    steps: [
      { id: 1, slug: "system-prompt", title: "System Prompt" },
      { id: 2, slug: "persona-builder", title: "Persona Builder" },
      { id: 3, slug: "voice-selection", title: "Voice Selection" },
      { id: 4, slug: "language-config", title: "Language & STT" },
      { id: 5, slug: "test-identity", title: "Test Your Agent" },
    ],
  },
  {
    id: 4,
    slug: "reflexes",
    title: "Reflexes",
    subtitle: "Handle interruptions, DTMF, and conversational dynamics",
    duration: "15 min",
    badgeName: "Quick Reflexes",
    badgeIcon: "\u{26A1}",
    particleColor: "#F59E0B",
    steps: [
      { id: 1, slug: "interruptions", title: "Interruption Handling" },
      { id: 2, slug: "dtmf", title: "DTMF Detection" },
      { id: 3, slug: "silence", title: "Silence & Timeouts" },
      { id: 4, slug: "language-switch", title: "Dynamic Language Switch" },
      { id: 5, slug: "test-reflexes", title: "Test Reflexes" },
    ],
  },
  {
    id: 5,
    slug: "superpowers",
    title: "Superpowers",
    subtitle: "Add tool calling and advanced features",
    duration: "20 min",
    badgeName: "Superpowered",
    badgeIcon: "\u{1F48E}",
    particleColor: "#06B6D4",
    steps: [
      { id: 1, slug: "tool-calling", title: "Tool Calling Concepts" },
      { id: 2, slug: "define-tools", title: "Define Tools" },
      { id: 3, slug: "handle-tools", title: "Handle Tool Calls" },
      { id: 4, slug: "handoff", title: "Live Agent Handoff" },
      { id: 5, slug: "test-superpowers", title: "Test Superpowers" },
    ],
  },
  {
    id: 6,
    slug: "launch",
    title: "Launch",
    subtitle: "Polish, deploy, and celebrate",
    duration: "15 min",
    badgeName: "Voice AI Builder",
    badgeIcon: "\u{1F3C6}",
    particleColor: "#F4B400",
    steps: [
      { id: 1, slug: "polish", title: "Polish Your Agent" },
      { id: 2, slug: "deploy", title: "Deployment Options" },
      { id: 3, slug: "showcase", title: "Showcase" },
      { id: 4, slug: "next-steps", title: "What's Next" },
    ],
  },
];

export function getChapter(chapterSlug: string): ChapterMeta | undefined {
  return chapters.find((c) => c.slug === chapterSlug);
}

export function getStep(chapterSlug: string, stepSlug: string) {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return undefined;
  const step = chapter.steps.find((s) => s.slug === stepSlug);
  if (!step) return undefined;
  return { chapter, step };
}

export function getAdjacentSteps(chapterSlug: string, stepSlug: string) {
  const allSteps: { chapter: ChapterMeta; step: (typeof chapters)[0]["steps"][0] }[] = [];
  for (const chapter of chapters) {
    for (const step of chapter.steps) {
      allSteps.push({ chapter, step });
    }
  }

  const currentIndex = allSteps.findIndex(
    (s) => s.chapter.slug === chapterSlug && s.step.slug === stepSlug
  );

  return {
    prev: currentIndex > 0 ? allSteps[currentIndex - 1] : null,
    next: currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null,
    currentIndex,
    totalSteps: allSteps.length,
  };
}
