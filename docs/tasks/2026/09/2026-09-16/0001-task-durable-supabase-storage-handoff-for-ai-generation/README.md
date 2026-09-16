---
title: "Durable Supabase Storage Handoff for AI Generation"
type: task
status: in_progress
created: "2026-09-16"
tags: [task, gemini, bullmq, supabase-storage, railway]
---

# Durable Supabase Storage Handoff for AI Generation

## Outcome

Make production AI-question generation safe across the Railway API and the dedicated `sentinel-ai-worker`. The API must place uploaded PDFs into a private Supabase Storage bucket before it creates and enqueues a job; the worker must load those objects instead of API-container `/tmp`. Source PDFs and the associated job record expire after at most 24 hours. Progress shown to instructors must come only from durable server state.

## Pre-planning record

### Actors and goals

- **Instructor:** submits PDFs and sees truthful queued, processing, retrying, completed, or failed state without a fake near-complete percentage.
- **Railway API:** validates and securely uploads PDFs, then creates a durable job and enqueues it.
- **Railway AI worker:** consumes BullMQ jobs, retrieves the stored PDFs, performs generation, persists progress, and retries transient faults.
- **Platform operator:** can use Railway and Supabase logs to correlate a job ID across storage, BullMQ, and `ai_generation_jobs`.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| S1 | Instructor submits valid PDFs | Bucket and worker are available | Objects upload, job is `queued`, and API returns 202 | N/A | planned |
| S2 | Worker consumes a job from a different Railway container | Job object manifest exists | Worker downloads the same PDFs and writes durable progress | N/A | planned |
| S3 | Storage upload fails | No durable job exists yet | API returns retryable 503; uploaded partial objects are removed | No job/queue record is created | planned |
| S4 | Gemini/worker transiently fails | Input objects exist | BullMQ retries at most three times with exponential backoff | Job is not terminally `failed` until the final attempt | planned |
| S5 | Job reaches expiry | `expires_at` has passed | Objects are deleted before the job row is purged | Missing objects are treated as cleanup convergence; other failures remain retryable | planned |
| S6 | Worker has not reported progress | Job remains `queued` at 0 | UI displays queued/durable state, not simulated 5–94% | Polling and Realtime retain their existing fallback relationship | planned |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-07 | Cross-service input hand-off | Private Supabase Storage | Production worker proved it cannot read API `/tmp` files. | Embedded worker / API-local disk | Context §9 |
| DEC-08 | Retention | Maximum 24 hours | Enables bounded diagnosis/retry without indefinite PDF retention. | Indefinite storage / immediate deletion | Context §9 |
| DEC-09 | Bucket | Create private `ai-generation-staging` | No suitable existing bucket exists. | Reuse unrelated bucket | Context §9 |
| DEC-10 | Failed upload | Fail before DB job/BullMQ enqueue | Prevents unprocessable queued rows. | Queue broken job | Context §9 |
| DEC-11 | Transient fault recovery | Three exponential-backoff attempts | Makes Gemini/worker network faults recoverable. | One attempt only | Context §9 |

### Unknowns and blockers

- No product or architecture decision remains open.
- Existing failed jobs contain no portable source files and cannot be retried; retain them only as historical evidence until their existing TTL purge.
- Production execution requires Supabase migration access and the existing API/worker Railway services to share the same server-side Supabase credentials. Those are release prerequisites, not plan blockers.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | S1, DEC-09 | Migration creates private `ai-generation-staging` with PDF-only MIME policy and a 15 MiB per-object limit. | New DB migration and generated DB types. | Migration inspection plus server-side bucket readiness test. | implemented; typecheck pending |
| AC-02 | S1–S3, DEC-07/10 | API uploads all PDFs to job-scoped storage before persisting/enqueueing; upload error returns 503 and leaves no job or objects. | New input-storage service and create-job controller ordering. | Focused controller/service tests. | planned |
| AC-03 | S2 | Worker downloads the persisted object manifest and never calls API-local `/tmp` staging. | Repository metadata and worker integration. | Worker unit/integration test using mocked storage. | planned |
| AC-04 | S4, DEC-11 | Queue uses three attempts with exponential backoff; only final failure writes terminal `failed`. | Queue options and worker failure-state handling. | Queue/worker retry tests. | planned |
| AC-05 | S5, DEC-08 | Worker maintenance deletes expired objects before purging their rows; cleanup is idempotent. | Repository query/claim plus input-storage cleanup orchestration. | Expiry cleanup tests. | planned |
| AC-06 | S6 | Client reports only queued/server progress and never simulates 5–94% while DB progress is zero. | Mutation initial state and progress hook. | Web hook/component tests. | planned |
| AC-07 | Production release | API and worker share queue/storage configuration; one new production job reaches durable processing, then completed/failed, with correlated logs. | Railway rollout runbook. | Manual production smoke test and log capture. | planned |

## Scope

