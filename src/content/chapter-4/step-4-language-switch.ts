import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Dynamic Language Switch" },

    {
      type: "prose",
      content:
        "One of ConversationRelay's most powerful features is the ability to switch the speech-to-text and text-to-speech language **mid-call**. This means your agent can detect when a caller switches languages and seamlessly adapt without ending the call or transferring to a different system.",
    },

    { type: "section", title: "The Language Message" },

    {
      type: "prose",
      content:
        "To switch languages, send a `language` message through the WebSocket. Twilio will immediately update both the STT (speech recognition) and TTS (voice synthesis) engines:",
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
        "You can also update just one side. For example, keep STT in English while switching TTS to Spanish, or vice versa. The `ttsLanguage` and `transcriptionLanguage` fields are both optional -- only include the ones you want to change.",
    },

    { type: "section", title: "Detecting Language Switches" },

    {
      type: "prose",
      content:
        "The LLM is your best tool for detecting language changes. When a caller switches to Spanish, the transcript will contain Spanish words. You can instruct the LLM to detect this and respond accordingly. Add language detection instructions to your system prompt:",
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
        "Parse the LLM response for language markers and send the appropriate WebSocket message to Twilio before forwarding the text:",
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

  // Send the cleaned text to be spoken
  if (text) {
    sendText(ws, text);
  }
}`,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The language switch takes effect immediately. Make sure you send the `language` message **before** sending the text that should be spoken in the new language. Otherwise Twilio will try to speak Spanish text with an English voice, which sounds garbled.",
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
        "When switching languages, also consider switching the TTS voice. A Spanish voice engine will pronounce Spanish text much more naturally than an English voice engine attempting Spanish phonemes.",
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
