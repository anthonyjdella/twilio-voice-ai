import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { ShowSolution } from "@/components/content/ShowSolution";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function SystemPrompt() {
  return (
    <>
      <ArchitectureDiagram highlight="llm" />

      <SectionHeader>What Is a System Prompt?</SectionHeader>

      <Prose>
        The system prompt is the first message in every conversation with your
        LLM. It defines <strong>who</strong> the AI agent is, <strong>how</strong>{" "}
        it should behave, and <strong>what</strong> it should (and should not) do.
        Think of it as the agent&apos;s backstory, personality, and operating
        manual rolled into one.
      </Prose>

      <Prose>
        For voice AI, the system prompt is even more critical than in chat
        applications. Your caller can&apos;t skim a long paragraph or scroll
        back. Every word the agent says is heard in real time, so the prompt
        must enforce a concise, conversational style.
      </Prose>

      <SectionHeader>Voice AI Prompt Principles</SectionHeader>

      <Prose>
        Writing prompts for voice is different from writing prompts for chat.
        Keep these principles in mind:
      </Prose>

      <Prose>
        <strong>1. Keep responses short.</strong> A good voice response is one
        to two sentences. Long monologues lose the caller. Instruct the LLM to
        be brief and to ask follow-up questions instead of dumping information.
      </Prose>

      <Prose>
        <strong>2. Use conversational language.</strong> Avoid bullet points,
        numbered lists, and markdown formatting. The TTS engine will read those
        literally. Write the way people actually talk.
      </Prose>

      <Prose>
        <strong>3. No markdown or special characters.</strong> Asterisks,
        headers, and links make no sense when spoken aloud. Tell the LLM
        explicitly not to use any formatting.
      </Prose>

      <Prose>
        <strong>4. Handle edge cases.</strong> What happens if the caller asks
        something off-topic? What if they&apos;re rude? Define these boundaries
        in the prompt so the agent stays on track.
      </Prose>

      <SectionHeader>Adding the System Message</SectionHeader>

      <Prose>
        In your WebSocket handler, you maintain a <code>messages</code> array
        that you send to the OpenAI API. The system prompt is the first entry
        in that array. Open your server file and add a system message at the
        beginning of the conversation:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={1}
        code={`// At the top of your WebSocket connection handler,
// initialize the messages array with a system prompt:

const messages = [
  {
    role: "system",
    content: \`You are a helpful voice assistant for Acme Corp.
Keep your responses brief — one to two sentences at most.
Speak naturally and conversationally.
Never use markdown, bullet points, or numbered lists.
If you don't know something, say so honestly.\`
  }
];`}
      />

      <Callout type="warning">
        Do not include formatting instructions like &quot;respond in
        markdown&quot; or &quot;use bullet points.&quot; The caller hears raw
        text through the TTS engine, so formatting characters will be spoken
        aloud and sound confusing.
      </Callout>

      <Callout type="tip">
        Test your system prompt by reading the LLM&apos;s responses out loud.
        If they sound natural when spoken, you&apos;re on the right track.
      </Callout>

      <SectionHeader>Your Turn</SectionHeader>

      <Prose>
        Write a system prompt for your agent. Think about what kind of
        assistant you want to build. A restaurant booking agent? A tech support
        helper? A friendly concierge? Craft a prompt that defines the
        personality and keeps responses voice-friendly.
      </Prose>

      <ShowSolution
        language="javascript"
        file="server.js"
        explanation="This prompt establishes a clear identity (Ava, a virtual concierge), sets boundaries (Acme Corp only), enforces voice-friendly behavior (short responses, no formatting), and handles edge cases (off-topic questions, unknown answers). Adapt it to your own use case."
        code={`const messages = [
  {
    role: "system",
    content: \`You are Ava, a friendly and professional virtual concierge
for Acme Corp. You help callers with appointment scheduling, general
company information, and directing them to the right department.

Guidelines:
- Keep every response to one or two sentences.
- Speak naturally as if you're having a real phone conversation.
- Never use markdown, lists, bullet points, or special formatting.
- If the caller asks about something outside Acme Corp, politely
  redirect them: "I'm only able to help with Acme Corp questions,
  but I'd be happy to transfer you to someone who can help."
- If you don't know the answer, say so and offer to connect them
  with a human agent.
- Always confirm actions before taking them: "Just to confirm, you'd
  like to book an appointment for Tuesday at 3pm, is that right?"
- Be warm and personable. Use the caller's name if they share it.\`
  }
];`}
      />
    </>
  );
}
