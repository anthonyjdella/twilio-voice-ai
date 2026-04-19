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
  }
];`,
    },

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

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**Handler signature:** each handler receives two arguments -- `(args, ws)`. The second argument is the active WebSocket. Most tools only need `args`, but tools like `transfer_to_agent` (step 4) need `ws` to send an `end` message mid-call. Accept it now so every handler has a uniform shape.",
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
      file: "tool-handlers.js",
      language: "javascript",
      explanation:
        "The complete `tool-handlers.js` -- both the `tools` schema array and the `toolHandlers` dispatch map, with both exported so `server.js` can pull them in via `const { tools, toolHandlers } = require(\"./tool-handlers.js\");`.",
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
  }
};

module.exports = { tools, toolHandlers };`,
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
