import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "DTMF Detection" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Keypad = Accessibility + Accuracy",
      content:
        "DTMF is the old-school phone keypad -- the beeps when you press 1, 2, 3. It's still the most reliable way to capture exact info: credit card digits, account numbers, a menu selection in a noisy room. Supporting the keypad alongside natural speech makes the agent work for callers who can't speak (or just shouldn't, in a meeting) without losing the conversational feel for everyone else.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "When a caller presses keys on their phone, Twilio detects the tone and tells the AI which key was pressed. This means the agent can offer menu options like \"press 1 for support\" alongside normal conversation.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When a caller presses keys on their phone keypad (like \"press 1 for support\"), those are DTMF tones. Twilio detects these keypresses and sends a WebSocket message with the digit, so you can build menu options alongside the AI conversation.",
    },

    { type: "section", title: "Receiving DTMF Input", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When a caller presses a key, ConversationRelay sends a `dtmf` message:",
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "inbound",
      messageType: "dtmf",
      code: `{
  "type": "dtmf",
  "digit": "1"
}`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Each keypress arrives as a separate message. The `digit` field contains the key that was pressed: `0`-`9`, `*`, or `#`.",
    },

    { type: "section", title: "Handling DTMF in the Message Switch", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Add a `dtmf` case to the message handler. This example builds a simple menu system:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Using `streamResponse` from Step 1.** The `case \"1\":` branch below pushes a synthetic user turn into `conversationHistory` and calls `streamResponse(ws)` -- the helper extracted in Step 1. `streamResponse` reads from module-scope `conversationHistory`, so you don't pass it explicitly.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      // The TwiML welcomeGreeting already said hello. This menu plays
      // right after it, giving the caller DTMF options. Pass last=true
      // so Twilio starts TTS immediately.
      sendText(ws, "Press 1 to check your order status, " +
        "press 2 to speak with a representative, " +
        "or just tell me what you need.", true);
      break;

    case "dtmf":
      console.log("DTMF received:", msg.digit);
      handleDtmfInput(ws, msg.digit);
      break;

    case "prompt":
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      handleInterrupt(msg);
      break;
  }
}

function handleDtmfInput(ws, digit) {
  switch (digit) {
    case "1":
      // Inject context into the LLM conversation
      conversationHistory.push({
        role: "user",
        content: "I want to check my order status."
      });
      streamResponse(ws);
      break;

    case "2":
      sendText(ws, "Let me transfer you to a representative. " +
        "Please hold for a moment.", true);
      // Trigger handoff (covered in Chapter 5)
      break;

    case "0":
      sendText(ws, "Returning to the main menu. " +
        "Press 1 for order status, 2 for a representative, " +
        "or just tell me what you need.", true);
      break;

    default:
      sendText(ws, "I didn't recognize that option. " +
        "Press 1 for order status, or 2 for a representative.", true);
      break;
  }
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "A good pattern is to translate keypad inputs into natural language messages and add them to the conversation history. The AI handles the actual response while the keypad provides a shortcut for common actions.",
    },

    { type: "section", title: "Sending DTMF Tones Outbound", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You can also send keypad tones outbound -- for example, if the AI agent needs to navigate another phone system during a call transfer (like pressing 1 for English):",
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "sendDigits",
      code: `{
  "type": "sendDigits",
  "digits": "1234#"
}`,
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `// Send DTMF tones outbound (e.g., navigating another IVR)
function sendDigits(ws, digits) {
  ws.send(JSON.stringify({
    type: "sendDigits",
    digits: digits
  }));
}

// Example: after transferring to another system
sendDigits(ws, "1");  // Press 1 for English
sendDigits(ws, "3");  // Press 3 for billing`,
    },

    { type: "section", title: "Enabling DTMF Detection", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "DTMF detection is controlled by the `dtmfDetection` attribute in the ConversationRelay TwiML. Make sure it is set to `true`:",
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
      dtmfDetection="true"
      interruptible="any"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        'Setting `interruptible` to `"any"` means both speech and DTMF keypresses stop the AI from speaking. Other options are `"speech"` (voice only), `"dtmf"` (keypress only), or `"none"` (no interruptions).',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Collecting multi-digit input",
      content:
        "If you need to collect a multi-digit input like an account number or PIN, you will need to buffer the digits yourself. Each keypress arrives as a separate `dtmf` message. Use a timer to detect when the caller has finished entering digits:\n\n```javascript\nlet dtmfBuffer = \"\";\nlet dtmfTimeout = null;\n\nfunction handleDtmfInput(ws, digit) {\n  dtmfBuffer += digit;\n  clearTimeout(dtmfTimeout);\n\n  // If # is pressed, process immediately\n  if (digit === \"#\") {\n    processCollectedDigits(ws, dtmfBuffer.slice(0, -1));\n    dtmfBuffer = \"\";\n    return;\n  }\n\n  // Otherwise wait 2 seconds for more digits\n  dtmfTimeout = setTimeout(() => {\n    processCollectedDigits(ws, dtmfBuffer);\n    dtmfBuffer = \"\";\n  }, 2000);\n}\n```",
    },
  ],
} satisfies StepDefinition;
