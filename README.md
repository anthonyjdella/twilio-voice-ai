# Twilio Workshop Platform

A reusable, interactive workshop companion built with Next.js. Define your workshop content as typed data — no React knowledge required. The platform handles rendering, navigation, progress tracking, syntax highlighting, and audience adaptation.

**Currently configured for:** Build a Voice AI Agent — a 90-minute guided workshop using Twilio ConversationRelay, OpenAI, and Node.js.

## Features

- **Declarative content** — Write workshop steps as typed data blocks (prose, code, terminal, images, callouts, etc.) in `.ts` files. No JSX authoring required.
- **Single config file** — One `workshop.config.ts` drives the entire app: title, branding, chapters, sidebar, feature flags.
- **Builder / Explorer modes** — Toggle between technical (full code, diffs, terminal) and non-technical (collapsed code, visual step cards, concept explanations) views.
- **Syntax highlighting** — Shiki with Tokyo Night theme, lazy-loaded. Supports JS, TS, JSON, Bash, HTML, CSS, Python, and more.
- **Progress tracking** — localStorage-backed progress per workshop with step completion, badges, and chapter milestones.
- **Smooth transitions** — Framer Motion page transitions and staggered hero animations.
- **Twilio branded** — Accent colors, logos, and visual identity baked in and configurable.
- **Fully static** — Generates all routes at build time via `generateStaticParams`. Deploy to any static host.

## Quick Start

```bash
git clone <repo-url>
cd twilio-voice-ai
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and follow along with the workshop.

## Prerequisites (for the Voice AI Workshop)

- **Node.js 20+** — [download](https://nodejs.org/)
- **pnpm** — install via `corepack enable`
- **Twilio account** — [sign up free](https://www.twilio.com/try-twilio) with a Voice-capable phone number
- **OpenAI API key** — [get one here](https://platform.openai.com/api-keys)
- **ngrok** — [download](https://ngrok.com/) for tunneling your local server

## Workshop Structure

| # | Chapter | What You'll Build | Time |
|---|---------|-------------------|------|
| 1 | **Mission Briefing** | Understand the architecture and set up your environment | 10 min |
| 2 | **First Contact** | Build a WebSocket server and make your first AI phone call | 15 min |
| 3 | **Identity** | Design your agent's persona, voice, and language settings | 15 min |
| 4 | **Reflexes** | Handle interruptions, DTMF, silence, and language switching | 15 min |
| 5 | **Superpowers** | Add tool calling, custom functions, and live agent handoff | 20 min |
| 6 | **Launch** | Polish, deploy, and showcase your agent | 15 min |

## Audience Modes

On first visit, users are greeted with an **onboarding modal** that asks them to choose their experience — Builder or Explorer. The choice is saved to `localStorage` and can be changed anytime using the **Builder / Explorer** toggle in the top bar.

| Mode | For | Behavior |
|------|-----|----------|
| **Builder** | Developers | Full code blocks, terminal commands, diffs, deep dives, solutions |
| **Explorer** | Non-technical | Code collapsed behind buttons, diffs/deep-dives hidden, visual step cards prominent |

Both modes see the same prose, callouts, images, and verification checkpoints.

## Creating a New Workshop

This platform is designed to be reused for completely different workshop topics. See **[WORKSHOP_AUTHORING.md](./WORKSHOP_AUTHORING.md)** for the full guide, including:

- `WorkshopConfig` schema with annotated examples
- All 15 content block types with usage examples
- Directory conventions and registry setup
- Audience mode authoring tips
- Deployment instructions

**TL;DR:**
1. Edit `src/workshop.config.ts` with your chapters, branding, and sidebar
2. Create content files in `src/content/chapter-N/step-N-slug.ts`
3. Register them in `src/content/registry.ts`
4. `pnpm dev`

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Production build (static export)
pnpm start      # Serve production build
pnpm typecheck  # TypeScript type checking
pnpm lint       # ESLint
```

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static export)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Shiki](https://shiki.style/) for syntax highlighting
- [Lucide](https://lucide.dev/) for icons

## Troubleshooting

**`pnpm install` fails** — Make sure you have Node.js 20+. Run `corepack enable` if pnpm is not found.

**Port 3000 in use** — Start on a different port: `pnpm dev -- -p 3001`

**Blank page** — Clear browser cache or try incognito. Check terminal for errors.

**ngrok not working** — Ensure ngrok is running (`ngrok http 8080`) and the URL matches your Twilio webhook config.
