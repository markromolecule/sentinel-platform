# Fix 001 Implementation Plan: Issues During Examination

## Pre-Planning

- [x] Task summary: stabilize student examination telemetry/status behavior, then add instructor-accessible remediation flows for retake/makeup as scheduled exam clones with the same questions and direct monitoring-page navigation to reports, action queue, and incident logs.
- [x] Relevant source files scanned:
    - `docs/context/July/issue-during-examination.md`
    - `.agents/rules/implementation-plan.md`
    - `.agents/rules/global/1-3-1-rule.md`
    - `.agents/workflows/to-do-workflow.md`
    - `docs/task/2026-07-03/fix-001-implementation-plan-proctoring-recalibration-and-realtime-monitoring.md`
    - `docs/task/2026-07-03/feat-002-implementation-plan-solidify-exam-lifecycle.md`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts`
    - `app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts`
    - `app/sentinel-web/src/workers/audio-anomaly.worker.ts`
    - `app/sentinel-web/src/workers/audio-anomaly-engine.ts`
    - `packages/shared/src/audio/audio-anomaly.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts`
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_components/history-card.tsx`
    - `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts`
    - `packages/shared/src/exams/resolve-exam-status.ts`
    - `packages/services/src/api/history.ts`
    - `app/sentinel-api/src/modules/examination/lifecycle/services/grant-retake-exam-window.ts`
    - `app/sentinel-api/src/modules/examination/lifecycle/services/grant-makeup-exam-window.ts`
    - `app/sentinel-api/src/modules/examination/flow/data/session.repository.ts`
    - `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts`
    - `app/sentinel-api/src/modules/examination/student-overrides/student-overrides.service.ts`
    - `packages/db/prisma/schema.prisma`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-nav.tsx`
    - `app/sentinel-core/src/app/(protected)/exams/[id]/_components/exam-session-nav.tsx`
- [x] Files, services, and DB tables likely touched:
    - DB: `exams`, `exam_sections`, `exam_questions`, `exam_configurations`, `exam_section_assignments`, `exam_attempts`, `exam_attempt_lifecycle_events`, `flagged_incidents`, `system_settings`, and a new remediation linkage table if the recommended clone model is implemented.
    - Shared contracts: `packages/shared/src/schema/exams/student-override-schema.ts`, `packages/shared/src/schema/exams/lifecycle-schema.ts`, `packages/shared/src/types/exams/exam.ts`, `packages/shared/src/exams/resolve-exam-status.ts`, `packages/shared/src/audio/audio-anomaly.ts`.
    - API modules: `app/sentinel-api/src/modules/examination/lifecycle`, `flow`, `access`, `student-overrides`, `reporting`, `monitoring`, `exams/data`, and `telemetry`.
    - Web student UI: student history hook/card, exam monitoring hook, audio anomaly hook/worker, attempt submission flow.
    - Instructor/core UI: `exam-session-nav.tsx`, monitoring hooks/pages, report/action queue/log links.
- [x] Prisma migration decision: **migration required** for the recommended retake/makeup clone model because a new durable link is needed between the source exam, cloned remediation exam, source attempt, target student, remediation type, and schedule. The telemetry/status fixes do not require a migration.

## 1-3-1 Architectural Decision

### Option 1: Patch Current Same-Exam Override Flow

Keep retake/makeup as `system_settings` access overrides on the original exam, then only fix the student telemetry, history label, and monitoring sidebar links.

Tradeoff: fastest and lowest schema cost, but it does not satisfy the requested "new Exam but same Questions" remediation flow and keeps reporting/remediation history harder to reason about.

### Option 2: Scheduled Remediation Exam Clone (Recommended)

Create a remediation service that clones the source exam schedule shell, sections, questions, configuration, and assignments into a new exam; restricts that cloned exam to the target student through a durable remediation linkage; and keeps source attempt audit events connected through lifecycle records.

Tradeoff: moderate backend/schema scope, but it matches the requested retake/makeup flow, preserves original attempt evidence, and reuses existing exam/report/monitoring pages instead of creating new pages.

### Option 3: Full Remediation Assignment Module

Build a first-class remediation module with its own tables, queue UI, schedule editor, notification lifecycle, and separate remediation dashboards.

Tradeoff: most scalable long-term, but too broad for this issue because the current request explicitly asks to avoid creating pages from scratch and to add access from existing monitoring/report surfaces.

## Best Option

Choose **Option 2: Scheduled Remediation Exam Clone**.

Why: the current lifecycle work already supports source attempts, audit events, and fresh attempts for retake/makeup, while the exam builder/reporting stack already understands normal exams. Cloning an exam with a durable remediation link gives instructors a real rescheduled exam with the same questions, avoids exposing the remediation to every enrolled student, and keeps monitoring/report/action-queue links pointed at existing pages.

Concrete next steps:

1. Lock down the proctoring regressions with focused tests for fullscreen submit suppression, clipboard occurrence count, and active audio anomaly persistence.
2. Fix the student history card/status logic so future exams show `Upcoming` instead of `Open Exam`.
3. Add remediation-exam linkage schema and a backend clone service that copies exam structure and questions from the source exam.
4. Update retake/makeup lifecycle grant endpoints to create scheduled remediation exams instead of only granting same-exam overrides.
5. Update access, student exam lists, reports, and monitoring so only the target student can see/start the remediation exam and instructors can trace it back to the source attempt.
6. Add existing-page links for attempt summary, action queue, and incident logs in the monitoring sidebar for both `sentinel-web` and `sentinel-core`.
7. Run focused Vitest suites, Prisma validation/generation, formatting, lint, and one manual student/instructor verification pass.

## Phase 1: Proctoring Regression Guards

**Goal:** Ensure browser and audio incidents only persist when caused by an active student attempt, with accurate first-occurrence counts.

- [ ] Verify `handleFullscreenChange()` in `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts` exits early when `isMonitoringSuspended.current` is true before any `FULL_SCREEN_EXIT` telemetry or lock call.
- [ ] Verify `handleSubmit()` and `suspendSecurityMonitoring()` ordering in `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.ts` and `use-attempt-submission.ts` so submission/redirect/fullscreen teardown cannot emit post-submit fullscreen telemetry.
- [ ] Verify `IncidentPersistenceService.appendEvent()` in `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts` ignores `FULL_SCREEN_EXIT` when the target `exam_attempts` row is already `COMPLETED` or has `completed_at`.
- [ ] Update `registerClipboardIncident()` in `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring/use-interaction-listeners.ts` only if the keydown and DOM clipboard listeners can still emit two accepted `CLIPBOARD_ATTEMPT` events for one copy/cut/paste burst.
- [ ] Update `IncidentPersistenceService.appendEvent()` in `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts` only if the first persisted clipboard incident writes `details.occurrenceCount = 2` instead of `1`.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts` for active fullscreen exit, suspended fullscreen exit after turn-in, and one clipboard burst producing one telemetry call.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx` proving turn-in suspends monitoring before route/completion/fullscreen side effects.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts` proving first `CLIPBOARD_ATTEMPT` stores `occurrenceCount: 1`, a second accepted occurrence stores `2`, completed attempts reject fullscreen exits, and active attempts still persist student-caused fullscreen exits.

