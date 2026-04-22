# Workshop Audit Slash Command — Implementation Plan (Part 2 of 3)

> **For agentic workers:** Continue from Part 1. Each phase file below is a standalone instruction set handed to subagents.

## File Structure

Files created in Part 2:

- `.claude/audit/phases/01-simulate.md` — Simulation phase instructions (given to 12 Phase-1 subagents)
- `.claude/audit/phases/02-factcheck.md` — Fact-check phase instructions (given to 6 Phase-2 subagents)
- `.claude/audit/phases/03-static-audit.md` — Static audit phase instructions (given to 2 Phase-3 subagents)

---

## Task 7: Write simulation phase instructions

**Files:**
- Create: `.claude/audit/phases/01-simulate.md`

- [ ] **Step 1: Write the file**

````markdown
# Phase 1 — Simulation Instructions

You are a workshop-audit subagent running the **simulation phase**. You will be given a persona file path and a single chapter to audit.

## Inputs you receive

- `PERSONA_PATH` — full path to either `.claude/audit/personas/builder.md` or `.claude/audit/personas/explorer.md`
- `CHAPTER_NUMBER` — integer 1-6
- `CHAPTER_DIR` — full path like `src/content/chapter-{N}/`
- `VOICE_AGENT_DIR` — full path to `voice-agent/`
- `COMPONENTS_DIR` — full path to `src/components/`
- `WORKSHOP_CONFIG_PATH` — full path to `src/workshop.config.ts`
- `SEVERITY_RUBRIC_PATH` — full path to `.claude/audit/severity-rubric.md`

## What to do

1. **Read your persona file** — embody it completely. You are NOT an auditor; you are this persona experiencing the chapter for the first time.

2. **Read the severity rubric** — so your findings use the correct severity + dimension vocabulary.

3. **Read the workshop config** to find the chapter's title and the slug-based step IDs for your chapter.

4. **Read every step file in the chapter directory** in order:
   - `src/content/chapter-{N}/step-1-*.ts` through `step-{last}-*.ts`
   - Each file exports a `StepDefinition` with a `blocks` array
   - Each block has a `type` (prose, concept-card, image, callout, widget, code, terminal, etc.) and optionally an `audience` field ("builder", "explorer", or undefined/shared)

