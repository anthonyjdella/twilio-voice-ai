import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Verify Your Setup" },

    {
      type: "prose",
      content:
        "Before diving into code in the next chapter, let's run through a final checklist to make sure everything is in place. Each of these items is essential -- if any one is missing, your first call will not work.",
    },

    { type: "section", title: "Pre-Flight Checklist" },

    {
      type: "prose",
      content:
        "**1. Twilio Account and Phone Number** -- You have a Twilio account with a phone number that has voice capability. You can verify this in the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming) under Phone Numbers \u2192 Active Numbers.",
    },

    {
      type: "prose",
      content:
        "**2. Twilio Credentials** -- Your `.env` file contains a valid `TWILIO_ACCOUNT_SID` (starts with `AC`) and `TWILIO_AUTH_TOKEN`. These are on the [Twilio Console dashboard](https://console.twilio.com).",
    },

    {
      type: "prose",
      content:
        "**3. OpenAI API Key** -- Your `.env` file contains a valid `OPENAI_API_KEY` (starts with `sk-`). Make sure the key is active and your account has available credits at [platform.openai.com](https://platform.openai.com/settings/organization/billing/overview).",
    },

    {
      type: "prose",
      content:
        "**4. ngrok Running** -- ngrok is running in a terminal window and forwarding HTTPS traffic to `localhost:8080`. The public URL is copied into your `.env` as `PUBLIC_URL`.",
    },

    {
      type: "prose",
      content:
        "**5. Twilio Webhook Configured** -- Your Twilio phone number's \"A call comes in\" webhook is set to your ngrok URL followed by `/incoming`, with HTTP method set to POST.",
    },

    {
      type: "prose",
      content:
        "**6. Dependencies Installed** -- You ran `npm install` in the project directory and it completed without errors.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The most common issue at this stage is a mismatch between your ngrok URL and your Twilio webhook configuration. Double-check that the URL in the Twilio Console matches exactly what ngrok is showing. Also ensure you are using the `https://` version (not `http://`).",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "If you are using a Twilio trial account, you can only make calls to verified phone numbers. Go to [Phone Numbers \u2192 Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified) to add your personal phone number so you can call your AI agent during testing.",
    },

    { type: "section", title: "Ready to Build" },

    {
      type: "prose",
      content:
        "If everything checks out, you are ready to start building. In the next chapter, you will write the WebSocket server, connect it to ConversationRelay, pipe caller speech through an LLM, and make your very first AI phone call. It is going to be incredible.",
    },

    {
      type: "verify",
      question:
        "Is everything on the checklist complete? Twilio account, API keys, ngrok running, and webhook configured?",
    },
  ],
} satisfies StepDefinition;
