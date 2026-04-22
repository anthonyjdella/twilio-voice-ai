# Prior Audit Chart Reference

The prior 25-item audit chart exists in the user's auto-memory at `~/.claude/projects/-Users-adellavecchia-Desktop-Git-Projects/memory/project_voice_ai_audit.md`.

When running the merge phase, read that file and cross-reference findings.

## Tagging rules

For each finding in the current audit:

- If the issue is NOT mentioned in the prior chart → tag `Chart ref: new`
- If the issue overlaps with a prior item marked DONE → tag `Chart ref: overlaps with #N Done` (suggests possible regression if the item was truly fixed)
- If the issue overlaps with a prior item marked SKIPPED → tag `Chart ref: overlaps with #N Skipped` (user chose not to fix it previously; surface again for reconsideration)

## How to compare

An "overlap" means:
- Same chapter
- Same or related content area (same step, same widget, same paragraph)
- Same underlying issue (same audience, same root cause)

Small textual differences in the issue description don't prevent overlap. The test is: "would the user read this new finding and say 'yeah, that's the same thing I already looked at as #N'?"

## Output requirement

Every finding must include one of:
- `Chart ref: new`
- `Chart ref: overlaps with #N Done`
- `Chart ref: overlaps with #N Skipped`

Do NOT exclude findings that overlap with Done items — surface them anyway. The tag lets the user decide whether it's a regression.

## If the memory file is unavailable

If `project_voice_ai_audit.md` doesn't exist or can't be read, tag every finding `Chart ref: new` and note at the top of the report: "Prior chart unavailable — all findings tagged as new."
