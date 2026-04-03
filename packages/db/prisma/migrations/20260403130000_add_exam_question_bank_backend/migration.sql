ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'MULTIPLE_RESPONSE';
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'MATCHING';
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'FILL_BLANK';

ALTER TABLE "public"."exams"
    ADD COLUMN IF NOT EXISTS "section_id" UUID,
    ADD COLUMN IF NOT EXISTS "section_name" VARCHAR(100),
    ADD COLUMN IF NOT EXISTS "end_date_time" TIMESTAMPTZ(6),
    ADD COLUMN IF NOT EXISTS "updated_by" UUID,
    ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ(6);

ALTER TABLE "public"."exam_questions"
    ADD COLUMN IF NOT EXISTS "exam_section_id" UUID,
    ADD COLUMN IF NOT EXISTS "source_question_bank_question_id" UUID;

ALTER TABLE "public"."exam_configurations"
    ADD COLUMN IF NOT EXISTS "shuffle_questions" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "show_correct_answers" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "allow_review" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "randomize_choices" BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS "public"."exam_sections" (
    "exam_section_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT now(),
    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("exam_section_id"),
    CONSTRAINT "exam_sections_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "public"."question_bank_questions" (
    "question_bank_question_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject_id" UUID,
    "institution_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "question_type" "public"."question_type" NOT NULL,
    "content" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT now(),
    "archived_at" TIMESTAMPTZ(6),
    CONSTRAINT "question_bank_questions_pkey" PRIMARY KEY ("question_bank_question_id"),
    CONSTRAINT "question_bank_questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_questions_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_questions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "public"."question_bank_collections" (
    "collection_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institution_id" UUID,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT now(),
    CONSTRAINT "question_bank_collections_pkey" PRIMARY KEY ("collection_id"),
    CONSTRAINT "question_bank_collections_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_collections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_collections_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "public"."question_bank_collection_questions" (
    "collection_id" UUID NOT NULL,
    "question_bank_question_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMPTZ(6) DEFAULT now(),
    CONSTRAINT "question_bank_collection_questions_pkey" PRIMARY KEY ("collection_id", "question_bank_question_id"),
    CONSTRAINT "question_bank_collection_questions_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."question_bank_collections"("collection_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "question_bank_collection_questions_question_id_fkey" FOREIGN KEY ("question_bank_question_id") REFERENCES "public"."question_bank_questions"("question_bank_question_id") ON DELETE CASCADE ON UPDATE NO ACTION
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exams_section_id_fkey'
    ) THEN
        ALTER TABLE "public"."exams"
            ADD CONSTRAINT "exams_section_id_fkey"
            FOREIGN KEY ("section_id") REFERENCES "public"."sections"("section_id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exams_updated_by_fkey'
    ) THEN
        ALTER TABLE "public"."exams"
            ADD CONSTRAINT "exams_updated_by_fkey"
            FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exam_questions_exam_section_id_fkey'
    ) THEN
        ALTER TABLE "public"."exam_questions"
            ADD CONSTRAINT "exam_questions_exam_section_id_fkey"
            FOREIGN KEY ("exam_section_id") REFERENCES "public"."exam_sections"("exam_section_id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'exam_questions_source_question_bank_question_id_fkey'
    ) THEN
        ALTER TABLE "public"."exam_questions"
            ADD CONSTRAINT "exam_questions_source_question_bank_question_id_fkey"
            FOREIGN KEY ("source_question_bank_question_id") REFERENCES "public"."question_bank_questions"("question_bank_question_id") ON DELETE SET NULL ON UPDATE NO ACTION;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "exam_sections_exam_id_order_index_key"
    ON "public"."exam_sections"("exam_id", "order_index");

CREATE INDEX IF NOT EXISTS "exam_sections_exam_id_idx"
    ON "public"."exam_sections"("exam_id");

CREATE INDEX IF NOT EXISTS "exams_institution_status_idx"
    ON "public"."exams"("institution_id", "status");

CREATE INDEX IF NOT EXISTS "exams_subject_id_idx"
    ON "public"."exams"("subject_id");

CREATE INDEX IF NOT EXISTS "exams_section_id_idx"
    ON "public"."exams"("section_id");

CREATE INDEX IF NOT EXISTS "exam_questions_exam_id_order_index_idx"
    ON "public"."exam_questions"("exam_id", "order_index");

CREATE INDEX IF NOT EXISTS "exam_questions_exam_section_id_idx"
    ON "public"."exam_questions"("exam_section_id");

CREATE INDEX IF NOT EXISTS "question_bank_questions_institution_id_idx"
    ON "public"."question_bank_questions"("institution_id");

CREATE INDEX IF NOT EXISTS "question_bank_questions_subject_id_idx"
    ON "public"."question_bank_questions"("subject_id");

CREATE INDEX IF NOT EXISTS "question_bank_questions_type_idx"
    ON "public"."question_bank_questions"("question_type");

CREATE INDEX IF NOT EXISTS "question_bank_collections_institution_id_idx"
    ON "public"."question_bank_collections"("institution_id");

CREATE INDEX IF NOT EXISTS "question_bank_collections_created_by_idx"
    ON "public"."question_bank_collections"("created_by");

CREATE INDEX IF NOT EXISTS "question_bank_collection_questions_collection_order_idx"
    ON "public"."question_bank_collection_questions"("collection_id", "order_index");
