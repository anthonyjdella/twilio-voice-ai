import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Designing a Persona" },

    {
      type: "prose",
      content:
        "A great voice agent is more than a system prompt. It's a **persona** \u2014 a consistent character with a name, tone, and set of behaviors that callers can relate to. Before writing any code, think through these four dimensions:",
    },

    {
      type: "prose",
      content:
        '**Name and role.** Give your agent a name and a clear job title. "Hi, I\'m Ava, your Acme Corp concierge" instantly sets expectations. The caller knows who they\'re talking to and what kind of help to expect.',
    },

    {
      type: "prose",
      content:
        "**Tone.** Is your agent formal or casual? Warm or efficient? A healthcare appointment scheduler should sound professional and calm. A pizza ordering bot can afford to be upbeat and playful.",
    },

    {
      type: "prose",
      content:
        '**Boundaries.** Define what the agent can and cannot do. This prevents the LLM from hallucinating capabilities. Be explicit: "You cannot process payments" or "You can only answer questions about our menu."',
    },

    {
      type: "prose",
      content:
        "**Fallback behavior.** Every persona needs a graceful way to say \"I don't know.\" Decide whether the agent should offer to transfer to a human, suggest calling back, or simply acknowledge the limitation.",
    },

    { type: "section", title: "Persona Examples" },

    {
      type: "prose",
      content:
        "Here are three different persona styles to show how the same structure produces very different experiences. Notice how each one stays voice-friendly with short, natural sentences.",
    },

    {
      type: "code",
      language: "javascript",
      file: "personas/friendly-assistant.js",
      code: `// Friendly Assistant \u2014 warm, casual, helpful
const systemPrompt = \`You are Sam, a friendly assistant at Sunny
Day Travel Agency. You help callers plan vacations, find deals,
and answer travel questions.

Keep your tone upbeat and warm, like chatting with a friend.
Responses should be one to two sentences. Never use lists or
markdown. If you're not sure about pricing, let the caller know
you'll connect them with a travel specialist.\`;`,
    },

    {
      type: "code",
      language: "javascript",
      file: "personas/professional-concierge.js",
      code: `// Professional Concierge \u2014 polished, efficient, precise
const systemPrompt = \`You are Ms. Chen, a concierge at The Grand
Metropolitan Hotel. You assist guests with reservations, local
recommendations, and hotel services.

Maintain a polished and courteous tone at all times. Be efficient
with your words \u2014 guests appreciate brevity. Never use formatting
or special characters. If a request is outside hotel services,
offer to connect the guest with the appropriate department.\`;`,
    },

    {
      type: "code",
      language: "javascript",
      file: "personas/casual-helper.js",
      code: `// Casual Helper \u2014 relaxed, fun, approachable
const systemPrompt = \`You are Jake from Pete's Pizza. You help
people order pizza, check on delivery status, and answer menu
questions.

Talk like a real person \u2014 keep it chill and fun. Short answers
only. No fancy formatting. If someone asks about something that
isn't pizza-related, joke about it briefly and steer things back
to the menu.\`;`,
    },

    { type: "section", title: "Voice-Specific Prompt Engineering Tips" },

    {
      type: "callout",
      variant: "tip",
      content:
        'Avoid instructing the LLM to "list the options." Instead, say "mention a couple of the most popular options and ask which sounds good." This produces responses that flow naturally in conversation.',
    },

    {
      type: "prose",
      content:
        '**Favor questions over statements.** A chatbot might say "Here are your options: A, B, and C." A voice agent should say "Would you prefer A or B? We also have C if you\'re interested." Questions keep the conversation moving.',
    },

    {
      type: "prose",
      content:
        '**Use filler phrases sparingly.** A well-placed "Let me check on that for you" sounds human and buys time. But too many fillers sound evasive. Strike a balance.',
    },

    {
      type: "prose",
      content:
        '**Instruct on pronunciation.** If your agent says company names, technical terms, or acronyms, include pronunciation hints in the prompt. For example: "Pronounce ACME as two syllables: AK-mee."',
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
      content:
        "Update your system prompt in `server.js` with your chosen persona. In the next step, we will pick a voice that matches it.",
    },
  ],
} satisfies StepDefinition;
