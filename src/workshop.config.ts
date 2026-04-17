import type { WorkshopConfig } from "@/lib/workshop-config";

const workshopConfig: WorkshopConfig = {
  id: "voice-ai",
  title: "Build a Voice AI Agent",
  shortTitle: "Voice AI Workshop",
  description:
    "A guided workshop where you build a real conversational AI voice application using Twilio ConversationRelay",
  duration: "90 minutes",

  hero: {
    tagline:
      "A guided workshop with ConversationRelay",
    taglineAccent: "ConversationRelay",
    description:
      "By the end of this workshop, you\u2019ll have a working voice AI agent that calls your phone and talks to you \u2014 with a custom persona, realistic voice, tool calling, and more.",
    ctaText: "Start Workshop",
    illustration: "/images/illustrations/ai-world.png",
  },

  branding: {
    accentColor: "#EF223A",
    accentColorRgb: "239, 34, 58",
    logo: {
      src: "/images/twilio-bug-red.svg",
      alt: "Twilio",
    },
    poweredByLogo: {
      dark: "/images/powered-by-twilio-clear.png",
      light: "/images/powered-by-twilio-on-white.png",
      alt: "Powered by Twilio",
      href: "https://www.twilio.com",
    },
  },

  chapters: [
    {
      id: 1,
      slug: "mission-briefing",
      title: "Mission Briefing",
      subtitle: "Understand what we\u2019re building and get set up",
      duration: "15 min",
      badgeName: "Mission Ready",
      badgeIcon: "/images/icons/target.svg",
      particleColor: "#0263E0",
      steps: [
        { id: 1, slug: "what-were-building", title: "What We\u2019re Building" },
        { id: 2, slug: "call-flow", title: "The Call Flow" },
        { id: 3, slug: "chapter-overview", title: "What You\u2019ll Learn" },
        { id: 4, slug: "architecture", title: "Architecture" },
        { id: 5, slug: "message-flow", title: "Message Flow" },
        { id: 6, slug: "setup", title: "Open Codespace" },
        { id: 7, slug: "ngrok", title: "Expose Your Server" },
        { id: 8, slug: "twilio-config", title: "Configure Twilio" },
        { id: 9, slug: "verify", title: "Verify Setup" },
      ],
    },
    {
      id: 2,
      slug: "first-contact",
      title: "First Contact",
      subtitle: "Make your first AI-powered phone call",
      duration: "15 min",
      badgeName: "First Contact",
      badgeIcon: "/images/icons/rocketship.svg",
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
      subtitle: "Design your agent\u2019s personality and voice",
      duration: "15 min",
      badgeName: "Identity Forged",
      badgeIcon: "/images/icons/person-chat.svg",
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
      badgeIcon: "/images/icons/speedometer.svg",
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
      badgeIcon: "/images/icons/integration.svg",
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
      badgeIcon: "/images/icons/award-badge.svg",
      particleColor: "#F4B400",
      steps: [
        { id: 1, slug: "polish", title: "Polish Your Agent" },
        { id: 2, slug: "deploy", title: "Deployment Options" },
        { id: 3, slug: "showcase", title: "Showcase" },
        { id: 4, slug: "next-steps", title: "What\u2019s Next" },
      ],
    },
  ],

  sidebar: {
    widget: "custom",
    title: "Your Agent",
    fields: [
      { label: "Name", key: "name" },
      { label: "Voice", key: "voice" },
      { label: "Language", key: "language" },
    ],
  },

  features: {
    audienceToggle: true,
    celebrations: true,
    themeToggle: true,
  },

  defaultTheme: "dark",

  sharing: {
    enabled: true,
    eventName: "Twilio SIGNAL 2026",
    shareUrl: "https://signal.twilio.com",
    platforms: {
      x: {
        handle: "twilio",
        url: "https://x.com/twilio",
        message:
          "Just built a conversational AI voice agent at {event}! Went from zero to a fully working voice bot with custom persona, tool calling, and live agent handoff using @twilio ConversationRelay.",
        hashtags: ["TwilioSIGNAL", "VoiceAI", "ConversationalAI"],
      },
      linkedin: {
        url: "https://www.linkedin.com/company/twilio-inc-",
        message:
          "Excited to share that I just completed the \"{title}\" workshop at {event}! Built a fully functional conversational AI voice agent from scratch using Twilio ConversationRelay \u2014 complete with a custom persona, ElevenLabs voice synthesis, tool calling, and live agent handoff. Incredible hands-on session!",
      },
    },
  },
};

export default workshopConfig;
