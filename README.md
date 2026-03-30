# Build a Voice AI Agent — Workshop Companion

A guided, 90-minute workshop for building a voice AI agent with **Twilio ConversationRelay**, **OpenAI**, and **Node.js**.

This app is the interactive companion guide that walks you through every step — from environment setup to a working, deployed voice AI agent that anyone can call on the phone.

## Prerequisites

Before starting the workshop, make sure you have:

- **Node.js 20+** — [download](https://nodejs.org/)
- **pnpm** — install via `corepack enable` (built into Node.js 16.13+)
- **Twilio account** — [sign up free](https://www.twilio.com/try-twilio)
  - A Twilio phone number with Voice capability
- **OpenAI API key** — [get one here](https://platform.openai.com/api-keys)
- **ngrok** — [download](https://ngrok.com/) (for tunneling your local server)
- A code editor (VS Code recommended)

## Quick Start

Clone this repository and start the companion guide:

```bash
git clone <repo-url>
cd twilio-voice-ai
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and follow along with the workshop.

## Workshop Structure

The workshop has **6 chapters** with 29 guided steps (~90 minutes total):

| # | Chapter | What You'll Do | Time |
|---|---------|----------------|------|
| 1 | **Mission Briefing** | Understand the architecture and set up your environment | 10 min |
| 2 | **First Contact** | Build a WebSocket server and make your first AI phone call | 15 min |
| 3 | **Identity** | Design your agent's persona, voice, and language settings | 15 min |
| 4 | **Reflexes** | Handle interruptions, DTMF tones, silence, and language switching | 15 min |
| 5 | **Superpowers** | Add tool calling, define custom functions, and build live agent handoff | 20 min |
| 6 | **Launch** | Polish, deploy, and showcase your agent | 15 min |

Each chapter includes code snippets you can copy, architecture diagrams, and verification checkpoints to confirm things are working.

## How to Use This Guide

1. Open the companion app in your browser (`pnpm dev`)
2. Work through each chapter in order — the sidebar tracks your progress
3. Build your voice AI agent in a **separate project directory** as instructed in the guide
4. Use the **Verify** checkpoints after each coding task to confirm it works
5. If you get stuck, click **Show Solution** to see the complete working code
6. Earn badges as you complete each chapter

## Troubleshooting

**`pnpm install` fails**
Make sure you have Node.js 20+ installed. Run `corepack enable` if pnpm is not found.

**Port 3000 is already in use**
Start on a different port: `pnpm dev -- -p 3001`

**The app shows a blank page**
Clear your browser cache or try an incognito window. Check the terminal for errors.

**ngrok tunnel not working**
Make sure ngrok is running (`ngrok http 8080`) and that the forwarding URL matches what you configured in your Twilio phone number webhook.

**Twilio phone number not responding**
Double-check that your phone number's Voice webhook URL points to your ngrok URL + `/incoming` and uses HTTP POST.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static export)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Shiki](https://shiki.style/) for syntax highlighting
