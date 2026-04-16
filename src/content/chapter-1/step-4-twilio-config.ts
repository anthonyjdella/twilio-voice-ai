import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Configure Twilio" },

    {
      type: "prose",
      content:
        "The shared Twilio account is already set up for this workshop. In this step, you'll understand how the outbound call flow works and how your TwiML endpoint tells Twilio to use ConversationRelay.",
    },

    { type: "section", title: "The Outbound Call Flow" },

    {
      type: "concept-card",
      title: "Why Outbound Calls?",
      content:
        "Instead of everyone dialing one phone number (which would require complex routing logic), each attendee's server **calls them**. You click \"Call Me\" in the workshop app, your server uses the Twilio REST API to call your phone, and ConversationRelay takes over. No routing conflicts, no need for 30 phone numbers.",
    },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Your server initiates the call",
          description:
            "When you click \"Call Me\", your server uses the Twilio REST API to create an outbound call to your phone number.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Twilio fetches your TwiML",
          description:
            "Twilio calls your phone and requests instructions from your `/twiml` endpoint. Your server responds with TwiML containing the ConversationRelay configuration.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "ConversationRelay connects",
          description:
            "Twilio opens a WebSocket to your server using the URL in the TwiML. The conversation begins.",
        },
      ],
    },

    { type: "section", title: "The TwiML Response" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What is TwiML?",
      content:
        "TwiML is Twilio's XML-based instruction set for calls. When Twilio needs to know what to do with a call, it asks your server -- your server responds with TwiML that says \"open a ConversationRelay session.\" Twilio then connects your server to the caller via WebSocket.",
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
        "**`url`** -- your WebSocket endpoint (`wss://`), using your Codespace's public forwarded URL. **`welcomeGreeting`** -- spoken immediately when the call connects, before any WebSocket messages. **`dtmfDetection`** -- enables keypad press detection. The defaults handle the rest: **ElevenLabs** for TTS, **Deepgram** for STT, **en-US** language, and **interruptible** set to `\"any\"`.",
    },

    { type: "section", title: "The Outbound Call Code", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "In Chapter 2 you'll write both the REST API call and the TwiML endpoint. Here's a preview of how the outbound call is initiated:",
    },

    {
      type: "code",
      audience: "builder",
      code: `const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initiate an outbound call to the attendee
const call = await client.calls.create({
  to: attendeePhoneNumber,
  from: process.env.TWILIO_PHONE_NUMBER,
  url: \`https://\${process.env.PUBLIC_URL}/twiml\`,
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
        "ConversationRelay supports these TwiML attributes:\n\n- **`url`** (required) -- your `wss://` WebSocket endpoint\n- **`ttsProvider`** -- `\"ElevenLabs\"` (default), `\"Google\"`, or `\"Amazon\"`\n- **`voice`** -- provider-specific voice ID. ElevenLabs default: `UgBBYS2sOqTuMpoF3BR0`. Google example: `en-US-Journey-O`\n- **`transcriptionProvider`** -- `\"Deepgram\"` (default) or `\"Google\"`\n- **`language`** -- BCP-47 code, default `en-US`. Set to `\"multi\"` for automatic detection\n- **`interruptible`** -- `\"any\"` (default), `\"speech\"`, `\"dtmf\"`, or `\"none\"`\n- **`dtmfDetection`** -- `true` to receive keypad presses as WebSocket messages\n- **`welcomeGreeting`** -- text spoken immediately on connection\n- **`hints`** -- comma-separated phrases to improve transcription accuracy\n\nAll providers (ElevenLabs, Google, Amazon Polly, Deepgram) are **bundled into Twilio** -- no separate API keys needed. Just change the TwiML attribute.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        "The key flow: your server calls your phone → Twilio fetches TwiML → TwiML says \"use ConversationRelay\" → WebSocket opens → conversation begins. You'll write this code in the next chapter.",
    },
  ],
} satisfies StepDefinition;
