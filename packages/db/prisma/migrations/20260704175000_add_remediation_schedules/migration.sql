-- CreateEnum
CREATE TYPE "exam_remediation_type" AS ENUM ('RETAKE', 'MAKEUP');

-- AlterTable
ALTER TABLE "exam_attempts" ALTER COLUMN "lifecycle_state" DROP NOT NULL,
ALTER COLUMN "score_state" DROP NOT NULL;

-- CreateTable
CREATE TABLE "exam_remediation_schedules" (
    "remediation_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_exam_id" UUID NOT NULL,
    "remediation_exam_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "source_attempt_id" UUID,
    "remediation_type" "exam_remediation_type" NOT NULL,
    "scheduled_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date_time" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "exam_remediation_schedules_pkey" PRIMARY KEY ("remediation_id")
);

-- CreateIndex
CREATE INDEX "exam_remediation_schedules_source_exam_id_idx" ON "exam_remediation_schedules"("source_exam_id");

-- CreateIndex
CREATE INDEX "exam_remediation_schedules_remediation_exam_id_idx" ON "exam_remediation_schedules"("remediation_exam_id");

-- CreateIndex
CREATE INDEX "exam_remediation_schedules_student_id_idx" ON "exam_remediation_schedules"("student_id");

-- CreateIndex
CREATE INDEX "exam_remediation_schedules_source_attempt_id_idx" ON "exam_remediation_schedules"("source_attempt_id");

-- AddForeignKey
ALTER TABLE "exam_remediation_schedules" ADD CONSTRAINT "exam_remediation_schedules_source_exam_id_fkey" FOREIGN KEY ("source_exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_remediation_schedules" ADD CONSTRAINT "exam_remediation_schedules_remediation_exam_id_fkey" FOREIGN KEY ("remediation_exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_remediation_schedules" ADD CONSTRAINT "exam_remediation_schedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_remediation_schedules" ADD CONSTRAINT "exam_remediation_schedules_source_attempt_id_fkey" FOREIGN KEY ("source_attempt_id") REFERENCES "exam_attempts"("attempt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_remediation_schedules" ADD CONSTRAINT "exam_remediation_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
