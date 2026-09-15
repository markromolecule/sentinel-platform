---
title: "Phase 2: Dedicated Railway Background Worker, BullMQ & Recovery Sweepers"
type: phase
parent: "docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md"
phase: "2"
status: completed
created: "2026-09-15"
tags: [task, phase, railway, bullmq, worker, redis, sweeps]
---

# Phase 2: Dedicated Railway Background Worker, BullMQ & Recovery Sweepers

## Objective

Build the BullMQ queue service with strict production Redis validation, implement the dedicated Railway Worker service (`sentinel-ai-worker`), wire ephemeral disk staging with automated startup and periodic cleanup sweeps, and instrument the `QuestionGeneratorService` pipeline to report live progress to Supabase Postgres.

## Dependencies & Prerequisites

- Phase 1 completed (database schema, RLS policies, and repository ready).
- Redis connection utility available in `src/lib/redis/redis.service.ts`.

## Impacted Files & Components

- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts` — Queue name, concurrency, and environment resolution.
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.service.ts` — BullMQ queue dispatcher with strict production failure contract.
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation.worker.ts` — BullMQ worker lifecycle, progress hook integration, and error handling.
- `app/sentinel-api/src/workers/ai-generation-worker.ts` — Dedicated worker process entrypoint for the standalone Railway Worker service.
- `app/sentinel-api/src/modules/integrations/gemini/services/ai-job-file-staging.service.ts` — Ephemeral disk staging and startup/periodic sweeper.
- `app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator/orchestrator.service.ts` — Progress callbacks (`onProgress`).
- `app/sentinel-api/src/server.ts` — Optional embedded worker registration (`ENABLE_EMBEDDED_AI_WORKER=true`).

## Implementation Tasks

- [x] Task 2.1 — Implement `AiGenerationQueueConfig`:
  - Queue name: default `'ai-generation'`.
  - Worker concurrency: default `2` (configurable via `AI_GENERATION_WORKER_CONCURRENCY`).
  - Stalled job parameters: `lockDuration: 60000`, `stalledInterval: 30000`, `maxStalledCount: 1`.
  - Mode resolver:
    - In `NODE_ENV === 'production'`: Redis is **mandatory**. If `REDIS_URL` is missing or disconnected, `isQueueHealthy()` returns `false`.
    - In `NODE_ENV === 'development'`: If Redis is missing, falls back to in-memory asynchronous worker loop (`setImmediate`), logging an explicit development notice.
- [x] Task 2.2 — Implement `AiGenerationQueueService`:
  - `enqueueJob(payload: AiGenerationJobPayload): Promise<void>`:
    - If in production and Redis is unreachable, throws `HTTPException(503, { message: 'AI generation queue service is temporarily unavailable. Please contact system administration.' })`.
    - Dispatches job via BullMQ queue with `removeOnComplete: true, removeOnFail: false`.
- [x] Task 2.3 — Implement `AiJobFileStagingService`:
  - `stageUploadedFiles(jobId: string, files: File[]): Promise<string[]>`:
    - Writes files to `/tmp/ai-jobs/<jobId>/`.
    - Returns local file paths.
  - `cleanupJobFiles(jobId: string): Promise<void>`:
    - Recursively removes `/tmp/ai-jobs/<jobId>/`.
  - `sweepStaleJobFiles(olderThanMs: number = 3600000): Promise<number>`:
    - Scans `/tmp/ai-jobs/` and unlinks directories whose `mtime` is older than 1 hour.
    - Executed on worker startup and every 60 minutes via interval timer.
- [x] Task 2.4 — Implement `AiGenerationWorker`:
  - Processes jobs from BullMQ `ai-generation` queue.
  - Updates Supabase status to `processing`.
  - Streams progress updates to database via `AiGenerationJobRepository.updateProgress()`.
  - Invokes `QuestionGeneratorService.generatePreviewFromPdf()` with Vertex AI provider.
  - Stores result in Supabase and marks job `completed`.
  - Unlinks `/tmp/ai-jobs/<jobId>/` in a mandatory `finally` block.
  - Listens to worker `failed` and `stalled` events: updates Supabase row to `failed` and cleans disk.
- [x] Task 2.5 — Create Dedicated Worker Entrypoint & Embedded Toggle:
  - Create `src/workers/ai-generation-worker.ts` with standalone process lifecycle and graceful `SIGTERM`/`SIGINT` shutdown handling.
  - Update `package.json` with script: `"start:ai-worker": "tsx -r dotenv/config src/workers/ai-generation-worker.ts"` and `"worker:ai"`.
  - Update `src/server.ts` to optionally boot embedded worker if `process.env.ENABLE_EMBEDDED_AI_WORKER === 'true'`.
- [x] Task 2.6 — Instrument `QuestionGeneratorService`:
  - Add `onProgress?: (progress: number, step: string) => Promise<void>` to `generatePreviewFromPdf`.
  - Emit milestones:
    - `5%`: "Staging lecture documents..."
    - `15%`: "Analyzing document page counts and structure..."
    - `70%`: "Batch question generation completed..."
    - `75%`: "Normalizing and formatting generated questions..."
    - `85%`: "Evaluating passage quality and verifying Bloom's taxonomy..."
    - `95%`: "Assembling final preview response..."
    - `100%`: "Generation completed successfully."

## Verification & Testing

- `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue/ai-generation-queue.service.test.ts`: PASS (4/4 tests passed in 56ms).
- `pnpm --filter sentinel-api test src/modules/integrations/gemini/services/ai-job-file-staging.service.test.ts`: PASS (3/3 tests passed in 7ms).
- `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue/ai-generation.worker.test.ts`: PASS (3/3 tests passed in 6ms).
- `pnpm --filter sentinel-api test src/tests/gemini/`: PASS (24/24 tests passed in 43ms).

## Risks & Rollback

- Temporary disk exhaustion if crashes occur repeatedly: mitigated by startup sweep and hourly cleanup interval.
- Rollback: Stop standalone worker service in Railway; route requests through synchronous path.
