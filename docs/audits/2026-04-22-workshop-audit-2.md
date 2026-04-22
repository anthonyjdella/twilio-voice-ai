# Workshop Audit — 2026-04-22 (Run 2)

**Workshop:** twilio-voice-ai
**Phases run:** Simulation (12), Fact-check (6), Static audit (2)
**Total findings:** 41
**Critical:** 4 | **High:** 13 | **Medium:** 17 | **Low:** 7

**Context:** Third audit of the day. Prior two runs (`2026-04-21-workshop-audit.md` → 30 fixed, 14 skipped; `2026-04-22-workshop-audit.md` → 21 fixed, 17 skipped) addressed every Critical and High surfaced. This pass validates the cumulative fixes and surfaces remaining gaps.

<!-- phase 0 complete 2026-04-22 -->
<!-- phase 1 complete 2026-04-22 -->
<!-- phase 2 complete 2026-04-22 -->
<!-- phase 3 complete 2026-04-22 -->

---

## Executive Summary

Top 5 workshop-killers in priority order:

1. **[C2-B-01]** `interruptible` is not a real `<ConversationRelay>` attribute — Ch2 Step 2 teaches a fictional attribute. Twilio silently ignores it. Builders think they've tuned barge-in behavior when they haven't.
   - Location: `src/content/chapter-2/step-2-twiml-setup.ts`
   - Severity: High (fact-check drift) | Dimensions: ACCURACY

2. **[C6-B-01]** Ch6 Step 1 polish TwiML silently flips `reportInputDuringAgentSpeech` from `"any"` to `"dtmf"` — silently disables speech-during-agent-speech forwarding. Ch4 interrupt tests stop working after the Ch6 polish is applied. No prose calls out the regression.
   - Location: `src/content/chapter-6/step-1-polish.ts`
   - Severity: High | Dimensions: FUNCTIONAL

3. **[C6-B-02]** Ch6 Step 2 Dockerfile `HEALTHCHECK` uses `curl` which doesn't exist in `node:20-slim`. Container healthcheck fails always.
   - Location: `src/content/chapter-6/step-2-deploy.ts`
   - Severity: High | Dimensions: FUNCTIONAL, ACCURACY

4. **[C6-S-01]** Ch6 Step 1 uses undocumented `interruptSensitivity="medium"` — not in the official `<ConversationRelay>` attribute table. Silently ignored. Builders think they've tuned sensitivity when they haven't.
   - Location: `src/content/chapter-6/step-1-polish.ts`
   - Severity: High (fact-check drift) | Dimensions: ACCURACY

5. **[CX-01]** Multiple Explorer-visible blocks in Ch2 and Ch4 still read like Builder-minus-code ("server keeps a log," "system immediately stops the AI's voice"). Auto-rule: Critical + AUDIENCE.
   - Location: spans `chapter-2/step-1`, `chapter-2/step-3`, `chapter-4/step-1`, `chapter-4/step-4`
   - Severity: Critical | Dimensions: AUDIENCE

---

<!-- detailed findings, cross-chapter, fact-check log, phase coverage, and metadata continue in follow-up writes -->

## Findings by Chapter

### Chapter 1 — Mission Briefing

- **[C1-B-01]** `/ws` WebSocket path mentioned in Ch1 Step 5 before Ch2 defines it
  - **Location:** `src/content/chapter-1/step-5-verify.ts` (wss URL prose)
  - **Severity:** High | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Prose says "`wss://...` and appending your WebSocket path (e.g., `/ws`)." Ch1 hasn't introduced `/ws` yet.
  - **Options:** A) Drop the `/ws` hint; B) Add "you'll define this in Ch2"; C) skip.

- **[C1-B-02]** Port 8080 Pre-Flight item still feels speculative pre-server
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior H1 Done (devcontainer auto-Public); residual Pre-Flight mismatch.

- **[C1-B-03]** `workshop/.env` vs `voice-agent/.env` ambiguity
  - **Severity:** Medium | **Chart ref:** overlaps prior M1 Done (two-folder callout); audit asks for an inline reminder in the `.env` code block.

