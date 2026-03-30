import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function PersonaBuilder() {
  return (
    <>
      <SectionHeader>Designing a Persona</SectionHeader>

      <Prose>
        A great voice agent is more than a system prompt. It&apos;s a
        <strong> persona</strong> — a consistent character with a name, tone,
        and set of behaviors that callers can relate to. Before writing any
        code, think through these four dimensions:
      </Prose>

      <Prose>
        <strong>Name and role.</strong> Give your agent a name and a clear job
        title. &quot;Hi, I&apos;m Ava, your Acme Corp concierge&quot; instantly
        sets expectations. The caller knows who they&apos;re talking to and
        what kind of help to expect.
      </Prose>

      <Prose>
        <strong>Tone.</strong> Is your agent formal or casual? Warm or
        efficient? A healthcare appointment scheduler should sound professional
        and calm. A pizza ordering bot can afford to be upbeat and playful.
      </Prose>

      <Prose>
        <strong>Boundaries.</strong> Define what the agent can and cannot do.
        This prevents the LLM from hallucinating capabilities. Be explicit:
        &quot;You cannot process payments&quot; or &quot;You can only answer
        questions about our menu.&quot;
      </Prose>

      <Prose>
        <strong>Fallback behavior.</strong> Every persona needs a graceful way
        to say &quot;I don&apos;t know.&quot; Decide whether the agent should
        offer to transfer to a human, suggest calling back, or simply
        acknowledge the limitation.
      </Prose>

      <SectionHeader>Persona Examples</SectionHeader>

      <Prose>
        Here are three different persona styles to show how the same structure
        produces very different experiences. Notice how each one stays
        voice-friendly with short, natural sentences.
      </Prose>

      <CodeBlock
        language="javascript"
        file="personas/friendly-assistant.js"
        code={`// Friendly Assistant — warm, casual, helpful
const systemPrompt = \`You are Sam, a friendly assistant at Sunny
Day Travel Agency. You help callers plan vacations, find deals,
and answer travel questions.

Keep your tone upbeat and warm, like chatting with a friend.
Responses should be one to two sentences. Never use lists or
markdown. If you're not sure about pricing, let the caller know
you'll connect them with a travel specialist.\`;`}
      />

      <CodeBlock
        language="javascript"
        file="personas/professional-concierge.js"
        code={`// Professional Concierge — polished, efficient, precise
const systemPrompt = \`You are Ms. Chen, a concierge at The Grand
Metropolitan Hotel. You assist guests with reservations, local
recommendations, and hotel services.

Maintain a polished and courteous tone at all times. Be efficient
with your words — guests appreciate brevity. Never use formatting
or special characters. If a request is outside hotel services,
offer to connect the guest with the appropriate department.\`;`}
      />

      <CodeBlock
        language="javascript"
        file="personas/casual-helper.js"
        code={`// Casual Helper — relaxed, fun, approachable
const systemPrompt = \`You are Jake from Pete's Pizza. You help
people order pizza, check on delivery status, and answer menu
questions.

Talk like a real person — keep it chill and fun. Short answers
only. No fancy formatting. If someone asks about something that
isn't pizza-related, joke about it briefly and steer things back
to the menu.\`;`}
      />

      <SectionHeader>Voice-Specific Prompt Engineering Tips</SectionHeader>

      <Callout type="tip">
        Avoid instructing the LLM to &quot;list the options.&quot; Instead, say
        &quot;mention a couple of the most popular options and ask which sounds
        good.&quot; This produces responses that flow naturally in conversation.
      </Callout>

      <Prose>
        <strong>Favor questions over statements.</strong> A chatbot might say
        &quot;Here are your options: A, B, and C.&quot; A voice agent should
        say &quot;Would you prefer A or B? We also have C if you&apos;re
        interested.&quot; Questions keep the conversation moving.
      </Prose>

      <Prose>
        <strong>Use filler phrases sparingly.</strong> A well-placed
        &quot;Let me check on that for you&quot; sounds human and buys time.
        But too many fillers sound evasive. Strike a balance.
      </Prose>

      <Prose>
        <strong>Instruct on pronunciation.</strong> If your agent says company
        names, technical terms, or acronyms, include pronunciation hints in the
        prompt. For example: &quot;Pronounce ACME as two syllables:
        AK-mee.&quot;
      </Prose>

      <DeepDive title="How Persona Affects Turn-Taking">
        <p>
          The persona you choose impacts more than just word choice — it affects
          pacing. A formal persona tends to produce longer, more complete
          sentences. A casual persona generates shorter bursts that feel more
          like texting out loud. For phone conversations, shorter turns generally
          work better because they give the caller more opportunities to jump
          in. If your agent is monologuing, try making the persona more casual
          or adding an explicit instruction like &quot;after every two
          sentences, pause and ask if the caller has questions.&quot;
        </p>
      </DeepDive>

      <Prose>
        Update your system prompt in <code>server.js</code> with your chosen
        persona. In the next step, we will pick a voice that matches it.
      </Prose>
    </>
  );
}
