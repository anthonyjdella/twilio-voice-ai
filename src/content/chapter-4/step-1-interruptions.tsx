import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JsonMessage } from "@/components/content/JsonMessage";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function InterruptionHandling() {
  return (
    <>
      <SectionHeader>Interruption Handling</SectionHeader>

      <ArchitectureDiagram highlight="websocket" />

      <Prose>
        Real conversations are messy. People interrupt, change their minds mid-sentence,
        and talk over each other. A great voice agent handles all of this gracefully.
        ConversationRelay has built-in <strong>barge-in</strong> support -- when a caller
        speaks while the AI is still talking, Twilio detects it and sends your server
        an <code>interrupt</code> message over the WebSocket.
      </Prose>

      <SectionHeader>How Barge-In Works</SectionHeader>

      <Prose>
        Here is the flow when a caller interrupts:
      </Prose>

      <Prose>
        1. Your server sends text tokens to Twilio via <code>text</code> messages.{"\n"}
        2. Twilio converts them to speech and plays audio to the caller.{"\n"}
        3. The caller starts speaking while audio is still playing.{"\n"}
        4. Twilio stops playback and sends an <code>interrupt</code> message to your server.{"\n"}
        5. Your server receives the interrupt, cancels the current LLM stream, and clears any pending tokens.{"\n"}
        6. Twilio then sends the caller&apos;s new speech as a <code>prompt</code> message.
      </Prose>

      <SectionHeader>The Interrupt Message</SectionHeader>

      <Prose>
        When barge-in occurs, ConversationRelay sends this message to your WebSocket:
      </Prose>

      <JsonMessage
        direction="inbound"
        type="interrupt"
        code={`{
  "type": "interrupt",
  "utteranceUntilInterrupt": "I can help you with your order. Let me",
  "durationUntilInterruptMs": 2340
}`}
      />

      <Prose>
        The <code>utteranceUntilInterrupt</code> field tells you exactly how much of the
        AI&apos;s response the caller actually heard before they interrupted. The
        <code>durationUntilInterruptMs</code> field gives you the playback duration in
        milliseconds. This information is valuable for maintaining accurate conversation
        history with your LLM.
      </Prose>

      <SectionHeader>Handling the Interrupt</SectionHeader>

      <Prose>
        When you receive an interrupt, you need to do two things: abort the current
        OpenAI stream (if one is active) and trim your conversation history to reflect
        only what the caller actually heard.
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`// Track the active stream so we can abort it
let activeStream = null;

function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "interrupt":
      console.log("Caller interrupted. Heard:", msg.utteranceUntilInterrupt);

      // 1. Abort the active OpenAI stream
      if (activeStream) {
        activeStream.controller.abort();
        activeStream = null;
      }

      // 2. Trim the last assistant message to what was actually heard
      const lastMsg = conversationHistory[conversationHistory.length - 1];
      if (lastMsg?.role === "assistant") {
        lastMsg.content = msg.utteranceUntilInterrupt;
      }

      // 3. Clear any buffered tokens waiting to be sent
      pendingTokens = "";
      break;

    case "prompt":
      // The caller's new speech arrives here
      handlePrompt(ws, msg);
      break;

    // ... other message types
  }
}`}
      />

      <SectionHeader>TwiML Configuration</SectionHeader>

      <Prose>
        You control interruption behavior through TwiML attributes on the
        <code>&lt;ConversationRelay&gt;</code> element. These are set when the call
        first connects, not at runtime.
      </Prose>

      <CodeBlock
        language="xml"
        file="twiml-response"
        showLineNumbers
        code={`<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      interruptible="true"
      interruptByDtmf="false"
      dtmfDetection="true"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        The key attributes for interruption control:
      </Prose>

      <Prose>
        <strong>interruptible</strong> -- When <code>true</code> (the default), callers
        can interrupt AI speech by talking. Set to <code>false</code> if you want the AI
        to finish speaking before accepting new input (useful for legal disclaimers or
        important announcements).
      </Prose>

      <Prose>
        <strong>interruptByDtmf</strong> -- When <code>true</code>, pressing a key on
        the dial pad also interrupts AI speech. Defaults to <code>false</code>.
      </Prose>

      <Callout type="tip">
        Keep <code>interruptible</code> set to <code>true</code> for natural conversation
        flow. Only disable it for specific use cases where the caller must hear the full
        message.
      </Callout>

      <DeepDive title="Why utteranceUntilInterrupt matters">
        <p className="mb-2">
          If you do not trim the assistant message in your conversation history, the LLM
          will think the caller heard the entire response. This leads to confusing
          exchanges where the AI references information it never actually delivered. By
          replacing the assistant message content with <code>utteranceUntilInterrupt</code>,
          you give the LLM an accurate picture of the conversation so far.
        </p>
        <p>
          Some advanced implementations also add a system note like &quot;[caller
          interrupted here]&quot; to help the LLM understand the context shift.
        </p>
      </DeepDive>
    </>
  );
}
