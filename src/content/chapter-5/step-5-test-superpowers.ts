import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Test Superpowers" },

    {
      type: "image",
      src: "/images/illustrations/superhero.svg",
      alt: "A superhero in flight — your agent's new powers, ready to be put to the test.",
      size: "md",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What a Great Test Call Looks Like",
      content:
        "A good test call has three beats: ask something the tool should answer, ask something only a human should handle, and see if the agent makes the right choice each time. If the weather question gets a weather answer and the sensitive request gets a graceful handoff, the agent has real superpowers.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your agent now has real capabilities. Let us test tool calling and handoff to make sure everything is wired up correctly. Make sure your server is running and port 8080 is set to **Public** in your Codespace's Ports tab.",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ node server.js
Server listening on port 8080`,
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Use the Call Me button below to trigger a test call:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Trigger a test call using the Call Me button below:",
    },

    { type: "call-me" },

    {
      type: "prose",
      audience: "builder",
      content: "Or run this from your Codespace terminal:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ curl -X POST https://<your-codespace-url>/call`,
    },

    { type: "page-break" },

    { type: "section", title: "Test 1: Weather Tool" },

    {
      type: "prose",
      content:
        'When the phone rings, answer and ask: "What is the weather in Austin?"',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        'Watch your terminal. You should see:\n\n1. The `prompt` message with the transcribed speech.\n2. A log line showing `Tool call: check_weather { city: "Austin" }`.\n3. The tool result being added to the conversation.\n4. The LLM\'s natural language response being streamed to Twilio.',
    },

    {
      type: "prose",
      content:
        'The agent should say something like: "It is currently 78 degrees and sunny in Austin."',
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "If the agent makes up weather data instead of using the tool, double-check that you are passing the tools list when calling the AI. Without it, the AI does not know any tools exist and will guess instead.",
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
        'The agent should look up the order and report the shipping status and tracking number. Then try an order that does not exist: "What about order ORD-99999?" The agent should let the caller know it could not find that order.',
    },

    { type: "page-break" },

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
        'Say: "I need to speak with a real person." or "Transfer me to an agent." The AI should acknowledge the request and start the transfer to a human.',
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "If you have not set up the transfer destination yet, the call will simply end when the handoff triggers. That is fine for testing -- the important thing is that the AI recognizes the request and initiates the transfer.",
    },

    { type: "section", title: "Checkpoint" },

    {
      type: "verify",
      audience: "builder",
      question:
        "Did all four tests pass — weather lookup, order lookup, multi-tool call, and handoff?",
      troubleshooting: [
        "Agent made up weather instead of calling the tool? Confirm you're passing `tools: tools` to `openai.chat.completions.create()` in `streamResponse`",
        "Order lookup returned nothing? Check the terminal for `Tool call: lookup_order` — if missing, the LLM isn't picking the tool. Tighten the tool description",
        "Multi-tool call only answered half the question? Make sure `handleToolCalls` loops over every entry in `toolCalls` before calling `streamResponse` again",
        "Handoff didn't trigger? Verify the `transfer_to_agent` tool is in your `tools` array and its handler is sending the `end` message with `handoffData`",
        "Agent said the answer but kept hallucinating after? You may be missing the `role: \"tool\"` response with `tool_call_id` — OpenAI needs that back or it loses the thread",
        "Nothing happening at all? Restart your server and confirm port 8080 is Public in the Codespace Ports tab",
      ],
    },

    {
      type: "verify",
      audience: "explorer",
      question:
        "Did the agent use its tools and hand off when asked — weather, order, multi-question, and live handoff?",
      troubleshooting: [
        "Weather answer sounded made up? The agent ignored its tool. Head back to Pick Your Tools on Step 2 and confirm Check Weather is toggled on",
        "Order lookup didn't return the real shipping info? Same thing — check that Look Up Order is on, and try the exact order number ORD-12345",
        "Agent only answered half of a two-part question? That's normal on the first try — phone it again and say both parts in one sentence",
        "Asked for a human and nothing happened? Handoff is off by default. Open Live Agent Handoff on Step 4 and flip the toggle on",
        "Call never connected? Re-enter your phone number in the Call Me box and try again",
      ],
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "With tool calling and handoff working, the agent is no longer just a chatbot. It can take real actions, look up real data, and hand off to humans when needed.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "With tool calling and handoff working, your agent is no longer just a chatbot. It can take real actions, look up real data, and seamlessly hand off to humans when needed.",
    },
  ],
} satisfies StepDefinition;
