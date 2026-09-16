---
title: "Phase 1: Private Storage Schema and Input Contract"
type: phase
parent: "0001-task-durable-supabase-storage-handoff-for-ai-generation"
phase: "01"
status: in_progress
created: "2026-09-16"
tags: [task, phase, supabase-storage, database]
---

# Phase 1: Private Storage Schema and Input Contract

## Objective

Create the private `ai-generation-staging` bucket and a durable, typed job-input manifest that both Railway services can use without exposing source PDFs to clients.

## Dependencies & Prerequisites

- Approved context: `docs/context/September/15/gemini-async-generation-railway-supabase.md`.
- Supabase migration access and the server-side `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` already used by `app/sentinel-api/src/lib/supabase-admin.ts`.

## Impacted Files & Components

- **New:** `packages/db/prisma/migrations/<timestamp>_add_ai_generation_storage_handoff/migration.sql` — private bucket, `ai_generation_jobs` storage-manifest columns, and indexes/constraints as required.
- `packages/db/prisma/schema.prisma` and `packages/db/src/generated/types.ts` — generated schema/type parity for manifest columns.
- **New:** `app/sentinel-api/src/modules/integrations/gemini/services/ai-generation-input-storage.service.ts` — encapsulates object-key construction, upload, download-to-`File`, idempotent delete, and readiness inspection.
- **New:** matching `ai-generation-input-storage.service.test.ts`.
- `app/sentinel-api/.env.example` — documents `AI_GENERATION_STAGING_BUCKET=ai-generation-staging` and preserves the existing 15 MiB boundary.

## Implementation Tasks

- [x] Add an idempotent migration that creates/updates `storage.buckets` entry `ai-generation-staging` as `public = false`, restricts MIME types to `application/pdf`, and permits at least the existing 15 MiB application limit per object. Do not add authenticated-user `storage.objects` policies for this new bucket.
- [x] Add explicit `storage_bucket` and `storage_paths`/manifest columns to `ai_generation_jobs`; keep `config` only for the generation request. Backfill-safe nullability must permit preexisting failed jobs with no stored input.
- [x] Regenerate Prisma schema/types and extend `AiGenerationJobRecord` / creation parameters to carry bucket and object metadata without `any` escape hatches at the public service boundary.
- [x] Implement the new input-storage service around `supabaseAdmin.storage`, following the existing private PDF upload/download/delete conventions in `PdfStorageService`. Build paths under a UUID job prefix, sanitize names, use `upsert: false`, record content type and size, and never issue a public or signed URL.
- [x] Make partial-upload cleanup best-effort and idempotent. Return typed errors that distinguish retryable storage transport failures from permanent invalid/missing input.
- [x] Add a server-side bucket readiness method; it must assert existence, privacy, PDF MIME restriction, and file-size policy before release verification.

## Verification & Testing

- PASS: `pnpm --filter @sentinel/db generate` regenerated Prisma Client and Kysely types.
- PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/services/ai-generation-input-storage.service.test.ts` passed 8/8 tests.
- PASS: `pnpm --filter sentinel-api test src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts` passed 8/8 tests.
- PASS: Migration inspection found private `ai-generation-staging`, `allowed_mime_types = ARRAY['application/pdf']`, `file_size_limit = 15728640`, nullable `storage_bucket` and `storage_paths`, and no browser `storage.objects` policies.
- PASS: Generated DB types now expose nullable `storage_bucket` and `storage_paths` on `ai_generation_jobs`.
- BLOCKED: `pnpm --filter sentinel-api typecheck` failed with Node heap exhaustion under the configured `NODE_OPTIONS="--max-old-space-size=4096"` after about 3 minutes. Larger-heap manual reruns with 8GB and 12GB produced no diagnostics but did not terminate in a bounded wait and were interrupted; this phase is not marked completed until full package typecheck can finish.

## Risks & Rollback

- A bucket policy or service-role error can block all new generation jobs; the API must fail closed before job creation.
- The migration is additive and rollback-safe: disable the new API/worker release before dropping no-longer-used columns/bucket. Do not delete the bucket while retained objects exist.
