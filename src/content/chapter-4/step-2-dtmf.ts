import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "DTMF Detection" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Keypad = Accessibility + Accuracy",
      content:
        "DTMF is the old-school phone keypad -- the beeps when you press 1, 2, 3. It's still the most reliable way to capture exact info: credit card digits, account numbers, a menu selection in a noisy room. Supporting the keypad alongside natural speech makes your agent work for callers who can't speak (or just shouldn't, in a meeting) without losing the conversational feel for everyone else.",
    },

    {
      type: "prose",
      content:
        "When a caller presses keys on their phone keypad (like \"press 1 for support\"), those are called DTMF tones. Twilio can detect these keypresses and tell your server which key was pressed, so you can build menu options alongside your AI conversation.",
    },

    { type: "section", title: "Receiving DTMF Input" },

    {
      type: "prose",
      content:
        "When a caller presses a key, ConversationRelay sends a `dtmf` message to your server:",
    },

    {
      type: "json-message",
      direction: "inbound",
      messageType: "dtmf",
      code: `{
  "type": "dtmf",
  "digit": "1"
}`,
    },

    {
      type: "prose",
      content:
        "Each keypress arrives as a separate message. The `digit` field contains the key that was pressed: `0`-`9`, `*`, or `#`.",
    },

    { type: "section", title: "Handling DTMF in Your Message Switch" },

    {
      type: "prose",
      content:
        "Add a `dtmf` case to your message handler. Here is an example that builds a simple menu system:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Using `streamResponse` from Step 1.** The `case \"1\":` branch below pushes a synthetic user turn into `conversationHistory` and then calls `streamResponse(ws)` — the helper we extracted in Step 1 so DTMF and tool calls (Chapter 5) could both reuse it. `streamResponse` reads from module-scope `conversationHistory`, so you don't pass it explicitly.",
    },

    {
      type: "code",
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
      console.log("🔢 DTMF received:", msg.digit);
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
      variant: "tip",
      content:
        "A good pattern is to translate keypad inputs into natural language messages and add them to the conversation history. This way, the AI handles the actual response while the keypad just provides a shortcut for common actions.",
    },

    { type: "section", title: "Sending DTMF Tones Outbound" },

    {
      type: "prose",
      content:
        "You can also send keypad tones outbound -- for example, if your AI agent needs to navigate another phone system during a call transfer (like pressing 1 for English). Send a `sendDigits` message:",
    },

    {
      type: "json-message",
      direction: "outbound",
      messageType: "sendDigits",
      code: `{
  "type": "sendDigits",
  "digits": "1234#"
}`,
    },

    {
      type: "code",
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

    { type: "section", title: "Enabling DTMF Detection" },

    {
      type: "prose",
      content:
        "DTMF detection is controlled by the `dtmfDetection` setting in your ConversationRelay configuration. Make sure it is set to `true`:",
    },

    {
      type: "code",
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
      content:
        "Setting `interruptible` to `\"any\"` means that both speech and DTMF keypresses will stop the AI from speaking. Other options are `\"speech\"` (voice only), `\"dtmf\"` (keypress only), or `\"none\"` (no interruptions).",
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
