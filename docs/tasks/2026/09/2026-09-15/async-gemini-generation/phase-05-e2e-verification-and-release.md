---
title: "Phase 5: End-to-End Verification, Security Penetration & Release Readiness"
type: phase
parent: "docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md"
phase: "5"
status: completed
created: "2026-09-15"
tags: [task, phase, verification, e2e, security, release]
---

# Phase 5: End-to-End Verification, Security Penetration & Release Readiness

## Objective

Execute multi-document large PDF stress testing (40–80 questions across 50–120+ pages), confirm zero edge timeouts or CORS drops, execute security penetration tests validating tenant isolation and RLS policies, verify worker crash recovery and disk sweepers, and prepare the production release deployment checklist for Railway and Supabase Pro.

## Dependencies & Prerequisites

- Phases 1–4 fully implemented and unit tested.

## Impacted Files & Components

- `docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md`
- Vitest end-to-end integration test suites.
- Production configuration files and environment variable documentation.

## Implementation Tasks

- [x] Task 5.1 — Multi-Document Stress Test:
  - Generate 80 questions across 3 PDFs, assert HTTP 202 with `jobId` in < 500ms.
  - Assert iterative progress updates (5% → 25% → 50% → 75% → 90% → completion) via worker.
  - Assert question schema validity and 80-question result payload on `completeJob`.
- [x] Task 5.2 — Security & Tenant Isolation Penetration Test:
  - IDOR attempt: Instructor B requests `GET /ai/generate-preview/jobs/:id` for Instructor A's job → HTTP 404.
  - Cross-tenant admin attack: Admin in institution Beta requests Instructor A's job (institution Alpha) → HTTP 404.
  - Legitimate owner access: Instructor A retrieves their own completed job payload → HTTP 200 with full result.
- [x] Task 5.3 — Worker Crash & Stalled Job Recovery Verification:
  - Database reconciler `reconcileStuckJobs(15, db)` correctly transitions stuck jobs to `failed`.
  - Disk sweeper `sweepStaleJobFiles(3600)` returns purged count of orphaned directories.
- [x] Task 5.4 — Production Redis Fail-Fast Verification:
  - When `NODE_ENV=production` and Redis is disconnected → `enqueueJob` rejects with `HTTP 503` and message containing `'Redis connection is required in production'`.
- [x] Task 5.5 — Release Checklist & Railway Service Setup:
  - **Railway Web API Service (`sentinel-api`):**
    - `REDIS_URL`: Pointed to production Redis instance.
    - `GOOGLE_GENAI_USE_VERTEXAI=true`
    - `GOOGLE_CLOUD_PROJECT=gen-lang-client-0472453739`
    - `GOOGLE_CLOUD_LOCATION=us-central1`
    - `GCP_SERVICE_ACCOUNT_KEY`: Injected service account credentials.
    - `ENABLE_EMBEDDED_AI_WORKER=false` (ensures web container does not duplicate worker polling).
  - **Railway Dedicated Worker Service (`sentinel-ai-worker`):**
    - Deploy secondary service pointing to same repository.
    - Start Command: `pnpm --filter @sentinel/api worker:ai`.
    - Same environment variables as above, with dedicated memory/CPU allocation.
  - **Supabase Pro Verification:**
    - Confirm `ai_generation_jobs` is present in `supabase_realtime` publication.
    - Confirm Row Level Security is active and enforced.
    - Confirm 24-hour cleanup cron/reconciler is active.

## Verification & Testing

- Full test suite execution across all monorepo packages:
  - `pnpm --filter @sentinel/db test`
  - `pnpm --filter @sentinel/api test`
  - `pnpm --filter @sentinel/web test`
- Production preview smoke test on `app.sentinelph.tech` with live instructor account.

## Risks & Rollback

- Zero regression risk to synchronous legacy endpoints.
- If dedicated worker encounters issues, `ENABLE_EMBEDDED_AI_WORKER=true` can be toggled on the web API container as an instant operational mitigation.
