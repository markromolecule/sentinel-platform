# Implementation Plan: Improve Exam Reports (Pagination, UI Cleanup, Sidebar Redesign)

## 1-3-1 Options Analysis

**Option 1: Client-Side Pagination for `/exams/reports`**
- **Approach:** Fetch all exams using the existing `GET /exams` endpoint and paginate client-side on the reports list page.
- **Tradeoff:** Quickest to implement, but violates the core constraint that the page must request page-by-page from the backend to protect performance under load.

**Option 2: Dedicated `/exams/reports` API Endpoint with Page Redesign (Recommended)**
- **Approach:** Implement a paginated endpoint `/exams/reports` on the backend Hono server. Update the frontend `/exams/reports` page to request page-by-page from this new route. Redesign `/exams/[id]/report` to use the sidebar layout, inline/radio filters for the Action Queue, and `@sentinel/ui`'s `DataTable` for the attempts list.
- **Tradeoff:** Requires more backend and frontend files/routes, but ensures high performance, clean API contract separation, and follows the existing workspace design pattern.

**Option 3: Make Existing `/exams` Endpoint Conditionally Paginated**
- **Approach:** Modify the existing `GET /exams` endpoint to return a paginated response if `page` and `limit` are passed.
- **Tradeoff:** Avoids a new API path, but complicates the OpenAPI response schema and risks breaking many other consumers of the shared `GET /exams` endpoint (e.g., student views, configuration lists).

**Best Option:** **Option 2**
**Why:** Option 2 guarantees that we do not break any existing exam list clients, maintains strict OpenAPI type safety, and is highly performant. It separates concerns between standard exams listing and exam reporting.

---

## Phase 1: Backend Paginated API for Reports
**Goal:** Create a new `/exams/reports` endpoint that supports pagination and filters.

- [x] Add query and response schemas for `/exams/reports` in `app/sentinel-api/src/modules/examination/reporting/reporting.dto.ts`
- [x] Create route definition `getExamReportsListRoute` and register it in `app/sentinel-api/src/modules/examination/reporting/reporting.routes.ts`
- [x] Create controller file `app/sentinel-api/src/modules/examination/reporting/controllers/get-exam-reports-list.controller.ts` with role-aware visibility and pagination metadata
- [x] Implement `getExamReportsList` service method in `app/sentinel-api/src/modules/examination/reporting/reporting.service.ts` to query reportable exams with limit/offset and count totals
- [x] Create unit tests for the controller/service at `app/sentinel-api/src/modules/examination/reporting/controllers/get-exam-reports-list.controller.test.ts`
- [x] Verify using `pnpm --dir app/sentinel-api test run`
**Migration required:** No — purely internal query changes.

## Phase 2: Frontend Query Hook & Reports Page Pagination
**Goal:** Hook up the `/exams/reports` page to the new backend paginated API.

- [x] Add API service method `getExamReportsList` in `packages/services/src/api/exams/reporting.ts` with pagination parameters
- [x] Create frontend React Query hook `useExamReportsListQuery` in `packages/hooks/src/query/exams/use-exam-reports-list-query.ts`
- [x] Update `/exams/reports` page component `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`:
  - Connect to `useExamReportsListQuery`
  - Pass the current page number and page size to the hook
  - Remove the "Back to Exams" button (UI cleanup requirement 2a)
  - Remove the Breadcrumb Navigation (UI cleanup requirement 2b)
- [x] Fix the Report Card button alignment (UI cleanup requirement 2c) by applying flex column containers and `mt-auto` on the card button or card content wrapper in `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`
- [x] Add tests for the new hook at `packages/hooks/src/query/exams/use-exam-reports-list-query.test.ts`
**Migration required:** No.

## Phase 3: Page Redesign `/exams/[id]/report`
**Goal:** Redesign `/exams/[id]/report` page with sidebar navigation, clean Action Queue, and `DataTable`.

- [x] Redesign `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx` structure to use a sidebar layout matching `SubjectWorkspaceShell` pattern
- [x] Create columns configuration for the Attempts table in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/_components/columns.tsx` using `ColumnDef` from `@tanstack/react-table`
- [x] Replace the current `Table` in the attempts tab with `@sentinel/ui`'s `DataTable`, rendering it directly in the content area without any card wrapper (UI cleanup requirement 3c)
- [x] Redesign the Action Queue panel:
  - Remove nested tab structures (UI cleanup requirement 3b)
  - Replace them with a single list panel filtered by inline pills/segmented controls (using `Button` groups or a `Select` dropdown) representing the queue types ("Needs Review", "Needs Makeup", "Needs Retake")
- [x] Connect all card lists and tables (Attempts list, Action Queue) to backend pagination using the paginated values returned by `useExamReportQuery` (UI cleanup requirement 3d)
- [x] Update and run unit tests for `/exams/[id]/report/page.tsx`
**Migration required:** No.

---

## Done Criteria
- Every task references a concrete file or function.
- All new/modified functions contain JSDoc documentation.
- The `/exams/reports` list page loads data page-by-page from the backend paginated endpoint.
- `/exams/[id]/report` features a vertical sidebar layout with no nested tabs inside the Action Queue.
- The attempt summary table uses `@sentinel/ui`'s `DataTable` directly without a Card container.
- All frontend paginations are bound to backend request parameters.
- All Vitest test runs pass cleanly.
