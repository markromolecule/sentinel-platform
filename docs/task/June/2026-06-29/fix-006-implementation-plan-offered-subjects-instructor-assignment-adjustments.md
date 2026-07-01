# Implementation Plan: Offered Subjects Instructor Assignment & UI Adjustments

This implementation plan details the proposed changes to address:
1. The bug where unassigned offered subjects still show as assigned in the administrator's Offered Subjects view.
2. The UI adjustment to display department and course codes only (instead of names) in badge/tag format (similar to the Year Levels column).
3. The success toast message display upon assigning an instructor.

---

## 1. Backend / Database Layer (`app/sentinel-api`)

### [MODIFY] [unenroll-instructor-subject.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/unenroll-instructor-subject.ts)
- Update `unenrollInstructorSubjectData` to also delete from `classroom_instructor_assignments` table:
```typescript
    // Delete classroom instructor assignments
    await dbClient
        .deleteFrom('classroom_instructor_assignments')
        .where('instructor_user_id', '=', userId)
        .where('class_group_id', 'in', classGroupIds)
        .execute();
```
- This ensures that when an instructor unenrolls / unassigns from the offered subject, their active classroom teaching role is also removed, allowing the list query to reflect that they are no longer assigned.

---

## 2. Frontend Packages & Hooks (`packages/hooks`)

### [MODIFY] [use-assign-offered-subject-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-assign-offered-subject-mutation.ts)
- Modify the mutation hook to display a clean success toast message when the assignment is successful:
```typescript
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({
                queryKey: SUBJECT_QUERY_KEYS.all,
            });
            queryClient.invalidateQueries({
                queryKey: SUBJECT_OFFERING_QUERY_KEYS.all,
            });
            toast.success('Instructor assigned successfully');
        },
```

---

## 3. UI Layer (`sentinel-core` & `sentinel-support`)

### [MODIFY] [subject-offering-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/tables/subject-offering-columns.tsx)
- Update `departments` column to map labels using `row.original.departments.map((d) => d.code?.trim() || d.name)`:
```typescript
        {
            id: 'departments',
            accessorFn: (row) => row.departments.map((d) => d.code?.trim() || d.name).join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Departments" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={row.original.departments.map((d) => d.code?.trim() || d.name)}
                    emptyLabel="No departments"
                />
            ),
        },
```
- Update `courses` column to map labels using `row.original.courses.map((c) => c.code?.trim() || c.title)`:
```typescript
        {
            id: 'courses',
            accessorFn: (row) => row.courses.map((c) => c.code?.trim() || c.title).join(', '),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
            cell: ({ row }) => (
                <SummaryBadges
                    labels={row.original.courses.map((c) => c.code?.trim() || c.title)}
                    emptyLabel="No courses"
                />
            ),
        },
```

### [MODIFY] [offered-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_components/tables/offered-columns.tsx)
- Update the `departments` column to format labels using `department.code?.trim() || department.name` to prioritize code over name.
- Update the `courses` column to format labels using `course.code?.trim() || course.title` to prioritize code over title.

---

## Verification Plan

### Automated Tests
- Run database query / service tests inside `sentinel-api` to ensure no regression in enrollment mutations:
  ```bash
  pnpm --dir app/sentinel-api test src/modules/identity/enrollments/data/tests/assign-offered-subject.test.ts
  ```

### Manual Verification
1. Login as Admin / Support to `http://localhost:3002/subjects/offered`.
2. Verify the **Departments** and **Courses** columns render only codes as tags/badges.
3. Select an offered subject, click **Assign to Instructor**, assign an instructor, and verify the success toast says `"Instructor assigned successfully"`.
4. Login as that instructor in the instructor portal, unenroll from the subject, and verify that the administrator's offered subjects list no longer shows the instructor as assigned.
