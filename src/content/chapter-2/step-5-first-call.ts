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
        "**2.** `MY_PHONE_NUMBER` is set in `workshop/.env` (the Twilio and OpenAI keys are pre-configured in your Codespace).",
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

    { type: "section", title: "Call Me" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The workshop pre-wired the phone system, so nothing on your side needs setup -- just type your number below and Twilio will ring you once. You can hang up at any time.",
    },

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
        "Try speaking while the AI is talking -- it will pause. In Chapter 4, you will see how the agent handles interruptions cleanly.",
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
      audience: "builder",
      question: "Did you hear the AI respond to your voice?",
      troubleshooting: [
        "Watch your terminal while you call -- you should see logs for `📞 New WebSocket connection`, `✅ Call started`, and `🗣️ Caller: ...`",
        "No WebSocket connection logged? Port 8080 is probably not Public in the Codespace Ports tab",
        "Call connects but greeting plays then silence? The server probably isn't receiving `prompt` messages -- check port 8080 is Public and the terminal shows `🗣️ Caller: ...` logs",
        "Hearing the fallback apology message? That's the OpenAI catch block -- check `OPENAI_API_KEY` and the terminal for LLM errors",
        "Call never rings? Check the `/call` response in the terminal and verify `TWILIO_PHONE_NUMBER` is a voice-capable number you own",
        "Number format must be E.164 (`+15551234567`) in both `MY_PHONE_NUMBER` and the Call Me input",
        "Trial accounts can only call verified numbers -- verify `MY_PHONE_NUMBER` in the Twilio Console if you're on a trial",
      ],
    },

    {
      type: "verify",
      audience: "explorer",
      question: "Did you hear the AI respond to your voice?",
      troubleshooting: [
        "Make sure you entered your phone number with country code (like +12065551234)",
        "Check that your phone has signal and isn't on Do Not Disturb",
        "The call can take a few seconds to arrive -- give it about 10 seconds",
        "If nothing rings, try the Call Me button again",
        "Some carriers flag unknown numbers as spam -- check your recent calls",
      ],
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Twilio handles all the audio. Your server only deals with text.",
    },

    {
      type: "prose",
      content:
        "Next chapter: the agent gets its name, its personality, and its voice.",
    },
  ],
} satisfies StepDefinition;
