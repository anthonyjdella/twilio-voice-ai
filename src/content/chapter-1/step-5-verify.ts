import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    {
      type: "concept-card",
      audience: "explorer",
      title: "Opening the Door for Twilio",
      content:
        "Before the first call can go through, a kind of door has to be opened on the server so Twilio can reach it. Without that door open, when a caller dials the phone number, the message has nowhere to go -- the call just fails quietly. Once the door is open, Twilio knows where to deliver every call, and the agent can finally answer.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "This step is a short one for you -- the setup is all behind the scenes. The next chapter is where the agent comes alive and your phone starts ringing.",
    },

    { type: "builder-only", audience: "explorer", context: "The server is being configured and checked behind the scenes. Everything the agent needs on your side is already handled." },

    { type: "section", title: "Expose Your Server", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Twilio needs to reach your server over the internet to send and receive messages during a call. In Codespaces, this is built in -- you just need to make your port public.",
    },

    {
      type: "concept-card",
      audience: "builder",
      title: "Why a public URL?",
      content:
        "Your server runs inside a Codespace in the cloud, but Twilio's servers need to reach it over the internet. Codespaces has built-in port forwarding that creates a public URL pointing to your server -- no extra tools needed.",
    },

    { type: "section", title: "Make Your Port Public", audience: "builder" },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/connectivity.svg",
          title: "Open the Ports tab",
          description:
            "In your Codespace, click the **Ports** tab at the bottom panel (next to Terminal). You should see port 8080 listed.",
        },
      ],
    },

    {
      type: "image",
      audience: "builder",
      src: "/images/codespace-ports-tab.png",
      alt: "Codespace Ports tab showing port 8080",
      caption: "The Ports tab in your Codespace — click it at the bottom panel.",
    },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/globe.svg",
          title: "Set visibility to Public",
          description:
            "Right-click port 8080 → **Port Visibility** → **Public**. This is critical -- Twilio cannot authenticate with GitHub, so the port must be publicly accessible.",
        },
      ],
    },

    {
      type: "image",
      audience: "builder",
      src: "/images/codespace-port-public.png",
      alt: "Setting port 8080 visibility to Public in Codespace",
      caption: "Right-click the port and set visibility to Public.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**The port must be set to Public, not Private.** Private ports require GitHub authentication, which Twilio cannot provide. If you skip this step, Twilio will get a 401 error and the call will fail silently.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Your Codespace URL becomes two things: an `https://` URL for TwiML webhooks and a `wss://` URL for WebSocket connections. The WebSocket URL is derived by replacing `https://` with `wss://` and appending your WebSocket path (e.g., `/ws`).",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "Unlike ngrok, your Codespace URL stays the same for the entire session. No need to update configurations if you restart your server.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Fallback: Local Dev + ngrok",
      content:
        "If Codespaces is unavailable or you prefer local development, you can run everything on your machine instead. Install Node.js 18+, clone the repository, run `npm install`, and use **ngrok** to expose your local server:\n\n```\nnpm install -g ngrok\nngrok http 8080\n```\n\nngrok creates a public URL that tunnels to your localhost. Use the `https://` URL from ngrok as your public server address. Note: ngrok free tier limits you to 3 concurrent connections, and the URL changes every time you restart.",
    },

    {
      type: "verify",
      audience: "builder",
      question:
        "Is your port 8080 set to Public?",
      troubleshooting: [
        "In the Ports tab, right-click port 8080 and select Port Visibility → Public",
        "If port 8080 is not listed, it will appear once you start a server later",
        "Try refreshing the Ports tab if it looks empty",
      ],
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
