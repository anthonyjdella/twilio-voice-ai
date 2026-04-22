# Workshop Audit — Run 4 (Final)

**Date:** 2026-04-22
**Scope:** All 6 chapters, both tracks (Builder + Explorer), voice-agent reference code, widgets
**Prior audits referenced:** Run 1 (`2026-04-21-...md`), Run 2 (`2026-04-22-...md`), Run 3 (`2026-04-22-...-3.md`)
**Prior chart:** `~/.claude/projects/-Users-adellavecchia-Desktop-Git-Projects/memory/project_voice_ai_audit.md`
**Subagent runs:** 12 simulation + 6 fact-check + 2 static = 20 parallel
**Fact-check grounding:** `mcp__twilio-docs__twilio__*` (MCP), WebSearch, WebFetch
**Framing reminders applied in merge:**
- Workshop model is `gpt-5.4-nano` (not gpt-4o)
- Attendees edit `workshop/server.js` (CJS). `voice-agent/*.mjs` is reference-only, never shown.
- Ch6 Step 2 (Deploy) is aspirational — functional-severity demotions where Twilio side won't block
- Explorer is observer track (no imperative code instructions)
- No hype/marketing prose — social-share templates excepted
- Emojis OK inside code/log examples; avoid in prose

---

## Counts

**Post-walkthrough totals:**
- Fixed: 13 (C1-E-01, C3-E-01, CX-B-03, CX-B-04, CX-E-01, C1-B-01, C2-B-02, CX-B-01, C3-B-02, C4-B-01, C4-B-02, C4-E-01, C5-B-01, C6-B-01, C6-B-02)
- Resolved incidentally: 1 (C5-B-03 via CX-B-03)
- Skipped (low severity, low leverage): 3 (CX-B-02, C5-E-01, C6-E-01)
- Withdrawn (false positives): 6 (C2-B-01, C2-B-03, C3-B-01, C5-B-02, CX-01, CX-02)

Raw subagent output: 22 findings. Actual actionable: 14. False-positive rate: 27% — higher than Run 3, concentrated in Ch2 Builder simulation (3) and cross-chapter/fact-check outputs (3).

## Executive Summary — The 5 Findings Most Likely to Bite in a Live Room

1. **[C1-E-01] Ch1/step-5 has zero Explorer content** — Critical AUDIENCE. Step exits with Builders only; Explorers sit through a code-heavy close. *Fix: add an `audience: "explorer"` recap block or split the step.* Found by: Explorer sim Ch1, Static Explorer CX-02.
2. **[C3-E-01] Ch3/step-5 terminal restart block reads as imperative to Explorers** — Critical AUDIENCE. Shared (no audience) terminal + "run this" prose violates the observer contract. *Fix: tag terminal `audience: "builder"` and add Explorer observer prose.* Found by: Explorer sim Ch3, Static Explorer CX-01.
3. **[CX-B-03] Ch5 is ~1.8x the length of Ch4; step-5 test script alone is ~700 words** — High PACING. In a 90-minute workshop, Ch5 eats the Q&A buffer. *Fix: move Test 3 (multi-tool) + Test 4 (joke) to an optional expandable section.* Found by: Static Builder CX-03.
4. **[CX-B-04] `streamResponse` is refactored three times across Ch5 (steps 2, 3, 4) without a landmark to anchor returning Builders** — High PACING/CLARITY. Attendees who fall behind can't locate "where am I in the file." *Fix: add a one-line "you are replacing the streamResponse from step N" preamble to each refactor block.* Found by: Static Builder CX-04.
5. **[CX-E-01] Ch2 is thin for Explorers** — High AUDIENCE. Ratio of Explorer-to-Builder wordcount is ~0.25 in Ch2 vs. ~0.45 in Ch3/Ch4. *Fix: add one concept-card per step explaining "what just happened" for Explorers.* Found by: Static Explorer CX-01.

---

## Findings by Chapter

### Chapter 1 — Mission Briefing

