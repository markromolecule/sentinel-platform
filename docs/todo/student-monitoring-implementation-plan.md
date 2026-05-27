# Student Monitoring Implementation Plan

## Source

This plan is based on `docs/student-monitoring-plan.md`.

## Objective

Turn student monitoring into a real exam-operations workflow that covers:

- real student attempt monitoring instead of mock data
- real cheating and incident logs from telemetry
- post-exam reporting for instructors
- manual lock and reopen controls
- student-specific retake or makeup access
- safer reuse of one exam across the instructor's other teaching scopes

## Current Repo State

- The instructor monitoring pages still use `MOCK_EXAM` and `MOCK_MONITORING_STUDENTS` in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/`.
- Real telemetry incidents already exist through `flagged_incidents` and can be queried from `app/sentinel-api/src/modules/telemetry/storage/`.
- Real student attempts already exist through `exam_attempts`.
- Student exam access already checks:
    - `published_at`
    - `scheduled_date`
    - computed exam end window
    - enrollment and assignment scope
- The current session flow blocks duplicate entry once a completed attempt exists.
- Multi-section exam support already partially exists through:
    - `exam_assigned_sections`
    - `sectionIds` in exam payloads
    - student visibility and enrollment predicates
- Live monitoring UI exists, but the current instructor monitoring detail and feed are still placeholders. A true live feed depends on later infrastructure such as `LiveKit` and related integrations.

## Finalized Decisions For V1

- Monitoring should be backed by `exam_attempts` and `flagged_incidents`, not mock student sessions.
- “Actual student taking” in V1 means:
    - students with active `IN_PROGRESS` attempts
    - recent presence or heartbeat signal when available
    - latest incident and progress metadata
- “Logs the student cheating” should mean append-only incident history, not a mutable cheating flag only.
- After an exam ends, the system should generate:
    - an attempt-level summary report per student
    - an exam-level summary report for the instructor
- Exam ending should not depend on `end_date_time` alone. A student attempt can end by:
    - manual turn-in
    - auto-submit at cutoff
    - instructor force close
- Locking an exam should block new joins first. It should not silently discard active attempts.
- Students may open a pre-start exam shell before the start time, but they should not be able to create or resume the real attempt until the exam opens or an instructor grants a reopen override.
- Retake and makeup should be per-student access overrides. The system should create a new attempt record, not overwrite the original one.
- Offering an exam to more sections, courses, or departments should persist explicit classroom or section targets. Course and department should act as selection filters, not as the final assignment key.

## 1-3-1 Analysis

### One Goal

- Convert monitoring from a mock page into a real instructor workflow that can supervise live attempts, review incidents, manage access, and support post-exam actions safely.

### Three Viable Options

#### Option 1: Monitoring UI Patch Only

- Replace mock cards with quick queries but keep reports, retake, and lock or reopen rules ad hoc.

Pros:

- Fastest visible progress.

Cons:

- Leaves the workflow incomplete after monitoring.
- Encourages scattered access logic across frontend pages.
- Makes retake and lock behavior brittle.

#### Option 2: Contract-First Phased Rollout [RECOMMENDED]

- Build the monitoring read model first, then add reports, runtime controls, retake overrides, and broader assignment support in separate phases.

Pros:

- Best fit for the current repo shape.
- Reuses the real attempt, access, and telemetry modules already present.
- Keeps each decision reviewable before the next phase starts.

Cons:

- Slightly slower than a UI-only patch.

#### Option 3: Full Proctoring Rewrite Now

- Rebuild monitoring around live feed, AI analysis, reports, retake, and access control in one milestone.

Pros:

- Maximum feature movement in one pass.

Cons:

- Too risky for the current codebase.
- Mixes core workflow fixes with future infrastructure such as `LiveKit`.
- Harder to test and review safely.

### One Recommended Outcome

- Proceed with **Option 2** and treat the work as a phased rollout anchored on real attempts, incidents, and access rules.

## 1-3-1 Answer For Section, Course, And Department Reuse

### One Goal

- Let an instructor reuse one exam across their other teaching scopes without duplicating the exam blindly or exposing it to the wrong students.

### Three Viable Options

#### Option 1: Duplicate The Exam Per Section Or Scope

- Create a new exam record every time the instructor wants another section, course, or department to take it.

Pros:

- Simple mental model.

Cons:

- Duplicates questions, settings, reports, and monitoring pages.
- Hard to keep edits synchronized.

#### Option 2: Persist Course Or Department Directly On The Exam

- Add broad assignment fields such as `course_id` or `department_id` to the exam and let the access layer infer eligible students.

Pros:

- Broad targeting with fewer clicks.

Cons:

- Too coarse for exam entitlement.
- Higher risk of letting unintended students in.
- Weak fit with the current classroom and section-aware model.

#### Option 3: Classroom-Scoped Multi-Assignment With Course And Department Filters [RECOMMENDED]

- Let the instructor filter by course and department in the UI, but persist explicit classroom or section selections only.

Pros:

- Best fit with existing `class_group_id`, `exam_assigned_sections`, and enrollment checks.
- Precise and auditable student access.
- One exam record can still serve many sections.

Cons:

- Requires a stronger assignment picker and clearer summaries in the UI.

### One Recommended Outcome

- Use **Option 3**. Treat course and department as discovery filters, while the saved assignment remains explicit classroom or section targets.

## Phase Plan

### Phase 0 - Monitoring Domain Freeze

#### Goal

- Finalize the V1 rules before implementation starts so reports, lock behavior, and retake logic all follow the same lifecycle.

#### Decisions To Lock

- monitoring reads come from real `exam_attempts` and `flagged_incidents`
- pre-start student access is read-only until the exam opens
- lock blocks new joins by default
- reopen is a controlled override with a time window
- retake creates a new attempt and preserves prior attempts
- course and department are filters, not direct entitlement keys

#### Deliverables

- implementation document approved
- response contracts drafted for monitoring list and detail
- exact status and lifecycle wording agreed for:
    - exam availability
    - student attempt state
    - incident review state

#### Approval Gate

Stop after this phase.
Ask: `Phase 0 is complete. Proceed to Phase 1?`

### Phase 1 - Real Monitoring Read Model

#### Goal

- Replace mock instructor monitoring data with real student attempt and incident data.

#### Backend Scope

- add a monitoring read service for an exam-level student session list
- derive each row from:
    - `exam_attempts`
    - `students`
    - `user_profiles`
    - latest `flagged_incidents`
- expose monitoring detail for one student attempt timeline
- reuse telemetry storage queries where possible instead of creating a second incident pipeline

#### Status Rules

- `active`: latest attempt is `IN_PROGRESS`
- `submitted`: latest attempt is `COMPLETED`
- `flagged`: active or completed attempt with unresolved or high-severity incidents
- `disconnected`: active attempt with stale presence or no recent activity signal

#### Presence Strategy

- use existing presence or heartbeat support where practical
- do not block Phase 1 on full live video
- if presence is unavailable, fall back to attempt status plus latest incident or activity timestamps

#### Frontend Scope

- replace mock monitoring list in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/page.tsx`
- replace mock student detail fetch in `.../monitoring/[studentId]/page.tsx`
- map real incidents into the existing timeline UI
- keep `LiveFeedMonitor` as a placeholder unless a real media session is available

