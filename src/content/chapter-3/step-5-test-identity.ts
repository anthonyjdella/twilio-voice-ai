import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Time to Test" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What to Listen For",
      content:
        "On this test call, focus on the agent's *identity* -- not whether it answers correctly. Does the voice match the tone you wanted? Does it stay in character when you ask off-topic questions? Does it politely refuse things outside its scope? If the answer to any of those is no, the persona or prompt needs another pass.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "You have crafted a system prompt, designed a persona, selected a voice, and configured the language settings. Restart your server to pick up the changes:",
    },

    { type: "terminal", audience: "builder", commands: "$ node server.js" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Make sure port 8080 is set to **Public** in your Codespace's Ports tab so Twilio can reach your server.",
    },

    {
      type: "prose",
      content:
        "Trigger a test call using the Call Me button below:",
    },

    { type: "call-me" },

    {
      type: "prose",
      audience: "builder",
      content: "Or run this from your Codespace terminal:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ curl -X POST https://<your-codespace-url>/call`,
    },

    { type: "section", title: "What to Check" },

    {
      type: "prose",
      content:
        "When the call connects, listen for these things:",
    },

    {
      type: "prose",
      content:
        "**Greeting.** Does the agent introduce itself with the name and role from its persona?",
    },

    {
      type: "prose",
      content:
        "**Tone.** Does the agent sound like the personality that was configured? Is it formal when it should be formal, casual when it should be casual?",
    },

    {
      type: "prose",
      content:
        "**Boundaries.** Ask something off-topic. Does the agent stay in character and redirect the conversation?",
    },

    {
      type: "prose",
      content:
        "**Response length.** Are the responses short and natural, or is the agent rambling?",
    },

    {
      type: "verify",
      question:
        "Does your agent respond with the right personality and voice?",
    },

    { type: "section", title: "Iterating on the Persona" },

    {
      type: "prose",
      content:
        "Getting the persona right is an iterative process. A few common adjustments:",
    },

    {
      type: "prose",
      content:
        "**Responses too long?** Add explicit length constraints to the system prompt. **Voice feels off?** Try a different voice from the same provider. **Breaking character?** Strengthen the boundaries -- be very explicit about what the agent should never do.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The system prompt is the most powerful lever for shaping behavior. Keep refining it throughout the workshop as you add new capabilities. Make sure you are happy with the basic personality and voice before moving on.",
    },

    {
      type: "prose",
      content:
        "In the next chapter, the agent gains **reflexes** \u2014 the ability to handle interruptions, detect keypad presses, manage silence, and switch languages on the fly.",
    },
  ],
} satisfies StepDefinition;
