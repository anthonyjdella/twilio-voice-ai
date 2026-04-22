# Workshop Audit — 2026-04-22 (Run 3)

**Workshop:** twilio-voice-ai
**Phases run:** Simulation (12), Fact-check (6, MCP-verified), Static audit (2)
**Total findings:** 40
**Critical:** 1 | **High:** 8 | **Medium:** 22 | **Low:** 9

**Context:** Third audit of 2026-04-22, redone after Run 2 hit fact-check false positives. Every Twilio-related drift in this pass was verified against the `twilio-docs` MCP server directly; the two withdrawn Run-2 findings (`interruptible`, `interruptSensitivity`) are documented attributes and not flagged here.

<!-- phase 0 complete 2026-04-22 -->
<!-- phase 1 complete 2026-04-22 -->
<!-- phase 2 complete 2026-04-22 -->
<!-- phase 3 complete 2026-04-22 -->

---

## Executive Summary

Top 5 issues most likely to kill the workshop in a live room:

1. **[C6-B-01]** `voice="en-US-Chirp3-HD-Achernar"` in Ch6 Step 1 polish TwiML is not in Twilio's documented en-US Chirp3-HD voice catalog (official list: Aoede, Charon, Fenrir, Kore, Leda, Orus, Puck, Zephyr). Invalid TTS combination → call will fail or fall back unpredictably.
   - Location: `src/content/chapter-6/step-1-polish.ts` (two TwiML blocks)
   - Severity: High | Dimensions: ACCURACY, FUNCTIONAL
   - MCP-verified: Twilio TTS voices table at https://www.twilio.com/docs/voice/twiml/say/text-speech

2. **[C6-B-02]** Ch6 Step 1 polished TwiML silently removes `language`, `transcriptionProvider`, `speechModel` attributes that Ch3 Step 4 explicitly taught Builders to add. Builders copy-pasting the Ch6 solution lose the explicit STT pinning.
   - Location: `src/content/chapter-6/step-1-polish.ts`
   - Severity: High | Dimensions: FLOW, ACCURACY

3. **[C2-B-01]** Ch2 Step 4 top-of-file snippet adds `OpenAI` import and client but drops the `twilio` import from Step 2. A Builder pasting as shown loses the `twilio` require and their `/call` endpoint throws `twilio is not defined`.
   - Location: `src/content/chapter-2/step-4-stream-response.ts`
   - Severity: Critical | Dimensions: FUNCTIONAL

4. **[C5-B-01]** Ch5 Step 5 Test 4 asks Builders to test a `tell_joke` tool they never wrote in the Builder track. Prose says "you didn't write a handler — the reference covers it." Hand-coded servers have no `tell_joke` in their `tools` array. Test fails for the Builder's own code.
   - Location: `src/content/chapter-5/step-5-test-superpowers.ts` + checkpoint
   - Severity: High | Dimensions: FLOW, FUNCTIONAL

5. **[C6-E-01]** Ch6 Step 3 "Let Others Try It" shared prose tells the Explorer to hand over a phone they don't have. Reads as imperative to the wrong audience — classic Builder-minus-code pattern.
   - Location: `src/content/chapter-6/step-3-showcase.ts`
   - Severity: Critical | Dimensions: AUDIENCE (auto-rule)

---

## Findings by Chapter

### Chapter 1 — Mission Briefing

- **[C1-B-01]** `workshop/.env` contents not surfaced; Builder can't verify keys
  - **Location:** `src/content/chapter-1/step-4-setup.ts` (prose + code block)
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Prose says `.env` is pre-generated but doesn't list expected keys. If something fails later, Builder can't debug which env vars were actually set.
  - **Options:** A) Add a `cat workshop/.env` terminal step or show the expected key list; B) show full `.env` shape with values redacted; C) skip.

- **[C1-B-02]** `/ws` WebSocket path shown in Step 5 as "e.g." before Ch2 defines it
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior C1-B-01 from run 2

- **[C1-B-03]** Port 8080 visual verification depends on GitHub UI screenshots that may drift
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Options:** A) Add textual description of Ports table columns; B) add `gh codespace ports visibility 8080:public` CLI alternative; C) skip.

- **[C1-B-04]** "You'll start it in Chapter 2" has no specific Ch2 step reference
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new

