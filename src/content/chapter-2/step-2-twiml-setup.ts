import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "setup", showTools: true },

    { type: "section", title: "Starting the Call" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What “ConversationRelay” Means Here",
      content:
        "ConversationRelay is the Twilio feature at the center of this workshop. Think of it as a live translator sitting between the phone call and the AI -- it listens to the caller, turns their speech into text, hands the text to the AI, turns the AI's reply back into a natural-sounding voice, and plays it to the caller. Everything the workshop wires up in the next few steps is just telling ConversationRelay when to do that, and where to send the text.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "How the Call Gets Started",
      content:
        "The server tells Twilio to dial your phone. When you pick up, Twilio connects the call to the AI agent and plays a welcome greeting so there is no awkward silence.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Before the phone rings, the server has to tell Twilio what kind of call this is -- not just a regular call, but one that should hand every turn over to the AI. That short instruction is what turns an ordinary phone call into an AI-powered one.",
    },

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
      startLine: 8,
      highlight: ["2-17"],
      code: `const server = http.createServer((req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
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
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Env vars used below.** The code references four environment variables, all pre-loaded in your Codespace:\n\n- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` -- identify your Twilio account when placing outbound calls\n- `TWILIO_PHONE_NUMBER` -- the number calls originate from\n- `MY_PHONE_NUMBER` -- your personal number (set in Ch1 Step 4) that Twilio calls during testing\n\nUsing your own Twilio account later? Grab the SID/token from [console.twilio.com](https://console.twilio.com) and a voice-capable number from Phone Numbers.",
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

    { type: "page-break" },

    { type: "section", title: "Key ConversationRelay Attributes", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your TwiML response included a few ConversationRelay attributes. Here is what each one does so you can tune them for your own agent later.",
    },

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
        "**ttsProvider / transcriptionProvider** -- Defaults to **ElevenLabs** (text-to-speech) and **Deepgram** (speech-to-text). We leave these as defaults for now.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '**interruptible** -- Controls what can interrupt AI speech. Defaults to `"any"` (voice and keypad).\n\n**welcomeGreetingInterruptible** -- Same values (`none`/`dtmf`/`speech`/`any`), but governs only the welcome greeting. Defaults to `"any"` -- set it separately if you want the greeting to play through uninterrupted while still allowing interruptions during the rest of the call.',
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The `url` must use `wss://`, not `ws://`. Twilio requires a secure connection. Codespace port forwarding handles this automatically.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why your server only sees text",
      content:
        "Ch1 covered the high-level call flow. The Builder-level takeaway: your server never touches raw audio. Twilio's media servers handle STT and TTS on either side of the WebSocket, so you avoid dealing with audio codecs, voice activity detection, or echo cancellation -- which you *would* have to handle with the Media Streams API. Your server only works with JSON text messages.",
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

wss.on("connection", (ws) => {
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
