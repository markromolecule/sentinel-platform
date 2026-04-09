ALTER TABLE "public"."exam_questions"
    ADD COLUMN IF NOT EXISTS "source_collection_id" UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exam_questions_source_collection_id_fkey'
    ) THEN
        ALTER TABLE "public"."exam_questions"
            ADD CONSTRAINT "exam_questions_source_collection_id_fkey"
            FOREIGN KEY ("source_collection_id") REFERENCES "public"."question_bank_collections"("collection_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "exam_questions_source_question_bank_question_id_idx"
    ON "public"."exam_questions"("source_question_bank_question_id");

CREATE INDEX IF NOT EXISTS "exam_questions_source_collection_id_idx"
    ON "public"."exam_questions"("source_collection_id");
