import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "setup", showTools: true },

    { type: "section", title: "Making an Outbound Call with ConversationRelay" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "TwiML in One Minute",
      content:
        "TwiML is a short instruction sheet you hand to Twilio. When a call connects, Twilio reads it and does what it says -- \"play this greeting\", \"connect to my server\", \"listen for keypresses\". In this workshop, one short set of instructions is all it takes to wire a live phone call into the AI agent.",
    },

    {
      type: "prose",
      content:
        "In this workshop, the server calls you rather than waiting for an incoming call. When someone picks up, Twilio asks the server \"what should I do with this call?\" and the server replies with a short set of instructions that says \"connect this call to my AI agent.\" That handoff is what wires the live phone call into the code.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "This is a two-step process: first, the server triggers Twilio to dial your phone. Then, when you answer, Twilio calls back to the server asking for instructions. The server tells Twilio to open a live connection for the AI conversation.",
    },

    { type: "section", title: "Install the Twilio SDK", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You will need the Twilio library to make outbound calls. Install it now:",
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
        "Add a route to your server that responds with instructions. When Twilio connects the outbound call, it asks your server what to do. Your server replies with a short set of instructions that tells Twilio to connect the call to your AI agent.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      startLine: 7,
      code: `const server = http.createServer((req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    // req.headers.host is the public host Twilio just used to reach us
    // (e.g. your-codespace-8080.app.github.dev). Using it means the same
    // code works in Codespaces, ngrok, and production with no edits.
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

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});`,
    },

    { type: "section", title: "Initiate the Outbound Call", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Add a `/call` endpoint that tells Twilio to call your phone. When triggered, it dials your number and points Twilio at your instructions endpoint:",
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
});`,
    },

    { type: "section", title: "How the Connection Is Configured" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The instructions the server sends to Twilio include a few important settings that control how the call behaves:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The ConversationRelay instruction accepts several important settings:",
    },

    {
      type: "prose",
      content:
        "**Welcome greeting** -- An optional message that Twilio speaks the moment the call connects, before anything else happens. This avoids the awkward silence while the AI gets ready.",
    },

    {
      type: "prose",
      content:
        "**Keypad detection** -- When enabled, Twilio can detect when the caller presses buttons on their phone. This lets the caller navigate menus or enter account numbers.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**url** -- The address where Twilio connects to your server. This must be a secure `wss://` address that Twilio can reach over the internet. In Codespaces, your forwarded port URL handles this automatically.",
    },

    {
      type: "prose",
      content:
        "**Speech and voice providers** -- ConversationRelay defaults to **ElevenLabs** for turning text into speech and **Deepgram** for turning speech into text. These can be changed later if a different voice or transcription provider is preferred.",
    },

    {
      type: "prose",
      content:
        "**Interruption handling** -- By default, the caller can interrupt the AI mid-sentence by speaking or pressing a key. When that happens, the AI stops talking and listens to the new input.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**reportInputDuringAgentSpeech** -- Controls whether Twilio forwards the caller's speech or DTMF *while the agent is still talking* without triggering a barge-in. Accepts four values: `\"none\"` (default — input during speech is dropped), `\"dtmf\"` (only keypresses forwarded), `\"speech\"` (only voice forwarded), or `\"any\"` (both forwarded). `\"dtmf\"` is handy for \"press 0 for an operator\" flows. Note: this is independent of `interruptible` — barge-in still works regardless of this setting. You'll see this attribute again in the polished TwiML in Chapter 6.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The `url` attribute must use `wss://` (secure connection), not `ws://`. Twilio requires a secure connection, and Codespace port forwarding provides this automatically. If you use `ws://`, the connection will fail silently and the call will hang.",
    },

    { type: "section", title: "Codespace Port Forwarding", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your server is running on port `8080` inside the Codespace. GitHub gives you a public URL automatically. Your URL will look like `your-codespace-8080.app.github.dev`. Make sure the port visibility is set to **Public** in the Ports tab.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "You will need this URL in two places: once with `wss://` for the live connection, and once with `https://` for the call setup. The code handles this automatically using `req.headers.host`.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "In the Codespace Ports tab, right-click your port and select \"Port Visibility\" > \"Public\". Twilio needs to reach your server from the internet. The Codespace URL is stable for the lifetime of the Codespace, so you do not need to update it after restarts.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "How ConversationRelay works under the hood",
      content:
        "When the call connects, Twilio's media servers handle all the audio processing. The caller's speech is converted to text using a speech-to-text engine (Deepgram by default), and that text is sent to your server as a JSON message over the WebSocket. When your server sends text back, Twilio's text-to-speech engine (ElevenLabs by default) converts it to audio and plays it to the caller. Your server never touches raw audio -- it only works with text, which makes the integration dramatically simpler than using Media Streams directly.",
    },
  ],
} satisfies StepDefinition;
