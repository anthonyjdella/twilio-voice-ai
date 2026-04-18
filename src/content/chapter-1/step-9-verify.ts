import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "builder-only", audience: "explorer", context: "Builders are verifying their development setup. Everything is already configured for you." },

    { type: "section", title: "Verify Your Setup", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Before diving into code in the next chapter, let's run through a final checklist to make sure everything is in place. Each of these items is essential -- if any one is missing, your first call will not work.",
    },

    { type: "section", title: "Pre-Flight Checklist", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**1. GitHub Codespace is running** -- You have a Codespace open with the terminal ready. All dependencies are pre-installed.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**2. Shared credentials are loaded** -- Your `.env` file contains the shared `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `OPENAI_API_KEY`, and `TWILIO_PHONE_NUMBER`. These are pre-configured in the Codespace.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**3. You have a phone to receive calls** -- The workshop uses outbound calls. Your server will call your personal phone number, so have it nearby and ready to answer.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**4. Port 8080 is ready** -- When you start your server in the next chapter, you'll need to make port 8080 **Public** in the Codespace Ports tab so Twilio can reach it.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "The most common issue is forgetting to set the port to **Public** in the Codespace Ports tab. Private ports require GitHub authentication, which Twilio cannot provide. If your first call fails silently, check this first.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "If you are using a Twilio trial account with your own credentials (not the shared workshop account), you can only make calls to verified phone numbers. Go to [Phone Numbers → Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified) to add your personal phone number.",
    },

    { type: "section", title: "Ready to Build", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "If everything checks out, you are ready to start building. In the next chapter, you will set up your server, connect it to Twilio, wire in the AI, and make your first AI phone call.",
    },

    {
      type: "verify",
      audience: "builder",
      question:
        "Is your Codespace running with credentials loaded and a phone nearby to receive calls?",
    },
  ],
} satisfies StepDefinition;
