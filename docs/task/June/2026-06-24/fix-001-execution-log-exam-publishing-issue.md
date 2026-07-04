# Execution Log: Exam Publishing Visibility Failure

**Date:** 2026-06-24
**Scope:** `sentinel-api`, `sentinel-web`
**Status:** Completed

---

## Summary

This task fixed the decoupled exam publishing flow so section assignments created through `exam_section_assignments` now appear in the instructor classroom feed and the student available-exams feed.

The main issue was the read layer, not the data model. Several visibility checks still depended on the legacy `exam_assigned_sections` table alone, so exams assigned through the newer section-assignment flow could be written successfully but remain invisible in list and detail views.

---

## Phase 1: Unify Exam Visibility Logic

**Goal:** Make all exam read paths recognize both legacy and decoupled section-assignment tables.

- [x] Updated [`app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts) to include `exam_section_assignments` alongside `exam_assigned_sections` in the classroom and student visibility predicates.
- [x] Updated [`app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts) so exam detail payloads aggregate assigned section ids and names from both assignment sources.
- [x] Kept the existing `get-exams.ts` read flow aligned with the shared predicates so instructor and student feeds resolve through the same visibility logic.
- [x] Added regression coverage in [`build-student-exam-scope-predicates.test.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts) and [`get-exam-by-id.test.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts).

**Migration required:** No

---

## Phase 2: Protect Student and Instructor Feeds

**Goal:** Verify the frontend surfaces the corrected backend visibility behavior.

- [x] Added a regression test in [`app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts`](</Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts>) to confirm section-assigned exams remain visible in the available feed.
- [x] Confirmed the student history hook continues to source available exams from `useExamsQuery()` and the corrected backend payload.
- [x] Confirmed the exam-section-assignment mutation hooks already invalidate the exam query cache, so no cache-layer changes were needed.

**Migration required:** No

---

## Verification

- [x] Ran focused Vitest coverage for the touched backend files.
- [x] Ran focused Vitest coverage for the student-history hook test.
- [x] Confirmed the targeted tests passed after the visibility fix.

**Final validation:** Passed for the touched surfaces.

---

## Notes

- No Prisma or database migration was needed.
- The decoupled assignment model remains intact.
- The legacy assignment table is still supported for compatibility, but it is no longer the only source of truth for visibility.
