---
title: "Phase 3 — Apply the Evidence-Selected Mobile-Only Repair"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 3
status: completed
created: "2026-09-13"
tags: [task, phase, sentinel-mobile, remediation]
---

# Phase 3 — Apply the Evidence-Selected Mobile-Only Repair

## Objective

Apply one minimal, evidence-selected repair to the classified mobile render boundary. Do not broaden scope to API, data contracts, or proctoring policy.

## Dependencies & Prerequisites

- Phase 1 records exactly one root-failure class and its emulator/device evidence.
- Phase 2 establishes a failing native regression test for that class where practical.
- Developer approves proceeding past the Phase 1 checkpoint.
- **Approved deviation:** The developer explicitly deferred Phase 1 manual emulator/device classification to Phase 4 and authorized Phase 3 execution after Phase 2 established truthful native render coverage.

## Impacted Files & Components

- **Missing-card result:** `exam-session-screen.tsx` and `question-card.tsx` only, unless the Phase 1 evidence names a narrower existing child.
- **Collapsed-viewport result:** `exam-session-screen.tsx`, `question-card.tsx`, and `session-footer.tsx` only if the measured layout requires a footer-safe inset or ownership correction.
- **Leaf-subtree result:** the named file under `features/exam/components/session/inputs/` plus `question-card.tsx` only when the failure is at its dispatch boundary.
- **Bridge-interference result:** `mobile-mediapipe-bridge.tsx` or `mobile-live-inspection-bridge.tsx` only after Phase 1 disproves the currently established proctoring-disabled boundary.

## Implementation Tasks

- [x] Choose the repair branch that exactly matches the Phase 1 failure class; record the selected boundary and rejected branches in this phase’s evidence log.
- [x] Preserve `MobileSessionQuestion` and API contracts. Do not modify `app/sentinel-api`, `packages/shared` contracts, grading, or question order as a render workaround.
- [x] Keep presentation, session state, and proctoring integrations separate: the card renders supplied state; the session screen owns layout; proctoring bridges cannot own or block question display.
- [x] Add the smallest user-facing recovery state only when the classified boundary can fail; do not replace valid content with a generic blank/loading view.
- [x] Make the Phase 2 native regression test pass and add an adjacent case for the corrected failure boundary.

## Verification & Testing

- The Phase 1 reproduction shows prompt, card header, and appropriate answer control for the populated first question.
- Focused native render tests pass for the corrected type and all eight supported types.
- Proctoring-disabled path remains correct; test proctoring-enabled behavior only if the changed boundary touches it.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.

## Evidence Log

- **Selected repair branch:** Collapsed/unsafe question viewport hardening. Phase 2 proved the `QuestionCard` and all eight leaf input families render through nested JSX, so the remaining mobile-only repair should preserve a non-collapsing scroll content area with footer-safe space.
- **Repair applied:** `QuestionCard` now keeps `contentContainerStyle.flexGrow = 1` and restores a 140px bottom inset so prompt/input content fills the question viewport and can scroll above the fixed absolute footer.
- **Rejected branch:** API/adapter repair. The footer grid count and prior adapter/navigation tests show the mobile question collection is populated.
- **Rejected branch:** Leaf-subtree repair. The Phase 2 native render suite passes for all eight question types and their expected controls.
- **Rejected branch:** Proctoring/bridge repair. The user reported the blank body also occurs with proctoring disabled, and Phase 2’s targeted live bridge test initializes and passes.
- **Recovery state:** No new generic replacement state was added in Phase 3 because `QuestionCardUnavailable` and the Phase 1 diagnostic overlay already cover missing-question and classification states; replacing valid content would risk hiding the actual prompt.
- **Regression coverage:** Added a native render assertion that the `ScrollView` remains `flex: 1` and its content container keeps `flexGrow: 1` plus `paddingBottom: 140`.
- **Verification passed:** `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx` — 1 file passed, 27 tests passed.
- **Verification passed:** `pnpm --filter sentinel-mobile exec tsc --noEmit` exited successfully.
- **Verification passed:** `pnpm --filter sentinel-mobile test -- --runInBand` — 51 files passed, 366 tests passed.
- **Scope check:** Phase 3 runtime/test changes are limited to `app/sentinel-mobile/features/exam/components/session/question-card.tsx` and `app/sentinel-mobile/features/exam/components/session/question-card.test.tsx`. No `app/sentinel-api`, Sentinel Web, database, shared contract, or `context-factory` files were changed.
- **Deferred:** Device/emulator proof for the populated attempt remains deferred to Phase 4 by developer instruction.

## Risks & Rollback

- **Risk:** A speculative layout or bridge change creates a regression in camera capture, footer navigation, or answer controls.
- **Mitigation:** Limit edits to the named classified boundary and retain the Phase 2 regression suite.
- **Rollback:** Revert the single repair commit after preserving the diagnostic evidence and test harness; API/data rollback is not applicable.
