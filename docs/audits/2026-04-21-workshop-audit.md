# Workshop Audit — 2026-04-21

**Workshop:** twilio-voice-ai
**Phases run:** Simulation (12 subagents), Fact-check (6 subagents), Static audit (2 subagents)
**Total findings:** 44
**Critical:** 6 | **High:** 13 | **Medium:** 19 | **Low:** 6

<!-- phase 0 complete 2026-04-21 -->
<!-- phase 1 complete 2026-04-21 -->
<!-- phase 2 complete 2026-04-21 -->
<!-- phase 3 complete 2026-04-21 -->

---

## Executive Summary

The 5 issues most likely to kill the workshop in a live room.

1. **[C3-S-01]** — ElevenLabs `voice="Rachel"` TwiML is invalid; the call will fail with an "invalid ttsProvider/voice" error as soon as a Builder swaps voices.
   - Location: `src/content/chapter-3/step-3-voice-selection.ts` + all Ch3 TwiML
   - Severity: Critical (escalated from High — breaks the call)
   - Dimensions: FUNCTIONAL, ACCURACY

2. **[C4-S-01]** — TwiML is missing `reportInputDuringAgentSpeech="any"`, so barge-in speech and DTMF-while-speaking never reach the server. Every "interrupt" and "keypad" test in Ch4 Step 5 fails silently.
   - Location: `src/content/chapter-4/step-1-interruptions.ts`, `step-2-dtmf.ts`
   - Severity: Critical (escalated from High — test fails)
   - Dimensions: FUNCTIONAL, ACCURACY

3. **[C5-B-01]** — Handoff implementation in Ch5 Step 4 (`transfer_to_agent` tool + `/call-ended` action) does not match the repo's `[HANDOFF]` marker in `voice-agent/handler.mjs`. Builders comparing chapter code to repo will not get consistent behavior.
   - Location: `src/content/chapter-5/step-4-handoff.ts` vs. `voice-agent/handler.mjs`
   - Severity: Critical
   - Dimensions: FUNCTIONAL, ACCURACY

4. **[C6-B-01]** — Every Ch6 polish/deploy snippet targets `server.js` with CJS `require(...)`, but the repo is `voice-agent/handler.mjs` with ESM `import`. Dockerfile `CMD` and Render start command will not boot the real agent.
   - Location: `src/content/chapter-6/step-1-polish.ts`, `step-2-deploy.ts`
   - Severity: Critical
   - Dimensions: FUNCTIONAL, FLOW

5. **[C2-B-01]** — `MY_PHONE_NUMBER` is stored at `workshop/.env` per the checklist, but `dotenv.config()` in every code snippet loads `./.env` from the repo root. First Call will 500 out.
   - Location: `src/content/chapter-2/step-5-first-call.ts`
   - Severity: Critical
   - Dimensions: FUNCTIONAL, FLOW

---

## Findings by Chapter

### Chapter 1 — Mission Briefing

- **[C1-B-01]** — Pre-Flight Checklist repeats port-public step already done above it
  - **Location:** `src/content/chapter-1/step-5-verify.ts` block index 19
  - **Severity:** High | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Future-tense checklist item 4 restates an action the Builder just performed on the same screen, causing re-reads and self-doubt right before the first call.
  - **Options:**
    - A) Rewrite item 4 as confirmation ("Port 8080 is Public — you set this above").
    - B) Move the Pre-Flight Checklist above the port instructions.
    - C) skip — not defensible.

- **[C1-B-02]** — `workshop/.env` referenced before the folder layout is introduced
  - **Location:** `src/content/chapter-1/step-4-setup.ts` blocks 6–7
  - **Severity:** Medium | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Builder is told to open `workshop/.env` without being shown the repo layout or confirmation that the file (not `.env.example`) exists.
  - **Options:** A) One-liner confirming the file exists in the Codespace. B) Add `ls workshop/` with expected output. C) skip.

- **[C1-B-03]** — Port 8080 assumed without introduction
  - **Location:** `src/content/chapter-1/step-5-verify.ts` blocks 4–11
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Port-forwarding instructions arrive before any statement that the server listens on 8080.
  - **Options:** A) One-line "server will listen on 8080." B) Defer port-forwarding to Ch2. C) skip.

