import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function LanguageConfig() {
  return (
    <>
      <SectionHeader>Speech-to-Text Configuration</SectionHeader>

      <Prose>
        While TTS turns your agent&apos;s words into audio, speech-to-text
        (STT) does the opposite: it transcribes the caller&apos;s spoken words
        into text that your server can process. ConversationRelay handles STT
        automatically, but you can fine-tune the provider and language settings
        to get better accuracy.
      </Prose>

      <SectionHeader>STT Providers</SectionHeader>

      <Prose>
        <strong>Deepgram (default).</strong> Fast and accurate, especially for
        English. Deepgram excels at real-time transcription with low latency,
        making it ideal for conversational applications. This is the default
        provider for ConversationRelay.
      </Prose>

      <Prose>
        <strong>Google Cloud Speech-to-Text.</strong> Strong multilingual
        support and excellent accuracy across dozens of languages. A good
        choice if your agent needs to handle non-English callers or if you are
        already using Google Cloud TTS and want to keep things consistent.
      </Prose>

      <SectionHeader>Configuring Language and Provider</SectionHeader>

      <Prose>
        You configure STT settings on the{" "}
        <code>&lt;ConversationRelay&gt;</code> element in your TwiML, just like
        the voice settings. The key attributes are:
      </Prose>

      <Prose>
        <strong><code>language</code></strong> — the BCP-47 language code for
        the expected caller language (e.g., <code>en-US</code>,{" "}
        <code>es-ES</code>, <code>fr-FR</code>).
      </Prose>

      <Prose>
        <strong><code>transcriptionProvider</code></strong> — the STT provider
        to use: <code>Deepgram</code> (default) or <code>Google</code>.
      </Prose>

      <Prose>
        <strong><code>speechModel</code></strong> — the specific model to use
        within the chosen provider. Different models offer trade-offs between
        speed and accuracy.
      </Prose>

      <CodeBlock
        language="xml"
        file="TwiML Response"
        code={`<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      voice="Rachel"
      ttsProvider="ElevenLabs"
      language="en-US"
      transcriptionProvider="Deepgram"
      speechModel="nova-2-general"
    />
  </Connect>
</Response>`}
      />

      <Prose>
        Here is the same configuration using Google as the STT provider, with
        Spanish as the language:
      </Prose>

      <CodeBlock
        language="xml"
        file="TwiML Response"
        code={`<Response>
  <Connect>
    <ConversationRelay
      url="wss://your-server.ngrok.app/ws"
      voice="es-US-Neural2-A"
      ttsProvider="Google"
      language="es-ES"
      transcriptionProvider="Google"
      speechModel="telephony"
    />
  </Connect>
</Response>`}
      />

      <SectionHeader>Supported Languages</SectionHeader>

      <Prose>
        ConversationRelay supports over 30 languages. Here are some of the most
        commonly used ones:
      </Prose>

      <Prose>
        <strong>English:</strong> <code>en-US</code>, <code>en-GB</code>,{" "}
        <code>en-AU</code>
      </Prose>

      <Prose>
        <strong>Spanish:</strong> <code>es-ES</code>, <code>es-MX</code>,{" "}
        <code>es-US</code>
      </Prose>

      <Prose>
        <strong>French:</strong> <code>fr-FR</code>, <code>fr-CA</code>
      </Prose>

      <Prose>
        <strong>German:</strong> <code>de-DE</code>
      </Prose>

      <Prose>
        <strong>Portuguese:</strong> <code>pt-BR</code>, <code>pt-PT</code>
      </Prose>

      <Prose>
        <strong>Japanese:</strong> <code>ja-JP</code>
      </Prose>

      <Prose>
        <strong>Chinese:</strong> <code>zh-CN</code>, <code>zh-TW</code>
      </Prose>

      <Prose>
        <strong>Korean:</strong> <code>ko-KR</code>
      </Prose>

      <Prose>
        <strong>Italian:</strong> <code>it-IT</code>
      </Prose>

      <Prose>
        <strong>Hindi:</strong> <code>hi-IN</code>
      </Prose>

      <Callout type="tip">
        If your agent handles a single language, set the <code>language</code>{" "}
        attribute explicitly. This helps the STT engine optimize for that
        language and improves accuracy. You should also instruct your LLM to
        respond in the same language via the system prompt.
      </Callout>

      <SectionHeader>Putting It All Together</SectionHeader>

      <Prose>
        Update your TwiML endpoint to include both voice and language
        configuration:
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
          language="en-US"
          transcriptionProvider="Deepgram"
          speechModel="nova-2-general"
        />
      </Connect>
    </Response>
  \`);
});`}
      />

      <DeepDive title="Transcription Accuracy Considerations">
        <p>
          STT accuracy is affected by several factors beyond provider choice.
          Background noise on the caller&apos;s end, accents, speaking speed,
          and domain-specific vocabulary all play a role. Here are a few things
          to keep in mind:
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <strong>Phone audio is lower quality.</strong> Phone calls typically
          use 8kHz narrowband audio, which is much lower fidelity than a
          podcast microphone. STT engines trained on telephony data (like
          Deepgram&apos;s <code>nova-2-general</code> or Google&apos;s{" "}
          <code>telephony</code> model) handle this better than general-purpose
          models.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <strong>Domain vocabulary matters.</strong> If your agent handles
          medical, legal, or technical conversations, the transcriber may
          struggle with jargon. You can compensate by having your LLM ask for
          clarification or spelling when it encounters ambiguous terms.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <strong>Latency vs. accuracy trade-off.</strong> Some models
          prioritize speed (lower latency before partial results appear) while
          others prioritize accuracy (waiting for more audio context before
          committing to a transcription). For real-time conversations, lower
          latency is usually preferred.
        </p>
      </DeepDive>

      <Callout type="warning">
        Make sure your system prompt language matches the <code>language</code>{" "}
        attribute. If you set <code>language=&quot;es-ES&quot;</code> but your
        system prompt is in English, the LLM will respond in English and the
        caller experience will be inconsistent.
      </Callout>
    </>
  );
}
