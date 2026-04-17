import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Showcase" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Show the Story, Not the Code",
      content:
        "When you demo a voice agent, let the call speak for itself. Walk through a short, believable scenario -- a real customer with a real problem -- and let the audience hear the agent handle it. Save the code walkthrough for afterwards.",
    },

    {
      type: "prose",
      content:
        "You have built a complete voice AI agent from scratch. It is time to show it off.",
    },

    { type: "section", title: "Demo Your Agent" },

    {
      type: "prose",
      content:
        "The best way to demonstrate your agent is a live call. Here is a suggested demo script that hits all the features you have built:",
    },

    {
      type: "prose",
      content:
        '1. **Trigger a call** using the workshop app or curl command, and let the agent greet you.\n2. **Ask a tool question**: "What is the weather in Austin?" to show tool calling in action.\n3. **Test interruption**: Ask a long question, then interrupt mid-answer to show barge-in handling.\n4. **Try the keypad**: Press a key on your phone to show menu support.\n5. **Request handoff**: Say "I need to talk to a person" to show the live agent transfer flow.',
    },

    { type: "section", title: "Share Your Creation" },

    {
      type: "prose",
      content:
        "If you are at a workshop or hackathon, pair up with someone and call each other's agents. Compare approaches -- you will likely be surprised at how different two agents built on the same stack can feel, just from differences in the system prompt and tool design.",
    },

    {
      type: "prose",
      content: "Some ways to share:",
    },

    {
      type: "prose",
      content:
        "**Share your phone number** -- Others can call your agent directly.\n**Screen share your terminal** -- Show the behind-the-scenes messages flowing in real time while someone calls your agent.\n**Record a call** -- Use Twilio's call recording feature to capture a demo call you can replay.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        'When demoing, keep your terminal visible so the audience can see the behind-the-scenes activity -- tool lookups, interruptions, and messages -- in real time. That view is often more impressive than the audio alone.',
    },

    { type: "section", title: "What Makes a Great Demo" },

    {
      type: "prose",
      content:
        "The most impressive demos are the ones where something unexpected happens and the agent handles it well. Do not script every word -- let the conversation flow naturally. Try edge cases live. If something breaks, that is a learning moment, not a failure.",
    },

    {
      type: "prose",
      content:
        'Focus your demo on the **experience**, not the code. Talk about what the agent does, not how it does it. The audience should think "I want to build one of these" -- not "that was a complicated code walkthrough."',
    },

    { type: "section", title: "Checkpoint" },

    {
      type: "verify",
      question:
        "Have you successfully demoed your agent to at least one other person?",
    },

    {
      type: "prose",
      content:
        "Whether you demoed to a room full of people or just called your own agent one more time, you have completed the core workshop. One more step to go.",
    },
  ],
} satisfies StepDefinition;
