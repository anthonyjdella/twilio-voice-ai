import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "server" },

    { type: "section", title: "Your WebSocket Server" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What a WebSocket Server Does Here",
      content:
        "A WebSocket is a two-way pipe that stays open for the whole phone call. Twilio uses it to stream the caller's words to your code as text, and to stream your AI's replies back as text -- no audio files, no reconnecting between turns. Your \"server\" is just the program listening at the other end of that pipe.",
    },

    {
      type: "prose",
      content:
        "When a call connects, Twilio opens a live two-way channel to your server that stays open for the entire call. The caller's words flow in as text, and your AI's replies flow out as text. Your job is to set up a server that can keep that channel open.",
    },

    {
      type: "prose",
      content:
        "We will use the `ws` npm package to create a lightweight WebSocket server in Node.js, plus `dotenv` to load the credentials from your `.env` file. Install them now:",
    },

    {
      type: "code",
      language: "bash",
      code: "npm install ws dotenv",
    },

    {
      type: "prose",
      content:
        "Now create a file called `server.js` in the root of your project.",
    },

    { type: "section", title: "The Skeleton" },

    {
      type: "prose",
      content:
        "Start with this minimal structure. It loads your `.env` file, creates an HTTP server, attaches a WebSocket server to it, and listens for incoming connections:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 1,
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = 8080;

// Create a basic HTTP server (Twilio needs HTTP for TwiML)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

// Attach WebSocket server. The "/ws" path keeps WebSocket upgrades isolated
// from HTTP routes like /twiml and /call on the same server.
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log("📞 New WebSocket connection");

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("📨 Received:", message.type);

    // We will handle different message types here
  });

  ws.on("close", () => {
    console.log("👋 WebSocket connection closed");
  });

  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(\`🚀 Server listening on port \${PORT}\`);
});`,
    },

    { type: "section", title: "The Setup Message" },

    {
      type: "prose",
      content:
        "The very first message Twilio sends through the connection is a `setup` message. This arrives immediately when the call connects and contains information about the call -- including the phone numbers involved and a unique identifier for the call.",
    },

    {
      type: "json-message",
      direction: "inbound",
      messageType: "setup",
      code: `{
  "type": "setup",
  "sessionId": "VX00000000000000000000000000000000",
  "callSid": "CA1234567890abcdef1234567890abcdef",
  "accountSid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "from": "+15551234567",
  "to": "+15559876543",
  "direction": "outbound",
  "callStatus": "RINGING",
  "customParameters": {}
}`,
    },

    {
      type: "prose",
      content:
        "You should handle the `setup` message to prepare for the call -- for example, creating a blank conversation history and saving the call ID for your logs.",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 16,
      code: `wss.on("connection", (ws, req) => {
  console.log("📞 New WebSocket connection");

  // Per-call state
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
});`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Each connection corresponds to exactly one phone call. When the caller hangs up, the connection closes automatically. This means each call gets its own conversation history -- no extra bookkeeping needed.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why WebSocket instead of HTTP?",
      content:
        "Traditional voice bots use HTTP webhooks where Twilio sends a request and waits for a TwiML response. This works, but it creates a request-response cycle that makes streaming and real-time interaction difficult. WebSockets give you a persistent, bidirectional channel -- your server can push text tokens to Twilio the moment they arrive from the LLM, enabling a much more natural conversational feel.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "This is the complete WebSocket server skeleton. It handles the setup message and logs the call SID. In the next steps we will add TwiML, speech handling, and LLM integration.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = 8080;

// Create a basic HTTP server (Twilio needs HTTP for TwiML)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

// Attach WebSocket server. The "/ws" path keeps WebSocket upgrades isolated
// from HTTP routes like /twiml and /call on the same server.
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log("📞 New WebSocket connection");

  // Per-call state
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
