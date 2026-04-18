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
        "**1. Codespace is running** -- You have a Codespace open with the terminal ready.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**2. Credentials are loaded** -- Your `workshop/.env` file has the shared API keys (auto-configured from Codespace Secrets).",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**3. `MY_PHONE_NUMBER` is set** -- You updated this in `workshop/.env` with your real phone number (set in the Open Codespace step).",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**4. Port 8080** -- When you start your server in Chapter 2, you will need to make port 8080 **Public** in the Codespace Ports tab (covered in the Expose Your Server step).",
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
      troubleshooting: [
        "Codespace not loading? Try refreshing the browser tab or reopening from github.com/codespaces",
        "Credentials missing? Check that workshop/.env has real values, not placeholders like ACxxxxxxxx",
        "MY_PHONE_NUMBER not set? Open workshop/.env and update it to your real number (e.g., +12065551234)",
        "Port 8080 not Public? Go to the Ports tab and right-click → Port Visibility → Public",
      ],
    },
  ],
} satisfies StepDefinition;
