# Refactor Incident Logs Table to DataTable

Migrate the custom incident table in `incident-table.tsx` to the central `DataTable` component from `@sentinel/ui` (`packages/ui/src/components/ui/data-table/data-table.tsx`) without card wrappers, and use the built-in search and facets instead of custom local dropdown controls.

---

## 1-3-1 Architectural Alternatives

### 1. Problem Description

We need to replace the custom raw table rendering inside the incident logs view with the centralized, TanStack-based `DataTable` component. The user specified two requirements:

1. Do not wrap the table in standard cards (remove the local relative flex card styles).
2. Use built-in facets for filtering, strictly following how they are used on other pages.

### 2. Three Viable Options

#### Option A: Retain IncidentFilters and render standard DataTable

Keep the custom dropdown controls above the table, but remove the outer card wrapper from the table component.

- **Tradeoff**: Simple to implement, but violates the user's explicit directive to use `DataTable` facets for unified platform design patterns.

#### Option B: Use DataTable Search/Facets and Remove Custom Card Wrappers (Recommended)

Remove the `IncidentFilters` component and custom outer cards entirely. Define search and facet structures (Section, Severity, Type, Status) and pass them directly to `<DataTable>`, mapping the react-table `columnFilters` back to the API query parameters.

- **Tradeoff**: Requires rewriting state and query parameter mapping in `page.tsx`, but perfectly matches standard pages (like Question Bank) and satisfies all requirements.

#### Option C: Client-side filtering only

Load all logs into memory and let `DataTable` filter locally using client-side facets.

- **Tradeoff**: Very simple, but breaks infinite scrolling / lazy page loading and performs poorly under massive data sets.

### 3. Best Option Selection

We select **Option B**. It strictly follows the design pattern of other Sentinel pages, conslidates search/filters on the unified `DataTable` layout, and maintains the server-side filtering via query parameters.

---

## Proposed Changes

### Frontend UI Components (app/sentinel-web)

#### [MODIFY] [incident-table.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/incident-table.tsx>)

- Remove custom `relative flex flex-col border rounded-xl shadow-sm` outer card wrapper.
- Configure `facets` prop mapping for Section, Severity, Type, and Status.
- Pass `searchValue`, `onSearchChange`, `columnFilters`, and `onColumnFiltersChange` to `<DataTable>`.
- Keep the infinite scroll observer target underneath `<DataTable>`.

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx>)

- Delete the old local custom `IncidentFilters` component import and rendering.
- Replace separate filter states (`sectionId`, `severity`, `type`, `status`) with a single `columnFilters` state.
- Map `columnFilters` to `ApiGetExamIncidentsQuery` attributes.
- Pass filter values and handlers to `<IncidentTable>`.

---

## Phases & Execution Plan

### Phase 1: Implement Facets and Refactor IncidentTable

**Goal:** Migrate `incident-table.tsx` to render `DataTable` with built-in search and facets, without card wrappers.

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/incident-table.tsx`
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx`
- [x] Run `pnpm --dir app/sentinel-web test` to verify compilation and client tests compile and pass

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-web test` to verify page and table tests.

### Manual Verification

1. Navigate to `/exams/logs?examId=exam-uuid-123` (or select an exam).
2. Verify the incident logs table renders correctly without double-card styling.
3. Confirm that the top action bar shows the inline `SearchBar` ("Search student...") and the Section, Severity, Incident Type, and Status facet filters.
4. Verify clicking facets correctly updates the data in the table.