- **[C1-B-04]** `+12065551234` placeholder could be pasted literally
  - **Severity:** Low | **Chart ref:** new | Options: A) use `<your-number>`; B) bold the surrounding prose; C) skip.

- **[C1-S-01]** Setup-message example names "caller number" instead of `from`
  - **Severity:** Low | **Dimensions:** ACCURACY | **Verdict:** Intentionally simplified
  - **Source:** https://www.twilio.com/docs/voice/conversationrelay/websocket-messages

- **[C1-E-01]** Ch1 Step 1 opening prose says Explorer will "create" an agent
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new
  - **Issue:** First sentence reads as imperative ("you'll create…") before audience-toggle framing kicks in.
  - **Options:** A) Mark Builder-only + add Explorer variant; B) rewrite as passive; C) skip.

- **[C1-E-02]** "WebSocket" jargon in shared Step 3 image caption without Explorer framing
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new
  - **Options:** A) Move the Explorer callout above the image; B) swap image alt for Explorer; C) skip.

### Chapter 2 — First Contact

- **[C2-B-01]** `interruptible` taught as a real attribute — it isn't
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts` (attribute prose list)
  - **Severity:** High | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Issue:** Official attribute table has `welcomeGreetingInterruptible`, `interruptSensitivity` (not actually listed either — see C6-S-01), `preemptible`, `reportInputDuringAgentSpeech`. Bare `interruptible` is not documented. Workshop prose says it defaults to `any`.
  - **Options:** A) Rewrite to describe `welcomeGreetingInterruptible` + `reportInputDuringAgentSpeech`; B) Drop the attribute bullet; C) Replace with `welcomeGreetingInterruptible` only.

- **[C2-B-02]** Step 3 patch omits the `👤 From` log from the `setup` case
  - **Severity:** Medium | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder | **Chart ref:** new
  - **Issue:** Step 1 taught the `From` log line; Step 3's "replace your setup case" patch drops it, but Step 5 terminal example still shows it.

- **[C2-B-03]** `streamLLMResponse` insertion point ambiguous (Step 4)
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new
  - **Issue:** `startLine: 60` is given but a Builder's accumulated file has different lengths.

- **[C2-B-04]** `MY_PHONE_NUMBER` dependency not re-surfaced in Step 2
  - **Severity:** High | **Chart ref:** overlaps prior #25 Done (env var callout) — residual: Ch2 Step 2 references the var but doesn't include a verify gate.

- **[C2-S-01]** Setup message example has wrong `direction` and omits fields
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Verdict:** Drift
  - **Source:** https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
  - **Issue:** Workshop shows `"direction": "outbound"` when Twilio's own sample uses `"inbound"` (direction reflects the PSTN-to-Twilio leg).
  - **Options:** A) Change to `"inbound"` + 1-line note; B) use Twilio's official sample verbatim; C) skip.

- **[C2-E-01]** Concept-card in Step 2 breaks fourth wall with "the Builder is wiring up…"
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** overlaps prior M1 Done partially
  - **Options:** A) Rewrite without "the Builder"; B) frame as "on the Builder track…"; C) skip.

- **[C2-E-02]** Explorer track is prose-heavy across Ch2 Steps 1/3/4 — no interactive widget until Step 5
  - **Severity:** Medium | **Dimensions:** PACING, AUDIENCE | **Chart ref:** new
  - **Options:** A) Add mini-widget per step; B) animate the diagram highlight path; C) skip.

- **[C2-E-03]** Step 5 asks for phone number with no reassurance about the call
  - **Severity:** High | **Audience:** Explorer | **Chart ref:** overlaps prior #27 Done (CallMe pulse animation) — reassurance prose not added
  - **Options:** A) Add Explorer-only callout before the widget; B) rewrite shared prose; C) skip.

### Chapter 3 — Identity

- **[C3-B-01]** Step 1 "delete hardcoded system message" instruction restated three times
  - **Severity:** High | **Audience:** Builder | **Chart ref:** overlaps prior #6 Done (before/after diff); audit flags that the diff helped but the two prose restatements weren't consolidated.

- **[C3-B-02]** Step 5 curl depends on `$CODESPACE_NAME` — silent fail if var isn't exported
  - **Severity:** High | **Chart ref:** overlaps prior H4 Done (`$CODESPACE_NAME` fix); audit asks for an `echo $CODESPACE_NAME` sanity check up front.

- **[C3-B-03]** ElevenLabs voice used with no mention of API key
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new
  - **Options:** A) One-line "ConversationRelay proxies ElevenLabs — no separate key needed"; B) link CR billing docs; C) skip.

- **[C3-B-04]** Three persona preset code blocks still render inline
  - **Severity:** Medium | **Chart ref:** overlaps prior #10 Done (intro prose preface); structural density remains.

- **[C3-S-01]** Deepgram default depends on account age
  - **Severity:** Medium | **Verdict:** Drift | **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Add grandfathering note; B) always set attribute explicitly; C) skip.

- **[C3-S-02]** Rachel voice ID shown as exemplar, not CR documented default
  - **Severity:** Low | **Verdict:** Intentionally simplified | **Chart ref:** overlaps prior L2 Skipped.

- **[C3-E-01]** Step 5 shared "Time to Test" lacks bridge for Explorer
  - **Severity:** Critical | **Audience:** Explorer | **Chart ref:** new
  - **Issue:** Page-break then "Time to Test" heading land without Explorer bridge between the summary widget and the button. "What to Check" prose is also generic.

- **[C3-E-02]** VoicePicker widget voice IDs don't match chapter prose voice IDs
  - **Severity:** High | **Dimensions:** ACCURACY, FUNCTIONAL | **Chart ref:** new
  - **Issue:** Widget lists `UgBBYS2sOqTuMpoF3BR0`, `9Ft9sm9dzvprPILZmLJl`, etc.; chapter prose teaches Rachel (`21m00Tcm4TlvDq8ikWAM`), Drew, Bella. Zero overlap.
  - **Options:** A) Reconcile widget with chapter voice IDs; B) hide IDs in the widget; C) skip.

- **[C3-E-03]** Explorer Step 4 concept-card uses "speech-to-text technology" jargon
  - **Severity:** Medium | **Chart ref:** new

- **[C3-E-04]** Step 2 "fields below" reads as a form-fill to-do
  - **Severity:** Medium | **Chart ref:** new

- **[C3-E-05]** Step 5 four stacked prose blocks (Greeting/Tone/Boundaries/Response length)
  - **Severity:** Medium | **Dimensions:** PACING | **Chart ref:** new
  - **Options:** A) Collapse into one checklist callout; B) add illustration; C) skip.

### Chapter 4 — Reflexes

- **[C4-B-01]** Step 3 solution drops the `ws.readyState` guard the teaching snippet taught
  - **Severity:** High | **Audience:** Builder | **Chart ref:** overlaps prior M7 (marked phantom — re-audit says solution actually differs from teaching)
  - **Issue:** Teaching snippet has `if (ws.readyState !== ws.OPEN) return;`. Final solution omits it. Also `ws.on("close")` clears `silenceTimer` but does not reset `silencePromptCount`.
  - **Options:** A) Add the guard to the solution; B) reset `silencePromptCount` in close handler; C) skip.

- **[C4-B-02]** Step 4 sentence-flush regex `/[.!?]\s/` has no `console.log` on match, so Step 5 verify can't see the language marker fire
  - **Severity:** High | **Chart ref:** new | Options: A) add log inside `if (match)`; B) note min-buffer risk; C) skip.

- **[C4-B-03]** Step 2 `sendDigits` example shown as top-level calls — paste would error
  - **Severity:** Medium | **Chart ref:** new | Options: A) wrap in `// Example:` comment; B) drop the example calls; C) skip.

