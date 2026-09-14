---
title: "Diagnose and Remediate Sentinel Mobile Attempt QuestionCard Runtime Rendering"
type: task
status: pending_manual_qa
created: "2026-09-13"
tags: [task, defect-resolution, sentinel-mobile, exam-session, question-rendering]
---

# Diagnose and Remediate Sentinel Mobile Attempt QuestionCard Runtime Rendering

## Outcome

Establish a repeatable native rendering diagnosis for the mobile attempt body, correct the smallest proven `QuestionCard`-viewport defect, and prevent regression across all eight supported question types. The plan must not change `sentinel-api`, its data contract, the database, or Sentinel Web.

## Pre-planning record

### Actors and goals

- **Student:** Can see the current prompt and answer control immediately after entering an active mobile attempt.
- **Instructor:** Retains current proctoring behavior; a question-rendering repair must not weaken camera, MediaPipe, audio, or LiveKit policy.
- **Mobile developer / QA:** Can distinguish absent data, a missing card mount, a collapsed viewport, and a leaf-input failure without asking a student to repeatedly submit blank attempts.

### Domain language

- **Question collection:** The adapted `MobileSessionQuestion[]` rendered by the session screen and represented by the footer grid.
- **Question viewport:** The flex child between `SessionHeader` and the fixed `SessionFooter` which owns `QuestionCard`.
- **Native render contract:** A test that renders the React Native component tree rather than inspecting elements returned from direct function calls.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
| --- | --- | --- | --- | --- | --- |
| SC-01 | Student enters an attempt with a populated grid | Question adapter returns at least one item | Current prompt, card header, and type-specific control are visible | A bounded card-local recovery state identifies unavailable question or render failure | Planned |
| SC-02 | Any of eight question types is first in the attempt | Valid normalized `MobileSessionQuestion` | Native render test exposes prompt and the expected input family | Test failure identifies the exact type/component boundary | Planned |
| SC-03 | Proctoring is disabled | Existing attempt data remains populated | Question viewport still renders | Confirms repair has no hidden proctoring dependency | Verified input boundary |
| SC-04 | Proctoring is enabled but bridge initialization fails | Camera/MediaPipe/LiveKit failure | Question viewport remains usable and the bridge failure is separately observable | No blank attempt body or silent failure | Planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| DEC-01 | How should the unknown native body-render failure be addressed? | Use a diagnostic-first, card-local approach: observe card mount/layout and establish a real native render contract before changing presentation logic. | The footer grid proves the collection exists, while adapter/navigation/drawer tests pass; static source cannot prove the native view hierarchy. | (1) Patch the API/adapter despite populated data; (2) disable all proctoring despite reproduction with it disabled; (3) recommended diagnostic-first approach. | Phases 1–2 |
| DEC-02 | Does this require an ADR? | No. The proposed work stays inside the existing mobile presentation and test boundaries and does not alter a durable cross-system architecture or public contract. | API, shared data model, database, Web, and backend remain unchanged. | Recording a routine component/test correction as an architecture decision. | This task |

### Unknowns and blockers

- **Unknown:** Whether the native failure is an absent/collapsed `QuestionCard`, a failing child subtree, or an installed bundle mismatch. Static inspection cannot distinguish these cases.
- **Constraint:** The student cannot provide repetitive reproductions or logs. Phase 1 must make the state inspectable on a developer emulator/device without requiring production attempt submissions.
- **Checkpoint:** Do not begin the source correction in Phase 3 until Phase 1 records the observed failure classification and the responsible mobile-only boundary.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| AC-01 | SC-01, DEC-01 | A populated attempt always shows a visible `QuestionCard` header and prompt, or a bounded diagnostic recovery state; it never presents a blank body. | `exam-session-screen.tsx`, `question-card.tsx`, new card-local diagnostic boundary if required | Developer emulator/device capture for populated attempt | Planned |
| AC-02 | SC-02 | Each supported question type has a native render assertion that traverses the real React component tree and verifies prompt plus input family. | `question-card.test.tsx`, test setup/config, direct test dependencies if required | Focused test command passes for all eight types | Completed |
| AC-03 | SC-03 | The repair remains correct with proctoring disabled. | Mobile-only session composition | Emulator/device verification with camera/proctoring disabled | Pending manual QA |
| AC-04 | SC-04 | A bridge failure cannot prevent question content from mounting; any status shown is bounded and non-sensitive. | `exam-session-screen.tsx`, `mobile-mediapipe-bridge.tsx` only if Phase 1 evidence requires it | Failure-injection test or emulator validation | Pending manual QA |
| AC-05 | All | The mobile suite is truthful: no direct-function element-tree test is reported as native render coverage, and existing unrelated failures are explicitly resolved or reported. | Test configuration and affected suites | `pnpm --filter sentinel-mobile test`; `pnpm --filter sentinel-mobile exec tsc --noEmit` | Completed |
| AC-06 | Scope boundary | No files in `app/sentinel-api/`, shared backend contracts, schemas, or Sentinel Web are changed. | Change-scope review | `git diff --name-only` review | Completed |

## Scope

- Mobile attempt session composition, `QuestionCard`, its leaf inputs, and native component test setup.
- Non-sensitive, bounded client-side render observability needed to classify an otherwise blank body.
- Isolating MediaPipe/LiveKit only if Phase 1 demonstrates their code still prevents the card from mounting.

## Non-goals

- Changing `app/sentinel-api`, API response shapes, database schema, grading, or Sentinel Web.
- Disabling proctoring, lowering security policy, or adding broad retries/fallbacks that conceal a render failure.
- A durable architecture decision or new rendering framework.

