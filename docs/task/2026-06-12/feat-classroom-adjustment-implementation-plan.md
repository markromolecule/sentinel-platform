# Classroom UI Adjustment & Bulk Delete Implementation Plan

Re-design the Active/Archived classroom tabs to be compact iOS-like Segmented Controls, add selection checkboxes to the classrooms list tables, and implement a robust backend bulk-delete endpoint on both the frontend portals (`sentinel-web` and `sentinel-core`) and api backend (`sentinel-api`).

---

## 1-3-1 Rule Options

### 3 Viable Options

#### Option 1: Native Bulk-Delete Endpoint (Recommended)
- **Approach:** Add a `/bulk-delete` POST endpoint to the classroom API routes, processing all deletions in a single DB operation and returning a single TanStack query mutation.
- **Tradeoff:** Cleanest architecture, type-safe validation, minimal network overhead, but requires creating new controller and service files.

#### Option 2: Sequential Frontend Parallel Deletions
- **Approach:** Loop over the list of selected IDs directly on the client, firing off multiple parallel/sequential single `DELETE /classrooms/:id` requests.
- **Tradeoff:** Reuses the existing single delete endpoint without backend updates, but results in multiple HTTP requests, lacks transaction guarantees, and increases telemetry spam.

#### Option 3: Overloaded Delete Endpoint
- **Approach:** Modify the existing single `DELETE /:id` route to parse comma-separated values or accept a request body.
- **Tradeoff:** Avoids a new route definition, but makes parameter validation schema messy, breaks OpenAPI contract standards, and complicates path matching.

### 1 Recommended Best Option

We choose **Option 1** (Native Bulk-Delete Endpoint) because it matches the bulk-deletion patterns established for `rooms`, `users`, and `departments` in the monorepo. It maintains type safety via `@hono/zod-openapi` and ensures a fast, transactional single-request execution on the backend.

---

## User Review Required

> [!IMPORTANT]
> The bulk-deletion operation is destructive and will cascade to roster entries (class enrollments). A clear confirmation dialog will be shown on the client before proceeding.

---

## Open Questions

None at this time. The requirements in `june-12-classroom-adjustment.md` are well-specified.

---

## Proposed Changes

### Phase 1: Backend API Support

**Goal:** Create the `/bulk-delete` endpoint in `sentinel-api` with proper validation, controller, and query-based service.

#### [MODIFY] [classroom.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.dto.ts)
- Add `bulkDeleteClassroomsSchema` defining the request body (containing an array of UUIDs `ids`) and response schema (message and null data).
- Export type `BulkDeleteClassroomsBody` from the schema.

#### [NEW] [bulk-delete-classrooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/controllers/bulk-delete-classrooms.controller.ts)
- Define `bulkDeleteClassroomsRoute` as a POST `/bulk-delete` route requiring `classrooms:delete` permissions.
- Implement the route handler calling `ClassroomService.bulkDeleteClassrooms` and returning a 200 JSON success response.

#### [NEW] [bulk-delete-classrooms.controller.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/controllers/bulk-delete-classrooms.controller.test.ts)
- Write Vitest tests to mock `ClassroomService.bulkDeleteClassrooms` and assert status codes for valid payload (200), missing permissions (403), and invalid payload (400).

#### [MODIFY] [classroom-write.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.ts)
- Implement `bulkDeleteClassrooms` service method accepting `classGroupIds` array.
- Query accessible classrooms based on the user's role (allowing admins/superadmins to delete any classroom in the institution, and instructors to only delete classrooms where they are assigned as instructors).
- Delete the matched classrooms in bulk and send activity log notifications for each deleted item.

#### [NEW] [classroom-write.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/services/classroom-write.service.test.ts)
- Write Vitest tests for the `bulkDeleteClassrooms` service to verify administrative access deletes everything, instructor access is gated to assigned classrooms, and notifications are triggered.

#### [MODIFY] [classroom.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.service.ts)
- Add static `bulkDeleteClassrooms` calling `bulkDeleteClassrooms` service.

#### [MODIFY] [classroom.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/classroom/classroom.routes.ts)
- Register `bulkDeleteClassroomsRoute` and its handler in Hono.

**Migration required:** No

---

### Phase 2: Services & Hooks Integration

**Goal:** Expose the client api function and react-query mutation hooks to the frontend workspaces.

