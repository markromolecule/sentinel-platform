CREATE TABLE "public"."exam_feedbacks" (
    "feedback_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "exam_id" UUID,
    "student_id" UUID,
    "institution_id" UUID,
    "rating" SMALLINT NOT NULL,
    "experience" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_feedbacks_pkey" PRIMARY KEY ("feedback_id"),
    CONSTRAINT "exam_feedbacks_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE UNIQUE INDEX "exam_feedbacks_attempt_id_key" ON "public"."exam_feedbacks"("attempt_id");
CREATE INDEX "exam_feedbacks_institution_created_idx" ON "public"."exam_feedbacks"("institution_id", "created_at");
CREATE INDEX "exam_feedbacks_exam_idx" ON "public"."exam_feedbacks"("exam_id");
CREATE INDEX "exam_feedbacks_student_idx" ON "public"."exam_feedbacks"("student_id");
CREATE INDEX "exam_feedbacks_rating_idx" ON "public"."exam_feedbacks"("rating");

ALTER TABLE "public"."exam_feedbacks"
    ADD CONSTRAINT "exam_feedbacks_attempt_id_fkey"
    FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("attempt_id")
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_feedbacks"
    ADD CONSTRAINT "exam_feedbacks_exam_id_fkey"
    FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("exam_id")
    ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_feedbacks"
    ADD CONSTRAINT "exam_feedbacks_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id")
    ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_feedbacks"
    ADD CONSTRAINT "exam_feedbacks_institution_id_fkey"
    FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