- **[C4-B-04]** Step 1 refactor warning uses the name `streamLLMResponse` — Ch2 rename state may differ
  - **Severity:** Medium | **Chart ref:** overlaps prior H8 Done (Ch5 Step 3 deletion callouts); Step 1 has the same issue unresolved.

- **[C4-E-01]** Architecture diagram labels say "Your Server" / "WebSocket" to Explorer
  - **Severity:** Critical | **Audience:** Explorer (auto-rule) | **Chart ref:** new
  - **Location:** `src/components/diagrams/ArchitectureDiagram.tsx`
  - **Issue:** Shared diagram rendered for both audiences labels a box "Your Server" + sublabel "WebSocket" — Explorer reads "for developers, not me."
  - **Options:** A) Audience-aware diagram (Explorer variant uses "The Workshop Server" and "live connection"); B) add Explorer caption block translating the labels; C) skip.

- **[C4-E-02]** Step 5 Explorer prose is a four-item to-do list
  - **Severity:** High | **Chart ref:** overlaps prior #50 Done (consolidated test); audit says the consolidated prose still reads like a QA checklist.

- **[C4-E-03]** "Barge-in" used circularly in Step 1 concept-card
  - **Severity:** Medium | **Chart ref:** overlaps prior M17 Done (hype removed); audit wants the term re-ordered ("lead with behavior, introduce term at end").

