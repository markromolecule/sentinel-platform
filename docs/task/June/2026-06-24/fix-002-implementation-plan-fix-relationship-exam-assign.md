# Fix 002 Implementation Plan: Fix Relationship Exam Assign

**Status:** Planned  
**Date:** 2026-06-24  
**Type:** fix  
**Scope:** `sentinel-api`, `sentinel-web`, `packages/shared`, `packages/services`, `packages/db`

## Pre-Planning

- **Summary of the Task:** Fix the exam assignment relationship so assigning an exam to a classroom persists a real classroom link and student exam feeds can query that assignment reliably.
- **Source Files Scanned:**
    - `docs/context/June/June 24/fix-relationship-exam-assign.md`
    - `.agents/rules/implementation-plan.md`
    - `.agents/rules/global/1-3-1-rule.md`
    - `.agents/workflows/to-do-workflow.md`
    - `packages/db/prisma/schema.prisma`
    - `packages/db/src/generated/types.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignments-batch.ts`
    - `app/sentinel-api/src/modules/examination/section-assignments/data/get-exam-section-assignments.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/new-assignments-builder.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/exam-section-assignment-list.tsx`
    - `packages/services/src/api/exam-section-assignments.ts`
    - `packages/shared/src/schema/exams/exam-section-assignment-schema.ts`
- **Files, Services, And DB Tables Touched:**
    - API assignment data/service/controller files under `app/sentinel-api/src/modules/examination/section-assignments`
    - API visibility predicates under `app/sentinel-api/src/modules/examination/exams/data`
    - Shared/service assignment DTOs under `packages/shared` and `packages/services`
    - Instructor assignment UI under `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components`
    - DB table: `exam_section_assignments`
    - Related DB tables: `exams`, `class_groups`, `sections`, `enrollments`, `students`, `subject_offerings`
- **Prisma Migration Needed:** Yes. The current `exam_section_assignments` table stores `section_id` but not `class_group_id`, while the product workflow assigns exams to classrooms.

## 1-3-1 Options

### Option 1: UI-Only Classroom Filtering

Keep the database section-based and restrict the assignment picker to classrooms matching the exam subject.

- **Tradeoff:** Fastest and low-risk, but it does not fix the durable relationship because assignments are still saved only by section.

### Option 2: Add `class_group_id` To Exam Section Assignments

Add a nullable `class_group_id` to `exam_section_assignments`, write it during assignment, and update student/classroom visibility to prefer exact classroom matches with section fallback for old data.

- **Tradeoff:** Requires a migration and DTO updates, but it directly fixes the relationship model while staying backward-compatible.

### Option 3: Replace Section Assignments With A New Exam-Classroom Assignment Table

Create a new `exam_classroom_assignments` table and migrate reads/writes to it, leaving `exam_section_assignments` for room/proctor metadata only.

- **Tradeoff:** Cleanest long-term model, but larger migration and more code churn than needed for this bug.

## Best Option

Choose **Option 2**.

It matches the intended workflow, fixes the current ambiguity, and avoids a disruptive table replacement. The implementation remains backward-compatible by keeping `section_id` and supporting existing rows while new assignments persist `class_group_id`.

**Concrete next steps:**

1. Add `class_group_id` to `exam_section_assignments` with a foreign key to `class_groups`.
2. Update assignment request/response DTOs so the web client sends `classGroupId` alongside `sectionId`.
3. Update assignment writes, reads, and visibility predicates to prefer exact classroom assignment matches.
4. Add regression tests for assignment write/read, student visibility, and instructor assignment UI.

## Phase 1: Add Classroom Identity To Assignments

**Goal:** Make `exam_section_assignments` able to persist the classroom actually selected by the instructor.

- [x] Add a Prisma migration under `packages/db/prisma/migrations/*_add_exam_assignment_class_group_id/migration.sql` that adds nullable `class_group_id uuid` to `exam_section_assignments`, references `class_groups(class_group_id)`, and adds an index on `class_group_id`.
- [x] Update `packages/db/prisma/schema.prisma` `exam_section_assignments` model with `class_group_id`, relation to `class_groups`, and an index.
- [x] Update `packages/db/src/generated/types.ts` or run the repo's DB type generation workflow if this project expects generated Kysely types to be committed.
- [x] Add a migration rollback note: drop the `class_group_id` foreign key, index, and column; no existing section-based assignment rows are deleted.
- [x] Add a migration verification test or schema compatibility assertion if the repo has a DB-schema test pattern for generated types.
- **Migration required:** Yes — the current table cannot represent an exact classroom assignment.
<!-- NOTE: Rollback for Phase 1: drop constraint `exam_section_assignments_class_group_id_fkey`, drop index `exam_section_assignments_class_group_id_idx`, then drop column `class_group_id`. Existing section-based assignment rows remain intact. -->
<!-- NOTE: Schema compatibility assertion for Phase 1 uses `prisma validate` plus committed Kysely type regeneration because no dedicated DB-schema test pattern was found in the scanned files. -->
<!-- NOTE: `pnpm exec prisma migrate dev --name add_exam_assignment_class_group_id --create-only` reached the configured remote datasource but returned a schema engine error, so the migration SQL was authored manually and then checked with `prisma validate` and `prisma generate`. -->

