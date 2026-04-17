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
      content:
        "You have a working voice AI agent with tool calling, interruption handling, and handoff support. Before launch, let us go through a polishing pass to make it feel professional and reliable.",
    },

    { type: "section", title: "Refine Your System Prompt" },

    {
      type: "prose",
      content:
        "Your system prompt -- the instructions you give the AI -- is the single biggest lever for agent quality. Review it against this checklist:",
    },

    {
      type: "prose",
      content:
        "**Identity** -- Does the prompt clearly define who the agent is, what company it works for, and its role?\n**Boundaries** -- Does it specify what the agent should NOT do (e.g., make promises, share internal information)?\n**Tone** -- Is the tone appropriate for your use case? Customer support should be warm and helpful; a scheduling bot can be more concise.\n**Edge cases** -- Does it handle off-topic questions, profanity, or requests for competitors?\n**Conciseness** -- Voice responses should be shorter than text chat. Tell the AI to keep answers brief and conversational.",
    },

    {
      type: "code",
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

    { type: "section", title: "Optimize Voice Settings" },

    {
      type: "prose",
      content:
        "Fine-tune your voice settings for the best caller experience:",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "**This replaces the `<ConversationRelay>` element in your existing `/twiml` handler** — don't paste it as a second route. You already have a TwiML response from Chapter 2; this step adds new attributes (`voice`, `ttsProvider`, `interruptSensitivity`, `welcomeGreetingInterruptible`, `reportInputDuringAgentSpeech`, `hints`) onto the same element and introduces `action=\"/call-ended\"` on `<Connect>`. Every attribute you set in earlier chapters is still here; new ones are layered on top.",
    },

    {
      type: "code",
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
      content:
        "A few of these settings are worth calling out:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**`welcomeGreetingInterruptible`** -- same values as `interruptible` (`none`, `dtmf`, `speech`, `any`), but applies only to the welcome greeting. `\"speech\"` is a good default: callers can interject (\"hi, I just need to cancel an order\") without accidentally triggering on a DTMF tone from their keypad.\n\n**`reportInputDuringAgentSpeech`** -- controls whether Twilio forwards speech or DTMF that arrives *while* your agent is talking, without interrupting. Default is `\"none\"` (drops those inputs). Setting it to `\"dtmf\"` is handy for IVR-style \"press 0 for an operator\" flows where you want the keypress reported but not treated as a barge-in.\n\n**`hints`** -- comma-separated phrases the transcriber should bias toward. If your agent deals with proper nouns, product SKUs, or acronyms (\"Acme\", \"ENT-400\", \"SAML\"), listing them here measurably improves recognition accuracy.\n\n**`debug`** -- a space-separated list of `debugging`, `speaker-events`, `tokens-played`. Turn this on during development to see extra lifecycle events in the WebSocket; turn it off before you ship.",
    },

    { type: "section", title: "Pre-Launch Checklist" },

    {
      type: "prose",
      content:
        "Work through each item before considering your agent ready for real callers:",
    },

    {
      type: "prose",
      content:
        "**Error handling** -- Does your agent recover gracefully when the AI service is slow, a tool fails, or the network hiccups?\n**Conversation length limits** -- Are you keeping the conversation history from growing too long? (Trim or summarize after ~20 back-and-forth exchanges.)\n**Clean call endings** -- Does the agent wrap up cleanly when a call ends, clearing timers and closing connections?\n**Logging** -- Are you recording enough to troubleshoot problems but not so much that you expose sensitive caller data?\n**Timeouts** -- Do you have time limits on all outside calls (AI, tools, services) to prevent the caller from waiting forever?\n**Rate limiting** -- Is there protection against a single caller making an excessive number of requests?",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Record a few test calls and listen to them critically. You will catch pacing issues, awkward phrasing, and edge cases that you miss during interactive testing. Pay special attention to the first 5 seconds -- that is when the caller decides if they are talking to a competent system.",
    },

    { type: "section", title: "Handle Inbound `error` Messages" },

    {
      type: "prose",
      content:
        "Sometimes something goes wrong on Twilio's side -- the voice generation fails, the transcription times out, or a message was formatted incorrectly. When this happens, Twilio sends your server an error message so you can react gracefully instead of leaving the caller in silence.",
    },

    {
      type: "json-message",
      direction: "inbound",
      messageType: "error",
      code: `{
  "type": "error",
  "description": "Failed to synthesize speech"
}`,
    },

    {
      type: "code",
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
      variant: "tip",
      content:
        "In production you'd also emit a structured log entry here (with the current `callSid` and conversation context) so the error shows up in your observability dashboard. Lost audio is invisible to the caller until they notice the agent isn't responding — catch it on the server side instead.",
    },

    { type: "section", title: "Handle AI Errors Gracefully" },

    {
      type: "code",
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
      "transfer you to a team member?");
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
