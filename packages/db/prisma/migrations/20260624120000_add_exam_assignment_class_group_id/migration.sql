-- Add classroom identity to exam section assignments so classroom-specific
-- visibility checks can distinguish classrooms that share the same section.
ALTER TABLE "public"."exam_section_assignments"
ADD COLUMN "class_group_id" UUID;

-- CreateIndex
CREATE INDEX "exam_section_assignments_class_group_id_idx"
ON "public"."exam_section_assignments"("class_group_id");

-- AddForeignKey
ALTER TABLE "public"."exam_section_assignments"
ADD CONSTRAINT "exam_section_assignments_class_group_id_fkey"
FOREIGN KEY ("class_group_id")
REFERENCES "public"."class_groups"("class_group_id")
ON DELETE SET NULL
ON UPDATE CASCADE;
