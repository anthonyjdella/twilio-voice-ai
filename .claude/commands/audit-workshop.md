---
description: Full audit of the voice AI workshop — simulation, fact-check, and static review across both tracks
---

You are running `/audit-workshop`. Produce a production-grade audit of this workshop.

## Hard context

- Workshop config: `src/workshop.config.ts` (6 chapters defined)
- Content: `src/content/chapter-{1-6}/step-*.ts` (TypeScript block arrays, each step exports a `StepDefinition` with a `blocks` array; blocks have an optional `audience` field of `"builder"`, `"explorer"`, or undefined/shared)
- Voice agent code: `voice-agent/handler.mjs`, `voice-agent/system-prompt.mjs`, `voice-agent/tools.mjs`
- Widgets: `src/components/`
- Non-standard Next.js — consult `node_modules/next/dist/docs/` for framework-specific questions
- User memory preferences apply: no hype/marketing language, no emojis (use Twilio brand icons), Explorer is non-technical (observer language only), workshop model is `gpt-5.4-nano`, prior 25-item chart exists in `~/.claude/projects/-Users-adellavecchia-Desktop-Git-Projects/memory/project_voice_ai_audit.md`

## Phase 0 — Setup

1. Invoke the `superpowers:dispatching-parallel-agents` skill (you will use its pattern).

2. Read these supporting files in parallel:
   - `.claude/audit/personas/builder.md`
   - `.claude/audit/personas/explorer.md`
   - `.claude/audit/severity-rubric.md`
   - `.claude/audit/output-schema.md`
   - `.claude/audit/chart-reference.md`
   - `.claude/audit/phases/01-simulate.md`
   - `.claude/audit/phases/02-factcheck.md`
   - `.claude/audit/phases/03-static-audit.md`

3. Verify required MCP tools are available:
   - `mcp__plugin_context7__resolve-library-id`
   - `mcp__plugin_context7__query-docs`
   - `WebSearch`
   - `WebFetch`

   If any are missing, STOP and print: `ERROR: required MCP tool {name} not available; aborting audit.`

4. Read `src/workshop.config.ts` and build the chapter list (id, slug, title). Confirm 6 chapters. If fewer/more, print `ERROR: expected 6 chapters, found N; aborting audit.`

5. Read the user's prior chart at `~/.claude/projects/-Users-adellavecchia-Desktop-Git-Projects/memory/project_voice_ai_audit.md` if it exists. If not, proceed but note it in the final report.

6. Determine today's date (ISO YYYY-MM-DD) and output file path: `docs/audits/{date}-workshop-audit.md`. If that file exists, append `-2`, `-3`, etc. Create the `docs/audits/` directory if missing.

7. Print the cost warning to the user:
   ```
   Running workshop audit: 12 + 6 + 2 = 20 parallel subagents across 3 phases.
   Estimated tokens: significant (~200k-500k). Output: docs/audits/{date}-workshop-audit.md

   Proceed? (Say "yes" or "no")
   ```

8. **Wait for user confirmation before proceeding.** If the user says no or is unclear, stop.

## Phase 1 — Simulation (12 parallel subagents)

Dispatch all 12 subagents in a single message with 12 Agent tool calls (parallel).

For each subagent, the prompt template is:

```
You are running the simulation phase of a workshop audit.

REQUIRED READING (in order):
1. Read: .claude/audit/phases/01-simulate.md (your full instructions)
2. Read: {PERSONA_PATH} (your persona — embody it fully)
3. Read: .claude/audit/severity-rubric.md (finding vocabulary)

INPUTS:
- CHAPTER_NUMBER: {N}
- CHAPTER_DIR: src/content/chapter-{N}/
- VOICE_AGENT_DIR: voice-agent/
- COMPONENTS_DIR: src/components/
- WORKSHOP_CONFIG_PATH: src/workshop.config.ts

Execute the simulation per the phase instructions. Output findings in the format specified. Hard limit 500 words.

Do NOT read other chapters, do NOT read the prior audit chart, do NOT ask clarifying questions.
```

Variables per subagent:
- Builder × Ch1: PERSONA_PATH=`.claude/audit/personas/builder.md`, CHAPTER_NUMBER=1
- Builder × Ch2, Ch3, Ch4, Ch5, Ch6 (same pattern)
- Explorer × Ch1-Ch6 (PERSONA_PATH=`.claude/audit/personas/explorer.md`)

Use `subagent_type: general-purpose` for all 12.

Collect all 12 responses. If any fails, retry that one. If retry fails, record the failure in the output report and continue.

## Phase 2 — Fact-check (6 parallel subagents)

Dispatch all 6 in a single message.

Prompt template:

```
You are running the fact-check phase of a workshop audit.

REQUIRED READING:
1. Read: .claude/audit/phases/02-factcheck.md (your full instructions)
2. Read: .claude/audit/severity-rubric.md

INPUTS:
- CHAPTER_NUMBER: {N}
- CHAPTER_DIR: src/content/chapter-{N}/
- VOICE_AGENT_DIR: voice-agent/

TOOLS AVAILABLE: context7 (resolve-library-id, query-docs), WebSearch, WebFetch.

Execute fact-check per the phase instructions. Every Drift verdict must cite a source URL. Hard limit 400 words.
```

