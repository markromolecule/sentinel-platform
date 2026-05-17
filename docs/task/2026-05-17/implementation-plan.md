# Implementation Plan: Sentinel Support Whitelist & Account Management Improvements

This implementation plan details the step-by-step phases to modernize the student whitelist management view and add dedicated support account management in `sentinel-support`.

---

## 1-3-1 Architectural Decision

Before initiating the implementation, we evaluate three viable options for separating "Dean Management" (Superadmin) and "Support Management" (Support) account directories:

### Viable Options

#### Option 1: Complete Separation at the API/Query level (Recommended)

- **Dean Management (`/users`)**: Calls `useUsersQuery({ role: 'superadmin' })`. The table displays only superadmins, and the redundant "Role" facet is removed from this view.
- **Support Management (`/users/support`)**: Calls `useUsersQuery({ role: 'support' })`. The table displays only support accounts.
- **Pros**: Perfectly clean, logical separation. Users only see what they expect in each specific tab. Redundant filters are eliminated.
- **Cons**: Requires minor updates to the existing test suite for `/users/page.tsx` since the test expects `role: ['superadmin', 'support']` in the query parameter.

#### Option 2: Single Global Query with Local Role Filtering (Frontend filtering)

- **Dean Management (`/users`)**: Calls `useUsersQuery({ role: ['superadmin', 'support'] })` but filters the array locally before passing it to `AdministratorsList`: `users.filter(u => u.role === 'superadmin')`.
- **Support Management (`/users/support`)**: Calls the query for both but filters locally: `users.filter(u => u.role === 'support')`.
- **Pros**: The existing test for the query parameter continues to pass without modifications.
- **Cons**: Unnecessary data is fetched over the network, and local filtering adds slight complexity and is less idiomatic than filtering at the database layer.

#### Option 3: Unified Query with Role-Specific Default Table Facet Filters (Synchronized via facet state)

- **Dean Management (`/users`)**: Calls `useUsersQuery({ role: ['superadmin', 'support'] })` and passes it directly to `AdministratorsList`, but sets the initial column filters of the role facet to `['superadmin']`.
- **Support Management (`/users/support`)**: Calls the query for both, but sets the initial column filters of the role facet to `['support']`.
- **Pros**: Keeps the flexible table facet behavior intact; users can clear the role filter to view all accounts in both pages, but starts with a role-specific default view.
- **Cons**: The pages remain very similar and the separation is mostly a UX cosmetic layer.

### Chosen Best Option: Option 1

**Why:** Option 1 is the cleanest and most robust approach. It strictly separates responsibilities at the query level, optimizing API and database performance by only fetching the requested user role. It also improves UX by removing the redundant "Role" filter facet from views that are dedicated to single roles.

---

## Phase 1: Support Whitelist Components & Hooks Migration

**Goal:** Port and adapt the whitelist forms, dialogs, and helper hooks from `sentinel-core` to `sentinel-support`.

- [ ] Create `useStudentWhitelistScope` hook:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope.ts`
    - Function: `useStudentWhitelistScope`
    - Purpose: Get current authenticated user, profile, and scopes. Support users should be treated as platform-wide `superadmin` access for whitelist management (so they can select any institution).
- [ ] Create `useStudentWhitelistForm` hook:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-form.ts`
    - Function: `useStudentWhitelistForm`
    - Purpose: Handle react-hook-form state, Zod validation resolver, and mutations.
- [ ] Create `useStudentWhitelistBulkImport` hook:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import.ts`
    - Function: `useStudentWhitelistBulkImport`
    - Purpose: Excel/CSV parsing via XLSX and call backend bulk import service.
- [ ] Create form fields component:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/forms/student-whitelist-form-fields.tsx`
    - Component: `StudentWhitelistFormFields`
    - Purpose: Dialog input fields for student number, status, name, institution, department, and course selection.
- [ ] Create whitelist dialog components:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/add-student-whitelist-dialog.tsx` -> `AddStudentWhitelistDialog`
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/edit-student-whitelist-dialog.tsx` -> `EditStudentWhitelistDialog`
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.tsx` -> `BulkImportStudentWhitelistDialog`
- [ ] Create row action cell component:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/tables/whitelist-actions-cell.tsx`
    - Component: `WhitelistActionsCell`
    - Purpose: Actions dropdown displaying "Copy Entry ID", "Reassign Program Scope" (via `EditStudentWhitelistDialog`), and "Delete Entry".
