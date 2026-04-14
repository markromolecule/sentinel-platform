CREATE TABLE "public"."subject_classifications" (
    "subject_classification_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "classification_type" VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "institution_id" UUID,
    CONSTRAINT "subject_classifications_pkey" PRIMARY KEY ("subject_classification_id"),
    CONSTRAINT "subject_classifications_classification_type_check" CHECK (
        "classification_type" IN ('GENERAL', 'CORE')
    )
);

CREATE TABLE "public"."subject_classification_subjects" (
    "subject_classification_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subject_classification_subjects_pkey" PRIMARY KEY ("subject_classification_id", "subject_id")
);

CREATE UNIQUE INDEX "subject_classifications_institution_name_key"
    ON "public"."subject_classifications"("institution_id", "name");

CREATE INDEX "subject_classifications_institution_id_idx"
    ON "public"."subject_classifications"("institution_id");

CREATE INDEX "subject_classification_subjects_subject_id_idx"
    ON "public"."subject_classification_subjects"("subject_id");

ALTER TABLE "public"."subject_classifications"
    ADD CONSTRAINT "subject_classifications_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."subject_classifications"
    ADD CONSTRAINT "subject_classifications_updated_by_fkey"
    FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."subject_classifications"
    ADD CONSTRAINT "subject_classifications_institution_id_fkey"
    FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."subject_classification_subjects"
    ADD CONSTRAINT "subject_classification_subjects_classification_id_fkey"
    FOREIGN KEY ("subject_classification_id") REFERENCES "public"."subject_classifications"("subject_classification_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."subject_classification_subjects"
    ADD CONSTRAINT "subject_classification_subjects_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("subject_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
