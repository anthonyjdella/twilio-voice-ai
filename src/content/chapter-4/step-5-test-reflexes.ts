import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Test Reflexes" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Signs the Agent Feels Alive",
      content:
        "On this call you're checking for *liveliness*: does the agent stop talking the instant you interrupt, notice a keypress, react to silence, and recover when you switch languages? If all four feel natural, the agent has proper reflexes. Stiffness on any one of them is usually the giveaway that something needs tuning.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Time to put the agent's reflexes to the test. Make sure the server is running and port 8080 is set to **Public** in the Codespace's Ports tab.",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ node server.js
Server listening on port 8080`,
    },

    {
      type: "prose",
      content:
        "Trigger a test call using the Call Me button below:",
    },

    { type: "call-me" },

    {
      type: "prose",
      audience: "builder",
      content: "Or run this from the Codespace terminal:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ curl -X POST https://<your-codespace-url>/call`,
    },

    { type: "section", title: "Test 1: Interruption" },

    {
      type: "prose",
      content:
        'When the phone rings, answer and ask a question that will produce a long response, like "Tell me everything about your return policy." While the agent is speaking, interrupt it by saying "Actually, never mind."',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Watch the terminal output. You should see:\n\n1. The `interrupt` message logged with the partial utterance.\n2. The OpenAI stream being aborted.\n3. A new `prompt` message with the interruption.\n4. The agent responding to the new input, not continuing the old response.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        'If the agent keeps talking after you interrupt, check that `interruptible` is set to `"any"` or `"speech"` in the ConversationRelay TwiML, and that the interrupt handler is aborting the active stream.',
    },

    { type: "section", title: "Test 2: DTMF" },

    {
      type: "prose",
      content:
        "Trigger another call and press **1** on the keypad while the agent is speaking or after it finishes. The agent should respond based on the configured keypad options.",
    },

    {
      type: "prose",
      content:
        "Try pressing different keys and see how the agent responds to each one.",
    },

    { type: "section", title: "Test 3: Silence" },

    {
      type: "prose",
      content:
        "Trigger another call and let the agent greet you. Then stay completely silent. After a few seconds, the agent should nudge you with a gentle prompt. Stay silent again and verify the second prompt arrives, followed by a graceful call ending.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "If silence detection is not triggering, make sure the silence timer starts after the `setup` message and resets on each `prompt` message. Also check that the timer is not being cleared without being restarted.",
    },

    { type: "section", title: "Test 4: Language Switch" },

    {
      type: "prose",
      content:
        'Trigger another call. Start speaking in English, then say something in Spanish like "Puedes hablar en espanol?" The agent should respond in Spanish with a natural-sounding Spanish voice.',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Watch the terminal for:\n\n1. The `[LANG:es-ES]` marker being detected in the LLM output.\n2. A `language` message sent to Twilio with `ttsLanguage: \"es-ES\"`.\n3. The agent responding in Spanish.\n4. The voice sounding natural in Spanish (not an English voice attempting Spanish pronunciation).",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Language switching is the most optional feature in this chapter. If you skipped Step 4 or the LLM does not reliably produce the language marker, that is OK -- the other three tests are the critical ones.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Language switching is optional. If it does not work perfectly on this call, that is fine -- the other three tests (interruption, keypad, silence) are the important ones.",
    },

    { type: "section", title: "Checkpoint" },

    {
      type: "verify",
      question: "Can you interrupt the AI mid-sentence?",
    },

    {
      type: "prose",
      content:
        "If all four tests pass, the agent now has solid reflexes -- it can handle interruptions, keypad input, silence, and language switches. These are the foundations that make a voice agent feel responsive and natural.",
    },
  ],
} satisfies StepDefinition;
