# Examination Runtime And Exam Visibility Open Case

## Purpose Of This Context

This note prepares the next implementation plan for the still-open examination and visibility issues. It should prevent another broad, repeated fix attempt by separating symptoms, current code evidence, prior attempted plans, reproduction needs, and the likely implementation boundaries.

Do not treat this file as an implementation plan. Use it as the source context for a later plan after reproducing the failures against the current workspace and target database.

## Related Plans And Context

- `docs/task/2026-07-08/fix-001-implementation-plan-private-visibility-assigned.md`
- `docs/task/2026-07-07/fix-004-implementation-plan-attempt-turn-in-dedupe-and-audio-anomaly.md`
- `docs/task/2026-07-07/fix-005-implementation-plan-dedupe-audio-calibration.md`
- `docs/task/2026-07-06/fix-001-implementation-plan-attempt-event-and-answer-integrity.md`
- `docs/task/2026-07-05/fix-exam-visibility-implementation-plan-exam-visibility.md`
- `docs/task/2026-07-05/fix-002-implementation-plan-student-exam-assignment-visibility.md`
- `docs/task/2026-07-05/fix-003-implementation-plan-audio-event-flagging-and-exam-flow-bugs.md`
- `docs/context/July/fix-private-visibility-assigned.md`
- `docs/context/July/exam-not-showing-in-student.md`
- `docs/context/July/exam-visibility-issue-student.md`
- `docs/context/July/issue-during-examination.md`
- `docs/context/July/deduplication-not-fix-audio-calibration.md`

Previous plans have many completed checklist items, but the bug is still reported. The next plan must start by proving whether the current runtime, migrated database, generated packages, and local source are actually aligned.

## Current Workspace State

As of this context update, the workspace is not clean.

- The visibility implementation files under `app/sentinel-api/src/modules/examination/**` have uncommitted modifications.
- The context docs `docs/context/July/examination-and-exam-visibility-issue.md` and `docs/context/July/fix-private-visibility-assigned.md` are untracked or newly created in this workspace state.
- `docs/task/2026-07-08/` is untracked or newly created.

The future implementation plan should inspect `git status --short` first and avoid assuming the branch represents a committed baseline.

## Reported Symptoms

### 1. First Proctoring Event Duplicates

Observed behavior:

- The first event during the exam appears duplicated on the instructor monitoring side.
- Example: triggering `webSecurity.clipboard_control` three physical times can show five occurrences because the first action is counted twice and later actions are counted once.
- The same pattern has been reported for other browser-security events.

Expected behavior:

- One physical browser-security action should emit one client telemetry payload.
- Duplicate requests with the same dedupe key should not create a new row and should not increment `details.occurrenceCount`.
- A later distinct action should increment the same incident only once inside the configured aggregation window.

### 2. Turn In Creates A Fullscreen Exit Incident

Observed behavior:

- When a student turns in the exam, the fullscreen teardown/minimize behavior is logged as a fullscreen-exit incident.
- The instructor monitoring page shows an inaccurate `Fullscreen Exit Detected` event after submission.

Expected behavior:

- Turn In should synchronously suspend monitoring before route changes and fullscreen teardown.
- Active-attempt fullscreen exits should still flag normally.
- Post-completion `FULL_SCREEN_EXIT` telemetry should be ignored server-side.

### 3. Audio Calibration Is Not Trustworthy

Observed behavior:

- Shouting, tapping, or making obvious noise during an exam does not reliably log audio incidents.
- Audio incidents sometimes trigger randomly instead of when someone is talking or making suspicious noise.
- The bundled class map is `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`.

Expected behavior:

- The audio worker should use support-managed persisted calibration when enabled.
- YAMNet class IDs must match the bundled CSV.
- Browser sample rates should be normalized to the 16 kHz waveform shape expected by YAMNet.
- One physical audio detection window should produce one accepted telemetry occurrence, not several labels or duplicate toasts.

### 4. Assigned Private Exams Still Require Public Visibility For Student Access

Observed behavior:

- The exam must be set to public before the assigned student can access it.
- A private exam assigned to a classroom is still not visible on the student end.

Expected behavior:

- `is_public` is not the student access gate.
- A private, published, classroom-assigned exam should be visible to assigned/enrolled students.
- Public but unassigned exams should not become visible to unrelated students.
- Assigned private exams should also behave consistently on detail, lobby, history/available, monitoring, grading, and reporting surfaces.

