-- CreateTable
CREATE TABLE "public"."exam_assigned_sections" (
    "exam_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_assigned_sections_pkey" PRIMARY KEY ("exam_id","section_id")
);

-- AddForeignKey
ALTER TABLE "public"."exam_assigned_sections" ADD CONSTRAINT "exam_assigned_sections_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_assigned_sections" ADD CONSTRAINT "exam_assigned_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed existing data
INSERT INTO "public"."exam_assigned_sections" (exam_id, section_id)
SELECT exam_id, section_id
FROM "public"."exams"
WHERE section_id IS NOT NULL;
