import { Prose, SectionHeader } from "@/components/content/Prose";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { JsonMessage } from "@/components/content/JsonMessage";
import { DeepDive } from "@/components/content/DeepDive";
import { Callout } from "@/components/content/Callout";

export default function Step2Architecture() {
  return (
    <>
      <SectionHeader>Architecture Overview</SectionHeader>

      <Prose>
        Before writing any code, let's make sure you have a clear mental model
        of how all the pieces fit together. The architecture is elegant in its
        simplicity: five components connected in a straight line, with your
        server at the center.
      </Prose>

      <ArchitectureDiagram highlight="all" />

      <SectionHeader>The Components</SectionHeader>

      <Prose>
        <strong>Caller (Phone)</strong> -- This is a real person on a real phone.
        They dial your Twilio phone number using any phone -- mobile, landline,
        VoIP, it does not matter. They experience a normal phone call. They have
        no idea there is an LLM on the other end.
      </Prose>

      <Prose>
        <strong>Twilio Voice</strong> -- Twilio's global telephony platform
        receives the call and manages the entire voice session. It handles call
        routing, audio encoding (mulaw/PCM), network traversal, and all the
        complexity of real-time voice communication. When your webhook tells it
        to use ConversationRelay, it activates the STT and TTS engines for that
        call.
      </Prose>

      <Prose>
        <strong>ConversationRelay (STT + TTS)</strong> -- This is the bridge
        between voice and text. On the inbound side, it runs a speech-to-text
        engine (powered by Deepgram, Google, or other providers) that transcribes
        the caller's speech into text. On the outbound side, it runs a
        text-to-speech engine (with voices from Amazon Polly, Google, ElevenLabs,
        and others) that converts your text responses into natural-sounding
        speech. It also handles interruption detection -- if the caller starts
        speaking while the agent is talking, ConversationRelay detects it and
        sends you an interrupt signal.
      </Prose>

      <Prose>
        <strong>Your WebSocket Server</strong> -- This is the code you will write
        in this workshop. It receives a persistent WebSocket connection from
        Twilio for each active call. It gets transcribed text from the caller,
        maintains conversation history, sends prompts to the LLM, and streams
        the LLM's response tokens back to Twilio. It also handles tool calls,
        session management, and any custom business logic.
      </Prose>

      <Prose>
        <strong>LLM (OpenAI)</strong> -- The large language model that powers
        your agent's intelligence. Your server sends it the conversation history
        and a system prompt, and it responds with generated text. We will use
        OpenAI's API with streaming enabled so tokens arrive as fast as possible,
        minimizing latency for the caller.
      </Prose>

      <SectionHeader>The Message Flow</SectionHeader>

      <Prose>
        Let's trace a single conversational turn from start to finish. The caller
        says "What's the weather like in San Francisco?" and here is exactly what
        happens:
      </Prose>

      <Prose>
        <strong>Step 1:</strong> The caller speaks into their phone. The audio is
        transmitted to Twilio over the phone network.
      </Prose>

      <Prose>
        <strong>Step 2:</strong> ConversationRelay's STT engine transcribes the
        audio in real time. Once the caller stops speaking (detected by a voice
        activity detector), it sends the final transcription to your server as a{" "}
        <code>prompt</code> message:
      </Prose>

      <JsonMessage
        direction="inbound"
        type="prompt"
        code={`{
  "type": "prompt",
  "voicePrompt": "What's the weather like in San Francisco?",
  "lang": "en-US",
  "last": true
}`}
      />

      <Prose>
        <strong>Step 3:</strong> Your server adds this to the conversation
        history and sends the full context to the LLM. The LLM begins generating
        a response and streams it back token by token.
      </Prose>

      <Prose>
        <strong>Step 4:</strong> As tokens arrive from the LLM, your server
        forwards them to Twilio as <code>text</code> messages. You can send
        partial sentences -- ConversationRelay's TTS engine will buffer
        intelligently and begin speaking as soon as it has enough text for
        natural-sounding output:
      </Prose>

      <JsonMessage
        direction="outbound"
        type="text"
        code={`{
  "type": "text",
  "token": "It's currently 62 degrees and partly cloudy in San Francisco, ",
  "last": false
}`}
      />

      <JsonMessage
        direction="outbound"
        type="text"
        code={`{
  "type": "text",
  "token": "with a light breeze coming off the bay.",
  "last": true
}`}
      />

      <Prose>
        <strong>Step 5:</strong> Twilio's TTS engine converts the text into
        speech and plays it to the caller through the phone call. The caller
        hears a natural, human-sounding voice say the response. The entire
        round-trip -- from the caller finishing their sentence to hearing the
        first word of the response -- typically takes under two seconds.
      </Prose>

      <Callout type="tip">
        The <code>last</code> field is critical. Setting <code>last: true</code>{" "}
        on the final token tells ConversationRelay that your response is
        complete. This lets the TTS engine flush its buffer and signals that the
        system should start listening for the caller's next utterance.
      </Callout>

      <SectionHeader>Why WebSockets?</SectionHeader>

      <Prose>
        ConversationRelay uses WebSockets rather than webhooks for a critical
        reason: latency. A phone conversation is real-time. Every millisecond of
        delay between the caller finishing their sentence and hearing the agent's
        response feels unnatural. WebSockets provide a persistent, full-duplex
        connection that eliminates the overhead of establishing new HTTP
        connections for each message. Your server and Twilio maintain an open
        channel for the entire duration of the call, allowing tokens to flow back
        and forth with minimal delay.
      </Prose>

      <DeepDive title="ConversationRelay Protocol Details">
        <p className="mb-3">
          The ConversationRelay WebSocket protocol uses JSON messages in both
          directions. Here are the key message types you will work with:
        </p>

        <p className="mb-2">
          <strong>Inbound (Twilio to your server):</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>
            <code>setup</code> -- Sent once when the WebSocket connects.
            Contains the call SID, caller's phone number, and any custom
            parameters you passed in your TwiML.
          </li>
          <li>
            <code>prompt</code> -- Sent when the caller finishes speaking.
            Contains the transcribed text in the <code>voicePrompt</code> field,
            the detected language in <code>lang</code>, and a{" "}
            <code>last</code> boolean indicating whether this is the final
            transcription for this utterance.
          </li>
          <li>
            <code>interrupt</code> -- Sent when the caller starts speaking while
            the agent is talking. Signals that you should stop sending tokens and
            prepare for new input.
          </li>
          <li>
            <code>dtmf</code> -- Sent when the caller presses a key on their
            phone's keypad. Contains the digit pressed.
          </li>
          <li>
            <code>error</code> -- Sent when something goes wrong with STT or
            other ConversationRelay internals.
          </li>
        </ul>

        <p className="mb-2">
          <strong>Outbound (your server to Twilio):</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>
            <code>text</code> -- Send text to be spoken to the caller. Use the{" "}
            <code>token</code> field for the text content and{" "}
            <code>last: true</code> on the final chunk.
          </li>
          <li>
            <code>config</code> -- Dynamically update session settings
            mid-call, such as switching TTS voice, changing STT language,
            or adjusting interruption sensitivity.
          </li>
          <li>
            <code>end</code> -- Terminate the ConversationRelay session and hang
            up the call, optionally playing a final message.
          </li>
        </ul>

        <p>
          All messages are JSON-encoded strings sent over the WebSocket. The
          protocol is intentionally simple -- no binary frames, no custom
          headers, no negotiation. This makes it straightforward to implement in
          any language or framework that supports WebSockets.
        </p>
      </DeepDive>
    </>
  );
}
