import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Dynamic Language Switch" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Switching Languages Mid-Call",
      content:
        "Some callers start in one language and slide into another -- maybe they're more comfortable in Spanish, or they switch between English and Mandarin at home. ConversationRelay can flip both the listening and speaking language on the fly, without dropping the call. It's a small feature with a huge accessibility payoff.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "Imagine a caller starts in English and mid-sentence switches to Spanish. Within seconds, the agent is listening in Spanish *and* responding in Spanish -- no transfer, no menu, no \"press 2 for espanol.\" That is a much more human experience.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay can switch languages **mid-call** -- both the speech-to-text side (understanding the caller) and the text-to-speech side (the voice the caller hears). If a caller switches from English to Spanish, the agent adapts instantly without dropping the call.",
    },

    { type: "section", title: "The Language Message", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "To switch languages, send a `language` message over the WebSocket. Twilio immediately updates both how it listens and which voice it uses:",
    },

    {
      type: "json-message",
      audience: "builder",
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
      audience: "builder",
      content:
        "Each field is individually optional, but **at least one must be present**. You can update just one side -- for example, keep transcription in English while switching the speaking voice to Spanish.",
    },

    { type: "section", title: "Detecting Language Switches", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The LLM is the best tool for detecting language changes. When a caller switches to Spanish, the transcribed text contains Spanish words. Add language detection instructions to the system prompt:",
    },

    {
      type: "code",
      audience: "builder",
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

    { type: "section", title: "Handling the Language Switch", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Check the LLM's response for language markers and send the `language` message to Twilio before sending the text to be spoken:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `const LANG_MARKER_REGEX = /^\\[LANG:([\\w-]+)\\]/;

let currentLanguage = "en-US";

function processLLMResponse(ws, text) {
  const match = text.match(LANG_MARKER_REGEX);

  if (match) {
    const newLang = match[1];

    if (newLang !== currentLanguage) {
      console.log(\`Switching language: \${currentLanguage} -> \${newLang}\`);
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
      audience: "builder",
      variant: "warning",
      content:
        "The language switch takes effect immediately. Send the `language` message **before** sending the text that should be spoken in the new language. Otherwise Twilio will try to speak Spanish text with an English voice, which sounds garbled.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "**Wiring this in:** Right now, `streamResponse` sends tokens one at a time, so the `[LANG:xx-XX]` marker would be spoken aloud before you could strip it. In Chapter 5, you will refactor `streamResponse` to buffer text in sentence-sized chunks. Once that refactor is done, call `processLLMResponse(ws, sentence)` on each sentence *before* passing it to `sendText` -- the marker lands in the first sentence, gets stripped, and the `language` message reaches Twilio before any text is spoken.\n\nThis integration is **optional** -- if you skip language switching, no changes to `streamResponse` are needed.",
    },

    { type: "section", title: "Supported Languages", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay supports a wide range of BCP-47 language codes. Some commonly used ones:",
    },

    {
      type: "code",
      audience: "builder",
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
      audience: "builder",
      variant: "tip",
      content:
        "When switching languages, also consider switching the voice. A Spanish voice will pronounce Spanish text much more naturally than an English voice trying to speak Spanish.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Multi-language system prompt strategy",
      content:
        "For truly multilingual agents, write the system prompt in English (since most LLMs perform best with English instructions) but explicitly state that the agent should respond in the caller's language. The LLM will follow instructions in English while generating responses in the target language.\n\nSome teams maintain separate system prompts per language for cultural nuance, but for most use cases, a single English prompt with multilingual instructions works well. The key is testing -- have native speakers call the agent and verify the experience feels natural.",
    },
  ],
} satisfies StepDefinition;