## Current Code Evidence To Verify Before More Changes

### Browser Event Dedupe

Relevant files:

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-telemetry.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/action-metadata.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_lib/web-telemetry-client/_utils/payloads.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
- `packages/db/prisma/migrations/20260706000000_add_telemetry_dedupe_index/migration.sql`

Current source appears to include:

- Client-side burst guards for clipboard, right-click, print-screen, focus, and fullscreen.
- Clipboard normalization through `actionSource = 'clipboard'`.
- Deterministic `eventId`, `dedupeKey`, and `clientActionAt` metadata.
- Telemetry emission preserving caller-provided metadata.
- Server-side duplicate `dedupeKey` detection before occurrence updates.
- A partial unique index on `flagged_incidents(attempt_id, rule_key, platform, dedupe_key)` where `dedupe_key is not null`.

Likely next-plan verification:

- Confirm the target database has `flagged_incidents_dedupe_key_unique`.
- Confirm the browser payload sent during manual QA includes `metadata.dedupeKey`.
- Confirm `flagged_incidents.dedupe_key` is populated for affected events.
- Confirm duplicate first-event reports are not coming from one browser action producing two different dedupe keys because of time bucketing, stale generated packages, multiple mounted listeners, React Strict Mode remounts, or two active tabs.

### Turn In Fullscreen Suppression

Relevant files:

- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-submission.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-ui-state.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/index.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-session-eligibility.service.ts`

Current source appears to include:

- `proceedToTurnInReview()` calls `suspendSecurityMonitoring()` before setting submit phase, writing the turn-in preview, replacing the route, or exiting fullscreen.
- Fullscreen-change handling exits early when monitoring is suspended or the phase is `submitting`, `navigating-to-turn-in`, or `suspended`.
- Server eligibility ignores `FULL_SCREEN_EXIT` for completed attempts.

Likely next-plan verification:

- Reproduce a Turn In from active fullscreen and record exact event order.
- Confirm `suspendSecurityMonitoring()` updates the ref synchronously in the runtime actually mounted by the page.
- Confirm no late `FULL_SCREEN_EXIT` payload is posted before the attempt is marked complete.
- Confirm any existing instructor timeline item was not created before the newest suppression code landed.

### Audio Calibration And Runtime Wiring

Relevant files:

- `packages/shared/src/audio/audio-anomaly.ts`
- `packages/shared/src/audio/yamnet-class-mapper.ts`
- `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
- `app/sentinel-web/src/workers/audio-anomaly.worker.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-audio-anomaly-worker.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/use-anomaly-telemetry.ts`
- `app/sentinel-web/src/hooks/use-audio-anomaly-worker/create-audio-graph.ts`
- `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
- `app/sentinel-web/public/models/yamnet/yamnet_class_map.csv`
- `app/sentinel-support/src/app/(protected)/(support)/telemetry/_components/audio/audio-calibration-form.tsx`
- `app/sentinel-api/src/modules/infrastructure/audio/audio.service.ts`

Current source appears to include:

- CSV-backed class IDs for `TALKING`, `TYPING`, `TAPPING`, `MOUTH_BREATHING`, and `BACKGROUND_NOISE`.
- Defaults enabling only `TALKING` and `BACKGROUND_NOISE`.
- 16 kHz linear resampling before YAMNet inference.
- RMS fallback for `BACKGROUND_NOISE`.
- Primary-anomaly selection when multiple labels trigger in one frame window.
- Student attempt wiring that reads `useAudioSettingsQuery()` and passes persisted settings to `useAttemptMonitoring()` when audio anomaly detection is enabled.

Likely next-plan verification:

- Confirm students are allowed to call the audio settings endpoint in the target environment.
- Confirm the student attempt is not stuck with `effectiveAudioSettings = null` because settings are loading, failing, or unauthorized.
- Confirm the worker reaches `running` and receives real non-zero PCM frames from the same stream approved during checkup.
- Confirm the public YAMNet model is reachable from the running Next app.
- Confirm manual audio QA uses enabled anomaly types and thresholds. Tapping/typing will not flag by default if only talking/background noise are enabled.

### Student Exam Visibility

Relevant files:

- `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts`
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exam.controller.ts`
- `app/sentinel-api/src/modules/examination/assessment/assessment-access.ts`
- `app/sentinel-api/src/modules/examination/exams/services/create-exam.service.ts`
- `app/sentinel-api/src/modules/examination/exams/services/update-exam.service.ts`
- `app/sentinel-api/src/modules/examination/section-assignments/data/sync-exam-assignment-summary.ts`
- `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
- `packages/services/src/api/exams/core.ts`
- `packages/services/src/api/history.ts`

Current source appears to include:

- Student list/detail queries require `published_at is not null` and `status <> 'draft'`.
- Student list/detail queries use enrollment, exact `exams.class_group_id`, exact `exam_section_assignments.class_group_id`, legacy section assignments, and remediation schedules.
- Student visibility does not require `e.is_public = true`.
- Staff visibility uses `buildStaffExamVisibilityPredicates()` for public institution exams, creator-owned exams, explicit exam section assignment, accepted proctor assignment, classroom instructor assignment, and explicit shares.

Likely next-plan verification:

- Confirm the affected exam is published, not draft, and has matching assignment rows.
- Confirm the affected student has an active enrollment in the exact assigned `class_group_id`.
- Confirm the frontend is requesting `/exams` as the student, not applying a client-side filter that hides private exams.
- Confirm detail/lobby/runtime endpoints use the same student visibility rule as the list route.
- Confirm old test data created before assignment-sync fixes was repaired or recreated.

## High-Risk Root Causes Still Worth Testing

### A. Target Database Missing The Dedupe Unique Index

The source schema includes the partial unique index, but duplicates can still occur if the target DB did not apply `20260706000000_add_telemetry_dedupe_index`.

Verification SQL:

```sql
select
    indexname,
    indexdef
