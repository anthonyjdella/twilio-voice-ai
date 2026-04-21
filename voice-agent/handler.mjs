import OpenAI from "openai";
import { buildSystemPrompt } from "./system-prompt.mjs";
import { toolDefinitions, executeTool } from "./tools.mjs";
import { recordEvent } from "../analytics/db.mjs";

const MAX_TOOL_ITERATIONS = 5;
const SILENCE_FIRST_MS = 8000;
const SILENCE_SECOND_MS = 6000;

export function handleConversationRelayConnection(ws) {
  const openai = new OpenAI();
  let conversationHistory = [];
  let callSid = "";
  let config = {};
  let activeTools = toolDefinitions;
  let isProcessing = false;
  let silenceTimer = null;
  let silenceCount = 0;
  let callStartTime = null;

  function clearSilenceTimer() {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  function startSilenceTimer() {
    clearSilenceTimer();
    const timeout = silenceCount === 0 ? SILENCE_FIRST_MS : SILENCE_SECOND_MS;
    silenceTimer = setTimeout(async () => {
      if (isProcessing) return;
      silenceCount++;
      if (silenceCount >= 3) {
        console.log(`[voice-agent] [${callSid}] Ending call after prolonged silence`);
        sendToken(ws, "It seems like you may have stepped away. I'll end the call now. Goodbye!", true);
        setTimeout(() => {
          sendEnd(ws);
        }, 3000);
        return;
      }
      console.log(`[voice-agent] [${callSid}] Silence nudge #${silenceCount}`);
      const nudge = silenceCount === 1
        ? "Are you still there? I'm here if you need anything."
        : "I haven't heard from you in a while. I'll hang up shortly if there's nothing else.";
      sendToken(ws, nudge, true);
      conversationHistory.push({ role: "assistant", content: nudge });
      startSilenceTimer();
    }, timeout);
  }

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
        activeTools = filterTools(message.customParameters?.enabledTools);
        conversationHistory = [
          { role: "system", content: buildSystemPrompt(config) },
        ];
        callStartTime = Date.now();
        console.log(
          `[voice-agent] Call ${callSid} connected from ${message.from}`
        );
        recordEvent(callSid, "call_connected", { callSid, from: message.from });
        silenceCount = 0;
        startSilenceTimer();
        break;

      case "prompt":
        silenceCount = 0;
        clearSilenceTimer();
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
          await streamLLMResponse(openai, conversationHistory, ws, callSid, activeTools);
        } catch (err) {
          console.error(`[voice-agent] [${callSid}] LLM error:`, err.message);
          sendToken(ws, "I'm sorry, I encountered a technical issue. Please try again.", true);
        } finally {
          isProcessing = false;
          startSilenceTimer();
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
        silenceCount = 0;
        clearSilenceTimer();
        console.log(`[voice-agent] [${callSid}] DTMF: ${message.digit}`);
        if (isProcessing) {
          console.warn(`[voice-agent] [${callSid}] Dropping DTMF during processing`);
          break;
        }
        isProcessing = true;
        conversationHistory.push({
          role: "user",
          content: `[The caller pressed ${message.digit} on their phone keypad]`,
        });
        try {
          await streamLLMResponse(openai, conversationHistory, ws, callSid, activeTools);
        } catch (err) {
          console.error(`[voice-agent] [${callSid}] LLM error:`, err.message);
          sendToken(ws, "I'm sorry, I encountered a technical issue. Please try again.", true);
        } finally {
          isProcessing = false;
          startSilenceTimer();
        }
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
    clearSilenceTimer();
  });

  ws.on("close", () => {
    const durationMs = callStartTime ? Date.now() - callStartTime : 0;
    console.log(`[voice-agent] Call ${callSid} disconnected`);
    recordEvent(callSid, "call_ended", { callSid, durationMs });
    clearSilenceTimer();
  });
}

const LANG_MARKER_RE = /\[LANG:([a-z]{2}-[A-Z]{2})\]/g;
const HANDOFF_MARKER = "[HANDOFF]";

async function streamLLMResponse(openai, history, ws, callSid, tools = toolDefinitions) {
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const requestBody = {
      model: process.env.OPENAI_MODEL || "gpt-5.4-nano",
      messages: history,
      stream: true,
    };
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    const stream = await openai.chat.completions.create(requestBody);

    let fullResponse = "";
    let currentToolCalls = [];
    let hasToolCalls = false;
    let pendingSend = "";

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
        pendingSend += delta.content;

        // Buffer text when we see a potential partial marker starting
        if (/\[(?:LANG|HANDOFF)[^\]]*$/.test(pendingSend)) {
          continue;
        }

        // Check for complete language markers
        const langMatches = [...pendingSend.matchAll(LANG_MARKER_RE)];
        if (langMatches.length > 0) {
          const lastMatch = langMatches[langMatches.length - 1];
          const langCode = lastMatch[1];
          pendingSend = pendingSend.replace(LANG_MARKER_RE, "");
          console.log(`[voice-agent] [${callSid}] Language switch: ${langCode}`);
          recordEvent(callSid, "language_switched", { callSid, langCode });
          sendLanguage(ws, langCode);
        }

        // Check for complete handoff marker
        if (pendingSend.includes(HANDOFF_MARKER)) {
          pendingSend = pendingSend.replace(HANDOFF_MARKER, "");
          if (pendingSend.trim()) {
            sendToken(ws, pendingSend, true);
          }
          console.log(`[voice-agent] [${callSid}] Handoff triggered`);
          recordEvent(callSid, "handoff_triggered", { callSid });
          fullResponse = fullResponse.replace(HANDOFF_MARKER, "").replace(LANG_MARKER_RE, "");
          history.push({ role: "assistant", content: fullResponse });

          setTimeout(() => {
            sendEnd(ws, JSON.stringify({
              reasonCode: "live-agent-handoff",
              reason: "The caller requested to speak with a human agent",
            }));
          }, 1500);
          return;
        }

        if (pendingSend) {
          sendToken(ws, pendingSend, false);
        }
        pendingSend = "";
      }
    }

    // Flush any remaining buffered text (e.g. partial marker that never completed)
    if (pendingSend) {
      const cleaned = pendingSend.replace(LANG_MARKER_RE, "").replace(HANDOFF_MARKER, "");
      if (cleaned) {
        sendToken(ws, cleaned, false);
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
        recordEvent(callSid, "tool_used", { callSid, toolName: tc.name, args });
        const result = executeTool(tc.name, args);
        history.push({ role: "tool", tool_call_id: tc.id, content: result });
      }
      continue;
    }

    const cleanResponse = fullResponse.replace(LANG_MARKER_RE, "").replace(HANDOFF_MARKER, "");
    if (cleanResponse) {
      history.push({ role: "assistant", content: cleanResponse });
      console.log(
        `[voice-agent] [${callSid}] Agent: ${cleanResponse.slice(0, 100)}${cleanResponse.length > 100 ? "..." : ""}`
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

function sendEnd(ws, handoffData) {
  if (ws.readyState !== ws.OPEN) return;
  const msg = { type: "end" };
  if (handoffData) {
    msg.handoffData = handoffData;
  }
  ws.send(JSON.stringify(msg));
}

function sendLanguage(ws, langCode) {
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({
    type: "language",
    ttsLanguage: langCode,
    transcriptionLanguage: langCode,
  }));
}

function filterTools(enabledParam) {
  if (enabledParam === undefined || enabledParam === null) {
    return toolDefinitions;
  }
  const allow = new Set(
    String(enabledParam)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return toolDefinitions.filter((t) => allow.has(t.function.name));
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
