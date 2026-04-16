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
        "**1. GitHub Codespace is running** -- You have a Codespace open with the terminal ready. All dependencies are pre-installed.",
    },

    {
      type: "prose",
      content:
        "**2. Shared credentials are loaded** -- Your `.env` file contains the shared `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `OPENAI_API_KEY`, and `TWILIO_PHONE_NUMBER`. These are pre-configured in the Codespace.",
    },

    {
      type: "prose",
      content:
        "**3. You have a phone to receive calls** -- The workshop uses outbound calls. Your server will call your personal phone number, so have it nearby and ready to answer.",
    },

    {
      type: "prose",
      content:
        "**4. Port 8080 is ready** -- When you start your server in the next chapter, you'll need to make port 8080 **Public** in the Codespace Ports tab so Twilio can reach it.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "The most common issue is forgetting to set the port to **Public** in the Codespace Ports tab. Private ports require GitHub authentication, which Twilio cannot provide. If your first call fails silently, check this first.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "If you are using a Twilio trial account with your own credentials (not the shared workshop account), you can only make calls to verified phone numbers. Go to [Phone Numbers → Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified) to add your personal phone number.",
    },

    { type: "section", title: "Ready to Build" },

    {
      type: "prose",
      content:
        "If everything checks out, you are ready to start building. In the next chapter, you will write the WebSocket server, create the TwiML endpoint, pipe caller speech through an LLM, and make your very first AI phone call. It is going to be incredible.",
    },

    {
      type: "verify",
      question:
        "Is your Codespace running with credentials loaded and a phone nearby to receive calls?",
    },
  ],
} satisfies StepDefinition;
