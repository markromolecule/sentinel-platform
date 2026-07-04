# Fix 002 Implementation Plan: Student Exam Visibility And Availability

**Status:** Completed
**Date:** 2026-06-23
**Type:** fix
**Scope:** `sentinel-api`, `sentinel-web`, `packages/services`, `packages/shared`

## Task Summary

Published exams assigned to a student's classroom must appear on the student side, while the Available tab must show only currently available/upcoming/in-progress exams and must not leak archived exams.

## Post-Completion Follow-Up: 2026-06-24

- A follow-up regression was reported after the original completion mark:
    - Published exams could still disappear from student classroom and Available surfaces.
    - The instructor Assignments selector still excluded published exams because it queried only `draft` exams.
- Follow-up remediation was applied without adding a migration:
    - Relaxed explicit assignment visibility predicates so `exam_section_assignments` can make a classroom/student exam visible even when subject linkage is inconsistent.
    - Added student-side status normalization for raw internal statuses such as `published` before filtering active classroom and Available feeds.
    - Removed the draft-only filter from the instructor assignment selector so published exams remain manageable on the Assignments page.
    - Tightened the instructor classroom assignment flow so subject-scoped exams no longer fall back to unrelated classrooms when no subject match exists.
    - Updated the instructor assignment list to resolve classroom names within the same exam subject scope to reduce section-only ambiguity.
- Follow-up validation completed:
    - `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts --reporter=verbose`
    - `pnpm --dir app/sentinel-web exec vitest run "src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts" "src/app/(protected)/student/classroom/[id]/page.test.tsx" "src/app/(protected)/(instructor)/exams/assign/_components/assignment-content.test.tsx" --reporter=verbose`

## Investigation Summary

- Instructor screenshot shows a published private exam assigned to `ETHICS / INF232`, but the student side still does not show it in the active exam surfaces.
- Current student visibility list path is `GET /exams` through `getExamsData()` and `buildStudentExamVisibilityPredicate()`.
- Current student access path is `EntitlementsRepository.getExamAccessPolicy()` plus `hasStudentExamEnrollment()`.
- `getExamsData()` was updated to read both `exam_assigned_sections` and `exam_section_assignments`, but `EntitlementsRepository.getExamAccessPolicy()` still aggregates only `exam_assigned_sections`.
- The student Available tab currently includes `archived` in `useStudentHistory()`, which directly causes archived exams to show in Available.
- The student classroom detail page renders all exams returned by `useExamsQuery({ classroomId })` without an active/history split, so archived classroom exams appear beside active assessments.
- `packages/services/src/api/exams/mappers.ts` reads `apiExam.assigned_section_ids`, while the API mapper emits `sectionIds`; this can drop assigned section metadata on the web client.

## Files, Services, And Tables

**API files**

- `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
- `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts`
- `app/sentinel-api/src/modules/examination/access/data/entitlements.repository.ts`
- `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts`
- `app/sentinel-api/src/modules/examination/access/services/validate-basic-eligibility.ts`

**Web and shared files**

- `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
- `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts`
- `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx`
- `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts`
- `packages/services/src/api/exams/mappers.ts`
- `packages/services/src/api/exams/types.ts`
- `packages/shared/src/exams/resolve-exam-status.ts`

**DB tables**

- `exams`
- `exam_assigned_sections`
- `exam_section_assignments`
- `students`
- `enrollments`
- `class_groups`
- `subject_offerings`
- `sections`
- `exam_attempts`

**Migration required:** No. The required data already exists in `exam_section_assignments` and `exam_assigned_sections`; the issue is inconsistent read/query behavior and UI filtering.

## Visibility Matrix To Preserve

| Exam visibility | Assignment state                        | Student result                                                                                    |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Private         | Assigned to student's class/section     | Visible when published and active/upcoming; eligible if schedule/runtime allows                   |
| Private         | Not assigned to student's class/section | Hidden and ineligible                                                                             |
| Public          | Assigned to student's class/section     | Visible when published and active/upcoming; eligible if schedule/runtime allows                   |
| Public          | Not assigned to student's class/section | Hidden from student exam surfaces unless product explicitly defines public student browsing later |

