import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Handle Tool Calls" },

    {
      type: "prose",
      content:
        "Now that you have defined your tools and their handlers, you need to wire them into the streaming response loop. When OpenAI returns a tool call instead of text, your code must execute the tool, feed the result back, and continue the conversation.",
    },

    { type: "section", title: "Detecting Tool Calls in the Stream" },

    {
      type: "prose",
      content:
        "When streaming with `stream: true`, tool calls arrive as deltas in the stream chunks. You need to accumulate the tool call data across multiple chunks, then execute the tools once the stream finishes:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `async function streamResponse(ws) {
  const abortController = new AbortController();
  activeStream = { controller: abortController };

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory,
    tools: tools,
    stream: true,
  }, { signal: abortController.signal });

  let textBuffer = "";
  let toolCalls = [];

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const finishReason = chunk.choices[0]?.finish_reason;

    // Accumulate text content
    if (delta?.content) {
      textBuffer += delta.content;

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
      await handleToolCalls(ws, toolCalls);
      return;
    }

    if (finishReason === "stop") {
      // Send any remaining text
      if (textBuffer.trim()) {
        sendText(ws, textBuffer.trim());
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
        'When the stream finishes with `finish_reason: "tool_calls"`, execute each requested tool, add the results to the conversation history, and call the LLM again:',
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `const MAX_TOOL_ITERATIONS = 5;

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that request. " +
      "Let me try a different approach.");
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
    const fnArgs = JSON.parse(toolCall.function.arguments);

    console.log(\`Calling tool: \${fnName}\`, fnArgs);

    let result;
    try {
      const handler = toolHandlers[fnName];
      if (!handler) {
        result = { error: \`Unknown tool: \${fnName}\` };
      } else {
        result = await handler(fnArgs);
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

  // Call the LLM again with the tool results
  await streamResponse(ws);
}`,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Always wrap tool execution in a try/catch. If a tool throws an error, you still need to send a `tool` message back to OpenAI. Without it, the API will reject your next request because it expects a tool result for every tool call.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "While a tool is executing, the caller hears silence. For tools that take more than a second, consider sending a filler message like \"Let me check that for you...\" before executing the tool. This keeps the conversation feeling responsive.",
    },

    {
      type: "code",
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
      code: `const MAX_TOOL_ITERATIONS = 5;
const SLOW_TOOLS = ["lookup_order"];

async function streamResponse(ws) {
  const abortController = new AbortController();
  activeStream = { controller: abortController };

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory,
    tools: tools,
    stream: true,
  }, { signal: abortController.signal });

  let textBuffer = "";
  let toolCalls = [];

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    const finishReason = chunk.choices[0]?.finish_reason;

    if (delta?.content) {
      textBuffer += delta.content;
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
      await handleToolCalls(ws, toolCalls);
      return;
    }

    if (finishReason === "stop" && textBuffer.trim()) {
      sendText(ws, textBuffer.trim());
    }
  }

  if (textBuffer.trim()) {
    conversationHistory.push({ role: "assistant", content: textBuffer.trim() });
  }
  activeStream = null;
}

async function handleToolCalls(ws, toolCalls, iteration = 0) {
  if (iteration >= MAX_TOOL_ITERATIONS) {
    sendText(ws, "I'm having trouble processing that. Can you try rephrasing?");
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
    const fnArgs = JSON.parse(toolCall.function.arguments);
    console.log("Tool call:", fnName, fnArgs);

    let result;
    try {
      const handler = toolHandlers[fnName];
      result = handler
        ? await handler(fnArgs)
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

  await streamResponse(ws);
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
