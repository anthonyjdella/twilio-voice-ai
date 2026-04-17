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
  ],
} satisfies StepDefinition;
