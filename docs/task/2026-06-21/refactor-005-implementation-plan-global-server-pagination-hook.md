# refactor-005: Global Server Pagination Hook

**Summary:** Move the `useServerPagination` hook from the `sentinel-support` app to the shared `@sentinel/hooks` package, enabling reuse across all pages displaying paginated data in `sentinel-core`, `sentinel-web`, and `sentinel-support`.

---

## User Review Required

> [!IMPORTANT]
> This refactoring introduces a peer dependency on `@tanstack/react-table` (specifically for the `PaginationState` type) inside `@sentinel/hooks`. This is a standard and expected dependency for all web applications in the monorepo.

> [!NOTE]
> By centralizing this hook, we eliminate duplicate `useState` + `useEffect` reset logic across 25+ pages/hooks in the monorepo, standardizing reset-to-page-0 on search change behavior.

---

## Proposed Changes

### Shared Hooks Package (`packages/hooks`)

#### [NEW] [use-server-pagination.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/use-server-pagination.ts)
- Add the `useServerPagination` hook which manages a `PaginationState` containing `pageIndex` and `pageSize`, resetting `pageIndex` to `0` when any item in `watchDependencies` changes. Supports custom initial states.

#### [NEW] [use-server-pagination.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/use-server-pagination.test.ts)
- Port hook unit tests to `@sentinel/hooks` test suite verifying initialization, state updating, and search reset behavior.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/index.ts)
- Export `useServerPagination` from `@sentinel/hooks`.

#### [MODIFY] [package.json](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/package.json)
- Add `@tanstack/react-table` (matching `^8.20.5`) to `peerDependencies` and `devDependencies` so types are resolved during packages development and compilation.

---

### Sentinel Support App (`sentinel-support`)

#### [DELETE] [use-server-pagination.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/hooks/use-server-pagination.ts)
- Remove local hook.

#### [DELETE] [use-server-pagination.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/hooks/use-server-pagination.test.ts)
- Remove local test.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/hooks/index.ts)
- Remove local hook export.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/institutions/page.tsx)
- Import `useServerPagination` from `@sentinel/hooks` instead of `@/hooks` and change invocation to `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/departments/page.tsx)
- Import `useServerPagination` from `@sentinel/hooks` and call as `useServerPagination([debouncedSearch])`.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index.ts)
- Import `useServerPagination` from `@sentinel/hooks` and call as `useServerPagination([debouncedSearch])`.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/sections/_hooks/use-sections-page-state/index.ts)
- Import `useServerPagination` from `@sentinel/hooks` and call as `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/semesters/page.tsx)
- Import `useServerPagination` from `@sentinel/hooks` and call as `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx)
- Import `useServerPagination` from `@sentinel/hooks` and call as `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/analytics/reports/page.tsx)
- Implement `useServerPagination` and pass pagination to `useAnalyticsReportsQuery`.

#### [MODIFY] [analytics-reports-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/analytics/_components/analytics-reports-list.tsx)
- Pass `pagination`, `onPaginationChange`, `pageCount`, and `manualPagination` props to `DataTable`.

---

### Sentinel Core App (`sentinel-core`)

Replace inline pagination state + reset effects with `useServerPagination` in the following page components:

#### [MODIFY] [courses-page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/courses/courses-page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [subjects-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-view.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/rooms/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/semesters/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/departments/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/sections/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [auth-log-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/logs/_components/auth-log-table.tsx)
- Replace local state with `useServerPagination()`.

#### [MODIFY] [system-log-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/logs/_components/system-log-table.tsx)
- Replace local state with `useServerPagination()`.

#### [MODIFY] [activity-log-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/logs/_components/activity-log-table.tsx)
- Replace local state with `useServerPagination()`.

#### [MODIFY] [use-question-bank-filters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/_hooks/use-question-bank-page/_hooks/use-question-bank-filters.ts)
- Replace local state with `useServerPagination([deferredSearchQuery, columnFilters])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/tos/retired/page.tsx)
- Replace local state with `useServerPagination([deferredSearchQuery, columnFilters])`.

#### [MODIFY] [use-collection-management.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/question/bank/collections/_hooks/use-collection-management.ts)
- Replace local page state with `useServerPagination` matching the current collections per page size.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/reports/page.tsx)
- Implement `useServerPagination` and pass pagination to `useAnalyticsReportsQuery`.

#### [MODIFY] [analytics-reports-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/analytics/_components/analytics-reports-list.tsx)
- Pass `pagination`, `onPaginationChange`, `pageCount`, and `manualPagination` props to `DataTable`.

#### [MODIFY] [announcements-container.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/_components/announcements-container.tsx)
- Implement `useServerPagination` watching search/filters and pass page/limit to `useAnnouncementsQuery`.

#### [MODIFY] [announcements-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/_components/announcements-list.tsx)
- Pass pagination-related props to `DataTable` with `manualPagination`.

---

### Sentinel Web App (`sentinel-web`)

Replace inline pagination state + reset effects with `useServerPagination` in the following instructor views:

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/page.tsx)
- Replace local state with `useServerPagination([debouncedSearch])`.

#### [MODIFY] [use-question-bank-filters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_hooks/use-question-bank-page/_hooks/use-question-bank-filters.ts)
- Replace local state with `useServerPagination([deferredSearchQuery, columnFilters])`.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/retired/page.tsx)
- Replace local state with `useServerPagination([deferredSearchQuery, columnFilters])`.

#### [MODIFY] [use-collection-management.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_hooks/use-collection-management.ts)
- Replace local page state with `useServerPagination` matching the current collections per page size.

#### [MODIFY] [announcements-container.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-container.tsx)
- Implement `useServerPagination` and pass page/limit to `useAnnouncementsQuery`.

#### [MODIFY] [announcements-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-list.tsx)
- Pass pagination-related props to `DataTable` with `manualPagination`.

---

## Verification Plan

### Automated Tests
- Run `pnpm --dir packages/hooks test` to verify hook unit tests.
- Run `pnpm test` (through Turbo) to verify that all app test suites build and pass without regressions.

### Manual Verification
- Run `pnpm build` across the entire workspace to verify compilation of all next apps (`sentinel-core`, `sentinel-web`, `sentinel-support`) and shared packages.
