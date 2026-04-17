import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Test Superpowers" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What a Great Test Call Looks Like",
      content:
        "A good test call has three beats: ask something the tool should answer, ask something only a human should handle, and see if the agent makes the right choice each time. If the weather question gets a weather answer and the sensitive request gets a graceful handoff, your agent has real superpowers -- not just conversation skills.",
    },

    {
      type: "prose",
      content:
        "Your agent now has real capabilities. Let us test tool calling and handoff to make sure everything is wired up correctly. Make sure your server is running and port 8080 is set to **Public** in your Codespace's Ports tab.",
    },

    {
      type: "terminal",
      commands: `$ node server.js
Server listening on port 8080`,
    },

    {
      type: "prose",
      content:
        "Trigger a test call by clicking **Call Me** in the workshop app, or run this from your Codespace terminal:",
    },

    {
      type: "terminal",
      commands: `$ curl -X POST https://<your-codespace-url>/call`,
    },

    { type: "section", title: "Test 1: Weather Tool" },

    {
      type: "prose",
      content:
        'When your phone rings, answer and ask: "What is the weather in Austin?"',
    },

    {
      type: "prose",
      audience: "builder",
      content: "Watch your terminal. You should see:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '1. The `prompt` message with the transcribed speech.\n2. A log line showing `Tool call: check_weather { city: "Austin" }`.\n3. The tool result being added to the conversation.\n4. The LLM\'s natural language response being streamed to Twilio.',
    },

    {
      type: "prose",
      content:
        'The agent should say something like: "It is currently 78 degrees and sunny in Austin."',
    },

    {
      type: "callout",
      variant: "info",
      content:
        "If the agent makes up weather data instead of using the actual tool, double-check that you are passing the tools list when calling the AI. Without it, the AI does not know any tools exist and will guess instead.",
    },

    { type: "section", title: "Test 2: Order Lookup Tool" },

    {
      type: "prose",
      content:
        'Try: "Can you check the status of order ORD-12345?"',
    },

    {
      type: "prose",
      content:
        'The agent should look up the order and tell you the shipping status and tracking number. Then try an order that does not exist: "What about order ORD-99999?" The agent should let you know it could not find that order.',
    },

    { type: "section", title: "Test 3: Multi-Tool Call" },

    {
      type: "prose",
      content:
        'Ask a question that needs multiple lookups at once: "What is the weather in Seattle, and can you check order ORD-67890?" The agent should answer both questions in one response.',
    },

    { type: "section", title: "Test 4: Handoff" },

    {
      type: "prose",
      content:
        'Say: "I need to speak with a real person." or "Transfer me to an agent." The AI should acknowledge your request and start the transfer to a human.',
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "If you have not set up the transfer destination yet, the call will simply end when the handoff triggers. That is fine for testing -- the important thing is that the AI recognizes the request and initiates the transfer.",
    },

    { type: "section", title: "Checkpoint" },

    { type: "verify", question: "Did your tool respond with the correct data?" },

    {
      type: "prose",
      content:
        "With tool calling and handoff working, your agent is no longer just a chatbot. It can take real actions, look up real data, and seamlessly hand off to humans when needed. These are the superpowers that make voice AI practical for production use cases.",
    },
  ],
} satisfies StepDefinition;
