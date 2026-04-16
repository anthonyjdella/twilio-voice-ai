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

    // ── Explorer: single concept card summarizing all five ──
    {
      type: "concept-card",
      audience: "explorer",
      title: "The Five Components",
      content:
        "A caller dials your Twilio number on any phone. Twilio Voice receives the call and activates ConversationRelay, which converts speech to text and text back to speech in real time. Your WebSocket server sits in the middle — it takes the transcribed text, sends it to an LLM (OpenAI), and streams the response back through Twilio so the caller hears a natural voice reply.",
    },

    // ── Builder: trimmed component descriptions ──
    {
      type: "prose",
      audience: "builder",
      content:
        "**Caller (Phone)** — A real person on a real phone. They dial your Twilio number and experience a normal call with no idea an LLM is on the other end.",
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

    { type: "section", title: "The Message Flow" },

    {
      type: "prose",
      content:
        "Let's trace a single conversational turn from start to finish. The caller says \"What's the weather like in San Francisco?\" and here is exactly what happens:",
    },

    // ── Shared: visual-step for both modes ──
    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Caller speaks",
          description:
            "The caller speaks into their phone and audio is transmitted to Twilio over the phone network.",
        },
        {
          icon: "/images/icons/pencil.svg",
          title: "Speech to text",
          description:
            "ConversationRelay's STT engine transcribes the audio. Once the caller stops speaking, it sends a `prompt` message to your server.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "LLM generates a response",
          description:
            "Your server adds the transcript to conversation history and sends the full context to the LLM, which streams back tokens.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Tokens streamed to Twilio",
          description:
            "As tokens arrive, your server forwards them as `text` messages. ConversationRelay's TTS engine buffers and begins speaking immediately.",
        },
        {
          icon: "/images/icons/sound-wave.svg",
          title: "Caller hears the reply",
          description:
            "The TTS engine converts text into speech and plays it through the call. The caller hears a natural, human-sounding voice.",
        },
      ],
    },

    // ── Explorer: latency summary ──
    {
      type: "prose",
      audience: "explorer",
      content:
        "A single conversation turn takes under two seconds — from the caller finishing a sentence to hearing the agent's response.",
    },

    // ── Builder: json-message examples ──
    {
      type: "json-message",
      audience: "builder",
      direction: "inbound",
      messageType: "prompt",
      code: `{
  "type": "prompt",
  "voicePrompt": "What's the weather like in San Francisco?",
  "lang": "en-US",
  "last": true
}`,
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "text",
      code: `{
  "type": "text",
  "token": "It's currently 62 degrees and partly cloudy in San Francisco, ",
  "last": false
}`,
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "text",
      code: `{
  "type": "text",
  "token": "with a light breeze coming off the bay.",
  "last": true
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "The `last` field is critical. Setting `last: true` on the final token tells ConversationRelay that your response is complete. This lets the TTS engine flush its buffer and signals that the system should start listening for the caller's next utterance.",
    },

    { type: "section", title: "Why WebSockets?" },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay uses WebSockets rather than webhooks for a critical reason: latency. A phone conversation is real-time. Every millisecond of delay between the caller finishing their sentence and hearing the agent's response feels unnatural. WebSockets provide a persistent, full-duplex connection that eliminates the overhead of establishing new HTTP connections for each message. Your server and Twilio maintain an open channel for the entire duration of the call, allowing tokens to flow back and forth with minimal delay.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "ConversationRelay uses WebSockets for real-time, low-latency communication — your server stays connected for the entire call.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "ConversationRelay Protocol Details",
      content:
        "The ConversationRelay WebSocket protocol uses JSON messages in both directions. Here are the key message types you will work with:\n\n**Inbound (Twilio to your server):**\n\n- `setup` -- Sent once when the WebSocket connects. Contains the session ID, call SID, caller's phone number, call direction, and any custom parameters you passed in your TwiML.\n- `prompt` -- Sent when the caller finishes speaking. Contains the transcribed text in the `voicePrompt` field, the detected language in `lang`, and a `last` boolean indicating whether this is the final transcription for this utterance.\n- `interrupt` -- Sent when the caller starts speaking while the agent is talking. Includes `utteranceUntilInterrupt` (what the caller actually heard) so you can trim conversation history.\n- `dtmf` -- Sent when the caller presses a key on their phone's keypad. Contains the `digit` pressed (singular — each keypress is a separate message).\n- `error` -- Sent when something goes wrong with STT or other ConversationRelay internals.\n\n**Outbound (your server to Twilio):**\n\n- `text` -- Send text to be spoken to the caller. Use the `token` field for the text content and `last: true` on the final chunk.\n- `language` -- Switch the TTS and transcription languages mid-call (e.g., `ttsLanguage: \"es-ES\"`).\n- `end` -- Terminate the ConversationRelay session, optionally including `handoffData` to trigger a transfer via your action URL.\n\nAll messages are JSON-encoded strings sent over the WebSocket. The protocol is intentionally simple -- no binary frames, no custom headers, no negotiation. This makes it straightforward to implement in any language or framework that supports WebSockets.",
    },
  ],
} satisfies StepDefinition;
