-- Migration: 20260915130000_create_ai_generation_jobs
-- Description: Create ai_generation_jobs table for asynchronous LLM question preview generation
-- Configures Row Level Security (RLS), indexes, and Supabase Realtime publication with REPLICA IDENTITY DEFAULT.

-- 1. Create ai_generation_jobs table
CREATE TABLE IF NOT EXISTS "public"."ai_generation_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "institution_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "current_step" VARCHAR(255),
    "config" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS "ai_generation_jobs_user_id_created_at_idx" ON "public"."ai_generation_jobs"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_generation_jobs_status_updated_at_idx" ON "public"."ai_generation_jobs"("status", "updated_at");
CREATE INDEX IF NOT EXISTS "ai_generation_jobs_expires_at_idx" ON "public"."ai_generation_jobs"("expires_at");

-- 3. Add Foreign Key Constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ai_generation_jobs_user_id_fkey'
    ) THEN
        ALTER TABLE "public"."ai_generation_jobs"
            ADD CONSTRAINT "ai_generation_jobs_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ai_generation_jobs_institution_id_fkey'
    ) THEN
        ALTER TABLE "public"."ai_generation_jobs"
            ADD CONSTRAINT "ai_generation_jobs_institution_id_fkey"
            FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE "public"."ai_generation_jobs" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
DROP POLICY IF EXISTS "ai_generation_jobs_owner_select" ON "public"."ai_generation_jobs";
CREATE POLICY "ai_generation_jobs_owner_select"
ON "public"."ai_generation_jobs"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_generation_jobs_service_role" ON "public"."ai_generation_jobs";
CREATE POLICY "ai_generation_jobs_service_role"
ON "public"."ai_generation_jobs"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Configure Supabase Realtime Publication & Replica Identity
ALTER TABLE "public"."ai_generation_jobs" REPLICA IDENTITY DEFAULT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication
        WHERE pubname = 'supabase_realtime'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'ai_generation_jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "public"."ai_generation_jobs";
    END IF;
END $$;