**[C1-E-01] Ch1/step-5 has no Explorer blocks** | Critical | AUDIENCE | audience: explorer
- Location: `src/content/chapter-1/step-5-*.ts`
- Issue: Every block is either shared or Builder; Explorers get a Builder-code-heavy closer with no observer recap.
- Options:
  - A. Add a final `concept-card` + `prose` pair (audience: explorer) recapping "what you saw in Ch1."
  - B. Split the step into builder-close + explorer-close sections.
  - C. Move the Explorer recap currently trailing Ch2/step-1 forward into Ch1/step-5.
- Found by: Explorer sim Ch1, Static Explorer CX-02
- Chart ref: new

**[C1-B-01] Ch1/step-4 forward-references `/ws` path before Ch2 introduces the WebSocket** | Medium | CLARITY | audience: builder
- Location: `src/content/chapter-1/step-4-*.ts`
- Issue: First mention of `/ws` appears mid-sentence with no "you'll build this in Ch2" aside.
- Options:
  - A. Add a one-line "Ch2 builds the `/ws` handler — this is just the map."
  - B. Leave it; experienced Builders should cope.
- Found by: Builder sim Ch1
- Chart ref: new

---

### Chapter 2 — First Contact

**[C2-B-01] ~~Setup `json-message` direction drift~~** | **WITHDRAWN** — false positive
- Re-verified against `src/content/chapter-2/step-1-websocket-server.ts:109-125` and `twilio-docs` MCP (ConversationRelay WebSocket messages page).
- The widget's `direction: "inbound"` field is already correct (Twilio→server). The `"direction": "outbound"` *inside* the JSON payload is the `Call.direction` field — correct because the workshop's Call-Me flow API-initiates outbound calls. Two different "direction" fields at different semantic layers.
- Fact-check subagent conflated them. No fix needed.

**[C2-B-02] Step 3 drops the `👤 From:` log line that earlier steps rely on** | Medium | FUNCTIONAL | audience: builder
- Location: `src/content/chapter-2/step-3-*.ts` code block
- Issue: Earlier step's console.log pattern is missing from Step 3's code sample; Builders copying the sample lose the log.
- Options:
  - A. Restore the log line in the Step 3 code block.
  - B. Add a callout "Step 3 intentionally trims logs — re-add if you want visibility."
- Found by: Builder sim Ch2
- Chart ref: new

**[C2-B-03] ~~`streamLLMResponse` replacement block lacks startLine / anchor~~** | **WITHDRAWN** — over-reported
- Re-verified against `src/content/chapter-2/step-4-stream-response.ts`. The block already has `startLine: 60`, an evolution callout at L128 that narrates the refactor chain through Ch4/Ch5, and a landmark instruction ("look for the `// TODO: Send to LLM and stream response back` comment from Step 3") at L195. Landmarks are adequate. No fix needed.

**[CX-B-01] Ch2 deep-dive repeats the Ch1 call-flow diagram narrative** | Low | PACING | audience: builder
- Location: Ch2 deep-dive block
- Issue: Duplicate framing from Ch1.
- Options:
  - A. Trim to 1-2 sentences, cross-link Ch1.
  - B. Leave (reinforcement may be valuable).
- Found by: Static Builder CX-01
- Chart ref: new

**[CX-E-01] Ch2 is thin for Explorers compared to Builders** | High | AUDIENCE | audience: explorer
- Location: `src/content/chapter-2/`
- Issue: Ratio of Explorer to Builder word count is ~0.25 here vs. ~0.45 in Ch3/Ch4. Explorers skim the chapter without a landing point.
- Options:
  - A. Add one concept-card per step explaining "what just happened" for Explorers.
  - B. Promote one Builder prose block to shared where the content is non-technical.
  - C. Leave; Ch2 is inherently technical.
- Found by: Static Explorer CX-01
- Chart ref: overlaps with Run 3 Skipped item on Ch2 Explorer density

---

### Chapter 3 — Identity

