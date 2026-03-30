import { Prose, SectionHeader } from "@/components/content/Prose";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";

export default function Step4TwilioConfig() {
  return (
    <>
      <SectionHeader>Configure Twilio</SectionHeader>

      <Prose>
        Now that your local environment is ready, you need to tell Twilio what
        to do when someone calls your phone number. This involves two things:
        pointing your Twilio phone number's webhook at your server, and
        understanding the TwiML your server will respond with.
      </Prose>

      <SectionHeader>Set Up Your Phone Number Webhook</SectionHeader>

      <Prose>
        Every Twilio phone number has a webhook configuration that tells Twilio
        where to send an HTTP request when a call comes in. You need to point
        this at your ngrok URL.
      </Prose>

      <Prose>
        <strong>1.</strong> Go to the{" "}
        <a
          href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twilio Console &rarr; Phone Numbers &rarr; Manage &rarr; Active
          Numbers
        </a>
        .
      </Prose>

      <Prose>
        <strong>2.</strong> Click on the phone number you want to use for this
        workshop. If you don't have one yet, click "Buy a Number" and pick any
        number with voice capability.
      </Prose>

      <Prose>
        <strong>3.</strong> Scroll down to the <strong>Voice Configuration</strong>{" "}
        section. Under "A call comes in", select <strong>Webhook</strong> and
        enter your ngrok URL followed by <code>/incoming</code>:
      </Prose>

      <CodeBlock
        code={`https://a1b2c3d4.ngrok-free.app/incoming`}
        language="text"
        file="Webhook URL"
        showLineNumbers={false}
      />

      <Prose>
        <strong>4.</strong> Make sure the HTTP method is set to{" "}
        <strong>POST</strong>.
      </Prose>

      <Prose>
        <strong>5.</strong> Click <strong>Save configuration</strong> at the
        bottom of the page.
      </Prose>

      <Callout type="warning">
        Replace <code>a1b2c3d4.ngrok-free.app</code> with your actual ngrok
        forwarding URL. This must match exactly what ngrok is showing in your
        terminal. If you restart ngrok, you will need to update this URL again.
      </Callout>

      <SectionHeader>Understanding the TwiML Response</SectionHeader>

      <Prose>
        When Twilio receives an incoming call to your number, it sends an HTTP
        POST request to your webhook URL (<code>/incoming</code>). Your server
        must respond with{" "}
        <strong>TwiML</strong> (Twilio Markup Language) -- an XML document that
        tells Twilio how to handle the call.
      </Prose>

      <Prose>
        For ConversationRelay, the TwiML uses the{" "}
        <code>&lt;Connect&gt;</code> verb with a{" "}
        <code>&lt;ConversationRelay&gt;</code> noun. Here is what your server
        will generate:
      </Prose>

      <CodeBlock
        code={`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://a1b2c3d4.ngrok-free.app/ws"
      voice="en-US-Journey-F"
      ttsProvider="google"
      transcriptionProvider="deepgram"
      language="en-US"
    />
  </Connect>
</Response>`}
        language="xml"
        file="TwiML Response"
      />

      <Prose>
        Let's break down each attribute:
      </Prose>

      <Prose>
        <strong><code>url</code></strong> -- The WebSocket URL where Twilio will
        connect to your server. Notice it uses <code>wss://</code> (secure
        WebSocket) and points to a <code>/ws</code> endpoint on your server.
        This is a different endpoint from the <code>/incoming</code> webhook --
        one handles the initial HTTP request, the other handles the persistent
        WebSocket connection for the duration of the call.
      </Prose>

      <Prose>
        <strong><code>voice</code></strong> -- The TTS voice to use when speaking
        the agent's responses. <code>en-US-Journey-F</code> is a Google
        Cloud TTS voice that sounds natural and conversational. You will
        explore other voice options in Chapter 3.
      </Prose>

      <Prose>
        <strong><code>ttsProvider</code></strong> -- The text-to-speech engine.
        ConversationRelay supports <code>google</code>, <code>amazon</code>, and{" "}
        <code>elevenlabs</code>. Each provider offers different voices with
        different characteristics.
      </Prose>

      <Prose>
        <strong><code>transcriptionProvider</code></strong> -- The
        speech-to-text engine. <code>deepgram</code> offers excellent real-time
        transcription with low latency. <code>google</code> is also available.
      </Prose>

      <Prose>
        <strong><code>language</code></strong> -- The language the caller is
        expected to speak. This optimizes the STT engine for that language.
        You can change this dynamically mid-call, which we will cover in
        Chapter 4.
      </Prose>

      <SectionHeader>The Code Behind It</SectionHeader>

      <Prose>
        In Chapter 2, you will write the actual server code that generates this
        TwiML. Here is a preview of what the incoming call handler looks like
        using Fastify (the Node.js framework we will use):
      </Prose>

      <CodeBlock
        code={`server.post("/incoming", async (request, reply) => {
  const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://\${process.env.PUBLIC_URL?.replace("https://", "")}/ws"
      voice="en-US-Journey-F"
      ttsProvider="google"
      transcriptionProvider="deepgram"
      language="en-US"
    />
  </Connect>
</Response>\`;

  reply.type("text/xml").send(twiml);
});`}
        language="javascript"
        file="src/server.js"
        startLine={12}
      />

      <Prose>
        When Twilio calls your webhook, this handler responds with the TwiML
        that tells Twilio to establish a ConversationRelay session. The{" "}
        <code>url</code> attribute is dynamically constructed from your{" "}
        <code>PUBLIC_URL</code> environment variable, replacing{" "}
        <code>https://</code> with <code>wss://</code> to form the WebSocket
        URL.
      </Prose>

      <DeepDive title="TwiML and the Connect Verb">
        <p className="mb-3">
          TwiML is Twilio's XML-based instruction set for controlling calls.
          Each TwiML document contains a <code>&lt;Response&gt;</code> root
          element with one or more "verbs" that tell Twilio what to do.
        </p>

        <p className="mb-3">
          The <code>&lt;Connect&gt;</code> verb is what enables bidirectional
          media streaming. Before ConversationRelay, developers used{" "}
          <code>&lt;Connect&gt;</code> with <code>&lt;Stream&gt;</code> to get
          raw audio over WebSockets. ConversationRelay builds on this
          foundation but adds the STT and TTS layer, so you work with text
          instead of audio bytes.
        </p>

        <p className="mb-3">
          You can also include other TwiML verbs before{" "}
          <code>&lt;Connect&gt;</code>. For example, you might use{" "}
          <code>&lt;Say&gt;</code> to play a brief welcome message before the AI
          agent takes over, or <code>&lt;Play&gt;</code> to play hold music
          while the WebSocket connection is being established.
        </p>

        <p>
          The ConversationRelay noun supports many more attributes beyond what
          we've shown here, including <code>dtmfDetection</code>,{" "}
          <code>interruptible</code>,{" "}
          <code>interruptByDtmf</code>, and custom parameters that get passed
          through to your WebSocket server in the <code>setup</code> message.
          We will explore these in later chapters.
        </p>
      </DeepDive>

      <Callout type="info">
        Don't worry about memorizing all of this right now. In the next chapter,
        you will write this code yourself and see it work in real time. The
        important thing is understanding the flow: incoming call hits your
        webhook, your server responds with TwiML, Twilio opens a WebSocket to
        your server, and the conversation begins.
      </Callout>
    </>
  );
}
