import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function PolishYourAgent() {
  return (
    <>
      <SectionHeader>Polish Your Agent</SectionHeader>

      <Prose>
        You have a working voice AI agent with tool calling, interruption handling, and
        handoff support. Before launch, let us go through a polishing pass to make it
        feel professional and reliable.
      </Prose>

      <SectionHeader>Refine Your System Prompt</SectionHeader>

      <Prose>
        Your system prompt is the single biggest lever for agent quality. Review it
        against this checklist:
      </Prose>

      <Prose>
        <strong>Identity</strong> -- Does the prompt clearly define who the agent is,
        what company it works for, and its role?{"\n"}
        <strong>Boundaries</strong> -- Does it specify what the agent should NOT do
        (e.g., make promises, share internal information)?{"\n"}
        <strong>Tone</strong> -- Is the tone appropriate for your use case? Customer
        support should be warm and helpful; a scheduling bot can be more concise.{"\n"}
        <strong>Edge cases</strong> -- Does it handle off-topic questions, profanity,
        or requests for competitors?{"\n"}
        <strong>Conciseness</strong> -- Voice responses should be shorter than text chat.
        Instruct the LLM to keep answers brief and conversational.
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`const systemPrompt = \`You are Ava, a customer service agent for Acme Corp.

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
\`;`}
      />

      <SectionHeader>Optimize Voice Settings</SectionHeader>

      <Prose>
        Fine-tune your TwiML attributes for the best audio experience:
      </Prose>

      <CodeBlock
        language="xml"
        file="twiml-response"
        showLineNumbers
        code={`<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      voice="en-US-Journey-F"
      ttsProvider="google"
      speechTimeout="auto"
      dtmfDetection="true"
      interruptible="true"
      interruptByDtmf="true"
      profanityFilter="true"
    />
  </Connect>
</Response>`}
      />

      <SectionHeader>Pre-Launch Checklist</SectionHeader>

      <Prose>
        Work through each item before considering your agent production-ready:
      </Prose>

      <Prose>
        <strong>Error handling</strong> -- Does your agent recover gracefully from LLM
        errors, tool failures, and network issues?{"\n"}
        <strong>Conversation history limits</strong> -- Are you capping the conversation
        history to avoid exceeding token limits? (Summarize or trim after ~20 turns.){"\n"}
        <strong>Graceful shutdown</strong> -- Does the agent handle call endings cleanly,
        clearing timers and closing connections?{"\n"}
        <strong>Logging</strong> -- Are you logging enough to debug issues but not so
        much that you expose sensitive data?{"\n"}
        <strong>Timeouts</strong> -- Do you have timeouts on all external calls (LLM,
        tools, APIs) to prevent hung connections?{"\n"}
        <strong>Rate limiting</strong> -- Is there protection against a single caller
        making excessive tool calls or API requests?
      </Prose>

      <Callout type="tip">
        Record a few test calls and listen to them critically. You will catch pacing
        issues, awkward phrasing, and edge cases that you miss during interactive
        testing. Pay special attention to the first 5 seconds -- that is when the
        caller decides if they are talking to a competent system.
      </Callout>

      <SectionHeader>Handle LLM Errors Gracefully</SectionHeader>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`async function streamResponse(ws) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversationHistory,
      tools: tools,
      stream: true,
    });

    // ... streaming logic ...

  } catch (err) {
    console.error("LLM error:", err.message);

    if (err.name === "AbortError") {
      // Expected -- stream was cancelled due to interrupt
      return;
    }

    // Fallback response so the caller is not left hanging
    sendText(ws, "I'm sorry, I'm having a technical issue. " +
      "Could you repeat that, or would you like me to " +
      "transfer you to a team member?");
  }
}`}
      />

      <DeepDive title="Monitoring in production">
        <p className="mb-2">
          For production agents, track these metrics:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Response latency</strong> -- time from caller speech to first AI audio</li>
          <li><strong>Interruption rate</strong> -- how often callers interrupt (high rate suggests slow or irrelevant responses)</li>
          <li><strong>Handoff rate</strong> -- percentage of calls that need a human</li>
          <li><strong>Call duration</strong> -- average and distribution</li>
          <li><strong>Tool success rate</strong> -- how often tools return errors</li>
          <li><strong>Silence timeout rate</strong> -- how often calls end due to silence</li>
        </ul>
      </DeepDive>
    </>
  );
}