- **[C1-E-01]** No Explorer interactive widget across all 5 steps of Ch1
  - **Severity:** Medium | **Dimensions:** PACING, AUDIENCE | **Audience:** Explorer | **Chart ref:** new
  - **Options:** A) Add an Explorer-only preview widget in Step 3; B) make architecture diagram interactive; C) skip.

- **[C1-E-02]** Step 5 Explorer track is four short cards while Builder does 15 blocks of setup
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** overlaps prior #18 Done

- **[C1-B-05]** Hype: "By the end, your agent will have a custom personality, real-time tool calling, and live handoff to a human"
  - **Location:** Ch1 Step 1 prose
  - **Severity:** Medium | **Dimensions:** AUDIENCE (auto-rule) | **Chart ref:** new

- **[C1-E-03]** Hype: "that's what makes the conversation feel instant instead of walkie-talkie"
  - **Location:** Ch1 Step 3 Explorer callout
  - **Severity:** Medium | **Dimensions:** AUDIENCE (auto-rule) | **Chart ref:** new

### Chapter 2 — First Contact

- **[C2-B-01]** Step 4 top-of-file snippet drops the `twilio` require when introducing `OpenAI`
  - **Location:** `src/content/chapter-2/step-4-stream-response.ts` (top-of-file code block)
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Snippet shows `startLine: 1` with `OpenAI` at line 4 and client at lines 8-10. Step 2 already placed `const twilio = require("twilio")` at line 4 and `twilioClient` at 8-11. Paste-as-shown overwrites `twilio` imports and breaks `/call`.
  - **Options:** A) Show full new top-of-file with both `twilio` and `OpenAI`, highlight only new lines; B) prose: "Add these *alongside* the `twilio` import — don't replace"; C) skip — not defensible.

- **[C2-B-02]** `server.js` location never stated in Step 1
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Issue:** "Create `server.js`" with no directory hint. Step 5 suddenly references `workshop/.env`, implying files should be in `workshop/`.
  - **Options:** A) One-line "create inside the `workshop/` directory"; B) `file: "workshop/server.js"` on every code block; C) skip.

- **[C2-B-03]** Step 3 patch vs. replacement ambiguity
  - **Severity:** High | **Audience:** Builder | **Chart ref:** overlaps prior M2 Done partially

- **[C2-B-04]** Step 1 deep-dive dumps 10 message types before any are used
  - **Severity:** Medium | **Audience:** Builder | **Dimensions:** PACING | **Chart ref:** new

- **[C2-B-05]** Setup message example omits documented fields
  - **Location:** Ch2 Step 1 `setup` JSON
  - **Severity:** Low | **Dimensions:** ACCURACY | **Verdict:** Intentionally simplified
  - **Source:** https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
  - **Issue:** Real setup payload includes `parentCallSid`, `forwardedFrom`, `callType`, `callerName`. `direction: "outbound"` vs docs' `"inbound"` is plausible for outbound calls but not explicitly documented.

- **[C2-B-06]** `welcomeGreetingInterruptible` not mentioned alongside `interruptible`
  - **Location:** Ch2 Step 2 attribute prose
  - **Severity:** Low | **Dimensions:** ACCURACY | **Chart ref:** new
  - **Issue:** Readers may think `interruptible` controls greeting interruption; it doesn't — `welcomeGreetingInterruptible` does. Both documented, both default `any`.
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay (MCP-verified)

- **[C2-E-01]** Step 5 Call Me widget has no Explorer reassurance ("whose phone?")
  - **Severity:** Critical | **Audience:** Explorer | **Chart ref:** overlaps prior #27 Done partially
  - **Issue:** Shared prose jumps straight to "Enter your phone number... hit Call Me" with no reassurance the workshop pre-wired the phone system. Explorer may bail.

- **[C2-E-02]** Concept-card Step 2 breaks fourth wall with "the Builder is wiring up..."
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** overlaps prior M1 partially

- **[C2-E-03]** Chapter opens cold with no Explorer orientation prose
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C2-E-04]** Step 4 Explorer prose buries the streaming payoff in sentence 3
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

### Chapter 3 — Identity

