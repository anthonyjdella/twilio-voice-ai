# Workshop Authoring Guide

This platform lets you create interactive, step-by-step workshops with zero React knowledge. You define content as typed data blocks in `.ts` files and configure the workshop through a single config file. The platform handles rendering, navigation, progress tracking, syntax highlighting, and audience adaptation.

## Quick Start: Create a New Workshop

1. Copy `src/workshop.config.ts` and customize it for your topic
2. Create content directories: `src/content/chapter-N/`
3. Write step files as typed data: `src/content/chapter-N/step-N-slug.ts`
4. Register each step in `src/content/registry.ts`
5. Run `pnpm dev` and iterate

## Workshop Configuration

The single source of truth is `src/workshop.config.ts`. Every layout component reads from this file.

```typescript
import type { WorkshopConfig } from "@/lib/workshop-config";

const workshopConfig: WorkshopConfig = {
  // Unique ID — namespaces localStorage (progress won't collide between workshops)
  id: "my-workshop",

  // Displayed on the hero page
  title: "Build Something Amazing",

  // Displayed in the top bar during the workshop
  shortTitle: "Amazing Workshop",

  // SEO meta description
  description: "A hands-on workshop where you build...",

  // Shown on the hero page as a badge
  duration: "60 minutes",

  hero: {
    tagline: "A 60-minute guided workshop with Twilio",
    description: "By the end, you'll have a working...",
    ctaText: "Start Workshop",
    illustration: "/images/illustrations/hero.png", // optional
  },

  branding: {
    accentColor: "#EF223A",        // hex for CSS properties
    accentColorRgb: "239, 34, 58", // for rgba() usage
  },

  chapters: [
    {
      id: 1,
      slug: "getting-started",     // URL segment: /workshop/getting-started/...
      title: "Getting Started",
      subtitle: "Set up your environment",
      duration: "10 min",
      badgeName: "Setup Complete",              // shown on milestone celebration
      badgeIcon: "/images/icons/target.svg",   // SVG icon shown in chapter cards (path relative to /public/)
      particleColor: "#0263E0",    // celebration particle color
      steps: [
        { id: 1, slug: "overview", title: "Overview" },
        { id: 2, slug: "setup", title: "Environment Setup" },
      ],
    },
    // ... more chapters
  ],

  sidebar: {
    widget: "custom",              // "custom" = key-value card, "none" = hidden
    title: "Your Project",
    fields: [
      { label: "App Name", key: "appName" },
      { label: "Region", key: "region" },
    ],
  },

  features: {
    audienceToggle: true,   // show Builder/Explorer toggle in top bar
    celebrations: true,     // show milestone badges on chapter completion
  },
};

export default workshopConfig;
```

### Chapter & Step Metadata

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Sequential chapter/step number (1-based) |
| `slug` | `string` | URL-safe identifier (used in routes) |
| `title` | `string` | Display title |
| `subtitle` | `string` | Chapter-only. Shown on hero page cards |
| `duration` | `string` | Chapter-only. Estimated time (e.g. "15 min") |
| `badgeName` | `string` | Chapter-only. Badge label on completion |
| `badgeIcon` | `string` | Chapter-only. SVG icon path for chapter card (e.g. `/images/icons/target.svg`) |
| `particleColor` | `string` | Chapter-only. Hex color for celebration particles |

## Content Files

### Directory Structure

```
src/content/
├── chapter-1/
│   ├── step-1-overview.ts
│   ├── step-2-architecture.ts
│   └── step-3-setup.ts
├── chapter-2/
│   ├── step-1-intro.ts
│   └── step-2-build.ts
└── registry.ts              ← maps chapter-slug/step-slug → StepDefinition
```

### Naming Convention

Files follow: `step-{id}-{slug}.ts`

The slug in the filename should match the `slug` in your workshop config.

### Writing a Step

Every step file exports a `StepDefinition` — an array of typed content blocks:

```typescript
import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Getting Started" },

    {
      type: "prose",
      content: "Welcome to the workshop! By the end of this step, you'll have **everything set up** and ready to go.",
    },

    {
      type: "code",
      code: `npm install twilio`,
      language: "bash",
      file: "terminal",
    },

    {
      type: "callout",
      variant: "tip",
      content: "Make sure you have Node.js 18+ installed before continuing.",
    },

    {
      type: "verify",
      question: "Did the installation complete without errors?",
    },
  ],
} satisfies StepDefinition;
```

