# Implementation Plan - Fix Subjects and Classifications Pagination

Fix the pagination issues on the subjects page and the subject classifications page in `sentinel-core` by resolving the query parameter mismatch (`limit` vs `pageSize`) and using standard pagination helpers.

---

## 1-3-1 Alternatives Analysis

### Viable Options

#### Option 1: Align Backend schemas with `pageSize` and use standard `paginateItems` (Recommended)
Update the Hono OpenAPI schemas for `getSubjects` and `getSubjectClassifications` to use `pageSize` (via standard `paginationQuerySchema` and `paginationMetadataSchema` from `app/sentinel-api/src/lib/pagination.ts`), update controllers to extract `pageSize`, and replace local pagination helpers with the standard `paginateItems`.
*Tradeoff:* Requires editing the route schema, controller, service, and service tests, but aligns perfectly with the codebase's standard pagination contract and provides `totalPages`.

#### Option 2: Fallback mapping in Hono controllers
Keep schemas and services as is (using `limit`), but manually map `pageSize` to `limit` inside the controller handlers before validation or by reading raw query parameters.
*Tradeoff:* Avoids modifying services and test files, but introduces code duplication and bypasses strict query schema validation.

#### Option 3: Whitelist query parameter mapping in frontend `api-client.ts`
Modify the shared frontend `apiClient` to avoid mapping `limit` to `pageSize` for the subjects and classifications endpoints.
*Tradeoff:* Risks breaking API consistency and requires hardcoding endpoint-specific logic inside the shared network client layer.

### Chosen Option
**Option 1** is selected. It conforms to the repository's standard backend pagination contract, uses existing helper schemas, and retrieves correct metadata (like `totalPages`), which fixes the frontend classifications page displaying "total 0 groups".

---

## Proposed Changes

### Sentinel API (Backend)

#### [MODIFY] [subject.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.dto.ts)
- Import `paginationQuerySchema` and `paginationMetadataSchema` from `../../../lib/pagination`.
- Merge `paginationQuerySchema` into `getSubjectsSchema.request.query`.
- Use `paginationMetadataSchema` for `getSubjectsSchema.response.pagination`.

#### [MODIFY] [get-subjects.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/controllers/get-subjects.controller.ts)
- Destructure `pageSize` instead of `limit` from `c.req.valid('query')`.
- Pass `pageSize` to `SubjectService.getSubjects`.

#### [MODIFY] [subject.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.ts)
- Import `paginateItems` from `../../../lib/pagination`.
- Remove the local type definitions `PaginationMetadata`, `PaginatedResult`, and the local `paginateItems` function.
- Update `SubjectService.getSubjects` parameter signature and call to use `pageSize` instead of `limit`.

#### [MODIFY] [subject.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.test.ts)
- Update unit tests to assert `pageSize` and `totalPages` instead of `limit` in pagination results.

---

#### [MODIFY] [subject-classification.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.dto.ts)
- Import `paginationQuerySchema` and `paginationMetadataSchema` from `../../../lib/pagination`.
- Merge `paginationQuerySchema` into `getSubjectClassificationsSchema.request.query`.
- Use `paginationMetadataSchema` for `getSubjectClassificationsSchema.response.pagination`.

#### [MODIFY] [get-subject-classifications.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/controllers/get-subject-classifications.controller.ts)
- Destructure `pageSize` instead of `limit` from `c.req.valid('query')`.
- Pass `pageSize` to `SubjectClassificationService.getSubjectClassifications`.

#### [MODIFY] [subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts)
- Import `paginateItems` from `../../../lib/pagination`.
- Remove the local type definitions `PaginationMetadata`, `PaginatedResult`, and the local `paginateItems` function.
- Update `SubjectClassificationService.getSubjectClassifications` signature and call to use `pageSize` instead of `limit`.

#### [MODIFY] [subject-classification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts)
- Update unit tests to assert `pageSize` and `totalPages` instead of `limit` in pagination results.

---

## Execution Checklist

### Phase 1: Subject Endpoint Pagination Fix
**Goal:** Fix query parameters and pagination helper for subjects listing.

- [ ] Modify [subject.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.dto.ts) to use `paginationQuerySchema` and `paginationMetadataSchema`.
- [ ] Modify [get-subjects.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/controllers/get-subjects.controller.ts) to destructure and pass `pageSize`.
- [ ] Modify [subject.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.ts) to use the standard pagination helper and update signature.
- [ ] Modify [subject.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subjects/subject.service.test.ts) to verify correct pagination with the updated fields.
- [ ] Run test suite `pnpm --dir app/sentinel-api test src/modules/core/subjects/subject.service.test.ts` and verify it passes.

**Migration required:** No

### Phase 2: Subject Classification Endpoint Pagination Fix
**Goal:** Fix query parameters and pagination helper for subject classifications.

- [ ] Modify [subject-classification.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.dto.ts) to use `paginationQuerySchema` and `paginationMetadataSchema`.
- [ ] Modify [get-subject-classifications.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/controllers/get-subject-classifications.controller.ts) to destructure and pass `pageSize`.
- [ ] Modify [subject-classification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts) to use the standard pagination helper and update signature.
- [ ] Modify [subject-classification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts) to verify correct pagination with the updated fields.
- [ ] Run test suite `pnpm --dir app/sentinel-api test src/modules/core/subject-classification/subject-classification.service.test.ts` and verify it passes.

**Migration required:** No

---

## Verification Plan

### Automated Tests
- Run Vitest for both service tests:
  ```bash
  pnpm --dir app/sentinel-api test src/modules/core/subjects/subject.service.test.ts
  pnpm --dir app/sentinel-api test src/modules/core/subject-classification/subject-classification.service.test.ts
  ```

### Manual Verification
- Start development mode:
  ```bash
  pnpm dev
  ```
- Navigate to the subjects catalog page (`http://localhost:3002/subjects`) and verify only 10 items are loaded per page, pagination controls are functioning, and switching pages requests page 2.
- Navigate to the classifications page (`http://localhost:3002/subjects/classifications`) and verify that it correctly displays the total number of groups at the bottom of the table (instead of "total 0 groups").
