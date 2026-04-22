import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Define Tools" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Describing Tools So the AI Understands",
      content:
        "You don't teach the AI a tool by showing it code -- you describe it in plain English: what it does, when to use it, and what information it needs. The AI uses that description to pick the right tool at the right moment. A clear description is everything; a vague one makes the agent guess wrong.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Each tool has a short description that tells the AI what it does and what information it needs. Think of it like writing a name tag and instruction card for each tool so the AI knows which one to grab.",
    },

    {
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/grid-icon.svg",
      alt: "A grid of labeled tiles — the tool catalog the AI browses to pick the right tool for the job.",
      size: "md",
    },

    { type: "page-break", audience: "explorer" },

    { type: "section", title: "Pick Your Agent's Tools", audience: "explorer" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Your agent comes with three ready-made tools. Turn them on or off below, then listen to how the agent behaves on your next test call. With a tool turned off, the agent has to admit it cannot help with that kind of question.",
    },

    { type: "tool-picker", audience: "explorer" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Each tool is described in a JSON schema that tells the AI what it does, what parameters it needs, and when to use it. The AI reads these descriptions to decide which tool to call.",
    },

    { type: "section", title: "Tool Schema Format", audience: "builder" },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "Create a new file `tool-handlers.js` in the same folder as `server.js`. We'll build it up in two passes: first the `tools` schema array (below), then the `toolHandlers` dispatch map. Everything exported from this one file so `server.js` can `require(\"./tool-handlers.js\")` in Step 3.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Each tool definition follows this structure:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "tool-handlers.js",
      code: `const tools = [
  {
    type: "function",
    function: {
      name: "check_weather",
      description: "Get the current weather for a given city. " +
        "Use this when the caller asks about weather conditions.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name, e.g. 'Austin' or 'New York'"
          },
          unit: {
            type: "string",
            enum: ["fahrenheit", "celsius"],
            description: "Temperature unit preference"
          }
        },
        required: ["city"]
      }
    }
  }
];`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The description fields are critical. The AI reads them to decide when to use each tool and what information to provide. Vague descriptions lead to the AI picking the wrong tool, so be specific and include examples.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Write tool descriptions as if you are explaining the tool to a new teammate. Include when to use it, what it returns, and any constraints. The better the description, the more accurately the AI will use the tool.",
    },

    { type: "page-break" },

    { type: "section", title: "Adding More Tools", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Let us add a second tool for looking up order status:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "tool-handlers.js",
      highlight: ["19-53"],
      code: `const tools = [
  {
    type: "function",
    function: {
      name: "check_weather",
      description: "Get the current weather for a given city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name"
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
        "Use this when the caller asks about an order, shipment, " +
        "or delivery status.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The order ID, e.g. 'ORD-12345'"
          }
        },
        required: ["order_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "tell_joke",
      description: "Tell the caller a short, friendly joke. " +
        "Use when the caller asks for a joke, wants to laugh, " +
        "or asks you to be funny.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];`,
    },

    { type: "page-break" },

    { type: "section", title: "Implementing the Tool Functions", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Now create the actual functions that run when the AI asks for a tool. For this workshop, we use sample data, but in a real product these would connect to actual services:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "tool-handlers.js",
      code: `// Map of tool name -> handler function
// Every handler accepts (args, ws). Most only use args; transfer_to_agent
// in step 4 also uses ws to send an "end" message mid-call.
const toolHandlers = {
  // The schema also declares a "unit" parameter (fahrenheit|celsius);
  // this teaching version ignores it for clarity. The solution at the
  // bottom of the step wires unit conversion in.
  check_weather: async ({ city }, _ws) => {
    // In production: call a real weather API
    const mockWeather = {
      "austin": { temp: 78, condition: "sunny", humidity: 45 },
      "new york": { temp: 55, condition: "cloudy", humidity: 72 },
      "seattle": { temp: 48, condition: "rainy", humidity: 88 },
    };

    const weather = mockWeather[city.toLowerCase()];
    if (!weather) {
      return { error: "Weather data not available for " + city };
    }
    return {
      city,
      temperature: weather.temp,
      condition: weather.condition,
      humidity: weather.humidity + "%"
    };
  },

  lookup_order: async ({ order_id }, _ws) => {
    // In production: query your orders database
    const mockOrders = {
      "ORD-12345": {
        status: "shipped",
        tracking: "1Z999AA10123456784",
        eta: "March 15, 2026"
      },
      "ORD-67890": {
        status: "processing",
        tracking: null,
        eta: "March 20, 2026"
      }
    };

    const order = mockOrders[order_id];
    if (!order) {
      return { error: "Order not found: " + order_id };
    }
    return { order_id, ...order };
  },

  // Simplest possible tool: no parameters, returns a random string.
  // Good template for any zero-input action (random fact, quote of the day, etc).
  tell_joke: async (_args, _ws) => {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything.",
      "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
      "Why did the developer go broke? Because they used up all their cache.",
      "Parallel lines have so much in common. It's a shame they'll never meet."
    ];
    return { joke: jokes[Math.floor(Math.random() * jokes.length)] };
  }
};

module.exports = { tools, toolHandlers };`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Always return a result from your tool functions, even on error. If a function crashes without returning anything, the AI will not know what happened and may fabricate an answer. Return an error message like `{ error: \"Not found\" }` so the AI can tell the caller what went wrong.",
    },

    { type: "section", title: "Passing Tools to OpenAI", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Include the tools list in every request to the AI:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: [4],
      code: `const response = await openai.chat.completions.create({
  model: "gpt-5.4-nano",
  messages: conversationHistory,
  tools: tools,
  stream: true,
});`,
    },

    {
      type: "solution",
      audience: "builder",
      explanation:
        "`tool-handlers.js` holds the `tools` schema plus the `toolHandlers` dispatch map and exports both. `server.js` requires that module and passes the `tools` array into every `openai.chat.completions.create` call. Switch between the two files with the tabs above the code.\n\nHeads-up on the `streamResponse` function in this solution: it is the baseline for Step 2 only. Step 3 replaces it with a tool-aware version that handles tool calls and recursion. Do not invest time polishing the Step 2 version -- you will overwrite it next step.",
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
            description: "The city name, e.g. 'Austin' or 'New York'"
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
            description: "The order ID, e.g. 'ORD-12345'"
          }
        },
        required: ["order_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "tell_joke",
      description: "Tell the caller a short, friendly joke. " +
        "Use when the caller asks for a joke, wants to laugh, or asks you to be funny.",
      parameters: { type: "object", properties: {} }
    }
  }
];

