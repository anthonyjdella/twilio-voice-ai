# Workshop Audit Slash Command — Design Spec

**Date:** 2026-04-21
**Status:** Approved for implementation
**Target:** `twilio-voice-ai` workshop (Builder + Explorer tracks, Ch1-Ch6)

## Purpose

Produce a slash command `/audit-workshop` that generates a production-grade audit of the voice AI workshop. The audit must verify that the workshop is accurate, pedagogically sound for both audiences, functionally complete end-to-end, and ready to run in front of rooms of 10-100 attendees.

The audit combines three signals:

1. **Simulated walkthrough** — two personas (Builder, Explorer) "attend" each chapter with behavioral rules that mimic how real attendees read, skim, and interact
2. **Fact-check** — every Twilio / OpenAI API claim, parameter, model name, endpoint, and conceptual framing is verified against live docs and OpenAPI specs
3. **Static audit** — structural review of each track's flow, pacing, repetition, and audience-fit across the full chapter sequence

Findings merge into a layered report: executive summary (top 5 workshop-killers) + full prioritized list with fix options per item.

## Non-Goals

- Auto-fixing issues. The command proposes options per finding; the user decides.
- Re-auditing items marked `Done` on the prior 25-item chart unless a finding suggests regression.
- Scoring, grading, or pass/fail judgments. The output is a working list, not a report card.
- Refactoring the workshop's architecture, widgets, or repo structure.

## Scope

**In scope:**
- Workshop content (prose, diagrams, embedded widgets, code snippets shown to attendees) across Ch1-Ch6, both Builder and Explorer tracks
- Interactive widgets (persona builder, language picker, voice preview, demo script, etc.) — does the widget's UX match what the chapter describes?
- `voice-agent/` repo code — does the code attendees deploy actually match what's shown in chapters and produce a working agent?
- Codespace setup, env vars, Twilio console walkthrough, deploy path

**Out of scope:**
- `scripts/`, `analytics/`, `decks/` — not attendee-facing
- Unit tests, build tooling, CI — not attendee-facing
- Marketing site, landing pages — not the workshop itself

## User Preferences Honored

These come from auto-memory and MUST be reflected in the audit:

- **Explorer is non-technical** — no jargon, observer language, no "your server/your code" framing. An Explorer block that reads like Builder-minus-code is a **Critical** finding.
- **No hype or marketing language** — dramatic staccato, superlatives, congratulatory filler are **Medium** findings with `AUDIENCE` tag.
- **No emojis — use Twilio brand icons** — emoji usage flagged.
- **Workshop uses gpt-5.4-nano** — any reference to gpt-4o or gpt-4o-mini flagged.
- **Prior 25-item chart exists** — findings cross-referenced against it.

## Architecture

### File Layout

```
twilio-voice-ai/
├── .claude/
│   ├── commands/
│   │   └── audit-workshop.md         # Thin orchestrator (80-120 lines)
│   └── audit/
│       ├── personas/
│       │   ├── builder.md            # Builder behavioral rules
│       │   └── explorer.md           # Explorer behavioral rules
│       ├── phases/
│       │   ├── 01-simulate.md        # Simulation phase instructions
│       │   ├── 02-factcheck.md       # Fact-check phase instructions
│       │   └── 03-static-audit.md    # Static audit phase instructions
│       ├── severity-rubric.md        # Severity + dimension tags
│       ├── output-schema.md          # Final report shape
│       └── chart-reference.md        # Pointer to prior 25-item chart
└── docs/
    └── audits/
        └── YYYY-MM-DD-workshop-audit.md   # Audit output (one per run)
```

**Separation of concerns:**
- **Slash command** contains orchestration logic only — dispatches subagents, reads supporting files, merges results
- **`audit/` files** contain subject-matter substance — editable in isolation between runs

### Orchestration Flow

