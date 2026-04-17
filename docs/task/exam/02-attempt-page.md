# Phase 2 — Active Attempt Runtime

## Dependencies

- Preview work from `01-preview-routes.md` may help validate shared UI, but it is not required to define runtime architecture
- The current student attempt base is:

```txt
app/sentinel-web/src/app/(protected)/student/exam/[id]/monitoring/page.tsx
```

## Hard Stop For UI Implementation

Do **not** proceed with final attempt-page UI implementation until the user provides a reference image for the desired attempt-page design.

Allowed before the image is provided:

- inspecting the current attempt page
- preparing data contracts
- preparing reusable engine primitives
- defining persistence, timer, and runtime behavior

Blocked until the image is provided:

- final layout implementation
- final visual hierarchy
- final recreation of the attempt page shell

## Goal

Turn the current mock-driven student `monitoring` page into the real exam attempt runtime. This phase defines how the active attempt behaves once the student has passed readiness checks and a session has already been created or resumed.

---

## Initial Check

Before implementation:

- inspect the current attempt page and all local hooks under `student/exam/[id]/monitoring/`
- inspect current exam/session APIs and tests:
  - `packages/services/src/api/exams.ts`
  - `app/sentinel-api/src/modules/examination/flow/flow.test.ts`
- inspect which attempt behaviors already exist and which are still mock-driven
- identify which parts can be prepared now without finalizing the UI before the design reference arrives

---

## Current State

The current page already provides a shell for:

- header and timer display
- question navigation
- answer interaction
- monitoring hooks

It is still incomplete because it depends on mock data and does not yet represent the real persisted attempt lifecycle.

---

## Runtime Contract

This phase must build on the existing system contracts:

- session bootstrap uses `startExamSession` and `app/sentinel-api/src/modules/examination/flow/`
- exam configuration comes from the existing configuration state and config snapshot
- telemetry remains the current ingestion pipeline
- attempt state persists against the existing `exam_attempts` domain, not a new parallel model

---

## Tasks

### Task 2.1 — Replace mock exam data with real exam data

- Remove runtime dependence on `MOCK_EXAMS` and `MOCK_QUESTIONS`
- Use the actual exam detail query and shared exam question shape
- Ensure question order respects the active configuration and session snapshot

### Task 2.2 — Reuse session bootstrap and resume flow

- Treat the session returned by `startExamSession` as the canonical attempt boundary
- Reuse `configSnapshot` and stored session metadata instead of recomputing runtime policy ad hoc
- Support resume behavior when the flow service returns `isResumed: true`

### Task 2.3 — Define answer state and persistence

- Replace local-only answer state with attempt-backed persistence
- Persist answers against the current attempt model under the existing exam flow domain or a clearly scoped sibling attempt module
- Do not invent a second attempt schema
- Ensure the page can restore saved answers on reload or resume

### Task 2.4 — Define timer and submission behavior

- Use the real exam duration and attempt start time
- Ensure timer behavior survives reload and reconnect
- Align submission behavior to current exam settings, including review rules where applicable
- Support explicit submit and timeout-driven submit without introducing a second runtime policy source

### Task 2.5 — Enforce current configuration keys

The attempt page must honor the existing configuration model only. This includes:

- `settings.allowReview`
- `settings.shuffleQuestions`
- `settings.randomizeChoices`
- `configuration.screenLock`
- `configuration.webSecurity.*`
- `configuration.aiRules.*` only when those signals are actually integrated

If a runtime behavior is needed but not represented by current config, document it as a gap instead of silently inventing a new field.

### Task 2.6 — Keep design references optional, not blocking

- UI references are still useful for layout refinement
- They must not block runtime architecture, state flow, or contract work

### Task 2.7 — Wait for the attempt-page reference image before final UI build

- stop before implementing the final attempt-page layout
- once the image is provided:
  - analyze the layout
  - map the layout to reusable engine primitives
  - recreate the design without hallucinating missing structure
  - keep visual fidelity aligned to the provided sample while preserving current runtime contracts

---

## Backend Test Requirement

If this phase changes backend session or attempt behavior, create or update backend tests first. Minimum expected coverage:

- `app/sentinel-api/src/modules/examination/flow/flow.test.ts`
- a new or existing backend test for attempt persistence once answer-save or submit endpoints/modules are introduced

Tests must cover:

- session start
- resume behavior
- duplicate-attempt prevention
- timeout or submit-related state transitions when implemented

---

## Deliverables Checklist

- [ ] Student `monitoring` no longer depends on mock exam/question data
- [ ] Runtime uses the existing session bootstrap and resume contract
- [ ] Answers are attempt-backed and recoverable
- [ ] Timer and submission flow reflect real attempt state
- [ ] Runtime behavior reads current configuration keys only
- [ ] No new parallel attempt model or configuration contract is introduced
- [ ] Final attempt-page UI implementation is blocked until the reference image is provided
- [ ] Backend tests are created or updated for any session or attempt-domain backend changes

---

## Exit Criteria

This phase is complete when `student/exam/[id]/monitoring` behaves as the real active exam attempt instead of a mock-driven UI shell, and the final attempt-page UI has only been implemented after the reference image was provided.
