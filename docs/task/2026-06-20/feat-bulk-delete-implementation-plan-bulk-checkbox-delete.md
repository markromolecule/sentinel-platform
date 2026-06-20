# Bulk Checkbox Student Delete & Instructor Guide Redesign

Implement checkbox-based bulk delete for the student list page in the instructor workspace, and refactor the instructor guide page into a sidebar layout (matching the subject page layout) which separates the guide steps and the essay rubric table, maximizes table space, and updates the guide steps to reflect the actual system workflow (adding classroom creation).

## 1-3-1 Option Analysis

### Bulk Student Unenrollment

- **Option 1: Sequential Deletions in Frontend (Fast & Simple)**
    - **Approach:** Iterate over selected enrollment IDs in frontend, executing sequential API `DELETE /enrollments/:id` requests.
    - **Tradeoff:** Quickest frontend-only implementation, but inefficient, lacks database transaction safety, and causes high network overhead.
- **Option 2: Bulk Deletion API Endpoint with Individual Validation (Robust & Scalable) [RECOMMENDED]**
    - **Approach:** Create a dedicated `DELETE /enrollments/bulk` route in the backend, perform authorization checks on all enrollment IDs, and perform a bulk database delete.
    - **Tradeoff:** Requires backend/DTO schema modifications, but guarantees database transaction safety, proper audit logging, and optimal DB performance.
- **Option 3: Classroom-Level/Bulk Filter-Based Deletion (Contextual & Creative)**
    - **Approach:** Enforce filtering the student table by classroom first, then unenroll all checked students specifically under that classroom using a single classroom ID param.
    - **Tradeoff:** Restricts the user from unenrolling students across multiple classrooms at once, but simplifies the delete confirmation logic.

_Selection:_ **Option 2** (Bulk Deletion API Endpoint).
_Why:_ It aligns with other bulk operations in the codebase (such as bulk approval/rejection or bulk requests deletion) to ensure transaction safety and security verification, while keeping the client code clean.

---

### Guide Page Redesign

- **Option 1: Shared Layout + Separate Next.js Pages (Robust & Clean) [RECOMMENDED]**
    - **Approach:** Refactor the `/guide` route group with a shared `layout.tsx` containing the `GuideWorkspaceShell` (with a sidebar), moving instructions to `/guide/page.tsx` and the rubric to `/guide/rubric/page.tsx`.
    - **Tradeoff:** Involves file creation and routing configuration, but aligns with subjects layout, permits deep linking, and maximizes table space.
- **Option 2: Tabs Component on a Single Page (Simple & Fast)**
    - **Approach:** Retain a single `/guide/page.tsx` but wrap content in a `@sentinel/ui` `Tabs` component to switch between steps and rubric.
    - **Tradeoff:** Fast implementation with no new files, but misses the requested sidebar design and deep linking.
- **Option 3: Local State Sidebar Toggling (Creative but Hybrid)**
    - **Approach:** Use a mock sidebar inside a single `/guide/page.tsx` that controls the visible content via React state.
    - **Tradeoff:** Avoids routing setup but results in a larger file, and URLs do not update when switching tabs.

_Selection:_ **Option 1** (Shared Layout + Separate Next.js Pages).
_Why:_ Aligns with the layout patterns of the Subjects tab, provides clean URL mapping, and keeps the code for the guide and rubric independent.

---

## User Review Required

> [!IMPORTANT]
> The Bulk Delete unenrolls students from their class groups. If a student is enrolled in multiple subjects/sections, the bulk delete will remove them from all subjects they are enrolled in that are managed by the current instructor (collecting all their visible enrollment IDs).

---

## Open Questions

None.

---

## Proposed Changes

### Phase 1: Backend API for Bulk Deletion

**Goal:** Implement the bulk unenrollment endpoint in `sentinel-api` with security validation and logging.

- [x] Modify [enrollments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts)
    - Define `bulkDeleteEnrollmentSchema`:
        ```typescript
        export const bulkDeleteEnrollmentSchema = {
            body: z.object({
                enrollmentIds: z
                    .array(z.string().uuid())
                    .min(1)
                    .openapi({ description: 'The enrollment_ids to delete' }),
            }),
            response: z.object({
                message: z.string(),
                data: z.null(),
            }),
        };
        ```
- [x] Implement [bulk-unenroll-students.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/controllers/bulk-unenroll-students.controller.ts) [NEW]
    - Define `bulkDeleteEnrollmentRoute` and handler.
    - Perform permission check (require role of instructor, admin, or superadmin).
    - If instructor, check that the instructor manages all classrooms (`class_group_id`) corresponding to the requested `enrollmentIds`.
    - Call `EnrollmentService.bulkUnenrollStudents`.
