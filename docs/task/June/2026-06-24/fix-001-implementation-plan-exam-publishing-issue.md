# Implementation Plan: Exam Publishing Visibility Failure

**Status:** Completed

## Pre-Planning

- **Summary of the Task:** Fix the decoupled exam publishing flow so classroom assignments stored in `exam_section_assignments` become visible to instructors and students in the classroom and exam feeds.
- **Source Files Scanned:**
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams-instructor-visibility.test.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignment.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignments-batch.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/controllers/create-exam-section-assignment.controller.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/controllers/create-exam-section-assignments-batch.controller.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/section-assignments.service.ts`
    - `app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts`
    - `app/sentinel-api/src/modules/examination/exams/services/get-exams.ts`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/app/(protected)/student/_lib/student-exam-listing.ts`
    - `packages/hooks/src/query/exams/use-exams-query.ts`
    - `packages/hooks/src/query/exam-section-assignments/use-create-exam-section-assignment-mutation.ts`
    - `packages/hooks/src/query/exam-section-assignments/use-create-exam-section-assignments-batch-mutation.ts`
    - `packages/hooks/src/query/exam-section-assignments/use-update-exam-section-assignment-mutation.ts`
    - `packages/hooks/src/query/exam-section-assignments/use-delete-exam-section-assignment-mutation.ts`
    - `packages/db/prisma/schema.prisma`
    - `packages/db/prisma/migrations/20260418190000_add_exam_assigned_sections/migration.sql`
    - `packages/db/prisma/migrations/20260613161800_add_exam_section_assignments/migration.sql`
- **Files, Services, and DB Tables Touched:**
    - `build-student-exam-scope-predicates.ts` (shared visibility predicates)
    - `get-exams.ts` and `get-exams.controller.ts` (exam feed data path)
    - `get-exam-by-id.ts` if the detail route must mirror the same classroom assignment visibility
    - `get-exams.test.ts`, `get-exams-instructor-visibility.test.ts`, and `build-student-exam-scope-predicates.test.ts`
    - `section-assignments` data/controller/service files for write-path verification
    - `use-student-history/index.ts`, `student-exam-listing.ts`, and the exam-section-assignment mutation hooks if cache invalidation needs to be tightened
    - DB tables: `exams`, `exam_assigned_sections`, `exam_section_assignments`, `class_groups`, `sections`, `enrollments`, `students`
- **Prisma Migration Needed:** No. The failing behavior is caused by visibility queries not fully honoring the newer `exam_section_assignments` relationship, not by a missing table or column.

---

## 1-3-1 Options

### Option 1: Minimal Predicate Patch

Update the existing classroom and student visibility predicates to include `exam_section_assignments` wherever the legacy `exam_assigned_sections` table is currently checked.

- **Tradeoff:** Fastest fix, but the logic stays duplicated across multiple query builders and is easier to regress later.

### Option 2: Shared Visibility Helper

Extract a single shared exam-assignment visibility helper and use it in every exam feed path that decides whether a classroom assignment should be visible.

- **Tradeoff:** Slightly more work up front, but it keeps the new and legacy assignment tables aligned and makes the behavior easier to test and maintain.

### Option 3: Backfill Legacy Assignment Rows

Keep the existing read paths mostly unchanged and add a compatibility backfill that mirrors `exam_section_assignments` into `exam_assigned_sections`.

- **Tradeoff:** This minimizes code churn, but it preserves the old data model and risks long-term drift by writing duplicate assignment records.

### Best Option

**Option 2 is the best fit.** It fixes the bug at the read-layer boundary where the visibility decision is actually made, avoids duplicating assignment rows, and matches the repo’s current direction of using `exam_section_assignments` as the decoupled source of truth. It also reduces the chance that instructor and student feeds diverge again later.

**Concrete next steps:**

1. Add a shared exam-assignment predicate helper in `build-student-exam-scope-predicates.ts` that checks both `exam_assigned_sections` and `exam_section_assignments`.
2. Reuse that helper from `get-exams.ts` and, if needed, `get-exam-by-id.ts` so classroom, instructor, and student visibility all resolve from the same logic.
3. Lock the behavior with API and web regression tests that prove exams assigned through `exam_section_assignments` show up in the classroom and student feeds.

---

## Phase 1: Unify Exam Visibility Logic

**Goal:** Make every exam read path treat `exam_section_assignments` as a first-class classroom visibility source while preserving compatibility with `exam_assigned_sections`.