- **[C1-S-01]** — STT provider swap list incorrectly includes Amazon
  - **Location:** `src/content/chapter-1/step-2-how-it-works.ts` block 22
  - **Severity:** High | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Issue:** Claim that STT can swap to Amazon is wrong; `transcriptionProvider` accepts only `Deepgram` or `Google`. Builder trying Amazon STT hits error 64107.
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Split sentence ("Google for STT; Google/Amazon for TTS"). B) Parenthetical ("Amazon — TTS only"). C) skip — not defensible.

- **[C1-S-02]** — "Under two seconds" round-trip latency claim
  - **Location:** `step-2-how-it-works.ts` block 7; `step-3-conversation-flow.ts` step 5
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Both
  - **Found by:** Fact-check | **Verdict:** Intentionally simplified | **Chart ref:** new
  - **Issue:** Twilio publishes no specific CR latency SLA. Reasonable pedagogical claim.
  - **Options:** A) Keep. B) Soften to "typically under two seconds." C) skip.

- **[C1-E-01]** — Shared step-2 prose drops "server" without framing
  - **Location:** `src/content/chapter-1/step-2-how-it-works.ts` block 11
  - **Severity:** Critical | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Shared prose reads as Builder-minus-code to the Explorer — "server" lands cold with no analogy. Auto-rule applies.
  - **Options:** A) Rewrite without "server" in shared prose. B) Split into audience-specific blocks. C) skip — not defensible.

- **[C1-E-02]** — Step-3 shared trace repeats "server" without ever defining it
  - **Location:** `src/content/chapter-1/step-3-conversation-flow.ts` block 1
  - **Severity:** High | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Explorer concept-card defining "the server." B) Rewrite shared prose using "the agent." C) skip.

- **[C1-E-03]** — Step 4 ends abruptly for Explorer
  - **Location:** `src/content/chapter-1/step-4-setup.ts` block 1
  - **Severity:** Medium | **Dimensions:** PACING, FLOW | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #14 Done (Ch1 reorder pulled Codespace launcher to Step 1; Step 4 is now a recap — possible regression if Explorer recap is too thin)
  - **Options:** A) Add explorer concept-card previewing next chapter. B) Merge step 4+5 for Explorer. C) skip.

- **[C1-E-04]** — Step 5 addresses "Builders" in third person
  - **Location:** `src/content/chapter-1/step-5-verify.ts` block 0
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #18 Done (Explorer concept-card was added; current finding is about the card's framing, not its absence)
  - **Options:** A) Rewrite in first-person-plural. B) Add explorer "what you're seeing" framer. C) skip.

### Chapter 2 — First Contact

- **[C2-B-01]** — `.env` path ambiguous; `dotenv.config()` doesn't match checklist
  - **Location:** `src/content/chapter-2/step-5-first-call.ts` block 6
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Checklist says `workshop/.env`; code snippets use default `dotenv.config()` loading `./.env`. First Call fails 500.
  - **Options:** A) Align path (pass `{ path: "workshop/.env" }` or move to `./.env`). B) Add explicit "create `server.js` and `.env` here" step. C) skip — not defensible.

- **[C2-B-02]** — Twilio/OpenAI env vars never introduced in this chapter
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts` block 12
  - **Severity:** High | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Add env-var callout in step 2. B) Link to chapter-1 setup. C) skip.

- **[C2-B-03]** — `startLine: 121` refactor hard to locate in Builder's accumulated file
  - **Location:** `src/content/chapter-2/step-4-stream-response.ts` block 15
  - **Severity:** High | **Dimensions:** FLOW, PACING | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Replace line-number anchor with "find `// TODO: Send to LLM` and replace the whole case." B) Show full updated case block. C) skip.

- **[C2-B-04]** — Emoji-heavy console.logs copy-pasted into Builder's code
  - **Location:** `src/content/chapter-2/step-1-websocket-server.ts` block 8 (and throughout)
  - **Severity:** Low | **Dimensions:** AUDIENCE | **Audience:** Builder (auto-rule: emoji → Low + AUDIENCE)
  - **Found by:** Simulation, Static audit | **Chart ref:** new
  - **Options:** A) Strip emoji. B) Keep but note decorative. C) skip.

