import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "stt-tts" },

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
      type: "prose",
      audience: "explorer",
      content:
        "Your voice selection is saved. The agent will use this voice on your next call.",
    },
  ],
} satisfies StepDefinition;