- [ ] Extract a shared assignment-visibility helper from `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` so classroom and student predicates can reuse the same `EXISTS` logic for both `exam_assigned_sections` and `exam_section_assignments`.
- [ ] Update `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` to call the shared helper inside `buildClassroomExamFilter` and `buildStudentExamVisibilityPredicate` instead of relying on the legacy table alone.
- [ ] Review `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` and align any remaining classroom-assignment checks with the same helper so detail views do not drift from list views.
- [ ] Extend `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` to cover a classroom assigned only through `exam_section_assignments`, plus a multi-section assignment case.
- [ ] Extend `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` and `app/sentinel-api/src/modules/examination/exams/data/get-exams-instructor-visibility.test.ts` to assert the compiled SQL includes the new assignment table in both classroom and student visibility branches.
- **Migration required:** No. This phase only changes query composition.

## Phase 2: Verify Assignment Write Paths

**Goal:** Confirm the section-assignment controllers and services persist the classroom links that the visibility layer expects, without duplicating the exam core record.

- [ ] Review `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignment.ts` and `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignments-batch.ts` to ensure single and batch assignment writes always store `exam_id`, `section_id`, `room_id`, `instructor_id`, and `scheduled_at` consistently.
- [ ] If any assignment fields are still being mapped through legacy assumptions, update `app/sentinel-api/src/modules/examination/section-assignments/section-assignments.service.ts` and the matching controller files so batch creation and updates remain compatible with the new visibility helper.
- [ ] Add or extend tests in `app/sentinel-api/src/modules/examination/section-assignments/controllers/create-exam-section-assignment.controller.test.ts` and `app/sentinel-api/src/modules/examination/section-assignments/controllers/create-exam-section-assignments-batch.controller.test.ts` to prove duplicate section assignments return `409` and valid multi-section assignments persist successfully.
- [ ] Add a service-level regression test for `app/sentinel-api/src/modules/examination/section-assignments/data/get-exam-section-assignments.ts` so readback of assigned classroom targets still returns the full section list after the write-path review.
- **Migration required:** No. The `exam_section_assignments` table already exists and is the intended persistence layer.

## Phase 3: Protect Student and Instructor Feeds

**Goal:** Make sure the UI surfaces the corrected backend data and keeps the instructor/student feeds in sync after assignment changes.

- [ ] Review `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` and `app/sentinel-web/src/app/(protected)/student/_lib/student-exam-listing.ts` to confirm the available-exams tab still derives from `useExamsQuery()` and renders exams returned through the repaired visibility logic.
- [ ] Add a regression test in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` that mocks an exam visible only through the classroom assignment path and asserts it appears in the `available` feed.
- [ ] Add or update a rendering test in `app/sentinel-web/src/app/(protected)/student/_lib/student-exam-listing.test.ts` to cover the grouped exam output when the backend returns section-assigned exams.
- [ ] Review `packages/hooks/src/query/exam-section-assignments/use-create-exam-section-assignment-mutation.ts`, `use-create-exam-section-assignments-batch-mutation.ts`, `use-update-exam-section-assignment-mutation.ts`, and `use-delete-exam-section-assignment-mutation.ts` to confirm the exam cache invalidations still refresh any open instructor dashboards after assignment edits.
- **Migration required:** No. This phase only adds UI-facing regression coverage and cache validation.

---

## Done Criteria

- Every task references a concrete file or function.
- Each phase includes at least one test task.
- The migration decision is explicit and consistent across the plan.
- The plan keeps the decoupled exam model intact and does not reintroduce duplicated exam records.

## Additional Considerations

- **Breaking API Changes:** None expected. The plan preserves the existing exam and assignment endpoints and only corrects their visibility behavior.
- **Environment Variables:** No new `.env` variables are needed.
- **Rollback Note:** If a future schema cleanup removes `exam_assigned_sections`, the shared helper can be simplified to `exam_section_assignments` only without changing the public API surface.

---

## Completion Notes

- Implemented the shared visibility predicate in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` so classroom and student feeds recognize both legacy and decoupled section assignments.
- Aligned `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` with the same assignment sources so detail views stay consistent with list views.
- Added regression coverage in the backend predicate tests, exam detail test, and student history hook test to protect the classroom-assignment visibility flow.
- Verified the touched Vitest suites passed after the fix.
