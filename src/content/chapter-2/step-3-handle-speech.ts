import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "websocket-prompt" },

    { type: "section", title: "Receiving the Caller's Speech" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "From Voice to Text",
      content:
        "When the caller says something, Twilio transcribes it into plain text behind the scenes and hands that text to your code as a single \"prompt\" message. You never deal with raw audio -- by the time your code sees it, it's already a tidy string like \"I need help with my order\".",
    },

    {
      type: "prose",
      content:
        "When the caller finishes speaking, Twilio's speech-to-text engine transcribes their words and sends the result to your server as a `prompt` message over the WebSocket. This is the core inbound message you need to handle -- it contains the text of what the caller said.",
    },

    { type: "section", title: "The Prompt Message" },

    {
      type: "prose",
      content:
        'Here is what a `prompt` message looks like when the caller says "Hi, I need help with my account":',
    },

    {
      type: "json-message",
      direction: "inbound",
      messageType: "prompt",
      code: `{
  "type": "prompt",
  "voicePrompt": "Hi, I need help with my account",
  "lang": "en-US",
  "last": true
}`,
    },

    {
      type: "prose",
      content: "The key fields are:",
    },

    {
      type: "prose",
      content:
        "**voicePrompt** -- The transcribed text of what the caller said. This is the input you will send to your LLM.",
    },

    {
      type: "prose",
      content:
        "**lang** -- The detected language of the speech. Useful if you are building a multilingual agent.",
    },

    {
      type: "prose",
      content:
        "**last** -- Indicates whether this is the final transcript for this utterance. Twilio may send partial results with `last: false` as the caller speaks, followed by a final result with `last: true`. For now, we only process messages where `last` is `true`.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "The `last` field is important for avoiding duplicate processing. If you handle every `prompt` message regardless of the `last` field, you will send partial transcripts to your LLM and get multiple overlapping responses. Always check `last === true` before processing.",
    },

    { type: "section", title: "Handle the Prompt" },

    {
      type: "prose",
      content:
        "Add a `prompt` case to your message handler. When a final prompt arrives, add the caller's words to the conversation history and prepare to send them to the LLM:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 26,
      code: `    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`✅ Call started: \${callSid}\`);
        break;

      case "prompt":
        if (!message.last) break; // Ignore partial transcripts

        console.log(\`🗣️ Caller: \${message.voicePrompt}\`);

        // Add to conversation history
        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // TODO: Send to LLM and stream response back
        // (we will implement this in the next step)

        break;

      default:
        console.log("⚠️ Unhandled message type:", message.type);
    }`,
    },

    {
      type: "prose",
      content:
        'The conversation history array follows the OpenAI chat format -- each entry has a `role` (`"user"`, `"assistant"`, or `"system"`) and a `content` string. This makes it straightforward to pass directly to the OpenAI API in the next step.',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Interruption handling and prompt messages",
      content:
        "When the caller interrupts the AI mid-sentence, Twilio sends an `interrupt` message to let your server know that playback was stopped. The next `prompt` message will contain the new thing the caller said. You do not need special handling for interruptions at this stage -- the prompt handler works the same regardless of whether an interruption occurred. We will explore advanced interruption handling in Chapter 4.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The prompt handler checks the last field, logs the transcript, and appends it to the conversation history. The LLM integration comes in the next step.",
      code: `wss.on("connection", (ws, req) => {
  console.log("📞 New WebSocket connection");

  let callSid = null;
  const conversationHistory = [];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`✅ Call started: \${callSid}\`);
        console.log(\`👤 From: \${message.from}\`);
        break;

      case "prompt":
        if (!message.last) break;

        console.log(\`🗣️ Caller: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // TODO: Send to LLM and stream response back

        break;

      default:
        console.log("⚠️ Unhandled message type:", message.type);
    }
  });

  ws.on("close", () => {
    console.log(\`👋 Call ended: \${callSid}\`);
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err);
  });
});`,
    },
  ],
} satisfies StepDefinition;
