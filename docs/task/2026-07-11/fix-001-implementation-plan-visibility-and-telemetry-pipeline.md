# Fix 001 Implementation Plan: Visibility And Telemetry Pipeline

**Status:** Planned
**Date:** 2026-07-11
**Type:** fix
**Scope:** `sentinel-web`, `sentinel-api`, `packages/shared`

---

## Pre-Planning

- **Summary of the Task:** Resolve two persistent production issues — (1) students cannot see private exams assigned to their classroom despite being enrolled, and (2) the instructor Monitoring page receives zero telemetry incidents in production while the same pipeline works correctly in local development.
- **Source Files Scanned:**
    - `docs/context/July/July 11/issue-still-not-resolved.md`
    - `docs/task/2026-07-08/fix-002-implementation-plan-examination-runtime-and-visibility-open-case.md`
    - `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts`
    - `packages/shared/src/exams/resolve-exam-status.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/config/ingestion-queue.config.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-policy.service.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-job-processor.service.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-aggregation.service.ts`
    - `app/sentinel-api/src/modules/telemetry/storage/storage.service.ts`
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
    - `app/sentinel-api/src/modules/telemetry/storage/services/incident-session-eligibility.service.ts`
    - `app/sentinel-api/src/modules/telemetry/settings/telemetry-settings-resolver.service.ts`
    - `app/sentinel-api/src/modules/telemetry/ingestion/controllers/flush-telemetry.controller.ts`
    - `packages/db/prisma/migrations/20260706000000_add_telemetry_dedupe_index/migration.sql`
    - `app/sentinel-api/.env.example`
- **Files, Services, And DB Tables To Touch:**
    - **Issue 1 (Visibility):**
        - `packages/shared/src/exams/resolve-exam-status.ts` — `resolveStudentExamStatus()`
        - `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts` — `normalizeStudentExam()`
        - `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts` — status filter
        - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` — `isActiveStudentExamStatus` filter
        - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` — `buildStudentExamVisibilityPredicate()`
        - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
        - DB: `exams`, `exam_section_assignments`, `enrollments`, `class_groups`
    - **Issue 2 (Telemetry Pipeline):**
        - `app/sentinel-api/src/modules/telemetry/ingestion/config/ingestion-queue.config.ts` — `TELEMETRY_INGESTION_MODE` env var documentation
        - `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts` — observability improvements
        - `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts` — sync fallback on worker unavailability
        - `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts` — startup error handling / health signal
        - `app/sentinel-api/.env.example` — missing `TELEMETRY_INGESTION_MODE` documentation gap for production
        - DB: `flagged_incidents` (migration verification)
- **Prisma Migration Needed:** Conditional — the existing migration `20260706000000_add_telemetry_dedupe_index` must be verified as applied to production; no new migration is needed for code changes.

---

## 1-3-1 Options

### Issue 1: Private Assigned Exam Visibility

#### Option A: The Pragmatic Path — Frontend Status Guard Fix Only

Patch `normalizeStudentExam()` so any exam returned from the API with `scheduledDate = null`, no completed attempt, and no `endDateTime` in the past, defaults to `available` instead of falling through to an unhandled status. Add a guard in `isActiveStudentExamStatus()` for the `published` pass-through value.

- **Tradeoff:** Fastest fix, but doesn't surface and confirm the backend predicate state; if there's also a backend data gap, the fix only partially works.

#### Option B: The Strategic Path — Layered Diagnosis Then Fix (Frontend + Backend)

Run the diagnostic SQL first to determine whether the exam IS being returned by the API, then fix at the correct layer: (1) patch `normalizeStudentExam()` / `resolveStudentExamStatus()` if the exam appears in the API response but is dropped by the frontend, AND (2) verify `buildStudentExamVisibilityPredicate()` handles the `class_group_id=null on exam row, ESA exists` edge case if the exam doesn't appear at all. Cover both with tests.

- **Tradeoff:** Slightly more phases, but produces a verified fix at the actual root cause rather than a defensive patch at the wrong layer.

#### Option C: The Pivot Path — Unified Visibility Contract With E2E Test

Introduce a dedicated `usePrivateExamGuard()` utility that handles all visibility normalization for private exams, backed by an E2E contract test that drives the full student exam list from the API schema down to the UI filter, making future regressions impossible.

- **Tradeoff:** More architectural but disproportionately heavy for a targeted bug fix; E2E test infrastructure doesn't currently exist in this codebase.

**Best Option for Issue 1:** **Option B** — Run the diagnostic to confirm the layer, then fix at the confirmed root cause with tests. This has been attempted but never validated end-to-end; prior fixes marked themselves done without actually running the affected student flow.

