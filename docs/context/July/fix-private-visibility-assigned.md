# Context: Private exam visibility for assigned students, instructors, and admins

## Problem statement

Private exams that are explicitly assigned must remain visible to the assigned audience after publication, while staying hidden from unrelated users. The original issue text mixed student visibility, instructor visibility, and admin visibility into one matrix, but the current codebase treats these as different access paths:

- Students should see only published exams they are assigned to through enrollment, classroom assignment rows, legacy section assignment rows, or remediation schedules.
- Instructors and staff should see public exams in their institution, exams they created, exams assigned to them, proctor assignments, or exams shared with them.
- Private exams should not become globally visible just because they are published.

This note is meant to prepare an implementation plan. It records the current behavior, likely root causes, and the files that need focused inspection before changing code.

## Confirmed product rules

| Actor                       | Private + assigned + published                                                                                                           | Private + unassigned + published  | Public + unassigned + published                | Draft                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| Assigned/enrolled student   | Visible                                                                                                                                  | Not visible                       | Not visible to students unless assigned        | Not visible                                |
| Assigned instructor/proctor | Visible                                                                                                                                  | Not visible unless creator/shared | Visible in same institution                    | Staff-visible if list policy allows drafts |
| Other instructor            | Not visible unless shared/creator                                                                                                        | Not visible unless shared/creator | Visible in same institution                    | Staff-visible if list policy allows drafts |
| Admin                       | Needs product confirmation: current list behavior is scoped like staff + department; original report expects not visible unless assigned | Needs product confirmation        | Visible in same institution + department scope | Staff-visible if list policy allows drafts |

Important distinction: `is_public` is not the student access gate. Student access is assignment-scoped first, with a separate published/draft gate. A public but unassigned exam should not appear to unrelated students.

## Current code evidence

- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
    - Student list queries add `buildPublishedStudentExamPredicate()` and `buildStudentExamVisibilityPredicate()`.
    - Student queries select `e.is_public`, but do not require `e.is_public = true`.
    - Instructor/admin list queries include:
        - `e.is_public = true` in the active institution.
        - `e.created_by = instructorUserId`.
        - `exam_section_assignments.instructor_id = instructorUserId`.
        - `proctor_assignments.instructor_id = instructorUserId`.
        - `exam_shares.user_id = instructorUserId`.