### Registering Steps

Add each step to `src/content/registry.ts`:

```typescript
import Ch1Step1 from "./chapter-1/step-1-overview";
// ... more imports

export const stepRegistry: Record<string, StepDefinition> = {
  "getting-started/overview": Ch1Step1,
  // Key format: "{chapter-slug}/{step-slug}"
};
```

## Content Block Reference

### `section` — Section Heading

Renders as an `<h2>` divider. Use to break a step into logical sections.

```typescript
{ type: "section", title: "What We're Building" }
```

### `prose` — Rich Text

Supports inline markdown: `**bold**`, `` `code` ``, `[link text](url)`.

```typescript
{
  type: "prose",
  content: "This uses **ConversationRelay** to bridge `WebSocket` connections. See the [docs](https://twilio.com/docs) for more.",
}
```

### `code` — Code Block

Syntax-highlighted with shiki (Tokyo Night theme). Supports 9 languages: javascript, typescript, json, bash, xml, html, css, python, shell.

```typescript
{
  type: "code",
  code: `const server = new WebSocket.Server({ port: 8080 });
server.on("connection", (ws) => {
  console.log("Client connected");
});`,
  language: "javascript",         // default: "javascript"
  file: "server.js",              // optional: shown in header
  startLine: 15,                  // optional: line number offset
  showLineNumbers: true,          // default: true
}
```

**Explorer mode**: Collapsed behind a "View Code" button.

### `terminal` — Terminal Commands

Lines starting with `$` are treated as commands (shown in green, copyable). All other lines are output.

```typescript
{
  type: "terminal",
  commands: `$ npm install
added 127 packages in 4.2s
$ npm run dev
Server listening on port 3000`,
}
```

**Explorer mode**: Collapsed behind a "Show Commands" button.

### `callout` — Callout Box

Four variants: `info`, `tip`, `warning`, `error`. Content supports inline markdown.

```typescript
{ type: "callout", variant: "warning", content: "This will **overwrite** your existing configuration." }
```

**Explorer mode**: Always visible (unchanged).

### `deep-dive` — Expandable Deep Dive

Starts collapsed. Click to expand. For advanced/educational content that's optional.

```typescript
{
  type: "deep-dive",
  title: "How WebSocket Framing Works",
  content: "WebSocket frames consist of an opcode, payload length, masking key...",
  audience: "builder",  // recommended: tag as builder-only
}
```

**Explorer mode**: Hidden entirely (starts collapsed in Builder mode). Tag with `audience: "builder"` to ensure it's filtered out in Explorer mode rather than just collapsed.

### `solution` — Show Solution

Expandable code solution with optional explanation. For "stuck? here's the answer" patterns.

```typescript
{
  type: "solution",
  code: `function handleMessage(msg) {\n  return JSON.parse(msg.data);\n}`,
  file: "handler.js",
  language: "javascript",
  explanation: "We parse the raw WebSocket message data as JSON since ConversationRelay sends structured messages.",
}
```

**Explorer mode**: Hidden entirely.

### `json-message` — JSON Message Display

Shows directional JSON messages (inbound/outbound) with color-coded headers.

```typescript
{
  type: "json-message",
  direction: "inbound",     // "inbound" = blue, "outbound" = green
  messageType: "setup",
  code: `{\n  "type": "setup",\n  "callSid": "CA123..."\n}`,
}
```

**Explorer mode**: Collapsed, click header to expand.

### `verify` — Verification Checkpoint

Interactive "Did it work?" checkpoint with yes/help buttons. Marks the step as completed when confirmed.

```typescript
{ type: "verify", question: "Can you see the server running on port 3000?" }
```

**Explorer mode**: Always visible (unchanged).

### `diagram` — Architecture Diagram

Renders the animated architecture diagram with an optional highlight state.

```typescript
{
  type: "diagram",
  variant: "architecture",
  highlight: "websocket",   // optional: "none" | "all" | "setup" | "websocket" | "server" | "llm" | "tools" | "handoff" | "complete"
}
```

### `image` — Image

Renders an image with alt text and optional caption.

```typescript
{
  type: "image",
  src: "/images/illustrations/diagram.png",  // relative to /public/
  alt: "Architecture diagram",
  caption: "How the components connect",      // optional
}
```

### `visual-step` — Visual Step Cards

Numbered instruction cards with icons. Great for non-technical "click here, then there" instructions.

