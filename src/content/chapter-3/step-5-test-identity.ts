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
        "You have crafted a system prompt, designed a persona, selected a voice, and configured the language settings. Now it is time to hear your agent in action. Restart your server to pick up the changes:",
    },

    { type: "terminal", audience: "builder", commands: "$ node server.js" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Make sure port 8080 is set to **Public** in your Codespace's Ports tab. This allows Twilio to reach your server.",
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

    {
      type: "prose",
      content:
        "Your server will place an outbound call to your phone. When you answer, you should hear your agent greet you with the voice and personality you configured. Try a few things during the call:",
    },

    {
      type: "prose",
      content:
        "**Test the greeting.** Does the agent introduce itself with the name and role you defined in the system prompt?",
    },

    {
      type: "prose",
      content:
        "**Test the tone.** Does the agent sound like the persona you designed? Is it formal when it should be formal, casual when it should be casual?",
    },

    {
      type: "prose",
      content:
        "**Test the boundaries.** Ask something off-topic. Does the agent stay in character and redirect the conversation?",
    },

    {
      type: "prose",
      content:
        "**Test response length.** Are the responses short and natural, or is the agent rambling? If responses are too long, tighten the system prompt with more explicit length instructions.",
    },

    {
      type: "verify",
      question:
        "Does your agent respond with the right personality and voice?",
    },

    { type: "section", title: "Iterating on Your Persona" },

    {
      type: "prose",
      content:
        "Getting the persona right is an iterative process. Here are some common adjustments:",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        'If responses are too long, add explicit instructions like "Never respond with more than two sentences" or "Always end with a question to keep the conversation moving."',
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "If the voice does not match the persona, try a different voice from the same provider. Sometimes a small change in voice makes the whole experience feel more cohesive.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "If the agent breaks character, strengthen the boundaries in your system prompt. Be very explicit about what the agent should never do.",
    },

    {
      type: "prose",
      content:
        "**The system prompt is your most powerful tool.** You will keep refining it throughout the workshop as you add new capabilities. For now, make sure you are happy with the basic personality and voice before moving on.",
    },

    {
      type: "prose",
      content:
        "In the next chapter, we will give your agent **reflexes** \u2014 the ability to handle interruptions, detect keypad presses, manage silence, and switch languages on the fly.",
    },
  ],
} satisfies StepDefinition;