- **[C3-B-01]** Step 1 "delete Ch2's `streamLLMResponse`" assumes specific prior state
  - **Severity:** High | **Audience:** Builder | **Chart ref:** overlaps prior #6 Done, audit asks for branching fallback
  - **Options:** A) Add "if your Ch2 code looks like X, do Y" branch; B) link directly to the Ch2 Step 4 solution line being replaced; C) skip.

- **[C3-B-02]** `speechModel="nova-3-general"` pasted with no source reference
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Issue:** No mention that Nova 3 availability varies by language or what the default is. MCP confirms `nova-3-general` is valid Deepgram CR default.
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay (MCP-verified)
  - **Options:** A) Add a note pointing to the CR speech-model reference; B) drop the attribute and let default apply; C) skip.

- **[C3-B-03]** Three persona preset code blocks lack "pick ONE" inline comment
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior #10 Done

- **[C3-B-04]** Step 5 curl uses `$CODESPACE_NAME` without sanity check
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior H4 Done partially

- **[C3-B-05]** `welcomeGreeting` tip not reflected in Step 3/4 solution code
  - **Severity:** Low | **Audience:** Builder | **Chart ref:** overlaps prior M2 from run 2

- **[C3-S-01]** Deepgram-as-default described without pre-2025-09-12 grandfathering
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Verdict:** Intentionally simplified
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay (MCP-verified: "Deepgram (or Google for accounts that used ConversationRelay before September 12, 2025)")

- **[C3-E-01]** "Trigger a test call" framing with no context it's ringing the Explorer's phone
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C3-E-02]** "What to Check" section reads like a QA checklist for the Explorer
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new
  - **Options:** A) Reframe as observations; B) split: Builder checklist + Explorer "things to notice" card; C) skip.

- **[C3-E-03]** Voice provider jargon lands without analogy in concept-card
  - **Severity:** Low | **Audience:** Explorer | **Chart ref:** new

### Chapter 4 — Reflexes

- **[C4-B-01]** Step 3 solution drops the `ws.readyState` guard the snippet teaches
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior M7 (re-raised)

- **[C4-B-02]** Step 4 solution silently drops `interruptSensitivity` introduced in Step 3
  - **Severity:** Low | **Audience:** Builder | **Chart ref:** new

- **[C4-B-03]** Step 1 refactor warning references Ch2 symbols without grep fallback
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps prior H8 / #11 Done

- **[C4-B-04]** Step 4 sentence-buffer regex `/[.!?]\s/` stalls latency without acknowledgment
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Issue:** One-sentence replies without trailing whitespace only flush at end-of-stream, eliminating streaming feel. Regex also misfires on `Mr.` etc.
  - **Options:** A) Change regex to `/[.!?](\s|$)/`; B) flag the latency trade-off in the deep-dive; C) skip.

- **[C4-B-05]** `sendDigits` example omits `w` pause character documented by Twilio
  - **Severity:** Low | **Dimensions:** ACCURACY | **Verdict:** Intentionally simplified
  - **Source:** https://www.twilio.com/docs/voice/conversationrelay/websocket-messages (MCP-verified)

- **[C4-B-06]** Language-switch Step 4 is optional but Ch5 Step 3 assumes it ran
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new

- **[C4-E-01]** Shared BCP-47 code block dumps code on Explorer under "Supported Languages"
  - **Location:** `src/content/chapter-4/step-4-language-switch.ts` code block (no audience field)
  - **Severity:** Critical | **Dimensions:** AUDIENCE (auto-rule) | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Code-only section for Explorer under that heading — Explorer skips the whole section.
  - **Options:** A) Tag the code block Builder-only + add Explorer concept-card listing languages in plain text; B) replace with shared prose listing language names; C) skip — indefensible.

- **[C4-E-02]** Step 5 shared "Trigger a test call" abrupt for Explorer amid Builder-heavy surroundings
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C4-E-03]** Step 1 and Step 3 Explorer concept-card + follow-on prose repeat the same idea
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C4-E-04]** Explorer told keypad shortcuts are "fixed" only at point of test
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** overlaps prior L10 Done partially
  - **Options:** A) Move "keys stay the same" to top of concept-card; B) callout; C) skip.

