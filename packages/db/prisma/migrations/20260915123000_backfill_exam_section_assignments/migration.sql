-- Migration: 20260915123000_backfill_exam_section_assignments
-- Description: Backfill historical section assignments from exam_assigned_sections into exam_section_assignments.
-- Ensures exam_section_assignments is the single authoritative source of truth for all section and classroom assignments.

INSERT INTO "public"."exam_section_assignments" ("exam_id", "section_id", "created_at", "updated_at")
SELECT 
    eas."exam_id", 
    eas."section_id", 
    coalesce(eas."created_at", CURRENT_TIMESTAMP), 
    CURRENT_TIMESTAMP
FROM "public"."exam_assigned_sections" eas
INNER JOIN "public"."exams" e ON e."exam_id" = eas."exam_id"
INNER JOIN "public"."sections" s ON s."section_id" = eas."section_id"
ON CONFLICT ("exam_id", "section_id") DO NOTHING;
