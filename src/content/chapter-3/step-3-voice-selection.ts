import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "stt-tts", showTools: true },

    { type: "section", title: "Choosing a Voice" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Voice = The Agent's First Impression",
      content:
        "The voice is the very first thing the caller hears -- before the greeting even finishes, they've already decided whether this feels trustworthy or robotic. ConversationRelay gives you a choice of providers (ElevenLabs, Google, Amazon) and dozens of voices within each, from warm and conversational to crisp and professional. Picking the right one shapes how the whole agent is perceived.",
    },

    {
      type: "prose",
      content:
        "The AI's text replies are converted into spoken audio automatically. The voice the caller hears can range from warm and conversational to crisp and professional, and different providers offer different strengths.",
    },

    { type: "section", title: "Voice Providers" },

    {
      type: "prose",
      content:
        "ConversationRelay supports three voice providers, each with different strengths:",
    },

    {
      type: "prose",
      content:
        "**ElevenLabs (default).** Known for the most natural, human-like voices. Supports a wide range of emotions and speaking styles. This is the default provider.",
    },

    {
      type: "prose",
      content:
        "**Google Cloud TTS.** Offers reliable, clear voices with excellent multilingual support. A solid choice for a wide variety of languages.",
    },

    {
      type: "prose",
      content:
        "**Amazon Polly.** Provides standard and neural voices at competitive pricing. Neural voices from Polly are quite natural, and it is a good option for high-volume workloads.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        "ElevenLabs is the default voice provider. It produces the most natural-sounding voices out of the box.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "**Preview ElevenLabs voices before you pick.** Try different voices side-by-side in the [ElevenLabs Voice Tester](https://elevenlabs-voice-tester-5339-dev.twil.io/index.html) and copy the name of the one you like into your configuration.",
    },

    { type: "page-break" },

    { type: "section", title: "Popular Voices", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here are some popular voices across each provider. Use these as a starting point -- each provider has many more options in their documentation.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**ElevenLabs:** `Rachel` (warm, female), `Drew` (confident, male), `Bella` (soft, female), `Antoni` (friendly, male), `Elli` (youthful, female).",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Google Cloud TTS:** `en-US-Neural2-C` (female), `en-US-Neural2-D` (male), `en-US-Studio-O` (female, studio quality), `en-US-Studio-Q` (male, studio quality). Google also offers newer **Chirp3 HD** voices with names like `en-US-Chirp3-HD-Achernar`. The naming pattern is `language-Model-Quality-VoiceName`.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Amazon Polly:** `Joanna` (female, neural), `Matthew` (male, neural), `Lupe` (female, neural, bilingual en/es), `Amy` (female, British English).",
    },

    { type: "page-break" },

    { type: "section", title: "Configuring the Voice", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "To set a specific voice, update the ConversationRelay settings in your server. Add the `voice` attribute with the voice name, and the `ttsProvider` attribute to select the provider:",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
      highlight: [6, 7],
      code: `<!-- Using ElevenLabs (default provider) -->
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
    />
  </Connect>
</Response>`,
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
      highlight: [6, 7],
      code: `<!-- Using Google Cloud TTS -->
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="en-US-Neural2-C"
      ttsProvider="Google"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "In your server code, the voice settings go inside the TwiML that Twilio reads when a call connects:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: [8, 9],
      code: `// Inside your http.createServer handler:
if (req.url === "/twiml" && req.method === "POST") {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
    />
  </Connect>
</Response>\`;

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml);
}`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Match the voice to the persona. If the agent is \"Ms. Chen, a professional concierge,\" pick a polished, clear voice. If it is \"Jake from Pete's Pizza,\" pick something warmer and more casual.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Voice Latency Considerations",
      content:
        "Different TTS providers have different latency profiles. ElevenLabs voices are extremely natural but may add a few extra milliseconds of processing time compared to Amazon Polly. For most use cases, the difference is negligible because ConversationRelay streams audio incrementally. However, if you are building a latency-critical application and notice delays, experiment with providers to find the best balance between voice quality and response speed.",
    },

    {
      type: "voice-picker",
      audience: "explorer",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Pick a voice that fits your persona and update your server. In the next step, we will configure how the agent listens to the caller.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete `server.js` at the end of this step. The only change from Chapter 3 Step 1 is inside the `/twiml` handler: the `ConversationRelay` element now declares `voice=\"Rachel\"` and `ttsProvider=\"ElevenLabs\"` so Twilio uses that voice for the whole call. Swap in any voice/provider combo from the tables above.",
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

const SYSTEM_PROMPT = \`You are Ava, a friendly and professional virtual concierge
for Acme Corp. You help callers with appointment scheduling, general
company information, and directing them to the right department.

Guidelines:
- Keep every response to one or two sentences.
- Speak naturally as if you're having a real phone conversation.
- Never use markdown, lists, bullet points, or special formatting.
- If the caller asks about something outside Acme Corp, politely
  redirect them: "I'm only able to help with Acme Corp questions,
  but I'd be happy to transfer you to someone who can help."
- If you don't know the answer, say so and offer to connect them
  with a human agent.
- Always confirm actions before taking them: "Just to confirm, you'd
  like to book an appointment for Tuesday at 3pm, is that right?"
- Be warm and personable. Use the caller's name if they share it.\`;

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
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

      console.log("\u{1F4DE} Call initiated:", call.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ callSid: call.sid }));
    } catch (error) {
      console.error("\u274C Call error:", error.message);
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
      messages: conversationHistory,
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
    console.error("\u274C LLM error:", error);
    sendText(ws, "I'm sorry, I encountered an error. Could you repeat that?", true);
  }
}

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log("\u{1F4DE} New WebSocket connection");

  let callSid = null;
  const conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`\u2705 Call started: \${callSid}\`);
        console.log(\`\u{1F464} From: \${message.from}\`);
        break;

      case "prompt":
        if (!message.last) break;

        console.log(\`\u{1F5E3}\uFE0F Caller: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        streamLLMResponse(ws, conversationHistory);
        break;

      default:
        console.log("\u26A0\uFE0F Unhandled message type:", message.type);
    }
  });

  ws.on("close", () => {
    console.log(\`\u{1F44B} Call ended: \${callSid}\`);
  });

  ws.on("error", (err) => {
    console.error("\u274C WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(\`\u{1F680} Server listening on port \${PORT}\`);
});`,
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Your voice selection is saved. The agent will use this voice on your next call.",
    },
  ],
} satisfies StepDefinition;