**Migration required:** No - this phase uses existing `exam_attempts` completion fields and `flagged_incidents.details`.
**Breaking changes:** No - false-positive and duplicate telemetry are suppressed without changing public DTO shapes.
**New environment variables:** None.

## Phase 2: Audio Anomaly Detection Activation

**Goal:** Make configured microphone/audio monitoring produce reviewable `AUDIO_ANOMALY` incidents during active attempts.

- [ ] Audit `useAttemptMonitoring()` in `app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/use-attempt-monitoring.ts` to confirm `configuration.micRequired`, `configuration.aiRules.audio_anomaly_detection`, `examSessionId`, `studentId`, `audioStream`, and `worker` are all available after checkup and before the attempt starts.
- [ ] Update `app/sentinel-web/src/workers/audio-anomaly.worker.ts` so capability failure checks match the CPU-backed `AudioAnomalyEngine.initialize()` path and do not block detection solely because WASM is unavailable when CPU inference is the intended backend.
- [ ] Update `useAudioAnomalyWorker()` in `app/sentinel-web/src/hooks/use-audio-anomaly-worker.ts` to send `runtimeConfig ?? DEFAULT_AUDIO_ANOMALY_CONFIG`, emit one telemetry event per detected anomaly type while active, and suppress emissions after `isSuspended` becomes true.
- [ ] Review `DEFAULT_AUDIO_ANOMALY_THRESHOLDS` and `DEFAULT_AUDIO_ANOMALY_CONFIG` in `packages/shared/src/audio/audio-anomaly.ts` and document whether shouting/talking should map to `TALKING` at the current threshold or whether the default threshold needs calibration.
- [ ] Verify `AudioAnomalyRule.evaluate()` in `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.ts` persists confidence-threshold events for `AUDIO_ANOMALY` and does not require repeat events when `metadata.confidenceScore` crosses the threshold.
- [ ] Write or update `app/sentinel-web/src/workers/tests/audio-anomaly-engine.test.ts` for a mocked YAMNet talking score crossing threshold after the configured consecutive frames.
- [ ] Add or update `app/sentinel-web/src/hooks/use-audio-anomaly-worker.test.tsx` proving `ANOMALY_DETECTED` from the worker calls `ingestTelemetryEvent()` with `eventType: 'AUDIO_ANOMALY'`, `ruleKey: 'aiRules.audio_anomaly_detection'`, `anomalyType`, and `confidenceScore`.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/ingestion/rules/ai-rules.test.ts` or the nearest ingestion test proving audio confidence above threshold produces a persist decision.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts` proving persisted audio incidents map to instructor-visible `AUDIO_DETECTED`/audio anomaly flags with occurrence count and severity metadata.

