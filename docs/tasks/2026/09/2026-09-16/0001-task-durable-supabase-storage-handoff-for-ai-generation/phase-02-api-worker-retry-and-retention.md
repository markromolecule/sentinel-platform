---
title: "Phase 2: Durable API-to-Worker Handoff, Retry, and Retention"
type: phase
parent: "0001-task-durable-supabase-storage-handoff-for-ai-generation"
phase: "02"
status: completed
created: "2026-09-16"
tags: [task, phase, bullmq, railway, gemini]
---

# Phase 2: Durable API-to-Worker Handoff, Retry, and Retention

## Objective

Replace `/tmp/ai-jobs` as the distributed hand-off, ensure only fully stored input is queued, and make transient failures retry without showing a terminal failure prematurely.

## Dependencies & Prerequisites

- Phase 1 migration and input-storage contract are complete.
- `sentinel-api-production` and `sentinel-ai-worker` have identical server-side Supabase, Redis, and Gemini/Vertex variables.

## Impacted Files & Components

- `app/sentinel-api/src/modules/integrations/gemini/controller/create-preview-job.controller.ts`
- `app/sentinel-api/src/modules/integrations/gemini/data/ai-generation-job.repository.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.service.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation.worker.ts`
- `app/sentinel-api/src/modules/integrations/gemini/queue/ai-generation-queue.config.ts`
- Removed obsolete local disk staging service and its test: `app/sentinel-api/src/modules/integrations/gemini/services/ai-job-file-staging.service.ts` and `ai-job-file-staging.service.test.ts`.
- Updated test suites: `gemini-route.test.ts`, `phase-05-e2e-verification.test.ts`, `ai-generation.worker.test.ts`, `ai-generation-queue.service.test.ts`, `ai-generation-job.repository.test.ts`.

## Implementation Tasks

- [x] In the create-job controller, preserve authentication, permission, PDF, and total-size validation. Generate the job ID, upload all PDFs to private storage, then create the job row with the input manifest, then enqueue. If upload fails, remove partial objects and return a retryable 503 without creating a row or queue job.
- [x] If DB creation fails after upload, remove the newly uploaded objects. If queue submission fails after the row exists, mark the row failed with a safe message but retain the manifest objects until 24-hour expiry, as decided.
- [x] Make the worker retrieve input through the durable manifest, reconstruct `File` objects, and write its first `processing` progress only after retrieval succeeds. Remove any cross-service read/cleanup dependence on `/tmp/ai-jobs`.
- [x] Configure BullMQ jobs with `attempts: 3` and exponential backoff. Model a retrying attempt as nonterminal durable state (for example, `processing` with a retry step); only the last failed attempt calls `failJob`. Permanent missing/invalid input must fail once with a safe error rather than consume all retries.
- [x] Replace the current worker `finally` input deletion with expiry-driven cleanup. On startup and each scheduled maintenance cycle, find expired manifests, delete their objects idempotently, then purge their rows only after successful/converged deletion. Keep failed cleanup candidates for the next cycle.
- [x] Add concise, job-ID-correlated logs for stored-input retrieval, retry scheduling/final failure, and expiry cleanup. Never log filenames, PDF content, credentials, or signed URLs.

## Verification & Testing

- PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue/ai-generation-queue.service.test.ts src/modules/integrations/gemini/queue/ai-generation.worker.test.ts src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts src/modules/integrations/gemini/services/ai-generation-input-storage.service.test.ts src/tests/gemini/gemini-route.test.ts src/tests/gemini/phase-05-e2e-verification.test.ts` (65/65 tests passed across 6 test files).
- PASS: Upload rollback / no row: verified 503 and zero DB/queue records on upload failure.
- PASS: DB rollback / object removal: verified storage manifest deletion on DB creation error.
- PASS: Queue failure retains objects to expiry: verified manifest objects retained when BullMQ dispatch fails.
- PASS: Worker reads stored inputs: verified worker downloads manifest files from Supabase Storage and records progress only after retrieval.
- PASS: Missing object fails safely: verified missing input fails once with safe error and discards job without retrying.
- PASS: First and second retry attempts are nonterminal: verified attempts 1 and 2 update DB with retry step and rethrow for BullMQ backoff.
- PASS: Third failure is terminal: verified attempt 3 calls `failJob` with sanitized error message.
- PASS: Expired object removal precedes row purge: verified storage objects removed before DB row purge.
- PASS: Missing object cleanup converges: verified 404 missing objects converge to successful row purge.
- PASS: Storage failure retains job row: verified DB row kept for next cycle if storage deletion throws.
- PASS: Targeted typecheck: `npx tsc --noEmit --skipLibCheck --target ESNext --module NodeNext --moduleResolution NodeNext ...` passed with 0 errors across all modified API files.

## Risks & Rollback

- Releasing the API before the worker can read the new manifest would strand jobs. Deploy the same commit to both services while the worker is paused, then resume it only after migration and configuration checks pass.
- Do not requeue pre-release jobs: their source files were only on an expired/container-local filesystem and cannot be recovered.
