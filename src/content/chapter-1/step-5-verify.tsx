"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { Verify } from "@/components/content/Verify";

export default function Step5Verify() {
  return (
    <>
      <SectionHeader>Verify Your Setup</SectionHeader>

      <Prose>
        Before diving into code in the next chapter, let's run through a final
        checklist to make sure everything is in place. Each of these items is
        essential -- if any one is missing, your first call will not work.
      </Prose>

      <SectionHeader>Pre-Flight Checklist</SectionHeader>

      <Prose>
        <strong>1. Twilio Account and Phone Number</strong> -- You have a Twilio
        account with a phone number that has voice capability. You can verify
        this in the{" "}
        <a
          href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twilio Console
        </a>{" "}
        under Phone Numbers &rarr; Active Numbers.
      </Prose>

      <Prose>
        <strong>2. Twilio Credentials</strong> -- Your <code>.env</code> file
        contains a valid <code>TWILIO_ACCOUNT_SID</code> (starts with{" "}
        <code>AC</code>) and <code>TWILIO_AUTH_TOKEN</code>. These are on the{" "}
        <a
          href="https://console.twilio.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twilio Console dashboard
        </a>
        .
      </Prose>

      <Prose>
        <strong>3. OpenAI API Key</strong> -- Your <code>.env</code> file
        contains a valid <code>OPENAI_API_KEY</code> (starts with{" "}
        <code>sk-</code>). Make sure the key is active and your account has
        available credits at{" "}
        <a
          href="https://platform.openai.com/settings/organization/billing/overview"
          target="_blank"
          rel="noopener noreferrer"
        >
          platform.openai.com
        </a>
        .
      </Prose>

      <Prose>
        <strong>4. ngrok Running</strong> -- ngrok is running in a terminal
        window and forwarding HTTPS traffic to <code>localhost:8080</code>. The
        public URL is copied into your <code>.env</code> as{" "}
        <code>PUBLIC_URL</code>.
      </Prose>

      <Prose>
        <strong>5. Twilio Webhook Configured</strong> -- Your Twilio phone
        number's "A call comes in" webhook is set to your ngrok URL followed by{" "}
        <code>/incoming</code>, with HTTP method set to POST.
      </Prose>

      <Prose>
        <strong>6. Dependencies Installed</strong> -- You ran{" "}
        <code>npm install</code> in the project directory and it completed
        without errors.
      </Prose>

      <Callout type="warning">
        The most common issue at this stage is a mismatch between your ngrok URL
        and your Twilio webhook configuration. Double-check that the URL in the
        Twilio Console matches exactly what ngrok is showing. Also ensure you
        are using the <code>https://</code> version (not <code>http://</code>).
      </Callout>

      <Callout type="tip">
        If you are using a Twilio trial account, you can only make calls to
        verified phone numbers. Go to{" "}
        <a
          href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
          target="_blank"
          rel="noopener noreferrer"
        >
          Phone Numbers &rarr; Verified Caller IDs
        </a>{" "}
        to add your personal phone number so you can call your AI agent during
        testing.
      </Callout>

      <SectionHeader>Ready to Build</SectionHeader>

      <Prose>
        If everything checks out, you are ready to start building. In the next
        chapter, you will write the WebSocket server, connect it to
        ConversationRelay, pipe caller speech through an LLM, and make your
        very first AI phone call. It is going to be incredible.
      </Prose>

      <Verify question="Is everything on the checklist complete? Twilio account, API keys, ngrok running, and webhook configured?" />
    </>
  );
}