```typescript
{
  type: "visual-step",
  steps: [
    { icon: "/images/icons/settings.svg", title: "Open Settings", description: "Navigate to your Twilio Console and click **Settings** in the left sidebar." },
    { icon: "/images/icons/phone-call.svg", title: "Get a Phone Number", description: "Click **Buy a Number** and select one with Voice capability." },
    { icon: "/images/icons/connection.svg", title: "Configure Webhook", description: "Paste your ngrok URL into the **Voice & Fax** webhook field." },
  ],
}
```

Icons can be SVG paths (starting with `/`) from `public/images/icons/` or emoji strings (for backward compatibility). SVG icons are preferred — see the 32 Twilio brand icons in `public/images/icons/`.

**Explorer mode**: Always visible — these are designed for non-technical audiences.

### `concept-card` — Concept Explanation

Visual explanation card with optional illustration. No code — pure conceptual content.

```typescript
{
  type: "concept-card",
  title: "What is ConversationRelay?",
  content: "ConversationRelay is a Twilio service that bridges **phone calls** and **AI models**. It handles speech-to-text, text-to-speech, and audio encoding so your application only works with simple text messages.",
  illustration: "/images/illustrations/ai.svg",  // optional
}
```

### `diff` — Code Diff

Shows a unified diff with added/removed/context lines. Lines starting with `+` are additions (green), `-` are removals (red), everything else is context.

```typescript
{
  type: "diff",
  code: ` const config = {
-  voice: "default",
+  voice: "Google.en-US-Neural2-F",
   language: "en-US",
 };`,
  file: "config.js",
}
```

**Explorer mode**: Hidden entirely.

### `spacer` — Vertical Space

Adds a blank spacer for layout control.

```typescript
{ type: "spacer" }
```

## Audience Modes

The platform supports two audience modes, toggled via the Builder/Explorer pill in the top bar:

| Mode | Target | Experience |
|------|--------|------------|
| **Builder** | Developers | Full technical content — code, terminal, diffs, deep dives, solutions |
| **Explorer** | Non-technical | Visual-first — concept cards, visual steps, high-level summaries, opt-in detail |

### First-Time Onboarding

On first visit, users see an **onboarding modal** asking them to choose between Builder and Explorer modes. The choice is persisted to `localStorage`. If they've already chosen, the modal won't appear again.

Users can switch modes anytime using the **Builder / Explorer** toggle in the top bar. The onboarding modal tells them this.

The onboarding flow is handled by `OnboardingModal.tsx` and the `needsOnboarding` state in `AudienceContext.tsx`. No configuration required — it works automatically when `features.audienceToggle` is enabled.

### Per-Block Audience Targeting

Every content block supports an optional `audience` field:

```typescript
// Visible in both modes (default)
{ type: "prose", content: "ConversationRelay bridges phone calls and AI." }

// Only visible to Builders
{ type: "code", code: "...", audience: "builder" }

// Only visible to Explorers
{ type: "concept-card", title: "How It Works", content: "...", audience: "explorer" }
```

| `audience` value | Builder mode | Explorer mode |
|------------------|-------------|---------------|
| *(omitted)* | Visible | Visible (code/terminal collapsed behind buttons) |
| `"builder"` | Visible | **Hidden** |
| `"explorer"` | **Hidden** | Visible |

### Authoring Pattern: Interleaved Content

The recommended pattern is to interleave builder and explorer blocks in the same file. Shared blocks (sections, callouts, verify) have no `audience` tag. Technical blocks get `audience: "builder"`, and simplified alternatives get `audience: "explorer"`:

```typescript
// Section heading — visible in both modes
{ type: "section", title: "Setting Up the WebSocket" },

// Explorer gets a visual summary
{ type: "concept-card", title: "What's a WebSocket?", content: "A persistent connection that lets your server and Twilio talk in real time.", audience: "explorer" },

// Builder gets the full explanation + code
{ type: "prose", content: "WebSockets provide a full-duplex connection...", audience: "builder" },
{ type: "code", code: "const ws = new WebSocket.Server({...})", audience: "builder" },

// Shared callout — both modes see this
{ type: "callout", variant: "tip", content: "WebSockets stay open for the entire call." },
```

### Authoring Tips

1. **Tag `deep-dive`, `solution`, and `diff` blocks as `audience: "builder"`** — these are technical-only.

2. **Add explorer-only `concept-card` blocks** as visual summaries of technical sections. Keep them to 1-2 sentences.

