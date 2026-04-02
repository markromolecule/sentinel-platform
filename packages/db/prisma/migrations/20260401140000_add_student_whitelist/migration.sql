CREATE TYPE "public"."student_whitelist_status" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

CREATE TABLE "public"."student_whitelist" (
    "whitelist_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "institution_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "student_number" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100),
    "status" "public"."student_whitelist_status" DEFAULT 'ACTIVE',
    "claimed_user_id" UUID,
    "claimed_at" TIMESTAMPTZ(6),
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT NOW(),

    CONSTRAINT "student_whitelist_pkey" PRIMARY KEY ("whitelist_id")
);

ALTER TABLE "public"."students"
DROP CONSTRAINT IF EXISTS "students_student_number_key";

ALTER TABLE "public"."students"
ADD CONSTRAINT "students_institution_id_student_number_key"
UNIQUE ("institution_id", "student_number");

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_institution_id_student_number_key"
UNIQUE ("institution_id", "student_number");

CREATE INDEX "student_whitelist_department_id_idx"
ON "public"."student_whitelist"("department_id");

CREATE INDEX "student_whitelist_course_id_idx"
ON "public"."student_whitelist"("course_id");

CREATE INDEX "student_whitelist_claimed_user_id_idx"
ON "public"."student_whitelist"("claimed_user_id");

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_institution_id_fkey"
FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_department_id_fkey"
FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_claimed_user_id_fkey"
FOREIGN KEY ("claimed_user_id") REFERENCES "auth"."users"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public"."student_whitelist"
ADD CONSTRAINT "student_whitelist_updated_by_fkey"
FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;
