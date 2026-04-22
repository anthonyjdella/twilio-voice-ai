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
