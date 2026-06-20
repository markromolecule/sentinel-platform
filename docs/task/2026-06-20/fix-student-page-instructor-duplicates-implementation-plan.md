# Bug Fix: Duplicate Students on Instructor Dashboard Student Page

Address duplicate student records in the instructor's student dashboard page. Because a student can be enrolled in multiple class groups (different subjects/sections) taught by the same instructor, the current API query returns one record per enrollment. This plan groups the API query by student, aggregates their subject, section, and term names as comma-separated lists, and updates the frontend to manage multiple enrollments.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Database-level Grouping via Kysely aggregations (`STRING_AGG` and `groupBy`) [RECOMMENDED]

- **Description**: Group the query in `getInstructorStudentEnrollmentsData` by student profile fields. Use `STRING_AGG` to combine `subject_title`, `section_name`, and `term_name` as comma-separated values, and aggregate `e.enrollment_id` as `enrollment_ids` to track all enrollments. Update the frontend list to represent unique students and allow targeted unenrollment via the enrollment details dialog.
- **Tradeoff**: Very clean, high-performance, and aligns with existing repository patterns (like `get-users.query.ts`), but requires coordination across the DTO schema, types, and multiple frontend components.

#### Option 2: Frontend-level Grouping inside the `useStudentsList` Hook

- **Description**: Keep the API as is, returning separate rows per enrollment. In the frontend `useStudentsList` query hook, group the array by student `userId` in memory, merging subject, section, and term properties.
- **Tradeoff**: Simple, frontend-only change, but inefficient as it fetches redundant data over the network and does not scale well if server-side pagination is added in the future.

#### Option 3: Add Subject/Classroom Filter Dropdown to Deduplicate Views

- **Description**: Keep the API as is, and introduce a subject or classroom selector on the student page, forcing the instructor to filter the table to a single subject, which naturally prevents duplicates.
- **Tradeoff**: Offers interactive filtering controls, but doesn't fix the underlying duplicates in the general "All Students" view or when searching.

### Selected Option

We select **Option 1** as it is the most robust, performs database-level grouping for efficiency, matches the established pattern in `get-users.query.ts`, and enables clean, context-specific unenrollment from the details view dialog.

---

## User Review Required

> [!IMPORTANT]
> The return value of the `/users/instructor-students` endpoint will change:
>
> - The `id` property in each record will represent the student's `userId` instead of a single `enrollment_id`.
> - A new property `enrollmentIds` will contain a comma-separated list of the student's enrollments.
> - The `subject`, `section`, and `term` fields will be comma-separated strings of all classes taught by this instructor that the student is enrolled in.
>
> In the Student dashboard table:
>
> - If a student is in a single classroom under the instructor, the "Remove" button in the table row functions directly.
> - If a student is in multiple classrooms, the "Remove" button in the table row is disabled/interrupted with a message instructing the instructor to use the "View" action to manage specific classroom enrollments.

---

## Open Questions

> [!NOTE]
> None. The plan resolves the grouping using the same CSV pattern already implemented in the frontend's `getCondensedSubject` formatter.

---

## Proposed Changes

### Shared Types (`packages/shared`)

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/index.ts)

- Add `enrollmentIds?: string;` property to `Student` interface.

---

### Backend API (`sentinel-api`)

#### [MODIFY] [get-instructor-student-enrollments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.ts)

- Update `InstructorStudentEnrollmentRecord` type to support `enrollment_ids` instead of a single `enrollment_id`.
- Update the Kysely query:
    - Add `.groupBy()` for all selected student profile fields (`up.user_id`, `up.first_name`, `up.last_name`, `u.email`, `s.student_number`, `up.status`, `up.last_seen_at`, `dep.department_code`, `up.institution_id`, `i.name`).
    - Use `sql<string | null>STRING_AGG(DISTINCT e.enrollment_id, ', ')` as `enrollment_ids`.
    - Use `sql<string | null>STRING_AGG(DISTINCT sub.subject_title, ', ')` as `subject_name`.
    - Use `sql<string | null>STRING_AGG(DISTINCT sec.section_name, ', ')` as `section_name`.
    - Use `sql<string | null>STRING_AGG(DISTINCT CONCAT(t.academic_year, ' - ', t.semester), ', ')` as `term_name`.
    - Use `sql<number | null>MAX(sec.year_level)` as `year_level`.
- Update `mapInstructorStudentEnrollment` to map `id` to `record.user_id` and add `enrollmentIds: record.enrollment_ids`.

#### [MODIFY] [user.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.dto.ts)

- Add `enrollmentIds: z.string().optional().nullable()` to the `instructorStudentEnrollmentSchemaOpenApi` schema object.

#### [NEW] [get-instructor-student-enrollments.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/data/get-instructor-student-enrollments.test.ts)

- Create a unit test checking the compiled SQL query structure of `getInstructorStudentEnrollmentsData` to verify:
    - Query uses `group_by`.
    - Query contains `STRING_AGG` calls.

---

### Frontend Web App (`sentinel-web`)

#### [MODIFY] [use-unenroll-student.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_hooks/use-unenroll-student.ts>)

- In the `onSuccess` callback, invalidate the `['instructor-student-enrollment-detail']` query key in addition to `['instructor-students']` so the detail view dialog updates dynamically after removing a student.

#### [MODIFY] [student-action-cell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_components/tables/student-action-cell.tsx>)

- Determine if the student is in multiple classes:
  `const isMultiEnrollment = student.enrollmentIds ? student.enrollmentIds.split(',').map(id => id.trim()).filter(Boolean).length > 1 : false;`
- Update the "Remove" menu item:
    - If `isMultiEnrollment` is true, show a toast notification instructing them to use "View" to manage the student's enrollments.
    - If false, perform the unenrollment mutation on `student.enrollmentIds || student.id`.

#### [MODIFY] [student-enrollment-detail-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_components/dialogs/student-enrollment-detail-dialog.tsx>)

- Import `useUnenrollStudent` hook.
- Add a "Remove" button with a trash icon next to each enrollment card inside the list.
- Prompt with a confirmation alert before triggering the unenroll mutation.
- Disable the button when `isRemoving` is active.

---

## Verification Plan

### Automated Tests

- Run backend unit tests:
  `pnpm --dir app/sentinel-api test`

### Manual Verification

- Log in as an instructor and view the Students page.
- Verify that students with multiple enrollments (e.g. in Ethics and another subject) are listed only once.
- Confirm the "Subject" column shows the condensed subject (e.g., "Ethics +1 more").
- Click "Remove" on a student with a single enrollment and verify they are unenrolled successfully.
- Click "Remove" on a student with multiple enrollments and confirm a toast instructions notification is shown.
- Click "View" on a student with multiple enrollments, click "Remove" next to one of their subjects, and confirm they are successfully removed and the list immediately updates.
