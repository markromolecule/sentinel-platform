# fix-004: Backend Pagination for sentinel-support List Views

**Summary:** Wire `sentinel-support` list views (Institutions, Departments, Courses, Sections, Semesters, Rooms) to use server-side pagination via `PaginationState`, replacing the current client-side-only approach.

---

## Viable Options

### Option A — Lift pagination state to each page component (Simple/Fast)

Add `PaginationState` directly inside each `page.tsx`. Pass `page`/`limit` to the query hook and `pagination` / `onPaginationChange` / `pageCount` / `manualPagination` down to the list component via new props.

**Tradeoff:** Minimal file changes per feature; props surface grows on list components.

### Option B — Encapsulate pagination inside each List/View component (Self-contained)

Move all pagination state, query calls, and `DataTable` wiring inside the individual `*-list.tsx` or `*-view.tsx` components. Pages stay thin; list components own their own data fetching.

**Tradeoff:** Each list component becomes heavier and harder to unit-test in isolation; duplicates query logic already present in some page components.

### Option C — Introduce a shared `useServerPagination` hook, then wire per page (Robust/Scalable) ✅ BEST

Create a tiny `useServerPagination` hook that encapsulates `PaginationState`, the `useEffect` reset-to-page-0-on-search, and the derived `items`/`totalCount`/`pageCount` selectors. Each page component calls this hook and passes the resulting props to its list/view component via new optional pagination props.

**Tradeoff:** One extra file; but the pattern is identical to `sentinel-core`'s `sections/page.tsx` and keeps list components decoupled from fetch logic.

### Why Option C (and why this is the chosen approach)

- Mirrors the exact pattern already proven in `app/sentinel-core/src/app/(protected)/sections/page.tsx`.
- The `DataTable` component already supports `pagination`, `onPaginationChange`, `pageCount`, `totalCount`, and `manualPagination` props — no shared-package changes needed.
- All six shared query hooks already support the overloaded `{ page, limit }` signature returning `PaginatedApiResponse<T>`.
- A shared hook avoids copy-pasting 5 lines of derived-state logic six times.

---

## Concrete Next Steps

1. Create `app/sentinel-support/src/hooks/use-server-pagination.ts`.
2. Update `InstitutionsList` props interface + `page.tsx` — Institutions.
3. Update `DepartmentsList` props interface + `page.tsx` — Departments.
4. Update `CoursesView` via `useCoursesPageState` — Courses.
5. Update `SectionsView` via `useSectionsPageState` — Sections.
6. Update `SemestersList` props interface + `page.tsx` — Semesters.
7. Update `RoomsList` props interface + `page.tsx` — Rooms.
8. Run `pnpm --dir app/sentinel-support test` and fix any failures.
9. Build `pnpm --dir app/sentinel-support build` to verify no type errors.

---

## Migration Required: No — No Prisma schema changes. Backend already supports pagination.

---

## Phase 1: Shared Pagination Hook

**Goal:** Provide a reusable hook that encapsulates `PaginationState` and reset-on-search logic.

- [x] Create `app/sentinel-support/src/hooks/use-server-pagination.ts`
  - Export `useServerPagination(debouncedSearch: string)` returning `{ pagination, setPagination }`.
  - On `debouncedSearch` change, reset `pageIndex` to `0` (mirrors `sentinel-core` pattern).
  - JSDoc on exported function.
- [x] Write `app/sentinel-support/src/hooks/use-server-pagination.test.ts`
  - Test that `pageIndex` resets to `0` when `debouncedSearch` changes.
  - Test that `setPagination` updates state correctly.

**Migration required:** No

---

## Phase 2: Institutions — Server-side Pagination

**Goal:** The Institutions page fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/institutions/_components/views/institutions-list.tsx`
  - Add optional props: `pagination?: PaginationState`, `onPaginationChange?`, `pageCount?`, `totalCount?`, `manualPagination?`.
  - Pass these through to `<DataTable>`.
  - Update `selectedIds` derivation to use `institutions[parseInt(index)]?.id` (already correct; no regression).
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/institutions/page.tsx`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)` to obtain `pagination` / `setPagination`.
  - Switch `useInstitutionsQuery` to paginated overload: `{ search, page: pagination.pageIndex + 1, limit: pagination.pageSize }`.
  - Derive `visibleInstitutions` from `institutionsResponse?.items ?? []`.
  - Derive `pageCount` from `institutionsResponse?.pagination?.totalPages ?? 1`.
  - Pass `pagination`, `onPaginationChange={setPagination}`, `pageCount`, `manualPagination` to `<InstitutionsList>`.
  - **Note:** `parentId` filtering currently happens client-side after fetch; after pagination is enabled, the parent-id drill-down (`visibleInstitutions.filter(...)`) will only filter within the current page. This is an **accepted limitation** for this ticket — a separate ticket should add a `parentId` query param to the API.
- [x] Write `app/sentinel-support/src/app/(protected)/(support)/institutions/_components/views/institutions-list.test.tsx`
  - Smoke-test that `<InstitutionsList>` renders with pagination props forwarded.

**Migration required:** No

---

## Phase 3: Departments — Server-side Pagination

**Goal:** The Departments page fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/departments/_components/views/departments-list.tsx`
  - Add optional props: `pagination?`, `onPaginationChange?`, `pageCount?`, `totalCount?`, `manualPagination?`.
  - Pass them to `<DataTable>`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/departments/page.tsx`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)`.
  - Switch `useDepartmentsQuery` to paginated overload.
  - Derive `departments`, `pageCount`, `totalCount` from `departmentsResponse`.
  - Pass pagination props to `<DepartmentsList>`.