**Migration required:** No - audio events already use telemetry ingestion and `flagged_incidents`.
**Breaking changes:** No - audio telemetry remains additive to the existing incident stream.
**New environment variables:** None.

## Phase 3: Student History Upcoming State

**Goal:** Prevent future scheduled exams from appearing as actionable `Open Exam` items before `scheduled_date`.

- [ ] Update `HistoryCard` in `app/sentinel-web/src/app/(protected)/student/history/_components/history-card.tsx` so `item.status === 'upcoming'` renders `Upcoming`, not `Open Exam`, on mobile and desktop labels.
- [ ] Update `getHistoryHref()` in `app/sentinel-web/src/app/(protected)/student/history/_components/history-card.tsx` so upcoming exams either route to the existing exam detail/readiness page with access blocked by runtime access or use the same destination as available exams while preserving the non-open label; do not add a new page.
- [ ] Update `useStudentHistory()` in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` only if it maps future `scheduledDate` exams to `available` after `normalizeStudentExam()`.
- [ ] Update `isActiveStudentExamStatus()` in `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts` only if the available feed should continue including upcoming exams while distinguishing their label.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/history/_components/history-card.test.tsx` proving upcoming items render `Upcoming`, available/in-progress items render `Open Exam`, and turned-in/past-due labels remain unchanged.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` proving an exam with `scheduledDate` in the future is normalized to `upcoming`, remains visible in the active feed, and does not appear as an open action.
- [ ] Write or update `packages/shared/src/exams/resolve-exam-status.test.ts` for future `scheduledDate` plus no completed attempt returning `upcoming`.

**Migration required:** No - this phase is status mapping and UI label behavior only.
**Breaking changes:** No - route and API shapes stay the same.
**New environment variables:** None.

## Phase 4: Remediation Exam Schema and Clone Service

**Goal:** Represent each retake or makeup as a separate scheduled exam that preserves the original questions and links back to the source evidence.

- [ ] Update `packages/db/prisma/schema.prisma` with a new `exam_remediation_schedules` model containing `remediation_id`, `source_exam_id`, `remediation_exam_id`, `student_id`, `source_attempt_id`, `remediation_type`, `scheduled_date`, `end_date_time`, `created_by`, `created_at`, and `notes`.
- [ ] Add enum `exam_remediation_type` with `MAKEUP` and `RETAKE` in `packages/db/prisma/schema.prisma`.
- [ ] Add indexes in `packages/db/prisma/schema.prisma` for `source_exam_id`, `remediation_exam_id`, `student_id`, and `(source_attempt_id, remediation_type)`.
- [ ] Create a Prisma migration under `packages/db/prisma/migrations/[timestamp]_add_exam_remediation_schedules/migration.sql` with foreign keys to `exams`, `students`, `exam_attempts`, and `users` where appropriate.
- [ ] Add `app/sentinel-api/src/modules/examination/lifecycle/services/create-remediation-exam.ts` to clone the source `exams` row with new `scheduled_date`, `end_date_time`, `status = 'PUBLISHED'` or the repo's published equivalent, `published_at`, `published_by`, and a title suffix that clearly identifies makeup/retake.
- [ ] In `createRemediationExam()`, copy `exam_configurations` from the source exam to the remediation exam.
- [ ] In `createRemediationExam()`, copy `exam_sections` and preserve old-to-new section ID mapping.
- [ ] In `createRemediationExam()`, copy `exam_questions` to the remediation exam with the same content, points, order, source bank metadata, passage fields, and remapped `exam_section_id`.
- [ ] In `createRemediationExam()`, copy `exam_section_assignments` and `assigned_sections` only as needed for instructor scope/reporting, then enforce student-only access through the remediation schedule table.
- [ ] In `createRemediationExam()`, insert one `exam_remediation_schedules` row linking the source exam, new exam, student, source attempt, type, schedule, actor, and notes.
- [ ] Add JSDoc to exported `createRemediationExam()` explaining that it clones exam structure and restricts runtime access through remediation eligibility.
- [ ] Write `app/sentinel-api/src/modules/examination/lifecycle/services/create-remediation-exam.test.ts` proving the service clones exam metadata, sections, questions, configuration, and writes the remediation linkage row.
- [ ] Write `packages/db/src/tests/exam-remediation-schema.test.ts` or the nearest DB schema test proving generated DB types expose `exam_remediation_schedules` and `exam_remediation_type`.

**Migration required:** Yes - remediation exams need durable source/target/student/type linkage that cannot be inferred safely from cloned exam titles or `system_settings`.
**Migration rollback note:** Drop `exam_remediation_schedules` and `exam_remediation_type`; cloned remediation exam rows created after deployment would need manual cleanup before rollback.
**Breaking changes:** No - this is additive schema and service work.
**New environment variables:** None.

## Phase 5: Retake and Makeup Lifecycle Grants

**Goal:** Route instructor retake/makeup grants through the remediation clone model while preserving source-attempt lifecycle audit history.

- [ ] Update `grantRetakeExamWindow()` in `app/sentinel-api/src/modules/examination/lifecycle/services/grant-retake-exam-window.ts` to call `createRemediationExam()` with `remediationType: 'RETAKE'`, required `sourceAttemptId`, and the requested `availableFrom`/`availableUntil` schedule.
- [ ] Update `grantMakeupExamWindow()` in `app/sentinel-api/src/modules/examination/lifecycle/services/grant-makeup-exam-window.ts` to call `createRemediationExam()` with `remediationType: 'MAKEUP'`, optional `sourceAttemptId`, and the requested `availableFrom`/`availableUntil` schedule.
- [ ] Keep `StudentOverridesService.createStudentExamAccessOverride()` in `app/sentinel-api/src/modules/examination/student-overrides/student-overrides.service.ts` only for same-attempt reopen/reconnect use, or write a compatibility override that points to the new remediation exam if existing start flow still requires it.
- [ ] Update `appendExamAttemptLifecycleEvent()` calls in both grant services so source attempts receive `RETAKE_GRANTED` or `MAKEUP_GRANTED` events with `metadata.remediationExamId`, `metadata.remediationId`, `availableFrom`, and `availableUntil`.
- [ ] Update `app/sentinel-api/src/modules/examination/lifecycle/lifecycle.dto.ts` grant responses to return `remediationExam`, `remediationSchedule`, `override` only if compatibility storage remains, and `latestEvent`.
- [ ] Update `packages/shared/src/schema/exams/lifecycle-schema.ts` with remediation grant response fields.
- [ ] Update `packages/services/src/api/exams/core.ts` lifecycle grant client functions and `packages/services/src/api/exams/types.ts` types to include remediation exam IDs.
- [ ] Update `packages/hooks/src/query/exams/use-exam-attempt-lifecycle-mutation.ts` tests and implementation to invalidate source exam report/monitoring queries and the new remediation exam query key after grants.
- [ ] Write `app/sentinel-api/src/modules/examination/lifecycle/services/grant-retake-exam-window.test.ts` proving retake requires a source attempt, creates a remediation exam, and appends metadata to the source attempt event.
- [ ] Write `app/sentinel-api/src/modules/examination/lifecycle/services/grant-makeup-exam-window.test.ts` proving makeup can be granted to an absent student without a source attempt and still creates a remediation exam.
- [ ] Write `app/sentinel-api/src/modules/examination/lifecycle/lifecycle.routes.test.ts` covering instructor authorization, wrong-institution source attempt rejection, invalid schedule rejection, and successful remediation grant responses.
- [ ] Write `packages/shared/src/schema/exams/lifecycle-schema.test.ts` for grant request/response validation.
- [ ] Write `packages/hooks/src/query/exams/use-exam-attempt-lifecycle-mutation.test.ts` for updated grant response handling and invalidations.

**Migration required:** No - this phase consumes the Phase 4 remediation schema.
**Breaking changes:** Potential additive response change only. Existing consumers must tolerate the previous `override` field during transition or be updated in the same release.
**New environment variables:** None.

## Phase 6: Remediation Access, Lists, Reports, and Monitoring

**Goal:** Make remediation exams visible and startable only for the target student while preserving instructor traceability from source exam monitoring/reporting.

- [ ] Update `EntitlementsRepository.getExamAccessPolicy()` or the nearest access repository in `app/sentinel-api/src/modules/examination/access/data/entitlements.repository.ts` to load remediation schedule metadata for the requested exam.
- [ ] Update `evaluateStudentExamEligibilityService()` in `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts` so remediation exams are eligible only for the linked `student_id` and only during the remediation exam's scheduled window.
- [ ] Update `SessionRepository.createSession()` in `app/sentinel-api/src/modules/examination/flow/data/session.repository.ts` so remediation exams create a normal fresh attempt against the remediation `exam_id` and never resume or mutate the source attempt.
- [ ] Update `get-exams` student-facing data mapping in `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` or the nearest service so the target student sees the remediation exam in the appropriate upcoming/available state.
- [ ] Update `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.ts` and related query helpers so source exam reports can surface linked remediation exams for each action item/student row.
- [ ] Update `app/sentinel-api/src/modules/examination/monitoring/services/map-monitoring-response.ts` so monitoring detail can show source/remediation context when viewing a remediation attempt.
- [ ] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/_hooks/use-exam-report/index.ts` so successful grant toasts include the remediation exam schedule and invalidate the action queue.
- [ ] Mirror the report grant response handling in `app/sentinel-core/src/app/(protected)/exams/[id]/report/page.tsx`.
- [ ] Update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` only if remediation exams need a distinct label or badge in student listings.
- [ ] Write `app/sentinel-api/src/modules/examination/access/access.test.ts` proving only the linked student can access a remediation exam and unrelated enrolled classmates are blocked.
- [ ] Write `app/sentinel-api/src/modules/examination/flow/data/session.repository.test.ts` proving a remediation exam starts a new attempt against the remediation exam, not the source exam.
- [ ] Write `app/sentinel-api/src/modules/examination/reporting/services/map-reporting-response.test.ts` proving source reports show linked remediation exam IDs/statuses without counting them as duplicate source attempts.
- [ ] Write `app/sentinel-api/src/modules/examination/monitoring/services/map-monitoring-response.test.ts` for remediation context mapping.
- [ ] Write `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/_hooks/use-exam-report/index.test.tsx` and `app/sentinel-core/src/app/(protected)/exams/[id]/report/page.test.tsx` for remediation grant success and queue refresh.

**Migration required:** No - this phase consumes the Phase 4 remediation schema.
**Breaking changes:** No - remediation exams are additional exam records with restricted access.
**New environment variables:** None.

## Phase 7: Monitoring Sidebar Access Links

**Goal:** Add navigation from the monitoring sidebar to existing attempt summary, action queue, and incident log surfaces without creating new pages.

- [ ] Update `ExamSessionSection` and `ExamSessionNavItem` in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-nav.tsx` to include `report`, `queue`, and `logs` sections.
- [ ] Add web nav links in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-nav.tsx`:
    - `Attempt Summary` -> `/exams/reports/${examId}?section=attempts`
    - `Action Queue` -> `/exams/reports/${examId}?section=queue`
    - `Incident Logs` -> `/exams/${examId}/logs`
- [ ] Update `resolveActiveSection()` in the same web nav file to mark `report` active for `/exams/reports/[examId]?section=attempts`, `queue` active for `/exams/reports/[examId]?section=queue`, and `logs` active for `/exams/[id]/logs`.
- [ ] Update `isRuntimeRoute()` in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-workspace-shell.tsx` only if `/exams/[id]/logs` is not already wrapped by the runtime sidebar.
- [ ] Mirror the nav item additions in `app/sentinel-core/src/app/(protected)/exams/[id]/_components/exam-session-nav.tsx`, using core routes:
    - `Attempt Summary` -> `/exams/${examId}/report`
    - `Action Queue` -> `/exams/${examId}/report?section=queue`
    - `Incident Logs` -> `/exams/${examId}/logs`