**[C3-E-01] Ch3/step-5 terminal + "run this" prose reads as imperative to Explorers** | Critical | AUDIENCE | audience: explorer
- Location: `src/content/chapter-3/step-5-*.ts`
- Issue: A shared (audience-unset) terminal block plus "restart your server" prose tells Explorers to do a thing they cannot do.
- Options:
  - A. Tag terminal `audience: "builder"` and add an Explorer-only observer prose block ("the Builder next to you is restarting their server; here's why").
  - B. Split the step into builder-only + explorer-only halves.
- Found by: Explorer sim Ch3, Static Explorer CX-01
- Chart ref: new

**[C3-B-01] ~~Ch3 intro assumes Ch2 code state~~** | **WITHDRAWN** — false positive
- Re-verified: every `prose` block in Ch3/step-1 is already Builder-tagged. The subagent's quoted phrase ("the server you built last chapter") does not exist in Ch3. Ch3 Ch2-dependent references (step-3, step-5) are all Builder-tagged, so Explorers never see them. No leak.

**[C3-B-02] `<your-server-host>` placeholder used without a "replace this with $CODESPACE_NAME-8080.app.github.dev" hint** | Medium | FUNCTIONAL | audience: builder
- Location: Ch3 TwiML block
- Issue: Builders who copy verbatim get a broken URL.
- Options:
  - A. Add a callout immediately above showing the Codespace URL shape.
  - B. Use a concrete example in the code sample with a comment.
- Found by: Builder sim Ch3
- Chart ref: overlaps with Run 2 Done (added for Ch5)

---

### Chapter 4 — Reflexes

**[C4-B-01] Step 3 solution code drops `interruptSensitivity` though earlier blocks set it** | High | FUNCTIONAL | audience: builder
- Location: `src/content/chapter-4/step-3-*.ts` solution
- Issue: Solution silently omits an attribute the chapter introduces; Builders copying the solution lose the setting.
- MCP source: `interruptSensitivity` is a documented attribute (confirmed via `twilio-docs` retrieve).
- Options:
  - A. Restore `interruptSensitivity="high"` in the solution block.
  - B. Add a comment "we dropped interruptSensitivity here because default is `high`."
- Found by: Builder sim Ch4
- Chart ref: new

**[C4-B-02] DTMF snippet omits `welcomeGreeting` so the copied TwiML loses the greeting** | Medium | FUNCTIONAL | audience: builder
- Location: Ch4 DTMF section
- Options:
  - A. Include `welcomeGreeting` in the DTMF code block to match prior chapter state.
  - B. Prose aside: "keep your existing greeting — only the new attribute is shown."
- Found by: Builder sim Ch4
- Chart ref: new

**[C4-E-01] Language-switch step is thin for Explorers** | Medium | AUDIENCE | audience: explorer
- Location: `src/content/chapter-4/step-*-language.ts`
- Options:
  - A. Add a short Explorer concept-card explaining the caller experience.
  - B. Leave.
- Found by: Static Explorer C4-E-01
- Chart ref: new

**[CX-B-02] Ch4 language-switch step crowded** | Low | PACING | audience: builder | **SKIPPED**
- Ch5 (CX-B-03) handles the real pacing risk. Ch4/step-4 splits would break prior-chart references and the 5-step chapter shape. Low severity + low leverage = skip.

---

### Chapter 5 — Superpowers

**[CX-B-03] Ch5 is ~1.8x Ch4 length; step-5 alone is ~700 words of test script** | High | PACING | audience: builder
- Location: Ch5 overall, especially `step-5-test-superpowers.ts`
- Options:
  - A. Move Test 3 (multi-tool) + Test 4 (joke) to an optional/expandable block.
  - B. Cut the triple-option troubleshooting list down to one path per failure.
  - C. Split Ch5 into two chapters (rejected — would break Ch6 numbering).
- Found by: Static Builder CX-03, Builder sim Ch5
- Chart ref: new

