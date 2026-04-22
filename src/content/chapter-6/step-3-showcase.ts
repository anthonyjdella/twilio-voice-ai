import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What Makes a Great Voice AI Agent" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What a Great Voice Agent Feels Like",
      content:
        "A great voice agent sounds like a person who happens to be helpful, not a bot following a script. It has a clear personality you can sense within a sentence or two. It responds quickly. It handles interruptions without losing its place. It knows what it can and cannot do, and when it should hand off to a human. Everything you have seen in this workshop -- the persona, the reflexes, the tools, the handoff -- is what adds up to that feeling.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent is complete. Every part you have built contributes to a single feeling on the other end of the call: *this thing is actually helpful.* The persona from Chapter 3 sets the tone. The reflexes from Chapter 4 -- interrupts, DTMF, silence, language switches -- are what keep it from feeling robotic. The tools and handoff from Chapter 5 are what let it do real work instead of just chatting. Together those four pieces are what distinguish a voice AI agent that feels good from one that feels like a phone tree.",
    },

    {
      type: "image",
      src: "/images/illustrations/target.png",
      alt: "A target with an arrow in the bullseye — the four qualities that make a voice agent land on its feet.",
      size: "md",
    },

    { type: "section", audience: "builder", title: "Try Your Agent" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Before moving on, take your agent through a few representative calls. The sample prompts below match the tools and handoff setting you picked earlier -- anything you turned off in Chapter 5 will not show up here.",
    },

    { type: "demo-script", audience: "builder" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The Builder is running a few live calls to exercise what the agent can do. Each one tests a different capability -- a simple question, a tool-driven answer, an interrupt, a handoff request. You can listen along if you are near the phone.",
    },

    { type: "page-break" },

    { type: "section", title: "Let Others Try It" },

    {
      type: "prose",
      content:
        "Hand the phone to someone who has not heard the agent yet. Every voice agent sounds different the first time someone unfamiliar calls it -- they will ask questions you never thought to test, and that is where you find out what the agent actually feels like. Two builders starting from the same workshop code but different personas and tool choices will produce strikingly different agents. That is the point.",
    },

    { type: "page-break" },

    { type: "section", title: "The Four Qualities" },

    {
      type: "prose",
      content:
        "Everything the workshop has covered maps to four qualities worth aiming for in any voice AI agent you build after this:\n\n- **Personality.** The agent knows who it is and stays consistent across every turn.\n- **Responsiveness.** The caller is never left waiting for a full sentence to finish before they can speak. Interrupts, silence handling, and fast streaming are what buy this.\n- **Capability.** The agent can actually *do* things -- look something up, place an order, check a status -- not just talk about them.\n- **Self-awareness.** The agent knows when it is the wrong tool for the job and hands off cleanly instead of guessing.\n\nMissing any one of these and callers will feel it, even if they cannot name it.",
    },

    { type: "section", audience: "builder", title: "Checkpoint" },

    {
      type: "verify",
      audience: "builder",
      question:
        "Have you tried your agent end-to-end with at least one test call?",
    },

    {
      type: "prose",
      content:
        "That is the capstone. One more step to close out the workshop.",
    },
  ],
} satisfies StepDefinition;
