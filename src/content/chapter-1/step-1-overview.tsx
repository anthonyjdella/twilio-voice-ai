import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";

export default function Step1Overview() {
  return (
    <>
      <SectionHeader>What We're Building</SectionHeader>

      <Prose>
        By the end of this workshop, you will have built something remarkable: a
        voice AI agent that anyone can call on a real phone number and have a
        natural, flowing conversation with. Not a clunky IVR menu. Not a
        pre-recorded message tree. A genuine, intelligent agent that listens,
        thinks, and responds in real time -- powered by a large language model
        and delivered through Twilio's global telephony network.
      </Prose>

      <Prose>
        Imagine picking up your phone, dialing a number, and hearing an AI agent
        greet you by name. You ask it a question. It thinks for a moment, then
        responds naturally -- with the right tone, the right pacing, and the
        right information. You interrupt it mid-sentence, and it stops
        immediately, listens to what you have to say, and adjusts. It can look
        things up, perform actions, and even transfer you to a human when it
        knows it's out of its depth. That is what you are about to build.
      </Prose>

      <SectionHeader>How It Works: ConversationRelay</SectionHeader>

      <Prose>
        The magic behind this is <strong>Twilio ConversationRelay</strong>, a
        purpose-built service that bridges the gap between phone calls and AI.
        Here is the core idea: Twilio handles all the hard telephony
        problems -- speech-to-text (STT), text-to-speech (TTS), audio encoding,
        call routing, interruption detection -- and exposes a clean WebSocket
        interface to your application. Your job is to receive transcribed text
        from the caller, send it to an LLM, and stream the response back as
        text. Twilio converts that text into natural-sounding speech and plays
        it to the caller in real time.
      </Prose>

      <Prose>
        This separation of concerns is powerful. You never deal with raw audio
        buffers, codec negotiation, or voice activity detection. Instead, you
        work with simple JSON messages over a WebSocket. ConversationRelay sends
        you a <code>prompt</code> message when the caller finishes speaking, and
        you respond with <code>text</code> tokens that get synthesized into
        speech. It is a text-in, text-out interface to a live phone call.
      </Prose>

      <SectionHeader>The Call Flow</SectionHeader>

      <Prose>
        Here is what a complete call looks like once your agent is running:
      </Prose>

      <Prose>
        <strong>1. The caller dials your Twilio phone number.</strong> Twilio
        receives the call and hits your webhook to ask what to do with it.
      </Prose>

      <Prose>
        <strong>2. Your server responds with TwiML</strong> that tells Twilio to
        open a ConversationRelay session. This includes your WebSocket URL, the
        voice to use for TTS, and the language for STT.
      </Prose>

      <Prose>
        <strong>3. Twilio opens a WebSocket connection</strong> to your server
        and sends a <code>setup</code> message with the call metadata -- the
        caller's phone number, the call SID, and configuration details.
      </Prose>

      <Prose>
        <strong>4. The caller speaks.</strong> Twilio's STT engine transcribes
        their speech in real time and sends you a <code>prompt</code> message
        with the full transcription.
      </Prose>

      <Prose>
        <strong>5. Your server sends the transcription to an LLM</strong> (like
        GPT-4o) along with conversation history and a system prompt that defines
        your agent's personality and capabilities.
      </Prose>

      <Prose>
        <strong>6. As the LLM streams tokens back,</strong> you forward them to
        Twilio as <code>text</code> messages. Twilio's TTS engine converts each
        chunk into speech and plays it to the caller with minimal latency.
      </Prose>

      <Prose>
        <strong>7. The conversation continues</strong> naturally, with
        interruption handling, tool calling, and all the dynamics of a real phone
        call -- until someone hangs up.
      </Prose>

      <SectionHeader>What You Will Learn</SectionHeader>

      <Prose>
        This workshop is structured as six chapters, each building on the last:
      </Prose>

      <Prose>
        <strong>Chapter 1 -- Mission Briefing</strong> (you are here): Understand
        the architecture, set up your environment, and configure Twilio.
      </Prose>

      <Prose>
        <strong>Chapter 2 -- First Contact:</strong> Build a WebSocket server,
        connect it to ConversationRelay, handle incoming speech, stream LLM
        responses, and make your very first AI phone call.
      </Prose>

      <Prose>
        <strong>Chapter 3 -- Identity:</strong> Craft a system prompt that gives
        your agent a personality, choose from dozens of TTS voices, and configure
        STT languages and transcription settings.
      </Prose>

      <Prose>
        <strong>Chapter 4 -- Reflexes:</strong> Handle caller interruptions
        gracefully, detect DTMF tones (keypad presses), manage silence and
        timeouts, and dynamically switch languages mid-call.
      </Prose>

      <Prose>
        <strong>Chapter 5 -- Superpowers:</strong> Give your agent tools it can
        call -- look up order status, check the weather, query a database -- and
        implement live agent handoff for when the AI needs to escalate.
      </Prose>

      <Prose>
        <strong>Chapter 6 -- Launch:</strong> Polish your agent, explore
        deployment options, and showcase what you have built.
      </Prose>

      <Callout type="info">
        Each chapter takes about 10-20 minutes. You can complete the entire
        workshop in a single session or work through it chapter by chapter at
        your own pace. Every step builds on the previous one, so we recommend
        going in order.
      </Callout>
    </>
  );
}
