import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What We're Building" },

    {
      type: "prose",
      content:
        "You're about to build a **voice AI agent** that you can talk to over a real phone call. Not a phone tree. Not a recording. A live, intelligent agent that listens, thinks, and responds in real time -- powered by an LLM and delivered through Twilio's global telephony network. Your server will call your phone, and you'll have a conversation with your own AI agent.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What You'll Build",
      content:
        "A voice AI agent that calls your phone and has a natural conversation with you -- handling interruptions, using tools, and even handing off to a human. You'll experience each piece coming together step by step.",
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
  ],
} satisfies StepDefinition;
