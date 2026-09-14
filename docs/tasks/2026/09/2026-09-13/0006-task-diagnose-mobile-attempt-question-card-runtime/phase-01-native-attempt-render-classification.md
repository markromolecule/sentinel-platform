---
title: "Phase 1 — Classify Native Attempt QuestionCard Rendering"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 1
status: in_progress
created: "2026-09-13"
tags: [task, phase, sentinel-mobile, diagnosis]
---

# Phase 1 — Classify Native Attempt QuestionCard Rendering

## Objective

Classify the blank attempt body as one of: missing card mount, zero/collapsed question viewport, or failing prompt/input subtree. Produce developer-observable evidence without touching API data or requiring students to repeat blank submissions.

## Dependencies & Prerequisites

- Canonical investigation: `docs/context/September/13/investigate-mobile-attempt-question-rendering.md`.
- A developer-controlled Android emulator or device that can enter a known populated test attempt.
- Preserve existing uncommitted work; inspect `git status --short` before editing.

## Impacted Files & Components

- `app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx` — current viewport composition; potential parent-level layout measurement boundary.
- `app/sentinel-mobile/features/exam/components/session/question-card.tsx` — current card mount and visible recovery state.
- `app/sentinel-mobile/features/exam/components/session/question-card-unavailable.tsx` — existing user-facing unavailable state, if reused.
- New mobile-only diagnostic helper/component — create only if existing presentation components cannot expose the required mount/layout classification without duplicating concerns.

## Implementation Tasks

- [ ] Record an attempt fixture whose grid visibly contains at least one question; verify no API or shared model changes are necessary.
- [x] Add a development-only, non-sensitive render classification at the question viewport/card boundary. It must distinguish: `questions` count, whether `currentQuestion` exists, whether the card mounted, and non-zero parent/card layout dimensions. It must not include prompt text, answers, identifiers, tokens, camera images, or LiveKit credentials.
- [ ] Reproduce once on an emulator/device with proctoring disabled and record the classification plus a screenshot. If feasible, exercise the bridge-failure state separately without submitting an attempt.
- [ ] Select and record one failure class in this task’s Phase 1 evidence before editing rendering behavior: missing mount, collapsed layout, or failing leaf subtree.
- [ ] **Developer checkpoint:** Stop after the classification is recorded. Do not begin Phase 3 unless the evidence names the responsible boundary.

## Verification & Testing

- Manual emulator/device: populated footer grid, visible classification, and screenshot of the attempt body.
- Confirm the implementation exposes no exam content or authentication/proctoring secrets in developer output.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.

## Evidence Log

- **Implemented:** Added a development-only render classification overlay at the mobile attempt question viewport. The overlay reports only `questionCount`, one-based `currentIndex`, `hasCurrentQuestion`, `cardMounted`, viewport layout, card layout, and non-zero layout booleans.
- **Implemented:** Added a typed `QuestionCardRenderStatus` callback from `QuestionCard` to `ExamSessionScreen` so the parent can distinguish a mounted card from a measured, non-zero card layout.
- **Scope check:** Runtime changes are limited to `app/sentinel-mobile/features/exam/components/session/` and `app/sentinel-mobile/features/exam/components/session/inputs/question-card.types.ts`. No `app/sentinel-api`, Sentinel Web, database, or shared contract files were changed.
- **Verification passed:** `pnpm --filter sentinel-mobile exec tsc --noEmit` exited successfully.
- **Manual verification unavailable:** `adb devices` required elevated local debug socket access; after approval it started successfully but listed no attached Android devices/emulators. The populated-attempt screenshot and final failure classification remain pending.

## Risks & Rollback

- **Risk:** Diagnostics expose sensitive assessment content or persist beyond development.
- **Mitigation:** Use only count/boolean/layout values, guard by development configuration, and remove or disable the diagnostic after classification.
- **Rollback:** Revert only the Phase 1 diagnostic files; no data/API state requires rollback.
