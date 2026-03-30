import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ShowSolution } from "@/components/content/ShowSolution";
import { JsonMessage } from "@/components/content/JsonMessage";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function WebSocketServer() {
  return (
    <>
      <ArchitectureDiagram highlight="server" />

      <SectionHeader>Your WebSocket Server</SectionHeader>

      <Prose>
        ConversationRelay communicates with your application over a persistent
        WebSocket connection. When a call connects, Twilio opens a WebSocket to
        your server and streams JSON messages back and forth for the entire
        duration of the call. Your job is to stand up a server that can accept
        that connection.
      </Prose>

      <Prose>
        We will use the <code>ws</code> npm package to create a lightweight
        WebSocket server in Node.js. Create a file called{" "}
        <code>server.js</code> in the root of your project.
      </Prose>

      <SectionHeader>The Skeleton</SectionHeader>

      <Prose>
        Start with this minimal structure. It creates an HTTP server, attaches a
        WebSocket server to it, and listens for incoming connections:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={1}
        code={`const { WebSocketServer } = require("ws");
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
});`}
      />

      <SectionHeader>The Setup Message</SectionHeader>

      <Prose>
        The very first message Twilio sends over the WebSocket is a{" "}
        <code>setup</code> message. This arrives immediately after the
        connection is established and contains metadata about the call --
        including the caller&apos;s phone number, the Twilio call SID, and any
        custom parameters you passed in your TwiML.
      </Prose>

      <JsonMessage
        direction="inbound"
        type="setup"
        code={`{
  "type": "setup",
  "callSid": "CA1234567890abcdef1234567890abcdef",
  "from": "+15551234567",
  "to": "+15559876543",
  "customParameters": {}
}`}
      />

      <Prose>
        You should handle the <code>setup</code> message to initialize any
        per-call state, such as a conversation history array for your LLM
        context. This is also a good place to log the call SID for debugging.
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={16}
        code={`wss.on("connection", (ws, req) => {
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
});`}
      />

      <Callout type="tip">
        Each WebSocket connection corresponds to exactly one phone call. When
        the caller hangs up, Twilio closes the WebSocket. This means your
        per-connection variables (like <code>conversationHistory</code>) are
        naturally scoped to a single call -- no session management needed.
      </Callout>

      <DeepDive title="Why WebSocket instead of HTTP?">
        <p>
          Traditional voice bots use HTTP webhooks where Twilio sends a request
          and waits for a TwiML response. This works, but it creates a
          request-response cycle that makes streaming and real-time interaction
          difficult. WebSockets give you a persistent, bidirectional channel --
          your server can push text tokens to Twilio the moment they arrive from
          the LLM, enabling a much more natural conversational feel.
        </p>
      </DeepDive>

      <ShowSolution
        file="server.js"
        language="javascript"
        explanation="This is the complete WebSocket server skeleton. It handles the setup message and logs the call SID. In the next steps we will add TwiML, speech handling, and LLM integration."
        code={`const { WebSocketServer } = require("ws");
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
});`}
      />
    </>
  );
}