#### [MODIFY] [classrooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/classrooms.ts)
- Implement `bulkDeleteClassrooms(apiClient, ids)` calling POST `/classrooms/bulk-delete`.

#### [NEW] [use-bulk-delete-classrooms-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-bulk-delete-classrooms-mutation.ts)
- Create the mutation hook utilizing `bulkDeleteClassrooms` service.
- In `onSuccess`, invalidate `CLASSROOM_QUERY_KEYS.all` and remove details queries for each deleted classroom ID.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/index.ts)
- Export `useBulkDeleteClassroomsMutation` from query classrooms.

#### [NEW] [use-bulk-delete-classrooms-mutation.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/classrooms/use-bulk-delete-classrooms-mutation.test.ts)
- Write Vitest test confirming mutation calls service and invalidates correct query client keys.

**Migration required:** No

---

### Phase 3: Sentinel-Web Frontend Realization

**Goal:** Redesign tabs in `sentinel-web` classroom dashboard and add bulk checkboxes/deletion logic.

#### [MODIFY] [classroom-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components/classroom-columns.tsx)
- Insert a checkbox column at index 0 in `createClassroomColumns`.
- Wrap checkbox cell in `<div onClick={(e) => e.stopPropagation()}>` to avoid row click routing navigation.

#### [MODIFY] [classrooms-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components/classrooms-list.tsx)
- Keep local `rowSelection` state and hook it into `DataTable`'s `rowSelection` and `onRowSelectionChange`.
- Listen to tab changes to clear selections.
- Compute selected classroom IDs.
- Render a "Delete Selected (X)" button in `toolbarActions` when selection is active.
- Expose an AlertDialog confirmation modal for bulk deletion. On confirmation, invoke the `useBulkDeleteClassroomsMutation` and reset selection.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/classrooms/page.tsx)
- Redesign `TabsList` to use the standard compact layout, replacing custom styling with a fixed-width container:
  ```tsx
  <TabsList className="grid grid-cols-2 w-[160px] h-9 p-0.5 bg-muted">
      <TabsTrigger value="active" className="text-xs font-semibold rounded-md">Active</TabsTrigger>
      <TabsTrigger value="archived" className="text-xs font-semibold rounded-md">Archived</TabsTrigger>
  </TabsList>
  ```

**Migration required:** No

---

### Phase 4: Sentinel-Core Frontend Realization

**Goal:** Apply the same compact segmented tabs design and bulk deletion to `sentinel-core`.

#### [MODIFY] [classroom-columns.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/_components/classroom-columns.tsx)
- Append checkbox column as the first item in the columns configuration array.
- Wrap in event propagation blocker.

#### [MODIFY] [classrooms-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/_components/classrooms-list.tsx)
- Manage table row selection state and pass to `DataTable`.
- Render a gated/permitted "Delete Selected (X)" button in `toolbarActions` using `PermissionGate`.
- Integrate delete confirmation alert dialog calling `useBulkDeleteClassroomsMutation`.

#### [MODIFY] [classrooms-page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/features/administration/classrooms/classrooms-page.tsx)
- Replace custom `TabsList` classes with the compact, iOS-like segmented control grid design (`w-[160px] h-9` grid setup).

**Migration required:** No

---

## Verification Plan

### Automated Tests

- **API Endpoint Tests:**
  ```bash
  pnpm --dir app/sentinel-api test bulk-delete-classrooms
  ```
- **Service Write Tests:**
  ```bash
  pnpm --dir app/sentinel-api test classroom-write
  ```
- **Query Hook Mutation Tests:**
  ```bash
  pnpm --dir packages/hooks test use-bulk-delete-classrooms-mutation
  ```

### Manual Verification

1. **iOS Segmented Control Check:**
   - Launch Sentinel development server and navigate to Classrooms dashboard on `sentinel-web` and `sentinel-core`.
   - Verify the tabs "Active" and "Archived" appear as a compact, neat segmented control container without ugly borders.

2. **Bulk Select & Delete Flow:**
   - Select multiple classrooms using the checkboxes on the table rows.
   - Click the "Delete Selected" button in the toolbar.
   - Verify the confirmation dialog appears and correctly reports the count of selected items.
   - Confirm deletion. Assert that the selected classrooms are removed, success toast shows, and the selection clears.
   - Navigate to a deleted classroom URL to verify it returns a 404.
