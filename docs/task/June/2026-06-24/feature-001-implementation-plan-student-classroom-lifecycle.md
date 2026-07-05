# Student Classroom Lifecycle Implementation Plan

## Task Summary

Ensure archived classrooms are hidden from the student classroom experience, keep only active classrooms visible to students, and make classroom deletion remove classroom-owned exam data instead of leaving orphaned or detached records.

## Pre-Planning Summary

- Relevant archive visibility source:
    - `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts`
    - `app/sentinel-api/src/modules/identity/enrollments/controllers/get-student-classrooms.controller.ts`
    - `app/sentinel-web/src/app/(protected)/student/classroom/_components/classroom-view.tsx`
    - `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx`
- Relevant classroom lifecycle source:
    - `app/sentinel-api/src/modules/core/classroom/controllers/archive-classroom.controller.ts`
    - `app/sentinel-api/src/modules/core/classroom/controllers/unarchive-classroom.controller.ts`
    - `app/sentinel-api/src/modules/core/classroom/controllers/delete-classroom.controller.ts`
    - `app/sentinel-api/src/modules/core/classroom/classroom.service.ts`
    - `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts`
- Relevant exam ownership and student visibility source:
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/delete-exam.ts`
    - `packages/db/prisma/schema.prisma`
    - `packages/db/prisma/migrations/20260419100000_add_classroom_foundation/migration.sql`
- Primary DB tables involved:
    - `class_groups`
    - `enrollments`
    - `exams`
    - `exam_section_assignments`
    - `exam_assigned_sections`
    - `exam_attempts`
    - child exam tables that already cascade from `exams`
- Prisma migration needed:
    - `Yes`, if the team decides classroom-owned exams must be deleted automatically at the database level because `exams.class_group_id` currently uses `ON DELETE SET NULL`, not `ON DELETE CASCADE`.

## Viable Options

### Option 1: UI Filter Only

- [ ] Filter archived classrooms only in `app/sentinel-web/src/app/(protected)/student/classroom/_components/classroom-view.tsx` by excluding rows with an archived marker once the API exposes it.
- [ ] Leave student classroom API, exam visibility queries, and classroom deletion semantics unchanged.
- [ ] Add UI tests in `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx` and a new test beside `classroom-view.tsx`.
      **Tradeoff:** Fastest option, but archived classrooms can still leak from the API and classroom-owned exams still survive deletion.
      **Migration required:** No — this is presentation only.

### Option 2: API-Level Active Classroom Filtering Plus Application-Layer Classroom-Owned Exam Cleanup

- [ ] Filter archived classrooms at the source in `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts`.
- [ ] Keep the student UI unchanged except for tests because the list/detail pages already consume the filtered classroom payload.
- [ ] Extend `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` to explicitly find and delete classroom-owned exams before deleting the classroom.
- [ ] Reuse existing exam deletion data/services where possible so classroom deletion follows the same cleanup path as manual exam deletion.
- [ ] Add focused service and controller tests for archived classroom visibility and classroom delete cleanup.
      **Tradeoff:** Best fit for the current codebase because it fixes the data source and delete behavior without forcing a risky FK change on possibly shared exam records.
      **Migration required:** No — ownership cleanup is handled safely in application code.

### Option 3: API-Level Filtering Plus Database Cascade for Classroom-Owned Exams

- [ ] Filter archived classrooms in `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts`.
- [ ] Add a Prisma migration that changes `exams.class_group_id` foreign key from `ON DELETE SET NULL` to `ON DELETE CASCADE`.
- [ ] Audit `exam_section_assignments.class_group_id` and related relations to ensure classroom deletion also removes classroom assignment rows consistently.
- [ ] Add regression tests for migration-backed cascade behavior.
      **Tradeoff:** Strongest database enforcement, but riskiest because some exams may be shared or legacy-linked and a cascade could delete more than intended.
      **Migration required:** Yes — FK behavior must change in Prisma schema and SQL migration.

## Best Option

Option 2 is the best fit.

Why:

1. It hides archived classrooms where the student data is sourced, so every consumer of `/enrollments/student/classrooms` gets the correct active-only behavior.
2. It avoids changing a sensitive foreign key from `SET NULL` to `CASCADE` before the team fully confirms that every exam with `class_group_id` is truly classroom-owned and never shared.
3. It keeps deletion semantics explicit in the service layer, which matches the current codebase style and is easier to test with Vitest.

## Concrete Next Steps

1. Add active-only filtering to the student classroom query in `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts`.
2. Add API tests proving archived classrooms no longer appear in `/enrollments/student/classrooms`.
3. Audit classroom-owned exam identification rules in `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` and `app/sentinel-api/src/modules/examination/exams/data/*`.
4. Implement explicit classroom-owned exam deletion before `class_groups` deletion.
5. Add service tests proving classroom deletion removes owned exams and related assignment rows.
6. Add student page tests proving archived classrooms are not reachable from the list/detail flow.

## Phase 1 Implementation Notes

- Classroom-owned exam rule:
    - Treat an exam as classroom-owned only when `public.exams.class_group_id` directly equals the classroom being deleted.
    - Treat `exam_section_assignments.class_group_id` as an assignment-scoping link, not automatic ownership, because one exam can be assigned to multiple classrooms or sections.
    - When deleting a classroom, delete directly owned exams first, then separately clean up surviving `exam_section_assignments` rows that still point at the deleted classroom.
- Migration audit result:
    - `packages/db/prisma/schema.prisma` models `exams.class_group_id` without `onDelete: Cascade`.
    - `packages/db/prisma/migrations/20260419100000_add_classroom_foundation/migration.sql` explicitly sets the FK to `ON DELETE SET NULL`.
- Student exam visibility audit result:
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` currently joins `class_groups as student_cg` without excluding archived classrooms, so archived enrollments can still influence the broader student exam feed until Phase 4.

## Phase 1: Lock Down Ownership and Active Visibility Rules

**Goal:** Define the exact lifecycle behavior before touching delete semantics.

- [x] Document the ownership rule for a "classroom-owned exam" in `docs/task/2026-06-24/feature-001-implementation-plan-student-classroom-lifecycle.md` using the existing data model in `packages/db/prisma/schema.prisma`.
- [x] Audit `packages/db/prisma/schema.prisma` and `packages/db/prisma/migrations/20260419100000_add_classroom_foundation/migration.sql` to confirm `exams.class_group_id` currently uses `ON DELETE SET NULL`.
- [x] Audit `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` to note whether archived classrooms can still influence student exam visibility outside the classroom page.
- [x] Write or update a schema/query-focused test in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` covering archived classroom expectations if the exam feed is in scope.
      **Migration required:** No — this phase is behavior definition and test coverage.

## Phase 2: Hide Archived Classrooms From Student Classroom Surfaces

**Goal:** Ensure students only receive active classrooms from the backend and therefore only see active classrooms in the student classroom list and detail pages.

- [x] Update `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts` to add `cg.archived_at is null` to the enrolled classroom query.
- [x] Keep the contract in `app/sentinel-api/src/modules/identity/enrollments/controllers/get-student-classrooms.controller.ts` unchanged unless the response shape needs an explicit active-only note in the route description.
- [x] Verify `app/sentinel-web/src/app/(protected)/student/classroom/_components/classroom-view.tsx` continues to work with the filtered dataset and does not add client-side archive exceptions.
- [x] Verify `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx` correctly falls back to "Classroom not found" when an archived classroom id is requested directly.
- [x] Add a data-layer or service test next to `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts` proving archived classrooms are excluded while active enrolled classrooms remain visible.
- [x] Add or update UI tests in `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx` and create a companion test for `app/sentinel-web/src/app/(protected)/student/classroom/_components/classroom-view.tsx` proving only active classrooms render.
      **Migration required:** No — `archived_at` already exists on `class_groups`.

## Phase 3: Implement Explicit Classroom-Owned Exam Cleanup On Classroom Delete

**Goal:** Make classroom deletion remove classroom-owned exam data before the classroom row is deleted.

- [x] Update `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` so `deleteClassroom()` resolves classroom-owned exams before deleting the classroom record.
- [x] Reuse or extend existing exam deletion logic in `app/sentinel-api/src/modules/examination/exams/data/delete-exam.ts` or the exam service layer so classroom deletion triggers the same downstream cleanup path instead of open-coding exam table deletions.
- [x] Define concrete ownership matching in `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` for exams tied by `exams.class_group_id = classGroupId`, and explicitly decide how `exam_section_assignments.class_group_id = classGroupId` should be treated when an exam is assigned to multiple classrooms.
- [x] Ensure related classroom assignment rows in `exam_section_assignments` are deleted or cleaned up before removing the classroom when the exam itself should survive under the ownership rule.
- [x] Preserve the existing permission gate in `app/sentinel-api/src/modules/core/classroom/controllers/delete-classroom.controller.ts` and restrict the change to delete semantics, not route access.
- [x] Add service tests in `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.test.ts` for:
- [x] classroom deletion removing classroom-owned exams,
- [x] classroom deletion not deleting exams that are merely section-linked or shared with other classrooms,
- [x] classroom deletion still deleting the classroom when no exams are attached.
- [x] Add controller-level regression coverage in `app/sentinel-api/src/modules/core/classroom/controllers/delete-classroom.controller.test.ts` if the service contract or error handling changes.
      <!-- NOTE: No delete-classroom controller test was added in Phase 3 because the controller contract, permission gate, and error handling shape were unchanged; the behavior change is contained within the classroom write service. -->
      **Migration required:** No for Option 2 — cleanup is enforced in application code. Yes only if the team later upgrades to DB-level cascade.

## Phase 4: Align Student Exam Visibility With Archived Classroom Rules

**Goal:** Prevent archived classrooms from surfacing student-facing assessments in ways that contradict the active-only classroom list.

- [x] Review `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` and `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` to decide whether archived classroom enrollments should also be excluded from the student exams feed.
- [x] If in scope, update the student exam visibility predicate to ignore `student_cg` rows where `student_cg.archived_at is not null`.
- [x] Verify `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx` still matches exams correctly after backend visibility tightening.
- [x] Add or update tests in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` and `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx` for archived classroom exam visibility.
      **Migration required:** No — query logic only.

## Phase 5: Documentation, QA, and Rollout Safety

**Goal:** Leave a clear paper trail and verify the lifecycle behavior end to end.

- [x] Update route and service JSDoc in `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts` and `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts` for the new active-only and cleanup behavior.
- [x] Add an implementation note in `docs/task/2026-06-24/feature-001-implementation-plan-student-classroom-lifecycle.md` summarizing the final ownership rule chosen for classroom-owned exams.
- [x] Run focused Vitest suites for:
- [x] `app/sentinel-api/src/modules/identity/enrollments/...`
- [x] `app/sentinel-api/src/modules/core/classroom/...`
- [x] `app/sentinel-api/src/modules/examination/exams/...`
- [x] `app/sentinel-web/src/app/(protected)/student/classroom/...`
- [x] Perform manual verification of:
- [ ] active classroom visible on `/student/classroom`,
- [ ] archived classroom hidden from `/student/classroom`,
- [ ] direct visit to archived classroom detail blocked,
- [ ] deleting a classroom removes its owned exam data.
      <!-- NOTE: Manual verification could not be completed in this session because HTTP checks to localhost:3000 and localhost:3001 were unavailable from the shell environment. -->
      **Migration required:** No for Option 2.

## Additional Considerations

- Breaking API changes:
    - No route shape change is required for Option 2, but behavior changes because `/enrollments/student/classrooms` will become active-only.
- New environment variables:
    - None expected.
- Migration rollback note:
    - If the team later chooses Option 3, add a rollback migration that restores `exams.class_group_id` from `ON DELETE CASCADE` back to `ON DELETE SET NULL` and document how to recover accidentally cascaded exam rows from backup.

## Final Implementation Note

- Final ownership rule used in implementation:
    - Delete a classroom-owned exam only when `exams.class_group_id` directly points to the classroom being deleted.
    - Do not treat `exam_section_assignments.class_group_id` as ownership by itself; those rows are cleaned up separately so shared or section-assigned exams are preserved.

## Done Criteria

- [x] Archived classrooms are excluded by the query in `app/sentinel-api/src/modules/identity/enrollments/data/get-student-classrooms.ts`.
- [x] Student classroom list and detail tests prove only active classrooms are visible/reachable.
- [x] Classroom deletion explicitly handles classroom-owned exams in `app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts`.
- [x] Tests prove classroom delete cleanup removes owned exams without over-deleting shared exam records.
- [x] Migration decision is documented and remains explicit in the implementation notes.
