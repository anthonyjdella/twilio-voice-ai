import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "websocket-prompt", showTools: true },

    { type: "section", title: "Listening to the Caller" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "How the Server Hears You",
      content:
        "When you speak during a call, Twilio converts your voice into text and sends it to the server. The server never hears audio -- it just reads what you said, like a live transcript.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The server also keeps a log of the full conversation so the AI remembers what was said earlier. Without this, every reply would start from scratch.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When the caller finishes speaking, Twilio sends a `prompt` message with the transcribed text. Add a handler that saves it to the conversation history:",
    },

    {
      type: "json-message",
      audience: "builder",
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
      audience: "builder",
      content:
        "**voicePrompt** is the transcribed text. **last** indicates whether this is the final transcript -- Twilio may send partial results while the caller is still speaking. Only process messages where `last` is `true`.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 26,
      highlight: ["7-21"],
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
      audience: "builder",
      content:
        "The conversation history follows the OpenAI chat format (`role` + `content`), so it can be passed directly to the API in the next step.",
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
