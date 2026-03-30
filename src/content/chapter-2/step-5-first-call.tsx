"use client";

import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { Terminal } from "@/components/content/Terminal";
import { Verify } from "@/components/content/Verify";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function FirstCall() {
  return (
    <>
      <ArchitectureDiagram highlight="all" />

      <SectionHeader>Time to Make Your First Call</SectionHeader>

      <Prose>
        You have all the pieces in place: a WebSocket server that handles
        incoming connections, TwiML that routes calls through ConversationRelay,
        a speech handler that captures what the caller says, and an LLM
        integration that streams intelligent responses. Let&apos;s bring it all
        together.
      </Prose>

      <SectionHeader>Pre-Flight Checklist</SectionHeader>

      <Prose>
        Before you dial, make sure everything is configured:
      </Prose>

      <Prose>
        <strong>1. Set your OpenAI API key</strong> as an environment variable.
        The server reads it from <code>process.env.OPENAI_API_KEY</code>:
      </Prose>

      <Terminal
        commands={`$ export OPENAI_API_KEY="sk-your-key-here"`}
      />

      <Prose>
        <strong>2. Update the WebSocket URL</strong> in your TwiML. Replace{" "}
        <code>your-ngrok-url.ngrok-free.app</code> with your actual ngrok
        hostname.
      </Prose>

      <Prose>
        <strong>3. Configure your Twilio phone number.</strong> In the Twilio
        Console, set the voice webhook for your phone number to{" "}
        <code>https://your-ngrok-url.ngrok-free.app/incoming</code> with HTTP
        POST.
      </Prose>

      <SectionHeader>Start Everything Up</SectionHeader>

      <Prose>
        Open two terminal windows. In the first, start ngrok:
      </Prose>

      <Terminal
        commands={`$ ngrok http 8080
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080`}
      />

      <Prose>
        In the second, start your server:
      </Prose>

      <Terminal
        commands={`$ node server.js
Server listening on port 8080`}
      />

      <SectionHeader>Make the Call</SectionHeader>

      <Prose>
        Pick up your phone and dial your Twilio number. You should hear the
        welcome greeting: &quot;Hello! How can I help you today?&quot; Then try
        saying something -- ask it a question, tell it a joke, ask about the
        weather. The AI should respond naturally within a second or two.
      </Prose>

      <Prose>
        Watch your terminal while you talk. You should see logs like:
      </Prose>

      <Terminal
        commands={`$ node server.js
Server listening on port 8080
New WebSocket connection from Twilio
Call started: CA1234567890abcdef1234567890abcdef
Caller: +15551234567
Caller said: What is the capital of France?`}
      />

      <Callout type="info">
        The first response might take a moment as the OpenAI API warms up. After
        the initial exchange, responses should feel quick and conversational.
        If the AI does not respond at all, check your terminal for error
        messages -- the most common issues are a missing or invalid API key,
        an incorrect ngrok URL, or a webhook misconfiguration.
      </Callout>

      <Callout type="tip">
        Try interrupting the AI while it is speaking. Since we set{" "}
        <code>interruptible=&quot;true&quot;</code> in the TwiML, Twilio will
        stop playback and send your new speech as a fresh prompt. This is one
        of the most impressive features of ConversationRelay -- the
        conversation feels genuinely natural.
      </Callout>

      <Verify question="Did you hear the AI respond to your voice?" />

      <SectionHeader>You Just Built a Voice AI</SectionHeader>

      <Prose>
        Congratulations -- you just made an AI-powered phone call. In roughly
        40 lines of server code, you created an agent that listens to natural
        speech, thinks with an LLM, and responds in a human-sounding voice
        over a real phone call. That is ConversationRelay at work: Twilio
        handles all the audio complexity while your server focuses purely on
        the conversation logic.
      </Prose>

      <Prose>
        Right now your agent is a blank slate -- it will answer any question
        but has no personality, no memory structure, and no special abilities.
        In the next chapter, we will give it an identity: a system prompt that
        defines who it is, a carefully chosen voice, and language
        configuration that makes it sound exactly the way you want.
      </Prose>
    </>
  );
}
