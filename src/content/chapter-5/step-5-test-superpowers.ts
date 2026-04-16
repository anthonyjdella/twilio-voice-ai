import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Test Superpowers" },

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
      commands: `$ curl -X POST http://localhost:8080/call -H "Content-Type: application/json" -d '{"to": "+1YOURPHONE"}'`,
    },

    { type: "section", title: "Test 1: Weather Tool" },

    {
      type: "prose",
      content:
        'When your phone rings, answer and ask: "What is the weather in Austin?"',
    },

    {
      type: "prose",
      content: "Watch your terminal. You should see:",
    },

    {
      type: "prose",
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
        "If the agent responds without calling the tool (just making up weather data), check that you are passing the `tools` array in your OpenAI API call. Without it, the LLM has no tools available and will hallucinate answers.",
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
        'The agent should call `lookup_order` and respond with the shipping status and tracking information. Then try an order that does not exist: "What about order ORD-99999?" The agent should gracefully handle the "not found" error.',
    },

    { type: "section", title: "Test 3: Multi-Tool Call" },

    {
      type: "prose",
      content:
        'Ask a question that requires multiple tools: "What is the weather in Seattle, and can you check order ORD-67890?" Watch your terminal to confirm both tools are called and results are incorporated into a single response.',
    },

    { type: "section", title: "Test 4: Handoff" },

    {
      type: "prose",
      content:
        'Say: "I need to speak with a real person." or "Transfer me to an agent." The AI should acknowledge the request and trigger the handoff process. Check your terminal for the `end` message with `handoffData`.',
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "If you have not set up the `action` URL on your TwiML Connect verb, the call will simply end when the handoff triggers. That is fine for testing -- you can verify the handoff logic works by checking the terminal logs.",
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