- **[C4-E-05]** Hype: "Real conversations aren't turn-based. People cut each other off..."
  - **Severity:** Medium | **Audience:** Explorer (auto-rule)

### Chapter 5 — Superpowers

- **[C5-B-01]** Step 5 Test 4 asks Builders to test `tell_joke` tool they never wrote
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` + checkpoint
  - **Severity:** High | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps prior M9 Done (tool added to Explorer; Builder never got a snippet)
  - **Options:** A) Add a 4-line `tell_joke` snippet to Step 2; B) drop Test 4 from Builder checkpoint; C) reword Test 4 as Explorer-only.

- **[C5-B-02]** Step 3 `streamResponse` finishReason="stop" branch lacks break/return (asymmetric with tool_calls branch)
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new

- **[C5-B-03]** Step 3 code block starts with the `require` line — duplicate-paste risk
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Options:** A) Drop the first two require lines from the code block; B) split into two blocks; C) skip.

- **[C5-B-04]** Step 4 TwiML introduces `voice="en-US-Chirp3-HD-Achernar"` + `ttsProvider="Google"` silently
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps C6-B-01 (Achernar not in catalog — MCP-verified)

- **[C5-S-01]** `/call-ended` reasonCode prose overstates Twilio conventions
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Source:** https://www.twilio.com/docs/conversational-intelligence/conversation-relay-integration
  - **Issue:** Prose says "(other end scenarios use different codes)" but Twilio documents only `live-agent-handoff`; anything else is app-defined.

- **[C5-E-01]** Explorer prose leaks backticked identifier `tell_joke`
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C5-E-02]** Shared "Test 2: Order Lookup" prose uses backticked ORD tokens without framing
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** overlaps prior #55 Done partially

- **[C5-E-03]** `handoff-toggle` default state ("off") revealed only during Step 5 testing
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

### Chapter 6 — Launch

- **[C6-B-01]** `voice="en-US-Chirp3-HD-Achernar"` not in documented en-US Chirp3-HD catalog
  - **Location:** `src/content/chapter-6/step-1-polish.ts` (both TwiML blocks)
  - **Severity:** High | **Dimensions:** ACCURACY, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Fact-check (MCP-verified) | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/say/text-speech — en-US Chirp3-HD list: Aoede, Charon, Fenrir, Kore, Leda, Orus, Puck, Zephyr.
  - **Issue:** Not in Twilio's published list; call will fall back or error at TTS time per "Other defaults" spec.
  - **Options:** A) Swap to `en-US-Chirp3-HD-Aoede` (female) or `-Charon` (male); B) verify with Twilio whether Achernar was recently added; C) skip — not defensible.

- **[C6-B-02]** Ch6 polish TwiML silently removes `language`, `transcriptionProvider`, `speechModel` from Ch3
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new
  - **Options:** A) Preserve the Ch3 attributes; B) note the removal with rationale; C) skip.

- **[C6-B-03]** `/twiml` handler URL ambiguity in deploy step
  - **Severity:** High | **Audience:** Builder | **Chart ref:** overlaps prior M14 Skipped (aspirational)

- **[C6-B-04]** Deploy steps assume `package.json` `start` script without verification
  - **Severity:** High | **Audience:** Builder | **Chart ref:** new

- **[C6-B-05]** Dockerfile `HEALTHCHECK` uses `curl` not present in `node:20-slim`
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps Run 2 finding (still true)
  - **Options:** A) Swap to Node-based healthcheck; B) `apt-get install curl`; C) skip.

- **[C6-B-06]** Ch6 Step 1 callout contradicts itself about the Ava persona
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new
  - **Issue:** Callout says "keep your Ch3 persona, use Ava as a structure reference" but the full solution hardcodes Ava. Paste-as-shown overwrites the Builder's Ch3 choice.

- **[C6-S-01]** ElevenLabs SSML language-code case: `en-us` vs `en-US`
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay (MCP-verified: `language` default is `en-US`)
  - **Options:** A) Change `en-us` → `en-US`; B) skip — most systems treat case-insensitively.

- **[C6-E-01]** "Let Others Try It" shared prose tells Explorer to hand over a phone they don't have
  - **Severity:** Critical | **Audience:** Explorer (auto-rule) | **Chart ref:** overlaps prior #13 Done partially
  - **Options:** A) Mark block Builder-only + add observer-language Explorer card; B) rewrite in third person; C) skip — indefensible.

- **[C6-E-02]** SSML lands cold with no analogy for Explorer
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C6-E-03]** Resources list is doc URLs aimed at Builders, rendered to Explorer
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new

- **[C6-E-04]** Hype: "A great voice agent sounds like a person who happens to be helpful, not a bot following a script"
  - **Severity:** Medium | **Dimensions:** AUDIENCE (auto-rule) | **Chart ref:** new

- **[C6-B-07]** Hype: "*this thing is actually helpful*" / "feels good from one that feels like a phone tree"
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** new


---

## Cross-Chapter Findings

- **[CX-01]** `streamLLMResponse` → `streamResponse` rename still spans Ch2/Ch4/Ch5
  - **Severity:** Medium | **Audience:** Builder | **Chart ref:** overlaps #12 Done

- **[CX-02]** `conversationHistory` scope flips per-connection (Ch2/3) → module-scope (Ch4)
  - **Severity:** Medium | **Chart ref:** overlaps #12 Done

- **[CX-03]** `welcomeGreeting` reverts to "Hello! How can I help you today?" in later solutions after Ch3 tip
  - **Severity:** Low | **Chart ref:** overlaps prior #72 Done

- **[CX-04]** Emoji in Ch2/Ch3 code but absent from Ch4+ — aesthetic drift
  - **Severity:** Low | **Chart ref:** overlaps #66/#67 Skipped by design (still noted)

- **[CX-05]** Explorer ownership vs spectator framing inconsistent across chapters
  - **Severity:** Medium | **Audience:** Explorer | **Chart ref:** new
  - **Issue:** Ch3 gives Explorer ownership (persona, voice, language picks); Ch4 frames as spectator ("the Builder is doing X"); Ch5 mixes both.

- **[CX-06]** Tool/handoff toggle selections in Ch3/Ch5 have no consolidated recap before Ch6
  - **Severity:** Medium | **Chart ref:** new

- **[CX-L-01]** Hype phrases across Ch6 Step 3/4: "this thing is actually helpful," "the possibilities open up," "distinguish from a phone tree"
  - **Severity:** Medium | **Dimensions:** AUDIENCE (auto-rule)

---

## Fact-Check Log (MCP-verified)

| Claim location | Workshop says | Source says | Verdict | Source URL |
|---|---|---|---|---|
| ch1/step-2 setup | "callSid, caller number, custom parameters" | real setup adds `sessionId`, `accountSid`, `parentCallSid`, `from`, `to`, `forwardedFrom`, `callType`, `callerName`, `direction`, `callStatus` | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch2/step-1 setup JSON | `direction: "outbound"` | docs' example uses `"inbound"` (PSTN-to-Twilio leg) | Intentionally simplified (plausible for outbound test) | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch2/step-2 `interruptible` bullet | treats `interruptible` as greeting control | `interruptible` is per-talk-cycle; `welcomeGreetingInterruptible` controls greeting — both documented | Drift (incomplete) | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-4 `transcriptionProvider` default | "Deepgram (default)" | "Deepgram (or Google for accounts that used ConversationRelay before September 12, 2025)" | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch4/step-1 `interruptible` values | `none/dtmf/speech/any` | same + boolean back-compat `true=any, false=none` | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch4/step-2 `sendDigits` characters | `0-9, *, #` | `0-9, w, #, *` (w inserts 0.5s pause) | Intentionally simplified | https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch5/step-4 reasonCode prose | "other end scenarios use different codes" | Only `live-agent-handoff` is documented; rest is app-defined | Drift | https://www.twilio.com/docs/conversational-intelligence/conversation-relay-integration |
| ch5/step-2,3 `reportInputDuringAgentSpeech="any"` | set explicitly, no explanation | Default changed `any → none` in May 2025 | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch6/step-1 `voice="en-US-Chirp3-HD-Achernar"` | used as Google TTS exemplar | **Not in Twilio en-US Chirp3-HD catalog** (Aoede, Charon, Fenrir, Kore, Leda, Orus, Puck, Zephyr) | **Drift** | https://www.twilio.com/docs/voice/twiml/say/text-speech |
| ch6/step-4 SSML language | "language must be `en-us`" | Documented as `en-US` (BCP-47 convention) | Drift (case) | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| All CR TwiML attributes (`interruptible`, `interruptSensitivity`, `welcomeGreetingInterruptible`, `reportInputDuringAgentSpeech`, `dtmfDetection`, `preemptible`, `hints`, `debug`, `elevenlabsTextNormalization`, `intelligenceService`, `deepgramSmartFormat`, `speechModel`, `transcriptionProvider`, `ttsProvider`, `voice`, `language`) — all documented. WebSocket message shapes (setup, prompt, interrupt, dtmf, error, text, language, play, sendDigits, end) — all match. `gpt-5.4-nano` per user memory. | Various | All confirmed via MCP | Match | Twilio `<ConversationRelay>` docs |

