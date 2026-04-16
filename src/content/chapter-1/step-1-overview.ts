import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What We're Building" },

    {
      type: "prose",
      content:
        "You're about to build a **voice AI agent** that anyone can call on a real phone number and have a natural conversation with. Not a phone tree. Not a recording. A live, intelligent agent that listens, thinks, and responds in real time -- powered by an LLM and delivered through Twilio's global telephony network.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What You'll Build",
      content:
        "A phone number people can call to talk with an AI agent that sounds natural, handles interruptions, uses tools, and can hand off to a human. You'll experience each piece coming together step by step.",
    },

    { type: "section", title: "How It Works: ConversationRelay" },

    {
      type: "concept-card",
      title: "ConversationRelay",
      content:
        "Twilio handles the hard telephony problems -- speech-to-text, text-to-speech, audio encoding, interruption detection -- and gives your app a clean WebSocket interface. You send text, Twilio speaks it. The caller speaks, you receive text. It's a text-in, text-out interface to a live phone call.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Under the hood, ConversationRelay sends you a `prompt` JSON message when the caller finishes speaking and you respond with `text` tokens that get synthesized into speech. You never deal with raw audio buffers, codec negotiation, or voice activity detection -- just simple JSON over a WebSocket.",
    },

    { type: "section", title: "The Call Flow" },

    {
      type: "prose",
      content: "Here is what a complete call looks like once your agent is running:",
    },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Caller dials in",
          description:
            "Someone calls your Twilio phone number and Twilio hits your webhook.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Server responds with TwiML",
          description:
            "Your server tells Twilio to open a ConversationRelay session with your WebSocket URL, TTS voice, and STT language.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "WebSocket connects",
          description:
            "Twilio opens a WebSocket to your server and sends a setup message with call metadata.",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Caller speaks",
          description:
            "Twilio's STT engine transcribes their speech and sends you a prompt message.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "LLM processes",
          description:
            "Your server sends the transcription to an LLM along with conversation history and a system prompt.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Agent responds",
          description:
            "As the LLM streams tokens back, you forward them to Twilio, which converts them to speech in real time.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Conversation continues",
          description:
            "The call flows naturally with interruption handling, tool calling, and all the dynamics of a real phone call.",
        },
      ],
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
