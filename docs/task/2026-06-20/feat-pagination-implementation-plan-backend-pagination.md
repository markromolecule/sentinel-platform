# Backend Pagination End-to-End Implementation Plan

To implement end-to-end pagination for the sentinel-api (specifically `subjects`, `subject-classifications`, and `subject-offerings`), updating the GET controllers/services/data layers, updating the shared API package and query hooks, and refactoring frontend lists to leverage server-side pagination.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Dual-Mode Schema and Post-Inheritance Slicing (Recommended)

- **Description**: Update DTOs for `subjects`, `subject-classifications`, and `subject-offerings` to accept optional query parameters `page` and `limit`. In the services, perform the inheritance resolution (`loadEffectiveRows`) on the un-paginated set first to ensure correct overrides and merging, and then slice the resulting array in-memory if pagination parameters are provided. Return `{ data: items, pagination: { page, limit, total, hasMore } }` (similar to `/history` endpoint). If `page` and `limit` are not specified, return the full list under `data` for backward compatibility.
- **Tradeoff**: Very safe and backward-compatible for existing picker components/dialogs that don't need pagination, but requires in-memory slicing after merging.

#### Option 2: Database-Level Offset Pagination via SQL Kysely Slices

- **Description**: Push offset/limit queries directly to Kysely. Because the system utilizes an inheritance model where a parent institution's records are merged with child overrides/hidden records, database-level pagination requires a complex SQL `UNION` / window function or CTE (Common Table Expressions) to perform the merge logic at the DB query level before slicing.
- **Tradeoff**: Offers optimized database performance at scale, but carries extremely high complexity and risk of replication lag or incorrect override merging.

#### Option 3: Hybrid Paginated API Headers (X-Total-Count)

- **Description**: Add `page` and `limit` to request query parameters and return only the sliced array inside `data` (keeping type as `T[]`), but inject total page count and metadata through custom response headers like `X-Total-Count` or `Link`.
- **Tradeoff**: Avoids modifying the frontend query response types in React Query, but using headers for API metadata is non-standard in this codebase.

### Selected Option

We choose **Option 1** because it aligns with the existing pagination pattern found in `/history` and `/logs`, respects the inheritance resolving mechanism which merges parent and child rows in-memory, and provides backward compatibility for picker dropdowns and nested views that require full records.

---

## User Review Required

> [!IMPORTANT]
> The pagination slicing occurs in-memory at the Service level after `loadEffectiveRows` merges parent/child records. This ensures inheritance overrides and hidden items are resolved accurately before pagination is applied.
> Existing callers that omit `page` and `limit` query parameters will receive the full un-paginated array, preventing breaking changes in dialog selectors.

---

## Proposed Changes

### Backend (sentinel-api)

#### [MODIFY] [subject.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.dto.ts)
- Add optional `page` and `limit` query parameters to `getSubjectsSchema.request.query`.
- Update `getSubjectsSchema.response` to include an optional `pagination` field structure: `{ page: z.number(), limit: z.number(), total: z.number(), hasMore: z.boolean() }`.

#### [MODIFY] [get-subjects.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/controllers/get-subjects.controller.ts)
- Read `page` and `limit` from request query parameters.
- Pass them to `SubjectService.getSubjects`.
- Return the list and the pagination metadata in the response.

#### [MODIFY] [subject.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.ts)
- Update `getSubjects` method signature to accept `page?: number` and `limit?: number`.
- Handle pagination slicing on the merged result, returning `{ items: subjects, pagination }` structure.

#### [MODIFY] [subject.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.test.ts)
- Add unit tests for `SubjectService.getSubjects` to verify search, institution filtering, and correct pagination metadata calculation.

---

#### [MODIFY] [subject-classification.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.dto.ts)
- Add optional `page` and `limit` query parameters to `getSubjectClassificationsSchema.request.query`.
- Update `getSubjectClassificationsSchema.response` to include an optional `pagination` structure.

