import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Polish Your Agent" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Line Between Demo and Product",
      content:
        "A working prototype handles the expected path: a clear caller, a good line, a question the agent is ready for. A polished agent handles the rest -- poor audio, a frustrated caller, off-hours traffic. Polish is the set of small choices (tone, error messages, logging, graceful fallbacks) that close the gap between the two.",
    },

    {
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/growth.png",
      alt: "A growing plant — the agent maturing from working prototype into a dependable product through small, steady refinements.",
      size: "md",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Polish in Practice",
      content:
        "Polish is almost never a flashy feature -- it's the small behaviors you only notice when they're missing. A polished agent says \"give me a moment to check that for you\" before a slow lookup; a rough agent goes silent and the caller assumes the line dropped. A polished agent admits when it doesn't know something and offers to connect a human; a rough agent guesses and gives the wrong answer. A polished agent ends cleanly when the caller hangs up; a rough agent leaves timers running in the background. None of these land in a demo -- they only matter when the caller is real.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "You've already done most of your polish work -- you chose the name, the tone, the voice, the language, and the tools the agent can reach. This step is a chance to look back at those choices with fresh eyes now that you've heard the agent in action. Does the name still fit? Is the voice the right match for the tone? Is anything missing that came up when you tested?",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent works end to end. Before launch, a polishing pass makes it feel professional and reliable.",
    },

    { type: "section", audience: "builder", title: "Refine Your System Prompt" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The system prompt is the single biggest lever for agent quality. Review it against this checklist:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Identity** -- Does the prompt clearly define who the agent is, what company it works for, and its role?\n**Boundaries** -- Does it specify what the agent should NOT do (e.g., make promises, share internal information)?\n**Tone** -- Is the tone appropriate for your use case? Customer support should be warm and helpful; a scheduling bot can be more concise.\n**Edge cases** -- Does it handle off-topic questions, profanity, or requests for competitors?\n**Conciseness** -- Voice responses should be shorter than text chat. Tell the AI to keep answers brief and conversational.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Apply this to your persona.** The \"Ava\" example below is one worked version of the checklist -- use it as a reference pattern, not a replacement for the persona you picked in Chapter 3. Keep your agent's name and company, then layer on the missing pieces (capabilities, boundaries, tone specifics) using this as the template.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `const systemPrompt = \`You are Ava, a customer service agent for Acme Corp.

PERSONALITY:
- Warm, professional, and concise
- Use natural conversational language (contractions, simple words)
- Keep responses under 2-3 sentences when possible
- Never say "As an AI" or reference being a language model

CAPABILITIES:
- Check order status (use lookup_order tool)
- Provide weather information (use check_weather tool)
- Transfer to human agents when needed (use transfer_to_agent tool)

BOUNDARIES:
- Never make promises about refunds or policy exceptions
- Do not share internal pricing or systems information
- If asked about competitors, politely redirect to Acme services
- For account changes (password, email, billing), always transfer to a human

VOICE GUIDELINES:
- Speak in short, clear sentences
- Avoid lists longer than 3 items (offer to go one by one)
- Confirm important details by repeating them back
- Use filler phrases naturally: "Let me check that for you"
\`;`,
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Optimize Voice Settings" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Fine-tune the Conversation Relay voice settings for the best caller experience:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**This replaces the `<ConversationRelay>` element in your existing `/twiml` handler** -- don't paste it as a second route. You already have a TwiML response with `dtmfDetection`, `interruptible`, and `reportInputDuringAgentSpeech` from Chapter 4, plus `language`, `transcriptionProvider`, and `speechModel` from Chapter 3 Step 4; this step adds new attributes (`voice`, `ttsProvider`, `interruptSensitivity`, `welcomeGreetingInterruptible`, `hints`) onto the same element and introduces `action=\"/call-ended\"` on `<Connect>`.",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "twiml-response",
      highlight: [11, 12, 13],
      code: `<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://<your-server-host>/ws"
      voice="en-US-Chirp3-HD-Aoede"
      ttsProvider="Google"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-3-general"
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
      welcomeGreeting="Hello! How can I help you today?"
      welcomeGreetingInterruptible="speech"
      reportInputDuringAgentSpeech="dtmf"
      hints="Acme, order status, transfer, refund"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**`welcomeGreetingInterruptible`** -- same values as `interruptible` (`none`, `dtmf`, `speech`, `any`); applies only to the welcome greeting. Platform default is `\"any\"`; `\"speech\"` is a good explicit choice because callers can interject without accidentally triggering on a DTMF tone.\n\n**`reportInputDuringAgentSpeech`** -- controls whether Twilio forwards speech or DTMF that arrives *while* the agent is talking, without interrupting. Default is `\"none\"`. Setting it to `\"dtmf\"` is handy for IVR-style \"press 0 for an operator\" flows.\n\n**`hints`** -- comma-separated phrases the transcriber should bias toward. If the agent deals with proper nouns, product SKUs, or acronyms, listing them here improves recognition accuracy.\n\n**`debug`** -- a space-separated list of `debugging`, `speaker-events`, `tokens-played`. Turn this on during development; turn it off before you ship.",
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Pre-Launch Checklist" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Work through each item before considering the agent ready for real callers:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Error handling** -- Does the agent recover gracefully when the AI service is slow, a tool fails, or the network hiccups?\n**Conversation length limits** -- Is the conversation history trimmed or summarized after ~20 exchanges to avoid growing too long?\n**Clean call endings** -- Does the agent clear timers and close connections when a call ends?\n**Logging** -- Is there enough to troubleshoot problems without exposing sensitive caller data?\n**Timeouts** -- Are all outside calls (AI, tools, services) time-limited so the caller never waits forever?\n**Rate limiting** -- Is there protection against a single caller making excessive requests?",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Record a few test calls and listen to them critically. You'll catch pacing issues, awkward phrasing, and edge cases you miss during interactive testing. Pay special attention to the first 5 seconds -- that's when the caller decides if they're talking to a competent system.",
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Handle Inbound `error` Messages" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When something goes wrong on Twilio's side -- voice generation fails, transcription times out, or a message is malformed -- Twilio sends an error message so the server can react gracefully instead of leaving the caller in silence.",
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "inbound",
      messageType: "error",
      code: `{
  "type": "error",
  "description": "Failed to synthesize speech"
}`,
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["6-17"],
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    // ... existing cases (setup, prompt, interrupt, dtmf) ...

    case "error":
      // Log the fault and fall back to a graceful spoken recovery.
      // Don't try to retry automatically -- a second failure in a row
      // would just burn time while the caller waits in silence.
      console.error("⚠️ Conversation Relay error:", msg.description);
      sendText(ws,
        "I'm having a brief technical issue. " +
        "Could you say that again?",
        true,
      );
      break;
  }
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "In production, also emit a structured log entry here (with the `callSid` and conversation context) so the error shows up in your observability dashboard. Lost audio is invisible to the caller until they notice the agent isn't responding -- catch it on the server side.",
    },

    { type: "section", audience: "builder", title: "Handle AI Errors Gracefully" },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `async function streamResponse(ws, iteration = 0) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      tools: tools,
      stream: true,
    });

    // ... streaming logic ...

  } catch (err) {
    console.error("❌ LLM error:", err.message);

    if (err.name === "AbortError") {
      // Expected -- stream was cancelled due to interrupt
      return;
    }

    // Fallback response so the caller is not left hanging
    sendText(ws, "I'm sorry, I'm having a technical issue. " +
      "Could you repeat that, or would you like me to " +
      "transfer you to a team member?", true);
  }
}`,
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Monitoring in production",
      content:
        "For production agents, track these metrics:\n\n**Response latency** -- time from caller speech to first AI audio\n**Interruption rate** -- how often callers interrupt (high rate suggests slow or irrelevant responses)\n**Handoff rate** -- percentage of calls that need a human\n**Call duration** -- average and distribution\n**Tool success rate** -- how often tools return errors\n**Silence timeout rate** -- how often calls end due to silence",
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete polished server.js with everything from all chapters: tool calling, interruptions, DTMF, silence detection, language switching, handoff support, and error handling.",
      code: `require("dotenv").config();
const { WebSocketServer } = require("ws");
const http = require("http");
const OpenAI = require("openai");
const twilio = require("twilio");
const { tools, toolHandlers } = require("./tool-handlers.js");

const PORT = 8080;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// --- System prompt ---
// Paste your Chapter 3 persona's SYSTEM_PROMPT here, layered with the
// PERSONALITY / CAPABILITIES / BOUNDARIES / VOICE GUIDELINES / LANGUAGE
// DETECTION structure shown in the Ava example above. Don't overwrite
// your Ch3 persona with the example verbatim.

const SYSTEM_PROMPT = \`<-- paste your Chapter 3 SYSTEM_PROMPT here -->\`;

// --- Module-scope state (single-caller workshop server) ---

const conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT },
];

let activeStream = null;

const SILENCE_TIMEOUT_MS = 8000;
const MAX_SILENCE_PROMPTS = 2;
let silenceTimer = null;
let silencePromptCount = 0;

let currentLanguage = "en-US";
const LANG_MARKER_REGEX = /^\\[LANG:([\\w-]+)\\]/;

// --- Helpers ---

function sendText(ws, token, last = false) {
  ws.send(JSON.stringify({ type: "text", token, last }));
}

// --- LLM streaming with tool-call support ---

const MAX_TOOL_ITERATIONS = 5;
const SLOW_TOOLS = ["lookup_order"];

async function streamResponse(ws, iteration = 0) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: conversationHistory,
    tools: tools,
    stream: true,
  }, { signal: activeStream.signal });

  let textBuffer = "";
  let fullAssistantText = "";
  let toolCalls = [];

  try {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const finishReason = chunk.choices[0]?.finish_reason;

      if (delta?.content) {
        textBuffer += delta.content;
        fullAssistantText += delta.content;
        const sentenceEnd = textBuffer.search(/[.!?]\\s/);
        if (sentenceEnd !== -1) {
          const sentence = textBuffer.slice(0, sentenceEnd + 1);
          processLLMResponse(ws, sentence);
          textBuffer = textBuffer.slice(sentenceEnd + 2);
        }
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.index !== undefined) {
            if (!toolCalls[tc.index]) {
              toolCalls[tc.index] = {
                id: tc.id || "",
                function: { name: "", arguments: "" }
              };
            }
            if (tc.id) toolCalls[tc.index].id = tc.id;
            if (tc.function?.name) toolCalls[tc.index].function.name += tc.function.name;
            if (tc.function?.arguments) toolCalls[tc.index].function.arguments += tc.function.arguments;
          }
        }
      }

      if (finishReason === "tool_calls") {
        activeStream = null;
        await handleToolCalls(ws, toolCalls, iteration);
        return;
      }

      if (finishReason === "stop") {
        if (textBuffer.trim()) {
          processLLMResponse(ws, textBuffer.trim());
          textBuffer = "";
        }
        sendText(ws, "", true);
        if (fullAssistantText.trim()) {
          conversationHistory.push({
            role: "assistant",
            content: fullAssistantText.trim(),
          });
        }
      }
    }
  } catch (err) {
    if (err.name === "AbortError") return;

    console.error("LLM error:", err.message);
    sendText(ws, "I'm sorry, I'm having a technical issue. " +
      "Could you repeat that, or would you like me to " +
      "transfer you to a team member?", true);
  } finally {
    // Only null activeStream on the outermost call; the tool-call branch
    // already nulled it before recursing into the next stream.
    if (iteration === 0) activeStream = null;
  }
}

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that. Can you try rephrasing?", true);
    return;
  }

  if (toolCalls.some(tc => SLOW_TOOLS.includes(tc.function.name))) {
    sendText(ws, "One moment while I look that up...", true);
  }

  conversationHistory.push({
    role: "assistant",
    content: null,
    tool_calls: toolCalls.map(tc => ({
      id: tc.id,
      type: "function",
      function: { name: tc.function.name, arguments: tc.function.arguments }
    }))
  });

  for (const toolCall of toolCalls) {
    const fnName = toolCall.function.name;

    let result;
    try {
      const fnArgs = JSON.parse(toolCall.function.arguments);
      console.log("Tool call:", fnName, fnArgs);

      const handler = toolHandlers[fnName];
      result = handler
        ? await handler(fnArgs, ws)
        : { error: "Unknown tool: " + fnName };
    } catch (err) {
      result = { error: "Tool failed: " + err.message };
    }

    conversationHistory.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    });
  }

  await streamResponse(ws, iteration + 1);
}

// --- Conversation handlers ---

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
        content: "I want to check my order status."
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

// --- Silence detection ---

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

// --- Language switching ---

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
        transcriptionLanguage: newLang
      }));
    }

    text = text.replace(LANG_MARKER_REGEX, "").trim();
  }

  if (text) {
    sendText(ws, text);
  }
}

// --- WebSocket message dispatcher ---

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      resetSilenceTimer(ws);
      break;

    case "prompt":
      resetSilenceTimer(ws);
      conversationHistory.push({ role: "user", content: msg.voicePrompt });
      streamResponse(ws);
      break;

    case "interrupt":
      resetSilenceTimer(ws);
      handleInterrupt(msg);
      break;

    case "dtmf":
      resetSilenceTimer(ws);
      handleDtmfInput(ws, msg.digit);
      break;

    case "error":
      console.error("Conversation Relay error:", msg.description);
      sendText(ws,
        "I'm having a brief technical issue. " +
        "Could you say that again?",
        true,
      );
      break;

    default:
      console.log("Unhandled message type:", msg.type);
  }
}

// --- HTTP server ---

const server = http.createServer(async (req, res) => {
  if (req.url === "/twiml" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      voice="en-US-Chirp3-HD-Aoede"
      ttsProvider="Google"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-3-general"
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
      welcomeGreeting="Hello! How can I help you today?"
      welcomeGreetingInterruptible="speech"
      reportInputDuringAgentSpeech="dtmf"
      hints="Acme, order status, transfer, refund"
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

  if (req.url === "/call-ended" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const handoffData = params.get("HandoffData");

      let twiml;
      if (handoffData) {
        const data = JSON.parse(handoffData);
        console.log("Handoff requested:", data.reason);
        console.log("Summary:", data.summary);

        twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while I transfer you to a representative.</Say>
  <Dial>
    <Queue>support</Queue>
  </Dial>
</Response>\`;
      } else {
        twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. Goodbye!</Say>
  <Hangup />
</Response>\`;
      }

      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml);
    });
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});

// --- WebSocket server ---

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
