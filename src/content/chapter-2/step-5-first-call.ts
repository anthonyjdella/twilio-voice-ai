import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "Make Your First Call" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Everything is connected. Enter your phone number below and Twilio will call you so you can talk to the AI agent live.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "All the pieces are in place. Let's test it end to end.",
    },

    { type: "section", title: "Pre-Flight Checklist", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**1.** Port `8080` is set to **Public** in the Codespace Ports tab.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**2.** Your `.env` has `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `MY_PHONE_NUMBER`, and `OPENAI_API_KEY`.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**3.** Start the server:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ node server.js
🚀 Server listening on port 8080`,
    },

    { type: "page-break" },

    { type: "section", title: "Call Me" },

    {
      type: "prose",
      content:
        "Enter your phone number (with country code, like +12065551234) and hit Call Me.",
    },

    { type: "call-me" },

    {
      type: "prose",
      content:
        "Your phone should ring within a few seconds. Pick up and you should hear: \"Hello! How can I help you today?\" Try asking it a question or telling it a joke.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Try interrupting the AI while it is talking -- just start speaking. It will stop and respond to what you said instead.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Watch your terminal for logs:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ node server.js
🚀 Server listening on port 8080
📞 Call initiated: CA1234567890abcdef1234567890abcdef
📞 New WebSocket connection
✅ Call started: CA1234567890abcdef1234567890abcdef
👤 From: +15551234567
🗣️ Caller: What is the capital of France?`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**Call not working?** Check: (1) port 8080 is Public, (2) server is running, (3) `.env` values are set, (4) phone number is in E.164 format like `+15551234567`.",
    },

    {
      type: "verify",
      question: "Did you hear the AI respond to your voice?",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "About 40 lines of code and Twilio handles all the audio. Your server only deals with text.",
    },

    {
      type: "prose",
      content:
        "Right now the agent is a blank slate. In the next chapter, we give it a name, a personality, and a voice.",
    },
  ],
} satisfies StepDefinition;