#### [MODIFY] [get-subject-classifications.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/controllers/get-subject-classifications.controller.ts)
- Extract optional `page` and `limit` from query.
- Pass them to `SubjectClassificationService.getSubjectClassifications`.
- Include the `pagination` block in the controller json response.

#### [MODIFY] [subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts)
- Update `getSubjectClassifications` method signature to accept `page?: number` and `limit?: number`.
- Add array slicing to return a paginated object containing `items` and `pagination` details.

#### [MODIFY] [subject-classification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts)
- Add tests verifying pagination slicing and metadata structure inside classifications service.

---

#### [MODIFY] [subject-offerings.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.dto.ts)
- Add optional `page` and `limit` to `getSubjectOfferingsSchema.request.query`.
- Update `getSubjectOfferingsSchema.response` to support optional `pagination` block.

#### [MODIFY] [get-subject-offerings.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/controllers/get-subject-offerings.controller.ts)
- Extract `page` and `limit` query params.
- Propagate parameters down to `SubjectOfferingsService.getSubjectOfferings`.
- Format final json response to contain pagination details.

#### [MODIFY] [subject-offerings.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts)
- Update `getSubjectOfferings` to support `page?: number` and `limit?: number` in parameters.
- Perform pagination slicing in-memory on the returned list and output `{ items, pagination }`.

---

### Shared Packages

#### [MODIFY] [subjects.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subjects.ts)
- Update `getSubjects` to accept `page` and `limit` query parameters.
- Return the wrapped `{ items: MasterSubject[], pagination }` structure.

#### [MODIFY] [subject-classifications.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subject-classifications.ts)
- Update `getSubjectClassifications` to accept optional `page` and `limit`.
- Map and return `{ items, pagination }` structure.

#### [MODIFY] [subject-offerings.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subject-offerings.ts)
- Update `getSubjectOfferings` to accept `page` and `limit` query parameters.
- Map and return `{ items, pagination }`.

#### [MODIFY] [use-subjects-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-subjects-query.ts)
- Accept `page` and `limit` in parameters.
- In `queryFn`, call `getSubjects` and return `res.items` if `page` and `limit` are not set (for backward compatibility), otherwise return the paginated response.

#### [MODIFY] [use-subject-classifications-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-subject-classifications-query.ts)
- Add `page` and `limit` parameters.
- In `queryFn`, conditionally return `res.items` or `res` based on parameter presence.

#### [MODIFY] [use-subject-offerings-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subject-offerings/use-subject-offerings-query.ts)
- Include `page` and `limit` parameters.
- In `queryFn`, conditionally return `res.items` or `res` based on parameter presence.

---

### Frontend Views & Controllers

#### [MODIFY] [subjects-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-view.tsx)
- Add pagination state `const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });`
- Pass mapped pagination parameters to `useSubjectsQuery`.
- Pass paginated states (`totalCount`, `pageCount`, `pagination`, `onPaginationChange`) to `SubjectsList`.

#### [MODIFY] [subjects-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-list.tsx)
- Pass down pagination props to the underlying `DataTable` component. Set `manualPagination={true}`.

#### [MODIFY] [use-subjects-page-state/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/_hooks/use-subjects-page-state/index.ts)
- Add pagination state management and hook parameters. Enable manual server-side pagination.

#### [MODIFY] [use-subject-classifications-page-state/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/_hooks/use-subject-classifications-page-state/index.ts)
- Implement pagination state integration for classifications.

#### [MODIFY] [use-offered-page-state/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/offered/_hooks/use-offered-page-state/index.ts)
- Implement server-side pagination integration for offered subjects.

---

## Verification Plan

### Automated Tests
- Run all backend unit/integration tests:
  `pnpm --dir app/sentinel-api test`
- Run shared hooks tests:
  `pnpm --dir packages/hooks test`
- Run core dashboard tests:
  `pnpm --dir app/sentinel-core test`

### Manual Verification
- Launch the development server `pnpm dev`.
- Navigate to the subjects tables on Core, Support, and Instructor dashboards.
- Verify that paging, searching, and changing rows per page works smoothly and triggers network fetches with the correct `page` and `limit` query parameters.
