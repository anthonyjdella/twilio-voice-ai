import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function NextSteps() {
  return (
    <>
      <SectionHeader>What&apos;s Next</SectionHeader>

      <Prose>
        Congratulations -- you have built a fully functional voice AI agent with Twilio
        ConversationRelay. You have gone from zero to an agent that can listen, speak,
        use tools, handle interruptions, and hand off to humans. That is a serious
        accomplishment.
      </Prose>

      <Prose>
        Here are some directions to take your agent further.
      </Prose>

      <SectionHeader>SSML for Fine-Grained Voice Control</SectionHeader>

      <Prose>
        ConversationRelay supports SSML (Speech Synthesis Markup Language) in your text
        responses. This gives you precise control over pronunciation, pauses, emphasis,
        and speed:
      </Prose>

      <CodeBlock
        language="javascript"
        showLineNumbers={false}
        code={`// Send SSML instead of plain text
ws.send(JSON.stringify({
  type: "text",
  token: '<speak>Your order <say-as interpret-as="characters">ORD</say-as>' +
    '<break time="300ms"/>12345 has shipped.' +
    '<prosody rate="slow">It should arrive by Friday.</prosody></speak>',
  last: true
}));`}
      />

      <Prose>
        SSML is especially useful for reading back numbers, spelling out codes, and
        adding natural pauses that make the agent sound more human.
      </Prose>

      <SectionHeader>Multi-Language Support</SectionHeader>

      <Prose>
        You already learned about dynamic language switching in Chapter 4. Take it
        further by building a truly multilingual agent:
      </Prose>

      <Prose>
        <strong>Language-specific voices</strong> -- Map each language to a native-sounding
        voice for the best pronunciation.{"\n"}
        <strong>Cultural adaptation</strong> -- Adjust greetings, formality levels, and
        conversation patterns per language.{"\n"}
        <strong>Auto-detect from caller ID</strong> -- Use the caller&apos;s phone number
        country code to set a default language before they even speak.
      </Prose>

      <SectionHeader>Twilio Conversational Intelligence</SectionHeader>

      <Prose>
        Twilio offers a <strong>Conversational Intelligence</strong> service that can
        analyze your voice AI calls after the fact. It provides:
      </Prose>

      <Prose>
        <strong>Transcripts</strong> -- Full transcripts of every call.{"\n"}
        <strong>Sentiment analysis</strong> -- Track caller sentiment over the course
        of a call.{"\n"}
        <strong>PII detection</strong> -- Automatically flag and redact sensitive
        information.{"\n"}
        <strong>Custom categories</strong> -- Tag calls by topic, outcome, or any
        custom criteria.
      </Prose>

      <Prose>
        This is invaluable for understanding how your agent performs at scale without
        listening to every call manually.
      </Prose>

      <SectionHeader>Audio Playback</SectionHeader>

      <Prose>
        ConversationRelay supports playing pre-recorded audio files mid-conversation.
        This is useful for hold music, legal disclaimers, or branded audio intros:
      </Prose>

      <CodeBlock
        language="javascript"
        showLineNumbers={false}
        code={`// Play a pre-recorded audio file
ws.send(JSON.stringify({
  type: "playAudio",
  url: "https://your-server.com/audio/hold-music.mp3"
}));`}
      />

      <SectionHeader>Advanced Tool Patterns</SectionHeader>

      <Prose>
        Expand your agent&apos;s capabilities with more sophisticated tool designs:
      </Prose>

      <Prose>
        <strong>Database queries</strong> -- Let the agent look up customer information,
        product catalogs, or knowledge base articles.{"\n"}
        <strong>Appointment scheduling</strong> -- Integrate with a calendar API to book,
        modify, or cancel appointments.{"\n"}
        <strong>Payment processing</strong> -- Collect payment information (with PCI
        compliance considerations) and process transactions.{"\n"}
        <strong>CRM integration</strong> -- Log call notes, update customer records, and
        create support tickets automatically.
      </Prose>

      <SectionHeader>Resources</SectionHeader>

      <Prose>
        Continue learning with these resources:
      </Prose>

      <Prose>
        <strong>Twilio ConversationRelay docs</strong> --{" "}
        <a href="https://www.twilio.com/docs/voice/conversationrelay" target="_blank" rel="noopener noreferrer">
          twilio.com/docs/voice/conversationrelay
        </a>{"\n"}
        <strong>OpenAI API reference</strong> --{" "}
        <a href="https://platform.openai.com/docs/api-reference" target="_blank" rel="noopener noreferrer">
          platform.openai.com/docs/api-reference
        </a>{"\n"}
        <strong>Twilio Voice TwiML</strong> --{" "}
        <a href="https://www.twilio.com/docs/voice/twiml" target="_blank" rel="noopener noreferrer">
          twilio.com/docs/voice/twiml
        </a>{"\n"}
        <strong>Twilio Conversational Intelligence</strong> --{" "}
        <a href="https://www.twilio.com/docs/conversational-intelligence" target="_blank" rel="noopener noreferrer">
          twilio.com/docs/conversational-intelligence
        </a>
      </Prose>

      <DeepDive title="Where voice AI is headed">
        <p className="mb-2">
          Voice AI is evolving rapidly. Some trends to watch:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Multimodal agents</strong> -- Combining voice with SMS, email,
            and chat for seamless cross-channel experiences.
          </li>
          <li>
            <strong>Real-time voice-to-voice models</strong> -- LLMs that process
            audio directly, without the STT/TTS pipeline, for lower latency and
            richer expression.
          </li>
          <li>
            <strong>Emotion-aware responses</strong> -- Detecting caller frustration
            or confusion from vocal cues and adapting the response style.
          </li>
          <li>
            <strong>Agentic workflows</strong> -- Voice agents that orchestrate
            complex multi-step processes across multiple systems autonomously.
          </li>
        </ul>
      </DeepDive>

      <Callout type="tip">
        The best voice AI agents are built iteratively. Deploy early, listen to real
        calls, and improve continuously. Your first version does not need to be perfect
        -- it needs to be in production, generating real feedback.
      </Callout>

      <Prose>
        You started this workshop with a blank server and a Twilio phone number. You
        now have a production-capable voice AI agent. Whether you are building a
        customer service bot, an appointment scheduler, or something entirely new, you
        have the foundation to make it happen. Go build something great.
      </Prose>
    </>
  );
}