## Phase 2: Update Assignment API Contracts And Persistence

**Goal:** Write and read `classGroupId` through the section assignment API without breaking existing section-only rows.

- [x] Update `packages/shared/src/schema/exams/exam-section-assignment-schema.ts` so `examSectionAssignmentSchema` and `createExamSectionAssignmentBodySchema` include optional `classGroupId`.
- [x] Update `packages/services/src/api/exam-section-assignments.ts` so `ExamSectionAssignmentRecord` and `CreateExamSectionAssignmentPayload` include `classGroupId?: string | null`.
- [x] Update `app/sentinel-api/src/modules/examination/section-assignments/data/create-exam-section-assignment.ts` and `create-exam-section-assignments-batch.ts` to insert `class_group_id` when provided.
- [x] Update `app/sentinel-api/src/modules/examination/section-assignments/data/get-exam-section-assignments.ts` to return `classGroupId`, and join `class_groups` when needed for classroom display metadata.
- [x] Update `app/sentinel-api/src/modules/examination/section-assignments/data/update-exam-section-assignment.ts` only if update payloads should be allowed to move an assignment to a different classroom; default behavior: do not allow classroom changes through update, only room/proctor/schedule changes.
- [x] Add or update tests for `createExamSectionAssignmentsBatch` to assert `class_group_id` is persisted with `section_id`.
- [x] Add or update tests for `getExamSectionAssignments` to assert `classGroupId` is returned and legacy rows with null `class_group_id` still read successfully.
- **Migration required:** No additional migration in this phase — it consumes the Phase 1 schema.
<!-- NOTE: Phase 2 validation passed for targeted Vitest coverage in `create-exam-section-assignments-batch.test.ts` and `get-exam-section-assignments.test.ts`, plus `packages/shared` and `packages/services` TypeScript builds. -->
<!-- NOTE: `pnpm --dir app/sentinel-api run typecheck` still reports many pre-existing workspace errors, including older controller tests under `src/modules/examination/section-assignments/tests`, but it did not surface errors in the Phase 2 source files changed here. -->

## Phase 3: Make Student Visibility Prefer Exact Classroom Assignments

**Goal:** Ensure student and classroom exam feeds query by actual classroom assignment before falling back to section compatibility.

- [x] Update `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` so assignment visibility checks match `exam_section_assignments.class_group_id = class_groups.class_group_id` first.
- [x] Keep legacy fallback matching through `section_id` for rows where `class_group_id is null`.
- [x] Update `buildAssignedSectionIdsSelect()` or add a companion classroom aggregation helper if API responses need assigned classroom IDs.
- [x] Review `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` and `get-exam-by-id.ts` to ensure classroom-scoped and student-scoped queries use the updated helper consistently.
- [x] Update `app/sentinel-api/src/modules/examination/access/data/entitlements.repository.ts` if attempt-start eligibility still relies only on assigned section IDs; make it accept exact classroom assignment matches as eligible.
- [x] Add tests in `build-student-exam-scope-predicates.test.ts` for exact `class_group_id` assignment, legacy section fallback, and non-matching classroom hidden.
- [x] Add or update tests in `access.test.ts` to prove a student enrolled in the assigned classroom is eligible and a student in another classroom with the same section is not.
- **Migration required:** No additional migration — query behavior uses the new nullable column.
<!-- NOTE: Phase 3 kept `buildAssignedSectionIdsSelect()` as-is because student/access consumers only needed exact-classroom matching in predicates; no assigned-classroom response payload was required yet. -->
<!-- NOTE: `get-exams.ts` and `get-exam-by-id.ts` already route student/classroom visibility through the shared predicate helper, so no source edits were needed there after review. -->
<!-- NOTE: `EntitlementsRepository.hasStudentExamEnrollment()` already gives `classGroupId` precedence over section fallback, so no repository code change was needed in Phase 3; access tests were updated to lock that behavior in. -->
<!-- NOTE: Focused validation passed with `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts src/modules/examination/access/access.test.ts --reporter=verbose`. -->
<!-- NOTE: The ad hoc `tsc --noEmit` file-target check remains noisy in this workspace due pre-existing config/module-resolution issues outside this feature area, so Phase 3 acceptance is based on focused Vitest coverage plus source review. -->

