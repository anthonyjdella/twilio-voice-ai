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
        "The best AI agents know when to give up. A sensitive complaint, a scared caller, or a request the model just can't handle -- that's when it's time to pass the call to a human. A clean handoff includes a short summary of what happened so the human doesn't have to start from zero. Designing this path well is what turns a demo into a production product.",
    },

    {
      type: "prose",
      content:
        "No AI agent can handle every situation. Sometimes the caller needs a human -- for complex complaints, sensitive account changes, or when the AI simply cannot solve the problem. A smooth handoff from AI to a live agent is essential for production voice systems.",
    },

    { type: "section", title: "How Handoff Works" },

    {
      type: "prose",
      content:
        "ConversationRelay supports handoff through the `end` message type. When your server sends an `end` message with `handoffData`, Twilio terminates the WebSocket connection and makes an HTTP request to the **action URL** you configured in your TwiML. That action URL returns new TwiML instructions to transfer the call.",
    },

    { type: "section", title: "The End Message with Handoff" },

    {
      type: "prose",
      content: "To trigger a handoff, send this message through the WebSocket:",
    },

    {
      type: "json-message",
      direction: "outbound",
      messageType: "end",
      code: `{
  "type": "end",
  "handoffData": "{\\"reason\\":\\"billing_dispute\\",\\"summary\\":\\"Caller wants to dispute a charge of $49.99 on order ORD-12345. AI was unable to process the refund.\\",\\"callerId\\":\\"+15551234567\\"}"
}`,
    },

    {
      type: "prose",
      content:
        "The `handoffData` field is a string (typically JSON-encoded) that carries context about the conversation to the action URL. Include everything the human agent needs to pick up where the AI left off: the reason for transfer, a conversation summary, caller information, and any relevant IDs.",
    },

    { type: "section", title: "Setting Up the Action URL" },

    {
      type: "prose",
      content:
        "Add an `action` attribute to your TwiML. This is the URL that Twilio will call when the ConversationRelay session ends:",
    },

    {
      type: "code",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      dtmfDetection="true"
      interruptible="any"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      content:
        "Twilio sends a POST request to the action URL with the `handoffData` as a parameter. Your action endpoint returns new TwiML to handle the transfer:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `// Inside your http.createServer handler, add a route for the action URL:
if (req.url === "/call-ended" && req.method === "POST") {
  let body = "";
  req.on("data", (chunk) => body += chunk);
  req.on("end", () => {
    const params = new URLSearchParams(body);
    const handoffData = params.get("HandoffData");

    let twiml;
    if (handoffData) {
      // AI requested a handoff -- transfer the call
      const data = JSON.parse(handoffData);
      console.log("🤝 Handoff requested:", data.reason);
      console.log("📋 Summary:", data.summary);

      twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please hold while I transfer you to a representative.</Say>
  <Dial>
    <Queue>support</Queue>
  </Dial>
</Response>\`;
    } else {
      // Normal call end -- no handoff
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

    { type: "section", title: "Triggering Handoff from a Tool Call" },

    {
      type: "prose",
      content:
        "The cleanest pattern is to define a `transfer_to_agent` tool. When the LLM determines that the caller needs a human, it calls this tool, and your handler sends the end message:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `// Add to your tools array
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

// Add to your toolHandlers
transfer_to_agent: async ({ reason, department, summary }, ws) => {
  // Let the caller know what's happening
  sendText(ws, "I understand you need more help with this. " +
    "Let me connect you with a team member who can assist.");

  // Small delay so the caller hears the message
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "end",
      handoffData: JSON.stringify({
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
      variant: "warning",
      content:
        "After sending the `end` message, the WebSocket will close. Do not try to send any more messages after this point. Make sure the caller hears the transfer announcement before you send the end message -- hence the `setTimeout` in the example above.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Include a conversation summary in `handoffData`. Human agents strongly prefer knowing what the caller already discussed with the AI rather than making the caller repeat themselves. You can ask the LLM to generate the summary as part of the tool call parameters.",
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