- **[C2-S-01]** — `transcriptionProvider` default omits pre-2025-09-12 Google grandfathering
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts` (ttsProvider/transcriptionProvider prose)
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Append one-line caveat and set attribute explicitly. B) Version-note callout. C) skip.

- **[C2-S-02]** — Hype: "dramatically simpler than using Media Streams directly"
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts` deep-dive
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Both (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Replace with factual phrasing. B) Remove.

- **[C2-E-01]** — "ConversationRelay"/"TwiML" jargon in shared prose without analogy
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts` block 3
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Concept-card with translator analogy. B) Rename explorer heading. C) skip.

- **[C2-E-02]** — Step 5 Explorer path collapses 4 chapters of buildup into one sentence
  - **Location:** `src/content/chapter-2/step-5-first-call.ts` blocks 1–14
  - **Severity:** Medium | **Dimensions:** FLOW, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #9 Done (celebration/preview was replaced; current finding is about Explorer path specifically)
  - **Options:** A) Add Explorer recap before widget. B) Promote next-chapter prose above widget. C) skip.

- **[C2-E-03]** — Payoff prose buried under widget; no visual tying click to ringing
  - **Location:** `src/content/chapter-2/step-5-first-call.ts` block 15
  - **Severity:** High | **Dimensions:** PACING, AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Animated state indicator. B) Short callout "Your phone is ringing now". C) skip if widget renders live status.

### Chapter 3 — Identity

- **[C3-B-01]** — "Delete this line from Ch2" refactor instruction without a diff
  - **Location:** `src/content/chapter-3/step-1-system-prompt.ts` warning callout
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation, Static audit | **Chart ref:** new
  - **Options:** A) Explicit before/after diff. B) Full replacement block. C) skip — not defensible.

- **[C3-B-02]** — TwiML XML hardcodes `wss://your-codespace-8080...` while JS uses dynamic host
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts` blocks 12–13
  - **Severity:** High | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Use placeholder comment in XML. B) Show only JS template-literal. C) skip.

- **[C3-B-03]** — curl uses `<your-codespace-url>` without URL shape guidance
  - **Location:** `src/content/chapter-3/step-5-test-identity.ts` block 9
  - **Severity:** High | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Full example including `-8080.app.github.dev`. B) Point to Ports tab. C) skip.

- **[C3-B-04]** — Three near-identical `SYSTEM_PROMPT = ...` blocks in persona-builder
  - **Location:** `src/content/chapter-3/step-2-persona-builder.ts` blocks 6–8
  - **Severity:** Medium | **Dimensions:** PACING, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #7 Done (persona-builder trim) — possible regression
  - **Options:** A) Tabbed selector. B) Keep one code block, rest as prose.

- **[C3-B-05]** — Emoji in solution console.logs
  - **Location:** `src/content/chapter-3/step-1-system-prompt.ts` solution
  - **Severity:** Low | **Dimensions:** AUDIENCE | **Audience:** Builder (auto-rule)
  - **Found by:** Simulation | **Chart ref:** new

- **[C3-S-01]** — ElevenLabs `voice="Rachel"` is invalid — must be a voice ID
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts` and `step-4-language-config.ts` (all TwiML + solutions)
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Both
  - **Found by:** Fact-check | **Chart ref:** overlaps with #2 Done (voice-preview ElevenLabs tester link) — **possible regression**; the tester link was added, but the underlying TwiML still uses names
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Replace names with voice IDs; update tester copy guidance. B) Prominent callout "copy the voice ID, not the name." C) skip — not defensible, call will fail.

- **[C3-S-02]** — Amazon Polly voice values missing `-Neural` suffix
  - **Location:** `step-3-voice-selection.ts` "Popular Voices" prose
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay

- **[C3-S-03]** — `dtmfDetection="true"` is not a documented ConversationRelay attribute
  - **Location:** All Ch3 TwiML blocks (also Ch2, Ch4, Ch5)
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Remove. B) Replace with `interruptByDtmf`/`welcomeGreetingInterruptible`. C) skip if addressed later — it isn't.

