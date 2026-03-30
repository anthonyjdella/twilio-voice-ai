import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ShowSolution } from "@/components/content/ShowSolution";

export default function DefineTools() {
  return (
    <>
      <SectionHeader>Define Tools</SectionHeader>

      <Prose>
        Tools are defined as JSON schemas that describe what each function does, what
        parameters it accepts, and what those parameters mean. The LLM uses these
        descriptions to decide when and how to call each tool.
      </Prose>

      <SectionHeader>Tool Schema Format</SectionHeader>

      <Prose>
        Each tool in the OpenAI <code>tools</code> array follows this structure:
      </Prose>

      <CodeBlock
        language="javascript"
        file="tools.js"
        showLineNumbers
        code={`const tools = [
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
];`}
      />

      <Prose>
        The <code>description</code> fields are critical. The LLM reads them to
        understand when to use each tool and what values to pass. Vague descriptions
        lead to incorrect tool usage, so be specific and include examples.
      </Prose>

      <Callout type="tip">
        Write tool descriptions as if you are explaining the function to a new teammate.
        Include when to use it, what it returns, and any constraints. The better the
        description, the more accurately the LLM will use the tool.
      </Callout>

      <SectionHeader>Adding More Tools</SectionHeader>

      <Prose>
        Let us add a second tool for looking up order status. This is a common use case
        for customer service agents:
      </Prose>

      <CodeBlock
        language="javascript"
        file="tools.js"
        showLineNumbers
        code={`const tools = [
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
];`}
      />

      <SectionHeader>Implementing the Tool Functions</SectionHeader>

      <Prose>
        Now create the actual functions that get called when the LLM requests each tool.
        For this workshop, we will use mock data, but in production these would call your
        real APIs:
      </Prose>

      <CodeBlock
        language="javascript"
        file="tool-handlers.js"
        showLineNumbers
        code={`// Map of tool name -> handler function
const toolHandlers = {
  check_weather: async ({ city }) => {
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

  lookup_order: async ({ order_id }) => {
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
};`}
      />

      <Callout type="warning">
        Always return a result from your tool functions, even on error. If the function
        throws an exception, the LLM will not get any result and may hallucinate one.
        Return a structured error message like <code>{`{ error: "Not found" }`}</code>{" "}
        so the LLM can communicate the issue to the caller.
      </Callout>

      <SectionHeader>Passing Tools to OpenAI</SectionHeader>

      <Prose>
        Include the <code>tools</code> array in every call to the OpenAI Chat Completions
        API:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: conversationHistory,
  tools: tools,
  stream: true,
});`}
      />

      <ShowSolution
        file="tools.js"
        language="javascript"
        explanation="This complete file defines both tools and their handler functions. Import this into your server.js to use them."
        code={`const tools = [
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
  check_weather: async ({ city, unit = "fahrenheit" }) => {
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

  lookup_order: async ({ order_id }) => {
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

module.exports = { tools, toolHandlers };`}
      />

      <DeepDive title="How many tools should you define?">
        <p className="mb-2">
          There is no hard limit, but more tools means more token usage (each tool
          definition is included in the prompt) and more potential for the LLM to pick
          the wrong one. For voice AI, keep it focused: 3-8 tools that cover your core
          use case. If you find yourself defining 20+ tools, consider grouping related
          functionality into fewer, more general tools.
        </p>
      </DeepDive>
    </>
  );
}
