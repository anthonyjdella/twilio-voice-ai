import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Polish Your Agent" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Line Between Demo and Product",
      content:
        "A demo works once, on command, with a friendly audience. A product works on a bad phone line, when the caller is frustrated, at 3am. Polish is the set of small choices -- tone, error messages, logging, graceful fallbacks -- that turn a working prototype into something you'd trust in front of real customers.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent works end to end. Before launch, a polishing pass makes it feel professional and reliable.",
    },

    { type: "section", audience: "builder", title: "Refine Your System Prompt" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The system prompt is the single biggest lever for agent quality. Review it against this checklist:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Identity** -- Does the prompt clearly define who the agent is, what company it works for, and its role?\n**Boundaries** -- Does it specify what the agent should NOT do (e.g., make promises, share internal information)?\n**Tone** -- Is the tone appropriate for your use case? Customer support should be warm and helpful; a scheduling bot can be more concise.\n**Edge cases** -- Does it handle off-topic questions, profanity, or requests for competitors?\n**Conciseness** -- Voice responses should be shorter than text chat. Tell the AI to keep answers brief and conversational.",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `const systemPrompt = \`You are Ava, a customer service agent for Acme Corp.

PERSONALITY:
- Warm, professional, and concise
- Use natural conversational language (contractions, simple words)
- Keep responses under 2-3 sentences when possible
- Never say "As an AI" or reference being a language model

CAPABILITIES:
- Check order status (use lookup_order tool)
- Provide weather information (use check_weather tool)
- Transfer to human agents when needed (use transfer_to_agent tool)

BOUNDARIES:
- Never make promises about refunds or policy exceptions
- Do not share internal pricing or systems information
- If asked about competitors, politely redirect to Acme services
- For account changes (password, email, billing), always transfer to a human

VOICE GUIDELINES:
- Speak in short, clear sentences
- Avoid lists longer than 3 items (offer to go one by one)
- Confirm important details by repeating them back
- Use filler phrases naturally: "Let me check that for you"
\`;`,
    },

    { type: "section", audience: "builder", title: "Optimize Voice Settings" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Fine-tune the ConversationRelay voice settings for the best caller experience:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**This replaces the `<ConversationRelay>` element in your existing `/twiml` handler** -- don't paste it as a second route. You already have a TwiML response from Chapter 2; this step adds new attributes (`voice`, `ttsProvider`, `interruptSensitivity`, `welcomeGreetingInterruptible`, `reportInputDuringAgentSpeech`, `hints`) onto the same element and introduces `action=\"/call-ended\"` on `<Connect>`.",
    },

    {
      type: "code",
      audience: "builder",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="en-US-Chirp3-HD-Achernar"
      ttsProvider="Google"
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
      welcomeGreeting="Hello! How can I help you today?"
      welcomeGreetingInterruptible="speech"
      reportInputDuringAgentSpeech="dtmf"
      hints="Acme, order status, transfer, refund"
    />
  </Connect>
</Response>`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**`welcomeGreetingInterruptible`** -- same values as `interruptible` (`none`, `dtmf`, `speech`, `any`), but applies only to the welcome greeting. `\"speech\"` is a good default: callers can interject without accidentally triggering on a DTMF tone.\n\n**`reportInputDuringAgentSpeech`** -- controls whether Twilio forwards speech or DTMF that arrives *while* the agent is talking, without interrupting. Default is `\"none\"`. Setting it to `\"dtmf\"` is handy for IVR-style \"press 0 for an operator\" flows.\n\n**`hints`** -- comma-separated phrases the transcriber should bias toward. If the agent deals with proper nouns, product SKUs, or acronyms, listing them here improves recognition accuracy.\n\n**`debug`** -- a space-separated list of `debugging`, `speaker-events`, `tokens-played`. Turn this on during development; turn it off before you ship.",
    },

    { type: "section", audience: "builder", title: "Pre-Launch Checklist" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Work through each item before considering the agent ready for real callers:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Error handling** -- Does the agent recover gracefully when the AI service is slow, a tool fails, or the network hiccups?\n**Conversation length limits** -- Is the conversation history trimmed or summarized after ~20 exchanges to avoid growing too long?\n**Clean call endings** -- Does the agent clear timers and close connections when a call ends?\n**Logging** -- Is there enough to troubleshoot problems without exposing sensitive caller data?\n**Timeouts** -- Are all outside calls (AI, tools, services) time-limited so the caller never waits forever?\n**Rate limiting** -- Is there protection against a single caller making excessive requests?",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Record a few test calls and listen to them critically. You'll catch pacing issues, awkward phrasing, and edge cases you miss during interactive testing. Pay special attention to the first 5 seconds -- that's when the caller decides if they're talking to a competent system.",
    },

    { type: "section", audience: "builder", title: "Handle Inbound `error` Messages" },

    {
      type: "prose",
      audience: "builder",
      content:
        "When something goes wrong on Twilio's side -- voice generation fails, transcription times out, or a message is malformed -- Twilio sends an error message so the server can react gracefully instead of leaving the caller in silence.",
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "inbound",
      messageType: "error",
      code: `{
  "type": "error",
  "description": "Failed to synthesize speech"
}`,
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    // ... existing cases (setup, prompt, interrupt, dtmf) ...

    case "error":
      // Log the fault and fall back to a graceful spoken recovery.
      // Don't try to retry automatically -- a second failure in a row
      // would just burn time while the caller waits in silence.
      console.error("⚠️ ConversationRelay error:", msg.description);
      sendText(ws,
        "I'm having a brief technical issue. " +
        "Could you say that again?",
        true,
      );
      break;
  }
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "In production, also emit a structured log entry here (with the `callSid` and conversation context) so the error shows up in your observability dashboard. Lost audio is invisible to the caller until they notice the agent isn't responding -- catch it on the server side.",
    },

    { type: "section", audience: "builder", title: "Handle AI Errors Gracefully" },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      code: `async function streamResponse(ws, iteration = 0) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: conversationHistory,
      tools: tools,
      stream: true,
    });

    // ... streaming logic ...

  } catch (err) {
    console.error("❌ LLM error:", err.message);

    if (err.name === "AbortError") {
      // Expected -- stream was cancelled due to interrupt
      return;
    }

    // Fallback response so the caller is not left hanging
    sendText(ws, "I'm sorry, I'm having a technical issue. " +
      "Could you repeat that, or would you like me to " +
      "transfer you to a team member?", true);
  }
}`,
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Monitoring in production",
      content:
        "For production agents, track these metrics:\n\n**Response latency** -- time from caller speech to first AI audio\n**Interruption rate** -- how often callers interrupt (high rate suggests slow or irrelevant responses)\n**Handoff rate** -- percentage of calls that need a human\n**Call duration** -- average and distribution\n**Tool success rate** -- how often tools return errors\n**Silence timeout rate** -- how often calls end due to silence",
    },
  ],
} satisfies StepDefinition;
