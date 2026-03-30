"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { Terminal } from "@/components/content/Terminal";
import { Verify } from "@/components/content/Verify";

export default function TestReflexes() {
  return (
    <>
      <SectionHeader>Test Reflexes</SectionHeader>

      <Prose>
        Time to put your agent&apos;s reflexes to the test. Make sure your server is
        running and your ngrok tunnel is active, then call your Twilio number.
      </Prose>

      <Terminal
        commands={`$ node server.js
Server listening on port 8080
$ ngrok http 8080`}
      />

      <SectionHeader>Test 1: Interruption</SectionHeader>

      <Prose>
        Call your agent and ask it a question that will produce a long response, like
        &quot;Tell me everything about your return policy.&quot; While the agent is
        speaking, interrupt it by saying &quot;Actually, never mind.&quot;
      </Prose>

      <Prose>
        Watch your terminal output. You should see:
      </Prose>

      <Prose>
        1. The <code>interrupt</code> message logged with the partial utterance.{"\n"}
        2. The OpenAI stream being aborted.{"\n"}
        3. A new <code>prompt</code> message with your interruption.{"\n"}
        4. The agent responding to your new input, not continuing the old response.
      </Prose>

      <Callout type="info">
        If the agent keeps talking after you interrupt, check that
        <code>interruptible</code> is set to <code>true</code> in your TwiML and that
        your interrupt handler is aborting the active stream.
      </Callout>

      <SectionHeader>Test 2: DTMF</SectionHeader>

      <Prose>
        Call again and press <strong>1</strong> on your keypad while the agent is
        speaking or after it finishes. You should see a <code>dtmf</code> message in
        your logs with <code>digits: &quot;1&quot;</code>, and the agent should respond
        based on your menu handler.
      </Prose>

      <Prose>
        Try pressing different keys and verify each one triggers the expected behavior.
        If you built a menu, test all the menu options.
      </Prose>

      <SectionHeader>Test 3: Silence</SectionHeader>

      <Prose>
        Call your agent and let it greet you. Then stay completely silent. After your
        configured timeout (default 8 seconds), the agent should nudge you with a
        gentle prompt. Stay silent again and verify the second prompt arrives, followed
        by a graceful call ending.
      </Prose>

      <Callout type="warning">
        If silence detection is not triggering, make sure you are starting the silence
        timer after the <code>setup</code> message and resetting it on each
        <code>prompt</code> message. Also check that you are not accidentally clearing
        the timer without restarting it.
      </Callout>

      <SectionHeader>Checkpoint</SectionHeader>

      <Verify question="Can you interrupt the AI mid-sentence?" />

      <Prose>
        If all three tests pass, your agent now has solid reflexes. It can handle
        real-world conversational dynamics: interruptions, keypad input, and silence.
        These are the foundations of a production-quality voice agent.
      </Prose>
    </>
  );
}
