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
