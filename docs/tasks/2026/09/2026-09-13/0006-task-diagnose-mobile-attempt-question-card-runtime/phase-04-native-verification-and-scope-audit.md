---
title: "Phase 4 — Verify Native Attempt Rendering and Audit Scope"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 4
status: planned
created: "2026-09-13"
tags: [task, phase, sentinel-mobile, verification]
---

# Phase 4 — Verify Native Attempt Rendering and Audit Scope

## Objective

Verify the repaired attempt body on a developer-controlled native runtime, confirm all available automated checks, and prove the work stayed within the mobile-only boundary.

## Dependencies & Prerequisites

- Phases 1–3 complete and the selected repair is documented.
- Developer-controlled emulator/device and populated test attempt available.

## Impacted Files & Components

- No new runtime files expected.
- Task evidence documents only, if results need to be recorded.

## Implementation Tasks

- [ ] Enter a populated attempt once with proctoring disabled; capture evidence that the first prompt, card header, and answer control are visible.
- [ ] If Phase 3 touched a bridge boundary, repeat with the relevant proctoring configuration and verify its failure cannot blank the card.
- [ ] Run the focused native render suites, then the full mobile test suite; distinguish pass, failure, and unavailable checks in the result.
- [ ] Inspect the final diff for API/backend/shared/Web changes and reject any scope expansion.
- [ ] Update the linked context/task result with the proven root cause, repair, checks, and any remaining device limitations. Promote the context only after the outcome is confirmed.

## Verification & Testing

- `pnpm --filter sentinel-mobile test`.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.
- Manual Android emulator/device attempt with populated questions.
- `git diff --name-only` confirms no `app/sentinel-api/`, database, shared-contract, or Sentinel Web modifications.

## Risks & Rollback

- **Risk:** A passing mocked test hides a failing actual device path.
- **Mitigation:** Native attempt capture is required for completion; do not claim resolution from static/unit tests alone.
- **Rollback:** Revert the mobile-only repair and leave the improved regression harness/diagnostic record available for continued investigation where compatible.