from pg_indexes
where tablename = 'flagged_incidents'
  and indexname = 'flagged_incidents_dedupe_key_unique';
```

### B. Duplicate First Events Have Different Dedupe Keys

If the first physical action enters two handlers with slightly different `clientActionAt` buckets or action sources, the backend will correctly treat them as distinct accepted actions.

Diagnostic SQL for one affected attempt:

```sql
select
    incident_id,
    rule_key,
    platform,
    dedupe_key,
    timestamp,
    details ->> 'occurrenceCount' as occurrence_count,
    details -> 'lastEvent' -> 'metadata' as last_metadata
from flagged_incidents
where attempt_id = :attempt_id
order by timestamp asc;
```

### C. Multiple Listener Mounts Or Multiple Tabs

If `useInteractionListeners()` is mounted twice for the same attempt, one physical action can emit two payloads with different timestamps. This will not be solved by server dedupe unless dedupe keys match.

Implementation-plan probe:

- Add temporary development-only listener mount/unmount logs with `examSessionId`, route, and component instance ID.
- Use browser network logs to count telemetry requests per physical action before reading instructor occurrence counts.

### D. Existing Incidents From Old Code Are Being Re-read As New Failures

Instructor monitoring can show existing `Fullscreen Exit Detected` or audio occurrence counts from attempts created before fixes were applied.

Implementation-plan probe:

- Test with a new exam, new attempt, and empty incidents for that attempt.
- Record the exact `attempt_id` used for every manual QA step.

### E. Student Visibility Fails Because Assignment Rows Are Missing

Earlier context found exams where `exams.class_group_id` existed but `exam_section_assignments`, `exam_assigned_sections`, `room_id`, or schedule fields were missing. Current predicates can match `exams.class_group_id`, but other surfaces and staff paths can still depend on assignment rows.

Diagnostic SQL:

```sql
select
    e.exam_id,
    e.title,
    e.is_public,
    e.status,
    e.published_at,
    e.class_group_id,
    e.section_id,
    e.room_id,
    e.scheduled_date,
    e.end_date_time,
    count(distinct esa.id) as section_assignment_rows,
    count(distinct eas.id) as legacy_section_rows,
    count(distinct es.id) as share_rows
from exams e
left join exam_section_assignments esa on esa.exam_id = e.exam_id
left join exam_assigned_sections eas on eas.exam_id = e.exam_id
left join exam_shares es on es.exam_id = e.exam_id
where e.exam_id = :exam_id
group by
    e.exam_id,
    e.title,
    e.is_public,
    e.status,
    e.published_at,
    e.class_group_id,
    e.section_id,
    e.room_id,
    e.scheduled_date,
    e.end_date_time;
```

### F. Student Is Not Enrolled In The Assigned Classroom

Student visibility depends on enrollment matching the assigned classroom.

Diagnostic SQL:

```sql
select
    st.student_id,
    st.user_id,
    enr.class_group_id as enrollment_class_group_id,
    cg.class_name,
    cg.archived_at,
    e.exam_id,
    e.class_group_id as exam_class_group_id,
    esa.class_group_id as assignment_class_group_id
