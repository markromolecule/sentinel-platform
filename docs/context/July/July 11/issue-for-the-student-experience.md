# Student Experience Issues — Implementation-Ready Context

> **Purpose:** Establish the confirmed scope, connected failure modes, root causes, evidence still required, and acceptance criteria for a later implementation plan. This is a context and diagnosis document, not an implementation plan.

## Executive diagnosis

The reported student experience is not one bug. It is a chain of failures across four contracts:

1. **Publication and assignment contract:** a private exam assigned to a classroom must be discoverable through the same assignment relation used by the student read scope.
2. **Telemetry contract:** an event accepted by the API must be durably persisted and observable by instructor and administrator monitoring.
3. **Monitoring semantics contract:** the system must distinguish a student-caused anomaly from a browser/system transition, and must deduplicate without changing the meaning of an event.
4. **Attempt recovery contract:** reload, network loss, and power loss must preserve answers, keep the attempt recoverable, and return the student to a controlled lobby/admission state.

The most likely systemic root cause is **missing end-to-end invariants and environment-backed validation**. Prior tasks changed individual predicates, hooks, and UI behavior, but did not prove the complete production path from assignment write → student list/detail read, or browser event → production queue/worker → incident row → monitoring read. Consequently, plans were marked complete based on unit-level evidence while the user-visible contracts remained unverified.

No production database, queue, worker, or browser network trace was provided in this workspace. Therefore, the document distinguishes confirmed code facts from hypotheses and names the exact evidence needed to close each diagnosis.

## Scope and user impact

### A. Private classroom-assigned exam is invisible

Reproduction target:

- `exams.is_public = false`
- `exams.published_at IS NOT NULL`
- `exams.status <> 'draft'`
- the exam has a classroom assignment in `exam_section_assignments.class_group_id` or `exams.class_group_id`
- the student has a current, non-archived enrollment in that same classroom

Expected: the exam appears in `/student/exam`, the available view of `/student/history`, and its detail endpoint can be opened.

Observed: it is missing unless `is_public = true`. Direct user assignment reportedly works.

Connected issues:

- list and detail endpoints can disagree about visibility;
- assignment rows may be absent, stale, or written to a different representation than the read predicate checks;
- public visibility can mask bad assignment data and must not be treated as a fix;
- student UI filters are silent, so a missing API row and a filtered API row look identical;
- classroom, section, subject, institution, and archived-enrollment scope can affect the result;
- the available tab is currently derived from `useExamsQuery`, while past tabs use history data, creating two data paths that need parity.

### B. Proctoring events are not trustworthy or visible

Connected examination issues:

- duplicate event rows or occurrence counts;
- audio reported as `TYPING` when the observed sound was speech/shouting;
- audio monitoring not starting or not recovering after navigation/reconnection;
- normal turn-in causing `FULL_SCREEN_EXIT`;
- instructor/admin monitoring and lobby surfaces not reflecting recovery or new incident state;
- production telemetry accepted by the API but absent from monitoring.

These are separate failure points and must not be solved by only changing severity or UI labels.

### C. Attempt recovery is incomplete

Recovery cases:

- accidental reload;
- temporary network loss;
- browser/tab termination or device power loss;
- returning to an attempt after the stored answer draft is restored;
- microphone/audio stream or worker initialization failing during recovery.

Expected behavior: answers and elapsed time are recovered where possible; the attempt is reconciled with the server; the student is redirected to the exam lobby; the student waits for the instructor when admission is instructor-gated; monitoring is suspended/restarted explicitly; and instructor/admin surfaces show the recovery state.

## Current code evidence

### Visibility

