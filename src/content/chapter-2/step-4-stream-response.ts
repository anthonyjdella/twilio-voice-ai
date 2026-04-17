import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "llm" },

    { type: "section", title: "Connecting to the AI" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Why Streaming Feels Natural",
      content:
        "A large language model can take a few seconds to finish a full reply. Instead of waiting for the whole thing, we hand each word to Twilio the moment it's generated -- so the caller hears the AI start speaking almost immediately, word by word. That tiny trick is what makes the conversation feel alive instead of walkie-talkie.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Imagine texting someone who types their entire paragraph before hitting send — versus someone who sends one sentence at a time. Streaming works the same way: the AI generates words one by one, and we send each word to Twilio the instant it appears. The caller starts hearing the response within milliseconds instead of waiting several seconds for the full answer. That is what makes this feel like a conversation, not a voicemail.",
    },

    {
      type: "prose",
      content:
        "Now for the exciting part. When the caller speaks, you send their words to the AI, get a response, and send it back to Twilio so the caller hears a reply. Instead of waiting for the entire answer, you send each piece the moment it's ready -- so the caller starts hearing a response almost instantly.",
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
        "To send speech back to the caller, your server sends text messages to Twilio. Each message carries a piece of the reply. You mark the last piece with a \"done\" flag so Twilio knows the response is complete. Twilio starts converting text to speech the moment the first piece arrives, so the caller hears a response almost instantly.",
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
      audience: "builder",
      variant: "warning",
      content:
        "You **must** send exactly one message with `last: true` to signal the end of your response. If you forget this, Twilio will keep waiting for more tokens and the caller will hear silence. If you send `last: true` more than once, Twilio will treat each as a separate utterance.",
    },

    { type: "section", title: "Streaming Implementation" },

    {
      type: "prose",
      content:
        "Create a function that sends the conversation to the AI, receives the reply piece by piece, and forwards each piece to Twilio so the caller hears it immediately:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 40,
      code: `// Small helper so we don't repeat JSON.stringify everywhere. You'll
// reach for this in every later chapter -- tool calls, handoff, etc.
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

      // Send each token to Twilio
      sendText(ws, content);
    }

    // Signal the end of the response
    sendText(ws, "", true);

    // Save the full response to conversation history
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

    { type: "section", title: "Wire It Up" },

    {
      type: "prose",
      content:
        "Replace the `TODO` comment in your prompt handler with a call to the streaming function:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 34,
      code: `      case "prompt":
        if (!message.last) break;

        console.log(\`🗣️ Caller: \${message.voicePrompt}\`);

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
        "Notice we are not using `await` here. The function runs in the background, sending each piece of the reply as it arrives. Your server can continue handling other events (like the caller interrupting) while the response streams.",
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
        "The complete server with OpenAI streaming integration. Each LLM token is forwarded to Twilio as a text message, and the full response is saved to conversation history for context.",
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

// Reusable helper: every later chapter sends outbound text through this.
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
