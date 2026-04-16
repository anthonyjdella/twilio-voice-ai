import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "Time to Make Your First Call" },

    {
      type: "prose",
      content:
        "You have all the pieces in place: a WebSocket server that handles incoming connections, TwiML that routes calls through ConversationRelay, a speech handler that captures what the caller says, and an LLM integration that streams intelligent responses. Let's bring it all together.",
    },

    { type: "section", title: "Pre-Flight Checklist" },

    {
      type: "prose",
      content: "Before you dial, make sure everything is configured:",
    },

    {
      type: "prose",
      content:
        "**1. Set your OpenAI API key** as an environment variable. The server reads it from `process.env.OPENAI_API_KEY`:",
    },

    {
      type: "terminal",
      commands: '$ export OPENAI_API_KEY="sk-your-key-here"',
    },

    {
      type: "prose",
      content:
        "**2. Update the WebSocket URL** in your TwiML. Replace `your-ngrok-url.ngrok-free.app` with your actual ngrok hostname.",
    },

    {
      type: "prose",
      content:
        "**3. Configure your Twilio phone number.** In the Twilio Console, set the voice webhook for your phone number to `https://your-ngrok-url.ngrok-free.app/incoming` with HTTP POST.",
    },

    { type: "section", title: "Start Everything Up" },

    {
      type: "prose",
      content: "Open two terminal windows. In the first, start ngrok:",
    },

    {
      type: "terminal",
      commands: `$ ngrok http 8080
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080`,
    },

    {
      type: "prose",
      content: "In the second, start your server:",
    },

    {
      type: "terminal",
      commands: `$ node server.js
Server listening on port 8080`,
    },

    { type: "section", title: "Make the Call" },

    {
      type: "prose",
      content:
        'Pick up your phone and dial your Twilio number. You should hear the welcome greeting: "Hello! How can I help you today?" Then try saying something -- ask it a question, tell it a joke, ask about the weather. The AI should respond naturally within a second or two.',
    },

    {
      type: "prose",
      content: "Watch your terminal while you talk. You should see logs like:",
    },

    {
      type: "terminal",
      commands: `$ node server.js
Server listening on port 8080
New WebSocket connection from Twilio
Call started: CA1234567890abcdef1234567890abcdef
Caller: +15551234567
Caller said: What is the capital of France?`,
    },

    {
      type: "callout",
      variant: "info",
      content:
        "The first response might take a moment as the OpenAI API warms up. After the initial exchange, responses should feel quick and conversational. If the AI does not respond at all, check your terminal for error messages -- the most common issues are a missing or invalid API key, an incorrect ngrok URL, or a webhook misconfiguration.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        'Try interrupting the AI while it is speaking. Since we set `interruptible="any"` in the TwiML, Twilio will stop playback and send your new speech as a fresh prompt. This is one of the most impressive features of ConversationRelay -- the conversation feels genuinely natural.',
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
