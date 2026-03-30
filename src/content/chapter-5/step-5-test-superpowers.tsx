"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { Terminal } from "@/components/content/Terminal";
import { Verify } from "@/components/content/Verify";

export default function TestSuperpowers() {
  return (
    <>
      <SectionHeader>Test Superpowers</SectionHeader>

      <Prose>
        Your agent now has real capabilities. Let us test tool calling and handoff to
        make sure everything is wired up correctly.
      </Prose>

      <Terminal
        commands={`$ node server.js
Server listening on port 8080
$ ngrok http 8080`}
      />

      <SectionHeader>Test 1: Weather Tool</SectionHeader>

      <Prose>
        Call your Twilio number and ask: &quot;What is the weather in Austin?&quot;
      </Prose>

      <Prose>
        Watch your terminal. You should see:
      </Prose>

      <Prose>
        1. The <code>prompt</code> message with the transcribed speech.{"\n"}
        2. A log line showing <code>Tool call: check_weather {`{ city: "Austin" }`}</code>.{"\n"}
        3. The tool result being added to the conversation.{"\n"}
        4. The LLM&apos;s natural language response being streamed to Twilio.
      </Prose>

      <Prose>
        The agent should say something like: &quot;It is currently 78 degrees and sunny
        in Austin.&quot;
      </Prose>

      <Callout type="info">
        If the agent responds without calling the tool (just making up weather data),
        check that you are passing the <code>tools</code> array in your OpenAI API
        call. Without it, the LLM has no tools available and will hallucinate answers.
      </Callout>

      <SectionHeader>Test 2: Order Lookup Tool</SectionHeader>

      <Prose>
        Try: &quot;Can you check the status of order ORD-12345?&quot;
      </Prose>

      <Prose>
        The agent should call <code>lookup_order</code> and respond with the shipping
        status and tracking information. Then try an order that does not exist:
        &quot;What about order ORD-99999?&quot; The agent should gracefully handle the
        &quot;not found&quot; error.
      </Prose>

      <SectionHeader>Test 3: Multi-Tool Call</SectionHeader>

      <Prose>
        Ask a question that requires multiple tools: &quot;What is the weather in
        Seattle, and can you check order ORD-67890?&quot; Watch your terminal to confirm
        both tools are called and results are incorporated into a single response.
      </Prose>

      <SectionHeader>Test 4: Handoff</SectionHeader>

      <Prose>
        Say: &quot;I need to speak with a real person.&quot; or &quot;Transfer me to
        an agent.&quot; The AI should acknowledge the request and trigger the handoff
        process. Check your terminal for the <code>end</code> message with
        <code>handoffData</code>.
      </Prose>

      <Callout type="warning">
        If you have not set up the <code>action</code> URL on your TwiML Connect verb,
        the call will simply end when the handoff triggers. That is fine for testing
        -- you can verify the handoff logic works by checking the terminal logs.
      </Callout>

      <SectionHeader>Checkpoint</SectionHeader>

      <Verify question="Did your tool respond with the correct data?" />

      <Prose>
        With tool calling and handoff working, your agent is no longer just a chatbot.
        It can take real actions, look up real data, and seamlessly hand off to humans
        when needed. These are the superpowers that make voice AI practical for
        production use cases.
      </Prose>
    </>
  );
}
