-- CreateTable
CREATE TABLE "public"."exam_section_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "room_id" UUID,
    "instructor_id" UUID,
    "scheduled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "exam_section_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_section_assignments_exam_id_section_id_key" ON "public"."exam_section_assignments"("exam_id", "section_id");

-- CreateIndex
CREATE INDEX "exam_section_assignments_exam_id_idx" ON "public"."exam_section_assignments"("exam_id");

-- CreateIndex
CREATE INDEX "exam_section_assignments_section_id_idx" ON "public"."exam_section_assignments"("section_id");

-- CreateIndex
CREATE INDEX "exam_section_assignments_instructor_id_idx" ON "public"."exam_section_assignments"("instructor_id");

-- AddForeignKey
ALTER TABLE "public"."exam_section_assignments" ADD CONSTRAINT "exam_section_assignments_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_section_assignments" ADD CONSTRAINT "exam_section_assignments_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("section_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_section_assignments" ADD CONSTRAINT "exam_section_assignments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_section_assignments" ADD CONSTRAINT "exam_section_assignments_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