**Note on Run-2 false positives:** Two Run-2 findings (`interruptible` "fictional", `interruptSensitivity` "undocumented") were withdrawn after MCP verification. Both attributes are documented with defaults `any` and `high` respectively. This run's fact-check was MCP-grounded to prevent recurrence.

---

## Phase Coverage

### Simulation (12)
- Ch1 Builder: 4 findings; biggest = `.env` contents unverifiable + port 8080 screenshot fragility.
- Ch1 Explorer: 2 findings — zero interactive widgets in 5 steps.
- Ch2 Builder: 4 findings; biggest = Step 4 top-of-file snippet drops `twilio` require (Critical).
- Ch2 Explorer: 4 findings; biggest = Step 5 Call Me has no Explorer reassurance.
- Ch3 Builder: 5 findings; biggest = Ch2 state assumption + `speechModel` with no source.
- Ch3 Explorer: 3 findings; "What to Check" reads as QA checklist.
- Ch4 Builder: 4 findings; biggest = sentence-buffer regex latency trade-off unacknowledged.
- Ch4 Explorer: 3 findings; biggest = shared BCP-47 code block dumped on Explorer (Critical).
- Ch5 Builder: 3 findings; biggest = `tell_joke` test fails for Builder's own code (High).
- Ch5 Explorer: 2 findings — backticked identifiers leak into Explorer prose.
- Ch6 Builder: 4 findings; biggest = URL update ambiguity + no `package.json` verification.
- Ch6 Explorer: 3 findings; biggest = "Let Others Try It" (Critical).

