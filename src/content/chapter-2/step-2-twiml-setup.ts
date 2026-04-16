import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "setup" },

    { type: "section", title: "Connecting Calls to Your Server" },

    {
      type: "prose",
      content:
        'When someone calls your Twilio phone number, Twilio makes an HTTP request to your webhook URL asking "what should I do with this call?" You respond with TwiML (Twilio Markup Language) -- an XML document that tells Twilio how to handle the call. For ConversationRelay, we use the `<Connect>` verb with a `<ConversationRelay>` noun to hand the call off to your WebSocket server.',
    },

    { type: "section", title: "The Incoming Call Handler" },

    {
      type: "prose",
      content:
        "Add an HTTP route to your server that responds with TwiML. When Twilio hits `/incoming`, your server returns XML that tells Twilio to open a WebSocket connection back to your server and use ConversationRelay to manage speech-to-text and text-to-speech.",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 7,
      code: `const server = http.createServer((req, res) => {
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
        "**url** -- The WebSocket URL where Twilio should connect. This must be a publicly reachable `wss://` address. During development, you will use ngrok to tunnel traffic to your local machine.",
    },

    {
      type: "prose",
      content:
        "**voice** -- The TTS voice Twilio uses to speak your text responses back to the caller. Three providers are supported: ElevenLabs (default), Google, and Amazon Polly. We are using `en-US-Journey-F`, a natural-sounding Google voice, with `ttsProvider=\"google\"`.",
    },

    {
      type: "prose",
      content:
        "**dtmfDetection** -- When `true`, Twilio detects keypad presses (DTMF tones) and sends them to your server as messages. This lets the caller press buttons to navigate menus or enter account numbers.",
    },

    {
      type: "prose",
      content:
        '**interruptible** -- Controls what can interrupt AI speech. Set to `"any"` (default) to allow both voice and DTMF interruption, `"speech"` for voice only, `"dtmf"` for keypress only, or `"none"` to disable interruption entirely.',
    },

    {
      type: "prose",
      content:
        "**welcomeGreeting** -- An optional greeting that Twilio speaks immediately when the call connects, before any WebSocket messages are exchanged. This avoids the initial silence while your server is still initializing.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The `url` attribute must use `wss://` (secure WebSocket), not `ws://`. Twilio requires a secure connection in production, and ngrok provides TLS termination automatically. If you use `ws://`, the connection will fail silently and the call will hang.",
    },

    { type: "section", title: "Expose with ngrok" },

    {
      type: "prose",
      content:
        "Your server is running on `localhost:8080`, but Twilio needs a public URL. Open a new terminal and start ngrok:",
    },

    {
      type: "terminal",
      commands: `$ ngrok http 8080
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080`,
    },

    {
      type: "prose",
      content:
        "Copy the `https://` URL from ngrok. You will need it in two places: replace `your-ngrok-url.ngrok-free.app` in your TwiML with the ngrok hostname (keep the `wss://` scheme), and configure your Twilio phone number's voice webhook to point to `https://abc123.ngrok-free.app/incoming`.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Every time you restart ngrok with a free account, you get a new URL. Remember to update both the TwiML `url` attribute and the Twilio phone number webhook. Paid ngrok accounts can use a stable subdomain to avoid this.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "How ConversationRelay works under the hood",
      content:
        "When the call connects, Twilio's media servers handle all the audio processing. The caller's speech is converted to text using a speech-to-text engine, and that text is sent to your server as a JSON message over the WebSocket. When your server sends text back, Twilio's text-to-speech engine converts it to audio and plays it to the caller. Your server never touches raw audio -- it only works with text, which makes the integration dramatically simpler than using Media Streams directly.",
    },
  ],
} satisfies StepDefinition;
