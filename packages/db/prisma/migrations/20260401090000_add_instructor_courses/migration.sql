CREATE TABLE "public"."instructor_courses" (
    "instructor_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instructor_courses_pkey" PRIMARY KEY ("instructor_id", "course_id")
);

ALTER TABLE "public"."instructor_courses"
ADD CONSTRAINT "instructor_courses_instructor_id_fkey"
FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("instructor_id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."instructor_courses"
ADD CONSTRAINT "instructor_courses_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id")
ON DELETE CASCADE ON UPDATE NO ACTION;

INSERT INTO "public"."instructor_courses" ("instructor_id", "course_id", "created_at")
SELECT
    instructor_id,
    course_id,
    COALESCE(created_at, CURRENT_TIMESTAMP)
FROM "public"."instructors"
WHERE course_id IS NOT NULL
ON CONFLICT ("instructor_id", "course_id") DO NOTHING;