- **[C3-E-01]** — "Match the voice to Ms. Chen / Jake" — personas Explorer never saw
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts` block 17
  - **Severity:** Medium | **Dimensions:** FLOW, AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Rewrite using preset names Explorer saw. B) Mark callout Builder-only. C) skip.

- **[C3-E-02]** — "Takes effect on the next call" surprises Explorer mid-troubleshoot
  - **Location:** `src/content/chapter-3/step-5-test-identity.ts` block 18
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Preflight callout above widget. B) Reframe bullets positively. C) skip.

- **[C3-E-03]** — External ElevenLabs Voice Tester detour
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts` block 16
  - **Severity:** Low | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #2 Done (ElevenLabs tester was the chosen option C) — working as intended; surfaced for reconsideration

- **[C3-E-04]** — "Supported Languages" card is a flat reference list
  - **Location:** `src/content/chapter-3/step-4-language-config.ts` shared card
  - **Severity:** Low | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #21 Skipped

### Chapter 4 — Reflexes

- **[C4-B-01]** — Step 1 partial snippet uses `sendText` but warning says "delete"
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts` block 13
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #22 Done (warning callout was moved/tightened; this is about the snippet body, not the callout placement)
  - **Options:** A) Note "keep existing sendText". B) Include `sendText` in partial with `// unchanged` comment. C) skip.

- **[C4-B-02]** — curl uses `<your-codespace-url>` with no port/scheme hint
  - **Location:** `src/content/chapter-4/step-5-test-reflexes.ts` block 7
  - **Severity:** High | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Write `<your-codespace>-8080.app.github.dev`. B) Point to Ports tab. C) skip.

- **[C4-B-03]** — Step 4 `processLLMResponse` partial drops Step-1 per-token behavior implicitly
  - **Location:** `src/content/chapter-4/step-4-language-switch.ts` block 12
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #1 Done (Ch4 Step 4 language wiring) — **possible regression**; additive-vs-replacement ambiguity remains
  - **Options:** A) Full `streamResponse` replacement with header. B) Warning callout mirroring Step 1. C) skip.

- **[C4-B-04]** — Silence code re-registers `wss.on("connection", …)`
  - **Location:** `src/content/chapter-4/step-3-silence.ts` block 12
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Diff-style comment. B) Full merged handler. C) skip.

- **[C4-B-05]** — `LANG_MARKER_REGEX` anchor differs from `voice-agent/handler.mjs`
  - **Location:** `src/content/chapter-4/step-4-language-switch.ts` block 12
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C4-S-01]** — Missing `reportInputDuringAgentSpeech="any"` — interrupt + DTMF-while-speaking tests silently fail
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts` and `step-2-dtmf.ts` TwiML blocks
  - **Severity:** Critical (escalated from High — breaks Step 5 tests) | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Issue:** Post-May-2025 default is `none`; barge-in speech and mid-TTS keypresses are not forwarded to the WebSocket. Step 5 Tests 1 and 2 rely on this.
  - **Options:** A) Add attribute to all CR TwiML. B) Add callout explaining the May 2025 default change. C) skip — not defensible.

- **[C4-S-02]** — Hype: "For truly multilingual agents…"
  - **Location:** `src/content/chapter-4/step-4-language-switch.ts` deep-dive
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Both (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

- **[C4-E-01]** — Shared Ch4 language-switch callout uses dramatic staccato
  - **Location:** `src/content/chapter-4/step-4-language-switch.ts` callout
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new
  - **Quote:** "Within seconds, the agent is listening in Spanish *and* responding in Spanish — no transfer, no menu, no 'press 2 for espanol.'"

- **[C4-E-02]** — Four single-concept Explorer steps feel list-like
  - **Location:** `src/content/chapter-4/step-1` through `step-4`
  - **Severity:** Medium | **Dimensions:** PACING, FLOW | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Merge steps 2+3. B) "Why these four together" framing block. C) skip.

- **[C4-E-03]** — Test prose assumes Builder context for Explorer
  - **Location:** `src/content/chapter-4/step-5-test-reflexes.ts` shared Test 1/3/4 prose
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Make shared tests Builder-only; give Explorer one consolidated block. B) Explorer Call-Me widget at top. C) skip.

### Chapter 5 — Superpowers

- **[C5-B-01]** — Handoff mechanism contradicts actual `voice-agent/handler.mjs`
  - **Location:** `src/content/chapter-5/step-4-handoff.ts` blocks 9, 12, 19 vs. `voice-agent/handler.mjs`
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #10 Done, #11 Done, #24 Done (handoff callout/tool description refined) — **possible regression**; those items refined the explanation but the mechanism itself still diverges from repo
  - **Options:** A) Rewrite Step 4 to match `[HANDOFF]` marker pattern. B) Update `handler.mjs` to tool-based pattern. C) skip — not defensible.

- **[C5-B-02]** — `require("./tool-handlers.js")` in an ESM repo
  - **Location:** `src/content/chapter-5/step-2-define-tools.ts`, `step-3-handle-tools.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Standardize on `.mjs`/import. B) Callout clarifying workshop `server.js` is separate from `voice-agent/handler.mjs`. C) skip.