- **[C4-E-04]** Closing prose says "solid reflexes" without recapping what the four are
  - **Severity:** Medium | **Chart ref:** new

### Chapter 5 — Superpowers

- **[C5-B-01]** Step 3 references `processLLMResponse` and `sendText` but doesn't warn Builders to preserve them
  - **Severity:** Critical | **Audience:** Builder | **Chart ref:** overlaps prior H8 Done; audit flags these two helpers were not added to the "keep these" list.
  - **Options:** A) Warning callout listing helpers that must stay (`sendText`, `processLLMResponse`, `resetSilenceTimer`, `handleSilence`); B) show full inline solution; C) skip.

- **[C5-B-02]** Step 3 callout names "`streamLLMResponse` back in Ch4 Step 1" assuming rename happened
  - **Severity:** High | **Chart ref:** overlaps prior H8 Done; audit asks for grep hint or both names.

- **[C5-B-03]** Step 5 Test 4 references `tell_joke` tool — Builder never wrote a handler
  - **Severity:** High | **Chart ref:** overlaps prior M9 Done (Builder prose noted it wasn't written); audit asks for a 4-line inline snippet so parity is possible.
  - **Options:** A) Inline `tell_joke` snippet in Step 2; B) mark Test 4 Explorer-only; C) skip.

- **[C5-B-04]** Step 4 TwiML code block introduces `voice="en-US-Chirp3-HD-Achernar"` and `ttsProvider="Google"` silently
  - **Severity:** Medium | **Chart ref:** new (related to CX drift)

- **[C5-B-05]** Step 2 `SYSTEM_PROMPT` solution hardcodes "Acme Corp," overwriting Ch3 persona
  - **Severity:** Low | **Chart ref:** overlaps prior #63 Done (persona reminder callouts added); Step 2 solution didn't get the callout.

- **[C5-S-01]** `reportInputDuringAgentSpeech="any"` shown without noting it's non-default since May 2025
  - **Severity:** Medium | **Verdict:** Drift | **Source:** https://www.twilio.com/docs/voice/conversationrelay/conversationrelay-noun
  - **Options:** A) Inline TwiML comment; B) callout; C) skip.

- **[C5-E-01]** Step 5 shared test prose (Tests 1/2/3) still reads as imperative to Explorer
  - **Severity:** Medium | **Chart ref:** overlaps prior #50 (done for Ch4) — Ch5 not retroactively fixed.