5. **Filter blocks by your persona:**
   - If Builder persona: read `audience: "builder"` + shared blocks (no audience field, or audience matches both)
   - If Explorer persona: read `audience: "explorer"` + shared blocks — SKIP `audience: "builder"` blocks entirely (the workshop has a toggle; you'd never see them)

6. **Simulate consuming each block** per your persona's behavioral rules:
   - Builder: reads at normal pace, notices mismatches, pastes code and mentally runs it
   - Explorer: reads headings and first sentences, skims, looks at visuals, interacts with widgets, never reads code

7. **When you hit a widget block** (type includes "widget" or references a component name):
   - Find the component in `src/components/` — read the actual `.tsx` file
   - Check: does the widget's behavior match what the surrounding chapter prose describes?
   - Check: does the widget's state persist (read from workshopState / similar) if later steps depend on it?
   - Flag any mismatch

8. **When you hit a code block** (Builder only):
   - Cross-check the code against `voice-agent/handler.mjs`, `voice-agent/system-prompt.mjs`, or `voice-agent/tools.mjs` — does the snippet in the chapter match what's actually in the repo?
   - Would this code run as shown? Missing imports, undefined vars, wrong paths?
   - Is every env var/file/variable referenced also introduced somewhere in this chapter or a prior chapter?

9. **When you hit an instruction** (Builder persona only — "deploy this", "run this command", "open this file"):
   - Simulate trying to do it. Is the destination clear? Is the expected result stated? Would you get stuck?

10. **Explorer-specific check:** For every Explorer or shared block, apply the "observer language" test:
    - Does it use "your server", "your code", "run this", "install", "create a file", "open your terminal"?
    - Does it sound like instructions (imperative) or explanation (descriptive)?
    - Any block that sounds like Builder instructions = **Critical + AUDIENCE** finding

## What counts as a finding

Only flag things that would genuinely bother THIS persona per the rules in your persona file. If your persona's rules say "do not flag subtle architectural trade-offs," you do not flag them.

If a block is perfectly fine for your persona, do NOT output a finding for it. No-findings is a valid (and common) outcome for individual blocks.

## Output format

Output a Markdown block with findings. **Hard limit: 500 words total.**

```markdown
## Chapter {N} — {Persona} simulation findings

**Blocks reviewed:** {count}
**Findings:** {count} ({critical} Critical, {high} High, {medium} Medium, {low} Low)

### Findings

#### [C{N}-{B|E}-01] {one-line title}

- **Location:** `src/content/chapter-{N}/step-{X}-{slug}.ts` block index {i} ({block type})
- **Severity:** Critical
- **Dimensions:** AUDIENCE, FLOW
- **Audience:** Explorer
- **Issue:** {2-4 sentence explanation in your persona's voice — e.g., "I got to this block and saw 'open your terminal'. I'm not a developer, I don't have a terminal. I would close the tab here."}
- **Options:**
  - A) Rewrite the block as observer-language: "the workshop uses a terminal to..." — trade-off: adds words
  - B) Mark this block Builder-only; add an Explorer-only concept-card explaining the same idea — trade-off: more blocks to maintain
  - C) skip — {only if defensible, state why}

#### [C{N}-{B|E}-02] ...
```

If no findings: output `**Findings:** 0` and stop. Do not pad.

## Rules

- Never look at chapters other than the one you were assigned
- Never read the prior audit chart
- Never cite what an "expert auditor" thinks — you are the persona
- Stay under 500 words of output total
- Use the persona's voice in the Issue field (Builder: technical but junior; Explorer: observer, non-technical)
- Location must include both the file path AND the block index within the blocks array (they're not line-numbered; block index is what a human can find)
````

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/phases/01-simulate.md
grep -c "persona" .claude/audit/phases/01-simulate.md
```

Expected: ≥80 lines, multiple persona references.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/phases/01-simulate.md
git commit -m "feat: add simulation phase instructions"
```

---

## Task 8: Write fact-check phase instructions

**Files:**
- Create: `.claude/audit/phases/02-factcheck.md`

- [ ] **Step 1: Write the file**

````markdown
# Phase 2 — Fact-Check Instructions

You are a workshop-audit subagent running the **fact-check phase**. You verify every checkable factual claim against authoritative sources.

## Inputs you receive

- `CHAPTER_NUMBER` — integer 1-6
- `CHAPTER_DIR` — full path to chapter dir
- `VOICE_AGENT_DIR` — full path to `voice-agent/`
- `SEVERITY_RUBRIC_PATH` — full path to severity rubric

## Tools available

- `mcp__plugin_context7` — resolve library IDs and query live documentation for Twilio, OpenAI, etc.
- `WebSearch` — search for recent (last 6 months) changelogs, deprecation notices, Twilio blog posts
- `WebFetch` — fetch specific URLs including OpenAPI specs when deep schema verification is needed
- `Read`, `Grep`, `Glob` — read chapter content and voice-agent code

## What's a "checkable claim"

A statement that can be verified against official docs or specs:

- Twilio product names and spellings (e.g., "ConversationRelay" vs "Conversation Relay")
- TwiML verb names and attributes (`<Connect>`, `<ConversationRelay>`, etc.)
- ConversationRelay parameters (welcomeGreeting, transcriptionProvider, voice, language codes)
- OpenAI model names (`gpt-5.4-nano`, `gpt-4o-mini`, etc. — user memory says `gpt-5.4-nano` is correct)
- SDK method signatures (`twiml.connect()`, `openai.chat.completions.create()`)
- Endpoint paths
- Webhook payload shapes
- Default values and limits (timeouts, rate limits, etc.)
- Pricing statements
- Conceptual framings (what Conversation Relay *is*, how it relates to Media Streams, etc.)

## What's NOT a checkable claim

- Subjective statements ("voice AI is exciting")
- Workshop-specific configuration choices
- Agent persona / tone / style examples
- Pedagogical scaffolding

## Procedure

1. **Read the chapter directory** — all step files in order.

2. **Read relevant voice-agent code** — if the chapter discusses server behavior, read `voice-agent/handler.mjs`, `system-prompt.mjs`, `tools.mjs`. Specifically check: does the code in the voice-agent repo itself match current Twilio/OpenAI APIs?

3. **Extract every checkable claim** — quote the exact text + location.

4. **For each claim, verify via the right source:**
   - Product/framing claims → context7 for Twilio docs (`mcp__plugin_context7__resolve-library-id` for "twilio", then `query-docs`)
   - SDK/API signatures → context7 for the specific SDK
   - Recent behavior changes → WebSearch for "Twilio ConversationRelay [feature] changelog 2025" or similar
   - Schema/parameter details → WebFetch the Twilio OpenAPI spec or Conversation Relay reference page

5. **Assign a verdict per claim:**

   - **Match** — workshop correct (do NOT include in output, this is silent)
   - **Drift** — workshop outdated or wrong; fix needed. Must cite a specific source URL.
   - **Intentionally simplified** — workshop differs from docs but in a pedagogically defensible way (e.g., omits optional parameters to keep focus). Flag but don't call "wrong" — surface for user review.
   - **Ambiguous** — cannot determine from available sources. Flag for human.

6. **Conceptual framing check:** Beyond line-level claims, does the chapter's *overall explanation* of what a feature is match how Twilio officially describes it? Example: chapter says "Conversation Relay is a WebSocket connection" but official framing is "Conversation Relay is a Twilio feature that relays audio over WebSocket"; flag if the framing materially misleads.

## Output format

**Hard limit: 400 words total.**

```markdown
## Chapter {N} — Fact-check findings

**Claims checked:** {count}
**Matches (silent):** {count}
**Drift:** {count}
**Intentionally simplified:** {count}
**Ambiguous:** {count}

### Findings

#### [C{N}-S-01] {one-line title}

- **Location:** `src/content/chapter-{N}/step-{X}-{slug}.ts` block index {i}
- **Severity:** High
- **Dimensions:** ACCURACY
- **Audience:** Both (or Builder if only in a code block)
- **ID prefix guide:** Use `C{N}-S-NN` when the issue affects shared content or both audiences. Use `C{N}-B-NN` if only in a Builder-only code block. Use `C{N}-E-NN` if only affects Explorer content.
- **Workshop says:** "{exact quote}"
- **Source says:** "{quote from source or summary}"
- **Verdict:** Drift
- **Source URL:** https://... (REQUIRED for Drift)
- **Issue:** {1-3 sentences — why it matters}
- **Options:**
  - A) Update workshop text to "{exact replacement}" — trade-off: minor rewrite
  - B) Keep as-is and add a "version note" callout — trade-off: adds clutter
  - C) skip — only if the drift is trivial (e.g., synonym)

### Fact-check log entries (for report's Fact-Check Log section)

| Location | Workshop says | Source says | Verdict | URL |
|---|---|---|---|---|
| {path:block} | {brief} | {brief} | Match | — |
```

## Rules

- Every **Drift** verdict requires a source URL — no exceptions
- **Matches** do NOT become findings, but DO appear in the fact-check log table with verdict "Match"
- Scope includes both chapter-shown code AND `voice-agent/` repo code
- If a claim in the chapter is correct but the corresponding code in `voice-agent/` is stale (or vice versa), that's TWO findings (one for chapter, one for repo) — tag with different locations
- When user memory and live docs conflict (e.g., memory says `gpt-5.4-nano`, docs say `gpt-5`), trust the user memory's preferred name for the workshop itself but note the docs discrepancy
- Stay under 400 words total output
````

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/phases/02-factcheck.md
grep -c "Drift\|Match\|Ambiguous" .claude/audit/phases/02-factcheck.md
```

Expected: ≥80 lines, verdict terms appear multiple times.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/phases/02-factcheck.md
git commit -m "feat: add fact-check phase instructions"
```

---

## Task 9: Write static audit phase instructions

**Files:**
- Create: `.claude/audit/phases/03-static-audit.md`

- [ ] **Step 1: Write the file**

````markdown
# Phase 3 — Static Audit Instructions

You are a workshop-audit subagent running the **static audit phase**. You read one full track (Builder OR Explorer) across all 6 chapters and evaluate structure, flow, pacing, and audience-fit.

## Inputs you receive

- `TRACK` — "builder" or "explorer"
- `CONTENT_ROOT` — full path to `src/content/`
- `WORKSHOP_CONFIG_PATH` — full path to `src/workshop.config.ts`
- `SEVERITY_RUBRIC_PATH` — full path to severity rubric

## What to do

1. **Read the workshop config** — get chapter order, titles, step slugs.

2. **Read ALL 6 chapters' content** — every step file in order.

3. **Filter blocks** per your track:
   - Builder: include `audience: "builder"` + shared blocks
   - Explorer: include `audience: "explorer"` + shared blocks, skip builder-only

4. **Evaluate across the full sequence** — you are looking at the forest, not the trees.

## Dimensions you evaluate

### Sequence
- Does chapter order make sense for this audience?
- Does setup happen before the step that depends on it?
- Does any chapter require something not yet introduced?

### Repetition
- Is any concept re-introduced when a prior chapter already covered it sufficiently?
- Is helpful repetition present where needed (e.g., a reminder of a concept used again after a gap)?

### Pacing
- Walls of text that skimmers will blow past?
- Thin spots where detail is too sparse?
- Chapter-length balance — does one chapter feel much longer/shorter than its duration promise?

### Consistency
- Does Ch3 claim something that Ch5 contradicts?
- Does a concept drift between chapters (definition changes, name changes, scope changes)?
- Does a widget's behavior in Ch3 not match what Ch5 assumes?

### Skimmer risk
- Are load-bearing ideas in headings and first sentences?
- Would a fast reader lose the plot?
- Are there paragraphs where the important fact is buried in the middle?

### Audience-fit across the whole track (critical for Explorer)
- Does the Explorer track stay non-technical throughout, or does Ch4 slip into Builder mode?
- Does the Builder track assume a consistent skill level, or does Ch1 over-explain while Ch5 assumes senior fluency?

### Hype/marketing language
- Dramatic staccato: "Not a phone tree. Not a recording."
- Superlatives: "truly multilingual", "dramatically simpler", "genuinely natural"
- Congratulatory filler: "Congratulations — you just..."
- Flag all instances. Severity: Medium + AUDIENCE per auto-severity rules.

### Emoji usage
- Any emoji in user-facing text (not code). Should be replaced with Twilio brand icons.
- Severity: Low + AUDIENCE.

### Hard rule (Explorer track only)
- If the Explorer track has a block that reads like Builder-minus-code, flag as Critical + AUDIENCE even if the block is well-written on its own.

## What you do NOT do

- Individual typos or single awkward sentences (simulation / low-polish territory)
- Code correctness (fact-check's job)
- Factual accuracy (fact-check's job)
- Persona-specific reactions (simulation's job)

## Output format

**Hard limit: 800 words total.**

```markdown
## {Builder|Explorer} track — Static audit findings

**Chapters reviewed:** 6
**Findings:** {count}

### Cross-chapter findings (ID prefix CX-)

#### [CX-01] {one-line title}

- **Location:** spans ch3/step-2 and ch5/step-4
- **Severity:** High
- **Dimensions:** FLOW
- **Audience:** {track}
- **Issue:** {2-4 sentences}
- **Options:** A/B/C as per schema

### Per-chapter findings (static audit only — sequence/pacing/etc.)

#### Chapter 2 — First Contact

#### [C2-B-01] {one-line title}
...

[group by chapter]

### Language/emoji findings

#### [C{N}-{track}-XX] Hype language in ch{N}/step-{X}
- **Severity:** Medium
- **Dimensions:** AUDIENCE
- **Quote:** "{exact text}"
- **Options:** A) Replace with factual phrasing; B) remove entirely

[repeat per instance]
```

## Rules

- Use `CX-NN` IDs for cross-chapter findings
- Use `C{N}-{B|E}-NN` for findings confined to one chapter
- You can repeat findings the simulation phase might have caught — the merge phase will dedupe
- Stay under 800 words total output
- If you find nothing in a category, skip that subsection entirely — do not write "no findings"
````

- [ ] **Step 2: Verify**

```bash
wc -l .claude/audit/phases/03-static-audit.md
grep -c "chapter" .claude/audit/phases/03-static-audit.md
```

Expected: ≥90 lines, multiple "chapter" references.

- [ ] **Step 3: Commit**

```bash
git add .claude/audit/phases/03-static-audit.md
git commit -m "feat: add static audit phase instructions"
```

---

## Part 2 complete

After Task 9, you have all three phase instruction files. **Next:** Continue to Part 3 (`2026-04-21-workshop-audit-command-part3.md`) which creates the orchestrator slash command and runs verification.
