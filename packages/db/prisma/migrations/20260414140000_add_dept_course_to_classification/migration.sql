-- AlterTable
ALTER TABLE "public"."subject_classifications" ADD COLUMN "department_id" UUID;

-- CreateTable
CREATE TABLE "public"."subject_classification_courses" (
    "subject_classification_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_classification_courses_pkey" PRIMARY KEY ("subject_classification_id","course_id")
);

-- CreateIndex
CREATE INDEX "subject_classification_courses_course_id_idx" ON "public"."subject_classification_courses"("course_id");

-- AddForeignKey
ALTER TABLE "public"."subject_classifications" ADD CONSTRAINT "subject_classifications_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subject_classification_courses" ADD CONSTRAINT "subject_classification_courses_subject_classification_id_fkey" FOREIGN KEY ("subject_classification_id") REFERENCES "public"."subject_classifications"("subject_classification_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subject_classification_courses" ADD CONSTRAINT "subject_classification_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION;
