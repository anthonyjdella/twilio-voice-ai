"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { Verify } from "@/components/content/Verify";

export default function Showcase() {
  return (
    <>
      <SectionHeader>Showcase</SectionHeader>

      <Prose>
        You have built a complete voice AI agent from scratch. It is time to show it off.
      </Prose>

      <SectionHeader>Demo Your Agent</SectionHeader>

      <Prose>
        The best way to demonstrate your agent is a live call. Here is a suggested demo
        script that hits all the features you have built:
      </Prose>

      <Prose>
        1. <strong>Call your Twilio number</strong> and let the agent greet you.{"\n"}
        2. <strong>Ask a tool question</strong>: &quot;What is the weather in Austin?&quot;
        to show tool calling in action.{"\n"}
        3. <strong>Test interruption</strong>: Ask a long question, then interrupt mid-answer
        to show barge-in handling.{"\n"}
        4. <strong>Try DTMF</strong>: Press a key on your keypad to show menu support.{"\n"}
        5. <strong>Request handoff</strong>: Say &quot;I need to talk to a person&quot;
        to show the live agent transfer flow.
      </Prose>

      <SectionHeader>Share Your Creation</SectionHeader>

      <Prose>
        If you are at a workshop or hackathon, pair up with someone and call each
        other&apos;s agents. Compare approaches -- you will likely be surprised at how
        different two agents built on the same stack can feel, just from differences
        in the system prompt and tool design.
      </Prose>

      <Prose>
        Some ways to share:
      </Prose>

      <Prose>
        <strong>Share your Twilio number</strong> -- Others can call your agent directly.{"\n"}
        <strong>Screen share your terminal</strong> -- Show the WebSocket messages flowing
        in real time while someone calls your agent.{"\n"}
        <strong>Record a call</strong> -- Use Twilio&apos;s call recording feature to
        capture a demo call you can replay.
      </Prose>

      <Callout type="tip">
        When demoing, keep your terminal visible so the audience can see the tool calls,
        interrupts, and WebSocket messages in real time. The &quot;behind the scenes&quot;
        view is often more impressive than the audio alone.
      </Callout>

      <SectionHeader>What Makes a Great Demo</SectionHeader>

      <Prose>
        The most impressive demos are the ones where something unexpected happens and the
        agent handles it well. Do not script every word -- let the conversation flow
        naturally. Try edge cases live. If something breaks, that is a learning moment,
        not a failure.
      </Prose>

      <Prose>
        Focus your demo on the <strong>experience</strong>, not the code. Talk about
        what the agent does, not how it does it. The audience should think &quot;I want
        to build one of these&quot; -- not &quot;that was a complicated code walkthrough.&quot;
      </Prose>

      <SectionHeader>Checkpoint</SectionHeader>

      <Verify question="Have you successfully demoed your agent to at least one other person?" />

      <Prose>
        Whether you demoed to a room full of people or just called your own agent one
        more time, you have completed the core workshop. One more step to go.
      </Prose>
    </>
  );
}
