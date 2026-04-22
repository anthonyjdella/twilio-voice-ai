# Workshop Audit — 2026-04-22

**Workshop:** twilio-voice-ai
**Phases run:** Simulation (12 subagents), Fact-check (6 subagents), Static audit (2 subagents)
**Total findings:** 38
**Critical:** 4 | **High:** 8 | **Medium:** 17 | **Low:** 9

**Context:** Second run, same-day follow-up. Prior run `2026-04-21-workshop-audit.md` (44 findings) was fully walked through — 30 items fixed across commits `1644c18`..`f19b902`, 14 items skipped (phantoms, design decisions, or resolved-by-cascade). This run validates that prior work and surfaces anything new.

<!-- phase 0 complete 2026-04-22 -->
<!-- phase 1 complete 2026-04-22 -->
<!-- phase 2 complete 2026-04-22 -->
<!-- phase 3 complete 2026-04-22 -->

---

## Executive Summary

The 5 issues most likely to kill the workshop in a live room. Note how different this list is from the first run — the previous Criticals are now resolved.

1. **[C1-B-01]** — The Ch1 Step 4 prose tells the Builder `workshop/.env` is "already created inside" the `workshop/` folder, but the repo only ships `workshop/.env.example`. Builders open the file explorer, find the `.example` file, and don't know whether to rename, copy, or run a command.
   - Location: `src/content/chapter-1/step-4-setup.ts`
   - Severity: Critical | Dimensions: FUNCTIONAL, FLOW

2. **[C4-S-01]** — Ch4 Step 2 prose ("DTMF messages arrive on the WebSocket automatically — there is no `dtmfDetection` attribute") is factually wrong per Twilio docs. `dtmfDetection` IS a documented attribute and must be set to `"true"` for keypresses to arrive as `dtmf` WebSocket messages. This is a direct reversal introduced by our prior-run fix #42, which incorrectly concluded the attribute was undocumented.
   - Location: `src/content/chapter-4/step-2-dtmf.ts` + all post-#42 TwiML blocks
   - Severity: Critical (regression) | Dimensions: FUNCTIONAL, ACCURACY

3. **[C2-B-01]** — Ch2 Step 3's code snippet pushes to `conversationHistory` but never declares it. The per-connection scope only has `let callSid = null;` at this point. Pasting the highlighted patch throws `ReferenceError: conversationHistory is not defined` on the first caller prompt.
   - Location: `src/content/chapter-2/step-3-handle-speech.ts`
   - Severity: Critical | Dimensions: FUNCTIONAL

4. **[C5-B-05]** — Ch5 Step 5 Explorer references a "Live Handoff toggle from Step 4," but Builder wrote the `transfer_to_agent` tool by hand and has no such toggle in their flow. Chapter never reconciles whether the Explorer toggle gates the hand-written code.
   - Location: `src/content/chapter-5/step-5-test-superpowers.ts` vs. `step-4-handoff.ts`
   - Severity: Critical | Dimensions: FLOW, AUDIENCE

5. **[C5-E-01]** — Ch5 Step 3 Explorer visual-step uses "Your server runs the tool and gets back..." — the exact "your server" zone-out trigger the Explorer persona flags. Builder's visual-step (one block earlier) uses the same wording; the Explorer version is Builder-minus-code.
   - Location: `src/content/chapter-5/step-3-handle-tools.ts`
   - Severity: Critical (auto-rule: AUDIENCE) | Dimensions: AUDIENCE

---

## Findings by Chapter

### Chapter 1 — Mission Briefing

- **[C1-B-01]** — `workshop/.env` does not exist in repo; only `workshop/.env.example` ships
  - **Location:** `src/content/chapter-1/step-4-setup.ts` (prose + code block with `file: "workshop/.env"`)
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new (not in prior chart)
  - **Issue:** The fix in #36 (commit 59156b0) told Builders "`workshop/.env` is already created inside it," but a fresh Codespace may only contain `workshop/.env.example`. No devcontainer postCreateCommand generates the `.env`. Builders get stuck between "open `workshop/.env`" (it doesn't exist) and "copy `.env.example` to `.env`" (not instructed).
  - **Options:**
    - A) Add explicit terminal step: `cp workshop/.env.example workshop/.env` with one-line prose; trade-off: one extra command.
    - B) Add a `postCreateCommand` in `.devcontainer/devcontainer.json` that auto-copies `.env.example` → `.env`; trade-off: hidden magic.
    - C) Ship a real `workshop/.env` in the repo with placeholder values; trade-off: risks committing secrets later.

