# Branch/Institution Scoping for Subjects & Enrollment Requests Implementation Plan

## Goal Description

Ensure that `sentinel-support` and the API endpoints fetch only the subjects, classifications, offered subjects, and enrollment requests under the active institution and the parent/child branch hierarchy of the specific user context. For example, if User A is under branch 1 of Institution A, they should not see subjects or enrollment requests created/overridden by branch 2. Sibling branch resources must remain isolated, while parent-to-child inheritance continues to be respected.

## User Review Required

> [!IMPORTANT]
> **Enrollment Requests API Schema Modification**:
> We will add an optional `institutionId` parameter to the query schema for `GET /enrollments/requests` in `enrollments.dto.ts`. This allows support users to filter enrollment requests list by institution/branch, matching the patterns used in `GET /subjects` and `GET /subject-offerings`.
>
> **Auto-Resolve Parent-Child Hierarchy**:
> For enrollment requests query filtering, if `institutionId` is a child branch, we will automatically lookup its parent institution and filter requests belonging to both the branch and the parent (excluding sibling branches), ensuring consistency with subjects inheritance.

## Open Questions

> [!NOTE]
> None. The scope and requirement boundaries are clear.

---

## Proposed Options & Tradeoffs

### Option 1 (Recommended): Extend API Schemas and update getEnrollmentRequestsData Query

- **Description**: Add `institutionId` parameter to Zod schemas in `enrollments.dto.ts`, update `getEnrollmentRequestsRouteHandler` to resolve academic query scopes, and query `institutions` table inside `getEnrollmentRequestsData` to resolve parent/child branch bounds before filtering the list using Kysely.
- **Tradeoff**: Clean, fits existing monorepo patterns, ensures type safety, and handles sibling branch isolation correctly at the DB query layer.

---

## Best Option Selection

We choose **Option 1** as it keeps the API structure consistent, utilizes current database Kysely models, avoids complex raw SQL, and leverages the frontend React Query hook architecture already in place.

---

## Proposed Changes

### 1. Database & Schemas

#### [MODIFY] [enrollments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts)

- Add optional `institutionId: z.string().uuid().optional()` to `getEnrollmentRequestsSchema.query`.

---

### 2. API Controllers and Data Access

#### [MODIFY] [get-enrollment-requests.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/controllers/get-enrollment-requests.controller.ts)

- Destructure `institutionId` as `requestedInstitutionId` from `c.req.valid('query')`.
- Pass `requestedInstitutionId` as an argument to `resolveAcademicQueryScope` context helper.
- Pass the resolved `queryScope.institutionId` to `EnrollmentService.getEnrollmentRequests`.

#### [MODIFY] [get-enrollment-requests.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/get-enrollment-requests.ts)

- Inside `getEnrollmentRequestsData`, check if `institutionId` is provided.
- If provided, perform a Kysely lookup on `institutions` to resolve `parent_institution_id`.
- Create an array of allowed institution IDs: `allowedInstIds = [institutionId]`.
- If a parent exists, append it: `allowedInstIds.push(parentInstitutionId)`.
- Filter the query with `.where((eb) => eb.or([ eb('subject_offerings.institution_id', 'in', allowedInstIds), eb('class_groups.institution_id', 'in', allowedInstIds) ]))`.

---

### 3. API Services & Hooks Packages

#### [MODIFY] [subjects.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subjects.ts)

- Update `getEnrollmentRequests` signature to accept optional `institutionId?: string`.
- Append `institutionId` parameter to URLSearchParams if provided.

#### [MODIFY] [use-enrollment-requests-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-enrollment-requests-query.ts)

- Update `useEnrollmentRequestsQuery` signature to accept optional `institutionId?: string`.
- Include `institutionId` in the react-query key array and pass it to `getEnrollmentRequests`.

---

### 4. Support App Frontend Integration

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/requests/page.tsx>)

- Add `selectedInstitutionId` state using `useState<string | undefined>(undefined)`.
- Fetch institutions using `useInstitutionsQuery()`.
- Pass `selectedInstitutionId` to `useEnrollmentRequestsQuery`.
- Pass `institutions`, `selectedInstitutionId`, and `setSelectedInstitutionId` props to `EnrollmentRequestsList`.

#### [MODIFY] [enrollment-requests-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-requests-list.tsx>)

- Accept new props: `institutions`, `selectedInstitutionId`, and `setSelectedInstitutionId`.
- Setup `columnFilters` state initialized with `selectedInstitutionId` if present.
- Integrate `useDataTableFilterSync` to synchronize the table filters and trigger `setSelectedInstitutionId` changes.
- Inject the `institution` facet into the table facets list.

#### [MODIFY] [enrollment-request-facets.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-request-facets.ts>)

- Update `buildEnrollmentRequestFacets` to accept `institutions` array.
- Add the `institution` facet object mapped with `institutions` options.

---

### 5. Automated Tests

#### [MODIFY] [get-enrollment-requests.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/tests/get-enrollment-requests.test.ts)

- Update `FakeDbClient` class mock to handle `selectFrom('institutions')`.
- Add a test case verifying that `getEnrollmentRequestsData` correctly resolves parent institution ID and issues `in` where clause.

---

## Plan Checklist

### Phase 1: API Changes & Unit Tests

**Goal**: Update Hono API schemas and Kysely data layer queries to support parent/branch scoping on enrollment requests.

- [x] Modify `app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts` to add `institutionId` parameter.
- [x] Modify `app/sentinel-api/src/modules/identity/enrollments/controllers/get-enrollment-requests.controller.ts` to resolve query scope.
- [x] Modify `app/sentinel-api/src/modules/identity/enrollments/data/get-enrollment-requests.ts` to perform parent lookup and apply branch scoping.
- [x] Update `app/sentinel-api/src/modules/identity/enrollments/data/tests/get-enrollment-requests.test.ts` with mock for institutions select and validation check.
- [x] Run vitest to verify that all enrollment tests pass.
      **Migration required**: No

### Phase 2: Packages (Services & Hooks) Updates

**Goal**: Update shared packages to propagate `institutionId` query parameters.

- [x] Modify `packages/services/src/api/subjects.ts` in `getEnrollmentRequests`.
- [x] Modify `packages/hooks/src/query/subjects/use-enrollment-requests-query.ts` in `useEnrollmentRequestsQuery`.
      **Migration required**: No

### Phase 3: Frontend Integration in Sentinel Support

**Goal**: Integrate the Institution filter dropdown on the Support Enrollment Requests page.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/page.tsx`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-requests-list.tsx`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/_components/enrollment-request-facets.ts`.
- [x] Run overall test suite `pnpm test` and verify that all UI pages build correctly.
      **Migration required**: No

---

## Verification Plan

### Automated Tests

- Run the mock unit tests for enrollment requests query filters:
    ```bash
    pnpm --dir app/sentinel-api test get-enrollment-requests.test.ts
    ```
- Run all api tests:
    ```bash
    pnpm --dir app/sentinel-api test
    ```

### Manual Verification

- Log in to the Support portal (`sentinel-support`), navigate to **Enrollment Requests** page, and verify that the **Institution** filter dropdown is present in the toolbar.
- Select `Branch 1` from the dropdown, verify that only enrollment requests from `Branch 1` and its parent `Institution A` are returned.
- Verify that enrollment requests from `Branch 2` (sibling branch) are NOT visible when `Branch 1` is selected.
