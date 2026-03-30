import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ShowSolution } from "@/components/content/ShowSolution";
import { JsonMessage } from "@/components/content/JsonMessage";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function HandleSpeech() {
  return (
    <>
      <ArchitectureDiagram highlight="websocket-prompt" />

      <SectionHeader>Receiving the Caller&apos;s Speech</SectionHeader>

      <Prose>
        When the caller finishes speaking, Twilio&apos;s speech-to-text engine
        transcribes their words and sends the result to your server as a{" "}
        <code>prompt</code> message over the WebSocket. This is the core
        inbound message you need to handle -- it contains the text of what the
        caller said.
      </Prose>

      <SectionHeader>The Prompt Message</SectionHeader>

      <Prose>
        Here is what a <code>prompt</code> message looks like when the caller
        says &quot;Hi, I need help with my account&quot;:
      </Prose>

      <JsonMessage
        direction="inbound"
        type="prompt"
        code={`{
  "type": "prompt",
  "voicePrompt": "Hi, I need help with my account",
  "lang": "en-US",
  "last": true
}`}
      />

      <Prose>
        The key fields are:
      </Prose>

      <Prose>
        <strong>voicePrompt</strong> -- The transcribed text of what the caller
        said. This is the input you will send to your LLM.
      </Prose>

      <Prose>
        <strong>lang</strong> -- The detected language of the speech. Useful if
        you are building a multilingual agent.
      </Prose>

      <Prose>
        <strong>last</strong> -- Indicates whether this is the final transcript
        for this utterance. Twilio may send partial results with{" "}
        <code>last: false</code> as the caller speaks, followed by a final
        result with <code>last: true</code>. For now, we only process messages
        where <code>last</code> is <code>true</code>.
      </Prose>

      <Callout type="tip">
        The <code>last</code> field is important for avoiding duplicate
        processing. If you handle every <code>prompt</code> message regardless
        of the <code>last</code> field, you will send partial transcripts to
        your LLM and get multiple overlapping responses. Always check{" "}
        <code>last === true</code> before processing.
      </Callout>

      <SectionHeader>Handle the Prompt</SectionHeader>

      <Prose>
        Add a <code>prompt</code> case to your message handler. When a final
        prompt arrives, add the caller&apos;s words to the conversation
        history and prepare to send them to the LLM:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={26}
        code={`    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`Call started: \${callSid}\`);
        break;

      case "prompt":
        if (!message.last) break; // Ignore partial transcripts

        console.log(\`Caller said: \${message.voicePrompt}\`);

        // Add to conversation history
        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // TODO: Send to LLM and stream response back
        // (we will implement this in the next step)

        break;

      default:
        console.log("Unhandled message type:", message.type);
    }`}
      />

      <Prose>
        The conversation history array follows the OpenAI chat format -- each
        entry has a <code>role</code> (<code>&quot;user&quot;</code>,{" "}
        <code>&quot;assistant&quot;</code>, or <code>&quot;system&quot;</code>)
        and a <code>content</code> string. This makes it straightforward to
        pass directly to the OpenAI API in the next step.
      </Prose>

      <DeepDive title="Interruption handling and prompt messages">
        <p>
          When the caller interrupts the AI mid-sentence, Twilio sends an{" "}
          <code>interrupt</code> message to let your server know that playback
          was stopped. The next <code>prompt</code> message will contain the
          new thing the caller said. You do not need special handling for
          interruptions at this stage -- the prompt handler works the same
          regardless of whether an interruption occurred. We will explore
          advanced interruption handling in Chapter 4.
        </p>
      </DeepDive>

      <ShowSolution
        file="server.js"
        language="javascript"
        explanation="The prompt handler checks the last field, logs the transcript, and appends it to the conversation history. The LLM integration comes in the next step."
        code={`wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection from Twilio");

  let callSid = null;
  const conversationHistory = [];

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "setup":
        callSid = message.callSid;
        console.log(\`Call started: \${callSid}\`);
        console.log(\`Caller: \${message.from}\`);
        break;

      case "prompt":
        if (!message.last) break;

        console.log(\`Caller said: \${message.voicePrompt}\`);

        conversationHistory.push({
          role: "user",
          content: message.voicePrompt,
        });

        // TODO: Send to LLM and stream response back

        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  });

  ws.on("close", () => {
    console.log(\`Call ended: \${callSid}\`);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});`}
      />
    </>
  );
}
