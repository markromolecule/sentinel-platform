ALTER TABLE "public"."question_bank_questions"
    ADD COLUMN IF NOT EXISTS "source_origin" VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS "source_file_name" TEXT,
    ADD COLUMN IF NOT EXISTS "source_page_number" INTEGER,
    ADD COLUMN IF NOT EXISTS "source_evidence" TEXT;
