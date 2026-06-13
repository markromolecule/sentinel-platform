# Classroom Archiving Frontend & UI Implementation Plan

Add the "Archive" action to classrooms, support toggling active/archived classrooms using Tabs in the classrooms dashboard, and hook up the backend endpoints.

---

## 1-3-1 Rule Options

### 3 Viable Options

#### Option 1: Tabs Toggle on main Dashboard (Recommended)

- **Approach:** Add a `Tabs` component with "Active" and "Archived" tabs to the main classroom list page. Keep the filters and search consistent across both tabs.
- **Tradeoff:** Cleanest UX, hides completed semesters/archived content by default while making it easily retrievable.

#### Option 2: Status Facet Filter in DataTable

- **Approach:** Add a `Status` facet filter to the `DataTable` itself, allowing instructors to filter rows by active/archived status directly in the table filters.
- **Tradeoff:** Less UI scaffolding, but clutters the active list with inactive/archived items by default unless a default filter state is injected.

#### Option 3: Separate Archived Page

- **Approach:** Create a separate route/page (e.g., `/classrooms/archived`) to view archived classrooms.
- **Tradeoff:** Keeps active route page simpler, but introduces redundant layout, routing overhead, and a disjointed navigation experience.

### 1 Recommended Best Option

We choose **Option 1** (Tabs Toggle) because it matches the UX patterns already established in other dashboards (like the Exams page) and cleanly separates active work from historical records without requiring the user to navigate to a different route.

---

## Proposed Changes

### Phase 1: Shared Schema & API Services

**Goal:** Map the `archivedAt` timestamp and expose endpoints for archiving and unarchiving classrooms in the API client package.

- [x] Modify [classroom.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/types/classroom.ts) to add `archivedAt?: string | null;` to `ClassroomSummary` and `ClassroomDetail` types.
- [x] Modify [classrooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/classrooms.ts) to:
    - Add optional `archived_at?: string | null` to `ApiClassroomSummary`.
    - Map `archivedAt: classroom.archived_at` in `mapClassroomSummary`.
    - Update `getClassrooms` signature to accept `status?: 'active' | 'archived' | 'all'` in its query object, appending it to the query parameters if present.
    - Implement `archiveClassroom(apiClient, id)` and `unarchiveClassroom(apiClient, id)` patch request helpers.
- [x] Create a new unit test file [classrooms.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/classrooms.test.ts) to verify the new status parameter and endpoints mapping.
      **Migration required:** No

---

### Phase 2: React Query Hooks

**Goal:** Implement React Query hooks for archiving/unarchiving and status-based query fetching.

- [x] Modify [use-classrooms-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-classrooms-query.ts) to:
    - Support `status?: 'active' | 'archived' | 'all'` in the arguments.
    - In `normalizeClassroomQueryArgs`, include the `status` (defaulting to `'active'`).
- [x] Create [use-archive-classroom-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-archive-classroom-mutation.ts) to expose the archive mutation.
- [x] Create [use-unarchive-classroom-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-unarchive-classroom-mutation.ts) to expose the unarchive mutation.
- [x] Modify [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/index.ts) to export both mutations.
- [x] Update [use-classrooms-query.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-classrooms-query.test.ts) to verify `status` propagation and query keys.
      **Migration required:** No

---

### Phase 3: Web UI & Controls

**Goal:** Modify the classrooms dashboard list and action cell to support archiving operations.

- [x] Modify [classroom-action-cell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components/classroom-action-cell.tsx>) to:
    - Check `classrooms:archive` permissions using `useActivePermissions()`.
    - Render "Archive" or "Unarchive" menu options based on `classroom.archivedAt` status.
    - Implement confirmation dialogs for archiving and unarchiving actions before firing mutations.
- [x] Modify [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/page.tsx>) to:
    - Add tab states: active vs archived.
    - Fetch query results based on selected tab state.
    - Render a `Tabs` container enclosing the lists.
- [x] Add basic component test for [classroom-action-cell.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components/classroom-action-cell.test.tsx>) to verify visibility of the "Archive/Unarchive" options when the user has appropriate permissions.
      **Migration required:** No

---

### Phase 4: Core Web UI & Controls

**Goal:** Modify the sentinel-core classrooms dashboard list and action cell to support archiving operations.

- [x] Modify [classroom-action-cell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/_components/classroom-action-cell.tsx) to:
    - Render "Archive" or "Unarchive" menu options based on `classroom.archivedAt` status under `PermissionGate` (permission: `classrooms`, action: `edit`).
    - Implement confirmation dialogs for archiving and unarchiving actions before firing mutations.
- [x] Modify [classrooms-page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/classrooms-page.tsx) to:
    - Add tab states: active vs archived.
    - Fetch query results based on selected tab state.
    - Render a `Tabs` container enclosing the lists.
- [x] Add basic component test for [classroom-action-cell.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/_components/classroom-action-cell.test.tsx) to verify visibility of the "Archive/Unarchive" options.
- [x] Update [classrooms-page.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/classrooms-page.test.tsx) to verify the tab status parameter propagation.
      **Migration required:** No

---

## Verification Plan

### Automated Tests

- Run query hook unit tests:
    ```bash
    pnpm --dir packages/hooks test classrooms
    ```
- Run services client tests:
    ```bash
    pnpm --dir packages/services test classrooms
    ```
- Run sentinel-core classroom tests:
    ```bash
    pnpm --dir app/sentinel-core test classrooms
    ```

### Manual Verification

1. Navigate to `/classrooms` on both `sentinel-web` (instructor portal) and `sentinel-core` (admin portal).
2. Verify tab triggers for "Active" and "Archived" appear.
3. Click "Archive" on an active classroom. Confirm it displays success toast and disappears.
4. Click "Archived" tab, verify classroom appears.
5. Click "Unarchive" on the archived classroom. Confirm it displays success toast and returns to the active list.
