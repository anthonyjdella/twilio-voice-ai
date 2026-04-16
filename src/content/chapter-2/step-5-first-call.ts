import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "Time to Make Your First Call" },

    {
      type: "prose",
      content:
        "You have all the pieces in place: a WebSocket server that handles connections, a TwiML endpoint that configures ConversationRelay, an outbound call trigger, a speech handler that captures what the caller says, and an LLM integration that streams intelligent responses. Let's bring it all together.",
    },

    { type: "section", title: "Pre-Flight Checklist" },

    {
      type: "prose",
      content: "Before you trigger the call, make sure everything is configured:",
    },

    {
      type: "prose",
      content:
        "**1. Codespace port is public.** In the Ports tab, make sure port `8080` is set to **Public** visibility so Twilio can reach your server.",
    },

    {
      type: "prose",
      content:
        "**2. Update the Codespace URL** in your code. Replace `your-codespace-8080.app.github.dev` with your actual Codespace URL from the Ports tab (both in the TwiML `url` attribute and the `calls.create` URL).",
    },

    {
      type: "prose",
      content:
        "**3. Set your environment variables** in `.env`. You need `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `MY_PHONE_NUMBER`, and `OPENAI_API_KEY`.",
    },

    { type: "section", title: "Start Your Server" },

    {
      type: "prose",
      content: "In your Codespace terminal, start the server:",
    },

    {
      type: "terminal",
      commands: `$ node server.js
🚀 Server listening on port 8080`,
    },

    { type: "section", title: "Make the Call" },

    {
      type: "prose",
      content:
        "Trigger the outbound call by sending a POST request to your `/call` endpoint. You can do this with curl from a second terminal in your Codespace, or use the workshop's \"Call Me\" button if available:",
    },

    {
      type: "terminal",
      commands: `$ curl -X POST https://your-codespace-8080.app.github.dev/call
{"callSid":"CA1234567890abcdef1234567890abcdef"}`,
    },

    {
      type: "prose",
      content:
        'Your phone should ring within a few seconds. Pick up and you should hear the welcome greeting: "Hello! How can I help you today?" Then try saying something -- ask it a question, tell it a joke, ask about the weather. The AI should respond naturally within a second or two.',
    },

    {
      type: "prose",
      content: "Watch your terminal while you talk. You should see logs like:",
    },

    {
      type: "terminal",
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
      variant: "info",
      content:
        "The first response might take a moment as the OpenAI API warms up. After the initial exchange, responses should feel quick and conversational. If the AI does not respond at all, check your terminal for error messages -- the most common issues are a missing or invalid API key, an incorrect Codespace URL, or the port not being set to public.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        'Try interrupting the AI while it is speaking. Since ConversationRelay defaults to `interruptible="any"`, Twilio will stop playback and send your new speech as a fresh prompt. This is one of the most impressive features of ConversationRelay -- the conversation feels genuinely natural.',
    },

    {
      type: "verify",
      question: "Did you hear the AI respond to your voice?",
    },

    { type: "section", title: "You Just Built a Voice AI" },

    {
      type: "prose",
      content:
        "Congratulations -- you just made an AI-powered phone call. In roughly 40 lines of server code, you created an agent that listens to natural speech, thinks with an LLM, and responds in a human-sounding voice over a real phone call. That is ConversationRelay at work: Twilio handles all the audio complexity while your server focuses purely on the conversation logic.",
    },

    {
      type: "prose",
      content:
        "Right now your agent is a blank slate -- it will answer any question but has no personality, no memory structure, and no special abilities. In the next chapter, we will give it an identity: a system prompt that defines who it is, a carefully chosen voice, and language configuration that makes it sound exactly the way you want.",
    },
  ],
} satisfies StepDefinition;
