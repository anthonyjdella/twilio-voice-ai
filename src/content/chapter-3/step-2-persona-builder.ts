import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Designing a Persona" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Now Pick the Character",
      content:
        "Step 1 showed what a system prompt does. This step is where you decide who your agent actually is -- a friendly assistant, a polished concierge, a casual helper, or something you write yourself. Same mechanics, completely different experience on the call.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Step 1 covered the mechanics -- what a system prompt is, how to write one for voice, and how to wire it into `conversationHistory`. This step is where you pick a persona and commit. Below are three presets that apply the Step 1 rules (short, conversational, no markdown), each with a different character and scope.",
    },

    { type: "page-break" },

    { type: "section", title: "Persona Examples" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Each preset below is a complete `SYSTEM_PROMPT` you can drop in — three variants of the same shape, different persona text inside. Pick the one that matches the agent you want to build (or use them as a starting point for your own) and skip past the other two. **Replace the `SYSTEM_PROMPT` constant from Step 1** with your chosen text.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Below you'll see three preset personas -- Friendly Assistant, Professional Concierge, and Casual Helper. Each one gives the agent a different name, tone, and greeting. Pick the one that fits the kind of call you want to have, or write your own in the fields below.",
    },

    {
      type: "agent-config",
      audience: "explorer",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js (Friendly Assistant persona)",
      code: `// Friendly Assistant \u2014 warm, casual, helpful
const SYSTEM_PROMPT = \`You are Sam, a friendly assistant at Sunny
Day Travel Agency. You help callers plan vacations, find deals,
and answer travel questions.

Keep your tone upbeat and warm, like chatting with a friend.
Responses should be one to two sentences. Never use lists or
markdown. If you're not sure about pricing, let the caller know
you'll connect them with a travel specialist.\`;`,
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js (Professional Concierge persona)",
      code: `// Professional Concierge \u2014 polished, efficient, precise
const SYSTEM_PROMPT = \`You are Ms. Chen, a concierge at The Grand
Metropolitan Hotel. You assist guests with reservations, local
recommendations, and hotel services.

Maintain a polished and courteous tone at all times. Be efficient
with your words \u2014 guests appreciate brevity. Never use formatting
or special characters. If a request is outside hotel services,
offer to connect the guest with the appropriate department.\`;`,
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js (Casual Helper persona)",
      code: `// Casual Helper \u2014 relaxed, fun, approachable
const SYSTEM_PROMPT = \`You are Jake from Pete's Pizza. You help
people order pizza, check on delivery status, and answer menu
questions.

Talk like a real person \u2014 keep it chill and fun. Short answers
only. No fancy formatting. If someone asks about something that
isn't pizza-related, joke about it briefly and steer things back
to the menu.\`;`,
    },

    { type: "page-break", audience: "builder" },

    { type: "section", title: "Voice-Specific Tips", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        '**Favor questions over statements.** A chatbot might say "Here are your options: A, B, and C." A voice agent should say "Would you prefer A or B? We also have C if you\'re interested." Questions keep the conversation moving.',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '**Use filler phrases sparingly.** A well-placed "Let me check on that for you" sounds human and buys time. But too many fillers sound evasive. Strike a balance.',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '**Include pronunciation hints.** If the agent says company names, technical terms, or acronyms, add pronunciation guidance in the prompt. For example: "Pronounce ACME as two syllables: AK-mee."',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "How Persona Affects Turn-Taking",
      content:
        'The persona you choose impacts more than just word choice \u2014 it affects pacing. A formal persona tends to produce longer, more complete sentences. A casual persona generates shorter bursts that feel more like texting out loud. For phone conversations, shorter turns generally work better because they give the caller more opportunities to jump in. If your agent is monologuing, try making the persona more casual or adding an explicit instruction like "after every two sentences, pause and ask if the caller has questions."',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Update your system prompt in `server.js` with your chosen persona. In the next step, we will pick a voice that matches it.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Your persona settings are saved. When you make your next call, the agent will use the name, personality, and greeting you configured above.",
    },
  ],
} satisfies StepDefinition;
