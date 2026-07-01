# Implementation Plan - Subject Checkbox and Bulk Actions

Add checkbox selection and bulk actions on the Subject List and Offered Subjects tables across `sentinel-core` and `sentinel-web` to match the patterns established in `sentinel-support`.

---

## 1-3-1 Alternatives Analysis

### Viable Options

#### Option 1: Complete Alignment across Core and Web (Recommended)
- **sentinel-core (Admin)**: Double-check existing checkbox selection and bulk delete. Refactor offered subjects bulk unoffer in `OfferedSubjectsList` to use the standardized `useDeleteSubjectOfferingsMutation` hook instead of a `Promise.all` loop of single deletes.
- **sentinel-web (Instructor)**: Add checkbox selection to the Subject List page, allowing instructors to bulk unenroll or bulk cancel pending requests. The Offered Subjects page for instructors will not render checkbox selection as instructors do not manage offered subjects or have permissions to unoffer/delete them.
- *Tradeoff:* Requires updating web tables and components, but ensures UI consistency and leverages standard React Query mutations.

#### Option 2: Core-Only refactoring
- Only refactor `sentinel-core` and do not add checkboxes/bulk unenrollment in `sentinel-web`.
- *Tradeoff:* Faster, but leaves `sentinel-web` without the requested bulk capabilities for instructors.

#### Option 3: Implement bulk request on Offered Subjects for Web
- Add checkbox selection to Offered Subjects page in `sentinel-web` and implement a complex bulk request wizard.
- *Tradeoff:* Extremely high complexity and poor UX, as configuring target departments, courses, year levels, and sections for multiple subjects at once is highly variable.

### Chosen Option
**Option 1** is selected. It provides the requested bulk capabilities, maintains security permissions, refactors core to use efficient backend bulk endpoints, and keeps the instructor's UI intuitive.

---

## User Review Required

> [!IMPORTANT]
> - Instructors in `sentinel-web` do not have permission to delete catalog subjects or unoffer subjects. Therefore, the bulk actions in `sentinel-web`'s Subject List page will be labeled **Bulk Unenroll** or **Cancel Request** (for pending requests) instead of **Delete**.
> - The Offered Subjects page in `sentinel-web` will **not** show checkbox selection or bulk actions, as instructors cannot bulk request/configure offerings in a single flow, nor can they delete/unoffer them.

---

## Proposed Changes

### Sentinel Core (Admin)

#### [MODIFY] [offered-subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/offered-subjects-list.tsx)
- Import `useDeleteSubjectOfferingsMutation` from `@sentinel/hooks`.
- Replace the parallel `Promise.all` single delete loop inside `handleBulkUnoffer` with the single bulk mutation `deleteOfferingsMutation.mutate(ids)`.
- Simplify pending/loading states using the mutation's state.

---

### Sentinel Web (Instructor)

#### [MODIFY] [columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/tables/columns.tsx)
- Add the standard `select` checkbox column at the beginning of the columns array.
- Use the standard `<Checkbox>` component from `@sentinel/ui`.

#### [MODIFY] [subjects-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/tables/subjects-table.tsx)
- Pass down `rowSelection`, `onRowSelectionChange`, and `toolbarActions` props to the internal `<DataTable>` component.

#### [MODIFY] [subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/views/subjects-list.tsx)
- Manage `rowSelection` state (`useState<RowSelectionState>({})`).
- Calculate selected subjects and their respective IDs/status.
- Implement `handleBulkUnenroll` using a parallel delete loop (or custom helper) calling the unenroll mutation for each selected subject enrollment/request.
- Add `toolbarActions` containing the "Unenroll/Cancel Selected" button.
- Render a confirmation dialog before performing the bulk action.

---

## Execution Checklist

### Phase 1: Refactor Sentinel Core (Admin) Offered Subjects
**Goal:** Refactor offered subjects bulk unoffer to use standard bulk delete mutation.

- [x] Modify [offered-subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/offered-subjects-list.tsx) to use `useDeleteSubjectOfferingsMutation`.
- [x] Run test suite `pnpm --dir app/sentinel-core test` (or specific page tests) and verify all tests pass.

### Phase 2: Implement Checkbox Selection in Sentinel Web (Instructor)
**Goal:** Add selection checkboxes and bulk unenrollment to the instructor's subject list.

- [x] Add the `select` column in [columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/tables/columns.tsx).
- [x] Pass selection props through [subjects-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/tables/subjects-table.tsx).
- [x] Add state, confirmation dialog, and bulk unenroll action in [subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/views/subjects-list.tsx).
- [x] Verify that instructors can select multiple subjects and unenroll from them.

---

## Verification Plan

### Automated Tests
- Run related test suites in both apps:
  ```bash
  pnpm --dir app/sentinel-core test
  pnpm --dir app/sentinel-web test
  ```

### Manual Verification
- Start the development server (`pnpm dev`).
- Log into the Admin panel (`sentinel-core`), navigate to Offered Subjects, select multiple offerings, and confirm the bulk unoffer works successfully.
- Log into the Instructor portal (`sentinel-web`), navigate to Subject List, select multiple subjects, and confirm the bulk unenrollment flow prompts and executes correctly.
