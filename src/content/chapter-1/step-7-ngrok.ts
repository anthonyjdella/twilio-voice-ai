import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "builder-only", audience: "explorer", context: "Builders are making their server accessible to Twilio. Your app is already deployed and ready to go." },

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
  ],
} satisfies StepDefinition;
