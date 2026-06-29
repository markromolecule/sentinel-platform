# Implementation Plan: Hide Archived Classrooms From Instructor Students View

**Task Summary:** Fix the instructor `Students` page so archived classrooms no longer keep students visible incorrectly. A student should remain on the page as long as the instructor still has at least one non-archived classroom enrollment for that student. Archived classroom/subject assignments should be removed from the student detail view dynamically, and once a student has no remaining active instructor-scoped classroom enrollments, the student should disappear from the `Students` page.

---

## Scope

### Files Touched

| File | Change Type |
|------|-------------|
| `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.ts` | MODIFY |
| `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollment-detail.ts` | MODIFY |
| `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.test.ts` | MODIFY |
| `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollment-detail.test.ts` | ADD |
| `packages/hooks/src/query/classrooms/use-archive-classroom-mutation.ts` | MODIFY |
| `packages/hooks/src/query/classrooms/use-unarchive-classroom-mutation.ts` | MODIFY |
| `app/sentinel-web/src/app/(protected)/(instructor)/students/_components/dialogs/student-enrollment-detail-dialog.tsx` | VERIFY / optional minor copy update |

**Migration required:** No. The archive column already exists on `class_groups`.

---

## Desired Behavior

### Students List

- A student **should still appear** on `/students` if the instructor still teaches that student in **at least one active classroom**.
- A student **should disappear** from `/students` when **all** instructor-scoped classroom enrollments for that student belong to archived classrooms.

### Student Detail Dialog

- The dialog opened from the student row should only show **active** classroom enrollments.
- Any archived classroom should be removed from the list of visible `subject / classroom / section / term` assignments.
- If all enrollments are archived, the detail dialog should resolve to the existing empty state copy or a slightly clarified version of it.

### Refresh Behavior

- After archiving or unarchiving a classroom, the instructor `Students` page should refresh automatically without requiring a hard reload.

---

## Root Cause

The instructor students list and detail queries currently join `enrollments` to `class_groups` but do **not** exclude `class_groups.archived_at IS NOT NULL`.

As a result:

- archived classrooms still contribute to the aggregated student row on `/users/instructor-students`
- archived classrooms still appear in `/users/:id/instructor-enrollments`
- archiving a classroom does not currently invalidate the instructor student-related React Query caches

---

## Proposed Changes

### Phase 1: Backend List Query — Filter Archived Classrooms

**Goal:** Make the students table include only active instructor-scoped classroom enrollments.

- [ ] Modify `getInstructorStudentEnrollmentsData` in `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.ts`
  - add a default filter `cg.archived_at IS NULL`
  - keep the existing instructor scoping by `class_roles`
  - preserve the current aggregation behavior for `subject`, `section`, `term`, and `enrollmentIds`
  - ensure the query naturally drops students whose remaining instructor-scoped enrollments are all archived

- [ ] Verify search still behaves correctly after filtering archived classrooms
  - search should only match active classroom data
  - students should not be resurrected by archived classroom subject/section matches

### Phase 2: Backend Detail Query — Remove Archived Assignments

**Goal:** Make the student detail dialog show only active classroom/subject assignments.

- [ ] Modify `getStudentEnrollmentDetailData` in `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollment-detail.ts`
  - add `cg.archived_at IS NULL`
  - retain instructor scoping via `class_roles` for the instructor variant
  - keep ordering stable by `subject` and `section`

- [ ] Reuse the existing empty-state behavior in the frontend dialog when the filtered result becomes empty

### Phase 3: Tests — Lock Down the Archive Visibility Rules

**Goal:** Cover the exact business rule so the bug does not regress.

- [ ] Expand `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.test.ts`
  - assert the compiled SQL includes the archived classroom filter
  - add a scenario expectation documenting that archived classrooms must not contribute to the aggregated row set

- [ ] Add `app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollment-detail.test.ts`
  - assert the compiled SQL includes the archived classroom filter
  - verify the detail query excludes archived classroom assignments

### Phase 4: Frontend Cache Invalidation After Archive / Unarchive

**Goal:** Make the `Students` page update immediately after classroom archive state changes.

- [ ] Modify `packages/hooks/src/query/classrooms/use-archive-classroom-mutation.ts`
  - invalidate the instructor student list query key: `['instructor-students']`
  - remove or invalidate instructor student detail queries keyed by `['instructor-student-enrollment-detail', ...]`

- [ ] Modify `packages/hooks/src/query/classrooms/use-unarchive-classroom-mutation.ts`
  - apply the same invalidation strategy so restored classrooms reappear without a reload

### Phase 5: Frontend Copy Verification

**Goal:** Ensure the UI messaging still reads correctly when a student loses all active classroom assignments.

- [ ] Verify `app/sentinel-web/src/app/(protected)/(instructor)/students/_components/dialogs/student-enrollment-detail-dialog.tsx`
  - current copy: `No active classroom enrollments found for this student.`
  - keep as-is if it matches the final filtered behavior
  - optionally clarify to mention archived classrooms are excluded if product wants stronger wording

---

## Verification Plan

### Automated Tests

- `pnpm --dir app/sentinel-api test get-instructor-student-enrollments`
- `pnpm --dir app/sentinel-api test get-instructor-student-enrollment-detail`

### Manual Verification

1. Keep a student enrolled in two instructor-scoped classrooms.
2. Archive one classroom.
3. Confirm the student still appears on `/students`.
4. Open the student detail dialog and confirm the archived classroom assignment is gone.
5. Archive the student’s last remaining active instructor-scoped classroom.
6. Confirm the student disappears from `/students`.
7. Unarchive one classroom.
8. Confirm the student reappears on `/students` without requiring a hard refresh.

---

## Notes

- This fix should happen in the API query layer first, not only in the frontend table, because the aggregated `subject`, `section`, and `term` values are already wrong when archived classrooms are included.
- The behavior is instructor-scoped: a student may still exist elsewhere in the institution, but should disappear from this instructor’s `Students` page once the instructor has no active classroom relationship left.
