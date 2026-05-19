import type { StepDefinition } from "@/lib/content-blocks";

export default {
    blocks: [
        {
            type: "builder-only",
            audience: "explorer",
            illustration: "/images/illustrations/lego-building.svg",
            context:
                "**You can skip ahead whenever you are ready.** 'The Builder' is finishing a quick setup check before the first phone call.\n\n**What they are doing:** Grabbing the public URL of their tunnel -- a small program that the Codespace started automatically and that gives Twilio a way to reach their server. They just need to copy the URL from their terminal. Takes less than a minute.\n\n**What comes next:** In the next chapter the agent takes its first call. That is where you will actually hear it.",
        },

        {
            type: "section",
            title: "Get Your Public Tunnel URL",
            audience: "builder",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Twilio needs a public URL to reach your server. Your Codespace boots a Cloudflare tunnel automatically -- it forwards a free `https://*.trycloudflare.com` URL to port 8080 inside your Codespace. No signup, no port-visibility settings to fiddle with.",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "The tunnel URL was printed in your terminal when the Codespace started. Run this any time to print it again:",
        },

        {
            type: "terminal",
            audience: "builder",
            commands: `$ tunnel-url
https://random-words-abc123.trycloudflare.com/twiml`,
        },

        {
            type: "callout",
            audience: "builder",
            variant: "tip",
            content:
                "**Save this URL** -- you'll paste it into the Call Me widget in the next chapter. The URL stays the same as long as the Codespace is running. If you restart the Codespace, you'll get a new one (just run `tunnel-url` again).",
        },

        {
            type: "deep-dive",
            audience: "builder",
            title: "Why a tunnel and not the Codespace's own URL?",
            content:
                "GitHub Codespaces does forward port 8080 to a `https://<codespace>-8080.app.github.dev` URL, but GitHub serves an HTML \"You are about to access a development port\" warning page on the first request -- meant to protect humans from phishing links. Twilio is a server, not a human; it can't click \"Continue,\" so the warning blocks every webhook. Cloudflare Tunnel skips that interstitial entirely: it forwards `https://*.trycloudflare.com` straight to `localhost:8080` inside your Codespace, and the response Twilio gets is your TwiML XML, not GitHub's warning page.",
        },

        {
            type: "deep-dive",
            audience: "builder",
            title: "Fallback: Local Dev + ngrok",
            content:
                "If Codespaces is unavailable or you prefer local development, you can run everything on your machine instead. Install Node.js 18+, clone the [repository](https://github.com/anthonyjdella/twilio-voice-ai), run `npm install`, and use **ngrok** to expose your local server:\n\n```\nnpm install -g ngrok\nngrok http 8080\n```\n\nngrok creates a public URL that tunnels to your localhost. Use the `https://` URL from ngrok as your public server address. Note: ngrok free tier requires an account/authtoken and the URL changes every time you restart.",
        },

        { type: "page-break" },

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
                "**2. Credentials are loaded** -- Your `workshop/.env` file has the shared API keys (pre-configured in the Codespace environment).",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "**3. `MY_PHONE_NUMBER` is set** -- You updated this in `workshop/.env` with your real phone number.",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "**4. Tunnel is running** -- Run `tunnel-url` in the terminal. You should get back a `https://*.trycloudflare.com/twiml` URL. If it says \"Tunnel not running,\" run `bash .devcontainer/start-tunnel.sh` from the repo root.",
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
                "Is your Codespace running with credentials loaded, a tunnel URL ready, and a phone nearby to receive calls?",
            troubleshooting: [
                "Codespace not loading? Try refreshing the browser tab or reopening from github.com/codespaces",
                "Credentials missing? Check that workshop/.env has real values, not placeholders like ACxxxxxxxx",
                "MY_PHONE_NUMBER not set? Open workshop/.env and update it to your real number (e.g., +12065551234)",
                "`tunnel-url` says \"Tunnel not running\"? Run `bash .devcontainer/start-tunnel.sh` from the repo root, wait a few seconds, then try `tunnel-url` again",
            ],
        },
    ],
} satisfies StepDefinition;
