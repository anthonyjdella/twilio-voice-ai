import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Speech-to-Text Configuration" },

    {
      type: "prose",
      content:
        "While TTS turns your agent's words into audio, speech-to-text (STT) does the opposite: it transcribes the caller's spoken words into text that your server can process. ConversationRelay handles STT automatically, but you can fine-tune the provider and language settings to get better accuracy.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Speech Recognition",
      content:
        "Your AI agent automatically converts the caller's spoken words into text using speech-to-text (STT) technology. This happens behind the scenes so the agent can understand and respond to anything the caller says.",
    },

    { type: "section", title: "STT Providers", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Deepgram** is the default provider — fast, low-latency, and optimized for English. **Google Cloud Speech-to-Text** offers stronger multilingual support across dozens of languages.",
    },

    { type: "section", title: "Configuring Language and Provider" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You configure STT settings on the `<ConversationRelay>` element in your TwiML. The key attributes are: **`language`** — the BCP-47 language code for the expected caller language (e.g., `en-US`, `es-ES`). **`transcriptionProvider`** — the STT provider: `Deepgram` (default) or `Google`. **`speechModel`** — the specific model within the chosen provider, balancing speed vs. accuracy.",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
      code: `<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-2-general"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the same configuration using Google as the STT provider, with Spanish as the language:",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "TwiML Response",
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
        "**English:** en-US, en-GB, en-AU | **Spanish:** es-ES, es-MX | **French:** fr-FR, fr-CA | **German:** de-DE | **Portuguese:** pt-BR, pt-PT | **Japanese:** ja-JP | **Chinese:** zh-CN | **Korean:** ko-KR | **Italian:** it-IT | **Hindi:** hi-IN — and 20+ more.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "If your agent handles a single language, set the `language` attribute explicitly. This helps the STT engine optimize for that language and improves accuracy. You should also instruct your LLM to respond in the same language via the system prompt.",
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
      code: `// Inside your http.createServer handler:
if (req.url === "/twiml" && req.method === "POST") {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-2-general"
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
      type: "callout",
      variant: "warning",
      content:
        "Make sure your system prompt language matches the `language` attribute. If you set `language=\"es-ES\"` but your system prompt is in English, the LLM will respond in English and the caller experience will be inconsistent.",
    },
  ],
} satisfies StepDefinition;
