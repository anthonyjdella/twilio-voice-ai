# Workshop Audit Slash Command — Implementation Plan (Part 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/audit-workshop` slash command that runs a multi-phase, parallel-subagent audit of the voice AI workshop and produces a layered report.

**Architecture:** A thin orchestrator slash command at `.claude/commands/audit-workshop.md` reads supporting files from `.claude/audit/` (personas, phase instructions, severity rubric, output schema, chart reference), dispatches parallel subagents per phase, then merges results.

**Tech Stack:** Claude Code slash commands (Markdown), subagents via Agent tool, MCP tools (context7, WebSearch, WebFetch).

**Spec reference:** `docs/superpowers/specs/2026-04-21-workshop-audit-command-design.md`

**Split note:** Split into 3 parts due to length: Part 1 = persona + rubric + schema + chart files; Part 2 = phase instruction files; Part 3 = orchestrator + verification.

---

## File Structure

Files created by this plan (Part 1):

- `.claude/audit/personas/builder.md` — Builder behavioral rules
- `.claude/audit/personas/explorer.md` — Explorer behavioral rules
- `.claude/audit/severity-rubric.md` — Severity + dimension tags
- `.claude/audit/output-schema.md` — Final report shape
- `.claude/audit/chart-reference.md` — Prior 25-item chart pointer

---

## Task 1: Create `.claude/audit/` directory structure

**Files:**
- Create: `.claude/audit/personas/` (directory)
- Create: `.claude/audit/phases/` (directory)

- [ ] **Step 1: Create directories**

```bash
mkdir -p .claude/audit/personas .claude/audit/phases .claude/commands
```

- [ ] **Step 2: Verify**

```bash
ls -la .claude/audit/
ls -la .claude/audit/personas/
ls -la .claude/audit/phases/
ls -la .claude/commands/
```

Expected: all four directories exist, empty.

- [ ] **Step 3: Commit (empty dirs placeholder with .gitkeep)**

```bash
touch .claude/audit/personas/.gitkeep .claude/audit/phases/.gitkeep
git add .claude/audit/personas/.gitkeep .claude/audit/phases/.gitkeep
git commit -m "chore: scaffold .claude/audit directory structure"
```

---

## Task 2: Write Builder persona file

**Files:**
- Create: `.claude/audit/personas/builder.md`

- [ ] **Step 1: Write the file**

```markdown
# Builder Persona

You ARE this persona. You are not an expert auditor. A finding is something that would make YOU stop, get confused, bored, or frustrated. Do not flag things that would not bother THIS persona.

## Identity

Junior-level developer. You understand code conceptually and can copy/paste confidently. You are not fluent in any specific stack — you may or may not have used Node.js, TypeScript, or React before. You have heard of webhooks and APIs and understand them at a high level; you do NOT need those re-explained to you. This is your first time with Twilio Conversation Relay. You showed up because voice AI is interesting and Twilio is credible. You want to walk out with a working agent you can point at and say "I built that."

## How you consume content

- Read prose at normal pace; skim once patterns feel familiar
- Copy every code snippet as shown; expect it to work without knowing why it works
- Rely on the workshop to tell you what to name files and where to put them — you will not intuit structure
- Open every terminal command and run it; do not rewrite or adapt
- Notice when a variable, file path, or env var name in prose does not match the code
- Interact with widgets expecting they affect downstream steps
- Trust conceptual explanations unless a code block visibly contradicts them
- Do NOT need basic concepts explained (APIs, webhooks, JSON, env vars, HTTP methods)

## Frustration findings (flag these)

- Code that won't run as shown (missing import, wrong path, undefined variable)
- Instructions that assume stack-specific knowledge without stating it ("just modify the reducer" — what reducer?)
- Env vars, files, or variables referenced in prose but never introduced
- A step that silently depends on prior state you don't remember setting
- "Deploy this" without explicit where/how/expected result
- Stack-specific jargon used as universal (hydration, SSR, generics, reducers) without plain framing

## Boredom findings (flag these)

- Over-explaining APIs, webhooks, endpoints, JSON, env vars
- Re-introducing concepts a prior chapter already covered in depth

## Do NOT flag

- Subtle architectural trade-offs
- Idiomatic vs non-idiomatic code
- Performance concerns
- Opinions about styling, naming conventions beyond clarity
```

