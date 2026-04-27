# Fix Attempt Page Implementation Plan

## Source

This plan is based on [docs/fix-attempt-page.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/fix-attempt-page.md).

## Objective

Stabilize the student attempt flow and complete the missing exam-runtime controls by:

- fixing the attempt page interaction bug after a student commits a monitored event and returns
- making reconnect and resume behavior explicit, countable, and instructor-auditable
- preventing automatic student entry from lobby to attempt when manual admission is required
- validating that exam rules and monitoring configuration actually affect runtime behavior
- recalibrating MediaPipe behavior for glasses, low-quality cameras, mobile devices, and low-end hardware

## Current Repo State

- Student session start and resume already exist through:
    - [app/sentinel-api/src/modules/examination/flow/data/session.repository.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/data/session.repository.ts)
    - [app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts)
    - [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-session.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.ts>)
- Student lobby gating already reads runtime access and starts sessions from:
    - [app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx>)
- Runtime access already supports `open`, `locked`, `reopened`, and `closed` through:
    - [app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.ts)
    - [packages/shared/src/schema/exams/runtime-access-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/runtime-access-schema.ts)
- Instructor monitoring already has exam-wide lock, reopen, reset, and close controls in:
    - [app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx>)
- Exam configuration already persists `settings` and `configuration`, but it does not yet expose a “manual admit from lobby” rule:
    - [packages/shared/src/schema/exams/assessment-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)
    - [app/sentinel-web/src/features/exams/\_components/forms/fields/settings-fields.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/forms/fields/settings-fields.tsx)
- Monitoring and telemetry infrastructure already exist for incidents and MediaPipe:
    - [app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts)
    - [app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts)
    - [app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts)

## 1-3-1 Analysis

### One Goal

- Deliver a reliable exam-entry and attempt-runtime workflow where student access is intentional, reconnects are measurable, monitoring rules are enforceable, and MediaPipe behavior is predictable across real devices.

### Three Viable Options

#### Option 1: Patch The Attempt Page Only

- Fix the UI lockup, add a lobby redirect on refresh, and leave admission control and rule verification for later.

Pros:

- Fastest visible fix.

Cons:

- Leaves reconnect semantics ambiguous.
- Does not solve instructor-controlled lobby admission.
- Risks another round of regressions because runtime rules stay split across frontend and backend.

#### Option 2: Phased Runtime-Access Extension On Top Of Existing Flow [RECOMMENDED]

- Keep the current `flow`, `runtime-access`, `configuration`, and `monitoring` modules, then extend them in phases for reconnect policy, instructor admission, rule verification, and MediaPipe recalibration.

Pros:

- Best fit for the code already in the repo.
- Reuses working access-control and monitoring primitives.
- Lets us test each behavior change independently.

Cons:

- Requires careful contract updates across API, shared schema, and UI.

#### Option 3: New Dedicated Exam Admission Subsystem

- Introduce a separate admission table and a brand-new session authorization workflow before touching the existing pages.

Pros:

- Clean long-term separation of concerns.

Cons:

- Highest delivery risk for the current scope.
- Overlaps heavily with existing runtime-access and session logic.
- Too large for a bug-fix-driven milestone.

### One Recommended Outcome

- Proceed with **Option 2** and implement this work as a phased extension of the existing runtime-access and session flow.

## Finalized V1 Decisions

- The attempt-page lock bug should be fixed before any new admission feature is added.
- Lobby re-entry should be the only allowed path for a counted reconnect.
- A plain refresh of the attempt page should not silently recreate the attempt state in-place if the intended product rule is “refresh means reconnect.”
- Instructor-controlled admission should be modeled as runtime access, not as a purely client-side button disable.
- The exam configuration must contain a clear rule for:
    - automatic admission when the exam opens
    - manual instructor admission from monitoring
- Validation of `shuffleQuestions` and monitoring toggles must be backed by tests, not by UI assumption only.
- MediaPipe recalibration should be introduced as threshold and calibration tuning first, not as a full new proctoring architecture.

## Phase Plan

### Phase 0 - Scope Freeze And Contract Alignment

#### Goal

- Lock the exact runtime behavior before implementation starts.

#### Tasks

-> [x] Confirm the expected reconnect rule for `attempt` page refresh:
student is redirected to `lobby`, must click continue again, and that action increments reconnect usage.
-> [x] Confirm whether “manual admit” is exam-wide, student-specific, or both for V1.
-> [x] Confirm whether manual admission should coexist with existing `locked`, `reopened`, and `closed` states or introduce a new runtime-access reason/state.
-> [x] Decide whether the new admission rule belongs in `settings` or `configuration`.
-> [x] Decide whether reconnect counting should remain on `exam_attempts.reconnect_attempt_count` or move to an audit/event structure later.
-> [x] Document the approved behavior matrix for:

- auto-admit enabled
- auto-admit disabled
- active attempt resume
- locked exam
- reopened exam
- completed attempt

#### Candidate Files

- [packages/shared/src/schema/exams/runtime-access-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/runtime-access-schema.ts)
- [packages/shared/src/schema/exams/assessment-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)
- [app/sentinel-api/src/modules/examination/flow/flow.dto.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/flow.dto.ts)

#### Approval Gate

- Stop after this phase if the runtime rules are still undecided.

### Phase 1 - Fix Attempt Page Stability And Reconnect Semantics

#### Goal

- Remove the attempt-page interaction bug and make refresh/re-entry behavior deterministic.

#### Tasks

-> [x] Reproduce the “cannot click components after committing an event and navigating back” bug and identify whether the blocker lives in:

- `use-exam-monitoring`
- fullscreen restoration
- stale `securityLockReason`
- overlay/dialog focus trapping
- persisted session storage state
  -> [x] Audit how `use-exam-session` restores state on hard refresh and how that interacts with `readStoredExamSession` and `readStoredExamAnswerDraft`.
  -> [x] Update the attempt flow so a hard refresh on [app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx>) redirects the student back to lobby when the product rule requires reconnect confirmation.
  -> [x] Ensure reconnect increments only when the student explicitly resumes through lobby, not from accidental duplicate client initialization.
  -> [x] Prevent double session initialization between:
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-session.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.ts>)
  -> [x] Add an explicit client-side marker for “session entered from lobby” so direct deep-link re-entry to `attempt` does not bypass the reconnect path.
  -> [x] Verify that security-monitoring suspension for intentional navigation only applies to approved transitions and does not leave the page permanently unguarded.
  -> [x] Preserve answer drafts and elapsed time correctly after forced lobby re-entry.

#### Candidate Files

- [app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.tsx>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-session.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.ts>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.ts>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_lib/exam-session-storage.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/exam-session-storage.ts>)
- [app/sentinel-api/src/modules/examination/flow/data/session.repository.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/data/session.repository.ts)
- [app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/services/session-manager.service.ts)

### Phase 2 - Instructor-Controlled Lobby Admission

#### Goal

- Allow instructors to manually let students proceed from lobby to attempt when the exam is configured to require approval.

#### Tasks

-> [x] Extend exam configuration with a clear admission rule such as `lobbyAdmissionMode` or equivalent enum/boolean.
-> [x] Decide whether the admission control is:

- exam-wide gate with per-student release actions
- exam-wide gate with a single “allow all now” action
- both in V1
  -> [x] Add backend validation and persistence for the new admission rule in shared schema, DTOs, and configuration services.
  -> [x] Add the initial `lobby` backend module shape for:
- student lobby check-in
- student admission-status polling
- instructor waiting-list reads
- instructor approve/reject admission updates
  -> [x] Extend runtime-access resolution so the student can be “eligible for lobby but not yet allowed to enter attempt.”
  -> [x] Feed lobby-admission state into access-gatekeeper so eligibility can resolve to:
- allowed to start attempt now
- allowed to resume existing attempt
- allowed to enter lobby only while waiting for instructor approval
  -> [x] Ensure direct `attempt` URL access is denied when the student is still in lobby-waiting state and no approved resume path exists.
  -> [x] Add instructor monitoring actions to admit one student or bulk-admit students without disturbing `locked`, `reopened`, and `closed` behavior.
  -> [x] Surface the admission status in the monitoring overview so instructors can tell who is:
- waiting in lobby
- allowed to continue
- already in attempt
  -> [x] Add a clear runtime-access reason/state contract for lobby-gated students so frontend and backend do not infer admission state differently.
  -> [x] Update the student lobby CTA and copy so the button reflects the real state:
- waiting for instructor approval
- approved to continue
- active attempt can resume
  -> [x] Ensure the student cannot bypass manual admission by opening the attempt URL directly.

#### Done So Far

- Shared exam configuration now includes `lobbyAdmissionMode` and defaults it to `AUTOMATIC`.
- Backend configuration mapping and persistence now read and write `lobby_admission_mode`.
- The Prisma schema already contains the supporting lobby fields:
    - `exam_configurations.lobby_admission_mode`
    - `exam_lobby_admissions`
- The `lobby` API module exists and now has a cleaner baseline contract for check-in, status polling, waiting list retrieval, and admission updates.
- Automatic-admission status now short-circuits correctly in the lobby status service instead of forcing a waiting-record lookup.

#### Remaining End-To-End Enforcement Work

