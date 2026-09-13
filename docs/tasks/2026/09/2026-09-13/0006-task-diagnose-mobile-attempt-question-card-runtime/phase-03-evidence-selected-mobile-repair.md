---
title: "Phase 3 — Apply the Evidence-Selected Mobile-Only Repair"
type: phase
parent: "0006-task-diagnose-mobile-attempt-question-card-runtime"
phase: 3
status: planned
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

## Impacted Files & Components

- **Missing-card result:** `exam-session-screen.tsx` and `question-card.tsx` only, unless the Phase 1 evidence names a narrower existing child.
- **Collapsed-viewport result:** `exam-session-screen.tsx`, `question-card.tsx`, and `session-footer.tsx` only if the measured layout requires a footer-safe inset or ownership correction.
- **Leaf-subtree result:** the named file under `features/exam/components/session/inputs/` plus `question-card.tsx` only when the failure is at its dispatch boundary.
- **Bridge-interference result:** `mobile-mediapipe-bridge.tsx` or `mobile-live-inspection-bridge.tsx` only after Phase 1 disproves the currently established proctoring-disabled boundary.

## Implementation Tasks

- [ ] Choose the repair branch that exactly matches the Phase 1 failure class; record the selected boundary and rejected branches in this phase’s evidence log.
- [ ] Preserve `MobileSessionQuestion` and API contracts. Do not modify `app/sentinel-api`, `packages/shared` contracts, grading, or question order as a render workaround.
- [ ] Keep presentation, session state, and proctoring integrations separate: the card renders supplied state; the session screen owns layout; proctoring bridges cannot own or block question display.
- [ ] Add the smallest user-facing recovery state only when the classified boundary can fail; do not replace valid content with a generic blank/loading view.
- [ ] Make the Phase 2 native regression test pass and add an adjacent case for the corrected failure boundary.

## Verification & Testing

- The Phase 1 reproduction shows prompt, card header, and appropriate answer control for the populated first question.
- Focused native render tests pass for the corrected type and all eight supported types.
- Proctoring-disabled path remains correct; test proctoring-enabled behavior only if the changed boundary touches it.
- `pnpm --filter sentinel-mobile exec tsc --noEmit`.

## Risks & Rollback

- **Risk:** A speculative layout or bridge change creates a regression in camera capture, footer navigation, or answer controls.
- **Mitigation:** Limit edits to the named classified boundary and retain the Phase 2 regression suite.
- **Rollback:** Revert the single repair commit after preserving the diagnostic evidence and test harness; API/data rollback is not applicable.
