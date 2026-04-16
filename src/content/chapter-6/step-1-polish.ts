import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Polish Your Agent" },

    {
      type: "prose",
      content:
        "You have a working voice AI agent with tool calling, interruption handling, and handoff support. Before launch, let us go through a polishing pass to make it feel professional and reliable.",
    },

    { type: "section", title: "Refine Your System Prompt" },

    {
      type: "prose",
      content:
        "Your system prompt is the single biggest lever for agent quality. Review it against this checklist:",
    },

    {
      type: "prose",
      content:
        "**Identity** -- Does the prompt clearly define who the agent is, what company it works for, and its role?\n**Boundaries** -- Does it specify what the agent should NOT do (e.g., make promises, share internal information)?\n**Tone** -- Is the tone appropriate for your use case? Customer support should be warm and helpful; a scheduling bot can be more concise.\n**Edge cases** -- Does it handle off-topic questions, profanity, or requests for competitors?\n**Conciseness** -- Voice responses should be shorter than text chat. Instruct the LLM to keep answers brief and conversational.",
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
        "Fine-tune your TwiML attributes for the best audio experience:",
    },

    {
      type: "code",
      language: "xml",
      file: "twiml-response",
      code: `<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-codespace-8080.app.github.dev/ws"
      voice="en-US-Journey-F"
      ttsProvider="Google"
      dtmfDetection="true"
      interruptible="any"
      interruptSensitivity="medium"
      welcomeGreeting="Hello! How can I help you today?"
    />
  </Connect>
</Response>`,
    },

    { type: "section", title: "Pre-Launch Checklist" },

    {
      type: "prose",
      content:
        "Work through each item before considering your agent production-ready:",
    },

    {
      type: "prose",
      content:
        "**Error handling** -- Does your agent recover gracefully from LLM errors, tool failures, and network issues?\n**Conversation history limits** -- Are you capping the conversation history to avoid exceeding token limits? (Summarize or trim after ~20 turns.)\n**Graceful shutdown** -- Does the agent handle call endings cleanly, clearing timers and closing connections?\n**Logging** -- Are you logging enough to debug issues but not so much that you expose sensitive data?\n**Timeouts** -- Do you have timeouts on all external calls (LLM, tools, APIs) to prevent hung connections?\n**Rate limiting** -- Is there protection against a single caller making excessive tool calls or API requests?",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Record a few test calls and listen to them critically. You will catch pacing issues, awkward phrasing, and edge cases that you miss during interactive testing. Pay special attention to the first 5 seconds -- that is when the caller decides if they are talking to a competent system.",
    },

    { type: "section", title: "Handle LLM Errors Gracefully" },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `async function streamResponse(ws) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
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
