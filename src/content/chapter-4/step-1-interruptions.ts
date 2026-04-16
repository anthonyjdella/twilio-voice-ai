import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Interruption Handling" },

    { type: "diagram", variant: "architecture", highlight: "websocket" },

    {
      type: "prose",
      content:
        "Real conversations are messy. People interrupt, change their minds mid-sentence, and talk over each other. A great voice agent handles all of this gracefully. ConversationRelay has built-in **barge-in** support -- when a caller speaks while the AI is still talking, Twilio detects it and sends your server an `interrupt` message over the WebSocket.",
    },

    { type: "section", title: "How Barge-In Works" },

    {
      type: "prose",
      content: "Here is the flow when a caller interrupts:",
    },

    {
      type: "prose",
      content:
        "1. Your server sends text tokens to Twilio via `text` messages.\n2. Twilio converts them to speech and plays audio to the caller.\n3. The caller starts speaking while audio is still playing.\n4. Twilio stops playback and sends an `interrupt` message to your server.\n5. Your server receives the interrupt, cancels the current LLM stream, and clears any pending tokens.\n6. Twilio then sends the caller's new speech as a `prompt` message.",
    },

    { type: "section", title: "The Interrupt Message" },

    {
      type: "prose",
      content:
        "When barge-in occurs, ConversationRelay sends this message to your WebSocket:",
    },

    {
      type: "json-message",
      direction: "inbound",
      messageType: "interrupt",
      code: `{
  "type": "interrupt",
  "utteranceUntilInterrupt": "I can help you with your order. Let me",
  "durationUntilInterruptMs": 2340
}`,
    },

    {
      type: "prose",
      content:
        "The `utteranceUntilInterrupt` field tells you exactly how much of the AI's response the caller actually heard before they interrupted. The `durationUntilInterruptMs` field gives you the playback duration in milliseconds. This information is valuable for maintaining accurate conversation history with your LLM.",
    },

    { type: "section", title: "Handling the Interrupt" },

    {
      type: "prose",
      content:
        "First, add a `sendText()` helper that wraps the WebSocket message format into a one-liner. You will use this throughout the rest of the workshop. Then handle interrupts by aborting the active OpenAI stream and trimming conversation history to reflect only what the caller actually heard.",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `// Track the active stream so we can abort it
let activeStream = null;

// Helper: send a complete text response to the caller
function sendText(ws, text) {
  ws.send(JSON.stringify({ type: "text", token: text, last: true }));
}

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "interrupt":
      console.log("Caller interrupted. Heard:", msg.utteranceUntilInterrupt);

      // 1. Abort the active OpenAI stream
      if (activeStream) {
        activeStream.controller.abort();
        activeStream = null;
      }

      // 2. Trim the last assistant message to what was actually heard
      const lastMsg = conversationHistory[conversationHistory.length - 1];
      if (lastMsg?.role === "assistant") {
        lastMsg.content = msg.utteranceUntilInterrupt;
      }
      break;

    case "prompt":
      // The caller's new speech arrives here
      handlePrompt(ws, msg);
      break;

    // ... other message types
  }
}`,
    },

    { type: "section", title: "TwiML Configuration" },

    {
      type: "prose",
      content:
        "You control interruption behavior through TwiML attributes on the `<ConversationRelay>` element. These are set when the call first connects, not at runtime.",
    },

    {
      type: "code",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      interruptible="speech"
      dtmfDetection="true"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      content: "The `interruptible` attribute controls what can interrupt AI speech. It accepts four values:",
    },

    {
      type: "prose",
      content:
        '**`"any"`** (the default) -- both voice and DTMF keypresses interrupt. **`"speech"`** -- only voice interrupts, keypresses are silently collected. **`"dtmf"`** -- only keypresses interrupt. **`"none"`** -- the AI always finishes speaking before accepting new input (useful for legal disclaimers or important announcements).',
    },

    {
      type: "callout",
      variant: "tip",
      content:
        'Keep `interruptible` set to `"any"` (the default) for natural conversation flow. Use `"none"` only for specific messages where the caller must hear the full content.',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why utteranceUntilInterrupt matters",
      content:
        "If you do not trim the assistant message in your conversation history, the LLM will think the caller heard the entire response. This leads to confusing exchanges where the AI references information it never actually delivered. By replacing the assistant message content with `utteranceUntilInterrupt`, you give the LLM an accurate picture of the conversation so far.\n\nSome advanced implementations also add a system note like \"[caller interrupted here]\" to help the LLM understand the context shift.",
    },
  ],
} satisfies StepDefinition;
