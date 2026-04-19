import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "setup", showTools: true },

    { type: "section", title: "Starting the Call" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "How the Call Gets Started",
      content:
        "The server tells Twilio to dial your phone. When you pick up, Twilio connects the call to the AI agent and plays a welcome greeting so there is no awkward silence.",
    },

    { type: "page-break" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your server needs two things: a way to trigger an outbound call, and instructions that tell Twilio what to do when someone answers. Twilio calls these instructions TwiML -- a short XML response that says \"connect this call to my AI agent via ConversationRelay.\"",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Install the Twilio SDK:",
    },

    {
      type: "code",
      audience: "builder",
      language: "bash",
      code: "npm install twilio",
    },

    { type: "section", title: "The TwiML Endpoint", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When Twilio connects the call, it asks your server what to do. Add a `/twiml` route that tells Twilio to use ConversationRelay:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 7,
      highlight: ["2-17"],
      code: `const server = http.createServer((req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
    />
  </Connect>
</Response>\`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});`,
    },

    { type: "page-break" },

    { type: "section", title: "Initiate the Outbound Call", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Add a `/call` endpoint that dials your phone and points Twilio at the TwiML route:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 1,
      highlight: [4, "8-11", 13, "31-49"],
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const twilio = require("twilio");

const PORT = 8080;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
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

      console.log("📞 Call initiated:", call.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ callSid: call.sid }));
    } catch (error) {
      console.error("❌ Call error:", error.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});`,
    },

    { type: "section", title: "Key ConversationRelay Attributes", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**url** -- Secure WebSocket address (`wss://`) where Twilio connects to your server. The code uses `req.headers.host` so it works automatically in Codespaces.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**welcomeGreeting** -- Twilio speaks this immediately when the call connects, before your server does anything. Avoids initial silence.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**dtmfDetection** -- When `true`, Twilio detects keypad presses and sends them to your server.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**ttsProvider / transcriptionProvider** -- Defaults to **ElevenLabs** (text-to-speech) and **Deepgram** (speech-to-text). We leave these as defaults for now.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '**interruptible** -- Controls what can interrupt AI speech. Defaults to `"any"` (voice and keypad).',
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The `url` must use `wss://`, not `ws://`. Twilio requires a secure connection. Codespace port forwarding handles this automatically.",
    },

    { type: "page-break" },

    { type: "section", title: "Codespace Port Forwarding", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Make sure port `8080` visibility is set to **Public** in the Codespace Ports tab so Twilio can reach your server from the internet.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Right-click port 8080 in the Ports tab and select \"Port Visibility\" > \"Public\". The URL is stable for the lifetime of the Codespace.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "How ConversationRelay works under the hood",
      content:
        "When the call connects, Twilio's media servers handle all the audio processing. The caller's speech is converted to text using a speech-to-text engine (Deepgram by default), and that text is sent to your server as a JSON message over the WebSocket. When your server sends text back, Twilio's text-to-speech engine (ElevenLabs by default) converts it to audio and plays it to the caller. Your server never touches raw audio -- it only works with text, which makes the integration dramatically simpler than using Media Streams directly.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete server after adding TwiML and the /call endpoint. The WebSocket handler is in place but does not yet send anything to an LLM.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const twilio = require("twilio");

const PORT = 8080;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
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

      console.log("📞 Call initiated:", call.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ callSid: call.sid }));
    } catch (error) {
      console.error("❌ Call error:", error.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log("📞 New WebSocket connection");

  let callSid = null;

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`✅ Call started: \${callSid}\`);
        console.log(\`👤 From: \${message.from}\`);
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
});

server.listen(PORT, () => {
  console.log(\`🚀 Server listening on port \${PORT}\`);
});`,
    },
  ],
} satisfies StepDefinition;