**[CX-B-04] `streamResponse` refactored 3x across Ch5 (steps 2, 3, 4) without anchor** | High | PACING | audience: builder
- Location: Ch5 steps 2, 3, 4
- Options:
  - A. Add a "replaces the streamResponse from step N" preamble to each refactor block.
  - B. Add `highlight` ranges showing what changed.
  - C. Add a final "consolidated streamResponse" solution block.
- Found by: Static Builder CX-04
- Chart ref: new

**[C5-B-01] Step 4 TwiML silently introduces `voice` + `ttsProvider` attributes** | Medium | CLARITY | audience: builder
- Location: Ch5/step-4 TwiML code block
- Options:
  - A. Add a comment at the top listing what's new vs. Ch4.
  - B. Use `highlight: [lines]` on the new attributes.
- Found by: Builder sim Ch5
- Chart ref: new

**[C5-B-02] ~~"Two passes" prose/code mismatch~~** | **WITHDRAWN** — false positive
- Only occurrence of "two passes" in Ch5 is at `step-2-define-tools.ts:57` and refers to building the `tool-handlers.js` **file** in two passes (schema first, handlers second), not to LLM call iterations. The finding appears hallucinated — no prose in Ch5 claims "two passes through the LLM."

**[C5-B-03] Mock weather missing "Tokyo"** | Low | FUNCTIONAL | audience: builder | **RESOLVED via CX-B-03**
- Addressed incidentally when CX-B-03 moved the multi-tool test into a `deep-dive` and replaced the Tokyo example with Seattle. No more Tokyo references in `src/content/chapter-5/`. Workshop mockWeather (Austin/NY/Seattle) now matches all test examples.

**[C5-E-01] HandoffToggle caveats span several paragraphs** | Low | AUDIENCE | audience: explorer | **SKIPPED**
- Three text bands (intro / button-state / "Try it both ways") look wordy when read together but serve distinct UX roles when skimmed. Trimming degrades one of those uses. Low severity + intentional surface area = skip.

---

### Chapter 6 — Launch

**[C6-B-01] Deploy step `.env` list omits `TWILIO_PHONE_NUMBER` / Codespace-specific vars** | Medium | FUNCTIONAL | audience: builder
- Location: `src/content/chapter-6/step-2-deploy.ts`
- Note: Demoted from Critical because Ch6 Step 2 is aspirational and not executed live; still a real content gap.
- Options:
  - A. Add missing env vars to the example.
  - B. Add a callout "these are workshop-only — production deploys need X, Y, Z."
- Found by: Builder sim Ch6
- Chart ref: overlaps with Run 2 Skipped #14 (aspirational step)

**[C6-B-02] WebSocket URL update instruction is ambiguous in the deploy flow** | Medium | CLARITY | audience: builder
- Location: Ch6/step-2
- Options:
  - A. Spell out "change `wss://<codespace>-8080.app.github.dev` to `wss://<your-deploy>.example.com`."
  - B. Show a before/after code diff.
- Found by: Builder sim Ch6
- Chart ref: new

**[C6-E-01] SSML section lacks Explorer-tagged block** | Low | AUDIENCE | audience: explorer | **SKIPPED**
- Shared prose under SSML reads in observer voice already ("an agent can control exactly how it speaks"). End-of-step Explorer concept-card recaps all five "what's next" topics including SSML. Low severity + good existing coverage.

<!-- original finding kept below for traceability -->
- Location: `src/content/chapter-6/step-4-next-steps.ts`
- Verified against current file: SSML section has no `audience: "explorer"` block; prose is shared. Explorer-tagged concept-card at end of step recaps "what you can build next" but SSML itself has no observer framing.
- Options:
  - A. Add a one-sentence Explorer prose block under the SSML section ("Builders control exactly how the voice speaks — pauses, pronunciation, spelling.").
  - B. Leave; the end-of-step Explorer concept-card already covers it at a high level.
- Found by: Explorer sim Ch6
- Chart ref: new

---

## Cross-Chapter Findings

