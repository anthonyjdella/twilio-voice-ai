import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Silence & Timeouts" },

    {
      type: "prose",
      content:
        "Silence is information. When a caller goes quiet, it could mean they are thinking, they are confused, they walked away, or the call dropped. Your agent needs to handle silence gracefully rather than sitting in awkward dead air.",
    },

    { type: "section", title: "How Silence Detection Works" },

    {
      type: "prose",
      content:
        'ConversationRelay does not send a dedicated "silence" message. Instead, you implement silence detection on your server by tracking the time since the last `prompt` message. If no speech arrives within a configurable window, you can prompt the caller or take other action.',
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `const SILENCE_TIMEOUT_MS = 8000;   // 8 seconds of silence
const MAX_SILENCE_PROMPTS = 2;      // Prompt twice, then end call

let silenceTimer = null;
let silencePromptCount = 0;

function resetSilenceTimer(ws) {
  clearTimeout(silenceTimer);
  silencePromptCount = 0;

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}

function handleSilence(ws) {
  silencePromptCount++;

  if (silencePromptCount >= MAX_SILENCE_PROMPTS) {
    // Too many silences -- end the call gracefully
    sendText(ws, "It seems like you may have stepped away. " +
      "I'll end the call for now. Feel free to call back anytime!");
    ws.send(JSON.stringify({ type: "end" }));
    return;
  }

  // Gentle nudge
  const prompts = [
    "Are you still there? Take your time -- I'm here whenever you're ready.",
    "I'm still here if you need anything. Is there something I can help with?",
  ];

  sendText(ws, prompts[silencePromptCount - 1]);

  // Reset the timer for the next silence check
  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}`,
    },

    { type: "section", title: "Integrating with Your Message Handler" },

    {
      type: "prose",
      content:
        "Reset the silence timer every time you receive speech from the caller. Start it after the initial greeting, and clear it when the call ends:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      sendText(ws, "Hello! How can I help you today?");
      resetSilenceTimer(ws);  // Start watching for silence
      break;

    case "prompt":
      resetSilenceTimer(ws);  // Caller spoke -- reset the timer
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      resetSilenceTimer(ws);  // Interruption counts as activity
      handleInterrupt(msg);
      break;

    case "dtmf":
      resetSilenceTimer(ws);  // Keypress counts as activity
      handleDtmfInput(ws, msg.digit);
      break;
  }
}

// Clean up when the WebSocket closes
ws.on("close", () => {
  clearTimeout(silenceTimer);
  console.log("👋 Call ended, timers cleared.");
});`,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Be careful with your silence timeout value. Too short (under 5 seconds) and you will interrupt callers who are thinking. Too long (over 15 seconds) and the experience feels unresponsive. Start with 8-10 seconds and adjust based on your use case.",
    },

    { type: "section", title: "Interrupt Sensitivity" },

    {
      type: "prose",
      content:
        "ConversationRelay provides an `interruptSensitivity` attribute that controls how easily the caller's speech triggers an interrupt. This affects how Twilio distinguishes intentional speech from background noise:",
    },

    {
      type: "code",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      interruptible="any"
      interruptSensitivity="medium"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      content:
        'The `interruptSensitivity` attribute accepts `"low"`, `"medium"`, or `"high"` (the default). At `"high"`, even brief sounds can trigger an interrupt. Use `"medium"` or `"low"` in noisy environments where background sounds might be mistaken for speech.',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Advanced timeout strategies",
      content:
        "For production agents, consider implementing tiered timeouts based on context:\n\n**Short timeout (5s)** after asking a yes/no question -- the caller should respond quickly.\n\n**Medium timeout (10s)** for open-ended questions -- give the caller time to think.\n\n**Long timeout (20s)** when you have asked the caller to look something up, like an order number or account details.\n\nYou can track the \"expected response type\" in your conversation state and adjust the timer accordingly.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "When you end a call due to prolonged silence, log the event. Patterns in silence timeouts can reveal UX issues -- maybe callers do not understand a particular prompt, or the agent is asking for information the caller does not have.",
    },
  ],
} satisfies StepDefinition;