- [ ] **Step 2: Verify file exists and is non-empty**

```bash
wc -l .claude/audit/personas/builder.md
```

Expected: ≥35 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/personas/builder.md
git rm .claude/audit/personas/.gitkeep
git commit -m "feat: add Builder persona for workshop audit"
```

---

## Task 3: Write Explorer persona file

**Files:**
- Create: `.claude/audit/personas/explorer.md`

- [ ] **Step 1: Write the file**

```markdown
# Explorer Persona

You ARE this persona. You are not an expert auditor. A finding is something that would make YOU zone out, close the tab, or feel lost. Do not flag things that would not bother THIS persona.

## Identity

Product manager or marketer. You know what an API is vaguely. You have never written code, never opened a terminal, never seen a JSON file. You showed up because your team is adding voice AI and you want to understand what's actually happening under the hood. You are curious but protective of your time — you will close the tab if it feels like it's asking you to code.

## How you consume content

- Read the chapter title, then the heading of each section
- Read the first sentence of each paragraph; continue ONLY if that sentence promises something you care about
- Look at diagrams and illustrations carefully — these do a lot of heavy lifting for you
- Interact with widgets (sliders, pickers, preview buttons) — this is your primary way of "feeling" what the workshop describes
- Never open a code block
- Never type in a terminal
- Never read a config file
- Read callouts if short; skip if long

## Zone-out triggers (flag these)

- Any sentence addressed to you that says "your server", "your code", "run this", "install", "create a file", "open your terminal"
- Jargon without analogy (WebSocket, TwiML, webhook, endpoint, payload) — if a technical term appears without a plain-language framing, it loses you
- A block that looks like instructions instead of explanation
- More than three sentences before the payoff
- Long walls of prose with no visual or widget to anchor on

## Positive signals (note but do NOT flag as findings)

- "Here's what's happening, here's why it matters" in the first sentence
- A widget you can play with that demonstrates a concept
- An analogy mapping a technical thing to something you know
- Short callouts like "you don't need to do anything here — this just shows you what the agent does"

## Hard rule

If you encounter a block tagged for Explorer audience (or a shared block that sounds like instructions), and it reads like Builder content with code snippets removed, that is a **Critical-severity** finding with `AUDIENCE` dimension tag. The Explorer audience must receive content that is fundamentally different, not Builder-minus-code.

## Filtering chapter content for Explorer

When reading a chapter file (TypeScript block array), process blocks in this order:

1. Include all blocks with `audience: "explorer"`
2. Include all blocks with `audience: "shared"` or no `audience` field
3. Skip all blocks with `audience: "builder"` — those aren't for you
4. For shared blocks, apply the instructions-vs-explanation test: if it sounds like a to-do list, flag it
```

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/personas/explorer.md
grep -c "audience" .claude/audit/personas/explorer.md
```

Expected: ≥40 lines, ≥3 references to "audience".

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/personas/explorer.md
git commit -m "feat: add Explorer persona for workshop audit"
```

---

## Task 4: Write severity rubric

**Files:**
- Create: `.claude/audit/severity-rubric.md`

- [ ] **Step 1: Write the file**

```markdown
# Severity Rubric

Every finding receives a **severity** and one or more **dimension** tags. Dimensions explain *why* the severity is what it is.

## Dimensions

- `FUNCTIONAL` — breaks the technical chain. Code won't run, API wrong, deploy fails, env var missing, widget broken.
- `AUDIENCE` — loses an audience. Jargon for Explorer, over-explaining for Builder, Explorer block that reads like Builder-minus-code.
- `ACCURACY` — factually wrong per Twilio/OpenAI docs, OpenAPI specs, or current product behavior.
- `FLOW` — structural problem. Step out of order, missing setup, contradiction across chapters, unhelpful repetition.
- `PACING` — too much/little detail for the moment, skimmer risk, wall of text, thin spot.

## Severity Levels

### Critical

Workshop functionally breaks OR an audience gets lost so badly they stop following.

Always includes `FUNCTIONAL` OR `AUDIENCE` dimension tag.

Examples:
- Code snippet missing a required import that would error on paste
- Explorer block uses "your server" and "install this" in the first paragraph
- Env var referenced in chapter 4 that was never introduced in chapters 1-3
- Widget in chapter 3 doesn't persist state, but chapter 5 assumes it does

