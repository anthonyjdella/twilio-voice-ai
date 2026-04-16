import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "server" },

    { type: "section", title: "Your WebSocket Server" },

    {
      type: "prose",
      content:
        "ConversationRelay communicates with your application over a persistent WebSocket connection. When a call connects, Twilio opens a WebSocket to your server and streams JSON messages back and forth for the entire duration of the call. Your job is to stand up a server that can accept that connection.",
    },

    {
      type: "prose",
      content:
        "We will use the `ws` npm package to create a lightweight WebSocket server in Node.js. First, install it:",
    },

    {
      type: "code",
      language: "bash",
      code: "npm install ws",
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

// Attach WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection from Twilio");

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    console.log("Received:", message.type);

    // We will handle different message types here
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});`,
    },

    { type: "section", title: "The Setup Message" },

    {
      type: "prose",
      content:
        "The very first message Twilio sends over the WebSocket is a `setup` message. This arrives immediately after the connection is established and contains metadata about the call -- including the caller's phone number, the Twilio call SID, and any custom parameters you passed in your TwiML.",
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
  "direction": "inbound",
  "callStatus": "RINGING",
  "customParameters": {}
}`,
    },

    {
      type: "prose",
      content:
        "You should handle the `setup` message to initialize any per-call state, such as a conversation history array for your LLM context. This is also a good place to log the call SID for debugging.",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 16,
      code: `wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection from Twilio");

  // Per-call state
  let callSid = null;
  const conversationHistory = [];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`Call started: \${callSid}\`);
        console.log(\`Caller: \${message.from}\`);
        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  });
});`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Each WebSocket connection corresponds to exactly one phone call. When the caller hangs up, Twilio closes the WebSocket. This means your per-connection variables (like `conversationHistory`) are naturally scoped to a single call -- no session management needed.",
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

// Attach WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection from Twilio");

  // Per-call state
  let callSid = null;
  const conversationHistory = [];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`Call started: \${callSid}\`);
        console.log(\`Caller: \${message.from}\`);
        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  });

  ws.on("close", () => {
    console.log(\`Call ended: \${callSid}\`);
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
