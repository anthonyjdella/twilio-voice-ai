# Build a Voice AI Agent

A 90-minute guided workshop where you build an AI-powered phone agent using [Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay), OpenAI, and Node.js.

By the end, you'll have a working voice agent that listens to callers, responds with an LLM, uses tools, handles interruptions, and can hand off to a human -- all running on a real phone number.

## What is ConversationRelay?

ConversationRelay is a Twilio service that bridges phone calls and AI. It handles the hard parts -- speech-to-text, text-to-speech, audio encoding, barge-in detection -- so your server only works with simple text messages over a WebSocket.

```
Caller speaks  -->  Twilio (STT)  -->  Your Server  -->  LLM (OpenAI)
Caller hears   <--  Twilio (TTS)  <--  Your Server  <--  LLM streams tokens
```

You send text, Twilio turns it into speech. The caller speaks, Twilio sends you text. That's it.

## What You'll Build

- A **WebSocket server** that receives real-time speech transcripts from Twilio
- **Outbound calling** via the Twilio REST API with ConversationRelay
- A **streaming LLM integration** with OpenAI for natural, low-latency responses
- A **custom persona** with a chosen voice (ElevenLabs), language, and personality
- **Interruption handling** so callers can cut in mid-sentence naturally
- **DTMF support** for keypad-driven menus ("Press 1 for billing")
- **Silence detection** that nudges idle callers or gracefully ends dead calls
- **Tool calling** so the agent can check the weather, look up orders, or hit any API
- **Live agent handoff** to transfer complex calls to a human

## Workshop Structure

| # | Chapter | What You'll Build | Time |
|---|---------|-------------------|------|
| 1 | **Mission Briefing** | Understand the architecture and set up your environment | 10 min |
| 2 | **First Contact** | Build a WebSocket server and make your first AI phone call | 15 min |
| 3 | **Identity** | Design your agent's persona, voice, and language settings | 15 min |
| 4 | **Reflexes** | Handle interruptions, DTMF, silence, and language switching | 15 min |
| 5 | **Superpowers** | Add tool calling, custom functions, and live agent handoff | 20 min |
| 6 | **Launch** | Polish, deploy, and showcase your agent | 15 min |

## Prerequisites

- **A free GitHub account** -- for GitHub Codespaces (the workshop dev environment)
- **A phone** -- to receive test calls from your voice AI agent

Shared Twilio and OpenAI credentials are provided during the workshop -- no signups needed.

> **Running on your own?** You'll need a [Twilio account](https://www.twilio.com/try-twilio) with a Voice-capable phone number and an [OpenAI API key](https://platform.openai.com/api-keys).

## Getting Started

**During a workshop:** Click "Open in Codespace" from the repository page. Everything is pre-configured.

**Running the companion app locally:**

```bash
git clone git@github.com:anthonyjdella/twilio-voice-ai.git
cd twilio-voice-ai
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start the workshop.

## Choose Your Track

On your first visit, you'll be asked to pick an experience:

| Track | For | What You Get |
|-------|-----|--------------|
| **Builder** | Developers who want to code along | Full code blocks, terminal commands, diffs, deep dives, copy-paste solutions |
| **Explorer** | Anyone who wants to understand the concepts | Visual summaries, concept cards, high-level overviews, no code required |

You can switch between tracks anytime using the **Builder / Explorer** toggle in the top bar.

## Key Technologies

| Technology | Role |
|-----------|------|
| [Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay) | Bridges phone calls and your server via WebSocket. Handles STT, TTS, and audio. |
| [Twilio Voice TwiML](https://www.twilio.com/docs/voice/twiml) | XML instructions that tell Twilio how to handle calls. |
| [ElevenLabs](https://elevenlabs.io/) (via Twilio) | Default text-to-speech provider. Bundled into ConversationRelay -- no separate API key. |
| [Deepgram](https://deepgram.com/) (via Twilio) | Default speech-to-text provider. Bundled into ConversationRelay -- no separate API key. |
| [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) | Streams LLM responses for natural, low-latency conversation. |
| [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) | Persistent bidirectional connection between Twilio and your server. |
| [GitHub Codespaces](https://github.com/features/codespaces) | Cloud dev environment with built-in port forwarding. Zero local setup. |

## Reusing This Platform

The workshop companion app is built as a reusable platform -- you can swap in completely different workshop content without touching React. See **[WORKSHOP_AUTHORING.md](./WORKSHOP_AUTHORING.md)** for the full authoring guide, content block reference, and platform architecture.