const toolHandlers = {
  check_weather: async ({ city, unit = "fahrenheit" }, _ws) => {
    const mockWeather = {
      "austin": { temp: 78, condition: "sunny", humidity: 45 },
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
      "ORD-12345": { status: "shipped", tracking: "1Z999AA10123456784", eta: "March 15, 2026" },
      "ORD-67890": { status: "processing", tracking: null, eta: "March 20, 2026" },
    };
    const order = mockOrders[order_id];
    if (!order) {
      return { error: "Order not found: " + order_id };
    }
    return { order_id, ...order };
  },

  tell_joke: async (_args, _ws) => {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything.",
      "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
      "Why did the developer go broke? Because they used up all their cache.",
      "Parallel lines have so much in common. It's a shame they'll never meet."
    ];
    return { joke: jokes[Math.floor(Math.random() * jokes.length)] };
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
const { tools } = require("./tool-handlers.js");

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
      tools: tools,
      stream: true,
    },
    { signal: activeStream.signal }
  );

  try {
    let assistantText = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        assistantText += token;
        sendText(ws, token);
      }
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
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "How many tools should you define?",
      content:
        "There is no hard limit, but more tools means more token usage (each tool definition is included in the prompt) and more potential for the LLM to pick the wrong one. For voice AI, keep it focused: 3-8 tools that cover your core use case. If you find yourself defining 20+ tools, consider grouping related functionality into fewer, more general tools.",
    },
  ],
} satisfies StepDefinition;