- [x] Write `app/sentinel-support/src/app/(protected)/(support)/departments/_components/views/departments-list.test.tsx`
  - Smoke-test rendering with pagination props.

**Migration required:** No

---

## Phase 4: Courses — Server-side Pagination

**Goal:** The Courses view fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.ts`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)` inside the hook.
  - Switch primary `useCoursesQuery` to paginated overload `{ search, institutionId, page, limit }`.
  - Derive `courses = coursesResponse?.items ?? []`, `pageCount`, `totalCount`.
  - Return `pagination`, `setPagination`, `pageCount`, `totalCount` from hook.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/courses/_components/views/courses-view.tsx`
  - Destructure `pagination`, `setPagination`, `pageCount`, `totalCount` from `useCoursesPageState`.
  - Pass `pagination`, `onPaginationChange={setPagination}`, `pageCount`, `totalCount`, `manualPagination` to `<DataTable>`.
- [x] Update `app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.test.ts`
  - Add test for paginated query invocation and derived state.

**Migration required:** No

---

## Phase 5: Sections — Server-side Pagination

**Goal:** The Sections view fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/sections/_hooks/use-sections-page-state/index.ts`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)` inside the hook.
  - Switch primary `useSectionsQuery` to paginated overload.
  - Derive `sections = sectionsResponse?.items ?? []`, `pageCount`, `totalCount`.
  - Return `pagination`, `setPagination`, `pageCount`, `totalCount`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/sections/_components/views/sections-view.tsx`
  - Destructure and pass `pagination`, `onPaginationChange`, `pageCount`, `totalCount`, `manualPagination` to `<DataTable>`.
  - Update `selectedIds` computation to use the current page's `sections` array (already correct).
- [x] Update `app/sentinel-support/src/app/(protected)/(support)/sections/_hooks/use-sections-page-state/index.test.ts`
  - Add test for paginated query invocation.

**Migration required:** No

---

## Phase 6: Semesters — Server-side Pagination

**Goal:** The Semesters page fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/semesters/_components/views/semesters-list.tsx`
  - Add optional props: `pagination?`, `onPaginationChange?`, `pageCount?`, `totalCount?`, `manualPagination?`.
  - Pass them to `<DataTable>`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/semesters/page.tsx`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)`.
  - Switch `useSemestersQuery` to paginated overload.
  - Derive `semesters`, `pageCount`, `totalCount`.
  - Pass pagination props to `<SemestersList>`.
- [x] Write `app/sentinel-support/src/app/(protected)/(support)/semesters/_components/views/semesters-list.test.tsx`
  - Smoke-test rendering with pagination props.

**Migration required:** No

---

## Phase 7: Rooms — Server-side Pagination

**Goal:** The Rooms page fetches only one page of records from the API.

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/views/rooms-list.tsx`
  - Add optional props: `pagination?`, `onPaginationChange?`, `pageCount?`, `totalCount?`, `manualPagination?`.
  - Pass them to `<DataTable>`.
- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx`
  - Import `useServerPagination`, `PaginationState`.
  - Call `useServerPagination(debouncedSearch)`.
  - Switch `useRoomsQuery` to paginated object-params overload: `{ search, page, limit }`.
  - Derive `rooms`, `pageCount`, `totalCount`.
  - Pass pagination props to `<RoomsList>`.
- [x] Write `app/sentinel-support/src/app/(protected)/(support)/rooms/_components/views/rooms-list.test.tsx`
  - Smoke-test rendering with pagination props.

**Migration required:** No

---

## Phase 8: Verification

**Goal:** All six pages communicate with the backend for pagination; build and tests pass.

- [x] Run `pnpm --dir app/sentinel-support test` — all tests must pass.
- [x] Run `pnpm --dir app/sentinel-support build` — no TypeScript errors.
- [x] Manual verification: open each of the six pages in the browser and observe Network tab showing requests with `page=1&pageSize=10` (or equivalent) query params.
- [x] Confirm paginator UI controls appear and navigating pages triggers new network requests.

**Migration required:** No

---

## Done Criteria

- [x] All six pages send paginated API requests (visible in Network tab).
- [x] `PaginationState` resets to page 1 on search-term change.
- [x] `DataTable` renders server-side pagination controls (`manualPagination={true}`).
- [x] All existing Vitest tests pass.
- [x] `pnpm --dir app/sentinel-support build` succeeds with no TypeScript errors.
- [x] No `.env` changes required.
- [x] No Prisma migration required.

---

## Additional Notes

- The `parentId` drill-down on the Institutions page currently filters client-side after fetch; with server-side pagination, this will only filter within the current page. Document this as a known limitation — a separate backend filter (`parentId` query param) is needed to fix it properly.
- The `useRoomsQuery` hook has a legacy string-first overload; use the object-params overload `{ search, page, limit }` going forward.
- `selectedIds` bulk-selection in all list components uses row indices into the current `data` array, which is correct when the data is already the current page slice.