- **[C1-B-02]** — Port 8080 Public instructions run before any server is running
  - **Location:** `src/content/chapter-1/step-5-verify.ts` (Expose Your Server section)
  - **Severity:** High | **Dimensions:** FLOW, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with prior #37 Done (port 8080 intro was added in commit 59156b0) — **possible partial regression**; the port number is now introduced but the chicken-and-egg ("port won't appear until Ch2 starts a server") remains.
  - **Options:**
    - A) Move the port-forwarding instructions to Ch2 Step 5 right after `node server.js` first runs; trade-off: splits "setup" across chapters.
    - B) Pre-declare `forwardPorts: [8080]` + `portsAttributes["8080"].visibility: "public"` in devcontainer.json; trade-off: drops a hands-on teaching moment.
    - C) Add a prominent note: "port 8080 will appear in the Ports tab only after you run `node server.js` in Chapter 2 — come back here then"; trade-off: deferred verification.

- **[C1-B-03]** — `workshop/` vs `voice-agent/` relationship never explained
  - **Location:** `src/content/chapter-1/step-4-setup.ts`
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Builders see both folders in the file explorer. Chapter only references `workshop/`. No callout explains `voice-agent/` is the reference implementation.
  - **Options:** A) One-line callout: "`voice-agent/` is the reference implementation — you're building into `workshop/`"; B) Hide `voice-agent/` via `.vscode/settings.json` file-excludes; C) skip.

- **[C1-S-01]** — Google/Amazon TTS/STT claim still omits grandfathering
  - **Location:** `src/content/chapter-1/step-2-how-it-works.ts`
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** overlaps with prior #23 Done (commit 64b7869) — partial resolution: STT/TTS split is now correct, but the "Google default for pre-2025-09-12 accounts" nuance was not added.
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Options:** A) Append "Older accounts created before Sept 12, 2025 default to Google STT"; B) skip — Codespace uses new creds.

- **[C1-E-01]** — Ch1 Step 4 concept-card refers to "the Builder" in third person (re-surfaces after #17)
  - **Location:** `src/content/chapter-1/step-4-setup.ts` "Quick Setup Behind the Curtain" concept-card
  - **Severity:** Medium | **Dimensions:** AUDIENCE, FLOW | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #17 Done (commit 2c8b26a fixed the Step 5 card; this one in Step 4 uses the same othering pattern)
  - **Issue:** Card opens with "Right now the Builder is telling the agent which phone number to call." Solo Explorers (no Builder partner) read this as someone-else's-workshop framing.
  - **Options:** A) Reframe: "Right now the workshop is configuring..."; B) add a one-line concept-card earlier in Ch1 establishing the two-track mental model; C) skip.

- **[C1-E-02]** — Ch1 Step 3 shared prose opens with "Let's trace a single conversational turn"
  - **Location:** `src/content/chapter-1/step-3-conversation-flow.ts`
  - **Severity:** Medium | **Dimensions:** PACING, AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** First sentence reads as tutorial setup rather than payoff. Explorer skims past it to the visual-step.
  - **Options:** A) Rephrase: "Every reply the agent gives takes about two seconds. Here's what happens in that window."; B) move the latency-in-two-seconds idea up; C) skip.

- **[C1-E-03]** — Ch1 Step 5 "Opening the Door for Twilio" metaphor lacks a visual anchor
  - **Location:** `src/content/chapter-1/step-5-verify.ts`
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with prior #18 Done (content was enriched in that commit, but no image was added to this card)
  - **Options:** A) Pair with a door/port illustration; B) lead with the outcome before the metaphor; C) skip — metaphor short enough.

### Chapter 2 — First Contact

- **[C2-B-01]** — Ch2 Step 3 code references `conversationHistory` without declaring it in per-connection scope
  - **Location:** `src/content/chapter-2/step-3-handle-speech.ts` (highlighted patch, `startLine: 65`)
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Step 2 solution only has `let callSid = null;` in `wss.on("connection")`. Step 3 diff uses `conversationHistory.push(...)` but never tells Builder to add the `const conversationHistory = [];` declaration. The full solution at the bottom declares it, but the inline patch does not.
  - **Options:** A) Add `const conversationHistory = [];` to the Step 2 solution's per-call state; B) change the Step 3 highlighted region to explicitly show both declarations together; C) skip — not defensible.

- **[C2-B-02]** — Ch2 Step 4 patch to `case "prompt"` has no `startLine` and minimal anchor context
  - **Location:** `src/content/chapter-2/step-4-stream-response.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #26 Done (commit c23f300 dropped startLine and pointed at the TODO anchor; this finding says the TODO anchor string in Step 3 doesn't exactly match what Step 4's prose tells Builders to look for)
  - **Issue:** Step 3 leaves `// TODO: Send to LLM and stream response back` but Step 4 prose says to find `// TODO: Send to LLM`. Close enough for most Builders but the mismatch creates doubt.
  - **Options:** A) Make the Step 3 TODO comment exactly match Step 4's grep hint; B) include one line of before/after context in the Step 4 patch; C) skip.