- [ ] Update `isRuntimeRoute()` in `app/sentinel-core/src/app/(protected)/exams/[id]/_components/exam-session-workspace-shell.tsx` only if report/log routes should also display the local exam session sidebar.
- [ ] Write `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-nav.test.tsx` proving all five links render and active states resolve for monitoring, report attempts, queue, and logs.
- [ ] Write `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-workspace-shell.test.tsx` proving logs/report routes receive the sidebar if the shell is expanded.
- [ ] Write `app/sentinel-core/src/app/(protected)/exams/[id]/_components/exam-session-nav.test.tsx` and `exam-session-workspace-shell.test.tsx` for the mirrored core behavior.

**Migration required:** No - navigation only links to existing pages.
**Breaking changes:** No - routes remain unchanged and the sidebar only adds access points.
**New environment variables:** None.

## Phase 8: Validation and Release Readiness

**Goal:** Verify the reported examination issues end-to-end before release.

- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests 'src/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring.test.ts' 'src/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt/index.test.tsx'`.
- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests src/hooks/use-audio-anomaly-worker.test.tsx src/workers/tests/audio-anomaly-engine.test.ts`.
- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests 'src/app/(protected)/student/history/_components/history-card.test.tsx' 'src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts'`.
- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests 'src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-nav.test.tsx' 'src/app/(protected)/(instructor)/exams/[id]/_components/exam-session-workspace-shell.test.tsx'`.
- [ ] Run `pnpm --dir app/sentinel-core exec vitest run --passWithNoTests 'src/app/(protected)/exams/[id]/_components/exam-session-nav.test.tsx' 'src/app/(protected)/exams/[id]/_components/exam-session-workspace-shell.test.tsx'`.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/telemetry/storage/services/incident-persistence.service.test.ts src/modules/telemetry/ingestion/rules/ai-rules.test.ts`.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/examination/lifecycle/services/create-remediation-exam.test.ts src/modules/examination/lifecycle/services/grant-retake-exam-window.test.ts src/modules/examination/lifecycle/services/grant-makeup-exam-window.test.ts src/modules/examination/lifecycle/lifecycle.routes.test.ts`.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/examination/access/access.test.ts src/modules/examination/flow/data/session.repository.test.ts src/modules/examination/reporting/services/map-reporting-response.test.ts src/modules/examination/monitoring/services/map-monitoring-response.test.ts`.
- [ ] Run `pnpm --dir packages/shared exec vitest run --passWithNoTests src/exams/resolve-exam-status.test.ts src/schema/exams/lifecycle-schema.test.ts`.
- [ ] Run Prisma validation/generation for `packages/db` after the remediation migration is added.
- [ ] Run `pnpm format:check`.
- [ ] Run `pnpm lint`.
- [ ] Manually verify submitting a fullscreen exam does not create a `FULL_SCREEN_EXIT` incident after turn-in.
- [ ] Manually verify one copy/cut/paste action produces one clipboard occurrence count, and the second accepted action increments it to two.
- [ ] Manually verify shouting/talking during a mic-required, audio-enabled active attempt creates an instructor-visible audio incident.
- [ ] Manually verify a future exam in the student exam/history feed says `Upcoming`, not `Open Exam`.
- [ ] Manually verify instructor grants retake and makeup from the existing report/monitoring flow, sees a new scheduled remediation exam with copied questions, and only the target student can start it during the remediation window.
- [ ] Manually verify monitoring sidebar links open attempt summary, action queue, and incident logs in both `sentinel-web` instructor and `sentinel-core`.

**Migration required:** No - validation only.
**Breaking changes:** No - validation only.
**New environment variables:** None.

## Breaking API Changes

- None planned as removals.
- Lifecycle grant responses will gain remediation exam/linkage fields; update all current web/core consumers in the same implementation so no caller depends on the old response shape alone.

## Environment Changes

- None planned.

## Rollback Notes

- Telemetry/history/sidebar changes can be reverted independently by restoring the touched hook/component/service files.
- Remediation schema rollback requires dropping the `exam_remediation_schedules` table and `exam_remediation_type` enum after removing or manually handling remediation exam rows created during the release.
- If remediation exam cloning causes operational issues, temporarily route grant buttons back to same-exam overrides while keeping the migration in place until cloned remediation data is reconciled.

## Out of Scope

- Building new standalone pages for attempt summary, action queue, or incident logs.
- Replacing polling with WebSocket/SSE/Supabase realtime.
- A full remediation scheduling dashboard beyond grant flows reachable from existing monitoring/report/action queue surfaces.
