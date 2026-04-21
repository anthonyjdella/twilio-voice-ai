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
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/target.png",
      alt: "A target with an arrow in the bullseye — the focused, on-point demo that makes the agent land.",
      size: "md",
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
        "The best demo is a live call. The script below matches the tools and handoff setting you picked earlier -- if you turned something off in Chapter 5, it will not show up here:",
    },

    { type: "demo-script", audience: "builder" },

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
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/torch.svg",
      alt: "A lit torch — the spark of curiosity that carries a great demo from scripted reveal to real conversation.",
      size: "sm",
    },

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