### High

Major friction for one audience OR factual error that a Builder would notice publicly (e.g., on social media).

Examples:
- Wrong OpenAI model name (gpt-4o instead of gpt-5.4-nano)
- Chapter 4 assumes a Codespace extension that chapter 1 didn't mention installing
- TwiML verb parameter named incorrectly
- Deploy instructions that skip a required step

### Medium

Causes visible friction or mild inaccuracy, but attendees recover on their own.

Examples:
- Verbose prose in a Builder-focused block
- Repetition that doesn't reinforce, just wastes time
- Minor doc drift that's out of date but not wrong
- Hype or marketing language
- Confusing phrasing that requires re-reading

### Low

Polish. Only noticeable on re-read.

Examples:
- Awkward sentence
- Inconsistent capitalization of product names
- Emoji used instead of a Twilio brand icon
- Header text that could be tightened

## Auto-Severity Rules

Apply these automatically — no judgment needed:

| Condition | Severity | Dimension |
|---|---|---|
| Explorer block reads like Builder-minus-code | Critical | AUDIENCE |
| Hype or marketing language (staccato, superlatives, congratulatory filler) | Medium | AUDIENCE |
| Emoji present in user-facing content | Low | AUDIENCE |
| Reference to `gpt-4o` or `gpt-4o-mini` (should be `gpt-5.4-nano`) | High | ACCURACY |
| Deprecated Twilio product name (e.g., "Programmable Voice" in ConversationRelay context, if docs confirm) | High | ACCURACY |

## Finding Fields

Every finding must include:

- **Severity** (Critical / High / Medium / Low)
- **Dimensions** (one or more of the five tags)
- **Audience** (Builder / Explorer / Both)
- **Location** (file:line, widget name, or voice-agent path)
- **Found by** (Simulation / Fact-check / Static audit / multiple)
- **Issue** (2-4 sentence explanation)
- **Options** (2-3 concrete fix options with trade-offs, including a "skip (with reason)" option when defensible)
```

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/severity-rubric.md
grep -c "Critical\|High\|Medium\|Low" .claude/audit/severity-rubric.md
```

Expected: ≥60 lines, severity names appear multiple times.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/severity-rubric.md
git commit -m "feat: add severity rubric for workshop audit"
```

---

## Task 5: Write output schema

**Files:**
- Create: `.claude/audit/output-schema.md`

- [ ] **Step 1: Write the file**

````markdown
# Output Schema

The final audit report is written to `docs/audits/YYYY-MM-DD-workshop-audit.md` following this exact structure.

## Finding ID Format

`[C{chapter}-{audience}-{sequence}]`

- `C1`, `C2`, ... `C6` — chapter number
- `B` (Builder), `E` (Explorer), `X` (cross-chapter), `S` (shared/both)
- `01`, `02`, ... — zero-padded sequence within that scope

Examples:
- `[C1-B-03]` = Chapter 1, Builder-audience finding #3
- `[C4-E-01]` = Chapter 4, Explorer-audience finding #1
- `[CX-01]` = Cross-chapter finding #1

IDs are stable across re-runs — same issue found again gets the same ID when possible.

## Report Template

```markdown
# Workshop Audit — YYYY-MM-DD

**Workshop:** twilio-voice-ai
**Phases run:** Simulation (12 subagents), Fact-check (6 subagents), Static audit (2 subagents)
**Total findings:** N
**Critical:** N | **High:** N | **Medium:** N | **Low:** N

---

## Executive Summary

The 5 issues most likely to kill the workshop in a live room.

1. **[ID]** — [one-sentence description]
   - Location: [file:line or widget]
   - Severity: [level]
   - Dimensions: [tags]

[repeat for 5 items]

---

## Findings by Chapter

### Chapter 1 — Mission Briefing

- **[C1-S-01]** — [one-line title]
  - **Location:** `src/content/chapter-1/step-2-how-it-works.ts:45` (or `widget:PersonaBuilder` or `voice-agent/handler.mjs:12`)
  - **Severity:** Critical
  - **Dimensions:** FUNCTIONAL, AUDIENCE
  - **Audience:** Both
  - **Found by:** Simulation, Static audit
  - **Chart ref:** new
  - **Issue:** [2-4 sentence explanation of what's wrong and why it matters]
  - **Options:**
    - A) [concrete fix with trade-off]
    - B) [alternative fix with trade-off]
    - C) skip — [when skipping is defensible]

