import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Architecture Overview" },

    {
      type: "prose",
      content:
        "Before writing any code, let's make sure you have a clear mental model of how all the pieces fit together. The architecture is elegant in its simplicity: five components connected in a straight line, with your server at the center.",
    },

    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "The Components" },

    // Explorer: single concept card summarizing all five
    {
      type: "concept-card",
      audience: "explorer",
      title: "The Five Components",
      content:
        "When a call connects, Twilio Voice activates ConversationRelay, which converts speech to text and text back to speech in real time. Your WebSocket server sits in the middle — it takes the transcribed text, sends it to an LLM (OpenAI), and streams the response back through Twilio so the person on the phone hears a natural voice reply.",
    },

    // Builder: trimmed component descriptions
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
        "**ConversationRelay (STT + TTS)** — The bridge between voice and text. It transcribes the caller's speech, synthesizes your text responses into natural-sounding audio, and detects interruptions mid-utterance.",
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
  ],
} satisfies StepDefinition;
