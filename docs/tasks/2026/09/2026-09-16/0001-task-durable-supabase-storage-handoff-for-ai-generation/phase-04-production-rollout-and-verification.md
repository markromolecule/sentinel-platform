---
title: "Phase 4: Production Rollout and Verification"
type: phase
parent: "0001-task-durable-supabase-storage-handoff-for-ai-generation"
phase: "04"
status: planned
created: "2026-09-16"
tags: [task, phase, railway, supabase, release]
---

# Phase 4: Production Rollout and Verification

## Objective

Release the durable hand-off without allowing old worker code to consume new jobs, then collect evidence across Supabase, Upstash/BullMQ, Railway API, Railway worker, and the instructor UI.

## Dependencies & Prerequisites

- Phases 1–3 pass focused verification and review.
- New migration has been reviewed for private-bucket and retention safety.
- Railway services already exist: `sentinel-api-production` and `sentinel-ai-worker`.

## Impacted Files & Components

- Railway API/worker service settings and variables (external configuration; no repository source file is presumed).
- Supabase migration state, Storage bucket, and `ai_generation_jobs` records.
- `docs/context/September/15/gemini-async-generation-railway-supabase.md` and `docs/decisions/2026-09-15-async-gemini-generation-railway-supabase.md` — synchronize production topology and storage hand-off after implementation evidence is obtained.

## Implementation Tasks

- [ ] Before rollout, pause/scale down the worker consumer and stop submitting test jobs. Confirm there are no recoverable legacy queued jobs; do not manually delete evidence rows.
- [ ] Apply the Supabase migration. Verify `ai-generation-staging` is private, PDF-only, and accessible using the service-role credentials present in both Railway services.
- [ ] Deploy the same reviewed source revision to the API and worker. Keep API `ENABLE_EMBEDDED_AI_WORKER=false`; preserve worker command `pnpm --filter sentinel-api worker:ai`, one worker replica, no public domain, and matching `REDIS_URL`/`AI_GENERATION_QUEUE_NAME`.
- [ ] Resume the worker only after it logs queue initialization and bucket readiness. Submit one authorized, small new PDF job—not a legacy job—and record its ID.
- [ ] Correlate the ID across API upload/enqueue log, worker stored-input retrieval/processing logs, Supabase status/progress/realtime events, and UI. Verify input objects disappear by expiry cleanup, not during normal completion/failure.
- [x] Update ADR/context with verified runtime evidence and release configuration; report any skipped broad checks separately. (ADR-0002 amended with DEC-07–DEC-11; context §9 synchronized).

## Verification & Testing

- Fresh migration inspection: `storage.buckets` shows `ai-generation-staging` with `public = false`, `application/pdf`, and the intended size limit.
- Railway worker logs contain initialization and `Starting generation for job <id>` without `No staged document files found`.
- Supabase job row transitions `queued:0` -> `processing` -> `completed:100` (or final `failed` only after three attempts).
- Browser UI remains at truthful 0% while queued, then mirrors durable server progress through Realtime or polling.
- Check worker maintenance after expiry: object delete success/convergence precedes job-row purge.

## Risks & Rollback

- Roll back by pausing the worker and rolling both services back to the prior compatible revision; do not remove the private bucket or purge objects until the 24-hour retention period ends.
- A partial rollout can mix old local-disk worker behavior with new API job manifests. Prevent it through the paused-worker, same-revision deployment order above.
