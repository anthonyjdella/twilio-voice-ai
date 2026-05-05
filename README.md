# Build a Voice AI Agent

A 90-minute guided workshop where you build an AI-powered phone agent using [Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay), OpenAI, and Node.js.

By the end, you'll have a working voice agent that listens, responds with an LLM, uses tools, handles interruptions, and hands off to a human — running on a real phone number.

---

## For Workshop Attendees

### What you need

- A free GitHub account (for Codespaces — the workshop dev environment)
- A phone to receive test calls
- About 90 minutes

Twilio and OpenAI credentials are provided during the workshop — no signups required.

### How to follow along

You have **two ways to experience this workshop**, and you can switch between them at any time:

- **Explorer** — concept cards, visual summaries, and a clickable UI. No code required.
- **Builder** — write the Node.js server yourself in Codespaces with step-by-step instructions, full code, and copy-paste solutions if you get stuck.

### Getting started

**Option 1 — follow along on the live site:**
Go to the workshop URL your facilitator gave you. Pick Explorer or Builder on first visit.

**Option 2 — run your own Codespace (Builder track):**
Click the green **Code** button on this repo → **Codespaces** → **Create codespace on main**. The environment will set itself up and pre-populate your `.env` with the shared workshop credentials.

### What you'll build

- A **WebSocket server** that receives real-time speech transcripts from Twilio
- **Outbound calling** via the Twilio REST API with ConversationRelay
- A **streaming LLM integration** with OpenAI for natural, low-latency responses
- A **custom persona** with a chosen voice, language, and personality
- **Interruption handling** so callers can cut in mid-sentence
- **DTMF support** for keypad-driven menus ("Press 1 for billing")
- **Silence detection** that nudges idle callers or gracefully ends dead calls
- **Tool calling** so the agent can check the weather, look up orders, or hit any API
- **Live agent handoff** to transfer complex calls to a human

### Workshop structure

| # | Chapter | What You'll Build | Time |
|---|---------|-------------------|------|
| 1 | **Mission Briefing** | Understand the architecture and set up your environment | 10 min |
| 2 | **First Contact** | Build a WebSocket server and make your first AI phone call | 15 min |
| 3 | **Identity** | Design your agent's persona, voice, and language | 15 min |
| 4 | **Reflexes** | Handle interruptions, DTMF, silence, and language switching | 15 min |
| 5 | **Superpowers** | Add tool calling, custom functions, and live agent handoff | 20 min |
| 6 | **Launch** | Polish, deploy, and showcase your agent | 15 min |

---

## For Maintainers

This repo is both (1) the workshop content and (2) a reusable Next.js platform for running voice-AI workshops.

### Running the companion app locally

```bash
git clone git@github.com:anthonyjdella/twilio-voice-ai.git
cd twilio-voice-ai
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a `.env.local` with Twilio credentials, an OpenAI key, and optionally `WORKSHOP_SLIDES_EMBED_URL` and `HANDOFF_PHONE_NUMBER`. See `.env.example` for the full list.

### Deploying

Merges to `main` deploy to Azure Container Apps via `.github/workflows/deploy.yml`. Environment secrets are pulled from GitHub Actions → Settings → Secrets and variables → Actions.

### Customizing

- **Theming** — dark and light themes built around the Twilio palette. Default theme is admin-configurable (`defaultTheme` in `src/workshop.config.ts`); hide the toggle entirely with `features.themeToggle: false`.
- **Share Your Win** — the final celebration screen lets learners share on X or LinkedIn. Customize messaging, hashtags, and the Twilio handle under `sharing` in `src/workshop.config.ts`, or disable with `sharing.enabled: false`.
- **Authoring new workshops** — the platform is reusable for completely different workshop content. See **[WORKSHOP_AUTHORING.md](./WORKSHOP_AUTHORING.md)** for the full authoring guide, content block reference, and platform architecture.

### Key technologies

| Technology | Role |
|-----------|------|
| [Twilio ConversationRelay](https://www.twilio.com/docs/voice/conversationrelay) | Bridges phone calls and your server via WebSocket. Handles STT, TTS, and audio. |
| [Twilio Voice TwiML](https://www.twilio.com/docs/voice/twiml) | XML instructions that tell Twilio how to handle calls. |
| [ElevenLabs](https://elevenlabs.io/) (via Twilio) | Default text-to-speech provider. Bundled into ConversationRelay — no separate API key. |
| [Deepgram](https://deepgram.com/) (via Twilio) | Default speech-to-text provider. Bundled into ConversationRelay — no separate API key. |
| [OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat) | Streams LLM responses for natural, low-latency conversation. |
| [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) | Persistent bidirectional connection between Twilio and your server. |
| [GitHub Codespaces](https://github.com/features/codespaces) | Cloud dev environment with built-in port forwarding. Zero local setup for attendees. |
