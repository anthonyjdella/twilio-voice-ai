"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Terminal } from "@/components/content/Terminal";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { Verify } from "@/components/content/Verify";

export default function Step3Setup() {
  return (
    <>
      <SectionHeader>Environment Setup</SectionHeader>

      <Prose>
        Let's get your development environment ready. You will need three
        things: the workshop starter code, API credentials for Twilio and
        OpenAI, and a public URL so Twilio can reach your local server.
      </Prose>

      <SectionHeader>Clone the Repository</SectionHeader>

      <Prose>
        Start by cloning the workshop repository and installing dependencies:
      </Prose>

      <Terminal
        commands={`$ git clone https://github.com/twilio-samples/conversation-relay-workshop.git
$ cd conversation-relay-workshop
$ npm install`}
      />

      <Prose>
        The starter project includes a basic Node.js server structure with
        placeholder files you will fill in throughout the workshop. Take a
        moment to look around -- the <code>src/</code> directory is where all
        your work will happen.
      </Prose>

      <SectionHeader>Configure Environment Variables</SectionHeader>

      <Prose>
        Create a <code>.env</code> file in the project root with your API
        credentials. You will need three values:
      </Prose>

      <CodeBlock
        code={`# Twilio credentials (from https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# OpenAI API key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your public URL (we'll set this in the next step)
PUBLIC_URL=https://your-subdomain.ngrok.io`}
        language="bash"
        file=".env"
      />

      <Callout type="tip">
        <strong>Getting your Twilio credentials:</strong> Log in to the{" "}
        <a
          href="https://console.twilio.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twilio Console
        </a>
        . Your Account SID and Auth Token are displayed on the dashboard home
        page. If you do not have a Twilio account yet, you can sign up for a
        free trial that includes a phone number and credits for testing.
      </Callout>

      <Callout type="tip">
        <strong>Getting your OpenAI API key:</strong> Go to{" "}
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
        >
          platform.openai.com/api-keys
        </a>{" "}
        and create a new secret key. Make sure your account has credits or an
        active payment method -- the API is not free, though a single workshop
        session typically costs less than a dollar.
      </Callout>

      <Callout type="warning">
        Never commit your <code>.env</code> file to version control. The starter
        project already includes it in <code>.gitignore</code>, but double-check
        before pushing anything.
      </Callout>

      <SectionHeader>Set Up ngrok</SectionHeader>

      <Prose>
        Twilio needs to reach your server over the public internet to establish
        the WebSocket connection. During development, the easiest way to expose
        your local server is with <strong>ngrok</strong>, which creates a secure
        tunnel from a public URL to your machine.
      </Prose>

      <Prose>
        If you don't have ngrok installed, install it globally:
      </Prose>

      <Terminal commands={`$ npm install -g ngrok`} />

      <Prose>
        Then start a tunnel pointing to port 8080 (the port your server will
        run on):
      </Prose>

      <Terminal
        commands={`$ ngrok http 8080
Forwarding  https://a1b2c3d4.ngrok-free.app -> http://localhost:8080`}
      />

      <Prose>
        Copy the <code>https://</code> forwarding URL that ngrok gives you and
        paste it into your <code>.env</code> file as the <code>PUBLIC_URL</code>{" "}
        value. You will need this URL in the next step when configuring your
        Twilio phone number.
      </Prose>

      <Callout type="info">
        Keep the ngrok terminal window running for the entire workshop. If you
        restart ngrok, you will get a new URL and will need to update both your{" "}
        <code>.env</code> file and your Twilio phone number webhook
        configuration. If you have a paid ngrok account, you can use a stable
        subdomain to avoid this.
      </Callout>

      <Callout type="warning">
        Make sure you use the <code>https://</code> URL from ngrok, not{" "}
        <code>http://</code>. Twilio requires secure connections for webhooks,
        and your WebSocket connection will use <code>wss://</code> (the secure
        variant) which is derived from the HTTPS URL.
      </Callout>

      <SectionHeader>Verify Your Setup</SectionHeader>

      <Prose>
        Before moving on, confirm that you have all three pieces in place:
      </Prose>

      <Prose>
        1. The project is cloned and <code>npm install</code> completed without
        errors.
      </Prose>

      <Prose>
        2. Your <code>.env</code> file contains valid values for{" "}
        <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, and{" "}
        <code>OPENAI_API_KEY</code>.
      </Prose>

      <Prose>
        3. ngrok is running and you have copied the public HTTPS URL into your{" "}
        <code>.env</code> as <code>PUBLIC_URL</code>.
      </Prose>

      <Verify question="Have you cloned the repo, configured your .env file, and started ngrok?" />
    </>
  );
}
