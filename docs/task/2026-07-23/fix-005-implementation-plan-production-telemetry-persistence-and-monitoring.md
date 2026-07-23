# Production Telemetry Persistence and Monitoring — Implementation Plan

**Source:** `docs/context/July/July 23/fix-mobile-responsiveness-and-accessibility.md`  
**Status:** Investigation-ready; implementation path is gated by production evidence  
**Delivery boundary:** Telemetry ingestion, queue consumer deployment, incident persistence, and instructor monitoring visibility  
**Migration required:** No database migration is expected

## Goal

Ensure every production telemetry event accepted by policy reaches a visible, traceable terminal outcome:

- persisted or aggregated into `flagged_incidents`;
- intentionally dropped with a bounded terminal reason; or
- retained as a failed queue job with actionable diagnostics.

Instructor monitoring must display persisted incidents for the same attempt that emitted them within the agreed polling latency.

## Confirmed Baseline

- Browser detectors send individual events to `/telemetry/events`.
- `TelemetryIngestionService` resolves settings, runs policy, and submits accepted events to the ingestion queue service.
- “Event ignored: threshold not met” means no incident should be created.
- “Event flagged for persistence” means policy accepted the event; it does not prove storage.
- Redis mode uses BullMQ and requires a separate consumer.
- `app/sentinel-api`’s normal `start` command starts only `src/server.ts`.
- The telemetry worker has the separate command:

```bash
pnpm --dir app/sentinel-api start:telemetry-worker
```

- Local Turbo development starts the API with the telemetry worker, while the production topology is not defined in this repository.
- The supplied production logs show Redis connection, ingestion, policy, and queue submission, but no worker-ready or storage-success message.
- `/telemetry/health` already reports mode and basic queue counts.
- BullMQ `5.73.5` exposes `getWorkersCount()`, so worker presence can be reported without introducing a custom heartbeat.
- Monitoring overview/detail services read `flagged_incidents` for the selected latest attempt.
- Monitoring overview polls every two seconds; student detail polls every five seconds.
- A `SIGTERM` is handled as a graceful process shutdown and is not independently evidence of telemetry failure.

## Leading Hypothesis

Production is operating in Redis ingestion mode without a healthy telemetry-worker process, so accepted jobs remain queued and never reach `flagged_incidents`.

This hypothesis must be confirmed through the read-only gate below. Do not change code, settings, queue contents, or deployment topology until the failed boundary is identified.

## Decision Matrix

| Production evidence                                           | Implementation branch                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Mode is `redis`, worker count is `0`, waiting age/count grows | Deploy or restore a dedicated telemetry-worker service                                      |
| Mode is `redis`, worker exists, jobs are failed/stalled       | Diagnose the first storage/runtime error and repair that code/configuration                 |
| Mode is `sync`, accepted event has no incident row            | Trace synchronous storage and attempt eligibility directly; worker deployment is irrelevant |
| Incident row exists, monitoring API omits it                  | Fix attempt selection/query scoping in the monitoring backend                               |
| Monitoring API returns the incident, UI omits it              | Fix service mapping/query cache/rendering only                                              |
| Event is policy-ignored                                       | No persistence fix; validate rule threshold/configuration expectations                      |

Only execute the branch supported by evidence. Avoid speculative changes across every layer.

## Scope and Affected Files

### Queue, worker, and health

- `app/sentinel-api/src/modules/telemetry/ingestion/config/ingestion-queue.config.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/ingestion.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/ingestion-queue.service.test.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-job-processor.service.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/services/telemetry-job-processor.service.test.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/workers/telemetry.worker.test.ts`
- `app/sentinel-api/src/modules/telemetry/ingestion/scripts/manage-failed-jobs.ts`
- `app/sentinel-api/src/modules/telemetry/telemetry-monitoring.controller.ts`
- `app/sentinel-api/src/modules/telemetry/telemetry-monitoring.controller.test.ts`
- `app/sentinel-api/package.json`

### Persistence and monitoring

- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-persistence.service.test.ts`
- `app/sentinel-api/src/modules/telemetry/storage/services/incident-writer.service.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-overview.test.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-student-detail.ts`
- `app/sentinel-api/src/modules/examination/monitoring/services/get-exam-monitoring-student-detail.test.ts`
- `packages/services/src/api/exams/monitoring.ts`
- `packages/hooks/src/query/exams/use-exam-monitoring-overview-query.ts`
- `packages/hooks/src/query/exams/use-exam-monitoring-overview-query.test.ts`
- `packages/hooks/src/query/exams/use-exam-monitoring-student-query.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/_hooks/use-monitoring/`
- `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/_hooks/use-monitoring.test.tsx`

### Operational documentation

- `docs/operations/telemetry-production-runbook.md` **[NEW]**
- the actual external deployment/service definition, if maintained outside this repository

## Phase 0: Read-Only Production Verification Gate

**Goal:** Identify the first failed boundary using one policy-accepted production event.

- [ ] Record the deployed application revision and relevant service names.
- [ ] Record only whether `TELEMETRY_INGESTION_MODE`, `REDIS_URL`, queue name, and worker concurrency are configured; do not copy secret values.
- [ ] Call the authorized `/telemetry/health` endpoint and record mode, waiting, active, failed, completed, and buffered counts.
- [ ] Confirm whether a separate process runs `pnpm --dir app/sentinel-api start:telemetry-worker`.
- [ ] Check worker replica count, readiness, restart history, and logs for `[TelemetryWorker] Worker ready`.
- [ ] Run the failed-job script in summary/list mode only:

```bash
pnpm --dir app/sentinel-api telemetry:failed-jobs -- --mode summary
pnpm --dir app/sentinel-api telemetry:failed-jobs -- --mode list --limit 20
```

- [ ] Do not use `remove-terminal --apply`, retry jobs, drain the queue, or edit production settings during this phase.
- [ ] Select one recent log entry with `Event flagged for persistence`.
- [ ] Trace its `eventId`, `dedupeKey`, `attemptId`, event type, queue job ID if available, and timestamps.
- [ ] Check whether the job is waiting, active, completed, failed, delayed, stalled, or absent.
- [ ] Check `flagged_incidents` for the exact `attempt_id`, rule key, platform, and dedupe key.
- [ ] Call the instructor monitoring overview and student-detail APIs for the same exam/student and compare the returned `attemptId`.
- [ ] Confirm whether the supplied `SIGTERM` coincides with deploy/restart/scale events or an unexpected resource/health failure.
- [ ] Write a short evidence note selecting exactly one decision-matrix branch.

**Exit gate:** The first stage that fails is known. No implementation phase below begins on hypothesis alone.

## Phase 1A: Restore the Redis Consumer When No Worker Is Running

**Applies only if:** Redis mode is active and worker count/readiness proves there is no healthy consumer.

**Goal:** Run the existing worker continuously against the same queue and deployment revision as the producer.

- [ ] Create or restore a dedicated production worker service using the same built artifact/image and commit as the API.
- [ ] Set its start command to `pnpm --dir app/sentinel-api start:telemetry-worker`.
- [ ] Provide the same database, Redis, telemetry mode, queue name, job name, and required configuration as the API without exposing values.
- [ ] Start with one replica and the configured concurrency; scale only after queue and database behavior are measured.
- [ ] Configure restart-on-failure and a graceful shutdown period long enough for BullMQ `worker.close()` to complete active jobs.
- [ ] Verify the service emits `Validating Redis configuration` and `Worker ready`.
- [ ] Verify queue waiting age/count falls and completed count rises.
- [ ] Verify one newly accepted event produces a storage insert/update log and a database row.
- [ ] Do not bulk-retry or delete historical failed jobs until current-event processing is healthy.
- [ ] If the hosting platform cannot run a persistent worker, document and approve a temporary switch to `sync` ingestion rather than leaving Redis jobs unconsumed.

**Code change expected:** None unless the external deployment definition is versioned in this repository.

## Phase 1B: Repair Worker or Storage Failure

**Applies only if:** A worker is present and the traced job fails, stalls, or is dropped unexpectedly.

**Goal:** Fix the first concrete runtime/storage error without weakening session eligibility or deduplication.

- [ ] Capture the bounded worker failure reason, attempts made, job timestamps, and traced payload identifiers.
- [ ] Reproduce the same payload shape against a test database.
- [ ] Add a failing test in the closest owning service before changing behavior.
- [ ] Preserve terminal `404`/`409` handling for genuinely missing, completed, or ineligible attempts.
- [ ] Preserve transaction-safe incident deduplication and occurrence-count behavior.
- [ ] Fix only the confirmed configuration, database, serialization, or service defect.
- [ ] Verify retryable errors throw so BullMQ retries them; terminal eligibility errors return `dropped`.
- [ ] Ensure the final failed job retains an actionable bounded reason.
- [ ] Re-run the traced case and verify `persisted`, `dropped`, or retained `failed` is correct.

**Migration required:** No unless the discovered failure proves a schema mismatch. Any migration would require a separate reviewed plan.

## Phase 2: Add End-to-End Queue Observability

**Goal:** Make “producer healthy, consumer missing” visible before instructors report absent anomalies.

- [ ] Extend `TelemetryIngestionQueueService.getStats()` with:
    - `delayed`;
    - `workerCount` using BullMQ `getWorkersCount()`;
    - oldest waiting-job age/timestamp when jobs are waiting;
    - a bounded fallback when the Redis provider cannot report worker clients.
- [ ] Extend `/telemetry/health` with a typed `healthy`/`degraded` status and explicit reason codes.
- [ ] Mark Redis mode degraded when no worker is visible or waiting jobs exceed the agreed age threshold.
- [ ] Keep sync mode healthy without requiring a worker.
- [ ] Do not expose Redis URLs, credentials, raw payloads, or student details in the health response.
- [ ] Confirm the health route remains restricted to the intended operational/support roles; add authorization if its mounted route is broader.
- [ ] Add producer submission results containing `mode` and a safe queue `jobId`.
- [ ] Log the job ID with `attemptId`, `eventId`, event type, and dedupe key after successful queue submission.
- [ ] Add bounded worker completion logging for `persisted` and `dropped` outcomes.
- [ ] Keep failed/stalled logs and include job ID plus bounded trace identifiers.
- [ ] Add tests for sync mode, Redis with worker, Redis without worker, delayed/waiting backlog, provider inability to enumerate workers, submission IDs, persisted completion, terminal drop, failure, and stalled jobs.

**Migration required:** No.

## Phase 3: Prove Persistence and Deduplication Contracts

**Goal:** Ensure retries and queue delivery produce one correct incident outcome.

- [ ] Use the existing event UUID as BullMQ `jobId` when it is present and valid, after confirming the identifier format is accepted.
- [ ] Keep database `dedupe_key` as the final idempotency boundary even when BullMQ suppresses duplicate job delivery.
- [ ] Return/log a distinct disposition for:
    - inserted incident;
    - aggregated occurrence;
    - duplicate event ignored;
    - terminal job dropped;
    - retryable failure.
- [ ] Add integration coverage from accepted policy result through queue processor to `flagged_incidents`.
- [ ] Add duplicate-delivery coverage proving the same event ID/dedupe key does not increase occurrence count twice.
- [ ] Add distinct-event coverage proving a later valid occurrence aggregates according to the configured window.
- [ ] Add restart/shutdown coverage proving an accepted active job is either completed or returned to BullMQ, not silently acknowledged.
- [ ] Confirm no raw media, answer content, JWT, Redis URL, or database credential appears in trace logs.

**Migration required:** No.

## Phase 4: Repair Monitoring Attempt Selection Only If Persistence Is Healthy

**Applies only if:** The traced incident exists in `flagged_incidents` but the monitoring API omits it.

**Goal:** Make attempt selection explicit and consistent between overview and detail responses.

- [ ] Add fixtures with multiple attempts for one student, including active, completed, reset/superseded, and newer retry attempts.
- [ ] Define the monitoring selection rule in one shared query helper: prefer the current operational attempt according to lifecycle rules, otherwise use the newest attempt.
- [ ] Use the same helper in overview and student detail.
- [ ] Keep incident joins scoped by both exam and selected `attempt_id`.
- [ ] Include the selected `attemptId` in mapped overview/detail contracts and verify it matches the incident trace.
- [ ] Add tests proving incidents from older attempts do not leak into the selected attempt and incidents from the selected attempt do appear.
- [ ] Preserve instructor/institution authorization and existing lifecycle actions.

**Migration required:** No.

## Phase 5: Repair Frontend Visibility Only If the API Is Correct

**Applies only if:** The monitoring API returns the incident but the instructor UI does not render it.

**Goal:** Preserve polling and render the server’s incident state without stale mapping or cache behavior.

- [ ] Add service-mapper fixtures containing incident count, open count, latest type, latest time, and selected attempt ID.
- [ ] Verify `EXAM_QUERY_KEYS.monitoring(examId)` and student-detail keys do not collide with stale attempt data.
- [ ] Preserve the existing two-second overview and five-second detail polling unless production latency evidence requires a documented change.
- [ ] Ensure background polling and manual refresh both update incident cards/list rows.
- [ ] Verify `useIncidentToast()` keys snapshots by selected attempt and announces only real increases after hydration.
- [ ] Add tests for a zero-to-one incident transition, aggregated occurrence update, attempt replacement, manual refresh, background refetch, and no duplicate initial toast.
- [ ] Do not display policy-ignored raw detections as instructor incidents.

**Migration required:** No.

## Phase 6: Production Runbook, Alerting, and Rollout

**Goal:** Make the topology and response procedure repeatable.

- [ ] Create `docs/operations/telemetry-production-runbook.md`.
- [ ] Document API producer and telemetry-worker as separate process roles.
- [ ] Document required non-secret configuration names, start commands, queue naming, replica expectations, and graceful shutdown behavior.
- [ ] Document `/telemetry/health` interpretation and safe failed-job summary/list commands.
- [ ] Define alerts for zero workers in Redis mode, oldest waiting-job age, failed-job growth, repeated worker restarts, and health status `degraded`.
- [ ] Document how to trace one event across ingestion, policy, queue, storage, monitoring API, and UI.
- [ ] Document that `threshold not met` is an expected non-incident outcome.
- [ ] Document approval requirements for retrying/removing jobs, changing ingestion mode, draining queues, or modifying production rows.
- [ ] Deploy one worker replica, validate a canary event, then observe queue latency and database load before scaling.
- [ ] Correlate `SIGTERM` with platform deployment/restart events and confirm graceful worker/API shutdown logs.

## Automated Verification Commands

```bash
pnpm --dir app/sentinel-api test
pnpm --dir app/sentinel-api typecheck
pnpm --dir packages/services test
pnpm --dir packages/hooks test
pnpm --dir app/sentinel-web test
pnpm --dir app/sentinel-web lint
pnpm --dir app/sentinel-web build
pnpm format:check
```

Run production health and queue checks separately using read-only credentials and the operational runbook.

## Rollout and Rollback

- Restore worker topology before shipping speculative storage or UI changes.
- Deploy observability changes independently from monitoring-query changes.
- Begin with one worker replica and compare queue latency, failure rate, database writes, and monitoring latency.
- If the worker is unhealthy, stop the worker deployment without deleting queued jobs; jobs remain recoverable in Redis.
- If an approved temporary sync fallback is used, monitor API latency/database load and restore Redis mode only after a healthy worker is proven.
- Roll back query/UI changes independently if attempt scoping or instructor visibility regresses.
- Never roll back by disabling policy, authorization, deduplication, or incident eligibility.

## Done Criteria

- [ ] Phase 0 identifies and records the first failed production boundary.
- [ ] Redis mode has at least one independently healthy worker, or an explicitly approved/documented sync fallback is active.
- [ ] Every policy-accepted canary event reaches `persisted`, `aggregated`, `duplicate-ignored`, `dropped`, or retained `failed`.
- [ ] Queue health reports worker presence, delayed/waiting backlog, failed jobs, and oldest waiting age without secrets.
- [ ] A persisted canary incident is visible through the monitoring API and UI for the exact same `attempt_id`.
- [ ] Policy-ignored events remain absent from instructor incident views.
- [ ] Duplicate delivery does not create duplicate occurrences.
- [ ] Worker/API deploy shutdowns do not silently lose accepted jobs.
- [ ] The production runbook and alerts cover worker absence, backlog, failure, tracing, and safe recovery.
- [ ] All affected tests, type checks, lint, builds, and formatting checks pass.
