-- Sync latest schema changes
-- Generated manually due to shadow database issues with Supabase

-- AlterTable
ALTER TABLE "exam_attempts" ADD COLUMN IF NOT EXISTS "answered_question_count" INTEGER DEFAULT 0;

-- AlterTable: proctor_assignments refactor
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proctor_assignments' AND column_name='proctor_id') THEN
        ALTER TABLE "proctor_assignments" RENAME COLUMN "proctor_id" TO "instructor_id";
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "proctor_assignments_exam_id_instructor_id_key" ON "proctor_assignments"("exam_id", "instructor_id");

-- AlterTable: rooms
ALTER TABLE "rooms" ALTER COLUMN "room_code" SET DATA TYPE VARCHAR(50);

-- AlterTable: students
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6);

-- RenameForeignKeys for consistency
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='question_bank_collection_questions_question_id_fkey') THEN
        ALTER TABLE "question_bank_collection_questions" RENAME CONSTRAINT "question_bank_collection_questions_question_id_fkey" TO "question_bank_collection_questions_question_bank_question__fkey";
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='subject_classification_subjects_classification_id_fkey') THEN
        ALTER TABLE "subject_classification_subjects" RENAME CONSTRAINT "subject_classification_subjects_classification_id_fkey" TO "subject_classification_subjects_subject_classification_id_fkey";
    END IF;
END $$;
