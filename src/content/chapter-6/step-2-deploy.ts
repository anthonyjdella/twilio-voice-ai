import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Deployment Options" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Where Voice AI Lives in Production",
      content:
        "A voice agent lives inside a server that stays connected to Twilio for the entire call. That's different from a typical web app: you can't use platforms that go to sleep between requests. You need a host that keeps the connection open, scales when more callers arrive, and recovers if something crashes mid-call.",
    },

    {
      type: "prose",
      content:
        "Your agent has been running in a GitHub Codespace during development. For production, you need a reliable host that keeps a live connection open for the duration of each call and can handle multiple calls at once. Here are your best options.",
    },

    { type: "section", title: "Key Requirements" },

    {
      type: "prose",
      content:
        "Wherever you deploy, the platform needs to support a few things:",
    },

    {
      type: "prose",
      content:
        "**Long-lived connections** -- Your server needs to keep a live connection open for the entire duration of each call. Platforms that shut down between requests (like AWS Lambda or Vercel Functions) will not work.\n**Secure connections** -- Twilio requires encrypted connections. Your host must support HTTPS and WSS.\n**Secret storage** -- You need a safe place to keep your API keys and credentials.\n**Always-on server** -- The server process must stay running continuously, not start fresh for each request.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Do **not** deploy to serverless platforms like AWS Lambda, Vercel Functions, or Cloudflare Workers. These have execution time limits and do not support persistent WebSocket connections. Your calls will drop after a few seconds.",
    },

    { type: "section", title: "Option 1: Railway" },

    {
      type: "prose",
      content:
        "Railway is the easiest option for getting started. It supports WebSockets out of the box, auto-deploys from GitHub, and provides free TLS.",
    },

    {
      type: "terminal",
      commands: `$ npm install -g @railway/cli
$ railway login
$ railway init
$ railway up`,
    },

    {
      type: "prose",
      content:
        "Set your environment variables in the Railway dashboard under your project settings. Update your Twilio webhook URL to use the Railway-provided domain.",
    },

    { type: "section", title: "Option 2: Render" },

    {
      type: "prose",
      content:
        'Render provides a straightforward experience with automatic SSL, WebSocket support, and GitHub integration. Create a "Web Service" and point it to your repository.',
    },

    {
      type: "prose",
      content:
        'In your Render dashboard, set the build command to `npm install` and the start command to `node server.js`. Add your environment variables under the "Environment" tab.',
    },

    { type: "section", title: "Option 3: Docker on Any Cloud" },

    {
      type: "prose",
      content:
        "For maximum flexibility, containerize your agent and deploy to any cloud provider. Here is a production-ready Dockerfile:",
    },

    {
      type: "code",
      language: "dockerfile",
      file: "Dockerfile",
      code: `FROM node:20-slim

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Non-root user for security
RUN addgroup --system appgroup && \\
    adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "server.js"]`,
    },

    {
      type: "prose",
      content:
        "Add a health check endpoint so the platform knows your server is alive:",
    },

    {
      type: "code",
      language: "javascript",
      file: "server.js",
      code: `// Inside your http.createServer handler, add a health check:
if (req.url === "/health" && req.method === "GET") {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    status: "ok",
    uptime: process.uptime(),
    activeCalls: wss.clients.size,
  }));
  return;
}`,
    },

    {
      type: "terminal",
      commands: `$ docker build -t voice-agent .
$ docker run -p 8080:8080 --env-file .env voice-agent`,
    },

    { type: "section", title: "Cloud-Specific Deployment" },

    {
      type: "prose",
      content:
        "**AWS** -- Use ECS (Fargate) or EC2. Fargate is easier to manage and scales automatically. Place an Application Load Balancer in front with WebSocket stickiness enabled.\n**Azure** -- Use Azure Container Apps or Azure App Service. Both support WebSockets. Container Apps is the simpler option.\n**Google Cloud** -- Use Cloud Run or GKE. Cloud Run supports WebSockets but caps request timeout at 60 minutes (configurable) and idle connections may be closed sooner -- check your service tier and set `--timeout` explicitly.",
    },

    { type: "section", title: "Environment Variables" },

    {
      type: "prose",
      content:
        "Make sure these secret values are configured in your deployment platform:",
    },

    {
      type: "code",
      language: "bash",
      file: ".env",
      code: `OPENAI_API_KEY=sk-...
PORT=8080
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
NODE_ENV=production`,
    },

    {
      type: "callout",
      variant: "error",
      content:
        "Never commit your `.env` file to version control. Add it to your `.gitignore` and set environment variables through your platform's dashboard or secrets manager.",
    },

    { type: "section", title: "Update Twilio Webhook" },

    {
      type: "prose",
      content:
        "Once deployed, update your Twilio phone number to point to your new production address instead of the Codespace URL. In the Twilio Console, go to Phone Numbers, select your number, and update the webhook URL to your production domain.",
    },

    {
      type: "prose",
      content:
        "Also update the connection URL in your server instructions to use your production domain.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Scaling for concurrent calls",
      content:
        "Each active call maintains one WebSocket connection and one OpenAI stream. A single Node.js process can comfortably handle 50-100 concurrent calls, depending on your tool complexity and memory usage.\n\nFor higher concurrency, run multiple instances behind a load balancer. Since each call is independent (no shared state between calls), you do not need sticky sessions for the WebSocket -- each new call creates a fresh connection to whichever instance is available.\n\nMonitor memory usage carefully. Each call's conversation history grows over time. For long calls, implement history trimming to prevent memory pressure.",
    },
  ],
} satisfies StepDefinition;