- `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `buildPublishedStudentExamPredicate()` requires `published_at is not null` and `status <> 'draft'`.
    - `buildStudentExamVisibilityPredicate()` checks student enrollment and:
        - `e.class_group_id = enrolled class_group_id`.
        - exact `exam_section_assignments.class_group_id = enrolled class_group_id`.
        - legacy `exam_assigned_sections.section_id`.
        - section/subject fallback only when the exam has no explicit class-group assignment rows.
    - This file intentionally keeps private exams visible when assignment matches.
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
    - Student detail queries use the same published + assignment predicates as student list queries.
    - Instructor/admin detail reads are not filtered in this data function.
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exam.controller.ts`
    - Detail requests call `assertExamReadScope()` after retrieving an access record.
    - `assertExamReadScope()` currently blocks only `role === 'instructor'` for private exams the user did not create, is not assigned to, and is not shared with.
    - Admins are not blocked by this assertion, which may conflict with the original expected matrix if admins should not read private exams unless assigned/shared/creator.
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts`
    - `resolveAssessmentReadScope()` passes an `instructorUserId` for staff roles, including admins.
    - Admin list queries also receive `departmentId`, so admin list visibility is narrower than superadmin/support but still not identical to student visibility.
- `app/sentinel-api/src/modules/examination/exams/data/*.test.ts`
    - Existing tests already assert:
        - published private classroom-assigned exams remain visible to students.
        - public exams do not bypass assignment matching for students.
        - student detail queries do not require `e.is_public = true`.

## Likely root causes to verify

### Root cause candidate 1: stale or contradictory expected matrix

The current tests and predicates already encode the rule that private assigned exams are visible to assigned students. If the bug report expects private assigned exams to be hidden from students, the report is outdated or the product rule changed. Confirm this before planning implementation.

### Root cause candidate 2: detail endpoint leaks private exams to admins

The list query applies staff/admin visibility predicates, but the detail route depends on `assertExamReadScope()`. That assertion only blocks instructors. If the expected rule is "admins cannot see private exams unless creator/assigned/shared," then a private exam may be hidden from the admin list but still accessible by direct detail URL/API when the admin has institution-level read access.

Files to inspect/test:

- `app/sentinel-api/src/modules/examination/assessment/assessment-access.ts`
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exam.controller.ts`
- `app/sentinel-api/src/modules/examination/exams/controllers/get-exam.controller.test.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`

### Root cause candidate 3: assigned instructor path does not cover all assignment sources

Instructor list visibility checks `exam_section_assignments.instructor_id` and `proctor_assignments.instructor_id`. `assertExamReadScope()` checks `assigned_instructor_ids` from `getExamByIdData()`, which unions `exam_section_assignments` and `proctor_assignments`. If an instructor is assigned only through classroom ownership (`classroom_instructor_assignments`) or another legacy path, the instructor list/detail behavior may diverge.

Files to inspect/test:

- `app/sentinel-api/src/modules/examination/assign/services/exam-access.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
- `app/sentinel-api/src/modules/examination/reporting/services/get-reporting-exam-context.ts`
- `app/sentinel-api/src/modules/examination/grading/data/get-grading-exams.ts`

### Root cause candidate 4: bad assignment data, not bad privacy logic

Previous context in `docs/context/July/exam-not-showing-in-student.md` found exams where the denormalized `exams.class_group_id` existed but `exam_section_assignments`, `exam_assigned_sections`, `room_id`, and `scheduled_at` were missing. That would break assignment-scoped visibility regardless of `is_public`.

The implementation plan in `docs/task/2026-07-05/fix-002-implementation-plan-student-exam-assignment-visibility.md` appears to have addressed this by syncing canonical `exam_section_assignments` rows during create/update. Re-check whether the deployed environment includes that fix before planning more visibility changes.

Files to inspect/test:

- `app/sentinel-api/src/modules/examination/exams/services/create-exam.service.ts`
- `app/sentinel-api/src/modules/examination/exams/services/update-exam.service.ts`
- `app/sentinel-api/src/modules/examination/exams/services/resolve-classroom-assignment.service.ts`
- `app/sentinel-api/src/modules/examination/section-assignments/data/sync-exam-assignment-summary.ts`
- `app/sentinel-core/src/features/exams/config/_hooks/use-exam-create-form.ts`
- `app/sentinel-core/src/features/exams/config/_hooks/use-exam-edit-form.ts`

## Investigation checklist for implementation planning

- [ ] Confirm the product rule for admins:
    - Should admins see all private exams in their department/institution?
    - Or only private exams they created, are assigned to, or are explicitly shared on?
- [ ] Confirm whether this issue affects:
    - Student exam list.
    - Student exam detail/instruction/checkup.
    - Instructor dashboard.
    - Instructor assignment/grading/reporting.
    - Admin/core exam management list.
    - Direct detail URL/API access.
- [ ] Reproduce with one private, published, classroom-assigned exam:
    - Assigned student should see it in `/exams`, classroom page, and detail route.
    - Unassigned student should not see it and should not open it by ID.
    - Assigned instructor should see/open it.
    - Other instructor should not see/open it unless shared/creator.
    - Admin behavior should match the confirmed product rule.
- [ ] Run a database diagnostic for the test exam:
    - `exams.is_public`
    - `exams.status`
    - `exams.published_at`
    - `exams.class_group_id`
    - `exam_section_assignments.class_group_id`
    - `exam_section_assignments.instructor_id`
    - `proctor_assignments.instructor_id`
    - `exam_shares.user_id`
    - student `enrollments.class_group_id`
- [ ] Compare list and detail route behavior for the same actor and exam ID.
- [ ] Add missing tests before implementation if any of these actor/route combinations are untested.

## Phase 5 findings

- `createExam()` writes `exam_section_assignments` rows whenever classroom assignment targets resolve, regardless of whether the exam is public or private.
- `updateExam()` preserves existing `exam_section_assignments` rows and the denormalized assignment summary when the request only changes `isPublic`.
- `syncExamAssignmentSummary()` keeps `exams.class_group_id`, `section_id`, `section_name`, and `room_id` aligned to the earliest assignment row for the exam.

Diagnostic SQL for one affected exam ID:

```sql
select
    e.exam_id,
    e.is_public,
    e.status,
    e.published_at,
    e.class_group_id,
    esa.class_group_id as assignment_class_group_id,
    esa.section_id as assignment_section_id,
    esa.instructor_id as assignment_instructor_id,
    pa.instructor_id as proctor_instructor_id,
    es.user_id as shared_user_id,
    enr.student_id,
    enr.class_group_id as enrollment_class_group_id
from exams e
left join exam_section_assignments esa on esa.exam_id = e.exam_id
left join proctor_assignments pa on pa.exam_id = e.exam_id
left join exam_shares es on es.exam_id = e.exam_id
left join enrollments enr on enr.class_group_id = e.class_group_id
where e.exam_id = :exam_id;
```

## Suggested implementation-plan scope

The plan should not start by changing student visibility predicates unless reproduction proves students are still wrong. Current code and tests already say private assigned exams are student-visible.

Prioritize these plan areas:

1. Normalize the expected visibility matrix into role-specific rules.
2. Add missing direct-detail access tests for private exams, especially admin and unassigned staff.
3. If admin restriction is confirmed, update `assertExamReadScope()` or the detail data query so admin detail access follows the same private visibility rule as the list query.
4. If assigned instructor restriction is failing, unify staff access predicates between list/detail/grading/reporting instead of duplicating slightly different checks.
5. If reproduction shows missing assignment rows, treat it as assignment persistence/data repair and reference the existing July 5 assignment visibility plan.

## Acceptance criteria for the eventual fix

- Private, published, assigned exams are visible to the assigned student on list and detail surfaces.
- Private, published, unassigned exams are not visible to unrelated students and cannot be opened by direct ID.
- Public, published, unassigned exams are not visible to unrelated students.
- Private, published exams follow the confirmed staff/admin rule consistently on list and detail routes.
- Grading, reporting, monitoring, and assignment management use the same assigned-instructor semantics.
- Tests cover list and detail access for student, assigned instructor, unassigned instructor, admin, and shared user.