- [x] Modify [enrollments.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.service.ts)
    - Define `bulkUnenrollStudents(dbClient: DbClient, enrollmentIds: string[])`:
        - Query `enrollments` and `class_groups` for logging details.
        - Perform bulk deletion: `dbClient.deleteFrom('enrollments').where('enrollment_id', 'in', enrollmentIds).execute()`.
        - Log `enrollment.deleted` for each unenrollment in `LogsService`.
- [x] Modify [enrollments.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.routes.ts)
    - Register the bulk delete route:
        ```typescript
        .openapi(bulkDeleteEnrollmentRoute, bulkDeleteEnrollmentRouteHandler)
        ```
- [x] Write tests in [bulk-unenroll-students.controller.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/controllers/bulk-unenroll-students.controller.test.ts) [NEW]
    - Test successful bulk delete.
    - Test validation failures (e.g., unauthorized instructor, empty array).
- [x] Verify with `pnpm --dir app/sentinel-api test`

**Migration required:** No — DB schema is unchanged.

---

### Phase 2: Frontend Data Access & API Layer

**Goal:** Integrate the bulk delete API into the client-side services and state hook.

- [x] Modify [student-enrollment-api.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_hooks/student-enrollment/student-enrollment-api.ts>)
    - Add `bulkUnenrollStudents(enrollmentIds: string[]): Promise<void>` utilizing `apiClient`.
- [x] Implement [use-bulk-unenroll-students.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_hooks/use-bulk-unenroll-students.ts>) [NEW]
    - Define query mutation wrapper returning `useMutation`.
    - On success, show toast and invalidate `['instructor-students']` and `['instructor-student-enrollment-detail']`.

**Migration required:** No.

---

### Phase 3: Selection Checkbox & Bulk Delete UI

**Goal:** Enable row selection in the students table, rendering the bulk delete action.

- [x] Modify [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_components/tables/columns.tsx>)
    - Add select column at index 0 using `@sentinel/ui` `Checkbox`.
- [x] Modify [students-table.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/students/_components/tables/students-table.tsx>)
    - Manage `rowSelection` state using `useState<Record<string, boolean>>({})`.
    - Pass `rowSelection` and `onRowSelectionChange` to `DataTable`.
    - Calculate selected count. Gather all selected student enrollment IDs:
        ```typescript
        const selectedEnrollmentIds = table.getSelectedRowModel().rows.flatMap((row) =>
            row.original.enrollmentIds
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean),
        );
        ```
    - Add a "Delete Selected" button in `toolbarActions` when selections exist.
    - Display `AlertDialog` for confirmation before calling mutation.

**Migration required:** No.

---

### Phase 4: Guide Redesign & System Process Steps

**Goal:** Update `/guide` layout, add `/guide/rubric` page, and align guide steps with actual workflow.

- [x] Implement [layout.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/layout.tsx>) [NEW]
    - Define `InstructorGuideLayout` wrapping sub-pages in a workspace shell featuring sidebar navigation:
        - "Guide Steps" -> `/guide`
        - "Essay Rubric" -> `/guide/rubric`
- [x] Modify [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx>)
    - Remove essay rubric section.
    - Add step for "Creating a Classroom" (as Step 2) and reorder subsequent steps to fit:
        1.  Requesting an Offered Subject
        2.  Creating a Classroom
        3.  Enrolling Students
        4.  Creating an Exam
        5.  Assigning the Exam
        6.  Assigning Another Instructor (Optional)
- [x] Implement [rubric/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/rubric/page.tsx>) [NEW]
    - Render the `Standardized Essay Rubric` table in a full-width container maximizing table space.

**Migration required:** No.

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-api test` to verify backend bulk unenroll endpoint.
- Run `pnpm --dir app/sentinel-web test` to verify frontend layouts and page changes.

### Manual Verification

1.  Open the Instructor Students tab.
2.  Select multiple students using the checkboxes.
3.  Click "Delete Selected". Confirm the prompt. Verify students are unenrolled.
4.  Navigate to the Instructor Guide tab.
5.  Click "Essay Rubric" in the sidebar navigation. Check that the rubric displays full-width and maximizes space.
6.  Click "Guide Steps" in the sidebar navigation. Verify steps 1-6 display correctly, with Classroom Creation listed as Step 2.
