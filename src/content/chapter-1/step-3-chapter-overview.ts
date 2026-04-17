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
            "Set up your server, connect it to Twilio, and make your first AI phone call.",
        },
        {
          icon: "/images/icons/person-chat.svg",
          title: "Chapter 3 -- Identity",
          description:
            "Give your agent a personality with custom instructions and choose a voice that fits.",
        },
        {
          icon: "/images/icons/speedometer.svg",
          title: "Chapter 4 -- Reflexes",
          description:
            "Handle interruptions, detect keypad presses, manage silence, and switch languages mid-call.",
        },
        {
          icon: "/images/icons/integration.svg",
          title: "Chapter 5 -- Superpowers",
          description:
            "Give your agent tools -- look up data, check databases -- and hand off to a human when needed.",
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
        "By the end of this workshop, you'll understand how voice AI agents work end to end -- from the phone call coming in, through the speech-to-text translation, to the AI generating a response. You'll see a working agent handle real conversations with interruptions, live data lookups, and handoffs to humans, and you'll know exactly how each piece fits together.",
    },
  ],
} satisfies StepDefinition;
