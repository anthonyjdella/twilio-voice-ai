import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "llm", showTools: true },

    { type: "section", title: "The AI Responds" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "How the AI Talks Back",
      content:
        "The server sends the caller's words to an AI model. Instead of waiting for the full reply, each word is sent to Twilio as it is generated -- so the caller hears the AI start talking almost immediately, just like a real conversation.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Send the caller's words to OpenAI, stream the response token by token, and forward each token to Twilio. The caller hears speech within milliseconds instead of waiting seconds for the full reply.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Install the OpenAI SDK:",
    },

    {
      type: "code",
      audience: "builder",
      language: "bash",
      code: "npm install openai",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Add the import and client at the top of `server.js`:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 1,
      highlight: [4, "8-10"],
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`,
    },

    { type: "page-break" },

    { type: "section", title: "Outbound Text Messages", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your server sends text back to Twilio as JSON messages. Each carries a piece of the reply. Mark the final piece with `last: true` so Twilio knows the response is complete:",
    },

    {
      type: "json-message",
      audience: "builder",
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
      audience: "builder",
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
      audience: "builder",
      variant: "warning",
      content:
        "You **must** send exactly one message with `last: true` to end the response. Missing it causes silence. Sending it more than once creates separate utterances.",
    },

    { type: "page-break" },

    { type: "section", title: "Streaming Implementation", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Create a helper and a streaming function that forwards each token to Twilio:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 40,
      highlight: ["1-40"],
      code: `function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

async function streamLLMResponse(ws, conversationHistory) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
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
      sendText(ws, content);
    }

    sendText(ws, "", true);

    conversationHistory.push({
      role: "assistant",
      content: fullResponse,
    });

  } catch (error) {
    console.error("❌ LLM error:", error);
    sendText(ws, "I'm sorry, I encountered an error. Could you repeat that?", true);
  }
}`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Replace the `TODO` in your prompt handler:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 34,
      highlight: [11],
      code: `      case "prompt":
        if (!message.last) break;

        console.log(\`🗣️ Caller: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        streamLLMResponse(ws, conversationHistory);

        break;`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "No `await` -- the function streams in the background so your server can handle other events (like the caller interrupting) while the response is still generating.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why stream instead of waiting for the full response?",
      content:
        "A full LLM response can take 2-5 seconds to generate. If you wait for the complete response before sending it, the caller sits in silence for that entire duration -- which feels unnatural and broken on a phone call. By streaming tokens as they arrive, Twilio can begin text-to-speech within 200-500ms. The caller hears the AI start speaking almost immediately, just like a real conversation.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete server with OpenAI streaming. Each token is forwarded to Twilio as a text message, and the full response is saved to conversation history.",
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

function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

async function streamLLMResponse(ws, conversationHistory) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
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
      sendText(ws, content);
    }

    sendText(ws, "", true);

    conversationHistory.push({
      role: "assistant",
      content: fullResponse,
    });

  } catch (error) {
    console.error("❌ LLM error:", error);
    sendText(ws, "I'm sorry, I encountered an error. Could you repeat that?", true);
  }
}

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
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

      case "prompt":
        if (!message.last) break;

        console.log(\`🗣️ Caller: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        streamLLMResponse(ws, conversationHistory);
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
