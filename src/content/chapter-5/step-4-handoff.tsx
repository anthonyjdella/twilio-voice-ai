import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JsonMessage } from "@/components/content/JsonMessage";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function LiveAgentHandoff() {
  return (
    <>
      <SectionHeader>Live Agent Handoff</SectionHeader>

      <ArchitectureDiagram highlight="handoff" showHandoff />

      <Prose>
        No AI agent can handle every situation. Sometimes the caller needs a human --
        for complex complaints, sensitive account changes, or when the AI simply cannot
        solve the problem. A smooth handoff from AI to a live agent is essential for
        production voice systems.
      </Prose>

      <SectionHeader>How Handoff Works</SectionHeader>

      <Prose>
        ConversationRelay supports handoff through the <code>end</code> message type.
        When your server sends an <code>end</code> message with <code>handoffData</code>,
        Twilio terminates the WebSocket connection and makes an HTTP request to the
        <strong> action URL</strong> you configured in your TwiML. That action URL
        returns new TwiML instructions to transfer the call.
      </Prose>

      <SectionHeader>The End Message with Handoff</SectionHeader>

      <Prose>
        To trigger a handoff, send this message through the WebSocket:
      </Prose>

      <JsonMessage
        direction="outbound"
        type="end"
        code={`{
  "type": "end",
  "handoffData": "{\"reason\":\"billing_dispute\",\"summary\":\"Caller wants to dispute a charge of $49.99 on order ORD-12345. AI was unable to process the refund.\",\"callerId\":\"+15551234567\"}"
}`}
      />

      <Prose>
        The <code>handoffData</code> field is a string (typically JSON-encoded) that
        carries context about the conversation to the action URL. Include everything
        the human agent needs to pick up where the AI left off: the reason for transfer,
        a conversation summary, caller information, and any relevant IDs.
      </Prose>

      <SectionHeader>Setting Up the Action URL</SectionHeader>

      <Prose>
        Add an <code>action</code> attribute to your TwiML. This is the URL that Twilio
        will call when the ConversationRelay session ends:
      </Prose>

      <CodeBlock
        language="xml"
        file="twiml-response"
        showLineNumbers
        code={`<Response>
  <Connect action="/call-ended">
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      dtmfDetection="true"
      interruptible="true"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        Twilio sends a POST request to the action URL with the <code>handoffData</code>
        as a parameter. Your action endpoint returns new TwiML to handle the transfer:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`app.post("/call-ended", (req, res) => {
  const handoffData = req.body.HandoffData;

  if (handoffData) {
    // AI requested a handoff -- transfer the call
    const data = JSON.parse(handoffData);
    console.log("Handoff requested:", data.reason);
    console.log("Summary:", data.summary);

    const twiml = \`
      <Response>
        <Say>Please hold while I transfer you to a representative.</Say>
        <Dial>
          <Queue>support</Queue>
        </Dial>
      </Response>
    \`;
    res.type("text/xml").send(twiml);
  } else {
    // Normal call end -- no handoff
    const twiml = \`
      <Response>
        <Say>Thank you for calling. Goodbye!</Say>
        <Hangup />
      </Response>
    \`;
    res.type("text/xml").send(twiml);
  }
});`}
      />

      <SectionHeader>Triggering Handoff from a Tool Call</SectionHeader>

      <Prose>
        The cleanest pattern is to define a <code>transfer_to_agent</code> tool. When the
        LLM determines that the caller needs a human, it calls this tool, and your
        handler sends the end message:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        showLineNumbers
        code={`// Add to your tools array
{
  type: "function",
  function: {
    name: "transfer_to_agent",
    description: "Transfer the caller to a live human agent. " +
      "Use this when the caller explicitly requests a human, " +
      "or when you cannot resolve their issue.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Brief reason for the transfer"
        },
        department: {
          type: "string",
          enum: ["billing", "technical", "general"],
          description: "Department to route to"
        },
        summary: {
          type: "string",
          description: "Summary of the conversation so far"
        }
      },
      required: ["reason", "summary"]
    }
  }
}

// Add to your toolHandlers
transfer_to_agent: async ({ reason, department, summary }, ws) => {
  // Let the caller know what's happening
  sendText(ws, "I understand you need more help with this. " +
    "Let me connect you with a team member who can assist.");

  // Small delay so the caller hears the message
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "end",
      handoffData: JSON.stringify({
        reason,
        department: department || "general",
        summary,
        timestamp: new Date().toISOString()
      })
    }));
  }, 2000);

  return { status: "transferring" };
}`}
      />

      <Callout type="warning">
        After sending the <code>end</code> message, the WebSocket will close. Do not
        try to send any more messages after this point. Make sure the caller hears
        the transfer announcement before you send the end message -- hence the
        <code>setTimeout</code> in the example above.
      </Callout>

      <Callout type="tip">
        Include a conversation summary in <code>handoffData</code>. Human agents
        strongly prefer knowing what the caller already discussed with the AI rather
        than making the caller repeat themselves. You can ask the LLM to generate
        the summary as part of the tool call parameters.
      </Callout>

      <DeepDive title="Advanced routing strategies">
        <p className="mb-2">
          The action URL gives you full control over what happens after handoff. Some
          common patterns:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Dial a specific number</strong> -- route to different phone numbers
            based on department or priority.
          </li>
          <li>
            <strong>Enqueue</strong> -- place the caller in a Twilio TaskRouter queue
            for skills-based routing.
          </li>
          <li>
            <strong>Conference</strong> -- bring the AI and human agent together for a
            warm handoff where the AI introduces the caller.
          </li>
          <li>
            <strong>Callback</strong> -- if no agents are available, offer to call the
            customer back.
          </li>
        </ul>
      </DeepDive>
    </>
  );
}