The current student predicate in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` does not require `e.is_public = true`. It checks:

- direct `e.class_group_id` against `enrollments.class_group_id`;
- an `exam_section_assignments` row against the enrolled classroom;
- section/subject fallback only when no classroom-specific assignment exists;
- publication (`published_at` and non-draft status) separately.

Both `get-exams.ts` and `get-exam-by-id.ts` call the shared publication and student-visibility predicates. Existing SQL-shape tests also assert that private assigned exams are not gated by `is_public = true`.

The current frontend is unlikely to be the primary cause claimed by earlier notes. `resolveStudentExamStatus()` returns `available` when there is no schedule, and `normalizeStudentExam()` uses the same resolver. `use-exam-list.ts` and the available branch of `use-student-history` then retain `available`, `upcoming`, and `in-progress`. This remains a regression surface, but it is not evidence that private status is inherently dropped.

Therefore the visibility investigation must first answer: **does the affected private exam exist in the API response?**

- If no: assignment/enrollment/publication query or persisted data is wrong.
- If yes but hidden: normalization or UI filtering is wrong.
- If list includes it but detail rejects it: list/detail scope parity is wrong.

### Telemetry

The production path can differ materially from local development:

- sync mode writes through `TelemetryStorageService.appendEvent()` inline;
- Redis mode only enqueues a BullMQ job in `ingestion-queue.service.ts`;
- the worker is a separate process: `pnpm --dir app/sentinel-api start:telemetry-worker`;
- the worker must use the same Redis URL, queue name, job name, and database credentials as the API;
- batch events can remain in the Redis list until `flushBuffer()` is invoked;
- worker errors other than terminal 404/409 are rethrown and require queue retry/failure monitoring.

This makes “API returns success but `flagged_incidents` remains empty” a concrete production infrastructure/configuration failure candidate, not proof of a frontend issue. The monitoring read path can correctly return zero when the write side has not persisted anything.

### Audio

The browser uses a YAMNet model in a Web Worker. The engine:

- analyzes approximately 0.975-second, 16 kHz windows;
- maps model classes into configured anomaly types;
- uses independent consecutive-frame thresholds and cooldowns;
- supports `TALKING`, `TYPING`, and `BACKGROUND_NOISE` as distinct labels;
- emits only the strongest triggered anomaly in a window;
- falls back to RMS amplitude for `BACKGROUND_NOISE`.

Therefore a “shouting” sample can be labeled `TYPING` when the model/class mapping or configured threshold selects typing-like classes. The current implementation does not identify human intent; it classifies model output. The root problem is calibration and explainability, not simply deduplication. Audio start/recovery is also a lifecycle problem: `StudentExamAudioProvider` clears the stream when its track ends, while `ensureAudioAccess()` must explicitly acquire a new stream. A reconnect path that only reloads the attempt cannot assume the old `MediaStream` remains usable.

### Fullscreen and deduplication

Prior changes already add client suspension and server-side completed-attempt suppression for `FULL_SCREEN_EXIT`, and server persistence tracks occurrence counts. These protections still require an end-to-end test proving the exact ordering:

`suspend monitoring → submit/complete → fullscreen teardown/route change`.

The server must remain authoritative because browser event ordering is nondeterministic. A completed attempt must never create a fullscreen incident; an active attempt must still accept a genuine exit. Deduplication must collapse only the documented same-rule/time-window stream and must preserve the first event, latest event, and occurrence count.

## Root-cause tree

### Root cause 1 — Assignment visibility invariant is not enforced

The system stores assignment meaning in multiple places (`exams.class_group_id`, `exam_section_assignments`, legacy section assignment data, and enrollment rows). The read predicate is centralized, but the write path and production data have not been proven to maintain the invariant. The most likely concrete causes are:

1. the assignment row was not persisted or was deleted during an update;
2. the row's `class_group_id` does not equal the student's active enrollment;
3. the student has a stale/archived/duplicate enrollment;
4. list and detail use different query variants or identity scope;
5. publication/status data differs between the affected environment and local fixtures.

Frontend status normalization is a secondary fallback hypothesis only after API inclusion is confirmed.

### Root cause 2 — Production async telemetry has no proven durable consumer

When production uses Redis mode, API acceptance means enqueueing, not persistence. The worker is separately deployable and there is no evidence in this repository that production runs it, that its queue configuration matches the API, or that failed/stalled jobs alert anyone. This is the primary root-cause candidate for production-only missing monitoring incidents.

### Root cause 3 — Audio classification is treated as a deterministic event label

The model chooses among configured classes from short windows; shouting, speech, keyboard noise, and room noise can overlap acoustically. Without storing top classes, confidence, threshold, model/config version, and stream health, an instructor cannot distinguish a model false positive from a bad microphone or failed worker. The current event contract is too weak for credible review.

### Root cause 4 — Attempt recovery has no single server/client state transition

Local answer drafts exist, but recovery depends on browser storage, lobby markers, stored session state, runtime access, admission state, and audio stream state. These are not one transactional lifecycle. A reload can restore answers while the server still considers the attempt active, or return the student to an attempt with an ended audio track. Recovery must be modeled as an explicit attempt transition and reconciled with the server before resuming.

## Required evidence before implementation planning

Do not mark the next plan complete until the following evidence is attached to its execution log.

### Visibility diagnostic

For one affected `exam_id` and `student_user_id`, capture:

```sql
SELECT exam_id, is_public, status, published_at, class_group_id, section_id, institution_id
FROM exams WHERE exam_id = '<exam_id>';

SELECT exam_id, class_group_id, section_id
FROM exam_section_assignments WHERE exam_id = '<exam_id>';

