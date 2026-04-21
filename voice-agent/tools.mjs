export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "check_weather",
      description:
        "Get the current weather for a given city. Returns temperature, conditions, and humidity.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name, e.g. 'San Francisco' or 'London'",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description:
        "Look up an order by its order number. Returns order status, items, and estimated delivery.",
      parameters: {
        type: "object",
        properties: {
          order_number: {
            type: "string",
            description: "The order number, e.g. 'ORD-12345'",
          },
        },
        required: ["order_number"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "tell_joke",
      description:
        "Tell the caller a short, friendly joke. Use when the caller asks for a joke, wants to laugh, or asks you to be funny.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything.",
  "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
  "Why did the developer go broke? Because they used up all their cache.",
  "Parallel lines have so much in common. It's a shame they'll never meet.",
  "I'm reading a book on anti-gravity. It's impossible to put down.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "What do you call a fish wearing a crown? Your royal haddock.",
];

const MOCK_WEATHER = {
  "san francisco": { temp: 62, conditions: "Foggy", humidity: 78 },
  "new york": { temp: 75, conditions: "Partly Cloudy", humidity: 55 },
  london: { temp: 58, conditions: "Rainy", humidity: 85 },
  tokyo: { temp: 72, conditions: "Sunny", humidity: 60 },
  sydney: { temp: 68, conditions: "Clear", humidity: 50 },
};

const MOCK_ORDERS = {
  "ORD-12345": {
    status: "Shipped",
    items: "Wireless Headphones, USB-C Cable",
    delivery: "April 20, 2026",
  },
  "ORD-67890": {
    status: "Processing",
    items: "Mechanical Keyboard",
    delivery: "April 25, 2026",
  },
  "ORD-11111": {
    status: "Delivered",
    items: "Standing Desk, Monitor Arm",
    delivery: "Delivered April 10, 2026",
  },
};

export function executeTool(name, args) {
  switch (name) {
    case "check_weather": {
      const city = (args.city || "").toLowerCase();
      const weather = MOCK_WEATHER[city];
      if (!weather) {
        return JSON.stringify({
          error: `No weather data available for "${args.city}". Try San Francisco, New York, London, Tokyo, or Sydney.`,
        });
      }
      return JSON.stringify({
        city: args.city,
        temperature_f: weather.temp,
        conditions: weather.conditions,
        humidity_percent: weather.humidity,
      });
    }
    case "lookup_order": {
      const orderNum = (args.order_number || "").toUpperCase();
      const order = MOCK_ORDERS[orderNum];
      if (!order) {
        return JSON.stringify({
          error: `Order "${args.order_number}" not found. Try ORD-12345, ORD-67890, or ORD-11111.`,
        });
      }
      return JSON.stringify({
        order_number: orderNum,
        status: order.status,
        items: order.items,
        estimated_delivery: order.delivery,
      });
    }
    case "tell_joke": {
      const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
      return JSON.stringify({ joke });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
