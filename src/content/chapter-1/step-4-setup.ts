import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Back to Your Codespace", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "You opened your Codespace back in Step 1. It should be ready now -- if the terminal is showing a prompt, you're good. If it is still loading, give it another minute.",
    },

    {
      type: "concept-card",
      audience: "builder",
      title: "Why Codespaces?",
      content:
        "GitHub Codespaces gives every attendee an identical workspace in the cloud -- like opening a fully set-up laptop that already has everything installed. No downloads, no configuration headaches. You just click a button and start building.",
    },

    {
      type: "callout",
      variant: "tip",
      audience: "builder",
      content:
        "**Didn't open it yet?** Launch it now at [codespaces.new/anthonyjdella/twilio-voice-ai](https://codespaces.new/anthonyjdella/twilio-voice-ai) and let it finish initializing before moving on.",
    },

    {
      type: "callout",
      variant: "info",
      audience: "builder",
      content:
        "**About the two folders.** The Codespace has both `workshop/` and `voice-agent/` at the repo root. `workshop/` is where you'll paste every code snippet in this workshop -- treat it as your own. `voice-agent/` is the finished reference implementation that powers the workshop's Call Me widget; peek at it if you get stuck, but don't edit it.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Quick Setup Behind the Curtain",
      content:
        "Right now the Builder is telling the agent which phone number to call -- in this workshop, it is their own, so they can test by calling themselves. Every Codespace comes pre-loaded with shared Twilio and OpenAI credentials, so there is no account setup to watch. In the next chapter the agent takes its first call, and you will get to listen in.",
    },

    {
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/holding-phone.svg",
      alt: "A hand holding a phone — the number the Builder is plugging in now becomes the phone that rings when the first call goes through in Chapter 2.",
      size: "sm",
    },

    { type: "section", title: "Set Your Phone Number", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your Codespace comes with shared Twilio and OpenAI credentials already configured -- you do not need to sign up for either service. The only thing you need to do is set your personal phone number so the agent can call you during testing.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The `workshop/` folder is at the repo root, and `workshop/.env` is generated for you on first boot of the Codespace (pre-filled with the shared Twilio and OpenAI keys). Open it from the file explorer on the left -- if you don't see `workshop/.env` yet, give the Codespace another minute to finish initializing. You can also confirm the expected keys are set from your terminal:",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ cat workshop/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-5.4-nano

# Set this to your personal phone number in E.164 format
MY_PHONE_NUMBER=+15551234567`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Update `MY_PHONE_NUMBER` with your real phone number in E.164 format (international format, e.g. `+12065551234`):",
    },

    {
      type: "code",
      audience: "builder",
      code: `# Everything above this line is already configured for you

# Update this to YOUR phone number (include country code)
MY_PHONE_NUMBER=+12065551234`,
      language: "bash",
      file: "workshop/.env",
    },

    {
      type: "callout",
      variant: "error",
      audience: "builder",
      content:
        "The shared API keys are active only during this workshop session. They will be revoked immediately after the workshop ends.",
    },

    {
      type: "callout",
      variant: "tip",
      audience: "builder",
      content:
        "**Want to use your own accounts after the workshop?** Sign up for a [Twilio account](https://www.twilio.com/try-twilio) and get an [OpenAI API key](https://platform.openai.com/api-keys). Replace the values in `.env` and everything works the same way.",
    },

    {
      type: "verify",
      audience: "builder",
      question:
        "Is your Codespace open and the terminal ready?",
      troubleshooting: [
        "Make sure you are signed into GitHub before clicking the Codespace link",
        "If the Codespace is stuck loading, try refreshing the browser tab",
        "Check that the terminal shows the workshop/ directory as your working directory",
      ],
    },

  ],
} satisfies StepDefinition;
