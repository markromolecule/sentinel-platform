DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'incident_platform'
          AND typnamespace = 'public'::regnamespace
    ) THEN
        CREATE TYPE "public"."incident_platform" AS ENUM ('WEB', 'MOBILE');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'telemetry_source'
          AND typnamespace = 'public'::regnamespace
    ) THEN
        CREATE TYPE "public"."telemetry_source" AS ENUM ('CLIENT', 'SERVER', 'AI');
    END IF;
END $$;

ALTER TYPE "public"."incident_type" ADD VALUE IF NOT EXISTS 'APP_BACKGROUNDING';
ALTER TYPE "public"."incident_type" ADD VALUE IF NOT EXISTS 'ROOT_JAILBREAK_DETECTED';
ALTER TYPE "public"."incident_type" ADD VALUE IF NOT EXISTS 'APP_PINNING_VIOLATION';
ALTER TYPE "public"."incident_type" ADD VALUE IF NOT EXISTS 'NOTIFICATION_BLOCK_VIOLATION';

ALTER TABLE "public"."flagged_incidents"
    ADD COLUMN IF NOT EXISTS "platform" "public"."incident_platform",
    ADD COLUMN IF NOT EXISTS "source" "public"."telemetry_source",
    ADD COLUMN IF NOT EXISTS "rule_key" VARCHAR(100),
    ADD COLUMN IF NOT EXISTS "reviewed_by" UUID,
    ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMPTZ(6),
    ADD COLUMN IF NOT EXISTS "review_notes" TEXT,
    ADD COLUMN IF NOT EXISTS "configuration_snapshot" JSON,
    ADD COLUMN IF NOT EXISTS "session_context" JSON,
    ADD COLUMN IF NOT EXISTS "dedupe_key" VARCHAR(255);