SELECT st.user_id, enr.enrollment_id, enr.class_group_id, cg.archived_at
FROM students st
JOIN enrollments enr ON enr.student_id = st.student_id
JOIN class_groups cg ON cg.class_group_id = enr.class_group_id
WHERE st.user_id = '<student_user_id>';
```

Also record the raw response from `GET /api/exams` and `GET /api/exams/:id` as the student, then classify the failure as database scope, API response, or UI filtering.

### Telemetry diagnostic

For one fresh active attempt, record:

- browser request URL, payload IDs, HTTP status, and response body;
- effective `TELEMETRY_INGESTION_MODE` and telemetry settings;
- Redis queue waiting/active/failed/completed counts and buffer length;
- worker startup/ready/error/stalled logs;
- migration/index state for the telemetry dedupe constraint;
- whether `flagged_incidents` gains a row within the target latency;
- monitoring API response for the same attempt.

The health endpoint and queue stats should be used instead of inferring health from a 200 response alone.

### Audio and recovery diagnostic

Capture browser/runtime evidence for a clean attempt, reload, network interruption, and microphone track termination:

- audio worker phase (`idle`, `initializing`, `running`, `error`);
- `audioStream` presence and audio track `readyState`;
- model load/network errors;
- effective enabled anomaly types, thresholds, cooldown, and configuration version;
- raw top classes/confidence for the disputed sound;
- answer draft/session/lobby marker before and after recovery;
- attempt status, reconnect count, lobby admission, and monitoring state from the API.

## Implementation-plan requirements and acceptance criteria

The later plan must be split into independently testable workstreams:

1. **Visibility invariant:** one canonical assignment resolver or predicate; transactional create/update assignment writes; list/detail parity; regression tests for private classroom assignment, public classroom assignment, direct assignment, stale enrollment, and update of `isPublic` alone.
2. **Telemetry durability:** explicit production worker deployment/runbook; matching queue configuration; health metrics for accepted, persisted, dropped, failed, and delayed events; retry/dead-letter handling; a test that follows a real event to `flagged_incidents` and monitoring within the agreed latency.
3. **Event semantics:** client suspension before submission; server suppression after completion; deterministic dedupe key/window; occurrence-count tests; monitoring parity in both `sentinel-web` and `sentinel-core` where those surfaces are mirrored.
4. **Audio lifecycle and calibration:** re-acquire audio after an ended track or recovery; expose a recoverable warning; persist diagnostic metadata; calibrate `TALKING`/`TYPING`/`BACKGROUND_NOISE` against a labeled fixture set; define what confidence and consecutive-frame threshold means before an instructor-visible incident is created.
5. **Attempt recovery:** define server states and idempotent transitions for `ACTIVE`, `RECOVERY_REQUIRED`, `LOBBY_WAITING`, `LOBBY_APPROVED`, `RESUMED`, and `COMPLETED` (names may follow existing enums); restore answers through a server reconciliation step; redirect to lobby on reload/network/power recovery; prevent stale attempts and duplicate submissions; update student, instructor, and administrator surfaces.

Minimum acceptance criteria:

- a private classroom-assigned published exam appears without making it public;
- list and detail return the same access decision;
- one genuine event creates one incident and repeated events produce a documented occurrence count;
- turn-in never creates `FULL_SCREEN_EXIT`;
- a production-like Redis run proves events persist with the worker running and fails visibly when it is stopped;
- audio recovery either restarts successfully or clearly reports monitoring unavailable;
- reload/network/power recovery preserves answers, returns through lobby/admission, and is visible to staff;
- focused automated tests pass, followed by an authenticated manual QA matrix in a production-like environment.

## Related prior work

The following plans are evidence of attempted fixes and must be reviewed for actual code/test/production completion rather than copied as “done”:

- `docs/task/2026-07-11/fix-001-implementation-plan-visibility-and-telemetry-pipeline.md`
- `docs/task/2026-07-08/fix-001-implementation-plan-private-visibility-assigned.md`
- `docs/task/2026-07-08/fix-002-implementation-plan-examination-runtime-and-visibility-open-case.md`
- `docs/task/2026-07-07/fix-004-implementation-plan-attempt-turn-in-dedupe-and-audio-anomaly.md`
- `docs/task/2026-07-07/fix-005-implementation-plan-dedupe-audio-calibration.md`
- `docs/task/2026-07-06/fix-001-implementation-plan-attempt-event-and-answer-integrity.md`
- `docs/task/2026-07-05/fix-002-implementation-plan-student-exam-assignment-visibility.md`
- `docs/task/2026-07-05/fix-003-implementation-plan-audio-event-flagging-and-exam-flow-bugs.md`
- `docs/task/2026-07-04/fix-001-implementation-plan-issues-during-examination.md`
- `docs/task/2026-07-03/fix-001-implementation-plan-proctoring-recalibration-and-realtime-monitoring.md`

The next implementation plan should not claim resolution from unit tests alone. It must include production-like contract tests, deployment verification for the telemetry worker, and manual evidence for the authenticated student/instructor/admin flows.
