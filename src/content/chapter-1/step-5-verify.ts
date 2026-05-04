import type { StepDefinition } from "@/lib/content-blocks";

export default {
    blocks: [
        {
            type: "builder-only",
            audience: "explorer",
            illustration: "/images/illustrations/lego-building.svg",
            context:
                "**You can skip ahead whenever you are ready.** 'The Builder' is finishing a quick setup check before the first phone call.\n\n**What they are doing:** Confirming that their server's network port is publicly reachable so Twilio can deliver the call. It is usually public already, but sometimes needs to be flipped in a tab in their code editor. Takes less than a minute.\n\n**What comes next:** In the next chapter the agent takes its first call. That is where you will actually hear it.",
        },

        {
            type: "section",
            title: "Confirm Port 8080 Is Public",
            audience: "builder",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Twilio needs to reach your server over the internet. Port 8080 (the one your server will listen on) is configured to be **Public** automatically -- but on some GitHub accounts or org policies, it can come up Private on first boot. Take 30 seconds to confirm, and flip it to Public if needed.",
        },

        {
            type: "visual-step",
            audience: "builder",
            steps: [
                {
                    icon: "/images/icons/connectivity.svg",
                    title: "Open the Ports tab",
                    description:
                        'In your Codespace, click the **Ports** tab at the bottom panel (next to Terminal). You should see port 8080 listed with the label "Workshop Server."',
                },
            ],
        },

        {
            type: "image",
            audience: "builder",
            src: "/images/codespace-ports-tab.png",
            alt: "Codespace Ports tab showing port 8080",
            caption:
                "The Ports tab in your Codespace -- click it at the bottom panel.",
        },

        {
            type: "visual-step",
            audience: "builder",
            startFrom: 2,
            steps: [
                {
                    icon: "/images/icons/globe.svg",
                    title: "Check that Visibility is Public",
                    description:
                        "The Visibility column for port 8080 should say **Public**. If it says **Private**, right-click port 8080 → **Port Visibility** → **Public** to change it. Twilio cannot authenticate with GitHub, so the port has to be publicly accessible.",
                },
            ],
        },

        {
            type: "image",
            audience: "builder",
            src: "/images/codespace-port-public.png",
            alt: "Port 8080 shown with Public visibility in Codespace",
            caption:
                "Port 8080 with Public visibility -- this is what you should see once it is set correctly.",
        },

        {
            type: "callout",
            audience: "builder",
            variant: "warning",
            content:
                "**Port must be Public, not Private.** If you leave it Private, Twilio's calls to your server will fail silently with a 401 -- the phone will ring but the agent never hears you.",
        },

        {
            type: "prose",
            audience: "builder",
            content:
                "Your Codespace URL becomes two things: an `https://` URL for TwiML webhooks and a `wss://` URL for WebSocket connections. Your Codespace URL stays the same for the entire session, so you don't need to update configurations when you restart your server.",
        },

        {
            type: "deep-dive",
            audience: "builder",
            title: "Fallback: Local Dev + ngrok",
            content:
                "If Codespaces is unavailable or you prefer local development, you can run everything on your machine instead. Install Node.js 18+, clone the [repository](https://github.com/anthonyjdella/twilio-voice-ai), run `npm install`, and use **ngrok** to expose your local server:\n\n```\nnpm install -g ngrok\nngrok http 8080\n```\n\nngrok creates a public URL that tunnels to your localhost. Use the `https://` URL from ngrok as your public server address. Note: ngrok free tier limits you to 3 concurrent connections, and the URL changes every time you restart.",
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
            ],
        },
    ],
} satisfies StepDefinition;