- [ ] Write unit tests for the imported hooks:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-form.test.ts`
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import.test.ts`
- [ ] Write unit tests for the dialogs:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/add-student-whitelist-dialog.test.tsx`
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.test.tsx`

**Migration required:** No — the whitelist schemas and backend API endpoints are already available and fully operational.

---

## Phase 2: Table Columns & Facets Refactoring

**Goal:** Replace dropdowns with table facets, add bulk delete actions, and integrate the checkbox column for selection.

- [ ] Modify whitelist table columns:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/tables/columns.tsx`
    - Changes:
        - Add checkbox column (`select`) at the beginning.
        - Change accessorKey for `institutionName`, `departmentName`, and `courseTitle` to `institutionId`, `departmentId`, and `courseId` so local facet filtering operates on IDs. Keep rendering display names in the cells.
        - Add `filterFn` to `institutionId`, `departmentId`, `courseId`, `status`, and `claimStatus`.
        - Add actions column (`actions`) at the end rendering `WhitelistActionsCell`.
- [ ] Create facets builder utility:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-facets.ts`
    - Function: `buildStudentWhitelistFacets`
    - Purpose: Build facet descriptors for the DataTable including Institution, Status, Claim Status, Department, and Course.
- [ ] Refactor whitelist list table wrapper:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-list.tsx`
    - Changes:
        - Add `rowSelection` and `setRowSelection` state.
        - Integrate bulk deletion mutation (`useDeleteSelectedStudentWhitelistMutation`).
        - Setup `facets` prop using `buildStudentWhitelistFacets` populated by queries.
        - Set up toolbarActions displaying `Delete Selected (N)` when rows are selected.
- [ ] Write unit tests for the updated columns and list component:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-list.test.tsx`

**Migration required:** No

---

## Phase 3: Whitelist Management View Integration

**Goal:** Integrate the dialogs, sync state with facets via `useDataTableFilterSync`, and handle dependent filter cleanup.

- [ ] Refactor main whitelist management view:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-management-view.tsx`
    - Changes:
        - Add `columnFilters` and `setColumnFilters` state.
        - Remove old Institution, Department, and Course select dropdown elements from the JSX.
        - Integrate `useDataTableFilterSync` to synchronize facet choices to query states (`selectedInstitutionId`, `selectedDepartmentId`, `selectedCourseId`).
        - In `onFilterChange`, implement dependent filter cleaning: if `institutionId` filter changes, clear the `departmentId` and `courseId` column filters and states; if `departmentId` changes, clear `courseId` filters.
        - Add `<BulkImportStudentWhitelistDialog />` and `<AddStudentWhitelistDialog />` in the page header actions slot.
- [ ] Update Whitelist Management View test suite:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/views/whitelist-management-view.test.tsx`
    - Changes: Update mock assertions to check for the presence of the dialog buttons and verify facet filtering logic, replacing old dropdown interactions.

**Migration required:** No

---

## Phase 4: Support Account Management Path & Navigation

**Goal:** Create a new page dedicated to Support account administration and add navigation sidebars.

- [ ] Update Dean Management page query (Option 1):
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/page.tsx`
    - Change: Set `role: 'superadmin'` in the `useUsersQuery` parameters.
- [ ] Update Dean Management page test:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/page.test.tsx`
    - Change: Update assertion from expecting `role: ['superadmin', 'support']` to `role: 'superadmin'`.
- [ ] Create the new Support Management page:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/support/page.tsx`
    - Purpose: Page displaying only Support account administration.
    - Logic:
        - Render `PageHeader` with title "Support Account Management" and invite dialog `<AddAdminDialog role="support" />`.
        - Call `useUsersQuery({ role: 'support', search: debouncedSearch })`.
        - Render `<AdministratorsList role="support" administrators={...} isLoading={...} />`.
- [ ] Create Support Management page unit tests:
    - File: `app/sentinel-support/src/app/(protected)/(support)/users/support/page.test.tsx`
- [ ] Update sidebar navigation items:
    - File: `app/sentinel-support/src/components/sidebar/support/constants/index.ts`
    - Change: Add "Support Management" link (`/users/support`) under "Dean Management" in the `USER_MANAGEMENT_ITEMS` array.

**Migration required:** No
