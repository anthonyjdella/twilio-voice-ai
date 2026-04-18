import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Open Your Development Environment" },

    {
      type: "prose",
      content:
        "We use **GitHub Codespaces** for this workshop -- a cloud-based dev environment that starts in seconds with everything pre-installed.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Why Codespaces?",
      content:
        "GitHub Codespaces gives every attendee an identical workspace in the cloud -- like opening a fully set-up laptop that already has everything installed. No downloads, no configuration headaches. You just click a button and start building.",
    },

    { type: "section", title: "Launch Your Codespace" },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/globe.svg",
          title: "Open the repository",
          description:
            "Go to the workshop GitHub repository at github.com/anthonyjdella/twilio-voice-ai, or use the direct Codespace link below.",
        },
        {
          icon: "/images/icons/code.svg",
          title: "Click \"Code\" → \"Codespaces\" → \"Create codespace on main\"",
          description:
            "GitHub will spin up a cloud-based coding environment with everything pre-installed. With prebuilds enabled, this takes about 10 seconds.",
        },
        {
          icon: "/images/icons/settings.svg",
          title: "Wait for the environment to initialize",
          description:
            "The terminal will show dependencies being installed automatically. When you see the prompt, you're ready to go.",
        },
      ],
    },

    {
      type: "callout",
      variant: "tip",
      audience: "builder",
      content:
        "**Quick launch:** [Open a Codespace directly](https://codespaces.new/anthonyjdella/twilio-voice-ai) -- this link creates one in a single click.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        "**All you need is a free GitHub account.** No credit card, no local installs, no Node.js setup. If you don't have a GitHub account, create one at [github.com](https://github.com) -- it takes 30 seconds.",
    },

    { type: "section", title: "Workshop Credentials" },

    {
      type: "prose",
      content:
        "This workshop uses a **shared Twilio account** and a **shared OpenAI API key** -- you do not need to sign up for either service. The credentials are pre-configured in the Codespace environment.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The Codespace's `.env` file is already populated with the shared credentials:",
    },

    {
      type: "code",
      audience: "builder",
      code: `# Pre-configured in your Codespace -- no changes needed
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # your Twilio account SID
TWILIO_AUTH_TOKEN=your_shared_token                     # used to authenticate outbound calls
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx      # powers the LLM
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx                        # the shared Twilio number attendees dial in to

# Set this to your personal phone so the agent can call you for the outbound test
MY_PHONE_NUMBER=+1xxxxxxxxxx`,
      language: "bash",
      file: ".env",
    },

    {
      type: "callout",
      variant: "error",
      content:
        "The shared API keys are active only during this workshop session. They will be revoked immediately after the workshop ends. Do not share them outside this session.",
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
        "Your Codespace opens at the repository root. All your server code goes in the `workshop/` directory, which already has a `package.json` and `.env` configured for you. Run terminal commands from inside `workshop/`.",
    },

    {
      type: "verify",
      question:
        "Is your Codespace open and the terminal ready?",
    },
  ],
} satisfies StepDefinition;
