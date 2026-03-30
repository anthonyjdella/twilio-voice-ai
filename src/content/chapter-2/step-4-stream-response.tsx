import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ShowSolution } from "@/components/content/ShowSolution";
import { JsonMessage } from "@/components/content/JsonMessage";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function StreamResponse() {
  return (
    <>
      <ArchitectureDiagram highlight="llm" />

      <SectionHeader>Connecting to the LLM</SectionHeader>

      <Prose>
        Now for the exciting part. When the caller speaks, you need to send
        their words to an LLM, get a response, and stream it back through the
        WebSocket so Twilio can speak it to the caller. We will use
        OpenAI&apos;s <code>chat.completions.create</code> API with streaming
        enabled so the caller hears the response as quickly as possible instead
        of waiting for the full reply.
      </Prose>

      <SectionHeader>Install the OpenAI SDK</SectionHeader>

      <Prose>
        First, add the OpenAI package to your project:
      </Prose>

      <CodeBlock
        language="bash"
        code={`npm install openai`}
      />

      <Prose>
        Then add the import and client initialization at the top of{" "}
        <code>server.js</code>:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={1}
        code={`const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}
      />

      <SectionHeader>The Text Response Format</SectionHeader>

      <Prose>
        To send speech back to the caller, you send <code>text</code> messages
        through the WebSocket. Each message contains a <code>token</code> field
        with a chunk of text. Set <code>last: false</code> for intermediate
        tokens and <code>last: true</code> for the final one. Twilio begins
        text-to-speech as soon as the first token arrives, so the caller hears
        the response with minimal delay.
      </Prose>

      <JsonMessage
        direction="outbound"
        type="text (streaming token)"
        code={`{
  "type": "text",
  "token": "Sure, I'd be happy to ",
  "last": false
}`}
      />

      <JsonMessage
        direction="outbound"
        type="text (final token)"
        code={`{
  "type": "text",
  "token": "help you with your account.",
  "last": true
}`}
      />

      <Callout type="warning">
        You <strong>must</strong> send exactly one message with{" "}
        <code>last: true</code> to signal the end of your response. If you
        forget this, Twilio will keep waiting for more tokens and the caller
        will hear silence. If you send <code>last: true</code> more than once,
        Twilio will treat each as a separate utterance.
      </Callout>

      <SectionHeader>Streaming Implementation</SectionHeader>

      <Prose>
        Create an async function that takes the conversation history, calls
        OpenAI with streaming, and sends each chunk back through the WebSocket
        as a <code>text</code> message:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={40}
        code={`async function streamLLMResponse(ws, conversationHistory) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful phone assistant. Keep responses concise and conversational -- the caller is listening, not reading.",
        },
        ...conversationHistory,
      ],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (!content) continue;

      fullResponse += content;

      // Send each token to Twilio
      ws.send(JSON.stringify({
        type: "text",
        token: content,
        last: false,
      }));
    }

    // Signal the end of the response
    ws.send(JSON.stringify({
      type: "text",
      token: "",
      last: true,
    }));

    // Save the full response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: fullResponse,
    });

  } catch (error) {
    console.error("LLM error:", error);
    ws.send(JSON.stringify({
      type: "text",
      token: "I'm sorry, I encountered an error. Could you repeat that?",
      last: true,
    }));
  }
}`}
      />

      <SectionHeader>Wire It Up</SectionHeader>

      <Prose>
        Replace the <code>TODO</code> comment in your prompt handler with a
        call to <code>streamLLMResponse</code>:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={34}
        code={`      case "prompt":
        if (!message.last) break;

        console.log(\`Caller said: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // Stream the LLM response back to Twilio
        streamLLMResponse(ws, conversationHistory);

        break;`}
      />

      <Callout type="tip">
        Notice we are not using <code>await</code> on{" "}
        <code>streamLLMResponse</code>. The function runs asynchronously and
        sends tokens as they arrive. The WebSocket handler can continue
        processing other messages (like interruptions) while the response
        streams.
      </Callout>

      <DeepDive title="Why stream instead of waiting for the full response?">
        <p>
          A full GPT-4o response can take 2-5 seconds to generate. If you wait
          for the complete response before sending it, the caller sits in silence
          for that entire duration -- which feels unnatural and broken on a phone
          call. By streaming tokens as they arrive, Twilio can begin
          text-to-speech within 200-500ms. The caller hears the AI start
          speaking almost immediately, just like a real conversation.
        </p>
      </DeepDive>

      <ShowSolution
        file="server.js"
        language="javascript"
        explanation="The complete server with OpenAI streaming integration. Each LLM token is forwarded to Twilio as a text message, and the full response is saved to conversation history for context."
        code={`const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const server = http.createServer((req, res) => {
  if (req.url === "/incoming" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-ngrok-url.ngrok-free.app"
      voice="en-US-Journey-F"
      dtmfDetection="true"
      interruptible="true"
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
});

async function streamLLMResponse(ws, conversationHistory) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful phone assistant. Keep responses concise and conversational -- the caller is listening, not reading.",
        },
        ...conversationHistory,
      ],
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (!content) continue;

      fullResponse += content;

      ws.send(JSON.stringify({
        type: "text",
        token: content,
        last: false,
      }));
    }

    ws.send(JSON.stringify({
      type: "text",
      token: "",
      last: true,
    }));

    conversationHistory.push({
      role: "assistant",
      content: fullResponse,
    });

  } catch (error) {
    console.error("LLM error:", error);
    ws.send(JSON.stringify({
      type: "text",
      token: "I'm sorry, I encountered an error. Could you repeat that?",
      last: true,
    }));
  }
}

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection from Twilio");

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

      case "prompt":
        if (!message.last) break;

        console.log(\`Caller said: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        streamLLMResponse(ws, conversationHistory);
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