- Create and use a new private Supabase Storage staging bucket.
- Persist a storage manifest with each AI generation job.
- Replace local-disk hand-off with server-side upload/download/delete operations.
- Add bounded retries, expiry cleanup, truthful client progress, focused tests, and a Railway rollout checklist.

## Non-goals

- Altering Gemini prompts, question distribution, Vertex AI model selection, or Vercel hosting.
- Retrying legacy jobs that never stored their PDFs in Supabase Storage.
- Giving clients direct object URLs, signed upload URLs, or bucket permissions.
- Changing the 15 MiB total request ceiling.

## Constraints and decisions

- Keep `ai_generation_jobs` as the client-facing durable state and Supabase Realtime source.
- Use service-role storage operations only; the new bucket has no browser access policies.
- Store object metadata separately from the user generation `config`; `config` must remain a request snapshot, not a hidden transport manifest.
- Delete storage objects before deleting an expired job row so failed deletion can be retried on the next maintenance pass.
- The implementation may add new files named below; no uninspected file is presumed to exist.

## Phases

- [ ] `phase-01-storage-schema-and-input-contract.md` — Private bucket, object-manifest data model, and storage service. Implemented; full API typecheck is resource-blocked and pending.
- [x] `phase-02-api-worker-retry-and-retention.md` — Upload-before-enqueue, cross-container worker loading, retries, and cleanup.
- [x] `phase-03-truthful-progress-and-focused-tests.md` — Client progress correctness and automated contract coverage.
- [ ] `phase-04-production-rollout-and-verification.md` — Controlled Railway/Supabase deployment and evidence collection.

## Verification

- Phase 01 focused verification:
  - PASS: `pnpm --filter @sentinel/db generate`
  - PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/services/ai-generation-input-storage.service.test.ts` passed 8/8 tests.
  - PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts` passed 8/8 tests.
  - PASS: Migration inspection confirmed a private PDF-only `ai-generation-staging` bucket definition, nullable legacy-safe job manifest columns, generated DB type parity, and no browser storage policy.
  - BLOCKED: `pnpm --filter sentinel-api typecheck` exhausted the configured 4GB Node heap; 8GB and 12GB manual reruns emitted no diagnostics but did not complete within the bounded verification window and were interrupted.
- Phase 02 focused verification:
  - PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/queue/ai-generation-queue.service.test.ts src/modules/integrations/gemini/queue/ai-generation.worker.test.ts src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts src/modules/integrations/gemini/services/ai-generation-input-storage.service.test.ts src/tests/gemini/gemini-route.test.ts src/tests/gemini/phase-05-e2e-verification.test.ts` (65/65 tests passed across 6 test files).
  - PASS: Verified upload rollback without row creation on storage failure (503).
  - PASS: Verified storage manifest object cleanup on database creation error.
  - PASS: Verified storage objects retained until expiry upon queue dispatch failure.
  - PASS: Verified worker loads stored input manifest from Supabase Storage and records progress only after download succeeds.
  - PASS: Verified safe failure without retries for missing storage inputs.
  - PASS: Verified nonterminal retry progress updates for attempts 1 and 2, and terminal `failJob` on attempt 3.
  - PASS: Verified expiry cleanup deletes storage objects prior to row purge and converges on missing objects.
  - PASS: `npx tsc --noEmit --skipLibCheck --target ESNext --module NodeNext --moduleResolution NodeNext ...` passed with 0 errors across all modified API files.
- Phase 03 focused verification:
  - PASS: `pnpm --filter sentinel-web test src/app/\(protected\)/\(instructor\)/question/bank/_components/dialogs/import-modal/` (19/19 tests passed across 4 test suites).
  - PASS: `pnpm --filter sentinel-core test src/app/\(protected\)/question/bank/_components/dialogs/import-modal/` (14/14 tests passed across 3 test suites).
  - PASS: `npx tsc --noEmit --project tsconfig.json` in `sentinel-web` and `sentinel-core` (0 errors in `import-modal`).
  - PASS: Verified 202 acceptance initializes local state to `0% / Queued` without premature 5% staging milestone.
  - PASS: Removed simulated timer; verified that advancing fake time by 10s does not increment progress when worker has not reported progress.
  - PASS: Verified server progress milestones advance truthfully.
  - PASS: Verified nonterminal retry updates (`Temporary failure encountered. Retrying attempt 1 of 3...`) display truthful progress and step without resolving or rejecting.
  - PASS: Verified full parity between `sentinel-web` and active `sentinel-core` import modal surfaces.

## Deviations

- `context.mjs task:new` initially scaffolded duplicate task files under `context-factory/docs/tasks`, contrary to the host-repository scoping contract. Those newly generated duplicates were removed; this is the authoritative host task folder.
- Removed obsolete `AiJobFileStagingService` and its test since all consumers have fully migrated to Supabase Storage handoff.

## Result

Phase 03 completed. All truthful progress client implementations, tests, and parity requirements pass cleanly. Stopped for developer review before Phase 04.