Variables: CHAPTER_NUMBER 1 through 6, same across all.

Use `subagent_type: general-purpose`.

Collect all 6 responses.

## Phase 3 — Static audit (2 parallel subagents)

Dispatch 2 in a single message.

Prompt template:

```
You are running the static audit phase of a workshop audit.

REQUIRED READING:
1. Read: .claude/audit/phases/03-static-audit.md (your full instructions)
2. Read: .claude/audit/severity-rubric.md

INPUTS:
- TRACK: {builder|explorer}
- CONTENT_ROOT: src/content/
- WORKSHOP_CONFIG_PATH: src/workshop.config.ts

Read all 6 chapters' content filtered to your track. Evaluate per the phase instructions. Hard limit 800 words.
```

Dispatch one with TRACK=builder, one with TRACK=explorer.

Use `subagent_type: general-purpose`.

Collect both responses.

## Phase 4 — Merge (main Claude, no subagents)

1. You now hold 20 subagent responses (12 simulation + 6 fact-check + 2 static).

2. **Normalize findings into a single list.** For each finding from every subagent:
   - Keep the ID if present, otherwise assign one per the schema (C{N}-{B|E|S}-NN or CX-NN)
   - Preserve: location, severity, dimensions, audience, issue, options
   - Add `Found by:` list (which subagents/phases surfaced it)

3. **Deduplicate.** If two findings describe the same underlying issue (same file, same block, same root cause):
   - Merge them into one finding
   - Union the `Dimensions` and `Audience` fields
   - Set `Found by: multiple` with the list of contributing phases
   - Use the higher severity if they disagree

4. **Apply auto-severity rules** from the rubric (check every finding):
   - Explorer block reads like Builder-minus-code → upgrade to Critical + AUDIENCE
   - Hype/marketing language → Medium + AUDIENCE
   - Emoji in user-facing content → Low + AUDIENCE
   - `gpt-4o` or `gpt-4o-mini` reference → High + ACCURACY

5. **Cross-reference the prior chart.** For each finding, compare against the 25-item chart:
   - If not mentioned → `Chart ref: new`
   - If overlaps a Done item → `Chart ref: overlaps with #N Done`
   - If overlaps a Skipped item → `Chart ref: overlaps with #N Skipped`

6. **Build the executive summary** — the 5 findings most likely to kill the workshop in a live room. Prioritize: Critical FUNCTIONAL > Critical AUDIENCE > High FUNCTIONAL > High ACCURACY > High AUDIENCE. Tie-break by audience impact breadth (Both > single-track).

7. **Write the output file** following the output-schema.md template exactly:
   - Header with date, counts
   - Executive Summary (5 items)
   - Findings by Chapter (Ch1 through Ch6, each with its findings)
   - Cross-Chapter Findings
   - Fact-Check Log (table of all Drift / Intentionally simplified / Ambiguous, plus a sampling of Matches)
   - Phase Coverage (1-line summary per subagent)
   - Run Metadata (date, version, prior chart referenced, re-run count)

8. **Print the 3-line summary to the user:**
   ```
   Audit complete. {N} findings ({C} Critical, {H} High, {M} Medium, {L} Low).
   Report: docs/audits/{date}-workshop-audit.md
   Top critical: [{first critical finding ID}] {first critical title}
   ```

## Failure handling

- If a Phase-1 subagent fails: retry once. If still fails, include in report with `Subagent failed — chapter not audited by persona X`. Do not abort overall.
- If a Phase-2 subagent fails: same — retry, then record.
- If both Phase-3 subagents fail: abort with error (static audit is too critical to skip).
- If merge fails (e.g., context overflow while writing): save whatever partial report exists, print path to partial, ask user for guidance.

## Resume capability

If this file exists: `docs/audits/{date}-workshop-audit.md` AND contains a marker like `<!-- phase 1 complete -->`:
- Read the file, identify the last completed phase
- Skip completed phases; resume from the next one
- Preserve prior phase outputs

Write markers as you complete each phase:
- `<!-- phase 0 complete {timestamp} -->`
- `<!-- phase 1 complete {timestamp} -->`
- `<!-- phase 2 complete {timestamp} -->`
- `<!-- phase 3 complete {timestamp} -->`
- `<!-- phase 4 complete {timestamp} -->`

## Rules

- Never skip the cost warning gate
- Never read chapters yourself during Phases 1-3; delegate all reading to subagents
- Do read chapters in Phase 4 only if needed to clarify a finding's location for deduplication
- Apply user memory preferences (gpt-5.4-nano, no hype, no emojis, Explorer non-technical) when you judge severities in the merge
- Stay in explanatory output style if currently active, but don't let it leak into the subagent prompts
