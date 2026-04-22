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
      content:
        "Or run this from the Codespace terminal. Your Codespace's forwarded URL is in the **Ports** tab -- it looks like `https://<codespace-name>-8080.app.github.dev` (note the `-8080` infix, which maps to the forwarded port):",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ curl -X POST https://<codespace-name>-8080.app.github.dev/call`,
    },

    { type: "page-break" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "You can test all four reflexes on a **single** call. When the phone rings, answer it and try each in turn: (1) ask a long question, then cut the agent off mid-reply; (2) press **1** on the keypad while the agent is speaking; (3) stay completely silent for about ten seconds; (4) say a short Spanish phrase like \"puedes hablar en espanol?\" You're listening for liveliness, not perfection -- if any feels stiff, that is the one to talk through with the Builder afterward.",
    },

    { type: "section", title: "Test 1: Interruption", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        'When the phone rings, answer and ask a question that will produce a long response -- something like "Can you tell me everything you know about yourself?" or "What can you help me with, in detail?" While the agent is speaking, interrupt it by saying "Actually, never mind."',
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

    { type: "section", title: "Test 2: DTMF", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Trigger another call and press **1** on the keypad while the agent is speaking or after it finishes. The agent should check in about your order status.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent does not speak a menu -- DTMF is a silent shortcut wired up in `handleDtmfInput`. With the code from Step 2 you should see:\n\n- **1** -- the agent starts talking about your order status (a synthetic user turn is pushed into `conversationHistory` and sent to the LLM).\n- **2** -- the agent offers to transfer you to a representative.\n- **0** -- the agent reads out the keypad options.\n- any other digit -- the agent says it didn't recognize that option.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "**About the keypad test:** the shortcuts are wired to fixed responses regardless of your persona -- **1** asks about an order, **2** offers a transfer, **0** reads the options back -- so do not worry if the topic does not match the personality you picked. You are testing that the keypress is heard and acted on, not what the agent actually says.",
    },

    { type: "page-break" },

    { type: "section", title: "Test 3: Silence", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
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

    { type: "section", title: "Test 4: Language Switch", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
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

    { type: "page-break" },

    { type: "section", title: "Checkpoint" },

    {
      type: "verify",
      audience: "builder",
      question: "Did all four reflexes work — interruption, keypad, silence, and language switch?",
      troubleshooting: [
        "Agent kept talking after you interrupted? Check that interruptible=\"any\" in your TwiML and that your interrupt handler aborts the active LLM stream",
        "No response to keypad presses? Confirm `dtmfDetection=\"true\"`, `interruptible=\"any\"`, and `reportInputDuringAgentSpeech=\"any\"` are all on your `<ConversationRelay>`, and that your server handles the `dtmf` WebSocket message",
        "Silence didn't trigger a prompt? Make sure the silence timer starts after setup and resets on every prompt/interrupt/dtmf message",
        "Didn't switch to Spanish? Language switching is optional — check that the LLM produced a [LANG:es-ES] marker and your server sent a language WebSocket message",
        "Nothing happening at all? Make sure your server is running (node server.js) and port 8080 is set to Public in the Codespace Ports tab",
      ],
    },

    {
      type: "verify",
      audience: "explorer",
      question: "Did all four reflexes work — interruption, keypad, silence, and language switch?",
      troubleshooting: [
        "Agent kept talking after you interrupted? Hang up and try again — interruption works best when you speak clearly a second or two into the agent's response",
        "No response to keypad presses? Make sure you press the key firmly on your phone's dialpad during the call, not the contacts screen",
        "Silence didn't trigger a prompt? Stay fully quiet for about ten seconds — even light background noise can reset the timer",
        "Language switch didn't happen? This one is the most optional — if it doesn't kick in, the other three tests are the important ones",
        "Nothing happening at all? Try the Call Me button again — occasional connection hiccups are normal",
      ],
    },

    {
      type: "prose",
      content:
        "If all four tests pass, the agent now has solid reflexes -- it can handle interruptions, keypad input, silence, and language switches. These are the foundations that make a voice agent feel responsive and natural.",
    },
  ],
} satisfies StepDefinition;
