import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Speech-to-Text Configuration" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Speech Recognition",
      content:
        "Your AI agent automatically converts the caller's spoken words into text using speech-to-text technology. This happens behind the scenes so the agent can understand and respond to anything the caller says. You choose the language (English, Spanish, and many more) and the system handles the rest. For most conversations the defaults work perfectly.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your agent already turns the caller's voice into text automatically. In this step, you can fine-tune how that works -- choosing which language the system listens for and which speech recognition engine it uses for better accuracy.",
    },

    { type: "section", title: "Speech Recognition Providers", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Deepgram** is the default provider — fast, low-latency, and optimized for English. **Google Cloud Speech-to-Text** offers stronger multilingual support across dozens of languages.",
    },

    { type: "section", title: "Configuring Language and Provider", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You configure speech recognition settings in your ConversationRelay instructions. The key settings are: **`language`** — the language code the caller will speak (e.g., `en-US` for English, `es-ES` for Spanish). **`transcriptionProvider`** — which service listens to the caller: `Deepgram` (default) or `Google`. **`speechModel`** — the specific recognition model, balancing speed vs. accuracy.",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
      highlight: [7, 8, 9],
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-3-general"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the same configuration using Google as the speech recognition provider, with Spanish as the language:",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
      highlight: ["5-9"],
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="es-US-Neural2-A"
      ttsProvider="Google"
      language="es-ES"
      transcriptionProvider="Google"
      speechModel="telephony"
    />
  </Connect>
</Response>`,
    },

    { type: "section", title: "Supported Languages" },

    {
      type: "concept-card",
      title: "Supported Languages",
      content:
        "English, Spanish, French, German, Portuguese, Japanese, Chinese, Korean, Italian, Hindi, and 20+ more languages are supported. Each language has regional variants (for example, US English vs. British English, or European Spanish vs. Mexican Spanish).",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "If your agent handles a single language, set the `language` attribute explicitly. This helps the speech recognizer optimize for that language and improves accuracy. You should also tell your AI to respond in the same language via the system prompt.",
    },

    { type: "section", title: "Putting It All Together", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Update your TwiML endpoint to include both voice and language configuration:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: [10, 11, 12],
      code: `// Inside your http.createServer handler:
if (req.url === "/twiml" && req.method === "POST") {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-3-general"
    />
  </Connect>
</Response>\`;

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml);
}`,
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Transcription Accuracy Considerations",
      content:
        "STT accuracy is affected by several factors beyond provider choice. Background noise, accents, speaking speed, and domain-specific vocabulary all play a role.\n\n**Phone audio is lower quality.** Phone calls typically use 8kHz narrowband audio. STT engines trained on telephony data (like Deepgram's `nova-2-general` or Google's `telephony` model) handle this better than general-purpose models.\n\n**Domain vocabulary matters.** If your agent handles medical, legal, or technical conversations, the transcriber may struggle with jargon. Have your LLM ask for clarification when it encounters ambiguous terms.\n\n**Latency vs. accuracy trade-off.** Some models prioritize speed while others prioritize accuracy by waiting for more audio context. For real-time conversations, lower latency is usually preferred.\n\n**Provider strengths.** Deepgram excels at real-time English transcription with very low latency. Google Cloud Speech-to-Text shines for multilingual support and is a good choice if you need non-English languages or already use Google Cloud TTS.",
    },

    {
      type: "language-picker",
      audience: "explorer",
    },

    {
      type: "callout",
      variant: "warning",
      audience: "builder",
      content:
        "Make sure your system prompt language matches the `language` attribute. If you set `language=\"es-ES\"` but your system prompt is in English, the AI will respond in English and the caller experience will be inconsistent.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The /twiml handler with voice, TTS, language, and speech recognition all configured.",
      code: `if (req.url === "/twiml" && req.method === "POST") {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-3-general"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
    />
  </Connect>
</Response>\`;

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml);
  return;
}`,
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Your language selection is saved. The agent will listen for and speak this language on your next call.",
    },
  ],
} satisfies StepDefinition;
