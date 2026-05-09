-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."classroom_instructor_assignments" (
    "assignment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_group_id" UUID NOT NULL,
    "instructor_user_id" UUID NOT NULL,
    "assigned_by_user_id" UUID,
    "is_head" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "classroom_instructor_assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "classroom_instructor_assignments_class_group_user_key"
ON "public"."classroom_instructor_assignments"("class_group_id", "instructor_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "classroom_instructor_assignments_class_group_head_idx"
ON "public"."classroom_instructor_assignments"("class_group_id", "is_head");

-- AddForeignKey
DO $$
BEGIN
    ALTER TABLE "public"."classroom_instructor_assignments"
    ADD CONSTRAINT "classroom_instructor_assignments_class_group_id_fkey"
    FOREIGN KEY ("class_group_id") REFERENCES "public"."class_groups"("class_group_id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

-- AddForeignKey
DO $$
BEGIN
    ALTER TABLE "public"."classroom_instructor_assignments"
    ADD CONSTRAINT "classroom_instructor_assignments_instructor_user_id_fkey"
    FOREIGN KEY ("instructor_user_id") REFERENCES "auth"."users"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

-- Backfill ownership metadata for existing instructor classroom memberships.
-- The earliest instructor assignment per class group becomes the head instructor.
WITH ranked_instructor_roles AS (
    SELECT
        cr.class_group_id,
        cr.user_id AS instructor_user_id,
        first_value(cr.user_id) OVER (
            PARTITION BY cr.class_group_id
            ORDER BY cr.assigned_at NULLS LAST, cr.user_id
        ) AS head_instructor_user_id,
        row_number() OVER (
            PARTITION BY cr.class_group_id
            ORDER BY cr.assigned_at NULLS LAST, cr.user_id
        ) AS assignment_rank,
        cr.assigned_at
    FROM "public"."class_roles" cr
    INNER JOIN "public"."roles" r ON r.role_id = cr.role_id
    WHERE r.role_name = 'instructor'
)
INSERT INTO "public"."classroom_instructor_assignments" (
    "class_group_id",
    "instructor_user_id",
    "assigned_by_user_id",
    "is_head",
    "created_at",
    "updated_at"
)
SELECT
    rir.class_group_id,
    rir.instructor_user_id,
    rir.head_instructor_user_id,
    CASE WHEN rir.assignment_rank = 1 THEN true ELSE false END,
    COALESCE(rir.assigned_at, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
FROM ranked_instructor_roles rir
ON CONFLICT ("class_group_id", "instructor_user_id") DO NOTHING;
