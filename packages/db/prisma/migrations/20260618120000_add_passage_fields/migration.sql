ALTER TABLE "public"."exam_questions"
    ADD COLUMN IF NOT EXISTS "passage_content" TEXT,
    ADD COLUMN IF NOT EXISTS "passage_type" VARCHAR(10) DEFAULT 'plain';

ALTER TABLE "public"."question_bank_questions"
    ADD COLUMN IF NOT EXISTS "passage_content" TEXT,
    ADD COLUMN IF NOT EXISTS "passage_type" VARCHAR(10) DEFAULT 'plain';
