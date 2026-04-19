import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Showcase" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Show the Story, Not the Code",
      content:
        "When demoing a voice agent, let the call speak for itself. Walk through a short, believable scenario -- a real customer with a real problem -- and let the audience hear the agent handle it. Save the code walkthrough for afterwards.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Everything the agent can do -- conversations, tool calls, interruptions, handoffs -- comes together in a single live call.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent is complete. Time to show it off.",
    },

    { type: "section", audience: "builder", title: "Demo Your Agent" },

    {
      type: "prose",
      audience: "builder",
      content:
        "The best demo is a live call. A suggested script that hits every feature:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        '1. **Trigger a call** using the workshop app or curl command, and let the agent greet you.\n2. **Ask a tool question**: "What is the weather in Austin?" to show tool calling.\n3. **Test interruption**: Ask a long question, then interrupt mid-answer to show barge-in.\n4. **Try the keypad**: Press a key on your phone to show DTMF handling.\n5. **Request handoff**: Say "I need to talk to a person" to show live agent transfer.',
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Share Your Creation" },

    {
      type: "prose",
      audience: "builder",
      content:
        "At a workshop or hackathon, pair up and call each other's agents. You'll be surprised how different two agents on the same stack can feel, just from differences in the system prompt and tool design.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Share your phone number** -- Others can call the agent directly.\n**Screen share your terminal** -- Show messages flowing in real time while someone calls.\n**Record a call** -- Use Twilio's call recording feature to capture a demo you can replay.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        'Keep your terminal visible during the demo so the audience can see tool lookups, interruptions, and messages in real time. That view is often more impressive than the audio alone.',
    },

    { type: "page-break" },

    { type: "section", title: "What Makes a Great Demo" },

    {
      type: "prose",
      content:
        "The most impressive demos are the ones where something unexpected happens and the agent handles it well. Let the conversation flow naturally rather than scripting every word. If something breaks, that is a learning moment, not a failure.",
    },

    {
      type: "prose",
      content:
        'Focus the demo on the **experience**, not the implementation. Talk about what the agent does, not how it does it. The audience should think "I want one of these" -- not "that was a complicated code walkthrough."',
    },

    { type: "section", audience: "builder", title: "Checkpoint" },

    {
      type: "verify",
      audience: "builder",
      question:
        "Have you successfully demoed your agent to at least one other person?",
    },

    {
      type: "prose",
      content:
        "Whether the demo was for a room full of people or just one more test call, the core workshop is complete. One more step to go.",
    },
  ],
} satisfies StepDefinition;
