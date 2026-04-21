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

    { type: "handoff-toggle", audience: "explorer" },

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
  "handoffData": "{\\"reason\\":\\"billing_dispute\\",\\"summary\\":\\"Caller wants to dispute a charge of $49.99 on order ORD-12345. AI was unable to process the refund.\\",\\"callerId\\":\\"+15551234567\\"}"
}`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The `handoffData` field carries context about the conversation so the human agent knows what happened. Include the reason for the transfer, a summary, caller information, and any relevant order or account numbers.",
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
        "**Update your existing `/twiml` response -- don't create a new one.** You already have a `<ConversationRelay>` element from Chapter 2. Add `action=\"/call-ended\"` to the surrounding `<Connect>` on *that* response, then add the `/call-ended` route below to the same `server.js`. If you forget the `action` attribute, Twilio has no URL to POST `handoffData` to when the session ends, and the `end` message will close the WebSocket without triggering any transfer TwiML -- the call will just hang up.",
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
     the snippet below just shows where the new attribute goes. -->
<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="en-US-Chirp3-HD-Achernar"
      ttsProvider="Google"
      welcomeGreeting="Hi, I'm your assistant. How can I help?"
      dtmfDetection="true"
      interruptible="any"
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
    if (handoffData) {
      // AI requested a handoff -- transfer the call
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

    { type: "page-break" },

    { type: "section", title: "Triggering Handoff from a Tool Call", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The cleanest approach is to give the AI a `transfer_to_agent` tool. Add this to the `tools` array and `toolHandlers` object in `tool-handlers.js` (alongside the tools from Step 2). When the AI decides the caller needs a human, it uses this tool, and your code sends the handoff message:",
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
      variant: "error",
      content:
        "**Do not pass sensitive information (credit card numbers, social security numbers, health records) through `handoffData` or through the AI.** This data gets logged by Twilio and stored on your server. If the caller needs to share payment or personal details, let the human agent collect it after the transfer -- not the AI.",
    },

    {
      type: "solution",
      audience: "builder",
      file: "tool-handlers.js",
      language: "javascript",
      explanation:
        "The complete tool-handlers.js with all three tool definitions and handlers, including the transfer_to_agent handoff tool added in this step.",
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
      type: "deep-dive",
      audience: "builder",
      title: "Advanced routing strategies",
      content:
        "The action URL gives you full control over what happens after handoff. Some common patterns:\n\n**Dial a specific number** -- route to different phone numbers based on department or priority.\n**Enqueue** -- place the caller in a Twilio TaskRouter queue for skills-based routing.\n**Conference** -- bring the AI and human agent together for a warm handoff where the AI introduces the caller.\n**Callback** -- if no agents are available, offer to call the customer back.",
    },
  ],
} satisfies StepDefinition;
