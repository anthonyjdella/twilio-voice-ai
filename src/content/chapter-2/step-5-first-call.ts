import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "diagram", variant: "architecture", highlight: "all" },

    { type: "section", title: "Time to Make Your First Call" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What Happens When You Call",
      content:
        "In a few seconds: Twilio dials your phone, plays the welcome greeting, listens for your words, sends them to the AI, and streams the AI's reply back as speech -- all while your code watches from the sidelines. If you interrupt mid-sentence, Twilio notices and lets the AI adapt. This is the first moment it actually feels like a real voice agent.",
    },

    {
      type: "prose",
      content:
        "You have all the pieces in place: a server that stays connected to Twilio during calls, instructions that tell Twilio to use your AI agent, a way to trigger a call to your phone, a handler that captures what the caller says, and an AI that streams back intelligent responses. Let's bring it all together.",
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
        "**2. No URL edits needed.** The code automatically uses your Codespace's public URL, so it works without any manual configuration.",
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
      type: "prose",
      content:
        "Copy your public Codespace URL from the Ports tab, then:",
    },

    {
      type: "terminal",
      commands: `$ curl -X POST https://<your-codespace-url>/call
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
        "The first response might take a moment as the OpenAI API warms up. After the initial exchange, responses should feel quick and conversational.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "**Call not working?** Run through this checklist:\n\n1. **Port is public** — In the Codespaces Ports tab, make sure port 8080 visibility is set to **Public** (not Private).\n2. **Server is running** — Your terminal should show `Server listening on port 8080`. If not, run `node server.js` again.\n3. **API keys are set** — Run `echo $OPENAI_API_KEY` in a terminal. If it is empty, check your `.env` file.\n4. **Phone number is set** — Make sure `MY_PHONE_NUMBER` in your `.env` is your real phone number in E.164 format (e.g., `+15551234567`).\n5. **URL matches** — The connection URL must match your Codespace domain. Look for a mismatch between what the server logs and what Twilio is trying to connect to.\n6. **Check terminal logs** — Error messages in the terminal (red text) are the fastest way to diagnose issues.",
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
        "Congratulations -- you just made an AI-powered phone call. In roughly 40 lines of server code, you created an agent that listens to natural speech, thinks with AI, and responds in a human-sounding voice over a real phone call. That is ConversationRelay at work: Twilio handles all the audio complexity while your server focuses purely on the conversation.",
    },

    {
      type: "prose",
      content:
        "Right now your agent is a blank slate -- it will answer any question but has no personality, no memory structure, and no special abilities. In the next chapter, we will give it an identity: a system prompt that defines who it is, a carefully chosen voice, and language configuration that makes it sound exactly the way you want.",
    },
  ],
} satisfies StepDefinition;
