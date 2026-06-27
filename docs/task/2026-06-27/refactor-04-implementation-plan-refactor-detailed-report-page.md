# Implementation Plan: Refactor Detailed Exam Report Page

This plan aims to refactor the detailed exam report page ([page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/page.tsx)) to make it modular, scalable, readable, and maintainable by extracting helper functions and sub-components into isolated, single-responsibility files under `_components/`.

---

## Proposed Changes

### Component 1: Extraction of Helpers

#### [NEW] [helpers.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/helpers.ts)
- Move formatting and pagination helper functions from `page.tsx`:
  - `formatDateTime(value)`
  - `formatPercent(value)`
  - `paginateItems(items, page, pageSize)`

---

### Component 2: Extraction of Sub-components

#### [NEW] [summary-metric.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/summary-metric.tsx)
- Move `SummaryMetric` sub-component into its own file.
- Document with descriptive JSDoc comment.

#### [NEW] [detail-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/detail-list.tsx)
- Move `DetailList` sub-component into its own file.
- Document with descriptive JSDoc comment.

#### [NEW] [action-queue-panel.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/action-queue-panel.tsx)
- Move `ActionQueuePanel` sub-component into its own file.
- Import `FacetedFilter`, `DataTable`, `getActionQueueColumns`, and helpers.
- Document with descriptive JSDoc comment.

---

### Component 3: Page Clean-up

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/page.tsx)
- Remove helper functions and sub-components definitions.
- Import `SummaryMetric`, `DetailList`, `ActionQueuePanel`, and helpers from their new file paths.
- Keep the `ExamReportPage` component clean and focused solely on page-level state, fetching, action execution, and layout assembly.

---

## Verification Plan

### Automated Tests
- Run frontend unit tests to ensure that the refactoring introduced no regressions and all mock references are resolved correctly:
  `pnpm --dir app/sentinel-web test src/app/\(protected\)/\(instructor\)/exams/\[id\]/report/page.test.tsx`
