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
        "The system prompt is a single paragraph you hand the AI at the start of every call -- it's the backstory, job description, and rulebook all at once. It's why the same AI can be a cheerful pizza-ordering bot on one call and a calm medical intake nurse on the next. The words you choose here control the entire personality and scope of the agent.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The system prompt is a set of instructions you give the AI before every conversation. It defines **who** the agent is, **how** it should behave, and **what** it should (and should not) do. Think of it as the agent's backstory, personality, and operating manual rolled into one.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "For voice AI, the system prompt matters even more than in a chat app. Your caller can't skim a long paragraph or scroll back -- they hear every word in real time. So the instructions must push the AI to speak concisely, like a real person on the phone.",
    },

    { type: "section", title: "Voice AI Prompt Principles", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Writing prompts for voice is different from writing prompts for chat. Keep these principles in mind:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**1. Keep responses short.** A good voice response is one to two sentences. Long monologues lose the caller. Tell the AI to be brief and to ask follow-up questions instead of dumping information.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**2. Use conversational language.** Avoid bullet points, numbered lists, and markdown formatting. The voice engine will read those literally. Write the way people actually talk.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**3. No markdown or special characters.** Asterisks, headers, and links make no sense when spoken aloud. Tell the AI explicitly not to use any formatting.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**4. Handle edge cases.** What happens if the caller asks something off-topic? What if they're rude? Define these boundaries in the prompt so the agent stays on track.",
    },

    { type: "section", title: "Adding the System Message", audience: "builder" },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Code change ahead.** In Chapter 2, the system prompt was hardcoded inside `streamLLMResponse`. Starting now, the prompt lives in `conversationHistory` instead. After pasting the code below, **find the hardcoded system message inside `streamLLMResponse`** (the `{ role: \"system\", content: \"...\" }` object in the `messages` array) **and delete it**. If you leave both in place, the AI receives duplicate system prompts and may behave unpredictably.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Chapter 3 shifts the system prompt into the conversation history itself -- it becomes the first thing the AI reads for every call. Two changes:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**1.** Pull the prompt out into a constant (so you can edit it in one place):",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-5"],
      code: `const SYSTEM_PROMPT = \`You are a helpful voice assistant for Acme Corp.
Keep your responses brief \u2014 one to two sentences at most.
Speak naturally and conversationally.
Never use markdown, bullet points, or numbered lists.
If you don't know something, say so honestly.\`;`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**2.** Add the system message to the conversation history when the call connects, then remove the hardcoded system message from the streaming function:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["3-7", "12-16"],
      code: `wss.on("connection", (ws, req) => {
  let callSid = null;
  // Seed each call with the system prompt. Every LLM turn will include
  // it, because openai.chat.completions.create receives the whole history.
  const conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  // ...rest of the setup/prompt handlers from Chapter 2
});

// Inside streamLLMResponse, the messages array is now just the history:
const stream = await openai.chat.completions.create({
  model: "gpt-5.4-nano",
  messages: conversationHistory,  // no more system message prepended here
  stream: true,
});`,
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "Read the AI's responses out loud. If they sound natural when spoken, the prompt is on the right track. If you hear formatting characters like asterisks or bullet markers, remove them from the instructions -- the caller hears raw text.",
    },

    { type: "section", title: "Your Turn", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Write a system prompt for your agent. Think about what kind of assistant you want to build -- a restaurant booking agent, a tech support helper, a friendly concierge -- then craft a prompt that defines the personality and keeps responses voice-friendly.",
    },

    {
      type: "solution",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      explanation:
        "The full wiring: a module-scope SYSTEM_PROMPT constant, seeded as the first message on every new WebSocket connection, and picked up automatically by streamLLMResponse since it passes the whole conversationHistory to OpenAI. Ava is a sample persona -- adapt the prompt to your own use case.",
      code: `const SYSTEM_PROMPT = \`You are Ava, a friendly and professional virtual concierge
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
- Be warm and personable. Use the caller's name if they share it.\`;

wss.on("connection", (ws, req) => {
  let callSid = null;
  const conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`\u2705 Call started: \${callSid}\`);
        break;

      case "prompt":
        if (!message.last) break;
        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });
        streamLLMResponse(ws, conversationHistory);
        break;
    }
  });
});

// streamLLMResponse no longer hardcodes a system message --
// it comes from the first entry in conversationHistory.
async function streamLLMResponse(ws, conversationHistory) {
  const stream = await openai.chat.completions.create({
    model: "gpt-5.4-nano",
    messages: conversationHistory,
    stream: true,
  });
  // ...token forwarding as in Chapter 2
}`,
    },
  ],
} satisfies StepDefinition;
