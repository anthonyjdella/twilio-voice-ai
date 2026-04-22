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