from students st
left join enrollments enr on enr.student_id = st.student_id
left join class_groups cg on cg.class_group_id = enr.class_group_id
cross join exams e
left join exam_section_assignments esa on esa.exam_id = e.exam_id
where st.user_id = :student_user_id
  and e.exam_id = :exam_id;
```

### G. Audio Is Running With Disabled Or Unloaded Runtime Config

The default enabled audio anomaly types are `TALKING` and `BACKGROUND_NOISE`. If QA uses tapping/typing while those labels are disabled, no incident is expected.

Implementation-plan probe:

- Log runtime audio settings in development only: enabled anomaly types, thresholds, cooldown, worker phase, stream active state, sample rate, and latest debug snapshot.
- Verify `GET /settings/audio` succeeds for the student.
- Verify model loading from `/models/yamnet/model.json`.

## Implementation Plan Boundaries For Later

The later plan should not start with a broad rewrite. It should first prove which failure remains on the current code and target DB.

Recommended plan structure:

1. Baseline and environment parity
    - Record git status.
    - Verify the dedupe index exists.
    - Verify affected exam assignment rows and student enrollment.
    - Verify generated package consumers are using current source, not stale `dist` output.

2. Reproduce one clean scenario per symptom
    - New exam, new attempt, empty `flagged_incidents` for that attempt.
    - Capture browser network telemetry payloads and DB rows.
    - Capture student list/detail requests and API responses for private assigned exam visibility.

3. Decide fix path from evidence
    - If duplicate network requests share a dedupe key: fix backend/index/transaction behavior.
    - If duplicate network requests have different dedupe keys: fix client event bucketing/listener lifecycle.
    - If Turn In posts before suspension: fix submit ordering/runtime phase propagation.
    - If Turn In posts after completion: fix server eligibility or completion timing.
    - If audio never emits: fix settings access, worker/model loading, stream frames, or thresholds.
    - If private assigned exams do not appear: fix assignment persistence/data repair or route-specific visibility drift.

4. Add focused tests before code changes
    - Browser telemetry hook tests for one physical event equals one payload.
    - API persistence tests for exact duplicate dedupe keys.
    - Attempt submission tests for fullscreen teardown after suspension.
    - Audio worker tests for real configured anomaly types.
    - Student list/detail tests for private published assigned exams.

5. Manual QA after focused tests
    - Verify the same new attempt across student and instructor pages.
    - Record exact `exam_id`, `attempt_id`, `student_user_id`, and browser action count.

## Acceptance Criteria For The Event Fixes

- First right-click, clipboard, print-screen, tab/focus loss, and active fullscreen exit each create exactly one telemetry request and one server-accepted occurrence.
- Exact duplicate `dedupeKey` submissions return no new incident and do not increment `occurrenceCount`.
- A second separate physical action increments `occurrenceCount` to `2`, not `3`.
- Turn In from fullscreen creates no `FULL_SCREEN_EXIT`, no lock, and no instructor timeline item.
- Active-attempt fullscreen exit still creates `FULL_SCREEN_EXIT`.
- Audio running plus configured speech/noise produces one student toast and one instructor-visible incident after the configured frame threshold.
- Continuous audio does not spam duplicate incidents inside cooldown.

## Acceptance Criteria For Visibility

- Private, published, assigned exams are visible to assigned students on list, detail, lobby/checkup, and available/history surfaces.
- Private, published, unassigned exams are hidden from unrelated students and cannot be opened by direct ID.
- Public, published, unassigned exams are not shown to unrelated students solely because they are public.
- Staff/admin/private exam behavior matches the product-approved matrix consistently on list, detail, grading, reporting, and monitoring.
- Existing exams created before assignment-sync fixes are either repaired with a documented data operation or excluded from validation in favor of newly created exams.

## Notes For Future Agent

- Do not conflate `is_public` with student assignment access.
- Do not use old incident rows as proof that current Turn In or dedupe logic is broken.
- Do not assume audio tapping/typing should flag unless those anomaly types are enabled in runtime settings.
- Do not rely only on instructor occurrence counts; always pair manual QA with browser network payloads and DB rows.
- Do not apply a Prisma migration unless current schema/index checks prove the target DB is missing required telemetry infrastructure and the existing migration cannot be applied normally.
