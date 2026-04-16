import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "setup" },

    { type: "section", title: "Making an Outbound Call with ConversationRelay" },

    {
      type: "prose",
      content:
        "In this workshop, your server will call the attendee rather than waiting for an incoming call. This is a common pattern for voice AI: the Twilio REST API initiates an outbound call, and a TwiML endpoint on your server tells Twilio how to handle the call once the person picks up. The TwiML uses the `<Connect>` verb with a `<ConversationRelay>` noun to hand the call off to your WebSocket server.",
    },

    { type: "section", title: "Install the Twilio SDK" },

    {
      type: "prose",
      content:
        "You will need the Twilio helper library to initiate outbound calls via the REST API. Install it alongside `ws`:",
    },

    {
      type: "code",
      language: "bash",
      code: "npm install twilio ws",
    },

    { type: "section", title: "The TwiML Endpoint" },

    {
      type: "prose",
      content:
        "Add an HTTP route to your server that responds with TwiML. When Twilio connects the outbound call, it fetches `/twiml` to learn how to handle the call. Your server returns XML that tells Twilio to open a WebSocket connection back to your server and use ConversationRelay to manage speech-to-text and text-to-speech.",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 7,
      code: `const server = http.createServer((req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev"
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

    { type: "section", title: "Initiate the Outbound Call" },

    {
      type: "prose",
      content:
        "Add a `/call` endpoint that uses the Twilio REST API to initiate an outbound call. When triggered, it calls the attendee's phone number and points Twilio at your `/twiml` endpoint for instructions:",
    },

    {
      type: "code",
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
      url="wss://your-codespace-8080.app.github.dev"
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
        url: \`https://your-codespace-8080.app.github.dev/twiml\`,
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

    { type: "section", title: "Key Attributes" },

    {
      type: "prose",
      content:
        "The `<ConversationRelay>` element accepts several important attributes:",
    },

    {
      type: "prose",
      content:
        "**url** -- The WebSocket URL where Twilio should connect. This must be a publicly reachable `wss://` address. In Codespaces, your forwarded port URL is already public and uses TLS.",
    },

    {
      type: "prose",
      content:
        "**welcomeGreeting** -- An optional greeting that Twilio speaks immediately when the call connects, before any WebSocket messages are exchanged. This avoids the initial silence while your server is still initializing.",
    },

    {
      type: "prose",
      content:
        "**dtmfDetection** -- When `true`, Twilio detects keypad presses (DTMF tones) and sends them to your server as messages. This lets the caller press buttons to navigate menus or enter account numbers.",
    },

    {
      type: "prose",
      content:
        "**ttsProvider / transcriptionProvider** -- ConversationRelay defaults to **ElevenLabs** for text-to-speech and **Deepgram** for speech-to-text. Since these are the defaults, we omit them from the TwiML to keep it minimal. You can explicitly set them if you want to use Google or Amazon Polly for TTS, or other STT providers.",
    },

    {
      type: "prose",
      content:
        '**interruptible** -- Controls what can interrupt AI speech. Set to `"any"` (default) to allow both voice and DTMF interruption, `"speech"` for voice only, `"dtmf"` for keypress only, or `"none"` to disable interruption entirely.',
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The `url` attribute must use `wss://` (secure WebSocket), not `ws://`. Twilio requires a secure connection in production, and Codespace port forwarding provides TLS automatically. If you use `ws://`, the connection will fail silently and the call will hang.",
    },

    { type: "section", title: "Codespace Port Forwarding" },

    {
      type: "prose",
      content:
        "Your server is running on port `8080` inside the Codespace. GitHub Codespaces automatically provides a public URL for forwarded ports. Your URL will look like `your-codespace-8080.app.github.dev`. Make sure the port visibility is set to **Public** in the Ports tab.",
    },

    {
      type: "prose",
      content:
        "You will need this URL in two places: the `url` attribute in your TwiML (with the `wss://` scheme for the WebSocket connection), and the `url` parameter in your `calls.create()` call (with the `https://` scheme for the TwiML endpoint).",
    },

    {
      type: "callout",
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
