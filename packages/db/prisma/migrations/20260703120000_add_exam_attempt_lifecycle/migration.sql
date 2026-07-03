CREATE TYPE "public"."exam_attempt_lifecycle_state" AS ENUM (
    'IN_PROGRESS',
    'LOCKED',
    'CLOSED',
    'SUBMITTED',
    'SUPERSEDED'
);

CREATE TYPE "public"."exam_attempt_lifecycle_event_type" AS ENUM (
    'STARTED',
    'SUBMITTED',
    'LOCKED',
    'REOPENED',
    'RESET',
    'CLOSED',
    'SUPERSEDED',
    'FINALIZED',
    'FINALIZATION_REVISED',
    'MAKEUP_GRANTED',
    'RETAKE_GRANTED',
    'INCIDENT_REVIEWED'
);

CREATE TYPE "public"."exam_attempt_score_state" AS ENUM (
    'DRAFT',
    'FINALIZED',
    'REVISION_REQUIRED'
);

ALTER TABLE "public"."exam_attempts"
ADD COLUMN "lifecycle_state" "public"."exam_attempt_lifecycle_state" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN "lifecycle_reason" VARCHAR(100),
ADD COLUMN "lifecycle_note" TEXT,
ADD COLUMN "locked_at" TIMESTAMPTZ(6),
ADD COLUMN "locked_by" UUID,
ADD COLUMN "reopened_until" TIMESTAMPTZ(6),
ADD COLUMN "closed_at" TIMESTAMPTZ(6),
ADD COLUMN "closed_by" UUID,
ADD COLUMN "closed_reason" VARCHAR(100),
ADD COLUMN "superseded_by_attempt_id" UUID,
ADD COLUMN "superseded_at" TIMESTAMPTZ(6),
ADD COLUMN "superseded_by" UUID,
ADD COLUMN "finalized_at" TIMESTAMPTZ(6),
ADD COLUMN "finalized_by" UUID,
ADD COLUMN "score_state" "public"."exam_attempt_score_state" NOT NULL DEFAULT 'DRAFT';

UPDATE "public"."exam_attempts"
SET "lifecycle_state" = CASE
    WHEN "status" = 'COMPLETED' OR "completed_at" IS NOT NULL THEN 'SUBMITTED'::"public"."exam_attempt_lifecycle_state"
    ELSE 'IN_PROGRESS'::"public"."exam_attempt_lifecycle_state"
END;

CREATE TABLE "public"."exam_attempt_lifecycle_events" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "event_type" "public"."exam_attempt_lifecycle_event_type" NOT NULL,
    "previous_state" "public"."exam_attempt_lifecycle_state",
    "next_state" "public"."exam_attempt_lifecycle_state",
    "actor_user_id" UUID,
    "reason_code" VARCHAR(100),
    "notes" TEXT,
    "related_incident_ids" JSONB,
    "related_override_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempt_lifecycle_events_pkey" PRIMARY KEY ("event_id")
);

CREATE INDEX "exam_attempts_exam_student_lifecycle_idx"
    ON "public"."exam_attempts"("exam_id", "student_id", "lifecycle_state");

CREATE INDEX "exam_attempts_superseded_by_attempt_idx"
    ON "public"."exam_attempts"("superseded_by_attempt_id");

CREATE INDEX "exam_attempt_lifecycle_events_attempt_created_idx"
    ON "public"."exam_attempt_lifecycle_events"("attempt_id", "created_at");

ALTER TABLE "public"."exam_attempts"
ADD CONSTRAINT "exam_attempts_superseded_by_attempt_id_fkey"
    FOREIGN KEY ("superseded_by_attempt_id")
    REFERENCES "public"."exam_attempts"("attempt_id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_attempt_lifecycle_events"
ADD CONSTRAINT "exam_attempt_lifecycle_events_attempt_id_fkey"
    FOREIGN KEY ("attempt_id")
    REFERENCES "public"."exam_attempts"("attempt_id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_attempt_lifecycle_events"
ADD CONSTRAINT "exam_attempt_lifecycle_events_exam_id_fkey"
    FOREIGN KEY ("exam_id")
    REFERENCES "public"."exams"("exam_id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."exam_attempt_lifecycle_events"
ADD CONSTRAINT "exam_attempt_lifecycle_events_student_id_fkey"
    FOREIGN KEY ("student_id")
    REFERENCES "public"."students"("student_id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
