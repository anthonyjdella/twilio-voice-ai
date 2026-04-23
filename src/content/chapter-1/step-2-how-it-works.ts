import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Call Flow" },

    {
      type: "prose",
      content:
        "Here is what happens during a call, from your (the caller's) perspective:",
    },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "The phone rings",
          description:
            "You click \"Call Me\" in this workshop app, and your phone rings a moment later.",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "The agent greets you",
          description:
            "You pick up and hear a voice. The agent introduces itself and asks how it can help.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "You have a conversation",
          description:
            "You talk, the agent listens. It responds in a natural voice. You can interrupt it mid-sentence, just like talking to a person.",
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "The agent takes action",
          description:
            "Ask it to look something up or check an order. It pauses briefly, fetches the answer, and tells you what it found.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "The call continues or hands off",
          description:
            "The conversation keeps going as long as you need. If the agent cannot help, it can transfer you to a real person.",
        },
      ],
    },

    {
      type: "callout",
      variant: "info",
      content:
        "From the caller's perspective, it feels like talking to a person. Behind the scenes, every turn goes through speech-to-text, an AI model, and text-to-speech -- all in under two seconds.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "That's the zoomed-out view of the whole call. The next step zooms in on a **single conversational turn** -- the caller speaks, your server talks to the LLM, and the reply streams back -- including the JSON messages that flow through your WebSocket. Chapter 2 is where you build the server that handles those messages.",
    },

    { type: "page-break" },

    { type: "section", title: "Architecture Overview" },

    {
      type: "prose",
      content:
        "Before going further, let's make sure you have a clear mental model of how all the pieces fit together. The architecture is a straight line with the server at the center, connecting the caller on one side to the AI on the other.",
    },

    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "The Components" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Three Main Pieces",
      content:
        "When a call connects, Twilio activates Conversation Relay, which converts speech to text and text back to speech in real time. The server sits in the middle -- it takes the caller's words (now text), sends them to an AI model, and sends the AI's reply back through Twilio so the caller hears a natural voice response.",
    },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Caller",
          description:
            "A real person on a real phone. They experience a normal phone call.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "Twilio Voice + Conversation Relay",
          description:
            "Twilio's phone network connects the call. Conversation Relay translates between voice and text in real time, including detecting when someone interrupts.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "Server + AI Model",
          description:
            "The server receives the caller's words as text, sends them to an AI model, and streams the reply back. It also handles tool calls and session logic.",
        },
      ],
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Caller (Phone)** — A real person on a real phone. Whether they call you or your server calls them, they experience a normal phone call with no idea an LLM is on the other end.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Twilio Voice** — Twilio's telephony platform receives the call, handles audio encoding and routing, and activates the STT/TTS engines when your webhook specifies Conversation Relay.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Conversation Relay (STT + TTS)** — The bridge between voice and text. It uses **Deepgram** for speech-to-text (transcribing what the caller says) and **ElevenLabs** for text-to-speech (turning your text into natural-sounding audio) by default. It also detects interruptions mid-utterance. You can swap providers later — other options include Google (STT and TTS) and Amazon (TTS only).",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "Twilio also offers **Media Streams**, which give you raw audio bytes. That's useful if you want to run your own STT/TTS pipeline, but it means managing audio codecs, buffering, voice activity detection, and barge-in yourself. Conversation Relay abstracts all of that — your server only deals with text over a WebSocket.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Your WebSocket Server** — The code you will write in this workshop. It receives transcribed text, maintains conversation history, streams LLM responses back to Twilio, and handles tool calls and session logic.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**LLM (OpenAI)** — The language model powering your agent's intelligence. Your server sends it conversation history and a system prompt; it responds with streamed tokens to minimize latency.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Tools (Functions)** — The LLM can request actions during a conversation — looking up an order, checking the weather, or querying a database. Your server defines the available tools, executes them when the LLM asks, and feeds the results back so the LLM can incorporate real data into its reply. The LLM never runs tools directly; your server is always in control of what gets executed.",
    },
  ],
} satisfies StepDefinition;