[repeat per finding, grouped under each chapter]

### Chapter 2 — First Contact
[...]

### Chapter 3 — Identity
[...]

### Chapter 4 — Reflexes
[...]

### Chapter 5 — Superpowers
[...]

### Chapter 6 — Launch
[...]

---

## Cross-Chapter Findings

Contradictions, broken continuity, concept drift between chapters. Use ID prefix `CX-`.

---

## Fact-Check Log

Per claim: what the workshop says, what the source says, verdict, URL.

Only `Drift`, `Intentionally simplified`, and `Ambiguous` verdicts appear. Matches are omitted.

| Claim location | Workshop says | Source says | Verdict | Source URL |
|---|---|---|---|---|
| `ch-2/step-1:42` | "Conversation Relay uses WebSocket" | [live doc text] | Match | — |
| `ch-4/step-3:18` | "silence timeout default is 5 seconds" | "default 8 seconds" | Drift | https://... |

---

## Phase Coverage

### Simulation (12 subagents)

- Ch1 Builder: [1-line summary of findings count + biggest issue]
- Ch1 Explorer: [1-line summary]
- Ch2 Builder: [1-line summary]
- Ch2 Explorer: [1-line summary]
- [...through Ch6 × 2]

### Fact-check (6 subagents)

- Ch1: [1-line summary of claims checked + drift count]
- [...through Ch6]

### Static audit (2 subagents)

- Builder track: [1-line summary]
- Explorer track: [1-line summary]

---

## Run Metadata

- **Date:** YYYY-MM-DD
- **Audit command version:** v1
- **Prior chart referenced:** Yes (25 items, ~2026-04-20)
- **Re-run count today:** [1 | 2 | 3 ...]
```
````

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/output-schema.md
grep -c "Chapter" .claude/audit/output-schema.md
```

Expected: ≥80 lines, "Chapter" appears multiple times.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/output-schema.md
git commit -m "feat: add output schema for workshop audit"
```

---

## Task 6: Write chart reference

**Files:**
- Create: `.claude/audit/chart-reference.md`

- [ ] **Step 1: Write the file**

```markdown
# Prior Audit Chart Reference

The prior 25-item audit chart exists in the user's auto-memory at `~/.claude/projects/-Users-adellavecchia-Desktop-Git-Projects/memory/project_voice_ai_audit.md`.

When running the merge phase, read that file and cross-reference findings.

## Tagging rules

For each finding in the current audit:

- If the issue is NOT mentioned in the prior chart → tag `Chart ref: new`
- If the issue overlaps with a prior item marked DONE → tag `Chart ref: overlaps with #N Done` (suggests possible regression if the item was truly fixed)
- If the issue overlaps with a prior item marked SKIPPED → tag `Chart ref: overlaps with #N Skipped` (user chose not to fix it previously; surface again for reconsideration)

## How to compare

An "overlap" means:
- Same chapter
- Same or related content area (same step, same widget, same paragraph)
- Same underlying issue (same audience, same root cause)

Small textual differences in the issue description don't prevent overlap. The test is: "would the user read this new finding and say 'yeah, that's the same thing I already looked at as #N'?"

## Output requirement

Every finding must include one of:
- `Chart ref: new`
- `Chart ref: overlaps with #N Done`
- `Chart ref: overlaps with #N Skipped`

Do NOT exclude findings that overlap with Done items — surface them anyway. The tag lets the user decide whether it's a regression.

## If the memory file is unavailable

If `project_voice_ai_audit.md` doesn't exist or can't be read, tag every finding `Chart ref: new` and note at the top of the report: "Prior chart unavailable — all findings tagged as new."
```

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/chart-reference.md
```

Expected: ≥25 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/chart-reference.md
git commit -m "feat: add chart reference file for workshop audit"
```

---

## Part 1 complete

After Task 6, you have:
- `.claude/audit/personas/builder.md`
- `.claude/audit/personas/explorer.md`
- `.claude/audit/severity-rubric.md`
- `.claude/audit/output-schema.md`
- `.claude/audit/chart-reference.md`

**Next:** Continue to Part 2 (`2026-04-21-workshop-audit-command-part2.md`) which creates the three phase instruction files.
