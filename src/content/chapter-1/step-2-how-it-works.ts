import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Call Flow" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Here is what happens when you call your agent, from the caller's perspective:",
    },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Your phone rings",
          description:
            "You click \"Call Me\" in the workshop app, and your phone rings a moment later.",
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
      audience: "explorer",
      variant: "info",
      content:
        "From the caller's perspective, it feels like talking to a person. Behind the scenes, every turn goes through speech-to-text, an AI model, and text-to-speech -- all in under two seconds.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the technical sequence that runs every time your agent handles a call:",
    },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "REST API triggers the call",
          description:
            "Your server calls the Twilio REST API to place an outbound call. You provide the caller's number and a webhook URL.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Twilio requests TwiML",
          description:
            "When the call connects, Twilio sends an HTTP request to your webhook. Your server responds with TwiML containing <Connect><ConversationRelay>, which tells Twilio to open a WebSocket to your server.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "WebSocket opens",
          description:
            "Twilio establishes a WebSocket connection to the URL you specified. Your server receives a `setup` message with the call metadata (callSid, caller number, custom parameters).",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Speech becomes text",
          description:
            "The caller speaks. Twilio runs speech-to-text and sends your server a `prompt` message containing the transcribed text.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "Your server calls the LLM",
          description:
            "Your server sends the transcript to the LLM. As the model streams its reply, you send each chunk back over the WebSocket as a `text` message with `last: true` on the final chunk.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Text becomes speech",
          description:
            "Twilio receives your text and runs text-to-speech. The caller hears the response as audio in real time, even while the model is still streaming.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Loop continues",
          description:
            "This cycle repeats for every turn. Twilio also sends `interrupt` (caller spoke over the agent), `dtmf` (keypad press), and `error` messages through the same WebSocket.",
        },
      ],
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "You'll implement each of these steps yourself. Chapter 2 covers the WebSocket server and TwiML endpoint.",
    },

    { type: "page-break" },

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
            "A real person on a real phone. They experience a normal phone call.",
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
