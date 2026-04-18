import OpenAI from "openai";
import { buildSystemPrompt } from "./system-prompt.mjs";
import { toolDefinitions, executeTool } from "./tools.mjs";

const MAX_TOOL_ITERATIONS = 5;

export function handleConversationRelayConnection(ws) {
  const openai = new OpenAI();
  let conversationHistory = [];
  let callSid = "";
  let config = {};
  let isProcessing = false;

  ws.on("message", async (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      console.error("[voice-agent] Invalid JSON received");
      return;
    }

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        config = {
          agentName: message.customParameters?.agentName,
          personality: message.customParameters?.personality,
        };
        conversationHistory = [
          { role: "system", content: buildSystemPrompt(config) },
        ];
        console.log(
          `[voice-agent] Call ${callSid} connected from ${message.from}`
        );
        break;

      case "prompt":
        if (isProcessing) {
          console.warn(`[voice-agent] [${callSid}] Dropping overlapping prompt`);
          break;
        }
        isProcessing = true;
        console.log(`[voice-agent] [${callSid}] Caller: ${message.voicePrompt}`);
        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });
        try {
          await streamLLMResponse(openai, conversationHistory, ws, callSid);
        } catch (err) {
          console.error(`[voice-agent] [${callSid}] LLM error:`, err.message);
          sendToken(ws, "I'm sorry, I encountered a technical issue. Please try again.", true);
        } finally {
          isProcessing = false;
        }
        break;

      case "interrupt":
        console.log(
          `[voice-agent] [${callSid}] Interrupted after: "${message.utteranceUntilInterrupt}"`
        );
        trimHistoryToInterrupt(
          conversationHistory,
          message.utteranceUntilInterrupt
        );
        break;

      case "dtmf":
        console.log(`[voice-agent] [${callSid}] DTMF: ${message.digit}`);
        break;

      case "error":
        console.error(
          `[voice-agent] [${callSid}] Error: ${message.description}`
        );
        break;
    }
  });

  ws.on("error", (err) => {
    console.error(`[voice-agent] [${callSid}] WebSocket error:`, err.message);
  });

  ws.on("close", () => {
    console.log(`[voice-agent] Call ${callSid} disconnected`);
  });
}

async function streamLLMResponse(openai, history, ws, callSid) {
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-nano",
      messages: history,
      tools: toolDefinitions,
      stream: true,
    });

    let fullResponse = "";
    let currentToolCalls = [];
    let hasToolCalls = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.tool_calls) {
        hasToolCalls = true;
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          if (!currentToolCalls[idx]) {
            currentToolCalls[idx] = { id: "", name: "", arguments: "" };
          }
          if (tc.id) currentToolCalls[idx].id = tc.id;
          if (tc.function?.name) currentToolCalls[idx].name = tc.function.name;
          if (tc.function?.arguments)
            currentToolCalls[idx].arguments += tc.function.arguments;
        }
      }

      if (delta.content) {
        fullResponse += delta.content;
        sendToken(ws, delta.content, false);
      }
    }

    if (hasToolCalls) {
      history.push({
        role: "assistant",
        content: null,
        tool_calls: currentToolCalls.filter(Boolean).map((tc) => ({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: tc.arguments },
        })),
      });

      for (const tc of currentToolCalls.filter(Boolean)) {
        let args = {};
        try {
          args = JSON.parse(tc.arguments);
        } catch {
          args = {};
        }
        console.log(
          `[voice-agent] [${callSid}] Tool call: ${tc.name}(${JSON.stringify(args)})`
        );
        const result = executeTool(tc.name, args);
        history.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      continue;
    }

    if (fullResponse) {
      history.push({ role: "assistant", content: fullResponse });
      console.log(
        `[voice-agent] [${callSid}] Agent: ${fullResponse.slice(0, 100)}${fullResponse.length > 100 ? "..." : ""}`
      );
    }
    sendToken(ws, "", true);
    break;
  }

  if (iterations >= MAX_TOOL_ITERATIONS) {
    console.warn(`[voice-agent] [${callSid}] Hit tool iteration limit`);
    sendToken(ws, "I apologize, I'm having trouble completing that request.", true);
  }
}

function sendToken(ws, token, last) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({ type: "text", token, last }));
}

function trimHistoryToInterrupt(history, partialUtterance) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "assistant") {
      if (history[i].tool_calls) {
        history.splice(i, history.length - i);
      } else {
        history[i] = { role: "assistant", content: partialUtterance };
      }
      break;
    }
  }
}
