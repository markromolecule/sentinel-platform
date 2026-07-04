# Implement Dynamic Action Buttons & Row Permissions

Make action triggers (e.g. 'add', 'setup wizard', 'bulk upload', 'create') and row-level action options (e.g. 'edit', 'delete', 'view') dynamic based on active user permissions in both `sentinel-support` and `sentinel-core` applications.

## 1-3-1 Plan Configuration

### Three Viable Options

1. **Option 1: Component-level Declarative `<PermissionGuard>` Wrapper (Robust/Scalable)**
    - Create a reusable `<PermissionGuard>` component in the shared `@sentinel/hooks` package. This component wraps any JSX elements (like buttons or dropdown options) and uses `useActivePermissions` internally to hide elements or show fallback content if permissions are not met.
    - _Tradeoff:_ Clean, declarative React code and reusable across both apps, but requires creating a new component file in `@sentinel/hooks`.
2. **Option 2: Inline Hook-based Conditional Rendering (Simple/Fast)**
    - Call the `useActivePermissions` hook directly in each view component and use inline logic checks like `{hasPermission('courses:create') && <AddCourseDialog />}` to show/hide triggers, and passing permissions or results as props down to columns/actions cells.
    - _Tradeoff:_ Quick to implement without adding any new component wrappers, but results in boilerplate hook calls on every page and forces prop drilling of permissions into plain TS TanStack column definitions.
3. **Option 3: Page-level RBAC Route wrapper `PermissionGate` (Creative/Alternative)**
    - Wrap entire sub-routes or layout-level containers with permission gates, or implement capability maps inside router metadata, redirecting or rendering unauthorized page views entirely.
    - _Tradeoff:_ Simplifies individual UI code by hiding whole pages, but fails to handle fine-grained row-level actions (e.g. allowing view but hiding edit/delete) as requested by the user.

### Recommended Option

We recommend **Option 1 (Component-level Declarative `<PermissionGuard>` Wrapper)** because it handles fine-grained checks directly in cell rendering templates and component headers elegantly without prop drilling.

---

## User Review Required

> [!NOTE]
> Since table row actions are sometimes generated in plain TS utility functions (such as `columns` arrays in TanStack Table configurations), we will use `<PermissionGuard>` within the row cell render templates. Because these cell renders return standard React components/JSX, `<PermissionGuard>` will work seamlessly without having to pass the permission results down from parent views.

## Open Questions

None.

## Proposed Changes

### Component: Shared Hooks & Authorization

---

#### [NEW] [permission-guard.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/permission-guard.tsx)

- Implement `PermissionGuardProps` and `PermissionGuard` component.
- Supports checking a single `permission: string`, or an array of `permissions: string[]` with `requireAll?: boolean` mode.
- Supports an optional `fallback` element.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/index.ts)

- Export `PermissionGuard` and `PermissionGuardProps` from `@sentinel/hooks`.

### Component: Sentinel Support App

---

#### [MODIFY] [bulk-create-departments-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/departments/_components/dialogs/bulk-create-departments-dialog.tsx)

- Wrap trigger or return `null` if user does not have `departments:create` permission.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/institutions/page.tsx)

- Wrap "Setup Wizard" button to require `institutions:create`.
- Wrap "Edit Parent" button to require `institutions:update`.

#### [MODIFY] [add-course-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/courses/_components/dialogs/add-course-dialog.tsx)

- Return `null` if user does not have `courses:create` permission.

#### [MODIFY] [course-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/courses/_components/tables/course-columns.tsx)

- Wrap action buttons (Revert, Edit, Delete) in `<PermissionGuard>` with respective permissions: `courses:update` and `courses:delete`.

#### [MODIFY] [courses-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/courses/_components/views/courses-view.tsx)

- Wrap Bulk Delete button in `<PermissionGuard>` for `courses:delete`.

#### [MODIFY] [section-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/sections/_components/tables/section-columns.tsx)

- Wrap action buttons (Revert, Edit, Delete) in `<PermissionGuard>` with respective permissions: `sections:update` and `sections:delete`.

#### [MODIFY] [sections-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/sections/_components/views/sections-view.tsx)

- Wrap Bulk Create and Add Section triggers in `<PermissionGuard>` for `sections:create`.
- Wrap Bulk Delete button in `<PermissionGuard>` for `sections:delete`.

#### [MODIFY] [semesters-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/semesters/_components/views/semesters-list.tsx)

- Wrap Bulk Delete button in `<PermissionGuard>` for `semesters:delete`.

#### [MODIFY] [offered-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/subjects/offered/_components/views/offered-view.tsx)

- Wrap Bulk Delete button in `<PermissionGuard>` for `subject_offerings:delete`.

#### [MODIFY] [add-student-whitelist-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/whitelist/_components/dialogs/add-student-whitelist-dialog.tsx)

- Return `null` if user lacks `student_whitelist:create`.

#### [MODIFY] [bulk-import-student-whitelist-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.tsx)

- Return `null` if user lacks `student_whitelist:import`.

#### [MODIFY] [whitelist-actions-cell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/whitelist/_components/tables/whitelist-actions-cell.tsx)

- Guard Reassign/Edit details item with `student_whitelist:update`.
- Guard Delete item with `student_whitelist:delete`.

#### [MODIFY] [add-admin-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/_components/dialogs/add-admin-dialog.tsx)