- **[C2-B-03]** — `transcriptionProvider` Sept-12-2025 grandfathering buried in prose
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #38 Done (commit 59156b0 added the nuance as an inline sentence; audit flagged it should be a warning callout instead)
  - **Options:** A) Promote to a `variant: "warning"` callout adjacent to the attribute list; B) always set `transcriptionProvider="Deepgram"` in the TwiML template; C) skip.

- **[C2-B-04]** — `sendText(ws, "", true)` final-token style mismatches the outbound-text example that precedes it
  - **Location:** `src/content/chapter-2/step-4-stream-response.ts`
  - **Severity:** Medium | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** The JSON example above shows `{"type":"text","token":"help you with your account.","last":true}` — content + last together. The code then sends an empty-token `last:true` separately. Pattern mismatch creates a "is this right?" moment.
  - **Options:** A) Flush any remaining content together with `last: true` in one message; B) add a one-line note that empty-token `last:true` is a valid close; C) skip.

- **[C2-S-01]** — `interruptible` default description collapses four values into a binary gloss
  - **Location:** `src/content/chapter-2/step-2-twiml-setup.ts`
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
  - **Issue:** Prose: "Defaults to `"any"` (voice and keypad)." Docs: enum is `none`, `dtmf`, `speech`, `any` with `any` the default. Builder looking up the attribute later sees the full enum and loses trust.
  - **Options:** A) Rewrite: "Values: `none`, `dtmf`, `speech`, `any`. Default: `any`"; B) add "(see docs for full enum)"; C) skip.

### Chapter 3 — Identity

- **[C3-B-01]** — Ch3 Step 4 second TwiML block silently swaps voice + provider to Google
  - **Location:** `src/content/chapter-3/step-4-language-config.ts`
  - **Severity:** Medium | **Dimensions:** FLOW, PACING | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** The Spanish example changes `voice` to `es-US-Neural2-A` and `ttsProvider` to `Google` without prose explanation. Builder who just picked an ElevenLabs voice in Step 3 wonders if they're supposed to switch TTS too.
  - **Options:** A) Add a one-line note explaining the provider swap is only because ElevenLabs' Spanish coverage is narrower; B) keep ElevenLabs voice in the Spanish example; C) skip.

- **[C3-B-02]** — Ch3 Step 5 "Restart your server" prose doesn't say to stop the old one first
  - **Location:** `src/content/chapter-3/step-5-test-identity.ts`
  - **Severity:** Medium | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** `node server.js` with the old process still running hits `EADDRINUSE`. Builder panics briefly.
  - **Options:** A) Prepend `# Ctrl+C the old server first`; B) rewrite prose "Stop your server (Ctrl+C)..."; C) skip if Ch2 drilled this.

- **[C3-B-03]** — Ch3 Step 5 curl literal `<codespace-name>` placeholder stalls paste-first Builders
  - **Location:** `src/content/chapter-3/step-5-test-identity.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #29/#30 Done (commit b2e0027 established the URL shape, but didn't swap the literal `<codespace-name>` for an auto-resolving form)
  - **Options:** A) Drop the curl block (Call Me covers it); B) use `$CODESPACE_NAME` env var: `curl -X POST "https://${CODESPACE_NAME}-8080.app.github.dev/call"` (actually runs as shown); C) add a callout above reminding Builders to substitute.

- **[C3-S-01]** — Voice ID "Rachel" not the ConversationRelay default
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts`
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder | **Verdict:** Intentionally simplified
  - **Found by:** Fact-check | **Chart ref:** overlaps with #1 Done (commit 1644c18 adopted Rachel's voice ID as the example) — audit flags that Rachel is not CR's documented default (`UgBBYS2sOqTuMpoF3BR0`); pedagogical choice is fine but could note it.
  - **Options:** A) One-liner noting CR's actual default; B) swap exemplar to `UgBBYS2sOqTuMpoF3BR0`; C) skip.

- **[C3-E-01]** — Hype: "Voice = The Agent's First Impression" / "shapes how the whole agent is perceived"
  - **Location:** `src/content/chapter-3/step-3-voice-selection.ts` Explorer concept-card
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

### Chapter 4 — Reflexes

- **[C4-B-01]** — Ch4 Step 1 first TwiML snippet contradicts its own recommended default (`interruptible="speech"` vs. tip-callout recommending `"any"`)
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** First TwiML example sets `interruptible="speech"`, tip callout right below says use `"any"`, solution uses `"any"`. Builder pasting the first snippet will have DTMF interrupts silently disabled.
  - **Options:** A) Change first example to `"any"` and keep the enum explainer in prose; B) add a `<!-- "speech" is illustrative; use "any" -->` comment; C) skip.

