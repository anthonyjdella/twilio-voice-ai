import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What You Will Learn" },

    {
      type: "prose",
      content: "Six chapters, each building on the last:",
    },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/target.svg",
          title: "Chapter 1 -- Mission Briefing",
          description:
            "Understand the architecture, set up your environment, and configure Twilio.",
        },
        {
          icon: "/images/icons/rocketship.svg",
          title: "Chapter 2 -- First Contact",
          description:
            "Build a WebSocket server, connect it to ConversationRelay, and make your first AI phone call.",
        },
        {
          icon: "/images/icons/person-chat.svg",
          title: "Chapter 3 -- Identity",
          description:
            "Craft a system prompt that gives your agent a personality and choose a TTS voice.",
        },
        {
          icon: "/images/icons/speedometer.svg",
          title: "Chapter 4 -- Reflexes",
          description:
            "Handle interruptions, detect DTMF tones, manage silence, and switch languages mid-call.",
        },
        {
          icon: "/images/icons/integration.svg",
          title: "Chapter 5 -- Superpowers",
          description:
            "Give your agent tools to call -- look up data, query APIs -- and implement live agent handoff.",
        },
        {
          icon: "/images/icons/award-badge.svg",
          title: "Chapter 6 -- Launch",
          description:
            "Polish your agent, explore deployment options, and showcase what you've built.",
        },
      ],
    },

    {
      type: "callout",
      variant: "info",
      content:
        "Each chapter takes about 10-20 minutes. You can complete the entire workshop in a single session or work through it chapter by chapter at your own pace. Every step builds on the previous one, so we recommend going in order.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What You'll Walk Away With",
      content:
        "By the end of this workshop, you'll understand how voice AI agents work end to end -- from the phone call hitting Twilio, through the WebSocket relay, to the LLM generating responses. You'll see a working agent handle real conversations with interruptions, tools, and handoffs, and you'll know exactly how each piece fits together.",
    },
  ],
} satisfies StepDefinition;