- **[C5-B-03]** — `tool-picker`/`handoff-toggle` widget state wiring unverified
  - **Location:** `step-2-define-tools.ts` tool-picker; `step-4-handoff.ts` handoff-toggle
  - **Severity:** Medium | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-B-04]** — Parameter name mismatch: chapter `order_id` vs. repo `order_number`
  - **Location:** `step-2-define-tools.ts` and `voice-agent/tools.mjs`
  - **Severity:** High | **Dimensions:** ACCURACY, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-B-05]** — `tell_joke` tool in repo never mentioned in chapter
  - **Location:** `voice-agent/tools.mjs` vs. Ch5 Step 2
  - **Severity:** Medium | **Dimensions:** FLOW, ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-B-06]** — `node server.js` command — no `server.js` at repo root
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` terminal block
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-B-07]** — Speculative `info`/`TTS_DONE` message name
  - **Location:** `src/content/chapter-5/step-4-handoff.ts` warning callout after `transfer_to_agent` handler
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay (debug attribute)
  - **Options:** A) Replace with accurate `debug="speaker-events tokens-played"` guidance. B) Soften reference. C) skip.

- **[C5-B-08]** — `check_weather` handler ignores `unit` parameter
  - **Location:** `step-2-define-tools.ts` first handler block
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder | **Verdict:** Intentionally simplified
  - **Found by:** Fact-check | **Chart ref:** new

- **[C5-B-09]** — Hype: "your agent is no longer just a chatbot. It can take real actions, look up real data, and seamlessly hand off…"
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts`
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Builder (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

- **[C5-E-01]** — Sample order "ORD-12345" dropped on Explorer without framing
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` block 13/18
  - **Severity:** Medium | **Dimensions:** AUDIENCE, FLOW | **Audience:** Explorer
  - **Found by:** Simulation, Static audit | **Chart ref:** new

- **[C5-E-02]** — Explorer prose gives to-do instructions ("flip the toggle on")
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` blocks 22, 27
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-E-03]** — Step 3 "tool loop" concept-card has no anchoring analogy before gears image
  - **Location:** `src/content/chapter-5/step-3-handle-tools.ts` block 1
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new

- **[C5-E-04]** — `handoff-toggle` widget appears without cause/effect description
  - **Location:** `src/content/chapter-5/step-4-handoff.ts` block 10
  - **Severity:** High | **Dimensions:** AUDIENCE, FLOW | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new

### Chapter 6 — Launch

- **[C6-B-01]** — Polish/deploy target `server.js` CJS; repo is `handler.mjs` ESM
  - **Location:** `src/content/chapter-6/step-1-polish.ts`, `step-2-deploy.ts` (multiple blocks)
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Rewrite snippets to ESM `handler.mjs`. B) Callout explaining CJS↔ESM mapping. C) skip — not defensible.

- **[C6-B-02]** — `require("./tool-handlers.js")` in final solution without introduction
  - **Location:** `src/content/chapter-6/step-1-polish.ts` block 22
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C6-B-03]** — Render "point it to the repository" — which repo?
  - **Location:** `src/content/chapter-6/step-2-deploy.ts` block 14
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C6-B-04]** — `action="/call-ended"` introduced far from its handler
  - **Location:** `src/content/chapter-6/step-1-polish.ts` block 12 vs. block 22
  - **Severity:** Medium | **Dimensions:** FLOW, PACING | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new

- **[C6-B-05]** — Marketing framing: "The audience should think 'I want one of these'"
  - **Location:** `src/content/chapter-6/step-3-showcase.ts`
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Builder (auto-rule)
  - **Found by:** Static audit | **Chart ref:** overlaps with #15 Done (DemoScript tools-aware); the showcase content itself has lingering hype