- **[C5-E-02]** Step 3 Explorer visual-step uses "back-end" jargon
  - **Severity:** Medium | **Chart ref:** overlaps prior R5 (Critical #5 from audit 2, "your server" → "back-end"); audit says "back-end" is still jargon for Explorer.

- **[C5-E-03]** Step 4 Explorer prose drops term "session" without analogy
  - **Severity:** Medium | **Chart ref:** new | Options: A) "the AI steps out of the call"; B) analogy concept-card; C) skip.

- **[C5-E-04]** Step 5 Test 4 Explorer prose asks them to remember a 3-step-ago toggle
  - **Severity:** High | **Chart ref:** new
  - **Options:** A) show current tool-picker state inline; B) link back to Step 2; C) skip.

- **[C5-E-05]** Step 5 Test 5 handoff default is uncertain for Explorer ("if handoff is on...")
  - **Severity:** Critical | **Audience:** Explorer | **Chart ref:** new
  - **Issue:** Explorer interacted with `handoff-toggle` in Step 4 but has no idea what the default is or where they left it. "Depends on your toggle from Step 4" assumes memory + verification.
  - **Options:** A) Show current toggle state inline; B) rephrase with known default; C) skip.

### Chapter 6 — Launch

- **[C6-B-01]** Ch6 Step 1 silently flips `reportInputDuringAgentSpeech` from `"any"` to `"dtmf"`
  - **Location:** `src/content/chapter-6/step-1-polish.ts` (TwiML + solution)
  - **Severity:** High | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** new
  - **Issue:** Ch4 teaches `"any"` as the value that makes mid-speech speech+DTMF events forward to the server. Ch6 polish TwiML sets `"dtmf"`, which silently disables speech forwarding during agent speech — after applying polish, interrupt handlers stop firing on speech. No prose explains the change.
  - **Options:** A) Keep `"any"` in Ch6 polish; B) change and explain the trade-off; C) skip.