#### Validation

- monitoring page lists real students who started the exam
- incident counts match `flagged_incidents`
- detail page shows the correct student timeline
- mock monitoring constants are no longer the source of truth for instructor monitoring

#### Approval Gate

Stop after this phase.
Ask: `Phase 1 is complete. Proceed to Phase 2?`

### Phase 2 - Post-Exam Reporting And End-State Workflow

#### Goal

- Give instructors a usable report after monitoring instead of ending the workflow at grades only.

#### Recommendation

- Yes, implement a summary report.
- Use two levels:
    - `attempt summary report`
    - `exam summary report`

#### Attempt Summary Report Should Include

- student identity
- attempt start and completion times
- score and total score
- time spent
- incident count
- primary or highest-severity incident type
- reviewed incident outcomes
- final submission type:
    - manual submit
    - auto-submit
    - force close
    - absent
    - retake

#### Exam Summary Report Should Include

- total assigned students
- total started
- total submitted
- total absent
- flagged students count
- average and pass rate
- incident breakdown by type and severity
- list of students needing review, makeup, or retake

#### End Rules

- A student attempt ends when:
    - the student turns in the exam
    - the cutoff is reached and auto-submit runs
    - the instructor force closes the attempt or exam with an explicit close action
- The exam monitoring session ends when:
    - there are no active attempts left, or
    - the instructor explicitly closes the monitoring window

#### Backend Scope

- add reporting queries on top of `exam_attempts` and `flagged_incidents`
- distinguish completion source in the attempt summary
- ensure history and monitoring can both reuse the same summary data where possible

#### Validation

- instructor can open a report after the exam
- absent students are visible, not hidden
- students with incidents are easy to identify for review

#### Approval Gate

Stop after this phase.
Ask: `Phase 2 is complete. Proceed to Phase 3?`

### Phase 3 - Lock, Reopen, And Pre-Start Access

#### Goal

- Let instructors control joining behavior without abusing publish or unpublish state.

#### Core Recommendation

