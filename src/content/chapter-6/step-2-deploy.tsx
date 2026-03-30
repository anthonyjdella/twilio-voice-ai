import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Terminal } from "@/components/content/Terminal";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function DeploymentOptions() {
  return (
    <>
      <SectionHeader>Deployment Options</SectionHeader>

      <Prose>
        Your agent has been running locally with ngrok. For production, you need a
        reliable host that supports persistent WebSocket connections and can handle
        concurrent calls. Here are your best options.
      </Prose>

      <SectionHeader>Key Requirements</SectionHeader>

      <Prose>
        Wherever you deploy, make sure the platform supports:
      </Prose>

      <Prose>
        <strong>WebSocket connections</strong> -- Your server needs to maintain long-lived
        WebSocket connections for the duration of each call. Serverless platforms
        (Lambda, Cloud Functions) will not work.{"\n"}
        <strong>HTTPS / WSS</strong> -- Twilio requires secure connections. Your host
        must provide TLS termination.{"\n"}
        <strong>Environment variables</strong> -- You need a secure way to store your
        OpenAI API key and other secrets.{"\n"}
        <strong>Persistent processes</strong> -- The server process must stay running
        between requests, not spin up per-request.
      </Prose>

      <Callout type="warning">
        Do <strong>not</strong> deploy to serverless platforms like AWS Lambda, Vercel
        Functions, or Cloudflare Workers. These have execution time limits and do not
        support persistent WebSocket connections. Your calls will drop after a few
        seconds.
      </Callout>

      <SectionHeader>Option 1: Railway</SectionHeader>

      <Prose>
        Railway is the easiest option for getting started. It supports WebSockets out
        of the box, auto-deploys from GitHub, and provides free TLS.
      </Prose>

      <Terminal
        commands={`$ npm install -g @railway/cli
$ railway login
$ railway init
$ railway up`}
      />

      <Prose>
        Set your environment variables in the Railway dashboard under your project
        settings. Update your Twilio webhook URL to use the Railway-provided domain.
      </Prose>

      <SectionHeader>Option 2: Render</SectionHeader>

      <Prose>
        Render provides a straightforward experience with automatic SSL, WebSocket
        support, and GitHub integration. Create a &quot;Web Service&quot; and point it
        to your repository.
      </Prose>

      <Prose>
        In your Render dashboard, set the build command to <code>npm install</code> and
        the start command to <code>node server.js</code>. Add your environment variables
        under the &quot;Environment&quot; tab.
      </Prose>

      <SectionHeader>Option 3: Docker on Any Cloud</SectionHeader>

      <Prose>
        For maximum flexibility, containerize your agent and deploy to any cloud
        provider. Here is a production-ready Dockerfile:
      </Prose>

      <CodeBlock
        language="dockerfile"
        file="Dockerfile"
        showLineNumbers
        code={`FROM node:20-slim

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

CMD ["node", "server.js"]`}
      />

      <Prose>
        Add a health check endpoint so the platform knows your server is alive:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    activeCalls: activeSessions.size
  });
});`}
      />

      <Terminal
        commands={`$ docker build -t voice-agent .
$ docker run -p 8080:8080 --env-file .env voice-agent`}
      />

      <SectionHeader>Cloud-Specific Deployment</SectionHeader>

      <Prose>
        <strong>AWS</strong> -- Use ECS (Fargate) or EC2. Fargate is easier to manage
        and scales automatically. Place an Application Load Balancer in front with
        WebSocket stickiness enabled.{"\n"}
        <strong>Azure</strong> -- Use Azure Container Apps or Azure App Service. Both
        support WebSockets. Container Apps is the simpler option.{"\n"}
        <strong>Google Cloud</strong> -- Use Cloud Run (which now supports WebSockets)
        or GKE. Cloud Run has a max request timeout to be aware of.
      </Prose>

      <SectionHeader>Environment Variables</SectionHeader>

      <Prose>
        Make sure these are set in your deployment environment:
      </Prose>

      <CodeBlock
        language="bash"
        file=".env"
        showLineNumbers={false}
        code={`OPENAI_API_KEY=sk-...
PORT=8080
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
NODE_ENV=production`}
      />

      <Callout type="error">
        Never commit your <code>.env</code> file to version control. Add it to
        your <code>.gitignore</code> and set environment variables through your
        platform&apos;s dashboard or secrets manager.
      </Callout>

      <SectionHeader>Update Twilio Webhook</SectionHeader>

      <Prose>
        Once deployed, update your Twilio phone number&apos;s webhook URL to point to
        your production domain instead of the ngrok tunnel. In the Twilio Console, go
        to Phone Numbers, select your number, and update the &quot;A call comes in&quot;
        webhook to your production URL (e.g., <code>https://your-app.railway.app/incoming-call</code>).
      </Prose>

      <Prose>
        Also update the WebSocket URL in your TwiML to use <code>wss://</code> with
        your production domain.
      </Prose>

      <DeepDive title="Scaling for concurrent calls">
        <p className="mb-2">
          Each active call maintains one WebSocket connection and one OpenAI stream.
          A single Node.js process can comfortably handle 50-100 concurrent calls,
          depending on your tool complexity and memory usage.
        </p>
        <p className="mb-2">
          For higher concurrency, run multiple instances behind a load balancer.
          Since each call is independent (no shared state between calls), you do not
          need sticky sessions for the WebSocket -- each new call creates a fresh
          connection to whichever instance is available.
        </p>
        <p>
          Monitor memory usage carefully. Each call&apos;s conversation history grows
          over time. For long calls, implement history trimming to prevent memory
          pressure.
        </p>
      </DeepDive>
    </>
  );
}
