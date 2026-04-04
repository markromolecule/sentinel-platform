DO $$
BEGIN
    CREATE TYPE "public"."question_difficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."question_bank_questions"
    ADD COLUMN IF NOT EXISTS "difficulty" "public"."question_difficulty" DEFAULT 'MODERATE'::"public"."question_difficulty";

UPDATE "public"."question_bank_questions"
SET "difficulty" = 'MODERATE'::"public"."question_difficulty"
WHERE "difficulty" IS NULL;

ALTER TABLE "public"."question_bank_questions"
    ALTER COLUMN "difficulty" SET DEFAULT 'MODERATE'::"public"."question_difficulty",
    ALTER COLUMN "difficulty" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "question_bank_questions_difficulty_idx"
    ON "public"."question_bank_questions"("difficulty");
