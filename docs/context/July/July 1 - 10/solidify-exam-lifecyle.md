# Exam Lifecycle Solidification - Context and Requirements

## Objective

Solidify Sentinel's exam lifecycle before writing an implementation plan. The implementation should make state transitions explicit, isolate runtime actions to one student's attempt unless a bulk action is deliberately requested, and align proctoring, lobby access, grading, reports, makeup, and retake flows around the same source of truth.

This document is context, not the final implementation plan. Its purpose is to capture what the system already does, where the lifecycle model is ambiguous, and which decisions the plan must resolve before code changes begin.

## System Alignment Snapshot

Sentinel already separates the exam definition from the student's runtime attempt in several places:

- `exams` is the exam definition and scheduling record. It owns title, subject, sections, questions, schedule, publish state, configuration, room, and assigned class/section scope.
- `exam_attempts` is the durable per-student runtime unit. It stores `attempt_id`, `exam_id`, `student_id`, `status`, `started_at`, `completed_at`, score fields, answer snapshot, sync timestamp, answered count, and reconnect count.
- `flagged_incidents` is attempt-scoped through `attempt_id`. Incident review currently updates the incident status only; it does not automatically lock, close, or reopen an attempt.
- `exam_lobby_admissions` is student-and-exam scoped through unique `(exam_id, student_id)`. It gates student entry before an attempt starts when lobby admission mode is instructor-gated.
- `system_settings` currently stores two lifecycle-related override families:
    - Exam-wide runtime access: `examination.exam-runtime-access.{examId}` with states such as `locked`, `reopened`, and `closed`.
    - Student-specific access overrides: `exam.student-override.{examId}.{studentId}.{overrideId}` with override types `MAKEUP`, `RETAKE`, and `REOPEN`.

Important current behavior:

- Starting or resuming an exam calls `startSessionService()` and `SessionRepository.createSession()`.
- Completing an attempt calls `completeSessionService()` and sets `exam_attempts.status = 'COMPLETED'`, `completed_at`, score fields, and `answer_snapshot`.
- Existing student status resolution treats completed attempts as `turned_in`, active attempts as `in-progress`, and schedule-expired exams as `past_due`.
- Existing runtime access lock/reopen/close is exam-scoped and stored outside `exam_attempts`.
- Existing makeup/retake grants are student-specific access overrides, not new exam definitions.
- `RETAKE` already requires `sourceAttemptId`; `MAKEUP` does not.
- Reports already expose action queues for review, makeup, and retake, and can grant `MAKEUP` or `RETAKE` windows.
- Grading finalization currently stores metadata under `answer_snapshot._grading.finalizedAt` and can bulk-finalize attempts for an exam.

## Relevant Code Surfaces

- Exam definition and CRUD: `app/sentinel-api/src/modules/examination/exams`
- Student eligibility and runtime access: `app/sentinel-api/src/modules/examination/access`
- Exam-wide runtime access: `app/sentinel-api/src/modules/examination/runtime-access`
- Student-specific overrides: `app/sentinel-api/src/modules/examination/student-overrides`
- Start, sync, and complete attempt flow: `app/sentinel-api/src/modules/examination/flow`
- Lobby admission: `app/sentinel-api/src/modules/examination/lobby`
- Monitoring overview and student detail: `app/sentinel-api/src/modules/examination/monitoring`
- Incident log and review: `app/sentinel-api/src/modules/examination/incidents`
- Telemetry persistence and severity: `app/sentinel-api/src/modules/telemetry`
- Grading: `app/sentinel-api/src/modules/examination/grading`
- Reports and action queues: `app/sentinel-api/src/modules/examination/reporting`
- Shared exam status and runtime types: `packages/shared/src/types/exams/exam.ts`
- Shared status resolver: `packages/shared/src/exams/resolve-exam-status.ts`
- Service client contracts: `packages/services/src/api/exams`
- Instructor monitoring/lobby UI: `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]`
- Student exam UI: `app/sentinel-web/src/app/(protected)/student/exam/[id]`
- Core monitoring/lobby/report parity surfaces: `app/sentinel-core/src/app/(protected)/exams/[id]`

## Canonical Vocabulary

Use these terms consistently in the implementation plan:

