"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Terminal } from "@/components/content/Terminal";
import { Callout } from "@/components/content/Callout";
import { Verify } from "@/components/content/Verify";

export default function TestIdentity() {
  return (
    <>
      <SectionHeader>Time to Test</SectionHeader>

      <Prose>
        You have crafted a system prompt, designed a persona, selected a voice,
        and configured the language settings. Now it is time to hear your agent
        in action. Restart your server to pick up the changes:
      </Prose>

      <Terminal commands="$ node server.js" />

      <Prose>
        Make sure your ngrok tunnel is still running. If it expired, start a
        new one and update your Twilio phone number webhook:
      </Prose>

      <Terminal commands="$ ngrok http 3000" />

      <Prose>
        Now call your Twilio phone number. You should hear your agent greet you
        with the voice and personality you configured. Try a few things during
        the call:
      </Prose>

      <Prose>
        <strong>Test the greeting.</strong> Does the agent introduce itself with
        the name and role you defined in the system prompt?
      </Prose>

      <Prose>
        <strong>Test the tone.</strong> Does the agent sound like the persona
        you designed? Is it formal when it should be formal, casual when it
        should be casual?
      </Prose>

      <Prose>
        <strong>Test the boundaries.</strong> Ask something off-topic. Does the
        agent stay in character and redirect the conversation?
      </Prose>

      <Prose>
        <strong>Test response length.</strong> Are the responses short and
        natural, or is the agent rambling? If responses are too long, tighten
        the system prompt with more explicit length instructions.
      </Prose>

      <Verify question="Does your agent respond with the right personality and voice?" />

      <SectionHeader>Iterating on Your Persona</SectionHeader>

      <Prose>
        Getting the persona right is an iterative process. Here are some common
        adjustments:
      </Prose>

      <Callout type="tip">
        If responses are too long, add explicit instructions like &quot;Never
        respond with more than two sentences&quot; or &quot;Always end with a
        question to keep the conversation moving.&quot;
      </Callout>

      <Callout type="tip">
        If the voice does not match the persona, try a different voice from the
        same provider. Sometimes a small change in voice makes the whole
        experience feel more cohesive.
      </Callout>

      <Callout type="tip">
        If the agent breaks character, strengthen the boundaries in your system
        prompt. Be very explicit about what the agent should never do.
      </Callout>

      <Prose>
        <strong>The system prompt is your most powerful tool.</strong> You will
        keep refining it throughout the workshop as you add new capabilities.
        For now, make sure you are happy with the basic personality and voice
        before moving on.
      </Prose>

      <Prose>
        In the next chapter, we will give your agent <strong>reflexes</strong>{" "}
        — the ability to handle interruptions, detect DTMF tones, manage
        silence, and switch languages on the fly.
      </Prose>
    </>
  );
}
