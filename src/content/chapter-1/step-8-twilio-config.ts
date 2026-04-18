import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Configure Twilio" },

    {
      type: "prose",
      content:
        "The shared Twilio account is already set up for this workshop. This step covers the instructions your server gives Twilio to connect a call to your AI agent. Remember the call flow from earlier -- your server initiates a call, Twilio asks what to do, and your server responds with TwiML that opens a live connection to the AI.",
    },

    { type: "section", title: "The TwiML Response" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What is TwiML?",
      content:
        "TwiML is a short instruction sheet you hand to Twilio. When Twilio needs to know what to do with a call, it asks your server -- your server responds with TwiML that says \"connect this call to my AI agent.\" Twilio reads the instructions and opens a live two-way connection so your server and the caller can talk.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your server's `/twiml` endpoint responds with XML using the `<Connect>` verb and `<ConversationRelay>` noun. Since we're using the Twilio defaults (ElevenLabs for TTS, Deepgram for STT), the TwiML is minimal:",
    },

    {
      type: "code",
      audience: "builder",
      code: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
    />
  </Connect>
</Response>`,
      language: "xml",
      file: "TwiML Response",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**`url`** -- your WebSocket endpoint (`wss://`), using your Codespace's public forwarded URL. **`welcomeGreeting`** -- spoken immediately when the call connects, before any WebSocket messages. This is a placeholder -- you will customize your agent's greeting in Chapter 3. **`dtmfDetection`** -- enables keypad press detection. The defaults handle the rest: **ElevenLabs** for TTS, **Deepgram** for STT, **en-US** language, and **interruptible** set to `\"any\"`.",
    },

    { type: "section", title: "The Outbound Call Code", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "In Chapter 2 you'll write both the REST API call and the TwiML endpoint. Here's a preview of how the outbound call is initiated. The `url` tells Twilio where to fetch the TwiML that controls the call -- for this workshop that's your own Codespace, derived from the incoming request's `host` header.",
    },

    {
      type: "code",
      audience: "builder",
      code: `const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initiate an outbound call to the attendee. The \`url\` is your public
// Codespace URL -- in Chapter 2 you'll trigger this via a POST to /call,
// and derive the host from \`req.headers.host\`.
const call = await client.calls.create({
  to: attendeePhoneNumber,
  from: process.env.TWILIO_PHONE_NUMBER,
  url: \`https://\${req.headers.host}/twiml\`,
});

console.log("📞 Call initiated:", call.sid);`,
      language: "javascript",
      file: "server.js",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "TwiML Attributes Reference",
      content:
        "ConversationRelay supports these TwiML attributes:\n\n- **`url`** (required) -- your `wss://` WebSocket endpoint\n- **`ttsProvider`** -- `\"ElevenLabs\"` (default), `\"Google\"`, or `\"Amazon\"`\n- **`voice`** -- provider-specific voice ID. ElevenLabs default: `UgBBYS2sOqTuMpoF3BR0`. Google example: `en-US-Chirp3-HD-Achernar`\n- **`transcriptionProvider`** -- `\"Deepgram\"` (default) or `\"Google\"`\n- **`language`** -- BCP-47 code, default `en-US`. Set to `\"multi\"` for automatic detection\n- **`interruptible`** -- `\"any\"` (default), `\"speech\"`, `\"dtmf\"`, or `\"none\"`\n- **`dtmfDetection`** -- `true` to receive keypad presses as WebSocket messages\n- **`welcomeGreeting`** -- text spoken immediately on connection\n- **`hints`** -- comma-separated phrases to improve transcription accuracy\n\nAll providers (ElevenLabs, Google, Amazon Polly, Deepgram) are **bundled into Twilio** -- no separate API keys needed. Just change the TwiML attribute.",
    },

    {
      type: "callout",
      variant: "info",
      audience: "builder",
      content:
        "The key flow: your server calls your phone → Twilio asks your server what to do → your server says \"connect to the AI agent\" → a live connection opens → the conversation begins. You'll write this code in the next chapter.",
    },
    {
      type: "callout",
      variant: "info",
      audience: "explorer",
      content:
        "The key flow: the server calls your phone → Twilio asks the server what to do → the server says \"connect to the AI agent\" → a live connection opens → the conversation begins.",
    },
  ],
} satisfies StepDefinition;