- **Exam definition**: the `exams` row. This is the authored assessment, schedule, configuration, and assignment container.
- **Attempt**: the `exam_attempts` row. This is one student's live or completed sitting for one exam. This should be the default scope for lifecycle controls.
- **Runtime access**: the computed gate that tells a student whether they can start or resume. Today it combines schedule, exam-wide overrides, lobby status, reconnect count, and student-specific overrides.
- **Lobby admission**: the pre-attempt instructor approval state in `exam_lobby_admissions`.
- **Incident**: a proctoring event persisted in `flagged_incidents` for a specific attempt.
- **Incident review**: instructor action to mark incidents `CONFIRMED` or `DISMISSED`. Review is evidence triage, not automatically an attempt transition unless the new lifecycle policy explicitly says so.
- **Makeup**: a student-specific window for a student who did not produce a valid primary attempt, usually absent or blocked before submission.
- **Retake**: a student-specific window tied to an existing attempt through `sourceAttemptId`, usually after failure, confirmed integrity action, or instructor remediation.
- **Reopen**: a student-specific continuation window when the same in-progress attempt should be resumed.
- **Reset**: a student-specific discard-and-start-over action. This is not currently a first-class persisted lifecycle action and needs a model decision.

## Core Design Principle

All lifecycle-changing operations must target `attempt_id` or `(exam_id, student_id)` by default. Exam-wide actions must be explicit bulk actions with separate API names, UI copy, audit logs, and tests.

This prevents one student's lock, close, reset, confirmed flag, makeup, or retake decision from affecting other students assigned to the same exam.

## Current State Model

### Exam Definition State

Existing `exam_status` values include `DRAFT`, `PUBLISHED`, `ARCHIVED`, `SCHEDULED`, `AVAILABLE`, `COMPLETED`, `IN_PROGRESS`, `UPCOMING`, and `ACTIVE`.

These values are currently used as both definition-level and attempt-level statuses, which creates ambiguity. The implementation plan should avoid adding more meaning to this overloaded enum without an explicit migration strategy.

Recommended direction:

- Keep `exams.status` focused on authoring, publication, and schedule lifecycle.
- Add or normalize attempt-specific lifecycle state on `exam_attempts` instead of using exam-wide runtime access for student-specific lockout.

### Attempt State

Current durable attempt states are effectively:

- No attempt row yet.
- `IN_PROGRESS`.
- `COMPLETED`.

Additional runtime states are inferred from schedule, lobby, reconnect count, and overrides rather than persisted directly on the attempt.

Needed attempt lifecycle states for this work:

- `not_started`: derived from no attempt row.
- `waiting_lobby`: derived from lobby admission when instructor-gated.
- `in_progress`: current `exam_attempts.status = 'IN_PROGRESS'`.
- `locked`: student cannot continue until instructor/system unlocks or reopens.
- `closed`: attempt is ended without normal student submission, usually due to severe/repeated integrity events or instructor close.
- `submitted`: student submitted normally. Existing `COMPLETED` can represent this if the implementation records submission type separately.
- `needs_review`: attempt has pending incidents or unresolved grading/integrity decision.
- `graded`: score has been calculated and instructor work may still be editable.
- `finalized`: score and grading are released/locked according to policy.
- `superseded`: an older attempt remains on record after a reset, makeup, or retake creates a newer attempt.

The plan must decide whether these become a new enum column, structured metadata in `answer_snapshot`, a lifecycle event table, or a combination. Because lifecycle decisions must be queryable across monitoring, reports, and access checks, a typed DB model is preferable to only storing metadata in JSON.

## Desired Lifecycle Semantics

### Lock

Default scope: one `attempt_id`.

Purpose: temporarily block the student's active attempt while preserving answers, elapsed time, incident evidence, and reconnect count.

Recommended behavior:

- Lock should not submit or grade the attempt.
- Lock should not discard answers.
- Student may see a blocked/locked state and should not be able to continue answering.
- Instructor can apply manually from monitoring or incident review.
- System can apply automatically only for explicitly configured severe or repeated incident thresholds.
- Reopen should be the normal path back into a locked attempt.

System gap:

- Current `locked` runtime access is exam-wide. Attempt-scoped lock needs a new attempt-level persistence and access check.

### Reopen

Default scope: one `attempt_id` or `(exam_id, student_id)`.

Purpose: let a student continue an existing attempt after a lock, schedule boundary, reconnect exhaustion, or instructor intervention.

Recommended behavior:

- Reopen preserves the current `attempt_id`, answers, progress, score state if any, incident history, and reconnect count unless an override says otherwise.
- Reopen should have an availability window.
- Existing `REOPEN` student override can support access windows, but it should be tied more explicitly to the attempt being reopened when an attempt exists.
- Reopen should not create a second attempt unless the original attempt is already terminal.