- **[C6-B-02]** Dockerfile `HEALTHCHECK` uses `curl` not present in `node:20-slim`
  - **Location:** `src/content/chapter-6/step-2-deploy.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** new
  - **Issue:** `node:20-slim` lacks `curl`. Healthcheck always fails. Step 2 is aspirational but the code is still wrong.
  - **Options:** A) Use `wget --spider` (also not in slim) or Node-based healthcheck; B) install curl in the Dockerfile; C) remove the HEALTHCHECK.

- **[C6-B-03]** `voice` / `ttsProvider` silently change between Ch3 (ElevenLabs/Rachel) and Ch6 polish (Google/Chirp3)
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new (relates to CX-03)
  - **Options:** A) Leave Ch3 voice as the default; make Ch6 Google an optional polish; B) note the swap explicitly; C) skip.

- **[C6-B-04]** `tool-handlers.js` filename appears in Ch6 solution without prior introduction
  - **Severity:** Medium | **Chart ref:** new

- **[C6-B-05]** Ch6 Step 2 "update the WebSocket URL in TwiML" ambiguous for dynamic-host Builders
  - **Severity:** Medium | **Chart ref:** overlaps prior M14 Skipped (aspirational); audit re-flags but same skip rationale.

- **[C6-S-01]** `interruptSensitivity="medium"` not in documented ConversationRelay attribute table
  - **Location:** Ch6 Step 1 TwiML + solution
  - **Severity:** High | **Dimensions:** ACCURACY, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Issue:** Twilio's official attribute table doesn't list `interruptSensitivity`. If it's ignored, Builders think they've tuned sensitivity when they haven't.
  - **Options:** A) Remove the attribute from Ch6 TwiML; B) replace with `interruptible="speech"` and explain; C) add a version note if it's beta.

- **[C6-E-01]** Ch6 Step 3 "Let Others Try It" still reads as imperative to Explorer
  - **Severity:** High | **Chart ref:** overlaps prior #13 Done (Step 3 rewrite); audit asks for Builder-only scoping of that section.

- **[C6-E-02]** "SSML" jargon with thin framing for Explorer
  - **Severity:** Medium | **Chart ref:** new
  - **Options:** A) Add "stage directions for voice" analogy; B) Explorer-only SSML concept-card; C) mark SSML section Builder-only.

---

## Cross-Chapter Findings

- **[CX-01]** `welcomeGreeting` drift — Ch3 Step 2 teaches persona greeting; every downstream solution reverts to "Hello! How can I help you today?"
  - **Severity:** Medium | **Chart ref:** overlaps prior #CX-04 Done (Ch3 Step 2 tip callout); solutions in Ch3-6 still override.

- **[CX-02]** `voice` / `ttsProvider` attributes vanish from TwiML after Ch3
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Options:** A) Preserve attributes in every downstream solution with a comment; B) shared TwiML fragment; C) skip.

- **[CX-03]** `SYSTEM_PROMPT` regresses from Ch3 persona → "Acme Corp" (Ch4) → "Ava" (Ch6)
  - **Severity:** Medium | **Chart ref:** overlaps prior #63 Done partially (Ch4 Step 1 + Ch6 Step 1 callouts added); audit wants every solution to carry the reminder.

- **[CX-04]** DTMF menu hardcoded vs. persona; Ch6 polish silently changes `reportInputDuringAgentSpeech` from "any" to "dtmf"
  - **Severity:** Medium | **Chart ref:** overlaps prior #CX-04 Done (DTMF persona adaptation); the "any" → "dtmf" change in Ch6 is new (see C6-B-01).

- **[CX-05]** Explorer-visible blocks in Ch2 and Ch4 still read like Builder-minus-code
  - **Severity:** Critical | **Audience:** Explorer (auto-rule) | **Chart ref:** new
  - **Locations:** `chapter-2/step-1` ("server keeps a log"), `chapter-2/step-3` (server-side framing), `chapter-4/step-1` (barge-in mechanics), `chapter-4/step-4` (LLM detection)

- **[CX-06]** "ConversationRelay" re-introduced four times for Explorer
  - **Severity:** Medium | **Chart ref:** overlaps prior #9 Done (Ch1 concept-card); later re-defs weren't trimmed.

- **[CX-07]** Emoji still in Ch2/Ch3 code/terminal output but absent Ch4+ — aesthetic drift
  - **Severity:** Low | **Chart ref:** overlaps prior #66/#67 Skipped by design — re-raised.

- **[CX-L-01]** Hype phrases: "difference between an agent that feels considerate and one that feels abandoned" (Ch4), "callers will feel it, even if they cannot name it" (Ch6), "That is the point" (Ch6)
  - **Severity:** Medium | **Audience:** Both (auto-rule) | **Chart ref:** new


---

## Fact-Check Log

| Claim location | Workshop says | Source says | Verdict | Source URL |
|---|---|---|---|---|
| ch1/step-2 setup message | "callSid, caller number, custom parameters" | Actual payload has ~12 fields; the caller field is `from` | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch2/step-1 setup JSON | `"direction": "outbound"` | Twilio sample uses `"inbound"` (direction is PSTN-to-Twilio leg) | Drift | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch2/step-2 `interruptible` attribute | Taught as real attribute, default `"any"` | Not listed on `<ConversationRelay>`; real attrs are `welcomeGreetingInterruptible` / `reportInputDuringAgentSpeech` | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-4 Deepgram default | "Deepgram is the default provider" | "Deepgram (or Google for accounts that used ConversationRelay before September 12, 2025)" | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-3 Rachel voice | Listed as popular example | CR documented default is `UgBBYS2sOqTuMpoF3BR0`; Rachel is valid but not default | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch5/step-2,3 `reportInputDuringAgentSpeech="any"` | Set without explanation | Valid, but default changed to `"none"` May 2025 | Drift | https://www.twilio.com/docs/voice/conversationrelay/conversationrelay-noun |
| ch5/step-4 `setTimeout(..., 2000)` before `end` | "Small delay so caller hears the message" | Docs recommend `tokens-played` or `agentSpeaking=false` speaker event | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch6/step-1 `interruptSensitivity="medium"` | Used as a polish attribute | Not in official `<ConversationRelay>` attribute table | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| All CR TwiML/WebSocket message shapes, `gpt-5.4-nano`, SSML `en-us`, `debug` options, `play.loop=0` → 1000, `welcomeGreetingInterruptible` default `any`, `interruptible` enum, `dtmfDetection="true"`, `<Connect action>` + `HandoffData` POST param | Various | Confirmed | Match | Twilio ConversationRelay docs |

---

## Phase Coverage

### Simulation (12 subagents)
- Ch1 Builder: 4 findings; biggest = `/ws` path mentioned before Ch2 introduces it (High).
- Ch1 Explorer: 2 findings — "create" imperative + unframed WebSocket jargon.
- Ch2 Builder: 4 findings; biggest = `MY_PHONE_NUMBER` unverified (High).
- Ch2 Explorer: 3 findings; biggest = Step 5 asks for phone number without reassurance (High).
- Ch3 Builder: 4 findings; biggest = Step 5 curl `$CODESPACE_NAME` silent fail + Step 1 three restated delete instructions (both High).
- Ch3 Explorer: 5 findings; biggest = Step 5 test bridge missing (Critical) + VoicePicker IDs don't match chapter (High).
- Ch4 Builder: 4 findings; biggest = Step 3 solution drops readyState guard (High), Step 4 language marker has no log to verify (High).
- Ch4 Explorer: 4 findings; biggest = architecture diagram labels "Your Server" + "WebSocket" for Explorer (Critical auto-rule).
- Ch5 Builder: 5 findings; biggest = Step 3 doesn't warn to keep `processLLMResponse`/`sendText` (Critical).
- Ch5 Explorer: 5 findings; biggest = Test 5 handoff default ambiguous — requires memory of toggle from 3 steps back (Critical).
- Ch6 Builder: 4 findings; biggest = Ch6 polish TwiML silently regresses `reportInputDuringAgentSpeech` (High).
- Ch6 Explorer: 2 findings; biggest = "Hand the phone to someone" in shared prose still jolts Explorer (High).

### Fact-check (6 subagents)
- Ch1: 14 claims, 0 drifts, 3 intentionally simplified.
- Ch2: 14 claims, 2 drifts (`interruptible` fictional, setup direction wrong), 1 simplified.
- Ch3: 14 claims, 1 drift (Deepgram grandfathering), 1 simplified.
- Ch4: 18 claims, 0 drifts. Clean.
- Ch5: 18 claims, 1 drift (`reportInputDuringAgentSpeech` default), 1 simplified.
- Ch6: 14 claims, 1 drift (`interruptSensitivity` undocumented), 1 simplified.

### Static audit (2 subagents)
- Builder track: 14 findings across attribute drift, persona drift, welcomeGreeting reversion, Ch6 polish regressions, emoji inconsistency, refactor cascade, and hype.
- Explorer track: 11 findings; biggest themes = Builder-minus-code blocks in Ch2/Ch4, Ch3 persona drift into Ch4+, SSML/WebSocket jargon without framing, Ch4 Step 3 Explorer silence, hype language.

---

## Run Metadata

- **Date:** 2026-04-22
- **Audit command version:** v1
- **Prior charts referenced:** Yes — 44-item chart (2026-04-21) and 38-item chart (2026-04-22 run 1)
- **Re-run count today:** 2 (third overall audit this project)
- **New regressions introduced by prior fixes:** 1 (Ch6 Step 1 `reportInputDuringAgentSpeech="dtmf"` silently undoes Ch4's `"any"` — see C6-B-01)
- **Drifts resolved by prior fixes:** `dtmfDetection` (fixed in audit 2 run), ElevenLabs voice IDs (fixed in audit 1).
- **Net trend:** Criticals down 2 (from 4 → 4 but the 4 new ones are different; 3 prior Criticals validated as resolved; 1 new discovered as side-effect of polish). High count up 5 (fact-check surfaced two new undocumented attributes).

<!-- phase 4 complete 2026-04-22 -->
