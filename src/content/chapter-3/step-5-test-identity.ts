import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Time to Test" },

    { type: "agent-summary", audience: "explorer" },

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
        "You have crafted a system prompt, designed a persona, selected a voice, and configured the language settings. Stop the running server with **Ctrl+C**, then start it again to pick up the changes:",
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

    {
      type: "callout",
      variant: "info",
      content:
        "**Heads up.** Your persona and voice picks apply to the **next** call you trigger, not a call already in progress. To hear a new voice or persona, end the current call and press Call Me again.",
    },

    { type: "call-me" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Or run this from your Codespace terminal. `$CODESPACE_NAME` is an environment variable GitHub sets for you, so the command works as-is (the forwarded URL looks like `https://<codespace-name>-8080.app.github.dev`, which you can also see in the **Ports** tab):",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ curl -X POST "https://\${CODESPACE_NAME}-8080.app.github.dev/call"`,
    },

    { type: "page-break" },

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
      audience: "builder",
      question:
        "Does your agent respond with the right personality and voice?",
      troubleshooting: [
        "Voice sounds wrong? Revisit the voice picker — your choice takes effect on the next call, not the current one",
        "Agent using a different name or tone? Your system prompt probably needs stronger wording about the persona",
        "Agent breaks character on off-topic questions? Add explicit boundaries to the system prompt about what it should refuse",
        "Responses too long or rambling? Add a length rule like \"Keep every response to one or two sentences\" to the system prompt",
      ],
    },

    {
      type: "verify",
      audience: "explorer",
      question:
        "Does your agent respond with the right personality and voice?",
      troubleshooting: [
        "Voice sounds wrong? Revisit the voice picker — your choice takes effect on the next call, not the current one",
        "Agent tone feels off? Go back to Step 2 and try a different persona preset (or adjust the custom fields)",
        "Responses feel too long? Try the Professional Concierge preset — it tends to be briefer",
        "Agent breaks character on off-topic questions? The presets have built-in boundaries, and the agent picks up changes on the next call, not the current one",
      ],
    },

    { type: "page-break" },

    { type: "section", title: "Iterating on the Persona" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Getting the persona right is an iterative process. A few common adjustments:",
    },

    {
      type: "prose",
      audience: "builder",
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
