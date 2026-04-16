import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "llm" },

    { type: "section", title: "Connecting to the LLM" },

    {
      type: "prose",
      content:
        "Now for the exciting part. When the caller speaks, you need to send their words to an LLM, get a response, and stream it back through the WebSocket so Twilio can speak it to the caller. We will use OpenAI's `chat.completions.create` API with streaming enabled so the caller hears the response as quickly as possible instead of waiting for the full reply.",
    },

    { type: "section", title: "Install the OpenAI SDK" },

    {
      type: "prose",
      content: "First, add the OpenAI package to your project:",
    },

    {
      type: "code",
      language: "bash",
      code: "npm install openai",
    },

    {
      type: "prose",
      content:
        "Then add the import and client initialization at the top of `server.js`:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 1,
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`,
    },

    { type: "section", title: "The Text Response Format" },

    {
      type: "prose",
      content:
        "To send speech back to the caller, you send `text` messages through the WebSocket. Each message contains a `token` field with a chunk of text. Set `last: false` for intermediate tokens and `last: true` for the final one. Twilio begins text-to-speech as soon as the first token arrives, so the caller hears the response with minimal delay.",
    },

    {
      type: "json-message",
      direction: "outbound",
      messageType: "text (streaming token)",
      code: `{
  "type": "text",
  "token": "Sure, I'd be happy to ",
  "last": false
}`,
    },

    {
      type: "json-message",
      direction: "outbound",
      messageType: "text (final token)",
      code: `{
  "type": "text",
  "token": "help you with your account.",
  "last": true
}`,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "You **must** send exactly one message with `last: true` to signal the end of your response. If you forget this, Twilio will keep waiting for more tokens and the caller will hear silence. If you send `last: true` more than once, Twilio will treat each as a separate utterance.",
    },

    { type: "section", title: "Streaming Implementation" },

    {
      type: "prose",
      content:
        "Create an async function that takes the conversation history, calls OpenAI with streaming, and sends each chunk back through the WebSocket as a `text` message:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 40,
      code: `async function streamLLMResponse(ws, conversationHistory) {
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
}`,
    },

    { type: "section", title: "Wire It Up" },

    {
      type: "prose",
      content:
        "Replace the `TODO` comment in your prompt handler with a call to `streamLLMResponse`:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 34,
      code: `      case "prompt":
        if (!message.last) break;

        console.log(\`Caller said: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // Stream the LLM response back to Twilio
        streamLLMResponse(ws, conversationHistory);

        break;`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Notice we are not using `await` on `streamLLMResponse`. The function runs asynchronously and sends tokens as they arrive. The WebSocket handler can continue processing other messages (like interruptions) while the response streams.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why stream instead of waiting for the full response?",
      content:
        "A full GPT-4o response can take 2-5 seconds to generate. If you wait for the complete response before sending it, the caller sits in silence for that entire duration -- which feels unnatural and broken on a phone call. By streaming tokens as they arrive, Twilio can begin text-to-speech within 200-500ms. The caller hears the AI start speaking almost immediately, just like a real conversation.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete server with OpenAI streaming integration. Each LLM token is forwarded to Twilio as a text message, and the full response is saved to conversation history for context.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
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
      ttsProvider="google"
      dtmfDetection="true"
      interruptible="any"
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
});`,
    },
  ],
} satisfies StepDefinition;