- Do not overload `published_at` or draft status for runtime control.
- Add a dedicated runtime access layer for the exam.

#### Recommended V1 Behavior

- `before start time`
    - students may open the exam shell, instructions, privacy, and readiness screens
    - students may not start or resume the real attempt yet
- `open`
    - students can start or resume attempts normally
- `locked`
    - no new student can join
    - active students may continue unless the instructor chooses force close
- `reopened`
    - joining is allowed again until the configured override expires
- `closed`
    - no joining and no resume
    - active attempts should be auto-submitted or force-closed according to the selected close behavior

#### Backend Scope

- extend the access gate so runtime controls are checked together with:
    - publication state
    - schedule window
    - enrollment scope
- return explicit reasons the student UI can render:
    - not started
    - locked by instructor
    - reopened until time
    - closed

#### Frontend Scope

- student page shows countdown and read-only state before start
- student page shows lock or reopen reason clearly
- monitoring page gets lock, reopen, and close actions with guardrails

#### Validation

- a locked exam blocks new joins
- a reopened exam restores access only within the allowed window
- before-start view is visible without creating a session

#### Approval Gate

Stop after this phase.
Ask: `Phase 3 is complete. Proceed to Phase 4?`

### Phase 4 - Student-Specific Retake And Makeup Access

#### Goal

- Support students who missed the exam or need an approved second attempt without breaking the current attempt model.

#### Recommendation

- Add a per-student access override or retake authorization record instead of editing old attempts.

#### Why This Is Needed

- The current session repository intentionally blocks a new attempt after a completed attempt exists.
- That is correct for normal exams, but retake requires an explicit exception path.

#### V1 Rules

- missing student:
    - instructor may grant a makeup window
- completed student needing another chance:
    - instructor may grant a retake with reason and allowed window
- every new retake creates a new attempt row
- the original attempt stays in history and reports

#### Suggested Data Shape

- `exam_id`
- `student_id`
- `granted_by`
- `override_type`
    - `MAKEUP`
    - `RETAKE`
    - `REOPEN`
- `available_from`
- `available_until`
- `allowed_attempts`
- `source_attempt_id` when relevant
- `notes`

#### Backend Scope

- update access gate and session creation to honor approved overrides
- make sure reports show whether the attempt is primary, makeup, or retake

#### Validation

- normal students still cannot create duplicate attempts
- approved retake students can start a new attempt within the granted window
- previous attempts remain reviewable

#### Approval Gate

Stop after this phase.
Ask: `Phase 4 is complete. Proceed to Phase 5?`

### Phase 5 - Broader Instructor Assignment Scope

#### Goal

- Let instructors offer one exam to other eligible sections without drifting into unsafe broad assignment rules.

#### Scope

- improve the assignment UI to support multi-selection of instructor-owned classrooms or sections
- let instructors filter candidate targets by:
    - course
    - department
    - subject
- persist only explicit classroom or section targets

#### Guardrails

- do not assign exams to an entire department blindly
- do not infer final student access from course or department alone
- keep enrollment checks explicit and auditable

#### Validation

- one exam can be reused across multiple valid sections
- student visibility still follows actual enrollment
- instructor reports can still break results down by section

#### Approval Gate

Stop after this phase.
Ask: `Phase 5 is complete. Proceed to Phase 6?`

### Phase 6 - Validation And Rollout Gate

#### Goal

- Confirm that monitoring, reporting, access control, and retake behavior work together as one system.

#### Required Validation

- monitoring list uses real attempts
- monitoring detail uses real incidents
- report appears after exam completion
- lock blocks new joins
- reopen restores access only to allowed students and within time
- pre-start student page stays read-only
- approved retake creates a new attempt without corrupting history
- multi-section assignment still respects enrollment scope

#### Manual Scenarios

- student opens exam before start time
- student starts and submits normally
- instructor locks while another student has not joined yet
- instructor reopens for a late student
- instructor grants a makeup to an absent student
- instructor grants a retake to a completed student
- instructor filters results by section after the exam

## Suggested Build Order

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6

## Scope Guardrails

- Do not treat the current mock monitoring pages as production-ready architecture.
- Do not tie lock and reopen behavior to `published_at` alone.
- Do not overwrite original attempts to implement retake.
- Do not make course or department the direct saved entitlement key for exams.
- Do not block the first monitoring phase on a true live camera feed.

## Exit Criteria

- Instructor monitoring is backed by real attempts and incidents.
- Instructors can see who took the exam, who was flagged, and who was absent.
- The workflow after monitoring includes a usable report.
- Lock, reopen, and pre-start access behave predictably.
- Retake and makeup are explicit, auditable, and student-specific.
- Multi-scope reuse stays precise through classroom or section targeting.
