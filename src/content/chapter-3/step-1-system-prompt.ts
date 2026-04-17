import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "llm" },

    { type: "section", title: "What Is a System Prompt?" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The System Prompt Shapes Behavior",
      content:
        "The system prompt is a single paragraph you hand the AI at the start of every call -- it's the backstory, job description, and rulebook all at once. It's why the same LLM can be a cheerful pizza-ordering bot on one call and a calm medical intake nurse on the next. The words you choose here control the entire personality and scope of the agent.",
    },

    {
      type: "prose",
      content:
        "The system prompt is the first message in every conversation with your LLM. It defines **who** the AI agent is, **how** it should behave, and **what** it should (and should not) do. Think of it as the agent's backstory, personality, and operating manual rolled into one.",
    },

    {
      type: "prose",
      content:
        "For voice AI, the system prompt is even more critical than in chat applications. Your caller can't skim a long paragraph or scroll back. Every word the agent says is heard in real time, so the prompt must enforce a concise, conversational style.",
    },

    { type: "section", title: "Voice AI Prompt Principles" },

    {
      type: "prose",
      content:
        "Writing prompts for voice is different from writing prompts for chat. Keep these principles in mind:",
    },

    {
      type: "prose",
      content:
        "**1. Keep responses short.** A good voice response is one to two sentences. Long monologues lose the caller. Instruct the LLM to be brief and to ask follow-up questions instead of dumping information.",
    },

    {
      type: "prose",
      content:
        "**2. Use conversational language.** Avoid bullet points, numbered lists, and markdown formatting. The TTS engine will read those literally. Write the way people actually talk.",
    },

    {
      type: "prose",
      content:
        "**3. No markdown or special characters.** Asterisks, headers, and links make no sense when spoken aloud. Tell the LLM explicitly not to use any formatting.",
    },

    {
      type: "prose",
      content:
        "**4. Handle edge cases.** What happens if the caller asks something off-topic? What if they're rude? Define these boundaries in the prompt so the agent stays on track.",
    },

    { type: "section", title: "Adding the System Message" },

    {
      type: "prose",
      content:
        "In your WebSocket handler, you maintain a `messages` array that you send to the OpenAI API. The system prompt is the first entry in that array. Open your server file and add a system message at the beginning of the conversation:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      startLine: 1,
      code: `// At the top of your WebSocket connection handler,
// initialize the messages array with a system prompt:

const messages = [
  {
    role: "system",
    content: \`You are a helpful voice assistant for Acme Corp.
Keep your responses brief \u2014 one to two sentences at most.
Speak naturally and conversationally.
Never use markdown, bullet points, or numbered lists.
If you don't know something, say so honestly.\`
  }
];`,
    },

    {
      type: "callout",
      variant: "warning",
      content:
        'Do not include formatting instructions like "respond in markdown" or "use bullet points." The caller hears raw text through the TTS engine, so formatting characters will be spoken aloud and sound confusing.',
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Test your system prompt by reading the LLM's responses out loud. If they sound natural when spoken, you're on the right track.",
    },

    { type: "section", title: "Your Turn" },

    {
      type: "prose",
      content:
        "Write a system prompt for your agent. Think about what kind of assistant you want to build. A restaurant booking agent? A tech support helper? A friendly concierge? Craft a prompt that defines the personality and keeps responses voice-friendly.",
    },

    {
      type: "solution",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      explanation:
        "This prompt establishes a clear identity (Ava, a virtual concierge), sets boundaries (Acme Corp only), enforces voice-friendly behavior (short responses, no formatting), and handles edge cases (off-topic questions, unknown answers). Adapt it to your own use case.",
      code: `const messages = [
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
];`,
    },
  ],
} satisfies StepDefinition;
