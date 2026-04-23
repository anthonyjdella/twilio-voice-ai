import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Three Things That Make One Turn Feel Alive" },

    {
      type: "prose",
      content:
        "A turn starts when the caller speaks. Twilio transcribes their words and sends them to the server, which composes a reply and sends it back. Three things happen along the way that turn a bare exchange into something that actually feels like a conversation.",
    },

    { type: "section", title: "1. Replies Stream Back Word by Word" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Replies Stream Back Word by Word",
      content:
        "The agent does not wait to finish writing its full response before speaking. The moment the first few words are ready, they are already playing in your ear -- and more keep arriving while the earlier ones are still being spoken. It is the difference between a friend who pauses and thinks out loud versus one who stares at you silently for five seconds before answering.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "On the protocol side this is a streamed sequence of outbound `text` JSON messages -- your server fires each chunk across the WebSocket as the LLM generates it, rather than buffering the full reply and sending it at the end. Twilio's TTS engine speaks tokens as they arrive, which is what gives you perceived-first-word-latency well below full-response latency. You will send your first `text` JSON messages in **Chapter 2 Step 4**.",
    },

    { type: "section", title: "2. You Can Interrupt It" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "You Can Interrupt It",
      content:
        "If the agent starts going on about something you did not ask for, you can just talk over it -- exactly like you would with a person. The agent stops mid-sentence, listens to what you said, and continues from there. No button to press, no command to say. It just works.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The caller can cut the agent off mid-sentence. When that happens, Twilio sends you a message saying how much of your reply actually made it out of the speaker -- usually less than what you streamed. Your server has to remember the shorter version, not what it sent, so the agent's next reply lines up with what the caller actually heard. The full handler is in **Chapter 4 Step 1**.",
    },

    { type: "section", title: "3. The Whole Round Trip Takes Under Two Seconds" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Whole Round Trip Takes Under Two Seconds",
      content:
        "From the moment you finish speaking to the moment you hear the agent's first word, it is usually under two seconds -- roughly the same pause you would get from a person on the other end of the line. Anything slower and it stops feeling like a conversation; it starts feeling like a voicemail system.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Sub-2-second turn latency depends on Twilio and your server keeping a single **WebSocket** open for the entire call -- no fresh HTTP handshake per message, no reconnect delay between turns. The alternative, webhook-style HTTP polling, adds 50-200ms per message cycle and makes streaming impractical. You will open that WebSocket in **Chapter 2 Step 1**.",
    },
  ],
} satisfies StepDefinition;
