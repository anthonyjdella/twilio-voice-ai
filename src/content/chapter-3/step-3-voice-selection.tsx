import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function VoiceSelection() {
  return (
    <>
      <ArchitectureDiagram highlight="stt-tts" />

      <SectionHeader>Choosing a Voice</SectionHeader>

      <Prose>
        ConversationRelay handles text-to-speech (TTS) for you. When your
        server sends a text response over the WebSocket, Twilio converts it to
        audio and plays it to the caller. You control which voice is used by
        setting the <code>voice</code> attribute on the{" "}
        <code>&lt;ConversationRelay&gt;</code> element in your TwiML.
      </Prose>

      <SectionHeader>TTS Providers</SectionHeader>

      <Prose>
        Twilio ConversationRelay supports three TTS providers, each with
        different strengths:
      </Prose>

      <Prose>
        <strong>ElevenLabs (default).</strong> Known for the most natural,
        human-like voices. Supports a wide range of emotions and speaking
        styles. This is the default provider — if you don&apos;t specify a
        voice, ConversationRelay will use an ElevenLabs voice.
      </Prose>

      <Prose>
        <strong>Google Cloud TTS.</strong> Offers reliable, clear voices with
        excellent multilingual support. A solid choice if you need a wide
        variety of languages or prefer Google&apos;s ecosystem.
      </Prose>

      <Prose>
        <strong>Amazon Polly.</strong> Provides standard and neural voices at
        competitive pricing. Neural voices from Polly are quite natural, and
        Polly is a good option for high-volume production workloads.
      </Prose>

      <Callout type="info">
        ElevenLabs is the default TTS provider for ConversationRelay. If you
        want the most natural-sounding voices out of the box, you can stick
        with the defaults.
      </Callout>

      <SectionHeader>Popular Voices</SectionHeader>

      <Prose>
        Here are some popular voices across each provider. Use these as a
        starting point — each provider has many more options in their
        documentation.
      </Prose>

      <Prose>
        <strong>ElevenLabs:</strong>{" "}
        <code>Rachel</code> (warm, female),{" "}
        <code>Drew</code> (confident, male),{" "}
        <code>Bella</code> (soft, female),{" "}
        <code>Antoni</code> (friendly, male),{" "}
        <code>Elli</code> (youthful, female).
      </Prose>

      <Prose>
        <strong>Google Cloud TTS:</strong>{" "}
        <code>en-US-Neural2-C</code> (female),{" "}
        <code>en-US-Neural2-D</code> (male),{" "}
        <code>en-US-Studio-O</code> (female, studio quality),{" "}
        <code>en-US-Studio-Q</code> (male, studio quality).
      </Prose>

      <Prose>
        <strong>Amazon Polly:</strong>{" "}
        <code>Joanna</code> (female, neural),{" "}
        <code>Matthew</code> (male, neural),{" "}
        <code>Lupe</code> (female, neural, bilingual en/es),{" "}
        <code>Amy</code> (female, British English).
      </Prose>

      <SectionHeader>Configuring the Voice</SectionHeader>

      <Prose>
        To set a specific voice, update the <code>&lt;ConversationRelay&gt;</code>{" "}
        element in your TwiML endpoint. Add the <code>voice</code> attribute
        with the provider-prefixed voice name, and the{" "}
        <code>ttsProvider</code> attribute to select the provider:
      </Prose>

      <CodeBlock
        language="xml"
        file="TwiML Response"
        code={`<!-- Using ElevenLabs (default provider) -->
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
    />
  </Connect>
</Response>`}
      />

      <CodeBlock
        language="xml"
        file="TwiML Response"
        code={`<!-- Using Google Cloud TTS -->
<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      voice="en-US-Neural2-C"
      ttsProvider="Google"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        In your server code, your TwiML route should look something like this:
      </Prose>

      <CodeBlock
        language="javascript"
        file="server.js"
        code={`app.post("/twiml", (req, res) => {
  res.type("text/xml");
  res.send(\`
    <Response>
      <Connect>
        <ConversationRelay
          url="wss://\${req.headers.host}/ws"
          voice="Rachel"
          ttsProvider="ElevenLabs"
        />
      </Connect>
    </Response>
  \`);
});`}
      />

      <Callout type="tip">
        Match the voice to the persona. If your agent is &quot;Ms. Chen, a
        professional concierge,&quot; pick a polished, clear voice. If your
        agent is &quot;Jake from Pete&apos;s Pizza,&quot; pick something
        warmer and more casual.
      </Callout>

      <DeepDive title="Voice Latency Considerations">
        <p>
          Different TTS providers have different latency profiles. ElevenLabs
          voices are extremely natural but may add a few extra milliseconds of
          processing time compared to Amazon Polly. For most use cases, the
          difference is negligible because ConversationRelay streams audio
          incrementally. However, if you are building a latency-critical
          application and notice delays, experiment with providers to find the
          best balance between voice quality and response speed.
        </p>
      </DeepDive>

      <Prose>
        Pick a voice that fits your persona and update your TwiML endpoint. In
        the next step, we will configure the speech-to-text side of the
        equation.
      </Prose>
    </>
  );
}
