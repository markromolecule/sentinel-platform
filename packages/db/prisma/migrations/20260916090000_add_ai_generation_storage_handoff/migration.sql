-- Migration: 20260916090000_add_ai_generation_storage_handoff
-- Description: Add private Supabase Storage staging bucket and nullable source PDF manifest fields for async AI generation jobs.

-- 1. Create/update the private storage bucket used by service-role API and worker handoff.
INSERT INTO "storage"."buckets" (
    "id",
    "name",
    "public",
    "file_size_limit",
    "allowed_mime_types"
)
VALUES (
    'ai-generation-staging',
    'ai-generation-staging',
    false,
    15728640,
    ARRAY['application/pdf']
)
ON CONFLICT ("id") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "public" = false,
    "file_size_limit" = GREATEST(
        COALESCE("storage"."buckets"."file_size_limit", 0),
        EXCLUDED."file_size_limit"
    ),
    "allowed_mime_types" = EXCLUDED."allowed_mime_types";

-- 2. Add nullable storage manifest fields. Nullable keeps legacy failed/expired jobs readable.
ALTER TABLE "public"."ai_generation_jobs"
    ADD COLUMN IF NOT EXISTS "storage_bucket" TEXT,
    ADD COLUMN IF NOT EXISTS "storage_paths" JSONB;

-- 3. Keep the manifest shape explicit without forcing legacy rows to backfill.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ai_generation_jobs_storage_paths_array_chk'
    ) THEN
        ALTER TABLE "public"."ai_generation_jobs"
            ADD CONSTRAINT "ai_generation_jobs_storage_paths_array_chk"
            CHECK (
                "storage_paths" IS NULL
                OR jsonb_typeof("storage_paths") = 'array'
            );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ai_generation_jobs_storage_bucket_idx"
    ON "public"."ai_generation_jobs"("storage_bucket")
    WHERE "storage_bucket" IS NOT NULL;
