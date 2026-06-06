# Implementation Plan — Bulk Selection & Deletion for Support Management UI

This plan outlines the changes required to implement bulk selection and deletion across Course, Subject, Offered Subject, Section, and User management pages in the `sentinel-support` application, as well as adding the course creation dialog button to the Course Management page.

---

## User Review Required

> [!IMPORTANT]
> The backend currently lacks bulk delete endpoints for **Users** and **Subject Offerings**. To maintain consistency with Courses, Subjects, and Sections, this plan proposes adding `DELETE` endpoints for bulk operations in `sentinel-api`.

> [!WARNING]
> Bulk deletion of **Users** will permanently delete their accounts and associations. There should be a prominent confirmation modal listing the number of accounts to be deleted before proceeding.

---

## Open Questions

> [!IMPORTANT]
>
> 1. For bulk deleting Users, does the backend need to prevent deletion of the currently logged-in user? (Yes, the API should block deleting the requester's own ID).
> 2. Should bulk delete of Subject Offerings cascade-delete nested sections or enrollments? (Yes, standard cascading constraints in PostgreSQL/Prisma will be respected).

---

## Proposed Changes

### Phase 1: Backend API Additions for Bulk Users & Subject Offerings Delete

**Goal:** Implement transaction-safe bulk delete endpoints for users and subject offerings in the backend API.

- [ ] Register new route in [user.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.routes.ts)
- [ ] Create bulk delete route controller at [delete-users.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/controllers/delete-users.controller.ts)
- [ ] Add `deleteUsers` static method to [user.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/users/user.service.ts)
- [ ] Register new route in [subject-offerings.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.routes.ts)
- [ ] Create bulk delete route controller at [delete-subject-offerings.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/controllers/delete-subject-offerings.controller.ts)
- [ ] Add `deleteSubjectOfferings` static method to [subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts)
- [ ] Write integration tests for these endpoints
- [ ] Run backend tests using `pnpm --dir app/sentinel-api test`

**Migration required:** No — no schema or database structures are changed.

---

### Phase 2: Shared Packages Services and Hooks Updates

**Goal:** Expose the new bulk delete endpoints to the frontend applications via shared package callers and React Query mutations.

- [ ] Add `deleteUsers` function to [users.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/users.ts)
- [ ] Add `deleteSubjectOfferings` function to [subject-offerings.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subject-offerings.ts)
- [ ] Create React Query hook [use-delete-users-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/users/use-delete-users-mutation.ts)
- [ ] Create React Query hook [use-delete-subject-offerings-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subject-offerings/use-delete-subject-offerings-mutation.ts)
- [ ] Write Vitest test coverage for the hooks
- [ ] Run hooks tests using `pnpm --dir packages/hooks test`

**Migration required:** No.

---

### Phase 3: Course Management UI Updates

**Goal:** Render the course creation dialog button and support multi-row course selection/deletion.

- [ ] Add `AddCourseDialog` import and layout hook to [courses-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx>)
- [ ] Render `AddCourseDialog` inside `PageHeader` in [courses-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx>)
- [ ] Add checkbox column header and cell mapping to [course-columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/courses/_components/tables/course-columns.tsx>)
- [ ] Bind `rowSelection` state and add "Delete Selected" button in `toolbarActions` within [courses-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx>)
- [ ] Write UI test verification
- [ ] Run app tests using `pnpm --dir app/sentinel-support test`

**Migration required:** No.

---

### Phase 4: Subject Management UI Updates

**Goal:** Implement row selection and bulk deletion on the Subject List and Offered Subject tables.

- [ ] Add checkbox column definition to [subject-columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/tables/subject-columns.tsx>)
- [ ] Bind `rowSelection` state and add "Delete Selected" button in `toolbarActions` within [subjects-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_components/views/subjects-view.tsx>)
- [ ] Add checkbox column definition to [offered-columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_components/tables/offered-columns.tsx>)
- [ ] Bind `rowSelection` state and add "Delete Selected" button in `toolbarActions` within [offered-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_components/views/offered-view.tsx>)
- [ ] Verify UI tests and run tests

**Migration required:** No.

---

### Phase 5: Section & Identity Management UI Updates

**Goal:** Support multi-row selection and deletion for both Sections and Administrators (Overview, Dean, and Support).

- [ ] Add checkbox column definition to [section-columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/sections/_components/tables/section-columns.tsx>)
- [ ] Bind `rowSelection` state and add "Delete Selected" button in `toolbarActions` within [sections-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/sections/_components/views/sections-view.tsx>)
- [ ] Add checkbox column definition to [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/tables/columns.tsx>)
- [ ] Bind `rowSelection` state and add "Delete Selected" button in `toolbarActions` within [administrators-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/users/_components/views/administrators-list.tsx>)
- [ ] Confirm tests pass with `pnpm test`

**Migration required:** No.

---

## Verification Plan

### Automated Tests

- `pnpm --dir app/sentinel-api test` to verify API controllers
- `pnpm --dir packages/hooks test` to verify new query hooks
- `pnpm --dir app/sentinel-support test` to verify page interaction and state binding

### Manual Verification

1. **Course creation:** Verify the "Add Course" button appears in the page header and opens the dialog when an institution is selected.
2. **Checkboxes:** Verify that selection checkboxes appear as the first column on Courses, Subjects, Offered Subjects, Sections, and Users tables.
3. **Bulk Action Toolbar:** Select multiple rows on each table and confirm the "Delete Selected" button appears with the correct count.
4. **Delete execution:** Delete selected items and verify that they are removed from the view and database, and that the table selection state is reset.