- **[C4-B-02]** — Ch4 Step 3 integration snippet pastes `ws.on("close", ...)` at module scope
  - **Location:** `src/content/chapter-4/step-3-silence.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #45 Done (commit 29e9340 rewrote the comment to say "add inside your EXISTING wss.on connection handler"; audit flagged the snippet's visual presentation still reads as a new registration)
  - **Options:** A) Split into two blocks — one for `handleMessage` changes, one for the nested `wss.on("connection", ...)` showing `ws.on("close")` already nested; B) promote the "add this inside" comment to a warning callout; C) skip.

- **[C4-B-03]** — Ch4 Step 3 teaching snippet includes `if (ws.readyState !== ws.OPEN) return;` guard but solution drops it
  - **Location:** `src/content/chapter-4/step-3-silence.ts`
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Add the guard back to the solution; B) drop it from the teaching snippet; C) skip.

- **[C4-B-04]** — Ch4 Step 1 refactor warning doesn't show `sendText` signature
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts` warning callout
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #11 Done (commit 5cf6a78 added the "Keep sendText" bullet; this finding asks for the signature to be shown too)
  - **Options:** A) Add a one-line code comment showing `sendText(ws, token, last = false)`; B) link back to Ch2; C) skip.

- **[C4-S-01]** — **(REGRESSION)** Prior-run fix #42 incorrectly removed `dtmfDetection` attribute from all TwiML
  - **Location:** `src/content/chapter-4/step-2-dtmf.ts` (the rewritten "Enabling DTMF Detection" prose) and every `<ConversationRelay>` block across Ch2-Ch6
  - **Severity:** Critical | **Dimensions:** FUNCTIONAL, ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** overlaps with #42 Done — **true regression**. Prior run concluded `dtmfDetection` was undocumented based on incomplete search. Twilio's TwiML noun reference explicitly lists it: *"dtmfDetection — Specifies whether the system sends Dual-tone multi-frequency (DTMF) keypresses over the WebSocket. Set to `true` to turn on DTMF events."*
  - **Source:** https://www.twilio.com/docs/voice/twiml/connect/conversationrelay and https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
  - **Issue:** Without `dtmfDetection="true"` on `<ConversationRelay>`, callers pressing keys produce zero `dtmf` WebSocket messages. Step 5 Test 2 fails silently. Step 2's rewritten prose actively denies the attribute exists.
  - **Options:**
    - A) Revert prior commit 59156b0's TwiML changes — restore `dtmfDetection="true"` on every `<ConversationRelay>` block, rewrite the Ch4 Step 2 "Enabling DTMF Detection" prose to say the attribute is required, update Ch2 Step 2's attribute breakdown list to re-add `dtmfDetection`.
    - B) Add `dtmfDetection="true"` only where it's functionally required (Ch4 Step 2 onward), accept the inconsistency in Ch2-Ch3 TwiML.
    - C) skip — indefensible; Step 5 Test 2 literally doesn't work.

