import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Handle Tool Calls" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Tool Loop in Plain English",
      content:
        "When the AI decides it needs a tool, it pauses and says \"please look this up for me.\" The tool runs, the answer comes back, and then the AI speaks to the caller. This back-and-forth loop is what lets a voice agent actually do things, not just talk about them.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Now that your tools are defined, you need to connect them to the conversation flow. When the AI decides to use a tool instead of responding with words, your code runs the tool, sends the answer back to the AI, and lets the conversation continue.",
    },

    {
      type: "image",
      src: "/images/illustrations/gears.svg",
      alt: "Two interlocking gears — the tool loop turning: AI requests, tool runs, answer flows back.",
      size: "md",
    },

    { type: "page-break" },

    { type: "section", title: "Detecting Tool Calls in the Stream", audience: "builder" },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Before you paste the code below, make these four changes to `server.js`:**\n\n- [ ] **Add** `const { tools, toolHandlers } = require(\"./tool-handlers.js\");` near the top with your other `require` statements\n- [ ] **Delete** the `handlePrompt` function (added in Chapter 4)\n- [ ] **Delete** the `streamLLMResponse` function (from Chapter 2, if it's still there)\n- [ ] **Update** the `prompt` case inside `handleMessage` to call `streamResponse(ws)` directly -- see the diff below\n\nThe warnings below explain *why* each change matters. If anything behaves unexpectedly during Step 5 testing, come back to this checklist first.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Replace, don't append.** The `streamResponse(ws)` function below **replaces two things** from earlier chapters:\n\n1. **Delete `handlePrompt`** (from Chapter 4). The prompt case now pushes the user turn inline and calls `streamResponse(ws)` directly -- see the diff below.\n2. **Delete `streamLLMResponse`** (from Chapter 2, if it still exists). `streamResponse` is its successor -- same streaming idea, but with `AbortController` support, module-scope `conversationHistory`, and tool-call handling.\n\nIf you leave either old function in place alongside `streamResponse`, you'll have two `for await` loops fighting over the same `conversationHistory` and `activeStream` -- the tool-call branch will never fire because the old function gets the prompt first. `conversationHistory` and `activeStream` stay at module scope (set up in Chapter 4); only the stream loop itself is swapped.",
    },

    {
      type: "diff",
      audience: "builder",
      file: "server.js (inside handleMessage switch)",
      code: `    case "prompt":
-      resetSilenceTimer(ws);
-      handlePrompt(ws, msg);
+      resetSilenceTimer(ws);
+      conversationHistory.push({ role: "user", content: msg.voicePrompt });
+      streamResponse(ws);
       break;`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The `require(\"./tool-handlers.js\")` import must go **near the top of `server.js`**, alongside your other `require` statements. The `streamResponse` function references `tools` (passed to OpenAI) and `toolHandlers` (dispatched when a tool call fires). Without the import you'll hit `ReferenceError: tools is not defined`.",
    },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Caller asks a question",
          description:
            '**Caller:** "Where is my order, ORD-12345?"',
        },
        {
          icon: "/images/icons/robot.svg",
          title: "AI pauses and requests a tool",
          description:
            'Instead of guessing, the AI signals: _"I need to run `lookup_order` with order number ORD-12345."_ No words go to the caller yet.',
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "Tool runs and returns an answer",
          description:
            'Your server runs the tool and gets back: _"Shipped. Arriving April 22. Tracking 1Z999AA10123456784."_',
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "AI loops with the real data",
          description:
            'The AI reads the tool\'s answer and decides what to say next. It might call another tool if it still needs more — or it might be ready to reply.',
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "AI replies with natural words",
          description:
            '**Agent:** "Your order shipped and should arrive April 22. I can text you the tracking number if you\'d like."',
        },
      ],
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "tip",
      content:
        "You'll hear this loop in action on your test call. Ask about the weather or an order -- whichever tools you have turned on -- and listen for that tiny pause where the AI runs the tool before answering. That pause is the loop doing its job.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the high-level logic:\n\n1. Send the conversation to the AI and start listening for the reply.\n2. As the reply streams in: if it is **words**, send them to the caller sentence by sentence. If the AI is **requesting a tool**, collect those requests.\n3. If the AI asked for tools, run each one, send the results back to the AI, and let it try again with the real data.\n4. If the AI is done talking, send the last bit of text and save the reply.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-2", 10, "13-14", "22-27", "30-50", "52-61"],
      code: `// At the top of server.js — import from Step 2
const { tools, toolHandlers } = require("./tool-handlers.js");

async function streamResponse(ws, iteration = 0) {
  activeStream = new AbortController();

  const stream = await openai.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: conversationHistory,
    tools: tools,
    stream: true,
  }, { signal: activeStream.signal });

  let textBuffer = "";     // holds only *unsent* text (gets sliced as sentences ship)
  let fullAssistantText = ""; // holds the full reply so we can save it to history
  let toolCalls = [];

  try {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const finishReason = chunk.choices[0]?.finish_reason;

      // Accumulate text content
      if (delta?.content) {
        textBuffer += delta.content;
        fullAssistantText += delta.content;

        // Flush whole sentences through processLLMResponse so any
        // [LANG:xx-XX] marker is stripped and the language switch
        // message reaches Twilio before the text is spoken.
        const sentenceEnd = textBuffer.search(/[.!?]\\s/);
        if (sentenceEnd !== -1) {
          const sentence = textBuffer.slice(0, sentenceEnd + 1);
          processLLMResponse(ws, sentence);
          textBuffer = textBuffer.slice(sentenceEnd + 2);
        }
      }

      // Accumulate tool call data
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

      // Stream finished
      if (finishReason === "tool_calls") {
        // handleToolCalls recurses into streamResponse, which will assign
        // its own activeStream. Null this out so the inner call "owns"
        // the AbortController reference, then skip the outer finally.
        activeStream = null;
        // Pass iteration so the tool loop can bound recursion via MAX_TOOL_ITERATIONS
        await handleToolCalls(ws, toolCalls, iteration);
        return;
      }

      if (finishReason === "stop") {
        // Flush any remaining tail text, then save the whole reply to history
        if (textBuffer.trim()) {
          processLLMResponse(ws, textBuffer.trim());
          textBuffer = "";
        }
        // Signal end-of-turn so Twilio stops waiting for more tokens.
        // Without this the caller hears the last sentence, then dead air
        // until the next prompt arrives.
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
    // Interrupt handling aborts the stream via activeStream.abort(), which
    // surfaces here as an AbortError. Swallow it; re-throw anything else.
    if (err.name !== "AbortError") throw err;
  } finally {
    // Only null activeStream on the outermost call; the tool-call branch
    // already nulled it before recursing into the next stream.
    if (iteration === 0) activeStream = null;
  }
}`,
    },

    { type: "page-break" },

    { type: "section", title: "Executing Tool Calls", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When the AI asks for tools instead of responding with text, your server runs each tool, adds the results to the conversation, and sends everything back to the AI so it can craft a final answer:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-34"],
      code: `const MAX_TOOL_ITERATIONS = 5;

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that request. " +
      "Let me try a different approach.", true);
    return;
  }

  // Add the assistant's tool call request to history
  conversationHistory.push({
    role: "assistant",
    content: null,
    tool_calls: toolCalls.map(tc => ({
      id: tc.id,
      type: "function",
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments
      }
    }))
  });

  // Execute each tool and collect results
  for (const toolCall of toolCalls) {
    const fnName = toolCall.function.name;

    let result;
    try {
      const fnArgs = JSON.parse(toolCall.function.arguments);
      console.log(\`Tool call: \${fnName}\`, fnArgs);

      const handler = toolHandlers[fnName];
      if (!handler) {
        result = { error: \`Unknown tool: \${fnName}\` };
      } else {
        // Pass ws so handlers that need to send messages mid-call
        // (e.g. transfer_to_agent in step 4) can reach the socket.
        result = await handler(fnArgs, ws);
      }
    } catch (err) {
      console.error(\`Tool error (\${fnName}):\`, err.message);
      result = { error: \`Tool execution failed: \${err.message}\` };
    }

    // Add the tool result to conversation history
    conversationHistory.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    });
  }

  // Call the LLM again with the tool results.
  // Thread iteration+1 so MAX_TOOL_ITERATIONS bounds the recursion when the
  // model calls tools in a second (or third) turn.
  await streamResponse(ws, iteration + 1);
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Three things the OpenAI API is strict about: the assistant message must have `content: null` (not `\"\"`) when it contains `tool_calls`; every tool call must get a `role: \"tool\"` response even if the tool errored; and the `content` on that response must be a `JSON.stringify()`'d string, not a raw object. Miss any of these and the next request will fail.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `// Send a filler message for slow tools. Add any tool name that
// routinely takes more than ~500ms so the caller hears something
// instead of dead air while the lookup runs.
const SLOW_TOOLS = ["lookup_order"];

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  const hasSlowTool = toolCalls.some(
    tc => SLOW_TOOLS.includes(tc.function.name)
  );

  if (hasSlowTool) {
    sendText(ws, "One moment while I look that up...", true);
  }

  // ... rest of the function
}`,
    },

    {
      type: "solution",
      audience: "builder",
      file: "server.js",
      language: "javascript",
      explanation:
        "The complete `server.js` at the end of this step. Building on Chapter 4 Step 4: `tool-handlers.js` is required at the top, `streamLLMResponse`/`handlePrompt` are gone, `streamResponse` passes `tools` to OpenAI and accumulates tool-call deltas, `handleToolCalls` dispatches each call through `toolHandlers`, and the `prompt` case in `handleMessage` now pushes the user turn and calls `streamResponse(ws)` directly. `MAX_TOOL_ITERATIONS` bounds recursion and `SLOW_TOOLS` triggers a filler message so the caller hears something during slow lookups.",
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

        // Flush whole sentences through processLLMResponse so any
        // [LANG:xx-XX] marker is stripped and the language switch
        // message reaches Twilio before the text is spoken.
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
        // handleToolCalls recurses into streamResponse, which will assign
        // its own activeStream. Null this out so the inner call "owns"
        // the AbortController reference, then skip the outer finally.
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
    if (err.name !== "AbortError") throw err;
  } finally {
    // Only null activeStream on the outermost call; the tool-call path
    // already nulled it before recursing, so an inner call's controller
    // shouldn't be clobbered here.
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

    {
      type: "deep-dive",
      audience: "builder",
      title: "Parallel vs. sequential tool execution",
      content:
        "When the LLM requests multiple tool calls in a single response, you can execute them in parallel using `Promise.all` for better performance. However, be careful if tools have dependencies on each other -- in that case, the LLM should make them in separate requests, but it does not always do so.\n\nFor most voice AI use cases, sequential execution is fine because the latency difference is small compared to the overall conversation pace. Optimize for correctness first, then speed.",
    },
  ],
} satisfies StepDefinition;
