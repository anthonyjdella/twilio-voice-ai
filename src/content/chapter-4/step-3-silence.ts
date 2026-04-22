import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Silence & Timeouts" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Silence as a Signal",
      content:
        "On a phone call, a long pause means *something* -- the caller is thinking, confused, distracted, or gone. A well-designed agent notices silence and responds: a gentle \"Are you still there?\" after a few seconds, then a polite goodbye if nothing comes back. Getting this right is the difference between an agent that feels considerate and one that feels abandoned.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The agent also adjusts how sensitive it is to background noise. In a quiet room, even a soft \"um\" will register as speech. In a noisier environment, it expects louder, clearer sound so random noises don't accidentally cut the agent off.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Silence is information. When a caller goes quiet, it could mean they are thinking, confused, stepped away, or the call dropped. The agent needs to handle silence gracefully rather than sitting in dead air.",
    },

    {
      type: "image",
      src: "/images/illustrations/question-mark.svg",
      alt: "A floating question mark — the unspoken prompt behind every stretch of silence on a call.",
      size: "sm",
    },

    { type: "page-break" },

    { type: "section", title: "How Silence Detection Works", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay does not send a dedicated \"silence\" message. Instead, the server watches the clock -- if the caller has not spoken for a set amount of time, it can nudge them or gracefully end the call.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-33"],
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
  // Bail if the caller hung up between the timer firing and now.
  if (ws.readyState !== ws.OPEN) return;

  silencePromptCount++;

  if (silencePromptCount >= MAX_SILENCE_PROMPTS) {
    // Too many silences -- end the call gracefully
    sendText(ws, "It seems like you may have stepped away. " +
      "I'll end the call for now. Feel free to call back anytime!", true);
    ws.send(JSON.stringify({ type: "end" }));
    return;
  }

  // Gentle nudge
  const prompts = [
    "Are you still there? Take your time -- I'm here whenever you're ready.",
    "I'm still here if you need anything. Is there something I can help with?",
  ];

  sendText(ws, prompts[silencePromptCount - 1], true);

  // Reset the timer for the next silence check
  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}`,
    },

    { type: "page-break" },

    { type: "section", title: "Integrating with the Message Handler", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Reset the silence timer every time the caller speaks or presses a key. First, update your `handleMessage` function to reset the timer on every event type:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: [8, 12, 18, 23],
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      // welcomeGreeting in TwiML already speaks the greeting,
      // so just start the silence timer here -- no duplicate greeting.
      resetSilenceTimer(ws);
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
}`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Second, inside your **existing** `wss.on(\"connection\", ...)` callback from Chapter 2, add a `ws.on(\"close\", ...)` handler that clears the timer when the call ends. Don't paste a second `wss.on(\"connection\")` -- nest the new close handler alongside the `ws.on(\"message\", ...)` you already have:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["3-6"],
      code: `wss.on("connection", (ws) => {
  // ...your existing ws.on("message", (data) => handleMessage(ws, data))
  // stays here; add the close handler below:
  ws.on("close", () => {
    clearTimeout(silenceTimer);
    console.log("Call ended, timers cleared.");
  });
});`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Be careful with the silence timeout value. Too short (under 5 seconds) and you will interrupt callers who are thinking. Too long (over 15 seconds) and the experience feels unresponsive. Start with 8-10 seconds and adjust based on your use case.\n\nAlso remember that the total dead-air budget is `SILENCE_TIMEOUT_MS × MAX_SILENCE_PROMPTS`. With the defaults (8s × 2) the caller sits in silence for up to 16 seconds before the call ends, so tune both numbers together.",
    },

    { type: "page-break" },

    { type: "section", title: "Interrupt Sensitivity", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay provides an `interruptSensitivity` attribute that controls how easily the caller's speech triggers an interrupt -- how Twilio distinguishes intentional speech from background noise:",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "twiml-response",
      highlight: [6],
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://<your-server-host>/ws"
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
      reportInputDuringAgentSpeech="any"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '`interruptSensitivity` accepts `"low"`, `"medium"`, or `"high"` (the default). At `"high"`, even brief sounds can trigger an interrupt. Use `"medium"` or `"low"` in noisy environments where background sounds might be mistaken for speech.',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Advanced timeout strategies",
      content:
        "For production agents, consider implementing tiered timeouts based on context:\n\n**Short timeout (5s)** after asking a yes/no question -- the caller should respond quickly.\n\n**Medium timeout (10s)** for open-ended questions -- give the caller time to think.\n\n**Long timeout (20s)** when you have asked the caller to look something up, like an order number or account details.\n\nYou can track the \"expected response type\" in your conversation state and adjust the timer accordingly.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "Builds on step 2 by adding silence detection constants, a resetSilenceTimer/handleSilence pair, integrating timer resets into every handleMessage case, and clearing the timer on WebSocket close.",
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

const SILENCE_TIMEOUT_MS = 8000;
const MAX_SILENCE_PROMPTS = 2;

// Module-scope state (single-caller workshop server)
const conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT },
];
let activeStream = null;
let silenceTimer = null;
let silencePromptCount = 0;

function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

function resetSilenceTimer(ws) {
  clearTimeout(silenceTimer);
  silencePromptCount = 0;

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}

function handleSilence(ws) {
  if (ws.readyState !== ws.OPEN) return;

  silencePromptCount++;

  if (silencePromptCount >= MAX_SILENCE_PROMPTS) {
    sendText(ws, "It seems like you may have stepped away. " +
      "I'll end the call for now. Feel free to call back anytime!", true);
    ws.send(JSON.stringify({ type: "end" }));
    return;
  }

  const prompts = [
    "Are you still there? Take your time -- I'm here whenever you're ready.",
    "I'm still here if you need anything. Is there something I can help with?",
  ];

  sendText(ws, prompts[silencePromptCount - 1], true);

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
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
      resetSilenceTimer(ws);
      break;

    case "prompt":
      resetSilenceTimer(ws);
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      resetSilenceTimer(ws);
      handleInterrupt(msg);
      break;

    case "dtmf":
      resetSilenceTimer(ws);
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
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
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
    clearTimeout(silenceTimer);
    console.log("Call ended, timers cleared.");
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