```
Phase 0: Setup (main Claude)
  • Invoke superpowers:dispatching-parallel-agents skill
  • Read all audit/ supporting files
  • Discover chapter files via glob workshop/**/ch*/**
  • Create output file docs/audits/YYYY-MM-DD-workshop-audit.md
  • Print cost warning, wait for confirmation

Phase 1: Simulation (12 parallel subagents)
  • 6 Builder subagents — one per chapter (Ch1-Ch6)
  • 6 Explorer subagents — one per chapter
  • Each reads its chapter cold (no knowledge of other chapters or prior chart)
  • Applies persona behavioral rules
  • Simulates interacting with widgets, pasting code, running commands
  • Returns ≤500 words of findings per subagent

Phase 2: Fact-check (6 parallel subagents)
  • One per chapter
  • Extracts checkable claims from chapter + relevant voice-agent/ code
  • Verifies via context7 (docs), WebSearch (changelogs), WebFetch (OpenAPI specs)
  • Verdicts: Match | Drift | Intentionally simplified | Ambiguous
  • Returns ≤400 words per subagent

Phase 3: Static audit (2 parallel subagents)
  • Builder-track subagent — reads all 6 chapters' Builder content
  • Explorer-track subagent — reads all 6 chapters' Explorer content
  • Evaluates sequence, repetition, pacing, consistency, skimmer risk, audience-fit
  • Returns ≤800 words per subagent

Phase 4: Merge (main Claude, no subagents)
  • Collect all 20 subagent responses
  • De-duplicate (same issue across phases tagged as Found by: multiple)
  • Cross-reference against chart-reference.md
  • Apply severity rubric
  • Write layered report to output file
  • Print 3-line summary: total findings, critical count, output path
```

**Why phased and not flat:** running static-audit first would bias the simulation ("Claude already thinks Ch4 is broken, so the persona will find it broken"). Simulation must go first, cold. Fact-check is orthogonal and can run after either.