## Constraints and decisions

- Preserve current user work; the workspace already contains unrelated modified and untracked mobile/checkup files.
- Keep diagnostics scoped to the active, authenticated mobile attempt and never emit prompt text, answers, tokens, or camera data to logs.
- Favor existing React Native/Expo dependencies and patterns; any new direct test dependency must be declared in `app/sentinel-mobile/package.json` and locked through the repository package manager.
- Phase 3 is deliberately gated by Phase 1 evidence; it is not authorization to guess at a fix.

## Phases

- [ ] `phase-01-native-attempt-render-classification.md` — Phase 1: Classify the native QuestionCard mount/layout failure without touching API data
- [x] `phase-02-native-render-regression-harness.md` — Phase 2: Replace invalid element-tree coverage with native render regression coverage
- [x] `phase-03-evidence-selected-mobile-repair.md` — Phase 3: Apply the smallest mobile-only repair selected by the classification checkpoint
- [ ] `phase-04-native-verification-and-scope-audit.md` — Phase 4: Verify the fixed attempt on an emulator/device and audit scope; automated audit complete, developer manual QA pending

## Verification

- **Phase 4 automated verification passed:** `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/components/session/mobile-live-inspection-bridge.test.tsx features/exam/components/session/question-drawer.test.tsx` — 3 files passed, 43 tests passed.
- **Phase 4 typecheck passed:** `pnpm --filter sentinel-mobile exec tsc --noEmit` — exits successfully.
- **Phase 4 full mobile suite passed:** `pnpm --filter sentinel-mobile test -- --runInBand` — 51 files passed, 366 tests passed.
- **Phase 4 scope audit passed:** `git status --short -- context-factory app/sentinel-api app/sentinel-web packages/shared packages/db packages/services` returned no changes.
- **Phase 4 manual native verification unavailable here:** `adb devices` required elevated local debug socket access; after approval it listed no attached Android devices/emulators. Developer manual QA remains pending.
- **Approved Phase 3 deviation:** The developer explicitly authorized continuing to Phase 3 before Phase 1 manual emulator/device classification, with manual QA deferred until Phase 4.
- **Selected during Phase 3:** Layout/viewport hardening. Phase 2 proved all `QuestionCard` leaf input families render through nested JSX, while API/adapter and proctoring branches remain unsupported by current evidence.
- **Passed during Phase 3:** `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx` — 1 file passed, 27 tests passed.
- **Passed during Phase 3:** `pnpm --filter sentinel-mobile exec tsc --noEmit` — exits successfully after restoring the card content growth/footer-safe inset.
- **Passed during Phase 3:** `pnpm --filter sentinel-mobile test -- --runInBand` — 51 files passed, 366 tests passed.
- **Approved Phase 2 deviation:** The developer explicitly authorized continuing to Phase 2 before Phase 1 manual emulator/device classification, with manual QA deferred until Phase 4.
- **Passed during Phase 2:** `pnpm --filter sentinel-mobile exec vitest run features/exam/components/session/question-card.test.tsx features/exam/components/session/mobile-live-inspection-bridge.test.tsx features/exam/components/session/question-drawer.test.tsx` — 3 files passed, 42 tests passed.
- **Passed during Phase 2:** `pnpm --filter sentinel-mobile exec tsc --noEmit` — exits successfully after replacing the `QuestionCard` test harness and adding the Vitest setup.
- **Passed during Phase 2:** `pnpm --filter sentinel-mobile test -- --runInBand` — 51 files passed, 365 tests passed.
- **Passed during Phase 2:** `git diff --check` — exits successfully.
- **Passed during Phase 1:** `pnpm --filter sentinel-mobile exec tsc --noEmit` — exits successfully after adding the development-only render classification overlay and typed card render-status callback.
- **Unavailable during Phase 1:** `adb devices` — after elevated local debug socket access, no Android emulator/device was attached. The populated attempt screenshot and exact native failure classification remain pending.
- **Scope during Phase 1:** `git diff --name-only` shows only Sentinel Mobile session/task documentation files changed; no `app/sentinel-api`, Sentinel Web, database, or shared contract files were modified.
- **Passed during planning:** `pnpm --filter sentinel-mobile exec vitest run features/exam/lib/mobile-question-adapter.test.ts features/exam/hooks/session/use-exam-session-navigation.test.ts features/exam/hooks/session/use-drawer-animation.test.ts` — 20/20 passed; supports adapter/navigation/drawer boundaries only.
- **Passed during planning:** `pnpm --filter sentinel-mobile exec tsc --noEmit` — exits successfully; does not prove native rendering.
- **Failed during planning:** `pnpm --filter sentinel-mobile test -- --runInBand` — 19 `QuestionCard` assertions fail after the uncommitted JSX change because its harness does not render nested JSX; two Expo-dependent suites also fail to initialize. This is a verification gap, not proof of the production symptom.

## Deviations

- The linked context remains `draft` because the exact native failure classification is unavailable without an emulator/device render. This plan intentionally starts with that evidence gate.

## Result

Implementation and automated verification are complete, with release readiness conditional on developer manual QA. The invalid direct-function `QuestionCard` test has been replaced with nested React render coverage, targeted Expo initialization failures are resolved, the mobile-only layout hardening repair is covered by a native render assertion, and the full Sentinel Mobile test suite passes. No API, Sentinel Web, database, shared contract, packages/services, or context-factory files are changed.
