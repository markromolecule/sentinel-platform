# Implementation Plan: Refactor Bulk Import Whitelist Dialog

## Goal

Refactor the `BulkImportStudentWhitelistDialog` component to improve modularity, readability, maintainability, and testability. This involves extracting all logic into a custom state hook (`useBulkImportDialogState`) and breaking down the large presentational structure (~567 lines) into five isolated, reusable React sub-components under a dedicated `bulk-import/` module directory.

---

### Phase 1: Local State & Event Extraction (Custom Hook)

**Goal:** Extract local state, drag-and-drop actions, API data queries, and stable calculations into a cohesive custom state hook.

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/hooks/use-bulk-import-dialog-state.ts`
- [x] Extract local states (`open`, `isDragActive`, `institutionId`, `departmentId`, `courseId`), query hooks (`useInstitutionsQuery`, etc.), event handlers (`handleOpenChange`, `handleSelectedFile`, `handleFileChange`, `handleImport`, `handleDragOver`, `handleDragLeave`, `handleDrop`), and memoized filter results into the hook.
- [x] Return a unified, strongly-typed interface exposing state values, calculated booleans (`isScopeReady`, `hasImportSummary`, etc.), and action methods.
- [x] Create unit tests in `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/hooks/use-bulk-import-dialog-state.test.ts` to test hooks logic in isolation.
      **Migration required:** No

---

### Phase 2: Presentational Sub-Component Decomposition

**Goal:** Decompose the massive inline JSX tree into small, highly cohesive presentational components.

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/components/scope-selectors.tsx` to handle the Institution, Department, and Course selector dropdowns.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/components/drop-zone.tsx` to handle the dashed drag-and-drop file upload interface.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/components/file-preview.tsx` to display details of the uploaded file and clear-state button.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/components/issues-list.tsx` to render errors or validation issues scrollbox.
- [x] Create `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import/components/preview-table.tsx` to render the Excel/CSV parsed records data table.
- [x] Implement isolated unit tests for the sub-components where appropriate.
      **Migration required:** No

---

### Phase 3: Assembly & Integration

**Goal:** Integrate the custom state hook and presentational sub-components into the main dialog module, ensuring complete backwards-compatibility and passing tests.

- [x] Refactor `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.tsx` to use the new hook and import the modular sub-components.
- [x] Verify styling alignment and standard behavior (drag-and-drop, scoping limitations, import invocation).
- [x] Update and execute the main unit test suite in `app/sentinel-support/src/app/(protected)/(support)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog.test.tsx` to verify standard rendering and behavior.
      **Migration required:** No