## Three Viable Options

### Option 1: Frontend-only filtering fix

Remove `archived` from Available tab filters and filter archived cards out of classroom active assessments.

**Tradeoff:** Fastest fix for the archived leak, but it will not solve missing assigned private exams if the API/access predicates are still inconsistent.

### Option 2: Unify backend assignment reads and tighten frontend tabs

Create a single backend assignment-scope helper used by exam list, exam detail, and student eligibility; then make student Available/Classroom pages consume only active student statuses.

**Tradeoff:** Moderate scope, but it fixes the actual visibility contract across list, detail, and attempt-start paths.

### Option 3: Add a dedicated student exam feed endpoint

Build a new endpoint such as `GET /student/exams` that returns `{ available, pastDue, turnedIn, classroomAssessments }` with one backend-owned visibility policy.

**Tradeoff:** Clean long-term API boundary, but larger surface area and more migration work from existing hooks/pages.

## Best Option

Choose **Option 2**.

It fits the current codebase because the existing `GET /exams` and student pages already depend on the same exam DTOs and hooks. The main problem is not missing infrastructure; it is drift between assignment tables, student eligibility, service mapping, and UI filters. Option 2 fixes that drift without adding a new endpoint or changing product routing.

## Concrete Numbered Next Steps

1. Revert the Available-tab inclusion of `archived` and encode active student statuses in one shared helper.
2. Update backend student access/eligibility to aggregate assigned sections from both `exam_assigned_sections` and `exam_section_assignments`.
3. Align service DTO mapping so web clients read `sectionIds` consistently from the API response.
4. Add tests for the private/public plus assigned/unassigned matrix.
5. Validate with targeted API and web Vitest runs.

## Phase 1: Restore Available Tab Semantics

**Goal:** Ensure Available shows only active student exam states and no archived exams.

- [x] Update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` to remove `exam.status === 'archived'` from the Available-tab filter.
- [x] Add or reuse a local predicate in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` for active statuses: `available`, `upcoming`, and `in-progress`.
- [x] Update `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` so archived exams are excluded from Available and `past_due` remains excluded.
- [x] Review `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts` and remove archived fallback if that hook is still wired anywhere.
- [x] Write tests for `app/sentinel-web/src/app/(protected)/student/exam/_hooks/use-exam-list.ts` only if the hook is still used by a rendered route.
  <!-- NOTE: No new useExamList test was added because current repo search shows no rendered student route consuming this hook. -->

**Migration required:** No — this is UI filtering only.
**Migration applied:** No — UI filtering only.
**Breaking changes:** No.

## Phase 2: Unify Student Assignment Visibility

**Goal:** Make list, detail, and eligibility checks agree on assignments written to either assignment table.

