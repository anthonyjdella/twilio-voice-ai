import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { Terminal } from "@/components/content/Terminal";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function TwiMLSetup() {
  return (
    <>
      <ArchitectureDiagram highlight="setup" />

      <SectionHeader>Connecting Calls to Your Server</SectionHeader>

      <Prose>
        When someone calls your Twilio phone number, Twilio makes an HTTP
        request to your webhook URL asking &quot;what should I do with this
        call?&quot; You respond with TwiML (Twilio Markup Language) -- an XML
        document that tells Twilio how to handle the call. For ConversationRelay,
        we use the <code>&lt;Connect&gt;</code> verb with a{" "}
        <code>&lt;ConversationRelay&gt;</code> noun to hand the call off to your
        WebSocket server.
      </Prose>

      <SectionHeader>The Incoming Call Handler</SectionHeader>

      <Prose>
        Add an HTTP route to your server that responds with TwiML. When Twilio
        hits <code>/incoming</code>, your server returns XML that tells Twilio
        to open a WebSocket connection back to your server and use
        ConversationRelay to manage speech-to-text and text-to-speech.
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        startLine={7}
        code={`const server = http.createServer((req, res) => {
  if (req.url === "/incoming" && req.method === "POST") {
    const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-ngrok-url.ngrok-free.app"
      voice="en-US-Journey-F"
      dtmfDetection="true"
      interruptible="true"
      welcomeGreeting="Hello! How can I help you today?"
    />
  </Connect>
</Response>\`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server is running");
});`}
      />

      <SectionHeader>Key Attributes</SectionHeader>

      <Prose>
        The <code>&lt;ConversationRelay&gt;</code> element accepts several
        important attributes:
      </Prose>

      <Prose>
        <strong>url</strong> -- The WebSocket URL where Twilio should connect.
        This must be a publicly reachable <code>wss://</code> address. During
        development, you will use ngrok to tunnel traffic to your local machine.
      </Prose>

      <Prose>
        <strong>voice</strong> -- The TTS voice Twilio uses to speak your
        text responses back to the caller. Google and Amazon Polly voices are
        supported. We are using <code>en-US-Journey-F</code>, a natural-sounding
        Google voice.
      </Prose>

      <Prose>
        <strong>dtmfDetection</strong> -- When <code>true</code>, Twilio
        detects keypad presses (DTMF tones) and sends them to your server as
        messages. This lets the caller press buttons to navigate menus or enter
        account numbers.
      </Prose>

      <Prose>
        <strong>interruptible</strong> -- When <code>true</code>, the caller
        can interrupt the AI mid-sentence by speaking. Twilio stops playback
        and sends the new speech to your server. This creates a much more
        natural conversational flow.
      </Prose>

      <Prose>
        <strong>welcomeGreeting</strong> -- An optional greeting that Twilio
        speaks immediately when the call connects, before any WebSocket
        messages are exchanged. This avoids the initial silence while your
        server is still initializing.
      </Prose>

      <Callout type="warning">
        The <code>url</code> attribute must use <code>wss://</code> (secure
        WebSocket), not <code>ws://</code>. Twilio requires a secure connection
        in production, and ngrok provides TLS termination automatically. If you
        use <code>ws://</code>, the connection will fail silently and the call
        will hang.
      </Callout>

      <SectionHeader>Expose with ngrok</SectionHeader>

      <Prose>
        Your server is running on <code>localhost:8080</code>, but Twilio
        needs a public URL. Open a new terminal and start ngrok:
      </Prose>

      <Terminal
        commands={`$ ngrok http 8080
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080`}
      />

      <Prose>
        Copy the <code>https://</code> URL from ngrok. You will need it in two
        places: replace <code>your-ngrok-url.ngrok-free.app</code> in your
        TwiML with the ngrok hostname (keep the <code>wss://</code> scheme),
        and configure your Twilio phone number&apos;s voice webhook to point to{" "}
        <code>https://abc123.ngrok-free.app/incoming</code>.
      </Prose>

      <Callout type="tip">
        Every time you restart ngrok with a free account, you get a new URL.
        Remember to update both the TwiML <code>url</code> attribute and the
        Twilio phone number webhook. Paid ngrok accounts can use a stable
        subdomain to avoid this.
      </Callout>

      <DeepDive title="How ConversationRelay works under the hood">
        <p>
          When the call connects, Twilio&apos;s media servers handle all the
          audio processing. The caller&apos;s speech is converted to text using
          a speech-to-text engine, and that text is sent to your server as a
          JSON message over the WebSocket. When your server sends text back,
          Twilio&apos;s text-to-speech engine converts it to audio and plays it
          to the caller. Your server never touches raw audio -- it only works
          with text, which makes the integration dramatically simpler than
          using Media Streams directly.
        </p>
      </DeepDive>
    </>
  );
}