**[CX-01] ~~Empty-token pattern inconsistency~~** | **WITHDRAWN** — false positive
- Grep across all 11 occurrences in Ch2/Ch4/Ch5 shows the exact same pattern: `sendText(ws, "", true)`. Uniform, no inconsistency.

**[CX-02] ~~Marketing tone in Ch6/step-1 polish intro~~** | **WITHDRAWN** — false positive
- Ch6/step-1 opening is already in plain, factual voice. Builder intro: "The agent works end to end. Before launch, a polishing pass makes it feel professional and reliable." Explorer concept-cards ("Polish is almost never a flashy feature") are measured. No promotional language.

---

## Fact-Check Log

| Chapter | Claim | Verdict | Source |
|---------|-------|---------|--------|
| Ch1 | Call flow diagram accuracy | Match | ConversationRelay overview (MCP) |
| Ch2 | `setup` message direction="outbound" | **Drift** | `twilio-docs` retrieve — setup is Twilio→server (inbound in workshop's convention) |
| Ch2 | WebSocket URL scheme `wss://` | Match | ConversationRelay docs |
| Ch3 | Deepgram smart format default | Intentionally simplified | Docs show `deepgramSmartFormat` default true for nova-3 |
| Ch3 | ElevenLabs Rachel "default" | Drift | ElevenLabs default voice ID `UgBBYS2sOqTuMpoF3BR0` (verified earlier run) |
| Ch4 | `interruptSensitivity` values | Match | `twilio-docs` retrieve — low/medium/high documented |
| Ch4 | `interruptible` values | Match | `twilio-docs` — none/dtmf/speech/any documented |
| Ch4 | `reportInputDuringAgentSpeech` default | Match | Default `none` since May 2025 |
| Ch5 | `HandoffData` PascalCase in action POST | Match | ConversationRelay docs |
| Ch5 | `reasonCode: "live-agent-handoff"` | Match | ConversationRelay handoff docs |
| Ch5 | `en-US-Chirp3-HD-Aoede` voice exists | Match | Chirp3-HD voice list |
| Ch6 | SSML phoneme restriction to en-US on ElevenLabs | Match | ConversationRelay TTS provider notes |
| Ch6 | `play` message `loop: 0` = up to 1000 | Match | WebSocket messages reference |
| Ch6 | `interruptible` + `preemptible` on `play` | Match | WebSocket messages reference |

## Phase Coverage

- Builder × Ch1: 2 findings
- Builder × Ch2: 3 findings (1 fact-check drift)
- Builder × Ch3: 3 findings
- Builder × Ch4: 2 findings
- Builder × Ch5: 3 findings
- Builder × Ch6: 2 findings
- Explorer × Ch1: 1 Critical
- Explorer × Ch2: 1 High (thin-for-explorer)
- Explorer × Ch3: 1 Critical
- Explorer × Ch4: 1 Medium
- Explorer × Ch5: 1 Low
- Explorer × Ch6: 1 Low
- Fact-check Ch1-Ch6: 1 drift (Ch2 direction), 2 intentionally-simplified, rest Match
- Static Builder: 4 cross-chapter findings (dedup'd into CX-01, CX-B-01..04)
- Static Explorer: 2 cross-chapter findings (dedup'd into C1-E-01, CX-E-01)

## Run Metadata

- Date: 2026-04-22
- Run: 4 (final, user-designated)
- Prior chart referenced: yes
- Prior audit reports in-tree: 3
- MCP fact-check grounding: `twilio-docs` server queried per Twilio attribute
- Known improvements over Run 3: zero false-positive `interruptible`/`interruptSensitivity` findings; `setup` direction drift surfaced
- Known limits: aspirational Ch6 Step 2 demoted from Critical; Render/deploy-side never executed

<!-- phase 0 complete 2026-04-22 -->
<!-- phase 1 complete 2026-04-22 -->
<!-- phase 2 complete 2026-04-22 -->
<!-- phase 3 complete 2026-04-22 -->
<!-- phase 4 complete 2026-04-22 -->
