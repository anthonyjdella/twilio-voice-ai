import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JsonMessage } from "@/components/content/JsonMessage";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function DynamicLanguageSwitch() {
  return (
    <>
      <SectionHeader>Dynamic Language Switch</SectionHeader>

      <Prose>
        One of ConversationRelay&apos;s most powerful features is the ability to switch
        the speech-to-text and text-to-speech language <strong>mid-call</strong>. This
        means your agent can detect when a caller switches languages and seamlessly adapt
        without ending the call or transferring to a different system.
      </Prose>

      <SectionHeader>The Language Message</SectionHeader>

      <Prose>
        To switch languages, send a <code>language</code> message through the WebSocket.
        Twilio will immediately update both the STT (speech recognition) and TTS (voice
        synthesis) engines:
      </Prose>

      <JsonMessage
        direction="outbound"
        type="language"
        code={`{
  "type": "language",
  "ttsLanguage": "es-ES",
  "transcriptionLanguage": "es-ES"
}`}
      />

      <Prose>
        You can also update just one side. For example, keep STT in English while
        switching TTS to Spanish, or vice versa. The <code>ttsLanguage</code> and
        <code>transcriptionLanguage</code> fields are both optional -- only include the
        ones you want to change.
      </Prose>

      <SectionHeader>Detecting Language Switches</SectionHeader>

      <Prose>
        The LLM is your best tool for detecting language changes. When a caller switches
        to Spanish, the transcript will contain Spanish words. You can instruct the LLM
        to detect this and respond accordingly. Add language detection instructions to
        your system prompt:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`const systemPrompt = \`You are a helpful customer service agent.

LANGUAGE DETECTION:
- You can speak English and Spanish fluently.
- If the caller switches to a different language, respond in that language.
- When you detect a language switch, include the marker [LANG:xx-XX]
  at the very beginning of your response, where xx-XX is the BCP-47
  language code (e.g., [LANG:es-ES] for Spanish, [LANG:en-US] for English).
- Only include the marker when the language CHANGES, not on every message.
\`;`}
      />

      <SectionHeader>Handling the Language Switch</SectionHeader>

      <Prose>
        Parse the LLM response for language markers and send the appropriate WebSocket
        message to Twilio before forwarding the text:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`const LANG_MARKER_REGEX = /^\[LANG:([\w-]+)\]/;

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
}`}
      />

      <Callout type="warning">
        The language switch takes effect immediately. Make sure you send the
        <code>language</code> message <strong>before</strong> sending the text that
        should be spoken in the new language. Otherwise Twilio will try to speak Spanish
        text with an English voice, which sounds garbled.
      </Callout>

      <SectionHeader>Supported Languages</SectionHeader>

      <Prose>
        ConversationRelay supports a wide range of BCP-47 language codes. Some commonly
        used ones:
      </Prose>

      <CodeBlock
        language="javascript"
        showLineNumbers={false}
        code={`const SUPPORTED_LANGUAGES = {
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
};`}
      />

      <Callout type="tip">
        When switching languages, also consider switching the TTS voice. A Spanish voice
        engine will pronounce Spanish text much more naturally than an English voice
        engine attempting Spanish phonemes.
      </Callout>

      <DeepDive title="Multi-language system prompt strategy">
        <p className="mb-2">
          For truly multilingual agents, write your system prompt in English (since
          most LLMs perform best with English instructions) but explicitly state that
          the agent should respond in the caller&apos;s language. The LLM will follow
          instructions in English while generating responses in the target language.
        </p>
        <p>
          Some teams maintain separate system prompts per language for cultural nuance,
          but for most use cases, a single English prompt with multilingual instructions
          works well. The key is testing -- have native speakers call your agent and
          verify the experience feels natural.
        </p>
      </DeepDive>
    </>
  );
}
