import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "DTMF Detection", audience: "builder" },
    { type: "section", title: "The Keypad Still Matters", audience: "explorer" },

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

    {
      type: "image",
      src: "/images/illustrations/woman-looking-at-phone.svg",
      alt: "A person looking at their phone's keypad — the everyday moment of tapping a digit to answer a menu prompt.",
      size: "md",
    },

    { type: "page-break" },

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

    { type: "page-break" },

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
      highlight: ["5-8", "21-48"],
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
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

// DTMF is an always-available shortcut, not a spoken IVR. The TwiML
// welcomeGreeting introduces the agent; mention the keypad options in
// your system prompt or demo script if you want callers to know about
// them ("press 1 for order status, 2 for a representative, 0 to hear
// the menu again").
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

    { type: "page-break" },

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
      highlight: ["1-10"],
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
      reportInputDuringAgentSpeech="any"
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

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "Builds on step 1 by adding handleDtmfInput with a menu system, a sendDigits helper for outbound tones, and routing the dtmf message type to handleDtmfInput. DTMF is an always-available shortcut -- the welcomeGreeting already greeted the caller, so we do not auto-play a spoken menu on setup.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");
const twilio = require("twilio");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SYSTEM_PROMPT = \`You are a helpful voice assistant for Acme Corp.
Keep your responses brief -- one to two sentences at most.
Speak naturally and conversationally.
Never use markdown, bullet points, or numbered lists.
If you don't know something, say so honestly.\`;

// Module-scope state (single-caller workshop server)
const conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT },
];
let activeStream = null;

function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

async function streamResponse(ws) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create(
    {
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      stream: true,
    },
    { signal: activeStream.signal }
  );

  try {
    let assistantText = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        assistantText += token;
        sendText(ws, token);
      }
    }
    sendText(ws, "", true);
    conversationHistory.push({ role: "assistant", content: assistantText });
  } catch (err) {
    if (err.name !== "AbortError") throw err;
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

  if (activeStream) {
    activeStream.abort();
    activeStream = null;
  }

  const lastMsg = conversationHistory[conversationHistory.length - 1];
  if (lastMsg?.role === "assistant") {
    lastMsg.content = msg.utteranceUntilInterrupt;
  }
}

function handleDtmfInput(ws, digit) {
  switch (digit) {
    case "1":
      conversationHistory.push({
        role: "user",
        content: "I want to check my order status.",
      });
      streamResponse(ws);
      break;

    case "2":
      sendText(ws, "Let me transfer you to a representative. " +
        "Please hold for a moment.", true);
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
}

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      console.log("Call started:", msg.callSid);
      break;

    case "prompt":
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      handleInterrupt(msg);
      break;

    case "dtmf":
      console.log("DTMF received:", msg.digit);
      handleDtmfInput(ws, msg.digit);
      break;

    default:
      console.log("Unhandled message type:", msg.type);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      interruptible="any"
      dtmfDetection="true"
      reportInputDuringAgentSpeech="any"
    />
  </Connect>
</Response>\`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  if (req.url === "/call" && req.method === "POST") {
    try {
      const call = await twilioClient.calls.create({
        to: process.env.MY_PHONE_NUMBER,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: \`https://\${req.headers.host}/twiml\`,
      });

      console.log("Call initiated:", call.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ callSid: call.sid }));
    } catch (error) {
      console.error("Call error:", error.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (data) => handleMessage(ws, data));

  ws.on("close", () => {
    console.log("Call ended");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});`,
    },
  ],
} satisfies StepDefinition;
