import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Interruption Handling" },

    { type: "diagram", variant: "architecture", highlight: "websocket" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Why Barge-In Matters",
      content:
        "Real conversations aren't turn-based. People cut each other off, change their mind mid-sentence, and repeat themselves when they feel unheard. If a voice agent insists on finishing every sentence before listening, it feels robotic fast. Barge-in is the feature that lets the caller interrupt at any moment, and it's half the reason a ConversationRelay agent feels alive.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Real conversations are messy. People interrupt, change their minds mid-sentence, and talk over each other. A great voice agent handles all of this gracefully. ConversationRelay has built-in **barge-in** support -- when a caller speaks while the AI is still talking, Twilio detects it, stops the AI mid-sentence, and sends a WebSocket message describing what happened.",
    },

    { type: "section", title: "How Barge-In Works", audience: "builder" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "When a caller interrupts, the system immediately stops the AI's voice, notes how much the caller actually heard, and then processes whatever the caller said next. The conversation picks up from there.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the flow when a caller interrupts:\n\n1. The AI agent is speaking to the caller.\n2. The caller starts talking before the agent finishes.\n3. Twilio immediately stops the agent's voice and sends an `interrupt` message over the WebSocket.\n4. The server cancels the in-flight LLM stream so it stops generating text nobody will hear.\n5. Twilio sends the caller's new speech as a `prompt` message, and the conversation continues from there.",
    },

    { type: "section", title: "The Interrupt Message", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When barge-in occurs, ConversationRelay sends this message over the WebSocket:",
    },

    {
      type: "json-message",
      audience: "builder",
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
      audience: "builder",
      content:
        "`utteranceUntilInterrupt` tells you exactly how much of the AI's response the caller heard before they cut in. The AI needs this so it doesn't reference something it said but the caller never heard.",
    },

    { type: "section", title: "Handling the Interrupt", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When the caller interrupts, the server needs to stop the AI from continuing its reply and update the conversation history so the AI knows what the caller actually heard.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Scope change -- this is a move, not an add.** Up through Chapter 3, `conversationHistory` was declared *inside* `wss.on(\"connection\", ...)` as per-call state. Starting in this chapter, move it to module scope so `handlePrompt`, the interrupt handler, and the tool loop in Chapter 5 can all share it.\n\n**Refactoring checklist:**\n\n1. Find `const conversationHistory = [...]` inside `wss.on(\"connection\", ...)` -- **delete that line.**\n2. Find `async function streamLLMResponse(ws, conversationHistory)` from Chapter 2 -- **delete the entire function.**\n3. Paste the module-scope code block below at the **top of `server.js`**, outside any handler.\n4. Verify `model` is set to `\"gpt-5.4-nano\"`.\n\nThe new `streamResponse` replaces `streamLLMResponse` -- same streaming idea, but it reads `conversationHistory` from module scope and adds `AbortController` support. If you paste additively without removing the old declarations, the per-connection variable shadows the module-scope one and interrupt/tool-call handlers will write to the wrong array.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `// Module-scope state for the current call. For a single-caller workshop
// server this is fine; in production, key these off callSid.
const conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }, // from Chapter 3
];

// The AbortController for the in-flight OpenAI stream, or null when idle
let activeStream = null;

// Streams an assistant turn using whatever is currently in conversationHistory.
// Split out so DTMF (Step 2) and tool calls (Chapter 5) can invoke it after
// they push their own synthetic user turns.
async function streamResponse(ws) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create(
    {
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      stream: true,
    },
    { signal: activeStream.signal } // <- cancellation hook
  );

  try {
    let assistantText = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        assistantText += token;
        // Stream each token with last=false; signal end after the loop
        sendText(ws, token);
      }
    }
    sendText(ws, "", true);
    conversationHistory.push({ role: "assistant", content: assistantText });
  } catch (err) {
    if (err.name !== "AbortError") throw err;
    // Stream was aborted by an interrupt -- history is trimmed in handleInterrupt
  } finally {
    activeStream = null;
  }
}

function handlePrompt(ws, msg) {
  conversationHistory.push({ role: "user", content: msg.voicePrompt });
  streamResponse(ws);
}

function handleInterrupt(msg) {
  console.log("Caller interrupted. Heard:", msg.utteranceUntilInterrupt);

  // 1. Abort the active OpenAI stream (if one is running)
  if (activeStream) {
    activeStream.abort();
    activeStream = null;
  }

  // 2. Replace the last assistant turn with only what the caller heard
  const lastMsg = conversationHistory[conversationHistory.length - 1];
  if (lastMsg?.role === "assistant") {
    lastMsg.content = msg.utteranceUntilInterrupt;
  }
}

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "interrupt":
      handleInterrupt(msg);
      break;

    case "prompt":
      // The caller's new speech arrives here
      handlePrompt(ws, msg);
      break;

    // ... other message types
  }
}`,
    },

    { type: "section", title: "Interruption Settings", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Interruption behavior is controlled through attributes on the ConversationRelay TwiML element, set when the call first connects:",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      interruptible="speech"
      dtmfDetection="true"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The `interruptible` attribute accepts four values:\n\n**`\"any\"`** (the default) -- both voice and DTMF keypresses interrupt. **`\"speech\"`** -- only voice interrupts, keypresses are silently collected. **`\"dtmf\"`** -- only keypresses interrupt. **`\"none\"`** -- the AI always finishes speaking before accepting new input (useful for legal disclaimers or important announcements).",
    },

    {
      type: "callout",
      audience: "builder",
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