- **[C6-S-01]** — `welcomeGreetingInterruptible` default misstated
  - **Location:** `src/content/chapter-6/step-1-polish.ts` block ~10
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder | **Verdict:** Intentionally simplified
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay

- **[C6-E-01]** — "Workshop environment isn't home" card heavy on jargon, thin on analogy
  - **Location:** `src/content/chapter-6/step-2-deploy.ts` block 3
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #5 Done (Ch6 Steps 1+2 Explorer blocks added) — possible regression in language, content now exists

- **[C6-E-02]** — Step 2 Explorer flow collapses to a single image
  - **Location:** `src/content/chapter-6/step-2-deploy.ts` block 2
  - **Severity:** Medium | **Dimensions:** PACING, AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #5 Done

- **[C6-E-03]** — Step 3 Explorer flow thin; no example demo in plain language
  - **Location:** `src/content/chapter-6/step-3-showcase.ts`
  - **Severity:** Medium | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new

- **[C6-E-04]** — Shared `play` message callout is builder reference material in an Explorer slot
  - **Location:** `src/content/chapter-6/step-4-next-steps.ts` block 21
  - **Severity:** High | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new

- **[C6-E-05]** — Step 4 "What's Next" Explorer content asymmetrically thin
  - **Location:** `src/content/chapter-6/step-4-next-steps.ts`
  - **Severity:** Low | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #25 Skipped

- **[C6-E-06]** — Hype: "A demo works once, on command, with a friendly audience. A product works on a bad phone line…"
  - **Location:** `src/content/chapter-6/step-1-polish.ts` "Line Between Demo and Product"
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

- **[C6-E-07]** — "Incredible hands-on session!" in LinkedIn share template
  - **Location:** `src/workshop.config.ts:176`
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Both (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

---

## Cross-Chapter Findings

- **[CX-01]** — `streamLLMResponse` → `streamResponse` refactor cascade (Ch2 → Ch4 → Ch5)
  - **Severity:** High | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** overlaps with #12 Done (Ch5 Step 3 delete-old-code checklist) and #22 Done (Ch4 Step 1 warning placement) — possible regression; upstream refactor chain still fragile
  - **Issue:** Three cascading "delete what you just pasted" pivots; high risk of duplicate functions for skim-readers.
  - **Options:** A) Ch2 forewarning + module-scope state earlier. B) Introduce AbortController in Ch2 so Ch4 is purely additive. C) Consolidate Ch4/Ch5 refactors into a single "Ch4 prelude."

- **[CX-02]** — System prompt drifts across Ch2/3/4/6 with no reconciliation
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Canonical prompt + optional persona swaps. B) Diff-style rev notes. C) Reminder callouts at each revision.

- **[CX-03]** — `welcomeGreeting` never updates with persona/voice
  - **Severity:** Low | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** new

- **[CX-04]** — DTMF "1" synthetic prompt hardcodes order-status topic across Ch4–Ch6
  - **Severity:** Medium | **Dimensions:** FLOW, AUDIENCE | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** overlaps with #16 Skipped (Ch4 Step 5 return policy test mismatch — related DTMF persona tension)

- **[CX-05]** — Architecture diagrams show "Tools" node in Ch1–Ch2 before tools are introduced
  - **Severity:** Medium | **Dimensions:** FLOW, PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new

- **[CX-06]** — Hype/staccato discipline uneven between Ch4 and Ch5 shared callouts
  - **Severity:** Low | **Dimensions:** FLOW | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new

- **[CX-07]** — Ch1 duration promise ("15 min") asymmetric for Explorer (≈3 min actual)
  - **Severity:** Medium | **Dimensions:** PACING, AUDIENCE | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #14 Done (Ch1 reorder) — regression check: reorder didn't rebalance Explorer pacing

---

## Fact-Check Log