- Runtime access still needs to express a lobby-gated state distinct from general `open`, `locked`, `reopened`, and `closed`.
- Access gatekeeper still needs to combine:
    - exam runtime access
    - `lobbyAdmissionMode`
    - latest lobby admission row
    - active-attempt state
      so student flow decisions are made server-side instead of by page-level assumptions.
- Monitoring overview still does not expose lobby admission progress in a way instructors can audit quickly.
- Student attempt entry still needs final server-backed protection so a deep link cannot bypass manual lobby approval.

#### Candidate Files

- [packages/shared/src/schema/exams/assessment-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)
- [packages/shared/src/schema/exams/configuration-schema.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/configuration-schema.ts)
- [app/sentinel-api/src/modules/examination/configuration/configuration.dto.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/configuration.dto.ts)
- [app/sentinel-api/src/modules/examination/configuration/configuration.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/configuration.service.ts)
- [app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.ts)
- [app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/services/access-gatekeeper.service.ts)
- [app/sentinel-api/src/modules/examination/lobby/lobby.dto.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/lobby.dto.ts)
- [app/sentinel-api/src/modules/examination/lobby/lobby.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/lobby.service.ts)
- [app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/check-in-lobby.ts)
- [app/sentinel-api/src/modules/examination/lobby/services/get-admission-status.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/get-admission-status.ts)
- [app/sentinel-api/src/modules/examination/lobby/services/get-waiting-list.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/get-waiting-list.ts)
- [app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts)
- [app/sentinel-web/src/features/exams/\_components/forms/fields/settings-fields.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/forms/fields/settings-fields.tsx)
- [app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx>)
- [app/sentinel-web/src/features/exams/monitoring/\_components/student-list.tsx](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/monitoring/_components/student-list.tsx)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx>)

### Phase 3 - Validate Exam Rules And Monitoring Configuration

#### Goal

- Prove that the saved exam rules actually alter runtime behavior.

#### Tasks

-> [ ] Audit how `shuffleQuestions` is applied between configuration storage, exam payload mapping, and student question rendering.
-> [ ] Verify whether shuffle happens:

- per student attempt
- per exam load only
- not at all today
  -> [ ] If missing or incomplete, implement deterministic question ordering per attempt and make sure resuming the same attempt keeps the same order.
  -> [ ] Validate whether `randomizeChoices` is already enforced at render time and whether it also needs per-attempt persistence.
  -> [ ] Verify that `monitoring_rules` behavior maps correctly to:
- `webSecurity.tab_switching_monitor`
- `webSecurity.full_screen_required`
- `webSecurity.clipboard_control`
- `webSecurity.right_click_disable`
- `webSecurity.print_screen_disable`
- `aiRules.gaze_tracking`
- `aiRules.face_detection`
- `aiRules.multiple_faces_detection`
- `aiRules.audio_anomaly_detection`
  -> [ ] Close any mismatch where the UI toggle saves successfully but runtime behavior still acts as enabled.
  -> [ ] Verify instructor preview and student live flow use the same effective configuration source.

#### Candidate Files

- [app/sentinel-api/src/modules/examination/configuration/services/resolve-exam-settings.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/services/resolve-exam-settings.ts)
- [app/sentinel-api/src/modules/examination/configuration/configuration.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/configuration.service.ts)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-student-exam-data.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-student-exam-data.ts>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.ts>)
- [app/sentinel-web/src/features/exams/\_components/engine/attempt/](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/engine/attempt)

### Phase 4 - Recalibrate MediaPipe And Device Tolerance

#### Goal

- Reduce false positives and unusable flows for common real-world student device conditions.

#### Tasks

-> [ ] Review the current MediaPipe calibration and threshold behavior in:

- [app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts)
- [app/sentinel-api/src/modules/infrastructure/mediapipe/services/resolve-mediapipe-thresholds.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/services/resolve-mediapipe-thresholds.ts)
- [packages/shared/src/mediapipe/calibration.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/mediapipe/calibration.ts)
  -> [ ] Define test scenarios for:
- glasses glare and partial iris visibility
- low-quality webcam noise
- mobile front-camera framing drift
- low-end device frame drops and delayed landmarks
  -> [ ] Tune calibration fallback behavior so head-pose fallback remains usable when iris tracking confidence is poor.
  -> [ ] Add or tune suppression/debounce so transient low-quality camera noise does not immediately lock the student.
  -> [ ] Decide whether mobile should:
- run full MediaPipe attempt monitoring
- run reduced checks
- skip some checks but preserve other monitoring signals
  -> [ ] Ensure checkup-stage calibration expectations match attempt-stage thresholds so students do not pass checkup and then immediately fail at runtime.

#### Candidate Files

