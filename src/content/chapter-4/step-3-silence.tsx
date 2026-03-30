import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function SilenceAndTimeouts() {
  return (
    <>
      <SectionHeader>Silence & Timeouts</SectionHeader>

      <Prose>
        Silence is information. When a caller goes quiet, it could mean they are
        thinking, they are confused, they walked away, or the call dropped. Your agent
        needs to handle silence gracefully rather than sitting in awkward dead air.
      </Prose>

      <SectionHeader>How Silence Detection Works</SectionHeader>

      <Prose>
        ConversationRelay does not send a dedicated &quot;silence&quot; message. Instead,
        you implement silence detection on your server by tracking the time since the
        last <code>prompt</code> message. If no speech arrives within a configurable
        window, you can prompt the caller or take other action.
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`const SILENCE_TIMEOUT_MS = 8000;   // 8 seconds of silence
const MAX_SILENCE_PROMPTS = 2;      // Prompt twice, then end call

let silenceTimer = null;
let silencePromptCount = 0;

function resetSilenceTimer(ws) {
  clearTimeout(silenceTimer);
  silencePromptCount = 0;

  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}

function handleSilence(ws) {
  silencePromptCount++;

  if (silencePromptCount >= MAX_SILENCE_PROMPTS) {
    // Too many silences -- end the call gracefully
    sendText(ws, "It seems like you may have stepped away. " +
      "I'll end the call for now. Feel free to call back anytime!");
    ws.send(JSON.stringify({ type: "end" }));
    return;
  }

  // Gentle nudge
  const prompts = [
    "Are you still there? Take your time -- I'm here whenever you're ready.",
    "I'm still here if you need anything. Is there something I can help with?",
  ];

  sendText(ws, prompts[silencePromptCount - 1]);

  // Reset the timer for the next silence check
  silenceTimer = setTimeout(() => {
    handleSilence(ws);
  }, SILENCE_TIMEOUT_MS);
}`}
      />

      <SectionHeader>Integrating with Your Message Handler</SectionHeader>

      <Prose>
        Reset the silence timer every time you receive speech from the caller. Start it
        after the initial greeting, and clear it when the call ends:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      sendText(ws, "Hello! How can I help you today?");
      resetSilenceTimer(ws);  // Start watching for silence
      break;

    case "prompt":
      resetSilenceTimer(ws);  // Caller spoke -- reset the timer
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      resetSilenceTimer(ws);  // Interruption counts as activity
      handleInterrupt(msg);
      break;

    case "dtmf":
      resetSilenceTimer(ws);  // Keypress counts as activity
      handleDtmfInput(ws, msg.digits);
      break;
  }
}

// Clean up when the WebSocket closes
ws.on("close", () => {
  clearTimeout(silenceTimer);
  console.log("Call ended, timers cleared.");
});`}
      />

      <Callout type="warning">
        Be careful with your silence timeout value. Too short (under 5 seconds) and
        you will interrupt callers who are thinking. Too long (over 15 seconds) and the
        experience feels unresponsive. Start with 8-10 seconds and adjust based on your
        use case.
      </Callout>

      <SectionHeader>Speech Timeout Configuration</SectionHeader>

      <Prose>
        ConversationRelay also provides a TwiML-level speech timeout via the
        <code>speechTimeout</code> attribute. This controls how long Twilio waits for
        speech before finalizing the transcript and sending it to your server:
      </Prose>

      <CodeBlock
        language="xml"
        file="twiml-response"
        showLineNumbers
        code={`<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      speechTimeout="auto"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        The <code>speechTimeout</code> attribute accepts a number of seconds or
        <code>&quot;auto&quot;</code>. When set to <code>&quot;auto&quot;</code>, Twilio
        uses intelligent endpoint detection to determine when the caller has finished
        speaking. This is the recommended setting for conversational AI.
      </Prose>

      <DeepDive title="Advanced timeout strategies">
        <p className="mb-2">
          For production agents, consider implementing tiered timeouts based on context:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Short timeout (5s)</strong> after asking a yes/no question --
            the caller should respond quickly.
          </li>
          <li>
            <strong>Medium timeout (10s)</strong> for open-ended questions --
            give the caller time to think.
          </li>
          <li>
            <strong>Long timeout (20s)</strong> when you have asked the caller to
            look something up, like an order number or account details.
          </li>
        </ul>
        <p className="mt-2">
          You can track the &quot;expected response type&quot; in your conversation
          state and adjust the timer accordingly.
        </p>
      </DeepDive>

      <Callout type="tip">
        When you end a call due to prolonged silence, log the event. Patterns in silence
        timeouts can reveal UX issues -- maybe callers do not understand a particular
        prompt, or the agent is asking for information the caller does not have.
      </Callout>
    </>
  );
}
