import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Open Your Development Environment", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "We use **GitHub Codespaces** for this workshop -- a cloud-based dev environment that starts in seconds with everything pre-installed.",
    },

    {
      type: "concept-card",
      audience: "builder",
      title: "Why Codespaces?",
      content:
        "GitHub Codespaces gives every attendee an identical workspace in the cloud -- like opening a fully set-up laptop that already has everything installed. No downloads, no configuration headaches. You just click a button and start building.",
    },

    { type: "section", title: "Launch Your Codespace", audience: "builder" },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/globe.svg",
          title: "Open your Codespace",
          description:
            "Click this link to create your Codespace: [codespaces.new/anthonyjdella/twilio-voice-ai](https://codespaces.new/anthonyjdella/twilio-voice-ai)",
        },
        {
          icon: "/images/icons/settings.svg",
          title: "Wait for the environment to initialize",
          description:
            "GitHub will spin up a cloud VS Code with everything pre-installed. The terminal will show dependencies being installed automatically. When you see the prompt, you're ready to go.",
        },
      ],
    },

    {
      type: "callout",
      variant: "info",
      audience: "builder",
      content:
        "**All you need is a free GitHub account.** If you don't have a GitHub account, create one at [github.com](https://github.com)",
    },

    { type: "section", title: "You're All Set", audience: "explorer" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Everything you need is right here in this app. As you go through each chapter, you will configure your agent's persona, voice, and language using interactive controls. When you are ready to test, the **Call Me** button will call your phone so you can talk to your custom agent live.",
    },

    {
      type: "callout",
      variant: "info",
      audience: "explorer",
      content:
        "No setup, no downloads, no code. Just follow along, configure your agent, and test it by calling yourself.",
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
        "Open `workshop/.env` in your Codespace and update `MY_PHONE_NUMBER` with your real phone number in E.164 format:",
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
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "Your Codespace opens at the repository root. All your server code goes in the `workshop/` directory. Run terminal commands from inside `workshop/`.",
    },

    {
      type: "verify",
      audience: "builder",
      question:
        "Is your Codespace open and the terminal ready?",
    },

    {
      type: "verify",
      audience: "explorer",
      question:
        "Ready to start configuring your voice agent?",
    },
  ],
} satisfies StepDefinition;
