---
title: "Phase 4 — Verify Native Attempt Rendering and Audit Scope"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 4
status: pending_manual_qa
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

- [ ] Enter a populated attempt once with proctoring disabled; capture evidence that the first prompt, card header, and answer control are visible. **Deferred to developer manual QA because no Android device/emulator is attached in this environment.**
- [x] If Phase 3 touched a bridge boundary, repeat with the relevant proctoring configuration and verify its failure cannot blank the card. **Not applicable: Phase 3 did not touch MediaPipe, audio, or LiveKit bridge code.**
- [x] Run the focused native render suites, then the full mobile test suite; distinguish pass, failure, and unavailable checks in the result.
- [x] Inspect the final diff for API/backend/shared/Web changes and reject any scope expansion.
- [x] Update the linked context/task result with the proven root cause, repair, checks, and any remaining device limitations. Promote the context only after the outcome is confirmed.

## Verification & Testing

- `pnpm --filter sentinel-mobile test`.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.
- Manual Android emulator/device attempt with populated questions.
- `git diff --name-only` confirms no `app/sentinel-api/`, database, shared-contract, or Sentinel Web modifications.

## Evidence Log

- **Focused verification passed:** `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/components/session/mobile-live-inspection-bridge.test.tsx features/exam/components/session/question-drawer.test.tsx` — 3 files passed, 43 tests passed.
- **Typecheck passed:** `pnpm --filter sentinel-mobile exec tsc --noEmit` exited successfully.
- **Full mobile suite passed:** `pnpm --filter sentinel-mobile test -- --runInBand` — 51 files passed, 366 tests passed.
- **Whitespace/syntax diff check passed:** `git diff --check` exited successfully.
- **Scope audit passed:** `git status --short -- context-factory app/sentinel-api app/sentinel-web packages/shared packages/db packages/services` returned no changes.
- **Changed-file audit:** `git diff --name-only` lists Sentinel Mobile session/test/config/dependency files and the task evidence documents only.
- **Manual native verification unavailable here:** `adb devices` required elevated local debug socket access; after approval it listed no attached Android devices/emulators. The developer will perform the populated-attempt manual QA outside this environment.
- **Release readiness:** Conditional. Automated verification and scope audit pass, but final release confidence still depends on developer manual QA confirming the first prompt, card header, and answer control on a real emulator/device.

## Risks & Rollback

- **Risk:** A passing mocked test hides a failing actual device path.
- **Mitigation:** Native attempt capture is required for completion; do not claim resolution from static/unit tests alone.
- **Rollback:** Revert the mobile-only repair and leave the improved regression harness/diagnostic record available for continued investigation where compatible.
