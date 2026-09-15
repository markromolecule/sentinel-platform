---
title: "Phase 1: Database Schema, RLS Security & Job Tracking"
type: phase
parent: "docs/tasks/2026/09/2026-09-15/async-gemini-generation/README.md"
phase: "1"
status: completed
created: "2026-09-15"
tags: [task, phase, database, prisma, supabase, rls, security]
---

# Phase 1: Database Schema, RLS Security & Job Tracking

## Objective

Create the `ai_generation_jobs` table in PostgreSQL via Prisma migration, configure PostgreSQL Row Level Security (RLS) to enforce tenant isolation, enable Supabase Realtime replication with `REPLICA IDENTITY DEFAULT`, and implement the job persistence repository with atomic progress tracking and stuck-job reconciliation in `sentinel-api`.

## Dependencies & Prerequisites

- ADR-0002 accepted.
- Supabase Pro database connection active via Supavisor pooler.

## Impacted Files & Components

- `packages/db/prisma/schema.prisma` — Add `ai_generation_jobs` model with composite indexes.
- `packages/db/prisma/migrations/20260915130000_create_ai_generation_jobs/migration.sql` — Migration script including RLS policies, indexes, and Realtime publication.
- `app/sentinel-api/src/modules/integrations/gemini/data/ai-generation-job.repository.ts` — Job CRUD, atomic status transitions, and stuck-job reconciler.
- `app/sentinel-api/src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts` — Unit tests for repository methods.

## Implementation Tasks

- [x] Task 1.1 — Define `ai_generation_jobs` model in `schema.prisma`:
  - `id` (UUID, primary key, `@default(dbgenerated("gen_random_uuid()"))`)
  - `user_id` (UUID, references `users.id`, `onDelete: Cascade`)
  - `institution_id` (UUID, references `institutions.id`, optional)
  - `status` (String, values: `'queued'`, `'processing'`, `'completed'`, `'failed'`, `@default("queued")`)
  - `progress` (Int, 0–100, `@default(0)`)
  - `current_step` (String, e.g. `"Staging lecture PDFs"`, `"Generating question batch 2 of 6"`, `"Evaluating passage quality"`)
  - `config` (Json, sanitized generation parameters)
  - `result` (Json, nullable, structured preview questions payload)
  - `error` (String, nullable, sanitized failure message)
  - `created_at` (DateTime, `@default(now())`)
  - `updated_at` (DateTime, `@updatedAt`)
  - `expires_at` (DateTime, 24-hour retention timestamp)
  - Indexes: `@@index([user_id, created_at])`, `@@index([status, updated_at])`, `@@index([expires_at])`
- [x] Task 1.2 — Generate and apply Prisma migration:
  - Generate migration script: `pnpm --filter @sentinel/db prisma migrate dev --name create_ai_generation_jobs --create-only`.
  - Add explicit Row Level Security (RLS) policies in `migration.sql`:

    ```sql
    -- 1. Enable Row Level Security
    ALTER TABLE "public"."ai_generation_jobs" ENABLE ROW LEVEL SECURITY;

    -- 2. Restrict SELECT to row owner
    CREATE POLICY "ai_generation_jobs_owner_select"
    ON "public"."ai_generation_jobs"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    -- 3. Full access for backend service role
    CREATE POLICY "ai_generation_jobs_service_role"
    ON "public"."ai_generation_jobs"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    ```

- [x] Task 1.3 — Configure Supabase Realtime publication and replica identity:
  - Add table to `supabase_realtime` publication:

    ```sql
    ALTER TABLE "public"."ai_generation_jobs" REPLICA IDENTITY DEFAULT;
    ALTER PUBLICATION supabase_realtime ADD TABLE "public"."ai_generation_jobs";
    ```

  - *Note:* `REPLICA IDENTITY DEFAULT` is explicitly chosen over `FULL` to prevent WAL bloat on updates when `result` contains large question JSON payloads.
- [x] Task 1.4 — Implement `AiGenerationJobRepository`:
  - `createJob(params: CreateAiGenerationJobParams): Promise<AiGenerationJob>` (sets `expires_at = now() + 24 hours`).
  - `updateProgress(id: string, progress: number, currentStep: string): Promise<void>`.
  - `completeJob(id: string, result: GenerateQuestionPreviewResponse): Promise<void>`.
  - `failJob(id: string, error: string): Promise<void>`.
  - `getJobById(id: string): Promise<AiGenerationJob | null>`.
  - `reconcileStuckJobs(olderThanMinutes: number = 15): Promise<number>`: Transitions any jobs in `queued` or `processing` state that haven't received heartbeat updates for >15 minutes to `failed` with `"Job timed out or worker process terminated unexpectedly"`.
  - `purgeExpiredJobs(): Promise<number>`: Deletes rows where `expires_at < NOW()`.

## Verification & Testing

- `pnpm --filter @sentinel/db generate`: Generated Prisma Client and Kysely types successfully.
- `pnpm --filter @sentinel/db build`: Build succeeded with TypeScript declaration files emitted in 120ms.
- `pnpm --filter sentinel-api test src/modules/integrations/gemini/data/ai-generation-job.repository.test.ts`: PASS (8/8 tests passed in 4ms).
- `pnpm --filter sentinel-api test src/tests/gemini/`: PASS (24/24 tests passed in 44ms).

## Risks & Rollback

- Standalone table addition with zero foreign key locks on live examination attempt tables.
- Rollback:

  ```sql
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS "public"."ai_generation_jobs";
  DROP TABLE IF EXISTS "public"."ai_generation_jobs" CASCADE;
  ```
