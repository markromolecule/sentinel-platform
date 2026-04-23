ALTER TABLE "exam_attempts"
    ADD COLUMN IF NOT EXISTS "answer_snapshot" JSONB,
    ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMPTZ(6),
    ADD COLUMN IF NOT EXISTS "reconnect_attempt_count" INTEGER DEFAULT 0;