### Reset

Default scope: one student for one exam.

Purpose: discard a student's active attempt progress and let the student start again.

Recommended behavior:

- Reset should not physically delete the old attempt.
- The old attempt should be retained for audit as `superseded` or equivalent.
- Reset should create a new attempt on the next start, or create it immediately if the product wants an explicit pending state.
- Reset should retain the original incidents and answer snapshot on the old attempt.
- Reset should require instructor confirmation because it is destructive to student progress.

System gap:

- No first-class reset flow exists. The implementation plan must choose how to mark the prior attempt and how to allow the next attempt without violating current attempt count and completed-at restrictions.

### Close

Default scope: one `attempt_id`.

Purpose: terminate an attempt without normal student submission.

Recommended behavior:

- Close should preserve answers and incidents up to the close time.
- Close should set a terminal state distinct from normal submitted/completed if the product needs analytics to separate "closed by system/instructor" from "submitted by student".
- Close should not finalize grades by itself.
- Closed attempts can enter remediation review for reopen, reset, makeup, or retake.
- Exam-wide close remains valid only as an explicit bulk action for the full exam window.

System gap:

- Current `closed` runtime access is exam-wide. Attempt-scoped close needs a model and access check.

### Grading

Default scope: one completed or closed attempt.

Recommended behavior:

- Auto-grading can occur on normal submission and should keep `initial_score` write-once.
- Instructor grading can update essay evaluations, item overrides, feedback, and final score.
- Grading should be allowed for completed attempts and closed attempts when there is an answer snapshot.
- Grading should not imply score finalization unless the `finalize` flag is true.
- Attempts under `needs_review` can be graded, but score release should wait until integrity review is resolved if policy requires that.

Current behavior:

- `updateGradingAttempt()` recalculates score, stores `_evaluations`, `_itemOverrides`, `_grading`, and `_feedback` in `answer_snapshot`, and can finalize.
- `bulkFinalizeAttempts()` writes `_grading.finalizedAt` metadata and marks incomplete attempts completed if needed.

Planning concern:

- Finalization metadata in JSON is workable but harder to query and enforce. If finalization becomes a lifecycle state, consider explicit columns such as `finalized_at`, `finalized_by`, and `score_release_state`.

### Finalizing Scores

Default scope: one attempt, with optional explicit bulk finalization for all eligible attempts in an exam.

Recommended behavior:

- Finalized means the score is locked from ordinary grading edits and eligible for student visibility.
- Any post-finalization change should require an explicit "revise finalized score" action, with audit metadata and reason.
- Finalization should not require reopening the attempt runtime. Reopening is about student access, not instructor grading.
- If a retake supersedes an earlier attempt, finalization policy must decide whether the old attempt remains finalized, is superseded, or is excluded from the official grade.

## Proctoring and Incident Review Semantics

### Needs Review

Default scope: attempt.

An attempt should be treated as needing review when it has pending incidents, confirmed incidents requiring instructor action, or scoring items requiring manual evaluation.

Recommended policy:

- New committed incidents start as `PENDING`.
- `PENDING` incidents make the attempt visible in review queues.
- Dismissed incidents should reduce review pressure but remain in audit history.
- Confirmed incidents should not automatically close the attempt unless configured policy says the incident type/severity is terminal.

### Flag Confirmed

Current behavior:

- Incident review updates `flagged_incidents.status`, notes, reviewer, and reviewed timestamp.
- It does not change `exam_attempts.status`.

Recommended behavior:

- Confirming an incident is evidence classification.
- Attempt transition should be a separate action unless an explicit automation rule exists.
- If automation exists, it should run through the same attempt lifecycle service as manual actions, so audit logs, notifications, and access checks stay consistent.

### Automatic Close After Severe or Repeated Events

Default scope: one attempt.

Recommended policy inputs:

- Severity ladder already exists and recent work calibrates first events lower.
- Automatic close should be based on confirmed or server-authoritative high-confidence events, not every raw client warning.
- Suggested threshold for planning discussion: close only after either one terminal event type configured as immediate-close, or repeated `HIGH` incidents beyond a configured count within a window.
- Thresholds should live in exam configuration if instructors need per-exam control; otherwise use a system default with audit-visible config snapshot.

Do not implement "a lot of events" as an undefined threshold.

### Path Back In After Closure

Possible paths:

- Reopen: same attempt resumes. Use when closure was accidental or instructor allows continuation.
- Reset: old attempt is superseded; student starts fresh for the same exam.
- Makeup: student gets a new sitting because the primary attempt was absent, blocked, or invalid before meaningful submission.
- Retake: student gets another attempt tied to the original `sourceAttemptId`.

The plan must define which closure reasons allow each path.

## Remediation Semantics

### Makeup

Current system support:

- `MAKEUP` is a student-specific access override.
- It has an availability window and allowed attempt count.
- It does not require `sourceAttemptId`.
- Reports identify absent students as `needsMakeup` when no attempt exists and no active makeup override exists.

Recommended semantics:

- Use makeup for absent students or students who never had a valid attempt.
- A makeup creates or permits a new `exam_attempts` row under the same `exam_id`.
- Original absence/no-attempt state remains visible in reports.

### Retake

Current system support:

- `RETAKE` is a student-specific access override.
- It requires `sourceAttemptId`.
- Reporting can classify used attempts as `retake`.

Recommended semantics:

- Use retake when a prior attempt exists and should remain on record.
- A retake should create or permit a new `exam_attempts` row under the same `exam_id`.
- The original attempt should remain immutable except for review/finalization/superseded metadata.
- The plan must define grade policy: highest score, latest score, instructor-selected official score, or all attempts visible with one official attempt.

### Reopen Override

Current system support:

- `REOPEN` exists and is used for reconnect-limit override flows.

Recommended semantics:

- Use reopen when the same active attempt should continue.
- Do not use reopen as a synonym for retake or makeup.

## Isolation and Scoping Requirements

Every lifecycle write must include at least one of:

- `attemptId`, when acting on an existing attempt.
- `examId + studentId`, when creating access for a student who may not have an attempt yet.
- An explicit bulk flag and bulk endpoint, when acting on every eligible student for an exam.

Implementation guardrails:

- Never update `exams.status` to represent one student's state.
- Never use exam-wide runtime access for a single student's lock, close, reset, makeup, or retake.
- Never delete attempts to reset progress; mark and supersede them.
- Incident review should filter by `exam_id` and allowed incident ids, then derive affected attempt ids before any lifecycle action.
- Access checks must consult attempt-level terminal/locked/superseded state before allowing start/resume.
- UI copy must say "this student" or "selected students" for attempt-scoped actions, and "entire exam" only for explicit bulk actions.

## Proposed Target Flow

```text
Instructor publishes exam definition
        |
Student enters lobby when instructor-gated
        |
Instructor approves lobby admission
        |
Student starts or resumes attempt
        |
Attempt in progress
        |
Telemetry incidents may create Needs Review
        |
+---------------------------+------------------------------+
| Normal student submission | Instructor/system lifecycle  |
| sets attempt submitted    | lock, close, reopen, reset   |
+---------------------------+------------------------------+
        |
Grading and incident review
        |
Score finalized or remediation granted
        |
+---------------------+-----------------------+
| Makeup/retake opens | Official score stands |
| a student window    | and attempt finalizes |
+---------------------+-----------------------+
        |
New attempt only for that student when allowed
```

## Data Model Questions for the Implementation Plan

The implementation plan should explicitly choose one of these paths:

1. Add attempt lifecycle columns to `exam_attempts`.
    - Candidate columns: `lifecycle_state`, `locked_at`, `locked_by`, `closed_at`, `closed_by`, `closed_reason`, `superseded_by_attempt_id`, `superseded_at`, `finalized_at`, `finalized_by`, `official_score_state`.
    - Benefit: queryable, enforceable, clear for monitoring/reporting.
    - Cost: Prisma migration and backfill/default logic.

2. Add an `exam_attempt_lifecycle_events` table.
    - Candidate fields: `event_id`, `attempt_id`, `event_type`, `actor_user_id`, `reason_code`, `notes`, `metadata`, `created_at`.
    - Benefit: strong audit trail and event replay.
    - Cost: current state still needs to be derived or cached.

3. Hybrid model.
    - Store current state on `exam_attempts` and append audit events in a lifecycle event table.
    - Recommended for this feature if lifecycle actions become important to compliance, reports, and support investigations.

Using only `system_settings` or only `answer_snapshot` is not recommended for core attempt lifecycle state because monitoring, reports, access checks, and analytics need reliable query behavior.

## API Surface Questions for the Implementation Plan

Potential attempt-scoped endpoints:

- `PATCH /exams/:examId/attempts/:attemptId/lifecycle`
- `POST /exams/:examId/attempts/:attemptId/lock`
- `POST /exams/:examId/attempts/:attemptId/reopen`
- `POST /exams/:examId/attempts/:attemptId/reset`
- `POST /exams/:examId/attempts/:attemptId/close`
- `POST /exams/:examId/students/:studentId/makeup`
- `POST /exams/:examId/attempts/:attemptId/retake`

Potential bulk endpoints must be named separately:

- `POST /exams/:examId/lifecycle/bulk-close`
- `POST /exams/:examId/lifecycle/bulk-finalize`

The plan should decide whether to use action-specific endpoints or one lifecycle endpoint with an action enum. Action-specific endpoints are clearer for permissions and audit logs; a single lifecycle endpoint is less repetitive but easier to misuse.

## Frontend Impact Areas

Instructor monitoring:

- Add per-student lifecycle controls for lock, reopen, reset, close, and remediation where appropriate.
- Keep existing exam-wide runtime buttons visually distinct from student-attempt controls.
- Show attempt lifecycle badges separately from incident severity and lobby admission.

Incident logs:

- Keep confirm/dismiss as review actions.
- Add a follow-up action after confirmation only when policy allows lifecycle transition.

Reports:

- Continue using review, makeup, and retake queues.
- Show whether an attempt is primary, makeup, retake, superseded, finalized, or official.
- Improve grant override UX beyond `window.prompt` if this lifecycle work includes UI polish.

Student flow:

- Access gate must explain locked, closed, reopened, reset, makeup, and retake states.
- Reopen should restore answers.
- Reset/makeup/retake should make it clear when a fresh attempt starts.

Core app:

- Keep `sentinel-core` parity in mind because monitoring/lobby/report surfaces are mirrored there.

## Notifications, Logs, and Audit

Each lifecycle action should log:

- Actor: instructor, system, or student where relevant.
- Scope: `attemptId`, `examId`, and `studentId`.
- Previous state and next state.
- Reason code and human notes.
- Related incident ids, if triggered from proctoring review.
- Related override id, if makeup/retake/reopen is granted.

Student-facing notifications should be explicit for lock, close, reopen, makeup, and retake. Instructor-facing notifications should identify the affected student and attempt, not only the exam.

## Validation Expectations

The implementation plan should include tests for:

- Attempt-scoped lock does not affect another student's attempt in the same exam.
- Attempt-scoped close blocks only that student.
- Reopen restores the same attempt and answers.
- Reset preserves old attempt evidence and allows a fresh attempt.
- Confirming an incident alone does not transition the attempt unless configured.
- Automatic close threshold affects only the triggering attempt.
- Makeup grant works for students without attempts.
- Retake grant requires `sourceAttemptId` and creates/allows a new attempt.
- Grading finalization remains independent from runtime reopen/lock.
- Reports classify primary, makeup, retake, superseded, needs review, needs makeup, needs retake, and finalized states correctly.
- `sentinel-web` and `sentinel-core` monitoring/report UI stay aligned where the product expects parity.

## Open Decisions Before Implementation Planning

1. Should attempt lifecycle state be modeled as columns, an event table, or a hybrid?
2. Which exact attempt states are required for the first implementation slice?
3. Should the existing `exam_status` enum be reused, or should a new attempt lifecycle enum be added?
4. Should exam-wide runtime access remain as an instructor tool, or should it be deprecated in favor of explicit bulk lifecycle actions?
5. Does a confirmed incident merely mark evidence, or can certain confirmed incident types trigger automatic lock/close?
6. What exact automatic close threshold should be used, and is it exam-configurable?
7. Does reset create a new attempt immediately or only permit the next start to create one?
8. What is the official grade policy when multiple attempts exist because of makeup or retake?
9. Can finalized grades be revised, and what audit reason is required?
10. What student notifications are required for lock, close, reopen, reset, makeup, and retake?

## Recommended Planning Direction

The implementation plan should favor a hybrid attempt lifecycle model: store current attempt lifecycle state on `exam_attempts` for fast access checks, monitoring, reports, and grading, and append lifecycle events for auditability. Keep `exams.status` for exam definition state. Keep existing `MAKEUP`, `RETAKE`, and `REOPEN` access overrides, but tie them more clearly to attempt lifecycle transitions and source attempts.

The first implementation slice should avoid broad grade-policy changes. Focus on attempt-scoped lock, close, reopen, reset semantics, incident-review integration, and remediation access correctness. Grade finalization can be improved in the same plan only if the schema change already includes explicit finalization fields.
