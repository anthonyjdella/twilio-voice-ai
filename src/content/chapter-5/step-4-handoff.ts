import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Live Agent Handoff" },

    { type: "diagram", variant: "architecture", highlight: "handoff" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "When the AI Steps Aside",
      content:
        "The best AI agents know when to give up. A sensitive complaint, a scared caller, or a request the model cannot handle -- that is when it passes the call to a human. A clean handoff includes a short summary of what happened so the human does not have to start from zero.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Sometimes the caller needs a human -- for complex complaints, sensitive account changes, or when the AI cannot solve the problem. A smooth handoff from AI to a live agent keeps the experience seamless.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "No AI agent can handle every situation. Sometimes the caller needs a human -- for complex complaints, sensitive account changes, or when the AI cannot solve the problem. A smooth handoff from AI to a live agent is essential for production voice systems.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Handoff is different from your other tools.** `check_weather` and `lookup_order` *continue* the conversation -- the AI gets data back and keeps talking. Handoff *ends* the AI session. Once the `end` message is sent, Twilio closes the WebSocket and the AI is out of the call entirely; the human picks up from there. You'll wire it into the same `tools` array for convenience, but mentally it belongs in its own category: a control-flow primitive, not a data lookup.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Keep regulated data out of the LLM.** Card numbers (PCI), Social Security numbers, and Protected Health Information (PHI) should never land in your `conversationHistory`, your LLM provider's logs, or your stdout. Two Twilio patterns for handling this:\n\n- **Card data (PCI):** do not ask the LLM to capture it. Use Twilio's [`<Pay>` verb](https://www.twilio.com/docs/voice/tutorials/how-capture-your-first-payment-using-pay) or the [Payments API](https://www.twilio.com/docs/voice/api/payment-resource) -- both capture DTMF on a PCI-compliant path that bypasses your app entirely.\n- **Health data (HIPAA):** [Conversation Relay became HIPAA-eligible on March 17, 2025](https://www.twilio.com/en-us/changelog/conversationrelay-is-now-hipaa-eligible). Eligibility still requires a signed BAA with Twilio *and* that your LLM provider is covered under its own BAA before PHI touches your pipeline.\n\nPractical rule: instruct the system prompt to refuse card numbers and PHI and call `transfer_to_agent` instead.",
    },

    { type: "page-break" },

    { type: "section", title: "How Handoff Works" },

    {
      type: "image",
      src: "/images/illustrations/directional-sign.svg",
      alt: "A directional signpost — the agent deciding which path the call should take when a human is needed.",
      size: "md",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "When the AI decides the caller needs a human, it closes the AI session and passes along a summary of the conversation. The call is then transferred to a real person who already knows what the conversation was about.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When the AI decides the caller needs a human, your server sends a special \"end\" message to Twilio with a summary of the conversation. Twilio then closes the AI session and asks your server what to do next -- your server responds with instructions to transfer the call to a real person.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "For the caller, a good handoff feels seamless: the AI says \"Let me connect you with someone who can help,\" there is a brief hold, and the human agent already knows what the conversation was about. No repeating yourself.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "warning",
      content:
        "**Some information should never reach the AI.** Credit card numbers (PCI) and medical details (HIPAA) have strict rules about where data can travel. A good voice AI recognizes those moments and hands off to a human or a specialized secure flow instead of asking the caller to read the numbers aloud. Conversation Relay itself is [HIPAA-eligible as of March 17, 2025](https://www.twilio.com/en-us/changelog/conversationrelay-is-now-hipaa-eligible), but your LLM and the rest of your stack also need to qualify before any real health data travels through them.",
    },

    { type: "handoff-toggle", audience: "explorer" },

    { type: "page-break" },

    { type: "section", title: "The End Message with Handoff", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content: "To trigger a handoff, send this message to Twilio:",
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "end",
      code: `{
  "type": "end",
  "handoffData": "{\\"reasonCode\\":\\"live-agent-handoff\\",\\"reason\\":\\"billing_dispute\\",\\"summary\\":\\"Caller wants to dispute a charge of $49.99 on order 123. AI was unable to process the refund.\\",\\"callerId\\":\\"+15551234567\\"}"
}`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The `handoffData` field carries context about the conversation so the human agent knows what happened. `reasonCode: \"live-agent-handoff\"` is Twilio's documented convention for marking this as a handoff; any other fields inside `handoffData` (`reason`, `summary`, `callerId`, order/account numbers) are yours to define -- Twilio passes them through verbatim.",
    },

    { type: "page-break" },

    { type: "section", title: "Setting Up the Action URL", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You need to tell Twilio where to go after the AI session ends. Add an `action` attribute that points to a new route on your server:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Update your existing `/twiml` response -- don't create a new one.** You already have a `<ConversationRelay>` element from earlier. Add `action=\"/call-ended\"` to the surrounding `<Connect>` on *that* response, then add the `/call-ended` route below to the same `server.js`. If you forget the `action` attribute, Twilio has no URL to POST `handoffData` to when the session ends, and the `end` message will close the WebSocket without triggering any transfer TwiML -- the call will just hang up.",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "twiml-response",
      highlight: [6],
      code: `<!-- The only change vs. your existing TwiML is the new action="/call-ended"
     on <Connect>. Keep every other attribute you already have — voice,
     ttsProvider, welcomeGreeting, language, interruptible, etc. — untouched;
     the snippet below just shows where the new attribute goes. The
     Chirp3 / Google values are example placeholders only — do NOT swap
     the voice and ttsProvider picks you made earlier for these. -->
<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://<your-server-host>/ws"
      voice="en-US-Chirp3-HD-Aoede"
      ttsProvider="Google"
      welcomeGreeting="Hi, I'm your assistant. How can I help?"
      dtmfDetection="true"
      interruptible="any"
      reportInputDuringAgentSpeech="any"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "When the AI session ends, Twilio asks your server what to do next. Your server checks whether the AI requested a handoff and responds with the right instructions:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "The handoff TwiML below dials `process.env.HANDOFF_PHONE_NUMBER` if it's set -- for the workshop, that's a real phone that will actually ring -- and falls back to `<Queue>support</Queue>` otherwise (which fails cleanly on accounts without that queue). In production, swap the fallback for a real destination: a specific `<Number>+1...</Number>`, a SIP endpoint, or a TaskRouter `<Enqueue workflowSid=\"...\">` for skills-based routing.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-35"],
      code: `// Inside your http.createServer handler, add a route for the action URL:
if (req.url === "/call-ended" && req.method === "POST") {
  let body = "";
  req.on("data", (chunk) => body += chunk);
  req.on("end", () => {
    const params = new URLSearchParams(body);
    const handoffData = params.get("HandoffData");

    let twiml;
    let data = null;
    if (handoffData) {
      try { data = JSON.parse(handoffData); } catch {}
    }

    if (data?.reasonCode === "live-agent-handoff") {
      // AI requested a handoff -- transfer the call
      console.log("Handoff requested:", data.reason);
      console.log("Summary:", data.summary);

      // Dial HANDOFF_PHONE_NUMBER if it's set; otherwise fall back to a
      // <Queue> placeholder that fails cleanly. For the workshop, the env
      // var is pre-configured so transfers actually ring a real phone.
      const dialTarget = process.env.HANDOFF_PHONE_NUMBER
        ? \`<Number>\${process.env.HANDOFF_PHONE_NUMBER}</Number>\`
        : "<Queue>support</Queue>";
      twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while I transfer you to a representative.</Say>
  <Dial>
    \${dialTarget}
  </Dial>
</Response>\`;
    } else {
      // Normal call end (or unrecognized reasonCode) -- just hang up
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
}`,
    },

    { type: "page-break" },

    { type: "section", title: "Triggering Handoff from a Tool Call", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The cleanest approach is to give the AI a `transfer_to_agent` tool. Add this to the `tools` array and `toolHandlers` object in `tool-handlers.js` (alongside the tools you defined earlier). When the AI decides the caller needs a human, it uses this tool, and your code sends the handoff message:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "tool-handlers.js",
      highlight: ["1-56"],
      code: `// Add to your tools array (alongside check_weather, lookup_order)
{
  type: "function",
  function: {
    name: "transfer_to_agent",
    description: "Transfer the caller to a live human agent. " +
      "Call this tool IMMEDIATELY when the caller asks for a human, " +
      "person, representative, agent, or someone else -- do not ask " +
      "follow-up questions first. Also call it when the caller's issue " +
      "involves billing disputes, account changes, or anything you " +
      "cannot resolve after one attempt.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Brief reason for the transfer"
        },
        department: {
          type: "string",
          enum: ["billing", "technical", "general"],
          description: "Department to route to"
        },
        summary: {
          type: "string",
          description: "Summary of the conversation so far"
        }
      },
      required: ["reason", "summary"]
    }
  }
}

// Add to your toolHandlers object (alongside the other handlers)
transfer_to_agent: async ({ reason, department, summary }, ws) => {
  // Let the caller know what's happening.
  // sendText lives in server.js, not here — use ws.send directly.
  ws.send(JSON.stringify({
    type: "text",
    token: "I understand you need more help with this. " +
      "Let me connect you with a team member who can assist.",
    last: true
  }));

  // Small delay so the caller hears the message before the session ends
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "end",
      handoffData: JSON.stringify({
        reasonCode: "live-agent-handoff",
        reason,
        department: department || "general",
        summary,
        timestamp: new Date().toISOString()
      })
    }));
  }, 2000);

  return { status: "transferring" };
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The 2-second `setTimeout` before sending `end` is a rough estimate of how long the farewell sentence takes to speak. If Twilio's TTS runs long, the `end` message lands mid-sentence and the caller hears a clipped goodbye. If TTS finishes early, the caller sits in silence for the remainder. For a workshop demo this is fine; for production, set `debug=\"speaker-events tokens-played\"` on your `<ConversationRelay>` and send `end` when you receive the matching `tokens-played` debug message for the last token (or the `agentSpeaking=false` speaker event) instead of using a timer.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "error",
      content:
        "**Do not pass sensitive information (credit card numbers, social security numbers, health records) through `handoffData` or through the AI.** This data gets logged by Twilio and stored on your server. If the caller needs to share payment or personal details, let the human agent collect it after the transfer -- not the AI.",
    },

    {
      type: "solution",
      audience: "builder",
      explanation:
        "Both files at the end of this step. `tool-handlers.js` adds the `transfer_to_agent` tool and handler alongside the earlier tools. `server.js` adds `action=\"/call-ended\"` on `<Connect>` and the matching `/call-ended` route that inspects `HandoffData` and responds with transfer TwiML. Everything else carries over from the tool-calling step.",
      files: [
        {
          file: "tool-handlers.js",
          language: "javascript",
          code: `const tools = [
  {
    type: "function",
    function: {
      name: "check_weather",
      description: "Get the current weather for a given city. " +
        "Use when the caller asks about weather, temperature, " +
        "or conditions in a specific location.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name, e.g. 'San Francisco' or 'New York'"
          },
          unit: {
            type: "string",
            enum: ["fahrenheit", "celsius"],
            description: "Temperature unit (defaults to fahrenheit)"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description: "Look up the status of a customer order by order ID. " +
        "Use when the caller asks about an order, shipment, or delivery.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The order ID, e.g. '123'"
          }
        },
        required: ["order_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "transfer_to_agent",
      description: "Transfer the caller to a live human agent. " +
        "Use this when the caller explicitly requests a human, " +
        "or when you cannot resolve their issue.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Brief reason for the transfer"
          },
          department: {
            type: "string",
            enum: ["billing", "technical", "general"],
            description: "Department to route to"
          },
          summary: {
            type: "string",
            description: "Summary of the conversation so far"
          }
        },
        required: ["reason", "summary"]
      }
    }
  }
];

const toolHandlers = {
  check_weather: async ({ city, unit = "fahrenheit" }, _ws) => {
    const mockWeather = {
      "san francisco": { temp: 60, condition: "sunny", humidity: 45 },
      "new york": { temp: 55, condition: "cloudy", humidity: 72 },
      "seattle": { temp: 48, condition: "rainy", humidity: 88 },
    };
    const weather = mockWeather[city.toLowerCase()];
    if (!weather) {
      return { error: "Weather data not available for " + city };
    }
    const temp = unit === "celsius"
      ? Math.round((weather.temp - 32) * 5 / 9)
      : weather.temp;
    return {
      city, temperature: temp, unit,
      condition: weather.condition,
      humidity: weather.humidity + "%"
    };
  },

  lookup_order: async ({ order_id }, _ws) => {
    const mockOrders = {
      "123": { status: "shipped", tracking: "1Z999AA10123456784", eta: "May 7, 2026" },
      "456": { status: "processing", tracking: null, eta: "May 7, 2026" },
    };
    const order = mockOrders[order_id];
    if (!order) {
      return { error: "Order not found: " + order_id };
    }
    return { order_id, ...order };
  },

  transfer_to_agent: async ({ reason, department, summary }, ws) => {
    // Let the caller know what's happening.
    // sendText lives in server.js, not here — use ws.send directly.
    ws.send(JSON.stringify({
      type: "text",
      token: "I understand you need more help with this. " +
        "Let me connect you with a team member who can assist.",
      last: true
    }));

    // Small delay so the caller hears the message before the session ends
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: "end",
        handoffData: JSON.stringify({
          reasonCode: "live-agent-handoff",
          reason,
          department: department || "general",
          summary,
          timestamp: new Date().toISOString()
        })
      }));
    }, 2000);

    return { status: "transferring" };
  }
};

module.exports = { tools, toolHandlers };`,
        },
        {
          file: "server.js",
          language: "javascript",
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

const SYSTEM_PROMPT = \`You are a helpful voice assistant for Twilio-Mart.
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
const MAX_TOOL_ITERATIONS = 5;
const SLOW_TOOLS = ["lookup_order"];
const LANG_MARKER_REGEX = /^\\[LANG:([\\w-]+)\\]/;

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

async function streamResponse(ws, iteration = 0) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create(
    {
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      tools: tools,
      stream: true,
    },
    { signal: activeStream.signal }
  );

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

        const match = textBuffer.match(/[.!?](\\s|$)/);
        if (match) {
          const sentenceEnd = match.index + 1;
          const sentence = textBuffer.slice(0, sentenceEnd);
          processLLMResponse(ws, sentence);
          textBuffer = textBuffer.slice(sentenceEnd + (match[1] ? match[1].length : 0));
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
            if (tc.function?.name) {
              toolCalls[tc.index].function.name += tc.function.name;
            }
            if (tc.function?.arguments) {
              toolCalls[tc.index].function.arguments += tc.function.arguments;
            }
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
        return;
      }
    }
  } catch (err) {
    if (err.name !== "AbortError") throw err;
  } finally {
    if (iteration === 0) activeStream = null;
  }
}

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that. " +
      "Can you try rephrasing?", true);
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
      console.error(\`Tool error (\${fnName}):\`, err.message);
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
      conversationHistory.push({ role: "user", content: msg.voicePrompt });
      streamResponse(ws);
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
    // action="/call-ended" was added in this step. When the AI sends
    // the "end" message with handoffData, Twilio POSTs that data here.
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://\${req.headers.host}/ws"
      welcomeGreeting="Hello! How can I help you today?"
      dtmfDetection="true"
      interruptible="any"
      reportInputDuringAgentSpeech="any"
    />
  </Connect>
</Response>\`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  if (req.url === "/call-ended" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const handoffData = params.get("HandoffData");

      let twiml;
      let data = null;
      if (handoffData) {
        try { data = JSON.parse(handoffData); } catch {}
      }

      if (data?.reasonCode === "live-agent-handoff") {
        console.log("Handoff requested:", data.reason);
        console.log("Summary:", data.summary);

        // Dial HANDOFF_PHONE_NUMBER if set; otherwise fall back to the
        // <Queue> placeholder. Swap the fallback for a real TaskRouter
        // workflow, SIP endpoint, or specific <Number> in production.
        const dialTarget = process.env.HANDOFF_PHONE_NUMBER
          ? \`<Number>\${process.env.HANDOFF_PHONE_NUMBER}</Number>\`
          : "<Queue>support</Queue>";
        twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while I transfer you to a representative.</Say>
  <Dial>
    \${dialTarget}
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
  console.log("WebSocket connection opened");
  ws.on("message", (data) => handleMessage(ws, data));
  ws.on("close", () => {
    clearTimeout(silenceTimer);
    console.log("WebSocket connection closed");
  });
});

server.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});`,
        },
      ],
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Advanced routing strategies",
      content:
        "The action URL gives you full control over what happens after handoff. Some common patterns:\n\n**Dial a specific number** -- route to different phone numbers based on department or priority.\n**Enqueue** -- place the caller in a Twilio TaskRouter queue for skills-based routing.\n**Conference** -- bring the AI and human agent together for a warm handoff where the AI introduces the caller.\n**Callback** -- if no agents are available, offer to call the customer back.",
    },
  ],
} satisfies StepDefinition;