- Return `null` if user lacks the corresponding user create permission depending on the role (`users:create_superadmin`, `users:create_staff`, `users:create_admin`).

#### [MODIFY] [administrator-actions-cell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/_components/tables/administrator-actions-cell.tsx)

- Guard Edit item with `users:update`.
- Guard Delete item with `users:delete`.

#### [MODIFY] [administrators-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/%28protected%29/%28support%29/users/_components/views/administrators-list.tsx)

- Guard Bulk Delete button with `users:delete`.

### Component: Sentinel Core App

---

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/exams/dashboard/page.tsx)

- Wrap "Create Exam" button with `<PermissionGuard>` for `assessments:manage`.

#### [MODIFY] [exam-action-cell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/exams/_components/tables/exam-action-cell.tsx)

- Wrap "Assign" button, and "Edit", "Assign to Students", "Assign Room", "Delete" dropdown items with `assessments:manage` checks.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/question/bank/collections/%5BcollectionId%5D/page.tsx)

- Wrap "Import / Upload" button and `QuestionsEmptyState` `onImport` trigger with `assessments:manage` check.

#### [MODIFY] [questions-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/question/bank/_components/tables/questions-table.tsx)

- Combine the existing `readOnly` flag with `!hasPermission('assessments:manage')` to automatically switch the table and action sheet to read-only when the user lacks management permissions.

---

## Phases of Execution

### Phase 1: Shared Hooks & Authorization

**Goal:** Create the reusable `PermissionGuard` component and write unit tests for it.

- [ ] Create `packages/hooks/src/permission-guard.tsx` containing the `<PermissionGuard>` component.
- [ ] Export `<PermissionGuard>` and its props from `packages/hooks/src/index.ts`.
- [ ] Create `packages/hooks/src/permission-guard.test.tsx` with comprehensive unit tests checking rendering children/fallback and arrays mode.
- [ ] Run the hooks test suite:
    ```bash
    pnpm --dir packages/hooks test
    ```

**Migration required:** No

### Phase 2: Sentinel Support App Integration

**Goal:** Guard action buttons and table row options in `sentinel-support`.

- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/departments/_components/dialogs/bulk-create-departments-dialog.tsx` to return `null` if lacking `departments:create`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/institutions/page.tsx` to wrap Setup Wizard/Edit buttons in `PermissionGuard` for `institutions:create` / `institutions:update`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_components/dialogs/add-course-dialog.tsx` to return `null` if lacking `courses:create`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_components/tables/course-columns.tsx` to guard action buttons with `courses:update` and `courses:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx` to guard bulk delete button with `courses:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/sections/_components/tables/section-columns.tsx` to guard action buttons with `sections:update` and `sections:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/sections/_components/views/sections-view.tsx` to guard bulk create/add trigger with `sections:create` and bulk delete with `sections:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/semesters/_components/views/semesters-list.tsx` to guard bulk delete with `semesters:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_components/views/offered-view.tsx` to guard bulk delete with `subject_offerings:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/add-student-whitelist-dialog.tsx` to return `null` if lacking `student_whitelist:create`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.tsx` to return `null` if lacking `student_whitelist:import`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/tables/whitelist-actions-cell.tsx` to guard edit details/delete dropdown actions with `student_whitelist:update` / `student_whitelist:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog.tsx` to return `null` if lacking user create permissions matching the role.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/_components/tables/administrator-actions-cell.tsx` to guard edit details/delete dropdown actions with `users:update` / `users:delete`.
- [ ] Modify `app/sentinel-support/src/app/(protected)/(support)/users/_components/views/administrators-list.tsx` to guard bulk delete with `users:delete`.
- [ ] Run the support app test suite:
    ```bash
    pnpm --dir app/sentinel-support test
    ```

**Migration required:** No

### Phase 3: Sentinel Core App Integration

**Goal:** Guard action buttons and table row options in `sentinel-core`.

- [ ] Modify `app/sentinel-core/src/app/(protected)/exams/dashboard/page.tsx` to guard Create Exam button with `assessments:manage`.
- [ ] Modify `app/sentinel-core/src/features/exams/_components/tables/exam-action-cell.tsx` to guard Assign button and dropdown items with `assessments:manage`.
- [ ] Modify `app/sentinel-core/src/app/(protected)/question/bank/collections/[collectionId]/page.tsx` to guard Import / Upload trigger with `assessments:manage`.
- [ ] Modify `app/sentinel-core/src/app/(protected)/question/bank/_components/tables/questions-table.tsx` to integrate `assessments:manage` permission check into `readOnly` state.
- [ ] Run the core app test suite:
    ```bash
    pnpm --dir app/sentinel-core test
    ```

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Run tests in `@sentinel/hooks`:
    ```bash
    pnpm --dir packages/hooks test
    ```
- Run tests in `sentinel-support` and `sentinel-core`:
    ```bash
    pnpm --dir app/sentinel-support test
    ```
    ```bash
    pnpm --dir app/sentinel-core test
    ```

### Manual Verification

- Log in with different user roles and verify that:
    - Add/Create and Bulk Upload/Import triggers are completely hidden when lacking permissions.
    - Dropdown menu options for edit/delete are hidden.
    - The Question bank transitions to read-only interface if user lacks `assessments:manage`.
