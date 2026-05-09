CREATE TYPE "public"."notification_status" AS ENUM ('UNREAD', 'READ');

CREATE TYPE "public"."notification_resource_type" AS ENUM (
    'EXAM_ASSIGNMENT',
    'CLASSROOM_INSTRUCTOR_ASSIGNMENT'
);

CREATE TYPE "public"."notification_action_type" AS ENUM (
    'EXAM_ASSIGNMENT_CREATED',
    'EXAM_ASSIGNMENT_ACCEPTED',
    'EXAM_ASSIGNMENT_REJECTED',
    'CLASSROOM_INSTRUCTOR_ASSIGNED'
);

CREATE TABLE "public"."notifications" (
    "notification_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_user_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "institution_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."notification_status" DEFAULT 'UNREAD',
    "action_type" "public"."notification_action_type" NOT NULL,
    "resource_type" "public"."notification_resource_type" NOT NULL,
    "resource_id" UUID,
    "resource_label" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

CREATE INDEX "notifications_recipient_status_created_idx"
    ON "public"."notifications" ("recipient_user_id", "status", "created_at" DESC);

CREATE INDEX "notifications_institution_created_idx"
    ON "public"."notifications" ("institution_id", "created_at" DESC);

CREATE INDEX "notifications_resource_idx"
    ON "public"."notifications" ("resource_type", "resource_id");

ALTER TABLE "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_user_id_fkey"
    FOREIGN KEY ("recipient_user_id")
    REFERENCES "auth"."users" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "public"."notifications"
    ADD CONSTRAINT "notifications_actor_user_id_fkey"
    FOREIGN KEY ("actor_user_id")
    REFERENCES "auth"."users" ("id")
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

ALTER TABLE "public"."notifications"
    ADD CONSTRAINT "notifications_institution_id_fkey"
    FOREIGN KEY ("institution_id")
    REFERENCES "public"."institutions" ("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
