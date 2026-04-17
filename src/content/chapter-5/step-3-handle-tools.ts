import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Handle Tool Calls" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Tool Loop in Plain English",
      content:
        "When the AI decides it needs a tool, it doesn't answer the caller yet -- it pauses and says, essentially, \"please look this up for me.\" Your code runs the tool (check weather, look up an order), hands the answer back to the model, and *then* the model speaks to the caller. This little back-and-forth loop is what lets a voice agent actually *do* things, not just talk about them.",
    },

    {
      type: "prose",
      content:
        "Now that your tools are defined, you need to connect them to the conversation flow. When the AI decides to use a tool instead of responding with words, your code runs the tool, sends the answer back to the AI, and lets the conversation continue.",
    },

    { type: "section", title: "Detecting Tool Calls in the Stream" },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Replace, don't append.** The `streamResponse(ws)` function below **replaces two things** from earlier chapters:\n\n1. **Delete `handlePrompt`** (from Chapter 4). The prompt case now pushes the user turn inline and calls `streamResponse(ws)` directly — see the diff below.\n2. **Delete `streamLLMResponse`** (from Chapter 2, if it still exists). `streamResponse` is its successor — same streaming idea, but with `AbortController` support, module-scope `conversationHistory`, and tool-call handling.\n\nIf you leave either old function in place alongside `streamResponse`, you'll have two `for await` loops fighting over the same `conversationHistory` and `activeStream` — the tool-call branch will never fire because the old function gets the prompt first. `conversationHistory` and `activeStream` stay at module scope (set up in Chapter 4); only the stream loop itself is swapped.",
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
        "The `require(\"./tool-handlers.js\")` import at the top of the code below must go **near the top of `server.js`**, alongside your other `require` statements. The `streamResponse` function references `tools` (passed to OpenAI) and `toolHandlers` (dispatched when a tool call fires). Without the import you'll hit `ReferenceError: tools is not defined` the moment the model tries to call a function.",
    },

    {
      type: "prose",
      content:
        "Here is the high-level logic for how your server handles tool calls during a conversation:",
    },

    {
      type: "prose",
      content:
        "1. Send the conversation to the AI and start listening for the reply.\n2. As the reply comes in: if it is **words**, send them to the caller sentence by sentence. If the AI is **asking for a tool**, collect those requests.\n3. If the AI asked for tools → run each tool, send the results back to the AI, and let it try again with the real data.\n4. If the AI is done talking → send the last bit of text and save the reply.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
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

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const finishReason = chunk.choices[0]?.finish_reason;

    // Accumulate text content
    if (delta?.content) {
      textBuffer += delta.content;
      fullAssistantText += delta.content;

      // Send text in sentence-sized chunks for natural pacing
      const sentenceEnd = textBuffer.search(/[.!?]\\s/);
      if (sentenceEnd !== -1) {
        const sentence = textBuffer.slice(0, sentenceEnd + 1);
        sendText(ws, sentence);
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
      // Clear activeStream before recursing — handleToolCalls will call
      // streamResponse again which reassigns activeStream, but if an interrupt
      // fires between tool execution and the next stream we want the
      // AbortController reference to match the *current* in-flight call.
      activeStream = null;
      // Pass iteration so the tool loop can bound recursion via MAX_TOOL_ITERATIONS
      await handleToolCalls(ws, toolCalls, iteration);
      return;
    }

    if (finishReason === "stop") {
      // Flush any remaining tail text, then save the whole reply to history
      if (textBuffer.trim()) {
        sendText(ws, textBuffer.trim());
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

  activeStream = null;
}`,
    },

    { type: "section", title: "Executing Tool Calls" },

    {
      type: "prose",
      content:
        "When the AI asks for tools instead of responding with text, your server runs each tool, adds the results to the conversation, and sends everything back to the AI so it can craft a final answer:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
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
      console.log(\`🔧 Calling tool: \${fnName}\`, fnArgs);

      const handler = toolHandlers[fnName];
      if (!handler) {
        result = { error: \`Unknown tool: \${fnName}\` };
      } else {
        // Pass ws so handlers that need to send messages mid-call
        // (e.g. transfer_to_agent in step 4) can reach the socket.
        result = await handler(fnArgs, ws);
      }
    } catch (err) {
      console.error(\`❌ Tool error (\${fnName}):\`, err.message);
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
      variant: "info",
      content:
        "**Why `content: null` on the assistant message?** The OpenAI Chat Completions API requires *either* `content` *or* `tool_calls` on an assistant turn — and when the model chose to call a tool, there is no user-facing text yet. Setting `content: null` and populating `tool_calls` mirrors exactly what the model returned, so the next request reconstructs the conversation faithfully. Omitting `tool_calls`, or setting `content` to a string like `\"\"`, will make the API reject the follow-up request with a `tool_call_id not found` error on the matching `role: \"tool\"` message.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Always wrap tool execution in a try/catch. If a tool throws an error, you still need to send a `tool` message back to OpenAI. Without it, the API will reject your next request because it expects a tool result for every tool call.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Tool results must be strings.** The `content` field on a `role: \"tool\"` message must be a JSON string, not a raw object. Always use `JSON.stringify(result)` when adding tool results to `conversationHistory`. If you pass an object directly, the OpenAI API will reject the next request with a parsing error.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "While a tool is running, the caller hears silence. For tools that take more than a second, consider having the agent say something like \"Let me check that for you...\" first. This keeps the conversation feeling natural.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `// Send a filler message for slow tools
const SLOW_TOOLS = ["lookup_order", "search_inventory"];

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  const hasSlowTool = toolCalls.some(
    tc => SLOW_TOOLS.includes(tc.function.name)
  );

  if (hasSlowTool) {
    sendText(ws, "One moment while I look that up...");
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
        "The complete streamResponse and handleToolCalls functions, including filler messages for slow tools and iteration limits for safety.",
      code: `// Pulled in from step 2 — drives both the tools array and the dispatch table
const { tools, toolHandlers } = require("./tool-handlers.js");

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

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const finishReason = chunk.choices[0]?.finish_reason;

    if (delta?.content) {
      textBuffer += delta.content;
      fullAssistantText += delta.content;
      const sentenceEnd = textBuffer.search(/[.!?]\\s/);
      if (sentenceEnd !== -1) {
        const sentence = textBuffer.slice(0, sentenceEnd + 1);
        sendText(ws, sentence);
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
      // Clear activeStream before recursing; the chained streamResponse will set its own
      activeStream = null;
      // Pass iteration through so the chained tool loop can count correctly
      await handleToolCalls(ws, toolCalls, iteration);
      return;
    }

    if (finishReason === "stop") {
      if (textBuffer.trim()) {
        sendText(ws, textBuffer.trim());
        textBuffer = "";
      }
      sendText(ws, "", true); // end-of-turn signal
    }
  }

  // Save the *full* assistant reply to history, not just the unsent tail
  if (fullAssistantText.trim()) {
    conversationHistory.push({ role: "assistant", content: fullAssistantText.trim() });
  }
  activeStream = null;
}

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that. Can you try rephrasing?", true);
    return;
  }

  if (toolCalls.some(tc => SLOW_TOOLS.includes(tc.function.name))) {
    sendText(ws, "One moment while I look that up...");
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
      console.log("🔧 Tool call:", fnName, fnArgs);

      const handler = toolHandlers[fnName];
      // Pass ws as the second arg so handlers that need to send messages
      // mid-call (e.g. the transfer_to_agent handoff tool in step 4) can do so.
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

  // Increment the counter before recursing so MAX_TOOL_ITERATIONS actually bounds the loop
  await streamResponse(ws, iteration + 1);
}`,
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