## Phase 4: Update Instructor Assignment UI To Send Classroom IDs

**Goal:** Make the instructor assignment page send the selected classroom identity, not only the selected section.

- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/assign/_components/types.ts` so assignment rows retain both `classroomId` and `sectionId`.
- [x] Update `new-assignments-builder.tsx` so `handleSubmit()` sends `classGroupId: row.classroomId` and `sectionId: row.sectionId`.
- [x] Keep subject-scoped classroom querying in `new-assignments-builder.tsx`; do not fall back to unrelated classrooms when an exam has a `subjectId`.
- [x] Update `exam-section-assignment-list.tsx` to resolve existing rows by `assignment.classGroupId` first, with section fallback for legacy rows.
- [x] Update `assignment-content.tsx` to continue passing the selected exam subject into the assignment list and dialog.
- [x] Add or update `exam-section-assignment-list.test.tsx` to assert the batch payload includes `classGroupId`, subject-scoped classroom selection is enforced, and assignment display resolves by classroom ID when available.
- **Migration required:** No — UI contract changes consume the API schema from Phase 2.

## Phase 5: Regression Validation And Data Repair Guidance

**Goal:** Prove the end-to-end assignment relationship works and document how to handle old wrong-target assignments.

- [x] Add or update a service-level test in `app/sentinel-api/src/modules/examination/exams/services/get-exams.test.ts` proving a published exam assigned to a classroom appears in the enrolled student's `/exams` feed.
- [x] Add or update `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.test.tsx` to assert an active exam returned for that classroom renders in Class Assessments.
- [x] Add or update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` to assert the assigned exam appears in Available.
- [x] Run `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts src/modules/examination/access/access.test.ts src/modules/examination/exams/services/get-exams.test.ts --reporter=verbose`.
- [x] Run `pnpm --dir app/sentinel-web exec vitest run "src/app/(protected)/(instructor)/exams/assign/_components/exam-section-assignment-list.test.tsx" "src/app/(protected)/student/classroom/[id]/page.test.tsx" "src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts" --reporter=verbose`.
- [x] Document that pre-existing section-only rows remain supported, but previously misassigned rows should be deleted and recreated so they receive `class_group_id`.
- **Migration required:** No additional migration — validation and operational guidance only.
<!-- NOTE: Regression validation passed with the targeted API Vitest suite for predicate, access, and student feed coverage, and the targeted web Vitest suite for instructor assignment UI, classroom page, and available-history surfaces. -->
<!-- NOTE: Pre-existing section-only rows remain readable because Phase 3 preserves `section_id` fallback when `class_group_id` is null. Rows that were historically assigned to the wrong classroom should be deleted and recreated so the new `class_group_id` column is populated with the exact classroom. -->

## Public API / Type Changes

- Add optional `classGroupId?: string | null` to exam section assignment request and response types.
- Preserve existing `sectionId`, `roomId`, `instructorId`, and `scheduledAt` fields.
- No endpoint path changes.
- No breaking API changes expected because `classGroupId` is additive and nullable.

## Done Criteria

- [x] New exam classroom assignments persist `exam_section_assignments.class_group_id`.
- [x] Student exam feeds match exact classroom assignment first.
- [x] Legacy section-only assignment rows still work.
- [x] A student in another classroom with the same section does not receive the exam unless their classroom is assigned.
- [x] Instructor assignment UI sends `classGroupId` in batch create payloads.
- [x] Available tab and classroom page both show assigned, published, active/upcoming exams.
- [x] Targeted API and web Vitest suites pass.
- [x] Migration rollback note is documented.

## Additional Considerations

- **Breaking API Changes:** None planned. `classGroupId` is additive and nullable.
- **Environment Variables:** No new `.env` variables required.
- **Backfill Default:** Do not auto-backfill ambiguous section-only rows. Only exact matches where an assignment can be uniquely resolved to one class group should be backfilled if a data repair script is later requested.
- **Rollback Note:** Rollback is schema-safe because existing section-based reads remain available; revert code changes first, then drop `class_group_id` constraints/index/column.
