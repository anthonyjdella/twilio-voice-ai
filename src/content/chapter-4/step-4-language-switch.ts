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

    {
      type: "image",
      src: "/images/illustrations/map-location.png",
      alt: "A map with location pins — a visual metaphor for meeting callers wherever they are, in whichever language they speak.",
      size: "md",
    },

    { type: "page-break" },

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
        "Each field is individually optional, but **at least one must be present**. You could keep transcription in English while switching just the speaking voice, but for almost every real caller the STT and TTS languages should move together -- otherwise the agent hears Spanish and answers in an English voice, or vice versa. The implementation below sends both fields on every switch for that reason.",
    },

    { type: "page-break" },

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
      highlight: ["3-10"],
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

    { type: "page-break" },

    { type: "section", title: "Handling the Language Switch", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Check the LLM's response for language markers and send the `language` message to Twilio before sending the text to be spoken:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**This is a new function.** Add `processLLMResponse` to your `server.js`; it does not replace anything from Step 1.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-27"],
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

  // Send the cleaned text to be spoken. streamResponse calls this per
  // sentence and emits the terminating last=true marker once the full
  // LLM response completes, so we don't set last=true here.
  if (text) {
    sendText(ws, text);
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

    { type: "page-break" },

    { type: "section", title: "Wire It Into `streamResponse`", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Replace your Step 1 `streamResponse` with this version.** The old one sent every token to Twilio the moment it arrived, which would speak the `[LANG:xx-XX]` marker out loud before the helper had a chance to strip it. The fix is to buffer tokens until a sentence ends, then run each full sentence through `processLLMResponse` before speaking it.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**This is a full replacement.** If you paste it next to your Step 1 `streamResponse` without deleting the old one, both functions will run and the caller will hear duplicated or overlapping audio.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["12-27", "30-34"],
      code: `async function streamResponse(ws) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create(
    {
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      stream: true,
    },
    { signal: activeStream.signal }
  );

  try {
    let textBuffer = "";
    let assistantText = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (!token) continue;

      textBuffer += token;
      assistantText += token;

      // Flush whole sentences through processLLMResponse so the
      // [LANG:xx-XX] marker (if any) is stripped and the language
      // message reaches Twilio before any text is spoken.
      const sentenceEnd = textBuffer.search(/[.!?]\\s/);
      if (sentenceEnd !== -1) {
        const sentence = textBuffer.slice(0, sentenceEnd + 1);
        processLLMResponse(ws, sentence);
        textBuffer = textBuffer.slice(sentenceEnd + 2);
      }
    }

    // Flush trailing text after the final sentence terminator.
    if (textBuffer.trim()) {
      processLLMResponse(ws, textBuffer.trim());
    }
    sendText(ws, "", true);
    conversationHistory.push({ role: "assistant", content: assistantText });
  } catch (err) {
    if (err.name !== "AbortError") throw err;
  } finally {
    activeStream = null;
  }
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Why sentence buffering, not word buffering? A marker like `[LANG:es-ES]` can arrive split across tokens (`[LANG`, `:es-`, `ES]`). Waiting for a sentence boundary guarantees the full marker is present before the regex runs, and it keeps perceived latency low because callers hear the agent speak one sentence at a time anyway.\n\nThe simple `/[.!?]\\s/` split will mis-flush on abbreviations like `Mr. Smith` or `e.g.,` and on numbers like `3.14`. For a workshop agent that is fine -- the marker only needs to be intact at the *start* of the first sentence. For a production agent you would swap in a proper sentence tokenizer (such as `compromise` or `sbd`).",
    },

    { type: "section", title: "Supported Languages", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay supports a wide range of BCP-47 language codes. Some commonly used ones -- pass any of these values as the `ttsLanguage` or `transcriptionLanguage` in the `language` message:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      code: `// Reference: common BCP-47 codes for ConversationRelay
// "en-US" -> English (US)
// "en-GB" -> English (UK)
// "es-ES" -> Spanish (Spain)
// "es-MX" -> Spanish (Mexico)
// "fr-FR" -> French
// "de-DE" -> German
// "it-IT" -> Italian
// "pt-BR" -> Portuguese (Brazil)
// "ja-JP" -> Japanese
// "ko-KR" -> Korean
// "zh-CN" -> Chinese (Mandarin)
// "hi-IN" -> Hindi
// "ar-SA" -> Arabic`,
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Multi-language system prompt strategy",
      content:
        "For truly multilingual agents, write the system prompt in English (since most LLMs perform best with English instructions) but explicitly state that the agent should respond in the caller's language. The LLM will follow instructions in English while generating responses in the target language.\n\nSome teams maintain separate system prompts per language for cultural nuance, but for most use cases, a single English prompt with multilingual instructions works well. The key is testing -- have native speakers call the agent and verify the experience feels natural.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "Builds on step 3 by adding a LANGUAGE DETECTION section to the system prompt, a LANG_MARKER_REGEX constant, currentLanguage tracking, and a processLLMResponse function that detects language markers and sends a language switch message to Twilio. streamResponse now buffers tokens into whole sentences and routes each through processLLMResponse, so the [LANG:xx-XX] marker is stripped and the language message reaches Twilio before the new-language text is spoken.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");
const twilio = require("twilio");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SYSTEM_PROMPT = \`You are a helpful voice assistant for Acme Corp.
Keep your responses brief -- one to two sentences at most.
Speak naturally and conversationally.
Never use markdown, bullet points, or numbered lists.
If you don't know something, say so honestly.

LANGUAGE DETECTION:
- You can speak English and Spanish fluently.
- If the caller switches to a different language, respond in that language.
- When you detect a language switch, include the marker [LANG:xx-XX]
  at the very beginning of your response, where xx-XX is the BCP-47
  language code (e.g., [LANG:es-ES] for Spanish, [LANG:en-US] for English).
- Only include the marker when the language CHANGES, not on every message.\`;

const SILENCE_TIMEOUT_MS = 8000;
const MAX_SILENCE_PROMPTS = 2;
const LANG_MARKER_REGEX = /^\\[LANG:([\\w-]+)\\]/;

// Module-scope state (single-caller workshop server)
const conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT },
];
let activeStream = null;
let silenceTimer = null;
let silencePromptCount = 0;
let currentLanguage = "en-US";

function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

function processLLMResponse(ws, text) {
  const match = text.match(LANG_MARKER_REGEX);

  if (match) {
    const newLang = match[1];

    if (newLang !== currentLanguage) {
      console.log(\`Switching language: \${currentLanguage} -> \${newLang}\`);
      currentLanguage = newLang;

      ws.send(JSON.stringify({
        type: "language",
        ttsLanguage: newLang,
        transcriptionLanguage: newLang,
      }));
    }

    text = text.replace(LANG_MARKER_REGEX, "").trim();
  }

  // streamResponse calls this per sentence and emits the terminating
  // last=true marker once the full LLM response completes.
  if (text) {
    sendText(ws, text);
  }
}

function resetSilenceTimer(ws) {
  clearTimeout(silenceTimer);
  silencePromptCount = 0;

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}

function handleSilence(ws) {
  silencePromptCount++;

  if (silencePromptCount >= MAX_SILENCE_PROMPTS) {
    sendText(ws, "It seems like you may have stepped away. " +
      "I'll end the call for now. Feel free to call back anytime!", true);
    ws.send(JSON.stringify({ type: "end" }));
    return;
  }

  const prompts = [
    "Are you still there? Take your time -- I'm here whenever you're ready.",
    "I'm still here if you need anything. Is there something I can help with?",
  ];

  sendText(ws, prompts[silencePromptCount - 1], true);

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}

async function streamResponse(ws) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create(
    {
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      stream: true,
    },
    { signal: activeStream.signal }
  );

  try {
    let textBuffer = "";
    let assistantText = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (!token) continue;

      textBuffer += token;
      assistantText += token;

      // Flush whole sentences through processLLMResponse so the
      // [LANG:xx-XX] marker (if any) is stripped and the language
      // message reaches Twilio before any text is spoken.
      const sentenceEnd = textBuffer.search(/[.!?]\\s/);
      if (sentenceEnd !== -1) {
        const sentence = textBuffer.slice(0, sentenceEnd + 1);
        processLLMResponse(ws, sentence);
        textBuffer = textBuffer.slice(sentenceEnd + 2);
      }
    }

    // Flush trailing text after the final sentence terminator.
    if (textBuffer.trim()) {
      processLLMResponse(ws, textBuffer.trim());
    }
    sendText(ws, "", true);
    conversationHistory.push({ role: "assistant", content: assistantText });
  } catch (err) {
    if (err.name !== "AbortError") throw err;
  } finally {
    activeStream = null;
  }
}

function handlePrompt(ws, msg) {
  conversationHistory.push({ role: "user", content: msg.voicePrompt });
  streamResponse(ws);
}

function handleInterrupt(msg) {
  console.log("Caller interrupted. Heard:", msg.utteranceUntilInterrupt);

  if (activeStream) {
    activeStream.abort();
    activeStream = null;
  }

  const lastMsg = conversationHistory[conversationHistory.length - 1];
  if (lastMsg?.role === "assistant") {
    lastMsg.content = msg.utteranceUntilInterrupt;
  }
}

function handleDtmfInput(ws, digit) {
  switch (digit) {
    case "1":
      conversationHistory.push({
        role: "user",
        content: "I want to check my order status.",
      });
      streamResponse(ws);
      break;

    case "2":
      sendText(ws, "Let me transfer you to a representative. " +
        "Please hold for a moment.", true);
      break;

    case "0":
      sendText(ws, "Returning to the main menu. " +
        "Press 1 for order status, 2 for a representative, " +
        "or just tell me what you need.", true);
      break;

    default:
      sendText(ws, "I didn't recognize that option. " +
        "Press 1 for order status, or 2 for a representative.", true);
      break;
  }
}

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      console.log("Call started:", msg.callSid);
      resetSilenceTimer(ws);
      break;

    case "prompt":
      resetSilenceTimer(ws);
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      resetSilenceTimer(ws);
      handleInterrupt(msg);
      break;

    case "dtmf":
      resetSilenceTimer(ws);
      console.log("DTMF received:", msg.digit);
      handleDtmfInput(ws, msg.digit);
      break;

    default:
      console.log("Unhandled message type:", msg.type);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      interruptible="any"
      reportInputDuringAgentSpeech="any"
    />
  </Connect>
</Response>\`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  if (req.url === "/call" && req.method === "POST") {
    try {
      const call = await twilioClient.calls.create({
        to: process.env.MY_PHONE_NUMBER,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: \`https://\${req.headers.host}/twiml\`,
      });

      console.log("Call initiated:", call.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ callSid: call.sid }));
    } catch (error) {
      console.error("Call error:", error.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (data) => handleMessage(ws, data));

  ws.on("close", () => {
    clearTimeout(silenceTimer);
    console.log("Call ended, timers cleared.");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});`,
    },
  ],
} satisfies StepDefinition;
