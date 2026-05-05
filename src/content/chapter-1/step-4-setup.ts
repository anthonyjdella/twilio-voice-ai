import type { StepDefinition } from "@/lib/content-blocks";

export default {
    blocks: [
        {
            type: "section",
            title: "Back to Your Codespace",
            audience: "builder",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "You opened your Codespace earlier. It should be ready now -- if the terminal is showing a prompt, you're good. If it is still loading, give it another minute.",
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
            variant: "backup-plan",
            audience: "builder",
            content:
                "**Codespace won't open or your org has it disabled?** Two backup paths:\n\n**Option 1 — Run locally.** Clone [the repo](https://github.com/anthonyjdella/twilio-voice-ai), run `npm install` in the `workshop/` folder, and use [ngrok](https://ngrok.com) to expose port 8080 to Twilio. Full instructions for the ngrok fallback are coming up at the end of this chapter. Requires Node.js 18+ installed on your laptop.\n\n**Option 2 (easier) — Switch to Explorer mode.** Explorer track is the observer path; you follow along with the concepts without writing code. Flip the track toggle at the top of the page and pair with a Builder next to you -- you'll still hear the agent and make test calls, just from the caller's side.",
        },

        {
            type: "callout",
            variant: "info",
            audience: "builder",
            content:
                "**About the two folders.** The Codespace has both `workshop/` and `voice-agent/` at the repo root. `workshop/` is where you'll paste every code snippet in this workshop -- treat it as your own. `voice-agent/` is the finished reference implementation that powers the workshop's Call Me widget; peek at it if you get stuck, but don't edit it.",
        },

        {
            type: "builder-only",
            audience: "explorer",
            context:
                "**You can skip ahead whenever you're ready.** 'The Builder' is busy for a few minutes on this step.\n\n**What they are doing:** Typing their phone number into a small config file the agent reads at startup, so when the call is triggered later, it rings the right phone. They are also confirming the workshop's pre-shared Twilio and OpenAI keys landed correctly -- normally you would spend 20-30 minutes signing up for both services, but the workshop handles that for everyone so the call works on the first try.\n\n**What comes next:** In the next chapter the agent takes its first call. That is where you will actually hear it.",
        },

        { type: "page-break" },

        {
            type: "section",
            title: "Fill In Your .env File",
            audience: "builder",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Your Codespace creates a `workshop/.env` file on first boot with the right keys but **empty values** -- you'll paste the real values in now. Open it from the file explorer on the left; if you don't see `workshop/.env` yet, give the Codespace another minute to finish initializing.",
        },

        {
            type: "callout",
            variant: "warning",
            audience: "builder",
            content:
                "**Your facilitator will show the credentials on a slide.** Copy them from the slide and paste them into `workshop/.env`, replacing the empty values. You do not need to sign up for Twilio or OpenAI -- the facilitator is providing shared credentials for the workshop.",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Here is what the file will look like after you paste the values (your actual values will be different):",
        },

        {
            type: "code",
            audience: "builder",
            code: `# Paste these values from the slide (do not change the keys)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HANDOFF_PHONE_NUMBER=+1xxxxxxxxxx

# Set this to YOUR phone number (include country code, e.g. +12065551234)
MY_PHONE_NUMBER=+15551234567`,
            language: "bash",
            file: "workshop/.env",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Then update `MY_PHONE_NUMBER` with your real phone number in E.164 format (international format — country code plus number, no spaces or dashes, e.g. `+12065551234`). This is the number the agent will call during testing.",
        },

        {
            type: "callout",
            variant: "tip",
            audience: "builder",
            content:
                "**Save the file** (Cmd/Ctrl + S) after pasting. The workshop server reads `.env` at startup, so anything you forget to save won't take effect.",
        },

        {
            type: "callout",
            variant: "error",
            audience: "builder",
            content:
                "The shared API keys are active only during this workshop session. They will be revoked immediately after the workshop ends. Do not commit them to git or share them outside the room.",
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
            question: "Is your Codespace open and the terminal ready?",
            troubleshooting: [
                "Make sure you are signed into GitHub before clicking the Codespace link",
                "If the Codespace is stuck loading, try refreshing the browser tab",
                "Check that the terminal shows the workshop/ directory as your working directory",
            ],
        },
    ],
} satisfies StepDefinition;