### Fact-check (6, MCP-verified)
- Ch1: 14 claims, 0 drifts, 2 simplified.
- Ch2: 18 claims, 1 drift (`interruptible` vs. `welcomeGreetingInterruptible` coverage), 2 simplified.
- Ch3: 14 claims, 0 drifts, 2 simplified.
- Ch4: 14 claims, 0 drifts, 2 simplified.
- Ch5: 18 claims, 1 drift (reasonCode prose), 1 simplified.
- Ch6: 18 claims, 2 drifts (**Achernar voice not in catalog**, `en-us` case), 1 simplified.

### Static audit (2)
- Builder track: 14 findings — refactor cascade, persona/greeting drift, Ch6 attribute regressions, `tell_joke` contradiction, hype language.
- Explorer track: 11 findings — ownership/spectator inconsistency, Ch1 no-widgets, Ch4 Explorer BCP-47 code block, Ch5 toggle default reveal, Ch6 share-the-phone imperative.

---

## Run Metadata

- **Date:** 2026-04-22
- **Audit command version:** v1
- **Prior charts referenced:** 44-item (2026-04-21), 38-item (run 1), 41-item (run 2 — 2 findings withdrawn as false positives)
- **Re-run count today:** 3 (fourth overall audit)
- **New regressions introduced by prior fixes:** 0 (Ch6 Step 1 `reportInputDuringAgentSpeech="dtmf"` issue from run 2 not re-surfaced in this pass — may have been resolved or not re-examined)
- **Drifts resolved:** Run 2's `interruptible`/`interruptSensitivity` false positives — now confirmed via MCP that both are documented attributes.
- **Method change:** Phase 2 subagents instructed to use the `twilio-docs` MCP server as primary source. Main-agent verified top two Ch6 drifts (Achernar voice, en-us case) directly against MCP before writing the report.

<!-- phase 4 complete 2026-04-22 -->