- [x] Extract an assignment-section aggregation helper in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` or a nearby data helper file so both `exam_assigned_sections` and `exam_section_assignments` are consistently represented.
- [x] Update `app/sentinel-api/src/modules/examination/access/data/entitlements.repository.ts` `getExamAccessPolicy()` to aggregate assigned section ids from both `exam_assigned_sections` and `exam_section_assignments`.
- [x] Update `app/sentinel-api/src/modules/examination/access/services/evaluate-student-exam-eligibility.service.ts` only if the returned entitlement shape needs `sectionIds` normalization after the repository change.
  <!-- NOTE: No evaluate-student-exam-eligibility.service.ts code change was required because the existing service already passes through assigned_section_ids from the repository response. -->
- [x] Add tests in `app/sentinel-api/src/modules/examination/access/access.test.ts` or a co-located repository test to prove a student enrolled in a section assigned through `exam_section_assignments` is eligible.
- [x] Add tests in `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` covering private assigned, private unassigned, public assigned, and public unassigned SQL intent.

**Migration required:** No — this reuses existing assignment tables.
**Migration applied:** No — existing assignment tables were reused.
**Breaking changes:** No.

## Phase 3: Align API DTO And Web Service Mapping

**Goal:** Preserve assigned section metadata from API response through the web service mapper.

- [x] Update `packages/services/src/api/exams/types.ts` to include `sectionIds?: string[]` and keep `assigned_section_ids?: string[] | null` only if legacy responses still exist.
- [x] Update `packages/services/src/api/exams/mappers.ts` so `mapExam()` reads `apiExam.sectionIds ?? apiExam.assigned_section_ids ?? []`.
- [x] Add or update `packages/services/src/api/exams/mappers.test.ts` to assert `sectionIds` is preserved for student exam cards and classroom filters.
- [x] Confirm `app/sentinel-api/src/modules/examination/exams/services/map-exam-response.ts` remains the source of `sectionIds` and `sectionNames` for student and instructor responses.

**Migration required:** No — DTO mapping only.
**Migration applied:** No — DTO mapping only.
**Breaking changes:** No.

## Phase 4: Separate Classroom Active Assessments From Historical Exams

**Goal:** Prevent archived classroom exams from appearing as active class assessments while preserving a path to history.

- [x] Update `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx` to filter `filteredExams` to active statuses for the Class Assessments grid.
- [x] Decide whether archived classroom exams should be hidden entirely on this page or moved to a clearly labeled historical section; implement only the selected behavior.
  <!-- NOTE: Archived classroom exams are now hidden entirely from the active Class Assessments grid on the classroom page. -->
- [x] Add a co-located test for `app/sentinel-web/src/app/(protected)/student/classroom/[id]/page.tsx` or extract a testable filter helper if the page test setup is heavy.
- [x] Verify `app/sentinel-web/src/app/(protected)/student/exam/_components/exam-card.tsx` still handles archived cards for history/detail contexts, even if archived cards are no longer shown in Available.

**Migration required:** No — presentation behavior only.
**Migration applied:** No — presentation behavior only.
**Breaking changes:** No.

## Phase 5: Regression Coverage And Validation

**Goal:** Lock the student visibility contract with targeted tests and documented validation commands.

- [x] Add or update `app/sentinel-api/src/modules/examination/exams/services/get-exams.test.ts` to cover student list behavior for published assigned private exams.
- [x] Add or update `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts` to cover student detail visibility through `exam_section_assignments`.
- [x] Run `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts src/modules/examination/exams/data/get-exam-by-id.test.ts src/modules/examination/exams/services/get-exams.test.ts --reporter=verbose`.
- [x] Run `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/access/access.test.ts --reporter=verbose`.
- [x] Run `pnpm --dir app/sentinel-web exec vitest run "src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts" --reporter=verbose`.
- [x] Run `pnpm --dir app/sentinel-web exec vitest run "src/app/(protected)/student/exam/_components/exam-card.test.tsx" --reporter=verbose`.
- [x] Run `pnpm --dir packages/services exec vitest run src/api/exams/mappers.test.ts --reporter=verbose` if package-local scripts support it; otherwise run the equivalent workspace Vitest command.
  <!-- NOTE: access.test.ts still emits non-failing telemetry log warnings because the suite uses a stub dbClient without LogsService query support. -->

**Migration required:** No — regression validation only.
**Migration applied:** No — regression validation only.
**Breaking changes:** No.

## Breaking API Changes

- None planned. The plan preserves the existing `/exams` endpoint and response shape while making `sectionIds` mapping backward-compatible with `assigned_section_ids`.

## Environment Variables

- No new `.env` variables required.

## Rollback Note

- No Prisma migration is planned. Rollback is code-only: revert predicate/helper changes, mapper changes, and student page filters.

## Done Criteria

- [x] A published private exam assigned through `exam_section_assignments` appears for enrolled students in Available when active/upcoming.
- [x] A published private exam not assigned to the student's class/section does not appear and fails eligibility.
- [x] A public assigned exam follows the same student enrollment rules as a private assigned exam.
- [x] A public unassigned exam does not appear in student exam surfaces unless a future product rule explicitly changes public browsing.
- [x] Archived exams do not show in the Available tab.
- [x] Archived classroom exams do not appear as active Class Assessments.
- [x] Student detail/attempt eligibility agrees with student list visibility.
- [x] Targeted API, web, and service mapper tests pass.
