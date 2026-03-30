import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JsonMessage } from "@/components/content/JsonMessage";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function DtmfDetection() {
  return (
    <>
      <SectionHeader>DTMF Detection</SectionHeader>

      <Prose>
        DTMF (Dual-Tone Multi-Frequency) tones are the signals generated when a caller
        presses keys on their phone keypad. ConversationRelay can detect these and
        forward them to your WebSocket server, allowing you to build traditional IVR-style
        menus alongside your AI conversation.
      </Prose>

      <SectionHeader>Receiving DTMF Input</SectionHeader>

      <Prose>
        When a caller presses a key, ConversationRelay sends a <code>dtmf</code> message
        to your server:
      </Prose>

      <JsonMessage
        direction="inbound"
        type="dtmf"
        code={`{
  "type": "dtmf",
  "digits": "1"
}`}
      />

      <Prose>
        Each keypress arrives as a separate message. The <code>digits</code> field
        contains the key that was pressed: <code>0</code>-<code>9</code>,
        <code>*</code>, or <code>#</code>.
      </Prose>

      <SectionHeader>Handling DTMF in Your Message Switch</SectionHeader>

      <Prose>
        Add a <code>dtmf</code> case to your WebSocket message handler. Here is an
        example that builds a simple menu system:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`function handleMessage(ws, data) {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case "setup":
      // Send a greeting with menu options
      sendText(ws, "Welcome! Press 1 to check your order status, " +
        "press 2 to speak with a representative, " +
        "or just tell me what you need.");
      break;

    case "dtmf":
      console.log("DTMF received:", msg.digits);
      handleDtmfInput(ws, msg.digits);
      break;

    case "prompt":
      handlePrompt(ws, msg);
      break;

    case "interrupt":
      handleInterrupt(msg);
      break;
  }
}

function handleDtmfInput(ws, digit) {
  switch (digit) {
    case "1":
      // Inject context into the LLM conversation
      conversationHistory.push({
        role: "user",
        content: "I want to check my order status."
      });
      streamResponse(ws);
      break;

    case "2":
      sendText(ws, "Let me transfer you to a representative. " +
        "Please hold for a moment.");
      // Trigger handoff (covered in Chapter 5)
      break;

    case "0":
      sendText(ws, "Returning to the main menu. " +
        "Press 1 for order status, 2 for a representative, " +
        "or just tell me what you need.");
      break;

    default:
      sendText(ws, "I didn't recognize that option. " +
        "Press 1 for order status, or 2 for a representative.");
      break;
  }
}`}
      />

      <Callout type="tip">
        A good pattern is to translate DTMF inputs into natural language messages and
        inject them into the conversation history. This way, the LLM handles the actual
        response while DTMF just provides a shortcut for common actions.
      </Callout>

      <SectionHeader>Sending DTMF Tones Outbound</SectionHeader>

      <Prose>
        You can also send DTMF tones outbound -- for example, if your AI agent needs to
        navigate another phone system during a call transfer. Send a
        <code>sendDigits</code> message through the WebSocket:
      </Prose>

      <JsonMessage
        direction="outbound"
        type="sendDigits"
        code={`{
  "type": "sendDigits",
  "digits": "1234#"
}`}
      />

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`// Send DTMF tones outbound (e.g., navigating another IVR)
function sendDigits(ws, digits) {
  ws.send(JSON.stringify({
    type: "sendDigits",
    digits: digits
  }));
}

// Example: after transferring to another system
sendDigits(ws, "1");  // Press 1 for English
sendDigits(ws, "3");  // Press 3 for billing`}
      />

      <SectionHeader>Enabling DTMF Detection</SectionHeader>

      <Prose>
        DTMF detection is controlled by the <code>dtmfDetection</code> attribute in your
        TwiML. Make sure it is set to <code>true</code>:
      </Prose>

      <CodeBlock
        language="xml"
        file="twiml-response"
        showLineNumbers
        code={`<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      dtmfDetection="true"
      interruptByDtmf="true"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        Setting <code>interruptByDtmf</code> to <code>true</code> means that pressing
        a key will also stop the AI from speaking, which is usually the desired behavior
        for menu-based interactions.
      </Prose>

      <DeepDive title="Collecting multi-digit input">
        <p className="mb-2">
          If you need to collect a multi-digit input like an account number or PIN,
          you will need to buffer the digits yourself. Each keypress arrives as a
          separate <code>dtmf</code> message. Use a timer to detect when the caller
          has finished entering digits:
        </p>
        <pre className="bg-white/[0.04] p-3 rounded-lg text-xs font-mono mt-2 overflow-x-auto">
{`let dtmfBuffer = "";
let dtmfTimeout = null;

function handleDtmfInput(ws, digit) {
  dtmfBuffer += digit;
  clearTimeout(dtmfTimeout);

  // If # is pressed, process immediately
  if (digit === "#") {
    processCollectedDigits(ws, dtmfBuffer.slice(0, -1));
    dtmfBuffer = "";
    return;
  }

  // Otherwise wait 2 seconds for more digits
  dtmfTimeout = setTimeout(() => {
    processCollectedDigits(ws, dtmfBuffer);
    dtmfBuffer = "";
  }, 2000);
}`}
        </pre>
      </DeepDive>
    </>
  );
}
