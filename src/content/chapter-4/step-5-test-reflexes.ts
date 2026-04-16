import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Test Reflexes" },

    {
      type: "prose",
      content:
        "Time to put your agent's reflexes to the test. Make sure your server is running and port 8080 is set to **Public** in your Codespace's Ports tab.",
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

    { type: "section", title: "Test 1: Interruption" },

    {
      type: "prose",
      content:
        'When your phone rings, answer and ask a question that will produce a long response, like "Tell me everything about your return policy." While the agent is speaking, interrupt it by saying "Actually, never mind."',
    },

    {
      type: "prose",
      content: "Watch your terminal output. You should see:",
    },

    {
      type: "prose",
      content:
        "1. The `interrupt` message logged with the partial utterance.\n2. The OpenAI stream being aborted.\n3. A new `prompt` message with your interruption.\n4. The agent responding to your new input, not continuing the old response.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        'If the agent keeps talking after you interrupt, check that `interruptible` is set to `"any"` (or `"speech"`) in your TwiML and that your interrupt handler is aborting the active stream.',
    },

    { type: "section", title: "Test 2: DTMF" },

    {
      type: "prose",
      content:
        'Trigger another call and press **1** on your keypad while the agent is speaking or after it finishes. You should see a `dtmf` message in your logs with `digit: "1"`, and the agent should respond based on your menu handler.',
    },

    {
      type: "prose",
      content:
        "Try pressing different keys and verify each one triggers the expected behavior. If you built a menu, test all the menu options.",
    },

    { type: "section", title: "Test 3: Silence" },

    {
      type: "prose",
      content:
        "Trigger another call and let the agent greet you. Then stay completely silent. After your configured timeout (default 8 seconds), the agent should nudge you with a gentle prompt. Stay silent again and verify the second prompt arrives, followed by a graceful call ending.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "If silence detection is not triggering, make sure you are starting the silence timer after the `setup` message and resetting it on each `prompt` message. Also check that you are not accidentally clearing the timer without restarting it.",
    },

    { type: "section", title: "Checkpoint" },

    {
      type: "verify",
      question: "Can you interrupt the AI mid-sentence?",
    },

    {
      type: "prose",
      content:
        "If all three tests pass, your agent now has solid reflexes. It can handle real-world conversational dynamics: interruptions, keypad input, and silence. These are the foundations of a production-quality voice agent.",
    },
  ],
} satisfies StepDefinition;
