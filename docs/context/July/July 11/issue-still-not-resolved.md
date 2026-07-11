# Issue Still Not Resolved — Context Document (July 11)

> **Purpose:** This document provides detailed context for the next implementation plan.
> It describes the two confirmed production issues that remain unresolved after multiple fix passes (fix-001 through fix-002 on July 8, and fixes 001–005 from July 5–7).

---

## Issue 1 — Private Assigned Exam Visibility: Student Cannot See the Exam

### Status

**[OPEN / HIGH]** — Multiple plans have targeted this issue. LLMs incorrectly marked tasks as `[Done]` while the problem still occurs in production.

### Symptom Description

When an exam is:

- `is_public = false` (private), AND
- Published (`published_at IS NOT NULL`, `status != 'draft'`), AND
- Assigned to a classroom (`exam_section_assignments.class_group_id` is populated), AND
- The student is enrolled in that classroom (`enrollments.class_group_id` matches)

…the exam **does NOT appear** on:

- `/student/exam` (the student's classroom/available page)
- `/student/history` → Available tab

BUT the exam **DOES appear** correctly when:

- Assigned directly to a specific user (admin/instructor): it IS visible to that user
- Set to `is_public = true`: it IS visible to enrolled students

### Root Cause Hypothesis (Frontend — Primary Suspect)

The primary suspect is the **frontend filtering logic**. The user explicitly notes: _"the issue only occurs when the examination is private but assigned to the classroom."_ This strongly points to the status-normalization pipeline:

- [`normalize-student-exam.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts>) maps API response statuses to student-facing statuses. If a private exam returns a status value from the API that is not recognized by `resolveStudentExamStatus()`, the resulting status will not pass the `available | upcoming | in-progress` gate.
- [`use-exam-list.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts>) explicitly filters: `exam.status === 'upcoming' || exam.status === 'available'`.
- [`use-student-history/index.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts>) calls `isActiveStudentExamStatus(exam.status)` which only passes `available`, `upcoming`, or `in-progress`.

**Specific race condition / wrong-status scenario:** Public exams return a status from the API (e.g., `published`) that maps predictably to `available` by `resolveStudentExamStatus`. Private assigned exams may return the same `published` status, but if `resolveStudentExamStatus` does not recognize private-exam-specific conditions (e.g., no `scheduledDate`), it may return an unexpected status value that is dropped by the frontend filter.

### Root Cause Hypothesis (Backend — Secondary Suspect)

The backend predicate [`buildStudentExamVisibilityPredicate()`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts) has the following matching structure:

```
(e.class_group_id IS NOT NULL AND enr.class_group_id = e.class_group_id)
OR EXISTS ( exam_section_assignments WHERE esa.class_group_id = student_cg.class_group_id )
OR ( e.class_group_id IS NULL AND no class-group-having ESA exists AND section/subject fallback )
```

Known edge case: if `exams.class_group_id` is `NULL` but `exam_section_assignments.class_group_id` IS populated, only the second clause can catch it. The `buildClassroomAssignmentExistsPredicate()` inner function uses `esa.class_group_id = student_cg.class_group_id` which should work — but if the student's enrolled `class_group_id` does not exactly match the assignment row's `class_group_id`, this silently fails.

Additionally, if `exam_section_assignments` rows are missing entirely for the exam (due to a failed `syncExamAssignmentSummary` call), neither clause matches.

### What Was Previously Attempted

| Task                                                                          | Date  | Status         | Outcome                                                             |
| ----------------------------------------------------------------------------- | ----- | -------------- | ------------------------------------------------------------------- |
| `fix-exam-visibility-implementation-plan-exam-visibility.md`                  | Jul 5 | Done (claimed) | Centralized read scope helper, tightened predicates                 |
| `fix-002-implementation-plan-student-exam-assignment-visibility.md`           | Jul 5 | Done (claimed) | Repaired `exam_section_assignments` write on create/update          |
| `fix-003-implementation-plan-audio-event-flagging-and-exam-flow-bugs.md`      | Jul 5 | Done (claimed) | Phase 6 verified predicates already matched intent; no code changed |
| `fix-004-implementation-plan-attempt-turn-in-dedupe-and-audio-anomaly.md`     | Jul 7 | Done (claimed) | Not explicitly focused on visibility                                |
| `fix-005-implementation-plan-dedupe-audio-calibration.md`                     | Jul 7 | Done (claimed) | Not explicitly focused on visibility                                |
| `fix-001-implementation-plan-private-visibility-assigned.md`                  | Jul 8 | Done (claimed) | Staff visibility refactor + regression tests added                  |
| `fix-002-implementation-plan-examination-runtime-and-visibility-open-case.md` | Jul 8 | In Progress    | Phase 5 unchecked items remain; still unresolved                    |

### Remaining Unchecked Items from fix-002 (Jul 8) — Phase 5

These tasks were explicitly NOT completed and are still open:

- `[ ]` Run the assignment/enrollment diagnostic SQL for the affected `exam_id` and `student_user_id`, record `exams.is_public`, `exams.status`, `exams.published_at`, `exams.class_group_id`, `exam_section_assignments.class_group_id`, and `enrollments.class_group_id`
- `[ ]` Write/update tests in `get-exams.test.ts` and `get-exam-by-id.test.ts` proving list and detail use the same student assignment gates without requiring `is_public = true`
- `[ ]` Write/update tests in `create-exam.service.test.ts` and `update-exam.service.test.ts` proving assignment rows persist for private and public classroom-assigned exams and survive an `isPublic`-only update
- `[ ]` Write/update tests in `use-exam-list.test.ts` and `use-student-history/index.test.ts` proving the student available surfaces do not filter private assigned exams out

### Key Files to Investigate for the New Plan

| File                                                                                                                                                                                         | Layer | Why                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`normalize-student-exam.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts>)                           | Web   | Status normalization — if API returns `published` for a private exam, check if `resolveStudentExamStatus()` maps it to `available` or something else |
| [`use-exam-list.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts>)                                      | Web   | Filters to `upcoming` or `available` — if status normalization is wrong, exam is dropped here                                                        |
| [`use-student-history/index.ts`](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts>)           | Web   | Uses `isActiveStudentExamStatus()` — same risk                                                                                                       |
| [`build-student-exam-scope-predicates.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts) | API   | Core visibility predicate — verify the `is_public=false, ESA exists` path works                                                                      |
| `get-exams.ts`                                                                                                                                                                               | API   | Applies student visibility gate — confirm it calls `buildStudentExamVisibilityPredicate` for students                                                |
| `create-exam.service.ts` / `update-exam.service.ts`                                                                                                                                          | API   | May not always populate `exam_section_assignments` when only `is_public` changes                                                                     |

### Diagnostic SQL to Run Before Writing the Plan

```sql
-- 1. Check exam row
SELECT exam_id, title, is_public, status, published_at, class_group_id, section_id
FROM exams WHERE exam_id = '<affected_exam_id>';

-- 2. Check exam_section_assignments
SELECT * FROM exam_section_assignments WHERE exam_id = '<affected_exam_id>';

-- 3. Check student enrollment
SELECT st.user_id, enr.class_group_id, cg.name, cg.archived_at
FROM students st
JOIN enrollments enr ON enr.student_id = st.student_id
JOIN class_groups cg ON cg.class_group_id = enr.class_group_id
WHERE st.user_id = '<affected_student_user_id>';

-- 4. Check if assignment class_group_id matches student enrollment
SELECT esa.class_group_id AS assignment_cg, enr.class_group_id AS student_cg,
       (esa.class_group_id = enr.class_group_id) AS matches
FROM exam_section_assignments esa
CROSS JOIN (
    SELECT enr.class_group_id
    FROM students st
    JOIN enrollments enr ON enr.student_id = st.student_id
    WHERE st.user_id = '<affected_student_user_id>'
) enr
WHERE esa.exam_id = '<affected_exam_id>';
```

---

## Issue 2 — Monitoring Page: Instructor Receives No Telemetry Data in Production

### Status

**[OPEN / HIGH]** — Newly reported. No telemetry events appear in the instructor Monitoring page for active exam sessions **in production only**. The issue does **not** reproduce in local development.

### Symptom Description

The instructor **Monitoring page** (`/exams/[id]/monitoring`) loads correctly and shows students (from `exam_attempts`), but:

- No flagged incidents are displayed on student timelines
- `useExamMonitoringOverviewQuery` refetches every 2 seconds but `incident_count` stays at `0`
- Students are confirmed to be actively taking the exam (`exam_attempts.status = 'IN_PROGRESS'`)

> [!IMPORTANT]
> **Production-only constraint:** This issue does NOT occur in local development. The telemetry pipeline works correctly in the local environment. This immediately rules out source-code logic bugs and points to an **infrastructure or environment-configuration difference** between local dev and production.

### Architecture Context — Full Telemetry Pipeline

```
[Student Browser]
  → Web Telemetry Client (use-interaction-listeners.ts, use-anomaly-telemetry.ts)
  → POST /api/telemetry/event or /api/telemetry/batch
    → TelemetryIngestionService.processEvent()
      [1] Check global telemetry settings (enabled/disabled)
      [2] telemetryPolicyService.filterImportantEvent() → may return action: 'ignore'
      [3] telemetryIngestionQueueService.submit() → sync inline OR Redis/BullMQ worker
        → resolveTelemetrySessionEligibility() → validate attempt ownership + completion state
        → IncidentPersistenceService.appendEvent()
          → incident-writer.service.ts → INSERT into flagged_incidents

[Instructor Browser]
  → useExamMonitoringOverviewQuery (2s refetch interval)
  → GET /api/exams/:id/monitoring/overview
    → getExamMonitoringOverview()
      → queries exam_attempts + flagged_incidents (incident_summary subquery)
      → returns MonitoringOverview with incident_count per student
```

### Possible Failure Points

#### Point 1 — Telemetry Disabled Globally _(low probability — would also affect local)_

`TelemetryIngestionService.processEvent()` checks settings first:

```ts
if (settingsRecord && !settingsRecord.value.operations.enabled) {
    return;
}
```

If `telemetry_settings.value.operations.enabled = false`, ALL events are silently dropped. However, since local dev works fine and both environments hit the same settings infrastructure, this is low probability unless production has a separate settings record.
**Action:** Check the Support portal's telemetry settings or query: `SELECT value FROM settings WHERE key = 'telemetry';`

#### Point 2 — Policy Rule Ignoring Events _(low probability — would also affect local)_

`telemetryPolicyService.filterImportantEvent()` evaluates rules (web rules: `RIGHT_CLICK_ATTEMPT`, `CLIPBOARD_ATTEMPT`, `TAB_SWITCH`, `FULL_SCREEN_EXIT`; AI rules: `AUDIO_ANOMALY`). If the configuration or rule evaluation returns `action: 'ignore'`, events are dropped before reaching the queue. Since local dev works, this is unlikely to be the cause unless the production rule configuration differs from local.
**Action:** Check the AI rules config (enabled anomaly types, thresholds) and web rules registry.

#### Point 3 — Queue/Worker Not Processing ⭐ **MOST LIKELY CAUSE**

This is the highest-probability failure point given the production-only nature of the bug. Local development most likely runs in **sync mode** (inline write), while production runs in **async Redis/BullMQ mode**. If BullMQ workers are stopped, crashed, or misconfigured in production, events are accepted by the API (returning 200) and buffered in Redis — but they are **never written to `flagged_incidents`**. This explains why the issue is invisible in local dev: the event is written immediately inline without a worker.

**Key signals:**

- API returns 200 for telemetry events but no rows appear in `flagged_incidents`
- Redis queue depth grows over time
- BullMQ worker process is not running or is crashing silently

**Action:** Check BullMQ worker logs and queue depth in production. Try calling `/api/telemetry/flush` to force a sync write and confirm events then appear in `flagged_incidents`.

#### Point 4 — Session Eligibility Rejection _(medium probability)_

[`checkTelemetrySessionEligibility()`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-session-eligibility.service.ts) rejects telemetry if:

- `session.user_id !== payload.studentId` → 403 (wrong student)
- `session.status === 'COMPLETED'` or `completed_at IS NOT NULL` AND outside grace period → 409

In production, if the `examSessionId` (attempt ID) is stale or mismatched, events are silently dropped after the eligibility check. This would not affect local dev if test data is set up differently.
**Action:** Confirm that the `examSessionId` sent from the client matches an active `exam_attempts.attempt_id` owned by the correct student. Check API response codes (403/409 vs 200).

#### Point 5 — Missing Migration in Production ⭐ **STRONG SECONDARY SUSPECT**

The deduplication constraint was added in migration `20260706000000_add_telemetry_dedupe_index`. This is a production-specific risk: if this migration was **never applied to the production database**, the incident write logic that relies on `ON CONFLICT DO NOTHING` for the unique partial index may behave differently — either throwing an unhandled exception that swallows the write, or the insert path fails silently. Local dev would work if the migration was applied locally.

**Action:** `SELECT indexname FROM pg_indexes WHERE tablename = 'flagged_incidents' AND indexname = 'flagged_incidents_dedupe_key_unique';`
If missing, apply the migration immediately: `pnpm db:migrate` against the production database.

#### Point 6 — Monitoring Query Returns Correct Data (Read Side is Fine)

[`getExamMonitoringOverview()`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts) joins `flagged_incidents` per attempt. If the table is empty, the read side correctly shows `0`. The bug is therefore confirmed to be **write-side** (events not reaching `flagged_incidents`) rather than a read query issue.

### Key Files to Investigate for the New Plan

| File                                                                                                                                                                                               | Layer | Why                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------- |
| [`ingestion.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts)                                              | API   | Entry point — has console.log for received/ignored events           |
| [`ingestion-queue.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts)                         | API   | Sync vs Redis submission path                                       |
| [`telemetry-policy.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-policy.service.ts)                       | API   | Rule evaluation — can return `ignore`                               |
| [`incident-session-eligibility.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-session-eligibility.service.ts) | API   | Validates attempt ownership and session state                       |
| [`incident-writer.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts)                           | API   | Actual `flagged_incidents` write + dedup logic                      |
| [`get-exam-monitoring-overview.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts)            | API   | Reads `flagged_incidents` — confirmed correct if table is populated |

### Diagnostic Steps for the New Plan

> [!IMPORTANT]
> Because the issue is **production-only**, prioritize comparing the production environment configuration against local development before investigating source code. The first three steps should confirm the infrastructure layer.

1. **Compare queue mode config:** Check the production `.env` for `TELEMETRY_QUEUE_MODE` or equivalent — confirm whether production uses `sync` or `redis/bullmq`. If local uses `sync` and production uses `redis`, this confirms Point 3 as the root cause.
2. **Check BullMQ worker status in production:** Are the telemetry workers running? Check process manager (PM2, Docker, etc.) logs for worker crashes or missing worker process.
3. **Verify migration on production DB:** `SELECT indexname FROM pg_indexes WHERE tablename = 'flagged_incidents' AND indexname = 'flagged_incidents_dedupe_key_unique';` — if missing, apply immediately.
4. **Check server-side logs** for `[TelemetryIngestion] Received event` or `[TelemetryIngestion] Event ignored` for an active attempt.
5. **Trigger a test event** (right-click in exam in production) and confirm the network request to `/api/telemetry` returns 200.
6. **Immediately query production DB:** `SELECT COUNT(*) FROM flagged_incidents WHERE attempt_id = '<active_attempt_id>';` — if still 0 after the event, the write side is broken.
7. **Try forcing a flush:** Call `/api/telemetry/flush` to force sync processing of any buffered Redis events and re-check `flagged_incidents`.
8. **Check telemetry settings:** Query the `settings` table for the telemetry config record and confirm `operations.enabled = true`.

---

## Related Task Files (Full History)

| File                                                                                                                                                                                                                                    | Date  | Focus                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| [`fix-exam-visibility-implementation-plan-exam-visibility.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-05/fix-exam-visibility-implementation-plan-exam-visibility.md)                                   | Jul 5 | Exam visibility (centralize GET scope, student predicates)           |
| [`fix-002-implementation-plan-student-exam-assignment-visibility.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-05/fix-002-implementation-plan-student-exam-assignment-visibility.md)                     | Jul 5 | Assignment write path fix (`exam_section_assignments`)               |
| [`fix-003-implementation-plan-audio-event-flagging-and-exam-flow-bugs.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-05/fix-003-implementation-plan-audio-event-flagging-and-exam-flow-bugs.md)           | Jul 5 | Audio, event count, fullscreen, score, visibility                    |
| [`fix-001-implementation-plan-attempt-event-and-answer-integrity.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-06/fix-001-implementation-plan-attempt-event-and-answer-integrity.md)                     | Jul 6 | Answer key leak, telemetry idempotency, lifecycle policy             |
| [`fix-004-implementation-plan-attempt-turn-in-dedupe-and-audio-anomaly.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-07/fix-004-implementation-plan-attempt-turn-in-dedupe-and-audio-anomaly.md)         | Jul 7 | Turn-in fullscreen, event dedupe, audio signal path                  |
| [`fix-005-implementation-plan-dedupe-audio-calibration.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-07/fix-005-implementation-plan-dedupe-audio-calibration.md)                                         | Jul 7 | YAMNet class map fix, support audio settings wiring, dedupe          |
| [`fix-001-implementation-plan-private-visibility-assigned.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-08/fix-001-implementation-plan-private-visibility-assigned.md)                                   | Jul 8 | Staff visibility contract, shared predicate builders                 |
| [`fix-002-implementation-plan-examination-runtime-and-visibility-open-case.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-07-08/fix-002-implementation-plan-examination-runtime-and-visibility-open-case.md) | Jul 8 | Omnibus open case — Phase 5 items unchecked; monitoring issue is NEW |

---

## What the Next Implementation Plan Must Address

### For Issue 1 (Private Exam Visibility)

1. **Run diagnostic SQL first** — confirm the DB state of `exams`, `exam_section_assignments`, and `enrollments` for at least one affected exam and student pair before changing code.
2. **Trace the full API response** — capture `GET /api/exams` response for the affected student and confirm whether the exam JSON appears in the response.
3. **If exam IS in API response but NOT shown in UI** → the bug is frontend (`normalize-student-exam` or `isActiveStudentExamStatus` filtering it out).
4. **If exam is NOT in API response** → the bug is backend (missing ESA row or wrong predicate).
5. **Focus strongly on `normalizeStudentExam()` and `resolveStudentExamStatus()`** as the highest-probability cause — private exams may return a status that does not resolve to `available` or `upcoming`, causing them to be silently dropped by `useExamList` and `useStudentHistory`.

### For Issue 2 (Monitoring Telemetry)

1. **Check server logs first** to identify exactly where the pipeline is breaking (received, ignored, queued but not processed, or session eligibility failure).
2. **Confirm whether ANY events reach the API** by checking network requests from a student browser during an active attempt.
3. **Verify the telemetry settings** are enabled and the `flagged_incidents_dedupe_key_unique` migration index exists in production.
4. **Check Redis/BullMQ worker status** if async batching mode is active.
5. **Do not add more client-side guards** until the server pipeline is confirmed operational end-to-end.