3. **Use `visual-step` blocks for instructions** — these work well in both modes but are especially valuable for Explorers following along without coding.

4. **Ensure every step has 2-3 blocks in Explorer mode** — no step should appear blank when toggled.

5. **Shared `verify` blocks** let both audiences confirm progress at the same checkpoints.

## Sidebar Widget

The sidebar shows a configurable card that displays workshop-specific state. Configure in `workshop.config.ts`:

```typescript
sidebar: {
  widget: "custom",
  title: "Your Agent",
  fields: [
    { label: "Name", key: "name" },
    { label: "Voice", key: "voice" },
  ],
}
```

Values are stored in `progress.workshopState` and persisted to localStorage. To hide the sidebar widget entirely, set `widget: "none"`.

## Adding Brand Assets

Place images in `public/images/` (or `public/images/illustrations/`). Reference them in content blocks with paths relative to `/public/`:

```typescript
{ type: "image", src: "/images/illustrations/my-diagram.png", alt: "..." }
```

The platform ships with Twilio brand assets in `public/images/`:
- `twilio-logo-white.svg` — full wordmark
- `twilio-bug-white.svg` — logo bug (white)
- `twilio-bug-red.svg` — logo bug (red)
- `icons/` — 32 Twilio brand SVG icons (target, rocketship, phone-call, globe, code, settings, etc.) for use in `badgeIcon`, `visual-step` icons, and anywhere brand-consistent iconography is needed

## Progress Tracking

Progress is automatically tracked per-workshop using localStorage key `workshop-{config.id}-progress`. This includes:

- Completed steps (marked via `verify` blocks)
- Current position
- Workshop state (sidebar widget values)
- Earned badges (chapter completion)
- Call count (for workshop-specific tracking)

Each workshop ID gets its own progress, so multiple workshops can coexist on the same domain without collisions.

## Platform Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static generation)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://www.framer.com/motion/) for page transitions and hero animations
- [Shiki](https://shiki.style/) for syntax highlighting (Tokyo Night theme)
- [Lucide](https://lucide.dev/) for UI icons

## Scripts

```bash
pnpm dev        # Start development server (http://localhost:3000)
pnpm build      # Production build — generates static HTML for all routes
pnpm start      # Serve production build locally
pnpm typecheck  # TypeScript type checking (no emit)
pnpm lint       # ESLint
```

## Deployment

The build generates static HTML for all routes via `generateStaticParams`. No server-side runtime required — deploy to any static host (Vercel, Netlify, S3, etc.).

## Troubleshooting

**`pnpm install` fails** — Make sure you have Node.js 20+. Run `corepack enable` if pnpm is not found.

**Port 3000 in use** — Start on a different port: `pnpm dev -- -p 3001`

**Blank page** — Clear browser cache or try incognito. Check terminal for errors.

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx                          # Hero landing page
│   └── workshop/
│       ├── layout.tsx                    # Shell: TopBar + Sidebar + BottomNav + OnboardingModal + Providers
│       ├── page.tsx                      # Redirects to first step
│       └── [chapter]/[step]/
│           ├── page.tsx                  # SSG with generateStaticParams
│           └── StepContent.tsx           # Resolves step from registry, renders with transitions
├── components/
│   ├── content/                          # Content primitives (CodeBlock, Terminal, etc.)
│   │   └── StepRenderer.tsx              # Maps ContentBlock[] → components
│   ├── layout/                           # TopBar, Sidebar, BottomNav, OnboardingModal, ErrorBoundary
│   ├── diagrams/                         # Animated SVG diagrams
│   └── celebrations/                     # MilestoneBadge with particles
├── content/
│   ├── chapter-N/step-N-slug.ts          # Declarative content files
│   └── registry.ts                       # Step lookup map
├── lib/
│   ├── content-blocks.ts                 # ContentBlock union type + StepDefinition
│   ├── workshop-config.ts                # WorkshopConfig interface
│   ├── WorkshopContext.tsx                # Config provider + chapter helpers
│   ├── AudienceContext.tsx                # Builder/Explorer mode + onboarding state
│   ├── markdown.tsx                      # Inline markdown renderer
│   ├── highlighter.ts                    # Singleton shiki instance
│   └── types.ts                          # ChapterMeta, StepMeta, Progress
├── hooks/
│   ├── useProgress.ts                    # localStorage progress tracking
│   └── useAgentConfig.ts                 # Generic workshop state hook
└── workshop.config.ts                    # THE config file — customize this
```
