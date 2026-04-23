import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "server", showTools: true },

    { type: "section", title: "The Server" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What the Server Does",
      content:
        "The server is the middleman between the phone call and the AI. It stays connected to Twilio for the entire call, passing the caller's words to the AI and the AI's replies back to the caller.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Think of it like a receptionist who picks up the phone, listens to the caller, and passes their words along to the right person. The connection stays open the whole time -- no hanging up and calling back between turns.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When a call connects, Twilio opens a persistent WebSocket to your server. The caller's words arrive as text messages, and your AI's replies go back as text messages. The connection stays open for the entire call.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Install the `ws` and `dotenv` packages:",
    },

    {
      type: "code",
      audience: "builder",
      language: "bash",
      code: "npm install ws dotenv",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Create `server.js` inside the `workshop/` folder that opens in your Codespace (the terminal is already cwd'd there). It sets up an HTTP server, attaches a WebSocket server, and listens for connections:",
    },

    {
      type: "code",
      audience: "builder",
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

wss.on("connection", (ws) => {
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

    { type: "page-break" },

    { type: "section", title: "The Setup Message", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The first message Twilio sends is a `setup` message with call details. Handle it to save the call ID and initialize the conversation history:",
    },

    {
      type: "json-message",
      audience: "builder",
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
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 17,
      highlight: ["4-6", "11-20"],
      code: `wss.on("connection", (ws) => {
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
      audience: "builder",
      variant: "tip",
      content:
        "Each connection corresponds to exactly one phone call. When the caller hangs up, the connection closes automatically. Each call gets its own conversation history.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why WebSocket instead of HTTP?",
      content:
        "Traditional voice bots use HTTP webhooks where Twilio sends a request and waits for a TwiML response. This works, but it creates a request-response cycle that makes streaming and real-time interaction difficult. WebSockets give you a persistent, bidirectional channel -- your server can push text tokens to Twilio the moment they arrive from the LLM, enabling a much more natural conversational feel.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Conversation Relay Protocol Details",
      content:
        "The Conversation Relay WebSocket protocol uses JSON messages in both directions. Here are the key message types you will work with:\n\n**Inbound (Twilio to your server):**\n\n- `setup` -- Sent once when the WebSocket connects. Contains the session ID, call SID, caller's phone number, call direction, and any custom parameters you passed in your TwiML.\n- `prompt` -- Sent when the caller finishes speaking. Contains the transcribed text in the `voicePrompt` field, the detected language in `lang`, and a `last` boolean indicating whether this is the final transcription for this utterance.\n- `interrupt` -- Sent when the caller starts speaking while the agent is talking. Includes `utteranceUntilInterrupt` (what the caller actually heard) so you can trim conversation history.\n- `dtmf` -- Sent when the caller presses a key on their phone's keypad. Contains the `digit` pressed (singular — each keypress is a separate message).\n- `error` -- Sent when something goes wrong during the session (STT failure, malformed outbound message, etc.). Contains a `description` field with details.\n\n**Outbound (your server to Twilio):**\n\n- `text` -- Send text to be spoken to the caller. Use the `token` field for the text content and `last: true` on the final chunk.\n- `language` -- Switch the TTS and transcription languages mid-call (e.g., `ttsLanguage: \"es-ES\"`).\n- `play` -- Play a pre-recorded audio file to the caller (e.g., hold music, legal disclaimers). Takes a `source` URL and optional `loop` count.\n- `sendDigits` -- Send DTMF tones into the call (e.g., navigating an external phone menu). Takes a `digits` string.\n- `end` -- Terminate the Conversation Relay session, optionally including `handoffData` to trigger a transfer via your action URL.\n\nAll messages are JSON-encoded strings sent over the WebSocket. The protocol is intentionally simple -- no binary frames, no negotiation. This makes it straightforward to implement in any language or framework that supports WebSockets.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete WebSocket server skeleton. It handles the setup message and logs the call SID. In the next steps we will add TwiML, speech handling, and LLM integration.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = 8080;

const server = http.createServer((req, res) => {
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

    {
      type: "concept-card",
      audience: "explorer",
      title: "What Just Went Up",
      content:
        "A server is now running in the Codespace and listening for Twilio to knock on two different doors. One door takes regular web requests -- that is how Twilio asks, \"a call came in, what do I do?\". The other door is a WebSocket -- a two-way line that stays open for the whole call so speech and replies can flow in real time. Nothing intelligent has happened yet. The server is just standing by, ready for the first call to land.",
    },
  ],
} satisfies StepDefinition;
