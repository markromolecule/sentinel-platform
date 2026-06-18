# Task: Port New Question-Builder Experience from sentinel-web → sentinel-core

## Objective
Replicate the new question-builder UI/UX (layout, passage support, and navigation
changes) from `sentinel-web` into `sentinel-core`, with exact parity. `sentinel-web`
is reference-only — no changes are made there.

## Repositories
- **sentinel-web** — Reference implementation. Already contains the finished
  feature. DO NOT MODIFY (read-only source of truth).
- **sentinel-core** — Target codebase. All implementation work happens here.

## Reference Documents
Read in this order before implementing anything. They describe how the feature
was built in sentinel-web — treat them as the design spec, but verify against the
actual sentinel-web code/behavior if anything is ambiguous.
1. `docs/task/2026-06-17/feat-003-implementation-plan-passage-feature.md` — Passage feature
2. `docs/task/2026-06-17/feat-004-implementation-plan-builder-layout.md` — New builder layout
3. `docs/task/2026-06-18/fix-001-implementation-plan-passage-fix.md` — Passage bug fixes

## Scope: Pages in sentinel-core to update
| # | Page | Required change |
|---|------|------------------|
| 1 | Builder page | Adopt the new builder layout (feat-004) and passage support (feat-003) |
| 2 | Collection page | Redirect to the new builder page for question creation/editing (instead of current behavior) |
| 3 | Question bank page | (a) Redirect to the new builder page for question creation/editing; (b) remove the existing edit/update dialog entirely — it is replaced by the redirect |

## Acceptance Criteria
1. **Exact parity with sentinel-web** — no deviation in layout, features, or
   functional behavior (validation, save/cancel, error states, etc.). If
   sentinel-core's existing patterns conflict with sentinel-web's, sentinel-web
   wins. This is a 1:1 port, not a reinterpretation.
2. Collection page no longer opens the old question editor — it redirects to the
   new builder page.
3. Question bank page no longer opens the edit/update dialog — it redirects to the
   new builder page instead.
4. Passage feature behaves identically to sentinel-web, including the fix-001 fixes.
5. sentinel-web has zero diffs.

## Out of Scope
- Any modification to sentinel-web.
- Any new features, redesigns, or improvements beyond what exists in sentinel-web.

## Open Questions
- What is the Collection page's current create/edit flow, and what's the exact
  target route for the redirect?
- Does the builder page already exist (partially) in sentinel-core, or is it net-new?
- Should the old question bank dialog component be deleted outright, or just
  disconnected (dead code removed later)?
- Any framework/state-management differences between the two repos that might
  block a literal copy and require behavior-preserving adaptation instead?