- **[C4-E-01]** — Hype: "Barge-in is the feature that lets the caller interrupt at any moment, and it's half the reason a ConversationRelay agent feels alive."
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts` Explorer concept-card
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit, Simulation (Builder also flagged the same phrase in prose) | **Chart ref:** new

- **[C4-E-02]** — Hype: "Signs the Agent Feels Alive" / "the agent has proper reflexes"
  - **Location:** `src/content/chapter-4/step-5-test-reflexes.ts` Explorer concept-card
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

- **[C4-E-03]** — Ch4 Step 1 "Why This Chapter Has Four Steps" concept-card is structural filler
  - **Location:** `src/content/chapter-4/step-1-interruptions.ts`
  - **Severity:** Low | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #49 Done (commit 29e9340 added this card; audit now suggests deleting as redundant with section subtitle)
  - **Options:** A) Delete; B) move to a callout; C) keep.

### Chapter 5 — Superpowers

- **[C5-B-01]** — `lookup_order` parameter mismatch: chapter `order_id` vs. repo `order_number`
  - **Location:** `src/content/chapter-5/step-2-define-tools.ts`, `step-3-handle-tools.ts`, `step-5-test-superpowers.ts` vs. `voice-agent/tools.mjs`
  - **Severity:** High | **Dimensions:** ACCURACY, FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with prior #32 Skipped ("phantom, repo-only") — **audit reclassifies this**: test prose mentions `ORD-12345` which must hit the same parameter name the Builder typed. If the tool-picker uses the repo's `order_number` but Builder's chapter code used `order_id`, the lookup fails.
  - **Options:** A) Rename chapter param to `order_number`; B) rename repo param to `order_id`; C) skip.

- **[C5-B-02]** — Chapter teaches CommonJS `require/module.exports`; repo is ESM `.mjs`
  - **Location:** Ch5 Step 2, Step 3 code blocks
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with prior #31/#34 Skipped (phantom)
  - **Issue:** Audit re-flags but it is still a phantom per framing: Builder edits `workshop/server.js` (CJS) and never touches `voice-agent/*.mjs`. Reconfirmed SKIP.

- **[C5-B-03]** — `tell_joke` tool exists in repo + in `ToolPicker.tsx`, never mentioned in chapter prose or tests
  - **Location:** `src/components/content/ToolPicker.tsx`, `voice-agent/tools.mjs`, vs. all of Ch5 prose
  - **Severity:** Medium | **Dimensions:** FLOW, AUDIENCE | **Audience:** Both (Explorer sees the picker; Builder sees the repo)
  - **Found by:** Simulation (Builder + Explorer both flagged) | **Chart ref:** overlaps with prior #52 Skipped — audit elevates this because the widget's UI is Explorer-visible: `ToolPicker` shows "Tell a Joke" as a toggle, but Ch5 Step 5 never asks the Explorer to test it. Breaks the "toggle a tool → hear it on your call" contract.
  - **Options:** A) Add a fourth mini-test in Step 5 ("Ask the agent to tell you a joke"); B) remove `tell_joke` from ToolPicker; C) skip.

- **[C5-B-04]** — Ch5 Step 3 "Delete `streamLLMResponse` (from Chapter 2, if it's still there)" — ambiguous required state
  - **Location:** `src/content/chapter-5/step-3-handle-tools.ts`
  - **Severity:** High | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** If Builder followed Ch4 refactor, `streamLLMResponse` was renamed to `streamResponse`. The parenthetical "if it's still there" is wrong — it shouldn't still be there, and the callout implies it might be.
  - **Options:** A) Rewrite: "Your Ch4 Step 1 refactor already renamed `streamLLMResponse` to `streamResponse`. In this step, delete `handlePrompt` and `streamResponse` and paste the new tool-loop version below"; B) add a "Your server.js should currently look like X" expandable reference; C) skip.

- **[C5-B-05]** — Explorer toggle references conflict with Builder's hand-coded `transfer_to_agent`
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` Builder + Explorer prose
  - **Severity:** Critical | **Dimensions:** FLOW, AUDIENCE | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Builder prose says "say 'Transfer me'"; Explorer prose says "Handoff is off by default — the toggle on Step 4 controls it." Builder wrote the tool by hand; no toggle exists in their flow. If they share the `/api/call` path with Explorer (via the Call Me widget), the `handoffEnabled` customParameter from `workshopState` gates their hand-written code silently. Never explained.
  - **Options:** A) Add a Builder-only callout: "The Call Me widget passes `handoffEnabled` from the workshopState to your server via customParameters. If your agent doesn't hand off when asked, check the Step 4 toggle is on"; B) decouple Builder and Explorer flows; C) skip.

- **[C5-B-06]** — `reportInputDuringAgentSpeech="any"` without explanation
  - **Location:** Ch5 Step 2, Step 3 TwiML
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder | **Verdict:** Intentionally simplified
  - **Found by:** Fact-check | **Chart ref:** overlaps with #2 Done — attribute was added but no inline comment explains why it's set to `any`.
  - **Options:** A) Add a one-line prose note; B) skip.

- **[C5-S-01]** — `handoffData` example omits `reasonCode`, diverges from Twilio docs and repo
  - **Location:** `src/content/chapter-5/step-4-handoff.ts`
  - **Severity:** Medium | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/docs/voice/conversationrelay/conversationrelay-noun
  - **Issue:** Chapter's `handoffData` JSON uses `{reason, summary, callerId}`. Twilio's official pattern: `{reasonCode: "live-agent-handoff", reason, summary}`. `voice-agent/handler.mjs` (as of prior commit `4712e3f`) correctly emits `reasonCode` — so chapter and repo disagree again.
  - **Options:** A) Update chapter JSON + `/call-ended` handler to check `data.reasonCode === "live-agent-handoff"`; B) add a note that production should include `reasonCode`; C) skip.

- **[C5-E-01]** — Ch5 Step 3 Explorer visual-step uses "Your server runs the tool..."
  - **Location:** `src/content/chapter-5/step-3-handle-tools.ts`
  - **Severity:** Critical | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule: Explorer block reads like Builder-minus-code)
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Rewrite as observer voice: "The agent's back-end runs the tool and gets back..."; B) delete the Explorer visual-step (the concept-card + gears image already carry the idea); C) skip — not defensible.

- **[C5-E-02]** — Ch5 Step 2 tool-picker offers "Tell a Joke" but Step 5 never tests it
  - **Location:** `src/components/content/ToolPicker.tsx` vs. `src/content/chapter-5/step-5-test-superpowers.ts`
  - **Severity:** Medium | **Dimensions:** FLOW, AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** related to #C5-B-03 above
  - **Options:** A) Add a "Say: 'Tell me a joke'" test in Step 5; B) remove the tool from ToolPicker; C) skip.

- **[C5-E-03]** — Hype: "the agent has real superpowers."
  - **Location:** `src/content/chapter-5/step-5-test-superpowers.ts` Explorer concept-card
  - **Severity:** Medium | **Dimensions:** AUDIENCE | **Audience:** Explorer (auto-rule)
  - **Found by:** Static audit | **Chart ref:** new

### Chapter 6 — Launch

- **[C6-B-01]** — Ch6 Step 1 TwiML uses literal `<your-server-host>` placeholder; no prose instructs swap-in
  - **Location:** `src/content/chapter-6/step-1-polish.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** overlaps with #28 Done (commit dd6c4f6 introduced the placeholder across all XML blocks — but without a callout explaining it's illustrative, not code to paste literally). The full solution at the end of the step correctly uses `${req.headers.host}`, but Builder pasting the teaching snippet first hits a dead WS.
  - **Options:** A) Change the snippet to `wss://${req.headers.host}/ws` (backtick wrapper); B) add a one-line callout: "replace `<your-server-host>` with your Codespace host, or template with `${req.headers.host}`"; C) skip — not defensible for a paste-and-run block.

- **[C6-B-02]** — Ch6 Step 1 TwiML lists `interruptible="any"` + `interruptSensitivity="medium"` but prose only documents `welcomeGreetingInterruptible`, `reportInputDuringAgentSpeech`, `hints`, `debug`
  - **Location:** `src/content/chapter-6/step-1-polish.ts`
  - **Severity:** High | **Dimensions:** ACCURACY, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Issue:** Two new attributes appear in code without explanation.
  - **Options:** A) Add both to the attribute breakdown list; B) drop `interruptSensitivity` if unintroduced; C) skip.

- **[C6-B-03]** — Ch6 Step 1 `case "error"` snippet assumes `sendText` + `handleMessage` switch without anchor
  - **Location:** `src/content/chapter-6/step-1-polish.ts`
  - **Severity:** High | **Dimensions:** FUNCTIONAL, FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Add instruction line: "Inside the existing `handleMessage` switch (from Ch2), add this case alongside `setup`, `prompt`, `interrupt`, `dtmf`"; B) show full `handleMessage` with new case highlighted; C) skip.

- **[C6-B-04]** — Ch6 Step 2 "update the WebSocket connection URL in the TwiML" ambiguous for dynamic-host Builders
  - **Location:** `src/content/chapter-6/step-2-deploy.ts` "Update Twilio Webhook" section
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Clarify: "if you hard-coded a host, swap it for the production domain; if you templated `${req.headers.host}`, nothing to change"; B) drop the sentence; C) skip (step is aspirational anyway).

- **[C6-S-01]** — ElevenLabs SSML constraint phrased as "only English" instead of literal `en-us`
  - **Location:** `src/content/chapter-6/step-4-next-steps.ts` SSML callout
  - **Severity:** Low | **Dimensions:** ACCURACY | **Audience:** Builder
  - **Found by:** Fact-check | **Chart ref:** new
  - **Source:** https://www.twilio.com/en-us/changelog/conversationrelay-now-supports-ssml-tags-to-fine-tune-speech
  - **Options:** A) Rewrite: "only supports `<phoneme>`, and only when the language is `en-us`"; B) skip.

- **[C6-E-01]** — Ch6 Step 3 "Let Others Try It" shared section jolts from observer to instruction for Explorer
  - **Location:** `src/content/chapter-6/step-3-showcase.ts`
  - **Severity:** High | **Dimensions:** AUDIENCE, FLOW | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** overlaps with #13 Done (commit b71f835 rewrote the step; audit flags the "Hand the phone to someone" prose lands on Explorer as an instruction with no phone)
  - **Options:** A) Mark the section Builder-only; B) reword as observer: "Handing the phone to a fresh caller is how teams find out..."; C) skip.

- **[C6-E-02]** — Ch6 Step 1 Explorer content thin relative to the 15-min chapter
  - **Location:** `src/content/chapter-6/step-1-polish.ts`
  - **Severity:** Medium | **Dimensions:** PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Add an interactive "polish checklist" rating each of the four qualities; B) surface `demo-script` widget partially in Step 1; C) skip.

- **[C6-E-03]** — Ch6 Step 2 Explorer callout is mild marketing filler
  - **Location:** `src/content/chapter-6/step-2-deploy.ts` Explorer info callout
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer (auto-rule borderline)
  - **Found by:** Simulation | **Chart ref:** new
  - **Quote:** "That's the difference between 'someone built something cool' and 'call this number and try it yourself.'"
  - **Options:** A) Trim to one sentence pointing at Showcase; B) replace with a concrete analogy; C) skip (Ch6 Step 2 is aspirational).

- **[C6-E-04]** — Ch6 Step 4 "fast streaming" jargon appears in shared prose without framing
  - **Location:** `src/content/chapter-6/step-4-next-steps.ts` Four Qualities prose
  - **Severity:** Low | **Dimensions:** AUDIENCE | **Audience:** Explorer
  - **Found by:** Simulation | **Chart ref:** new
  - **Options:** A) Swap "fast streaming" for "responding as it thinks"; B) skip.

---

## Cross-Chapter Findings

- **[CX-01]** — `streamLLMResponse` → `streamResponse` rename cascade still orphans Builders who didn't do Ch4 refactor
  - **Severity:** High | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** overlaps with #12 Done (commit ddbcb10 added the Ch2 preview callout; audit notes Ch5 Step 3 still says "if it's still there," keeping the door open)
  - **Options:** A) Split Ch4 Step 1 into two steps; B) add a "Ch4 refactor diff" chart at the top of Ch4; C) keep.

- **[CX-02]** — Emoji still present in Ch2/Ch3 code but absent from Ch4+; aesthetic inconsistency
  - **Severity:** Low | **Dimensions:** AUDIENCE | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** overlaps with #66/#67 Skipped (by design) — audit re-flags the inconsistency between early and late chapters. User already decided emoji stay in code; reconfirming SKIP.

- **[CX-03]** — Per-call state becomes single-caller global in Ch4 with no production hardening callout in Ch6
  - **Severity:** Medium | **Dimensions:** FLOW, ACCURACY | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Add a Ch6 Step 2 callout flagging the module-scope trade-off with a pointer to a per-callSid Map; B) move state back under connection scope in Ch4; C) keep.

- **[CX-04]** — `welcomeGreeting` drift across chapters re-emerges after Ch3 Step 2 tip
  - **Severity:** Medium | **Dimensions:** FLOW | **Audience:** Builder
  - **Found by:** Static audit | **Chart ref:** overlaps with #72 Done (commit f19b902 added the tip in Ch3 Step 2) — audit flags that subsequent chapter solutions still use the generic greeting, undercutting the tip.
  - **Options:** A) Preserve persona greeting via a `WELCOME_GREETING` constant; B) add a callout in Ch4 Step 1 reminding Builders to re-paste; C) keep.

- **[CX-05]** — Explorer is inert for ~20 minutes (Ch4 Steps 1-4 + Ch5 Steps 1, 3) — no Explorer-only interactive widgets
  - **Severity:** Medium | **Dimensions:** AUDIENCE, PACING | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** new
  - **Options:** A) Add a Ch4 barge-in demo clip or silence-timeout slider; B) surface ToolPicker again in Ch5 Step 3; C) keep (observational pacing defensible).

- **[CX-06]** — "The server" defined in Ch1 Step 2 but re-explained in Ch2 Step 1, Ch2 Step 3, Ch5 Step 1
  - **Severity:** Low | **Dimensions:** FLOW | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #9 Done (the Ch1 definition card was added; later re-definitions weren't removed)
  - **Options:** A) Trim later analogies to one-line callbacks; B) keep as reinforcement; C) promote Ch1's card to a glossary sidebar.

- **[CX-07]** — DTMF Chapter-4 "keypad is a fixed shortcut" caveat is buried in Step 5, breaking expectations set in Step 2
  - **Severity:** Medium | **Dimensions:** FLOW, AUDIENCE | **Audience:** Explorer
  - **Found by:** Static audit | **Chart ref:** overlaps with #21 Done (persona adaptation for Builder was added, but the Explorer-facing expectation-setting wasn't)
  - **Options:** A) Move the "fixed responses" disclaimer up into the Ch4 Step 2 Explorer concept-card; B) let Explorer pick DTMF mappings via a widget; C) skip.

---

## Fact-Check Log

| Claim location | Workshop says | Source says | Verdict | Source URL |
|---|---|---|---|---|
| ch1/step-2 "Google and Amazon for TTS" | Correct STT/TTS split | Correct; but omits pre-2025-09-12 Google STT default | Drift (minor) | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch2/step-2 `interruptible` default | "Defaults to `any` (voice and keypad)" | Enum `none/dtmf/speech/any`, default `any` | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch2/step-5 Explorer "Try speaking while the AI is talking -- it will pause" | — | TTS pauses via `interruptible`, but new prompt not forwarded unless `reportInputDuringAgentSpeech` is set; directionally correct | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-4 "Deepgram is the default" | — | "Deepgram (or Google for pre-2025-09-12 accounts)" | Drift | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch3/step-3 `voice="21m00Tcm4TlvDq8ikWAM"` (Rachel) | Exemplar ElevenLabs voice | CR default is `UgBBYS2sOqTuMpoF3BR0`; Rachel is valid but not the default | Intentionally simplified | same |
| ch4/step-2 "there is no `dtmfDetection` attribute" | — | **`dtmfDetection` IS a documented TwiML attribute; must be `true` for dtmf messages** | **Drift (REGRESSION)** | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay + https://www.twilio.com/docs/voice/conversationrelay/websocket-messages |
| ch5/step-4 handoffData JSON shape | `{reason, summary, callerId}` | Twilio pattern: `{reasonCode: "live-agent-handoff", reason, summary}` | Drift | https://www.twilio.com/docs/voice/conversationrelay/conversationrelay-noun |
| ch5/step-2,3 `reportInputDuringAgentSpeech="any"` | Re-enables forwarding during agent speech | Valid; default changed to `none` May 2025 | Intentionally simplified | https://www.twilio.com/docs/voice/twiml/connect/conversationrelay |
| ch6/step-4 SSML "only English" for ElevenLabs | — | Literal requirement: `en-us` | Drift (minor) | https://www.twilio.com/en-us/changelog/conversationrelay-now-supports-ssml-tags-to-fine-tune-speech |
| All CR TwiML verb/noun names, message shapes, `gpt-5.4-nano`, `welcomeGreetingInterruptible` default `any`, `reportInputDuringAgentSpeech` default `none`, `debug` attribute values, `play` message with `loop:0` max 1000, error message shape, `<Connect action>` + `HandoffData` POST param | Various | All confirmed | Match | Twilio ConversationRelay docs |

---

## Phase Coverage

### Simulation (12 subagents)

- Ch1 Builder: 4 findings; biggest = `workshop/.env` doesn't exist (Critical) + port 8080 instructions pre-server (High).
- Ch1 Explorer: 3 findings; all Medium — opening-sentence pacing, "the Builder" third-person drift, unanchored door metaphor.
- Ch2 Builder: 4 findings; biggest = `conversationHistory` not declared in Step 3 (Critical).
- Ch2 Explorer: 0 findings — chapter is clean for the persona.
- Ch3 Builder: 3 findings; biggest = curl `<codespace-name>` placeholder (High).
- Ch3 Explorer: 0 findings — well-framed concept-cards throughout.
- Ch4 Builder: 4 findings; biggest = `interruptible="speech"` vs. recommended `"any"` (High) + `ws.on("close")` module-scope paste risk (High).
- Ch4 Explorer: 0 findings.
- Ch5 Builder: 5 findings; biggest = `order_id` vs. `order_number` mismatch (High) + Explorer toggle gates Builder's hand-coded tool (Critical).
- Ch5 Explorer: 2 findings; biggest = "Your server runs the tool" in Explorer visual-step (Critical, auto-rule).
- Ch6 Builder: 4 findings; biggest = `<your-server-host>` literal in teaching snippet (High).
- Ch6 Explorer: 4 findings; biggest = "Hand the phone to someone" as Explorer instruction (High).

### Fact-check (6 subagents)

- Ch1: 18 claims, 1 Drift (minor STT default grandfathering), no Intentionally simplified.
- Ch2: 14 claims, 1 Drift (`interruptible` enum), 1 Intentionally simplified.
- Ch3: 14 claims, 2 Drift (STT default again, Rachel-vs-default), 1 Intentionally simplified.
- Ch4: 18 claims, **1 Drift (dtmfDetection REGRESSION)** + 1 Intentionally simplified + 1 Ambiguous.
- Ch5: 14 claims, 1 Drift (handoffData shape), 1 Intentionally simplified.
- Ch6: 18 claims, 1 Drift (ElevenLabs `en-us` precision).

### Static audit (2 subagents)

- Builder track: 10 findings across refactor cascade, emoji inconsistency, module-scope state, welcomeGreeting drift, Ch5 Step 1 visual-step duplication, two hype-language items, Ch3 provider-table density, Ch4 Step 3 close-handler conflict, Ch5 DTMF-to-handoff wiring gap.
- Explorer track: 12 findings; biggest themes = Explorer interactive gaps (Ch4 & Ch5), redundant server re-definitions, DTMF expectation mismatch, Ch6 Step 1 thinness, five hype-language callouts, emoji inconsistency in Ch2 Builder terminal.

---

## Run Metadata

- **Date:** 2026-04-22
- **Audit command version:** v1
- **Prior chart referenced:** Yes (44-item chart from 2026-04-21, fully walked — 30 Done, 14 Skipped)
- **Re-run count today:** 1 (first run of 2026-04-22; second overall audit)
- **Regression detected:** Yes — `dtmfDetection` attribute (prior fix #42 was incorrect). See C4-S-01.

<!-- phase 4 complete 2026-04-22 -->
