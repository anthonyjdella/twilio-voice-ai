import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What We're Building" },

    {
      type: "prose",
      content:
        "You're about to build a **voice AI agent** that you can talk to over a real phone call. It listens to what you say, sends your words to an AI, and speaks the reply back -- all in real time over Twilio's phone network.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What You'll Build",
      content:
        "A voice AI agent that calls your phone and has a natural conversation with you -- handling interruptions, using tools, and even handing off to a human. You'll experience each piece coming together step by step.",
    },

    { type: "section", title: "Why Text Is the Bridge" },

    {
      type: "prose",
      content:
        "AI models like GPT read and write **text** -- they cannot listen to audio or speak out loud. But phone calls are **audio**. Something has to translate between the two. That is the core problem ConversationRelay solves: it converts the caller's speech into text so the AI can read it, and converts the AI's text reply back into speech so the caller can hear it.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Why Not Just Send Audio to the AI?",
      content:
        "AI language models are trained on text, not sound. They need written words as input and produce written words as output. ConversationRelay handles the translation layer -- speech to text on the way in, text to speech on the way out -- so your AI can power a real phone call without ever touching audio.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "This is why ConversationRelay exists as a separate layer from Twilio's raw Media Streams. Media Streams give you audio bytes -- useful if you want to run your own STT/TTS pipeline, but that means managing audio codecs, buffering, voice activity detection, and barge-in yourself. ConversationRelay abstracts all of that: you receive a `prompt` JSON message with transcribed text, and you respond with `text` tokens that get synthesized into speech. Your server only deals with text over a WebSocket.",
    },

    { type: "section", title: "How It Works: ConversationRelay" },

    {
      type: "concept-card",
      title: "ConversationRelay",
      content:
        "Twilio handles all the hard parts -- turning speech into text, turning text back into speech, and detecting when someone interrupts. Your code just deals with plain text: the caller speaks, you receive their words as text; you send text back, and the caller hears it as a natural voice. Think of it as a translator sitting between your code and a live phone call.",
    },

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
