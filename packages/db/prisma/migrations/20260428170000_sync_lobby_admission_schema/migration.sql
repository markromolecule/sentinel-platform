-- Phase 5: Sync Lobby Admission Schema
-- Aligns the database with the Prisma schema after Phase 2 lobby admission
-- work was applied manually. All statements are idempotent (IF NOT EXISTS / IF EXISTS).

-- -------------------------------------------------------------------------
-- 1. Ensure exam_lobby_admission_mode enum exists
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_lobby_admission_mode') THEN
        CREATE TYPE "exam_lobby_admission_mode" AS ENUM ('AUTOMATIC', 'MANUAL');
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 2. Ensure exam_lobby_admission_status enum exists
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_lobby_admission_status') THEN
        CREATE TYPE "exam_lobby_admission_status" AS ENUM ('WAITING', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 3. Add lobby_admission_mode to exam_configurations (additive, safe)
-- -------------------------------------------------------------------------
ALTER TABLE "exam_configurations"
    ADD COLUMN IF NOT EXISTS "lobby_admission_mode" "exam_lobby_admission_mode" NOT NULL DEFAULT 'AUTOMATIC';

-- -------------------------------------------------------------------------
-- 4. Ensure exam_lobby_admissions table exists
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "exam_lobby_admissions" (
    "admission_id"  UUID    NOT NULL DEFAULT gen_random_uuid(),
    "exam_id"       UUID    NOT NULL,
    "student_id"    UUID    NOT NULL,
    "status"        "exam_lobby_admission_status" NOT NULL DEFAULT 'WAITING',
    "checked_in_at" TIMESTAMPTZ(6) DEFAULT now(),
    "decided_at"    TIMESTAMPTZ(6),
    "decided_by"    UUID,

    CONSTRAINT "exam_lobby_admissions_pkey" PRIMARY KEY ("admission_id")
);

-- -------------------------------------------------------------------------
-- 5. Unique constraint: one admission record per student per exam
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'exam_lobby_admissions_exam_id_student_id_key'
    ) THEN
        ALTER TABLE "exam_lobby_admissions"
            ADD CONSTRAINT "exam_lobby_admissions_exam_id_student_id_key"
            UNIQUE ("exam_id", "student_id");
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 6. Foreign keys for exam_lobby_admissions
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exam_lobby_admissions_exam_id_fkey'
    ) THEN
        ALTER TABLE "exam_lobby_admissions"
            ADD CONSTRAINT "exam_lobby_admissions_exam_id_fkey"
            FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exam_lobby_admissions_student_id_fkey'
    ) THEN
        ALTER TABLE "exam_lobby_admissions"
            ADD CONSTRAINT "exam_lobby_admissions_student_id_fkey"
            FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 7. Align answer_snapshot column type on exam_attempts to JSON (not JSONB)
--    (Prisma schema specifies @db.Json)
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exam_attempts'
          AND column_name = 'answer_snapshot'
          AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE "exam_attempts"
            ALTER COLUMN "answer_snapshot" SET DATA TYPE JSON
            USING answer_snapshot::text::json;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 8. Rename proctor_assignments FK if it still uses the old name
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'proctor_assignments_proctor_id_fkey'
    ) THEN
        ALTER TABLE "proctor_assignments"
            RENAME CONSTRAINT "proctor_assignments_proctor_id_fkey"
            TO "proctor_assignments_instructor_id_fkey";
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 9. Add rooms institution FK if missing (Prisma expects CASCADE)
-- -------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'rooms_institution_id_fkey'
    ) THEN
        ALTER TABLE "rooms"
            ADD CONSTRAINT "rooms_institution_id_fkey"
            FOREIGN KEY ("institution_id") REFERENCES "institutions"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;