**Why 20 subagents:** each subagent holds one focused context (one persona × one chapter, or one chapter's fact-check, or one full track). Main Claude's context is protected for the merge. This matches the pattern in `superpowers:dispatching-parallel-agents`.

## Personas

### Builder (`.claude/audit/personas/builder.md`)

**Identity:**
Junior-level developer. Understands code conceptually and can copy/paste confidently. Not fluent in any specific stack — may or may not have used Node.js, TypeScript, or React. Has heard of webhooks and APIs and understands them at a high level; does NOT need those re-explained. First time with Twilio Conversation Relay. Wants to walk out with a working agent they can point at and say "I built that."

**Behavioral rules:**
- Reads prose at normal pace; skims once patterns feel familiar
- Copies every code snippet as shown; expects it to work without knowing why
- Relies on the workshop to tell them what to name files and where to put them
- Opens every terminal command and runs it; doesn't rewrite or adapt
- Notices when a variable, file path, or env var name in prose doesn't match the code
- Interacts with widgets expecting they affect downstream steps
- Trusts conceptual explanations unless a code block visibly contradicts them
- Does NOT need basic concepts explained (APIs, webhooks, JSON, env vars, HTTP)

**Counts as a finding (frustration):**
- Code that won't run as shown (missing import, wrong path, undefined variable)
- Instructions that assume stack-specific knowledge without stating it
- Env vars, files, or variables referenced but never introduced
- A step that silently depends on prior state they don't remember setting
- "Deploy this" without explicit where/how/expected result
- Stack-specific jargon used as universal (hydration, SSR, generics, reducers)

**Counts as a finding (boredom):**
- Over-explaining APIs, webhooks, endpoints, JSON basics
- Re-introducing concepts a prior chapter already covered

**Does NOT count:**
- Subtle architectural trade-offs
- Idiomatic vs non-idiomatic code
- Performance concerns

### Explorer (`.claude/audit/personas/explorer.md`)

**Identity:**
Product manager or marketer. Knows what an API is vaguely. Has never written code, never opened a terminal, never seen a JSON file. Showed up because their team is adding voice AI and they want to understand what's happening under the hood. Curious but protective of their time — will close the tab if it feels like it's asking them to code.

**Behavioral rules:**
- Reads chapter title, then each section heading
- Reads first sentence of each paragraph; continues only if that sentence promises something they care about
- Looks at diagrams and illustrations carefully — visuals do heavy lifting for them
- Interacts with widgets — this is their primary way of "feeling" the concepts
- Never opens a code block
- Never types in a terminal
- Never reads a config file
- Reads callouts if short; skips if long

**Zone-out triggers (findings):**
- "your server", "your code", "run this", "install", "create a file", "open your terminal"
- Jargon without analogy (WebSocket, TwiML, webhook without plain-language framing)
- A block that looks like instructions instead of explanation
- More than three sentences before the payoff

**Positive signals (not findings, but tracked):**
- "Here's what's happening, here's why it matters" in first sentence
- A widget they can play with that demonstrates a concept
- An analogy mapping a technical thing to something they know
- Short callouts like "you don't need to do anything here — this shows what the agent does"

**Hard rule:** Explorer block that reads like Builder-minus-code → **Critical** severity with `AUDIENCE` tag.

## Severity Rubric (`.claude/audit/severity-rubric.md`)

### Dimensions (tags)

- `FUNCTIONAL` — breaks the technical chain (code won't run, API wrong, deploy fails, env var missing)
- `AUDIENCE` — loses an audience (jargon for Explorer, over-explaining for Builder, Explorer-block-reads-like-Builder)
- `ACCURACY` — factually wrong per Twilio/OpenAI docs, OpenAPI specs, or current behavior
- `FLOW` — structural problem (order, missing setup, contradiction across chapters, unhelpful repetition)
- `PACING` — too much/little detail for the moment, skimmer risk, wall of text

### Severity levels

| Level | Definition |
|---|---|
| **Critical** | Workshop functionally breaks OR an audience gets lost so badly they stop following. Always includes `FUNCTIONAL` OR `AUDIENCE` tag. |
| **High** | Major friction for one audience OR factual error a Builder would notice publicly. |
| **Medium** | Visible friction or mild inaccuracy, attendees recover. |
| **Low** | Polish, noticeable only on re-read. |

### Auto-severity rules

- Explorer block reads like Builder-minus-code → **Critical** + `AUDIENCE`
- Hype/marketing language → **Medium** + `AUDIENCE`
- Emoji present (not Twilio brand icon) → **Low** + `AUDIENCE`
- Any `gpt-4o` / `gpt-4o-mini` reference → **High** + `ACCURACY`

## Output Schema (`.claude/audit/output-schema.md`)

The final report at `docs/audits/YYYY-MM-DD-workshop-audit.md`:

```markdown
# Workshop Audit — YYYY-MM-DD

## Executive summary
The 5 issues most likely to kill the workshop in a live room.
Per item: 1-sentence description, location, severity, dimension tag(s).

## Findings by chapter

### Chapter N — [Title]

- **[ID]** — [one-line title]
  - **Location:** file:line | widget:Name | voice-agent/path:line
  - **Severity:** Critical | High | Medium | Low
  - **Dimensions:** FUNCTIONAL, AUDIENCE, ACCURACY, FLOW, PACING
  - **Audience:** Builder | Explorer | Both
  - **Found by:** Simulation | Fact-check | Static audit | multiple
  - **Chart ref:** new | overlaps with #N Done | overlaps with #N Skipped
  - **Issue:** [2-4 sentence explanation]
  - **Options:**
    - A) [fix option with trade-off]
    - B) [fix option with trade-off]
    - C) skip (when defensible)

## Cross-chapter findings
Contradictions, broken continuity, concept drift between chapters.

## Fact-check log
Per claim: workshop says X, source says Y, verdict, URL. Only Drift / Intentionally simplified / Ambiguous appear here.

## Phase coverage
- Simulation subagents (12): one-line summary each
- Fact-check subagents (6): one-line summary each
- Static audit subagents (2): one-line summary each
```

**ID format:** `[C1-B-03]` = Chapter 1, Builder-audience, 3rd finding. Stable across re-runs enables references in follow-up conversations.

## Phase Instructions

### Phase 1 — Simulation (`.claude/audit/phases/01-simulate.md`)

Each subagent receives:
- Persona file path
- Chapter path + widget paths + voice-agent path
- Output schema file path
- Rule: do NOT look at other chapters or prior chart

Subagent does:
1. Read chapter end-to-end (Builder reads all; Explorer follows skim rules)
2. Per section: would this persona understand? Would they keep reading?
3. For widgets: simulate interaction; does chapter description match widget behavior? Does state persist?
4. For code blocks: Builder simulates pasting; cross-check against `voice-agent/`
5. For instructions: Builder simulates attempting them; is path clear?
6. Explorer-only: flag every observer-language violation
7. Return findings in schema format
8. Hard limit: 500 words

Key constraint: subagent is told "you are this persona, not an expert auditor. A finding is something that would make *you* stop, get confused, or zone out. Don't flag what wouldn't bother this persona."

### Phase 2 — Fact-check (`.claude/audit/phases/02-factcheck.md`)

Each subagent receives:
- Chapter path + voice-agent path
- Checkable claim types: TwiML verbs/attrs, Conversation Relay parameters, OpenAI model names/API shapes, SDK method signatures, endpoint paths, pricing, webhook payload shapes, official product naming

Subagent does:
1. Read chapter + relevant `voice-agent/` code
2. Extract every checkable claim (quote exact text + location)
3. Per claim: query context7, WebSearch for recent changelogs (last 6 months), WebFetch OpenAPI specs for request/response shapes
4. Verdict: Match | Drift | Intentionally simplified | Ambiguous
5. Conceptual framing check: does the workshop's explanation match how Twilio officially describes it?
6. Hard limit: 400 words

Only `Drift` and `Intentionally simplified` generate findings. Every `Drift` verdict must cite a specific URL. Matches are silent. Ambiguous goes in fact-check log.

### Phase 3 — Static audit (`.claude/audit/phases/03-static-audit.md`)

Two subagents: one Builder-track (all 6 chapters), one Explorer-track (all 6 chapters).

Each evaluates:
- **Sequence** — does chapter order make sense? Does setup precede dependence?
- **Repetition** — unnecessary re-introductions; missing helpful repetition
- **Pacing** — walls of text; skimmer risk; thin spots
- **Consistency** — cross-chapter contradictions, concept drift
- **Skimmer risk** — load-bearing ideas in headings / first sentences?
- **Audience-fit across track** — does Explorer track stay non-technical throughout?
- **Hype/marketing language** — flag any
- **Emoji usage** — flag any (should be Twilio brand icons)

Hard limit: 800 words per subagent. Scope is forest-level — typos and single awkward sentences are Simulation's or Low-polish territory.

## Slash Command (`.claude/commands/audit-workshop.md`)

**Front matter:**
```yaml
---
description: Full audit of the voice AI workshop — simulation, fact-check, and static review across both tracks
---
```

**Body responsibilities:**

1. Invoke `superpowers:dispatching-parallel-agents` skill
2. Read all `audit/` supporting files
3. Print cost warning: "This audit runs 20 subagents and consumes significant tokens. Confirm to proceed." — wait for user confirmation
4. Discover chapters via glob and number them stably
5. Create output file `docs/audits/<today>-workshop-audit.md` (if exists, append `-2`, `-3`)
6. Dispatch Phase 1 subagents (12 parallel)
7. Dispatch Phase 2 subagents (6 parallel)
8. Dispatch Phase 3 subagents (2 parallel)
9. Merge in main Claude context: dedupe, cross-reference chart, apply rubric, write report
10. Print 3-line summary

**Guardrails:**
- Instruction-priority reminder: defer to user's memory preferences (no hype, no emojis, Explorer non-technical, gpt-5.4-nano)
- Cost confirmation gate
- Re-audit support: existing file on same day → append suffix
- Resume capability: if a phase fails partway, re-running detects phase markers in the output file and resumes from the failed phase

## Data Flow

```
User runs /audit-workshop
       │
       ▼
Main Claude reads audit/ files
       │
       ▼
Main Claude dispatches 12 Phase-1 subagents in parallel
       │ (each returns ≤500 words)
       ▼
Main Claude dispatches 6 Phase-2 subagents in parallel
       │ (each returns ≤400 words)
       ▼
Main Claude dispatches 2 Phase-3 subagents in parallel
       │ (each returns ≤800 words)
       ▼
Main Claude merges ~10,000 words of raw findings
       │ (12×500 + 6×400 + 2×800 = 10,000 words)
       │ → dedupe, cross-reference chart, apply rubric
       ▼
Write layered report (exec summary + findings + fact-check log + coverage)
       │
       ▼
Print 3-line summary to user
```

## Success Criteria

This slash command is successful when:

1. Running it on the current workshop produces a report a human can triage in ≤30 minutes
2. Every `Critical` finding is genuinely critical (low false-positive rate in the top severity)
3. Every `Drift` fact-check verdict cites a verifiable URL
4. Explorer findings meaningfully differ from Builder findings — they're not the same list minus code
5. Re-running after fixing 10 items shows those 10 items no longer flagged (or explains why they still are)
6. The user can edit a single `audit/` file (e.g., tighten the Explorer persona rules) and re-run with the new behavior, without touching the slash command

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Subagent context overflow on large chapters | 500/400/800-word output limits force summarization; main Claude's context is protected by delegation |
| Subagents disagree with each other | `Found by: multiple` tag surfaces agreement; disagreement is itself a finding worth seeing |
| Fact-check flags workshop's intentional simplifications as "wrong" | Verdict vocabulary includes `Intentionally simplified` — subagents told not to call simplification errors |
| Chart re-referencing produces stale overlaps | Overlap is tagged but not auto-applied; user decides whether to revisit skipped items |
| Network/API error mid-phase | Resume capability reads phase markers in output file, re-runs only the failed phase |
| Running audit wastes tokens on accidental invocations | Cost confirmation gate at Phase 0 |
| Personas drift from user's mental model of real attendees | Persona files are standalone edits — user tightens rules between runs |

## Future Enhancements (Out of Scope for v1)

- `/audit-workshop --chapter 3` — run on a single chapter only
- `/audit-workshop --phase simulate` — run just one phase
- `/audit-compare <file1> <file2>` — diff two audit runs to show what got fixed / regressed
- Additional persona: skimmer-specific variant
- Attendee-facing survey integration (cross-reference real attendee feedback with audit findings)

## Implementation Notes

**Repo structure discovery:** The spec references chapter paths as `workshop/**/ch*/**` and refers to widget paths generically. Actual paths must be verified against the real `twilio-voice-ai/` structure during implementation. The slash command's Phase 0 should `glob` for chapters and enumerate widgets dynamically rather than hard-code.

**Non-standard Next.js:** Per `AGENTS.md`, this repo uses a modified Next.js with breaking changes from the standard version. The slash command and subagent instructions must not assume standard Next.js conventions; when exploring the repo they should read `node_modules/next/dist/docs/` for anything framework-specific.

**MCP dependencies:** Phase 2 subagents rely on `mcp__plugin_context7`, `WebSearch`, and `WebFetch`. These are available in the current environment but must be confirmed available when the command is invoked. The slash command's Phase 0 should verify availability and abort with a clear error if any are missing.

## Open Questions

None at time of writing. All design decisions confirmed with user during brainstorming on 2026-04-21.