---

### Issue 2: Monitoring Telemetry Not Received in Production

#### Option A: The Pragmatic Path — Worker Health Check + Sync Fallback

Add a startup health signal from the BullMQ worker and configure a sync fallback in `ingestion-queue.service.ts` when Redis is unavailable or the worker is unhealthy. Verify the production migration is applied.

- **Tradeoff:** Immediate resilience improvement, but doesn't change the root cause (worker not running) — just mitigates it.

#### Option B: The Strategic Path — Production Environment Diagnosis + Worker Reliability Hardening

Step 1: Confirm the exact failure point (missing migration, worker not running, or wrong `TELEMETRY_INGESTION_MODE` env var in production) using the diagnostic steps. Step 2: Apply the fix at the confirmed point — e.g., apply the missing migration, start the worker process, or correct the env var. Step 3: Add a `/internal/health` route or queue stats endpoint so the production ops team can observe BullMQ worker state without needing DB access.

- **Tradeoff:** Requires production access to verify the env config; produces an observable, maintainable result.

#### Option C: The Pivot Path — Move Telemetry to Fully Synchronous Mode in Production

Change `TELEMETRY_INGESTION_MODE` to `sync` in production, eliminating Redis/BullMQ as a dependency for the ingestion pipeline entirely. This instantly resolves the production issue.

- **Tradeoff:** Sync mode adds latency to the telemetry HTTP handler and cannot handle high-concurrency exam sessions at scale; regresses the architectural choice made in fix-004/fix-005.

