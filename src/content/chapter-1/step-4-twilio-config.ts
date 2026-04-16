import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Configure Twilio" },

    {
      type: "prose",
      content:
        "Now that your environment is ready, you need to tell Twilio what to do when someone calls your phone number. This means pointing your phone number's webhook at your server and understanding the TwiML response it sends back.",
    },

    { type: "section", title: "Set Up Your Phone Number Webhook" },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/globe.svg",
          title: "Open the Twilio Console",
          description:
            "Go to [Phone Numbers → Manage → Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming).",
        },
        {
          icon: "/images/icons/phone-call.svg",
          title: "Select your number",
          description:
            'Click your phone number. If you don\'t have one, click "Buy a Number" and pick one with voice capability.',
        },
        {
          icon: "/images/icons/connectivity.svg",
          title: "Set the webhook URL",
          description:
            'Under **Voice Configuration → "A call comes in"**, select **Webhook** and enter your ngrok URL + `/incoming`.',
        },
        {
          icon: "/images/icons/settings.svg",
          title: "Set HTTP method to POST",
          description: "Make sure the dropdown next to the URL is set to **POST**.",
        },
        {
          icon: "/images/icons/document-check.svg",
          title: "Save",
          description: 'Click **Save configuration** at the bottom of the page.',
        },
      ],
    },

    {
      type: "code",
      code: `https://a1b2c3d4.ngrok-free.app/incoming`,
      language: "text",
      file: "Webhook URL",
      showLineNumbers: false,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Replace `a1b2c3d4.ngrok-free.app` with your actual ngrok forwarding URL. If you restart ngrok, you'll need to update this URL again.",
    },

    { type: "section", title: "Understanding the TwiML Response" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What is TwiML?",
      content:
        "TwiML is Twilio's XML-based instruction set for calls. When someone calls your number, Twilio asks your server what to do — your server responds with TwiML that says \"open a ConversationRelay session.\" Twilio then connects your server to the caller via WebSocket.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When Twilio receives a call, it POSTs to your webhook. Your server responds with **TwiML** — an XML document using the `<Connect>` verb with a `<ConversationRelay>` noun:",
    },

    {
      type: "code",
      audience: "builder",
      code: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://a1b2c3d4.ngrok-free.app/ws"
      voice="en-US-Journey-F"
      ttsProvider="google"
      transcriptionProvider="deepgram"
      language="en-US"
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
        "**`url`** — your WebSocket endpoint (`wss://`). **`voice`** — the TTS voice (Google Journey-F). **`ttsProvider`** — text-to-speech engine (google, amazon, or elevenlabs). **`transcriptionProvider`** — STT engine (deepgram or google). **`language`** — caller's expected language (BCP-47 code).",
    },

    { type: "section", title: "The Code Behind It", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "In Chapter 2 you'll write this handler. Here's a preview:",
    },

    {
      type: "code",
      audience: "builder",
      code: `// Inside your http.createServer handler:
if (req.url === "/incoming" && req.method === "POST") {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${process.env.PUBLIC_URL?.replace("https://", "")}"
      voice="en-US-Journey-F"
      ttsProvider="google"
      transcriptionProvider="deepgram"
      language="en-US"
    />
  </Connect>
</Response>\`;

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml);
}`,
      language: "javascript",
      file: "server.js",
      startLine: 12,
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "TwiML and the Connect Verb",
      content:
        "TwiML is Twilio's XML-based instruction set for controlling calls. The `<Connect>` verb enables bidirectional media streaming. Before ConversationRelay, developers used `<Connect>` with `<Stream>` to get raw audio over WebSockets. ConversationRelay adds the STT/TTS layer so you work with text instead of audio bytes.\n\nYou can include other TwiML verbs before `<Connect>` — for example, `<Say>` to play a welcome message before the AI takes over. ConversationRelay also supports attributes like `dtmfDetection`, `interruptible`, and custom parameters passed to your WebSocket. We'll explore these in later chapters.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        "The key flow: incoming call → your webhook → TwiML response → Twilio opens WebSocket → conversation begins. You'll write this code in the next chapter.",
    },
  ],
} satisfies StepDefinition;
