import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Architecture Overview" },

    {
      type: "prose",
      content:
        "Before going further, let's make sure you have a clear mental model of how all the pieces fit together. The architecture has five components connected in a straight line, with the server at the center.",
    },

    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "The Components" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Five Components",
      content:
        "When a call connects, Twilio activates ConversationRelay, which converts speech to text and text back to speech in real time. The server sits in the middle -- it takes the caller's words (now text), sends them to an AI model, and sends the AI's reply back through Twilio so the caller hears a natural voice response.",
    },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Caller",
          description:
            "A real person on a real phone. They experience a normal phone call -- no app to install, no special setup.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "Twilio + ConversationRelay",
          description:
            "Twilio's phone network connects the call. ConversationRelay translates between voice and text in real time, including detecting when someone interrupts.",
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
        "**Twilio Voice** — Twilio's telephony platform receives the call, handles audio encoding and routing, and activates the STT/TTS engines when your webhook specifies ConversationRelay.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**ConversationRelay (STT + TTS)** — The bridge between voice and text. It uses **Deepgram** for speech-to-text (transcribing what the caller says) and **ElevenLabs** for text-to-speech (turning your text into natural-sounding audio) by default. It also detects interruptions mid-utterance. You can swap these providers later — Google and Amazon are also supported.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "Twilio also offers **Media Streams**, which give you raw audio bytes. That's useful if you want to run your own STT/TTS pipeline, but it means managing audio codecs, buffering, voice activity detection, and barge-in yourself. ConversationRelay abstracts all of that — your server only deals with text over a WebSocket.",
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