| Claim location | Workshop says | Source says | Verdict | Source URL |
|---|---|---|---|---|
| ch1/step-2 b.22 | "Google and Amazon also supported" (STT+TTS) | Amazon not valid for STT | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch1/step-2 b.7; ch1/step-3 step 5 | "under two seconds" round-trip | No published SLA | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/best-practices |
| ch2/step-2 transcriptionProvider default | "Defaults to Deepgram" | Deepgram, or Google for pre-2025-09-12 accounts | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-3 popular-voices | `voice="Rachel"` for ElevenLabs | Voice attribute expects an ElevenLabs voice ID | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-3 popular-voices | Polly `Joanna` bare | Requires `Joanna-Neural` | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch2/ch3/ch4/ch5 TwiML | `dtmfDetection="true"` | Not a documented ConversationRelay attribute | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch4 TwiML | Omits `reportInputDuringAgentSpeech` | Default `none` since May 2025; interrupt/DTMF-during-speech silently dropped | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch4/step-2 `sendDigits` | Shows `"1234#"` | Also allows `w` | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch5/step-4 handoff timer | Speculative `info`/`TTS_DONE` message | Use `debug="speaker-events tokens-played"` | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch5/step-2 check_weather | Ignores `unit` param | Legal but schema declares it | Intentionally simplified | — |
| ch6/step-1 welcomeGreetingInterruptible | "`speech` is a good default" | Platform default is `any` | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| Sampling of Matches | CR TwiML verb/noun spelling, setup/prompt/interrupt/dtmf/error message shapes, `text`/`token`/`last` outbound shape, `ttsProvider`/`transcriptionProvider` values, `interruptSensitivity`, `language` message, `end` + `handoffData`, `<Connect action>` form-encoded `HandoffData`, `gpt-5.4-nano` model, SSML `<phoneme>` en-US only, `play.loop=0` → 1000 max, `hints` attribute, error inbound schema | All confirmed | Match | Twilio ConversationRelay docs |

---

## Phase Coverage

### Simulation (12 subagents)

- Ch1 Builder: 3 findings; biggest = Pre-Flight Checklist repeats already-done port-public step.
- Ch1 Explorer: 4 findings; biggest = shared "server" jargon in step-2 reads as Builder-minus-code (Critical).
- Ch2 Builder: 4 findings; biggest = `.env` path ambiguity breaks First Call (Critical).
- Ch2 Explorer: 3 findings; biggest = payoff prose buried under CallMe widget.
- Ch3 Builder: 5 findings; biggest = "delete Ch2 code" without a diff (Critical).
- Ch3 Explorer: 3 findings; biggest = callout name-drops personas Explorer never saw.
- Ch4 Builder: 5 findings; biggest = Step 4 partial overwrites Step 1 per-token behavior (Critical).
- Ch4 Explorer: 0 findings — chapter cleanly audience-segregated.
- Ch5 Builder: 6 findings; biggest = handoff mechanism contradicts repo (Critical) + `node server.js` missing (Critical).
- Ch5 Explorer: 4 findings; biggest = `handoff-toggle` appears without cause/effect.
- Ch6 Builder: 4 findings; biggest = CJS snippets vs. ESM repo (Critical).
- Ch6 Explorer: 4 findings; biggest = `play` message callout is builder reference in Explorer slot.

### Fact-check (6 subagents)

- Ch1: 12 claims, 1 Drift (Amazon STT), 1 Intentionally simplified (latency claim).
- Ch2: 18 claims, 1 Drift (transcriptionProvider grandfathering).
- Ch3: 12 claims, 3 Drift (ElevenLabs voice IDs, Polly `-Neural`, `dtmfDetection`), 1 Intentionally simplified.
- Ch4: 18 claims, 2 Drift (`reportInputDuringAgentSpeech`, one doc-sourced item), 1 Intentionally simplified.
- Ch5: 14 claims, 1 Drift (speculative `TTS_DONE`), 1 Intentionally simplified, 1 Ambiguous.
- Ch6: 14 claims, 1 Intentionally simplified (`welcomeGreetingInterruptible` default).

### Static audit (2 subagents)

- Builder track: 12 findings across cross-chapter refactor cascades, system-prompt drift, DTMF persona tension, hype/staccato language, emoji in code samples.
- Explorer track: 11 findings; biggest themes = premature "Tools" node on Ch1-Ch2 diagrams, Ch1 duration imbalance for Explorer, Ch4 test prose scoping, Ch6 hype/LinkedIn share template.

---

## Run Metadata

- **Date:** 2026-04-21
- **Audit command version:** v1
- **Prior chart referenced:** Yes (25 items, as of 2026-04-20)
- **Re-run count today:** 1

<!-- phase 4 complete 2026-04-21 -->
