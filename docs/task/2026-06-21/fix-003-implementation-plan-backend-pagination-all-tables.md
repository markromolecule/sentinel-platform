# fix-003: Backend Pagination Integration for Core and Web Applications

Implement a centralized global query parameter mapping in the API client, and integrate server-side pagination across list pages in `sentinel-core` and `sentinel-web`.

---

## User Review Required

> [!IMPORTANT]
> The mismatch between the frontend query keys (`limit`) and the backend Zod validation schema (`pageSize`) is resolved globally in the HTTP client `api-client.ts`. This avoids refactoring 20+ backend controllers and database data-access layers.
> All tables will transition from client-side filtering/pagination to server-side paginated queries, which will dramatically reduce network payload sizes.

---

## Open Questions

- None at this time.

---

## Proposed Changes

### Phase 1: Centralized API Client Query Parameter Mapping

**Goal:** Map frontend `limit` key to backend `pageSize` parameter globally and return compatible pagination metadata.

- [x] Update `packages/services/src/api-client.ts` to transform `limit` in request queries to `pageSize`, and inject `limit` into JSON responses containing `pageSize` in their `pagination` object.
- [x] Run `pnpm --dir packages/services test` to ensure there are no compilation errors.

**Migration required:** No — query mapping logic only.

---

### Phase 2: Update List Views in sentinel-core

**Goal:** Integrate server-side pagination for Semesters, Rooms, Departments, Sections, Courses, Subject offerings, and Classifications tables in sentinel-core.

- [x] Update Semesters view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/semesters/page.tsx) to handle page and limit state, query with pagination params, and pass props to component.
- [x] Update Rooms view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/rooms/page.tsx) to handle pagination state.
- [x] Update Departments view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/departments/page.tsx) to handle pagination state.
- [x] Update Sections view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/sections/page.tsx) to handle pagination state.
- [x] Update Courses view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/courses/page.tsx) to handle pagination state.
- [x] Update Subject Classifications view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx) to handle pagination state.
- [x] Update Subject Offerings view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx) to handle pagination state.
- [x] Update Enrollment Requests view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx) to handle pagination state.
- [x] Update table components (such as `rooms-list.tsx`, `semesters-list.tsx`, etc. under sentinel-core) to accept pagination props and pass them to `<DataTable manualPagination={true} />`.
- [x] Run `pnpm --dir app/sentinel-core test` to verify no regressions in sentinel-core.

**Migration required:** No.

---

### Phase 3: Update List Views in sentinel-web

**Goal:** Integrate server-side pagination for Subjects and Offered Subjects tables in sentinel-web.

- [x] Update Subjects page view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx) to handle pagination state.
- [x] Update Offered Subjects page view in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/page.tsx) to handle pagination state.
- [x] Update table components (such as `subjects-list.tsx` under sentinel-web) to accept pagination props and pass them to `<DataTable manualPagination={true} />`.
- [x] Run `pnpm --dir app/sentinel-web test` to verify no regressions in sentinel-web.

**Migration required:** No.

---

### Phase 4: Verification and Monorepo Build

**Goal:** Validate all changes by compiling the monorepo and running the tests.

- [x] Run `pnpm test` across all workspaces to ensure tests pass.
- [x] Run `pnpm build` to verify the production build succeeds.

**Migration required:** No.

---

## Verification Plan

### Automated Tests
- Run all workspace vitest tests to make sure types, services, and hooks compile:
  ```bash
  pnpm test
  ```

### Manual Verification
- Load each of the modified pages in `sentinel-core` and `sentinel-web`.
- Verify in Chrome DevTools Network tab that loading the page, filtering, searching, or clicking pagination buttons fires requests with `page` and `pageSize` parameters (e.g. `?page=1&pageSize=10`).
- Ensure the API responses contain the `pagination` metadata and only return the sliced page of items.
