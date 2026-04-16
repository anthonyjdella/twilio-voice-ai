import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Environment Setup" },

    {
      type: "prose",
      content:
        "Let's get your development environment ready. You will need Node.js 18 or later, the workshop starter code, API credentials for Twilio and OpenAI, and a public URL so Twilio can reach your local server.",
    },

    { type: "section", title: "Clone the Repository" },

    {
      type: "prose",
      content:
        "Start by cloning the workshop repository and installing dependencies:",
    },

    {
      type: "terminal",
      commands: `$ git clone https://github.com/twilio-samples/conversation-relay-workshop.git
$ cd conversation-relay-workshop
$ npm install`,
    },

    {
      type: "prose",
      content:
        "The starter project includes a basic Node.js server structure with placeholder files you will fill in throughout the workshop. Take a moment to look around -- the `src/` directory is where all your work will happen.",
    },

    { type: "section", title: "Configure Environment Variables" },

    {
      type: "prose",
      content:
        "Create a `.env` file in the project root with your API credentials. You will need three values:",
    },

    {
      type: "code",
      code: `# Twilio credentials (from https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# OpenAI API key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your public URL (we'll set this in the next step)
PUBLIC_URL=https://your-subdomain.ngrok.io`,
      language: "bash",
      file: ".env",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "**Getting your Twilio credentials:** Log in to the [Twilio Console](https://console.twilio.com). Your Account SID and Auth Token are displayed on the dashboard home page. If you do not have a Twilio account yet, you can sign up for a free trial that includes a phone number and credits for testing.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "**Getting your OpenAI API key:** Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys) and create a new secret key. Make sure your account has credits or an active payment method -- the API is not free, though a single workshop session typically costs less than a dollar.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Never commit your `.env` file to version control. The starter project already includes it in `.gitignore`, but double-check before pushing anything.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Install `dotenv` so your server can read the `.env` file:",
    },

    {
      type: "code",
      audience: "builder",
      language: "bash",
      code: "npm install dotenv",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "You will add `require(\"dotenv\").config()` at the very top of your `server.js` in Chapter 2. This loads all the variables from `.env` into `process.env`.",
    },

    { type: "section", title: "Set Up ngrok" },

    {
      type: "prose",
      content:
        "Twilio needs to reach your server over the public internet to establish the WebSocket connection. During development, the easiest way to expose your local server is with **ngrok**, which creates a secure tunnel from a public URL to your machine.",
    },

    {
      type: "prose",
      content: "If you don't have ngrok installed, install it globally:",
    },

    {
      type: "terminal",
      commands: `$ npm install -g ngrok`,
    },

    {
      type: "prose",
      content:
        "Then start a tunnel pointing to port 8080 (the port your server will run on):",
    },

    {
      type: "terminal",
      commands: `$ ngrok http 8080
Forwarding  https://a1b2c3d4.ngrok-free.app -> http://localhost:8080`,
    },

    {
      type: "prose",
      content:
        "Copy the `https://` forwarding URL that ngrok gives you and paste it into your `.env` file as the `PUBLIC_URL` value. You will need this URL in the next step when configuring your Twilio phone number.",
    },

    {
      type: "callout",
      variant: "info",
      content:
        "Keep the ngrok terminal window running for the entire workshop. If you restart ngrok, you will get a new URL and will need to update both your `.env` file and your Twilio phone number webhook configuration. If you have a paid ngrok account, you can use a stable subdomain to avoid this.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Make sure you use the `https://` URL from ngrok, not `http://`. Twilio requires secure connections for webhooks, and your WebSocket connection will use `wss://` (the secure variant) which is derived from the HTTPS URL.",
    },

    { type: "section", title: "Verify Your Setup" },

    {
      type: "prose",
      content:
        "Before moving on, confirm that you have all three pieces in place:",
    },

    {
      type: "prose",
      content:
        "1. The project is cloned and `npm install` completed without errors.",
    },

    {
      type: "prose",
      content:
        "2. Your `.env` file contains valid values for `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `OPENAI_API_KEY`.",
    },

    {
      type: "prose",
      content:
        "3. ngrok is running and you have copied the public HTTPS URL into your `.env` as `PUBLIC_URL`.",
    },

    {
      type: "verify",
      question:
        "Have you cloned the repo, configured your .env file, and started ngrok?",
    },
  ],
} satisfies StepDefinition;
