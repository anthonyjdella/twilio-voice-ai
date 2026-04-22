# Workshop Audit — Usage

This directory contains everything `/audit-workshop` needs to run a production-grade audit of the voice AI workshop.

## Running the audit

1. Open a fresh Claude Code session in the `twilio-voice-ai/` repo root.
2. Type: `/audit-workshop`
3. Claude will read the supporting files, verify MCP tools, and print a cost warning. Reply `yes` to run, `no` to abort.
4. The full audit runs 20 parallel subagents across 3 phases (~3-15 minutes depending on network speed).
5. Output lands at `docs/audits/YYYY-MM-DD-workshop-audit.md`.

## Recommended verification sequence (first-time use)

### Step 1 — Phase 0 dry-run

Purpose: confirm the command's setup steps work without committing to a full run.

```
/audit-workshop
```

When the cost warning appears, reply `no`. Claude should exit cleanly.

**What to watch for:**
- Did it read all 8 supporting files?
- Did it confirm 6 chapters from `src/workshop.config.ts`?
- Did it print the cost warning exactly as specified?
- Did it exit on `no` without dispatching subagents?

If any of these fail, tell the main conversation — the orchestrator or a supporting file needs adjustment.

### Step 2 — Single-chapter smoke test

Purpose: verify one simulation subagent produces good output before running 20.

Instead of `/audit-workshop`, in a fresh session type:

```
Dispatch one Agent with subagent_type=general-purpose and model=opus, with this exact prompt:

---
You are running the simulation phase of a workshop audit.

REQUIRED READING (in order):
1. Read: .claude/audit/phases/01-simulate.md
2. Read: .claude/audit/personas/builder.md
3. Read: .claude/audit/severity-rubric.md

INPUTS:
- CHAPTER_NUMBER: 1
- CHAPTER_DIR: src/content/chapter-1/
- VOICE_AGENT_DIR: voice-agent/
- COMPONENTS_DIR: src/components/
- WORKSHOP_CONFIG_PATH: src/workshop.config.ts

Execute the simulation per the phase instructions. Hard limit 500 words.
---

Report back what the subagent returns.
```

**What to watch for in the output:**
- `## Chapter 1 — Builder simulation findings` heading
- Each finding has `[C1-B-NN]` ID, location with file path + block index, severity, dimensions, issue in persona voice, 2-3 options
- Findings sound like a junior dev reacting, not an expert auditor
- Under 500 words

If quality is off, adjust `.claude/audit/phases/01-simulate.md` or `.claude/audit/personas/builder.md` and re-test.

### Step 3 — Full audit

When Steps 1-2 look good:

```
/audit-workshop
```

Reply `yes`. Wait for completion (3-15 minutes).

Open `docs/audits/YYYY-MM-DD-workshop-audit.md`. Success criteria:

1. Exec summary gives you a useful 30-second read
2. Critical findings are genuinely critical
3. Every `Drift` fact-check verdict has a URL
4. Explorer findings differ meaningfully from Builder findings

## Iterating between runs

Edit any file in `.claude/audit/` and re-run. No need to touch `.claude/commands/audit-workshop.md` unless the orchestration itself is wrong.

- Tighten a persona? Edit `personas/builder.md` or `personas/explorer.md`.
- Adjust severity? Edit `severity-rubric.md`.
- Change report shape? Edit `output-schema.md`.
- Adjust what a phase looks for? Edit the matching `phases/0N-*.md`.

Running the command twice on the same day appends `-2`, `-3` to the output filename so you can compare runs.

## Known small issues

- Memory preference list in the orchestrator mentions `gpt-5.4-nano` as the correct model, but the auto-severity rule for `gpt-4o` / `gpt-4o-mini` doesn't explicitly pair them. Subagents should still resolve this correctly via the rubric.
- The `subagent_type: general-purpose` hint appears inside each subagent's prompt. It's for the dispatcher, not the subagent. Harmless in practice.

## Files in this directory

- `personas/builder.md` — Builder persona behavioral rules
- `personas/explorer.md` — Explorer persona behavioral rules
- `phases/01-simulate.md` — Simulation phase instructions (given to 12 subagents)
- `phases/02-factcheck.md` — Fact-check phase instructions (given to 6 subagents)
- `phases/03-static-audit.md` — Static audit phase instructions (given to 2 subagents)
- `severity-rubric.md` — Severity levels and dimension tags
- `output-schema.md` — Final report template
- `chart-reference.md` — Cross-reference rules for the prior 25-item audit chart