- [app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.ts)
- [app/sentinel-api/src/modules/infrastructure/mediapipe/services/should-suppress-mediapipe-signal.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/services/should-suppress-mediapipe-signal.ts)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-checkup-mediapipe.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.ts>)
- [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-attempt-mediapipe-monitoring.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring.ts>)

### Phase 5 - Optional Prisma Migration

#### Goal

- Prepare a migration path only if the final admission design cannot be expressed safely with existing JSON/system-settings persistence.

#### Tasks

-> [ ] Default decision: do not add a migration unless the implementation requires queryable, auditable, or relational admission state.
-> [ ] If needed, evaluate adding one of these:

- dedicated exam configuration fields for lobby admission mode
- a new admission/release table keyed by `exam_id` and `student_id`
- reconnect audit records separate from `reconnect_attempt_count`
  -> [ ] If a migration is approved, update:
- [packages/db/prisma/schema.prisma](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)
- Prisma migration files under `packages/db/prisma/migrations/`
- seed coverage in [app/sentinel-api/prisma/seed.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/prisma/seed.ts) only if demo data must reflect the new flow
  -> [ ] Prefer additive schema changes only.

#### Recommendation

- Start without a migration and use the current runtime-access/configuration layer first.

### Phase 6 - Test Coverage And Manual QA

#### Goal

- Ship the flow only after automated and manual validation cover the new entry rules and regressions.

#### Backend Tests

-> [ ] Update or extend [app/sentinel-api/src/modules/examination/flow/flow.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/flow/flow.test.ts) for:

- refresh-to-lobby reconnect flow
- completed-attempt conflict handling
- manual-admit gating
  -> [ ] Update or extend [app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/runtime-access/runtime-access.service.test.ts) for:
- waiting-for-admission state
- auto-admit enabled
- locked vs active resume behavior
  -> [ ] Update or extend [app/sentinel-api/src/modules/examination/configuration/configuration.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/configuration.service.test.ts) for the new admission rule persistence.
  -> [ ] Add or extend [app/sentinel-api/src/modules/examination/access/access.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/access/access.test.ts) for student eligibility when lobby admission is pending.
  -> [ ] Add contract coverage in [app/sentinel-api/src/tests/exams/exam-contracts.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/tests/exams/exam-contracts.test.ts) for any response shape changes.
  -> [ ] Extend [app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/infrastructure/mediapipe/mediapipe.service.test.ts) for the recalibrated scenarios.

#### Frontend Tests

-> [ ] Update [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-session.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-session.test.tsx>) for forced lobby re-entry and draft restoration.
-> [ ] Update [app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/page.test.tsx>) for the attempt-page bug and direct-link blocking.
-> [ ] Update [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-exam-monitoring.test.ts](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts>) for the interaction-lock regression.
-> [ ] Add or extend a lobby-page test near [app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/page.tsx>) for:

- waiting for instructor
- approved entry
- active attempt resume
  -> [ ] Add or extend monitoring page tests near [app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx>) for admit actions and runtime state rendering.
  -> [ ] Extend [app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup/page.test.tsx>) and [app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks/use-checkup-mediapipe.test.tsx](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-checkup-mediapipe.test.tsx>) for calibration edge cases.

#### Manual QA

-> [ ] Student path: enter exam normally with auto-admit enabled and confirm lobby proceeds to attempt.
-> [ ] Student path: with manual admit enabled, confirm lobby button stays blocked until instructor approval.
-> [ ] Instructor path: approve one waiting student and verify only that student can proceed.
-> [ ] Instructor path: use exam-wide lock and confirm new students are blocked while active attempts can still resume if that is the approved rule.
-> [ ] Student path: refresh the attempt page and verify redirect to lobby, reconnect count increment, and draft restoration.
-> [ ] Student path: trigger monitored events such as tab switch or fullscreen exit, then recover and confirm attempt components remain usable.
-> [ ] Student path: submit a completed attempt, return, and confirm history redirect still wins over session recreation.
-> [ ] Configuration path: toggle `shuffleQuestions` and confirm different students receive different stable orderings while one resumed attempt keeps its original order.
-> [ ] Configuration path: toggle monitoring rules off one by one and confirm the disabled behavior does not still fire locks or telemetry.
-> [ ] Device QA: test webcam with glasses, poor lighting, lower-resolution camera, mobile phone, and low-end laptop.

## Suggested Execution Order

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 6
7. Phase 5 only if the chosen design truly needs schema changes

## Recommended First Build Slice

- Start with **Phase 1** after Phase 0 decisions are locked.
- The highest-value first slice is:
    - fix the attempt-page lock regression
    - enforce lobby-based reconnect
    - add regression tests for refresh, resume, and post-incident recovery
- After that, move to **Phase 2** so the instructor-admission workflow is built on stable session behavior.
