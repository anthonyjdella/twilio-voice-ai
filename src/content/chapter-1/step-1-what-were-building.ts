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

    { type: "section", title: "How It Works: ConversationRelay" },

    {
      type: "concept-card",
      title: "ConversationRelay",
      content:
        "Twilio handles all the hard parts -- turning speech into text, turning text back into speech, and detecting when someone interrupts. Your code just deals with plain text: the caller speaks, you receive their words as text; you send text back, and the caller hears it as a natural voice. Think of it as a translator sitting between your code and a live phone call.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Under the hood, ConversationRelay sends you a `prompt` JSON message when the caller finishes speaking and you respond with `text` tokens that get synthesized into speech. You never deal with raw audio buffers, codec negotiation, or voice activity detection -- just simple JSON over a WebSocket.",
    },
  ],
} satisfies StepDefinition;