**Best Option for Issue 2:** **Option B** — Confirm the failure point, fix at the confirmed layer, and add queue observability. The production-only nature strongly implicates the async BullMQ path (Option A's sync fallback only defers the problem) and sync mode (Option C) is a regression.

---

## Concrete Next Steps

### Issue 1 (Visibility):
1. Determine whether a private assigned exam appears in `GET /api/exams` response for the affected student (network capture or DB diagnostic SQL).
2. If in API response: fix `normalizeStudentExam()` to handle `published` status for exams without a `scheduledDate`.
3. If not in API response: fix `buildStudentExamVisibilityPredicate()` for the `exams.class_group_id IS NULL, ESA has class_group_id` edge case.
4. Write Vitest tests for both the frontend normalization and backend predicate.

### Issue 2 (Telemetry):
1. Check production env vars — confirm `TELEMETRY_INGESTION_MODE=redis` and `REDIS_URL` are set.
2. Check BullMQ worker process is running in production.
3. Verify `flagged_incidents_dedupe_key_unique` index exists in production DB.
4. Add queue stats health endpoint / better worker startup observability.
5. Add Vitest test for the `sync` fallback path when Redis is unreachable.

---

## Phase 1: Issue 1 — Diagnosis and Frontend Status Normalization Fix

**Goal:** Confirm whether the API returns private assigned exams for enrolled students, and fix the status normalization gap that causes them to be dropped by the frontend filter.

- [ ] Verify the diagnosis: capture the `GET /api/exams` network response for an affected student to confirm whether the private assigned exam is present in the JSON payload or absent. Record the `status` value on the exam object if present.
- [ ] Inspect `resolveStudentExamStatus()` in `packages/shared/src/exams/resolve-exam-status.ts` — confirm that when `scheduledDate = null`, `endDateTime = null`, `attemptCompletedAt = null`, and `status = 'published'`, it returns `'available'` (line 115-116: it already returns `'available'` when `scheduledDate` is `null` and attempt is not completed). Document the confirmed behavior.
- [ ] Inspect `normalizeStudentExam()` in `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.ts` — confirm that when the API returns `status = 'published'` and `completedAt = null`, the exam passes through the `STUDENT_EXAM_STATUSES.has()` check, falls to the `resolveStudentExamStatus()` call, and correctly receives `'available'`. Document the confirmed or broken path.
- [ ] If the status normalization is broken (i.e., `'published'` is not in `STUDENT_EXAM_STATUSES` and falls to the bottom `else` path with `attemptStatus = 'published'` instead of `null`): update `normalizeStudentExam()` so the bottom `else` branch passes `attemptStatus: null` when `exam.status` is not an attempt status (e.g., not `'in-progress'`). The current code passes `attemptStatus: exam.status === 'in-progress' ? 'in-progress' : null` which may already be correct — verify this handles `'published'` as `null`.
- [ ] Confirm that `isActiveStudentExamStatus()` passes `'available'` and `'upcoming'` — it already does; no change needed.
- [ ] Write or update `packages/shared/src/exams/resolve-exam-status.test.ts` with a case proving `resolveStudentExamStatus({ status: 'published', scheduledDate: null, endDateTime: null, attemptCompletedAt: null, attemptStatus: null })` returns `'available'`.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/_lib/normalize-student-exam.test.ts` (create if absent) proving that an exam with `status: 'published'`, `completedAt: undefined`, and `scheduledDate: null` normalizes to `status: 'available'` and passes `isActiveStudentExamStatus()`.
- [ ] Write or update `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.test.ts` (create if absent) proving a private exam with a `published` API status is included in the `groupedExams` output after normalization.

**Migration required:** No — this phase adjusts frontend normalization and shared utility behavior only.

---

## Phase 2: Issue 1 — Backend Predicate Verification

**Goal:** Confirm that `buildStudentExamVisibilityPredicate()` returns private assigned exams for enrolled students, and fix the edge case if the `exams.class_group_id IS NULL, ESA class_group_id IS NOT NULL` path is broken.

- [ ] Run diagnostic SQL from the context document against the staging/production DB for at least one affected exam and student pair — record `exams.class_group_id`, `exam_section_assignments.class_group_id`, and `enrollments.class_group_id`.
- [ ] Confirm that when `exams.class_group_id IS NULL` and `exam_section_assignments.class_group_id` is populated, the second clause in `buildStudentExamVisibilityPredicate()` (`buildClassroomAssignmentExistsPredicate`) correctly matches the student's enrolled `class_group_id`. If the `student_cg.class_group_id` from the join does not equal the ESA's `class_group_id`, the exam is excluded.
- [ ] Confirm that `get-exams.ts` applies `buildPublishedStudentExamPredicate()` and `buildStudentExamVisibilityPredicate()` for student queries without an implicit `is_public = true` gate.
- [ ] If a gap is found in `buildStudentExamVisibilityPredicate()`: update `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` to ensure the `buildClassroomAssignmentExistsPredicate` inner query correctly resolves when `esa.class_group_id` matches any of the student's enrolled class groups via the existing `students → enrollments → class_groups` join.
- [ ] Add JSDoc to any modified function in `build-student-exam-scope-predicates.ts` describing the `class_group_id` matching semantics.
- [ ] Write or update `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` with a case proving: a published private exam with `exam.class_group_id = NULL` and an `exam_section_assignments` row for `class_group_id = X` is visible to a student enrolled in classroom `X`.
- [ ] Write or update `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` asserting the compiled SQL for a student query does not include an `is_public = true` clause.

**Migration required:** No — this phase adjusts query predicates over existing tables only.

---

## Phase 3: Issue 2 — Production Telemetry Pipeline Diagnosis and Environment Fix

**Goal:** Identify the exact production failure point in the BullMQ telemetry pipeline and resolve it with verified environment configuration and migration state.

- [ ] Check the production API server's `.env` / environment variables: confirm `TELEMETRY_INGESTION_MODE=redis` and `REDIS_URL` are set correctly. If `TELEMETRY_INGESTION_MODE` is missing or set to anything other than `redis` or `async`, the worker is inactive and events write synchronously — verify this is not causing a mismatch with the expected async path.
- [ ] Verify the BullMQ telemetry worker process is running in production. The worker entrypoint is `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts` — check the process manager (PM2, Docker, Vercel cron, etc.) for crashes or missing process.
- [ ] Verify the `flagged_incidents_dedupe_key_unique` index exists on the production database: `SELECT indexname FROM pg_indexes WHERE tablename = 'flagged_incidents' AND indexname = 'flagged_incidents_dedupe_key_unique';` — if missing, apply migration `20260706000000_add_telemetry_dedupe_index` via `pnpm db:migrate` against production.
- [ ] After environment verification, trigger a right-click test event in an active production exam session and immediately query `SELECT COUNT(*) FROM flagged_incidents WHERE attempt_id = '<active_attempt_id>';` to confirm events are now persisted.
- [ ] Update `app/sentinel-api/.env.example` to add an explicit comment on `TELEMETRY_INGESTION_MODE` explaining that the BullMQ worker process must be running separately when this is set to `redis`, and that local development should use `sync` unless Redis is available.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.test.ts` (create if absent) proving: when `TELEMETRY_INGESTION_MODE=redis` but `REDIS_URL` is not set, `getMode()` falls back to `'sync'` and calls `TelemetryStorageService.appendEvent()` directly.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/ingestion/tests/ingestion.test.ts` with a case proving that `processEvent()` with `TELEMETRY_INGESTION_MODE=redis` and a valid Redis config enqueues to BullMQ (not calling `appendEvent` synchronously).

**Migration required:** Conditional — apply `20260706000000_add_telemetry_dedupe_index` to production if the index is missing. No new migration file is needed.

---

## Phase 4: Issue 2 — Worker Observability and Resilience Hardening

**Goal:** Add queue statistics visibility and improve worker startup logging so the production team can verify the telemetry pipeline health without needing a DB query.

- [ ] Update `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts` to log the queue name, concurrency, and Redis connection host on `ready` (already partially done) and add a `worker.on('error', ...)` handler that logs the full Redis connection error details including host/port, so connection failures are visible in production logs.
- [ ] Add a `worker.on('stalled', ...)` handler in `telemetry.worker.ts` that logs stalled job IDs, since stalled BullMQ jobs indicate the worker is running but not acknowledging jobs (common when DB is unreachable from the worker process).
- [ ] Update `app/sentinel-api/src/modules/telemetry/ingestion/controllers/flush-telemetry.controller.ts`: extend the `GET /internal/flush` response to include BullMQ queue stats (`waiting`, `active`, `failed`, `buffered`) from `telemetryIngestionQueueService.getStats()` so the flush endpoint doubles as a queue health check.
- [ ] Write or update `app/sentinel-api/src/modules/telemetry/ingestion/controllers/flush-telemetry.controller.test.ts` with a case proving the flush response JSON includes `stats.mode`, `stats.waiting`, and `stats.failed` fields when in redis mode.

**Migration required:** No — this phase adds observability only.

---

## Phase 5: Validation and Regression Sweep

**Goal:** Run focused test suites, confirm all new and modified files pass, and validate that the production-side issue is resolved.

- [ ] Run `pnpm --dir packages/shared exec vitest run --passWithNoTests src/exams/resolve-exam-status.test.ts` — confirm `resolveStudentExamStatus` tests pass.
- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests 'src/app/(protected)/student/_lib/normalize-student-exam.test.ts'` — confirm normalization tests pass.
- [ ] Run `pnpm --dir app/sentinel-web exec vitest run --passWithNoTests 'src/app/(protected)/student/exam/_hooks/use-exam-list.test.ts' 'src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts'` — confirm student list/history filter tests pass.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts src/modules/examination/exams/data/get-exams.test.ts` — confirm backend visibility predicate tests pass.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/telemetry/ingestion/services/ingestion-queue.service.test.ts src/modules/telemetry/ingestion/tests/ingestion.test.ts` — confirm queue service and ingestion tests pass.
- [ ] Run `pnpm --dir app/sentinel-api exec vitest run --passWithNoTests src/modules/telemetry/ingestion/controllers/flush-telemetry.controller.test.ts` — confirm flush controller stats response tests pass.
- [ ] Manually verify in a production exam session: trigger a right-click event, check `flagged_incidents` for a new row, and confirm the Monitoring page shows the incident within 2 seconds.
- [ ] Manually verify an enrolled student can see a private classroom-assigned published exam on `/student/exam` and `/student/history` Available tab.
- [ ] Run `pnpm --dir app/sentinel-api test` after all focused suites pass.
- [ ] Run `pnpm lint` if any source files (not just tests) were changed.

**Migration required:** No — this phase is validation only.

---

## Public API / Type Changes

- No endpoint path changes.
- `GET /internal/flush` response shape is extended: adds a `stats` object with `mode`, `queueName`, `waiting`, `active`, `failed`, `completed`, `buffered`. This is a non-breaking addition (old consumers ignore unknown fields).
- No changes to student exam list or history API response shapes.

## Breaking API Changes

- None expected.
- Expected behavior changes:
    - Private classroom-assigned published exams now appear in student exam list and Available tab.
    - BullMQ worker now emits `error` and `stalled` events to production logs.
    - Flush endpoint response includes queue stats.

## Environment Changes

- No new `.env` variables introduced.
- `app/sentinel-api/.env.example` updated with a comment on `TELEMETRY_INGESTION_MODE=redis` requiring a separately running worker process.

## Rollback Notes

- No Prisma migration rollback is required for code changes.
- If visibility normalization change regresses, revert `normalize-student-exam.ts` and the shared `resolve-exam-status.ts` fix.
- If the flush endpoint stats extension causes issues, revert `flush-telemetry.controller.ts` to its original response shape.
- If the production migration (`flagged_incidents_dedupe_key_unique`) causes issues (unlikely — it's a partial index on non-null dedupe keys), it can be dropped with `DROP INDEX "flagged_incidents_dedupe_key_unique";`.
