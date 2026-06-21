# Student History & Calendar UX Responsiveness Implementation Plan

Improve the UX and responsiveness of the Student History and Calendar pages by aligning page margins, implementing backend-supported infinite scroll pagination for history records, and enhancing calendar styling and validation.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Basic Layout Styling & In-Memory Client-side Pagination (Simple/Fast)

- **Description**: Adjust wrapper margins on both pages to align left and right layouts. Retain the existing `useExamHistoryQuery` hook fetching all items, but perform client-side slicing and append a scroll listener to simulate lazy rendering of elements.
- **Tradeoff**: Extremely quick to implement with zero backend changes, but does not address potential database and network loading overhead for accounts with large exam history logs.

#### Option 2: Backend-supported Infinite Scroll with Layout Alignment & Coordinate Calendar Event Themes (Robust/Scalable) [RECOMMENDED]

- **Description**:
    - **Backend**: Update the `/history` endpoint to accept `page`, `limit`, `status`, and `search` query parameters, returning a standardized paginated response using in-memory filter slicing over Kysely results to preserve exact status resolution logic.
    - **Frontend**: Add `useInfiniteExamHistoryQuery` hook in `packages/hooks` utilizing TanStack's `useInfiniteQuery`. Integrate this into `useStudentHistory` and set up an `IntersectionObserver` scroll listener in the history page.
    - **Calendar**: Remove custom container constraints in the calendar page to match standard layout margins. Dynamically style event pills on the calendar grid and sheet based on type (e.g. Amber for Exams, Blue for Notes, Purple for Announcements, Green for Holidays, Rose for Maintenance). Add form start/end time validation when creating personal notes.
- **Tradeoff**: Requires changes across backend, packages, and web frontend layers, but ensures production-grade performance and excellent UX.

#### Option 3: Virtualized History List & Split Calendar Sidebar Desktop View (Creative)

- **Description**: Implement list virtualization (via react-window) for rendering infinite student history items. For the calendar, build a side panel detailing events alongside the calendar grid on desktop screen sizes (split layout), allowing drag-and-drop or immediate note management.
- **Tradeoff**: Introduces unnecessary dependency overhead, violates component single-responsibility, and exceeds current design boundaries.

### Selected Option

We choose **Option 2** because it correctly addresses the performance and scale requirements for long exam histories, keeps the application layout clean and consistent, and provides a polished, highly visible calendar representation without adding heavy third-party dependencies.

---

## User Review Required

> [!NOTE]
> The pagination implementation modifies the shared `useExamHistoryQuery` hook structure (via a new infinite variant) and the response schema of the `/history` endpoint. Tests in both `sentinel-api` and `sentinel-web` will be updated to match the new paginated structure.

---

## Proposed Changes

### Phase 1: Backend Pagination Support

**Goal**: Expose paginated endpoints with search and status filtering for student exam history.

- [ ] Modify `getExamHistoryRoute` and schema in `app/sentinel-api/src/modules/examination/history/history.dto.ts` to accept optional `page`, `limit`, `status`, and `search` query parameters, and return pagination metadata.
- [ ] Modify `getExamHistoryRouteHandler` in `app/sentinel-api/src/modules/examination/history/controllers/get-exam-history.controller.ts` to read the query parameters, pass them to `HistoryService`, and return the paginated response.
- [ ] Modify `getStudentExamHistory` in `app/sentinel-api/src/modules/examination/history/services/get-student-exam-history.ts` to apply status filtering, search filtering, and page/limit slicing (pagination) on the mapped database records.
- [ ] Create unit/integration tests for the history controllers and services in `app/sentinel-api/src/modules/examination/history/tests/get-exam-history.test.ts` to verify search, status filtering, and pagination correctness.
- [ ] Run `pnpm --dir app/sentinel-api test` and verify that all tests pass.

**Migration required**: No — Route and service-level paging over existing query fields.

---

### Phase 2: Frontend Hooks & Services

**Goal**: Expose an infinite query hook for fetching paginated exam history records.

- [ ] Modify `getExamHistory` service in `packages/services/src/api/history.ts` to accept optional page, limit, status, and search parameters, returning both the array of items and pagination metadata.
- [ ] Create `useInfiniteExamHistoryQuery` in `packages/hooks/src/query/history/use-infinite-exam-history-query.ts` using TanStack Query's `useInfiniteQuery`.
- [ ] Export `useInfiniteExamHistoryQuery` from `packages/hooks/src/index.ts`.
- [ ] Create unit tests for `useInfiniteExamHistoryQuery` in `packages/hooks/src/query/history/use-infinite-exam-history-query.test.ts` mocking the paginated API service and verifying correct page parameter increments.
- [ ] Run `pnpm test` across packages to verify it works.

**Migration required**: No.

---

### Phase 3: Student History Page Layout & Infinite Scroll

**Goal**: Align page layout margins and implement scroll-to-load infinite pagination on the student history page.

- [ ] Modify `useStudentHistory` in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` to call `useInfiniteExamHistoryQuery` instead of `useExamHistoryQuery`, forwarding search and tab status to the query.
- [ ] Modify `HistoryPageContent` in `app/sentinel-web/src/app/(protected)/student/history/page.tsx` to remove double padding/margins wrapper `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` and implement an `IntersectionObserver` target element at the bottom of the page to trigger `fetchNextPage` when scrolled.
- [ ] Update tests in `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.test.ts` to mock `useInfiniteExamHistoryQuery` instead of `useExamHistoryQuery`.
- [ ] Run `pnpm test` in `app/sentinel-web` and verify that all tests pass.

**Migration required**: No.

---

### Phase 4: Student Calendar Layout & Usability

**Goal**: Align page layout margins and improve UX/color-coding on the student calendar page.

- [ ] Modify `StudentCalendarPage` in `app/sentinel-web/src/app/(protected)/student/calendar/page.tsx` to remove custom max width and padding, replacing them with classes matching classroom details layout, and add start/end time validation logic to notes creation.
- [ ] Modify `CalendarGrid` in `app/sentinel-web/src/features/calendar/components/grid/calendar-grid.tsx` to style individual event pills dynamically using custom theme classes based on event type.
- [ ] Modify `DayDetailsSheet` in `app/sentinel-web/src/features/calendar/components/sheets/day-details-sheet.tsx` to support distinct colors for announcements, maintenance, and holiday event types.
- [ ] Run `pnpm test` in `app/sentinel-web` and verify all tests pass.

**Migration required**: No.

---

## Verification Plan

### Automated Tests

- Run backend history module tests: `pnpm --dir app/sentinel-api test`
- Run shared packages tests: `pnpm --dir packages/hooks test` and `pnpm --dir packages/services test`
- Run frontend student history and calendar page tests: `pnpm --dir app/sentinel-web test`

### Manual Verification

- Access `/student/history` in dev mode:
    - Check left/right alignment matches `/student/classroom` and `/student/classroom/[id]`.
    - Open Developer Tools -> Network tab, and verify that scrolling down triggers incremental requests to `/history?page=2&limit=...` and loads items lazily.
- Access `/student/calendar` in dev mode:
    - Check left/right alignment.
    - Verify event pills in grid and details sheet display coordinate colors.
    - Verify start/end time validation message is displayed when attempting to create a note where end time is before start time.
