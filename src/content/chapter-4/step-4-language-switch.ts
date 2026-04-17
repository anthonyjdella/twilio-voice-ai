import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Dynamic Language Switch" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Switching Languages Mid-Call",
      content:
        "Some callers start in one language and slide into another -- maybe they're more comfortable in Spanish, or they switch between English and Mandarin at home. ConversationRelay can flip both the listening (speech-to-text) and speaking (voice synthesis) language on the fly, without dropping the call. It's a small feature with a huge accessibility payoff.",
    },

    {
      type: "prose",
      content:
        "One of ConversationRelay's most powerful features is the ability to switch languages **mid-call** -- both the listening side (understanding the caller) and the speaking side (the voice the caller hears). If a caller switches from English to Spanish, your agent can adapt instantly without dropping the call.",
    },

    { type: "section", title: "The Language Message" },

    {
      type: "prose",
      content:
        "To switch languages, send a `language` message to Twilio. It will immediately update both how it listens to the caller and which voice it uses to speak:",
    },

    {
      type: "json-message",
      direction: "outbound",
      messageType: "language",
      code: `{
  "type": "language",
  "ttsLanguage": "es-ES",
  "transcriptionLanguage": "es-ES"
}`,
    },

    {
      type: "prose",
      content:
        "You can also update just one side. For example, keep the listening language in English while switching the speaking voice to Spanish, or vice versa. Each field is individually optional, but **at least one must be present**. Only include the fields you want to change.",
    },

    { type: "section", title: "Detecting Language Switches" },

    {
      type: "prose",
      content:
        "The AI is your best tool for detecting language changes. When a caller switches to Spanish, the text will contain Spanish words. You can tell the AI to detect this and respond accordingly. Add language detection instructions to your system prompt:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `const systemPrompt = \`You are a helpful customer service agent.

LANGUAGE DETECTION:
- You can speak English and Spanish fluently.
- If the caller switches to a different language, respond in that language.
- When you detect a language switch, include the marker [LANG:xx-XX]
  at the very beginning of your response, where xx-XX is the BCP-47
  language code (e.g., [LANG:es-ES] for Spanish, [LANG:en-US] for English).
- Only include the marker when the language CHANGES, not on every message.
\`;`,
    },

    { type: "section", title: "Handling the Language Switch" },

    {
      type: "prose",
      content:
        "Check the AI's response for language markers and tell Twilio to switch languages before sending the text to be spoken:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `const LANG_MARKER_REGEX = /^\\[LANG:([\\w-]+)\\]/;

let currentLanguage = "en-US";

function processLLMResponse(ws, text) {
  const match = text.match(LANG_MARKER_REGEX);

  if (match) {
    const newLang = match[1];

    if (newLang !== currentLanguage) {
      console.log(\`🌐 Switching language: \${currentLanguage} -> \${newLang}\`);
      currentLanguage = newLang;

      // Tell Twilio to switch STT and TTS
      ws.send(JSON.stringify({
        type: "language",
        ttsLanguage: newLang,
        transcriptionLanguage: newLang
      }));
    }

    // Remove the marker before sending text to Twilio
    text = text.replace(LANG_MARKER_REGEX, "").trim();
  }

  // Send the cleaned text to be spoken (last=true signals end of utterance)
  if (text) {
    sendText(ws, text, true);
  }
}`,
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "Imagine a caller starts in English and mid-sentence switches to Spanish. Within seconds, the agent is listening in Spanish *and* responding in Spanish — no transfer, no menu, no \"press 2 for español.\" That's a huge accessibility win and a much more human experience.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The language switch takes effect immediately. Make sure you send the `language` message **before** sending the text that should be spoken in the new language. Otherwise Twilio will try to speak Spanish text with an English voice, which sounds garbled.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "**Wiring this in:** Right now, `streamResponse` sends tokens one at a time, so the `[LANG:xx-XX]` marker would be spoken aloud before you could strip it. In Chapter 5, you will refactor `streamResponse` to buffer text in sentence-sized chunks. Once that refactor is done, call `processLLMResponse(ws, sentence)` on each sentence *before* passing it to `sendText` — the marker lands in the first sentence, gets stripped, and the `language` message reaches Twilio before any text is spoken.\n\nThis integration is **optional** — if you skip language switching, no changes to `streamResponse` are needed.",
    },

    { type: "section", title: "Supported Languages" },

    {
      type: "prose",
      content:
        "ConversationRelay supports a wide range of BCP-47 language codes. Some commonly used ones:",
    },

    {
      type: "code",
      language: "javascript",
      code: `const SUPPORTED_LANGUAGES = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish (Spain)",
  "es-MX": "Spanish (Mexico)",
  "fr-FR": "French",
  "de-DE": "German",
  "it-IT": "Italian",
  "pt-BR": "Portuguese (Brazil)",
  "ja-JP": "Japanese",
  "ko-KR": "Korean",
  "zh-CN": "Chinese (Mandarin)",
  "hi-IN": "Hindi",
  "ar-SA": "Arabic",
};`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "When switching languages, also consider switching the voice. A Spanish voice will pronounce Spanish text much more naturally than an English voice trying to speak Spanish.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Multi-language system prompt strategy",
      content:
        "For truly multilingual agents, write your system prompt in English (since most LLMs perform best with English instructions) but explicitly state that the agent should respond in the caller's language. The LLM will follow instructions in English while generating responses in the target language.\n\nSome teams maintain separate system prompts per language for cultural nuance, but for most use cases, a single English prompt with multilingual instructions works well. The key is testing -- have native speakers call your agent and verify the experience feels natural.",
    },
  ],
} satisfies StepDefinition;
