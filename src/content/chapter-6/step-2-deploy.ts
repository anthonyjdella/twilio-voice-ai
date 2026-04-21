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
      type: "image",
      audience: "explorer",
      src: "/images/illustrations/technical-overview.svg",
      alt: "A technical overview diagram — the moving pieces that keep a voice agent running in production.",
      size: "md",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent has been running in a GitHub Codespace during development. For production, it needs a host that keeps a live connection open for each call and handles multiple calls at once.",
    },

    { type: "section", audience: "builder", title: "Key Requirements" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Wherever you deploy, the platform needs to support:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Long-lived connections** -- The server keeps a live connection open for the entire call. Platforms that shut down between requests (like AWS Lambda or Vercel Functions) will not work.\n**Secure connections** -- Twilio requires HTTPS and WSS.\n**Secret storage** -- API keys and credentials need a safe home.\n**Always-on server** -- The process must stay running continuously, not start fresh for each request.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Do **not** deploy to serverless platforms like AWS Lambda, Vercel Functions, or Cloudflare Workers. These have execution time limits and do not support persistent WebSocket connections. Calls will drop after a few seconds.",
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Option 1: Railway" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Railway supports WebSockets out of the box, auto-deploys from GitHub, and provides free TLS.",
    },

    {
      type: "terminal",
      audience: "builder",
      commands: `$ npm install -g @railway/cli
$ railway login
$ railway init
$ railway up`,
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Set environment variables in the Railway dashboard under project settings. Update the Twilio webhook URL to the Railway-provided domain.",
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Option 2: Render" },

    {
      type: "prose",
      audience: "builder",
      content:
        'Render provides automatic SSL, WebSocket support, and GitHub integration. Create a "Web Service" and point it to the repository.',
    },

    {
      type: "prose",
      audience: "builder",
      content:
        'In the Render dashboard, set the build command to `npm install` and the start command to `node server.js`. Add environment variables under the "Environment" tab.',
    },

    { type: "section", audience: "builder", title: "Option 3: Docker on Any Cloud" },

    {
      type: "prose",
      audience: "builder",
      content:
        "For maximum flexibility, containerize the agent and deploy to any cloud provider:",
    },

    {
      type: "code",
      audience: "builder",
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
      audience: "builder",
      content:
        "Add a health check endpoint so the platform knows the server is alive:",
    },

    {
      type: "code",
      audience: "builder",
      language: "javascript",
      file: "server.js",
      highlight: ["1-9"],
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
      audience: "builder",
      commands: `$ docker build -t voice-agent .
$ docker run -p 8080:8080 --env-file .env voice-agent`,
    },

    { type: "page-break" },

    { type: "section", audience: "builder", title: "Cloud-Specific Deployment" },

    {
      type: "prose",
      audience: "builder",
      content:
        "**AWS** -- Use ECS (Fargate) or EC2. Fargate scales automatically. Place an Application Load Balancer in front with WebSocket stickiness enabled.\n**Azure** -- Use Azure Container Apps or App Service. Both support WebSockets. Container Apps is simpler.\n**Google Cloud** -- Use Cloud Run or GKE. Cloud Run supports WebSockets but caps request timeout at 60 minutes -- set `--timeout` explicitly.",
    },

    { type: "section", audience: "builder", title: "Environment Variables" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Make sure these values are configured in the deployment platform:",
    },

    {
      type: "code",
      audience: "builder",
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
      audience: "builder",
      variant: "error",
      content:
        "Never commit `.env` to version control. Add it to `.gitignore` and set environment variables through the platform's dashboard or secrets manager.",
    },

    { type: "section", audience: "builder", title: "Update Twilio Webhook" },

    {
      type: "prose",
      audience: "builder",
      content:
        "Once deployed, update the Twilio phone number to point to the production address instead of the Codespace URL. In the Twilio Console, go to Phone Numbers, select the number, and update the webhook URL.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Also update the WebSocket connection URL in the TwiML to use the production domain.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Scaling for concurrent calls",
      content:
        "Each active call maintains one WebSocket connection and one OpenAI stream. A single Node.js process can handle 50-100 concurrent calls depending on tool complexity and memory usage.\n\nFor higher concurrency, run multiple instances behind a load balancer. Since each call is independent (no shared state), you don't need sticky sessions -- each new call creates a fresh connection to whichever instance is available.\n\nMonitor memory carefully. Each call's conversation history grows over time. For long calls, implement history trimming to prevent memory pressure.",
    },
  ],
} satisfies StepDefinition;
