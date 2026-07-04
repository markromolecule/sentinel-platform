# Implementation Plan: Minor Adjustments to Exam Reports

This plan addresses the requirements specified in [minhor-adjustment-reports.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/June/June%2027/minhor-adjustment-reports.md):

1. Convert the section dropdown filter on the Attempt Summary page into facets.
2. Initially hide the "Started" timeline column in the Attempt Summary DataTable.
3. Convert the Action Queue Panel lists from cards into tables and implement pagination.

---

## 1-3-1 Options Analysis

### Option 1: Standalone Client-Side Paginated Tables for Action Queue (Recommended)

- **Approach**: Maintain the existing `actionItems` structure in the backend response. On the frontend, replace the custom card lists in `ActionQueuePanel` with the `@sentinel/ui` `DataTable` component configured with `manualPagination={false}` (client-side pagination).
- **Pros**: Zero changes needed for the backend API services, DTOs, and shared schemas, avoiding breaking changes for other clients. Highly performant since the list of action items is small (only students requiring intervention).
- **Cons**: The pagination is client-side, meaning the full (but small) list of action items is loaded in the initial report payload.

### Option 2: Backend-Driven Action Queue Pagination

- **Approach**: Modify the backend `GET /exams/:id/report` query schema to accept `queuePage`, `queuePageSize`, and `queueType` parameters. Update the backend to slice and return paginated action items.
- **Pros**: True backend-driven pagination for the Action Queue table.
- **Cons**: High complexity, requires modifying the shared OpenAPI schemas, and increases API roundtrips when switching between queues.

### Best Option: **Option 1**

**Why**: Option 1 provides a native table interface with pagination using the workspace's standard `DataTable` component, while keeping the API contract clean and backwards-compatible.

---

## Proposed Changes

### Component 1: Frontend Attempt Summary adjustments

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/page.tsx>)

- Replace the `Select` component for section filtering with `@sentinel/ui`'s `FacetedFilter`.
- Configure `FacetedFilter` to support single-selection of sections, updating the `sectionFilter` state.
- Pass `initialColumnVisibility={{ startedAt: false }}` to the Attempt Summary `DataTable` to hide the Timeline column by default.

### Component 2: Action Queue Table conversion

#### [NEW] [action-queue-columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/action-queue-columns.tsx>)

- Create column definitions for each Action Queue table:
    - **Student**: Renders last name, first name, and student number.
    - **Reason**: Renders the action item's reason text.
    - **Action**: Renders the "Grant Makeup", "Grant Retake", or "View Attempt" button.

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/page.tsx>)

- Update `ActionQueuePanel` to render the `@sentinel/ui` `DataTable` component using `action-queue-columns`.
- Remove the card-list rendering code in favor of the `DataTable`.
- Configure `DataTable` pagination for the Action Queue.

---

## Verification Plan

### Automated Tests

- Run frontend unit tests to ensure no regressions and verify table components render correctly:
  `pnpm --dir app/sentinel-web test src/app/\(protected\)/\(instructor\)/exams/\[id\]/report/page.test.tsx`

### Manual Verification

- Verify in the browser that:
    - The section filter uses the faceted dropdown filter layout.
    - The "Timeline" (startedAt) column is hidden initially but can be toggled visible using the DataTable column visibility menu.
    - The Action Queue displays in a clean table format with working pagination.
