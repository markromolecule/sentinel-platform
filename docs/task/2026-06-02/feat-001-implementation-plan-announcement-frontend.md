# feat-001: Announcement Frontend — Connect & Improve

## Summary

Connect all three announcement pages (`sentinel-web`, `sentinel-core`, `sentinel-support`) to the
real API using the shared `@sentinel/hooks` query and mutation hooks. Remove all `MOCK_ANNOUNCEMENTS`
references, wire up create/edit/delete flows to live mutations, align column definitions to the
real `Announcement` type from `@sentinel/services`, and improve UX with loading skeletons, empty
states, and confirmation dialogs.

---

## Viable Options (1-3-1 Rule)

### Option A — Simple / Fast: Inline query calls in each page

Replace `MOCK_ANNOUNCEMENTS` in each page with `useAnnouncementsQuery()` inline. Reuse existing
`AnnouncementsList` and `AddAnnouncementDialog` components, just plumbing the data through.

- **Tradeoff**: Fastest path, but duplicates data-fetching logic across three apps with no shared
  container component — harder to keep in sync when the API shape evolves.

### Option B — Robust / Scalable: Shared container component per role-group ✅ BEST

Create a thin `AnnouncementsContainer` client component in each app that owns the query/mutation
calls, then passes typed props down to `AnnouncementsList` and dialogs. Each app keeps its own
`_components/` but the hook usage follows the same pattern, making audits easy.

- **Tradeoff**: Slightly more files per app, but keeps components pure, follows existing project
  conventions (`DataTable` + `columns` pattern), and makes testing straightforward.

### Option C — Creative: Shared UI package container

Extract a single `<AnnouncementsPageShell>` component into `packages/ui` that all three apps import.

- **Tradeoff**: Maximally DRY, but over-engineering for three apps that have subtly different role
  permissions and column sets; cross-package changes would be a larger blast radius.

---

## Selected: **Option B** — Container component per app

**Why**: Each app already has its own `_components/` folder and the existing DataTable + columns
pattern is established. Option B extends that cleanly without introducing a cross-package dependency
that ties three Next.js apps to a common UI component with app-specific logic.

---

## Pre-Planning Checklist

- [x] Read and summarized the task (connect real API, improve UX across all 3 apps)
- [x] Scanned `packages/hooks/src/query/announcements/` — all CRUD hooks ready
- [x] Scanned `packages/services/src/api/announcements.ts` — `Announcement` interface confirmed
- [x] Identified affected pages and components across `sentinel-web`, `sentinel-core`, `sentinel-support`
- [x] Confirmed `MOCK_ANNOUNCEMENTS` shape differs from API `Announcement` type (missing `targetAudience`, `author` fields — see note below)
- [x] Prisma migration: **Not required** — no schema changes

> [!IMPORTANT]
> The real API `Announcement` type (from `@sentinel/services`) does **not** include `targetAudience`
> or `author` fields — those exist only in the shared mock type. Column definitions that reference
> `row.original.targetAudience` and `row.getValue('author')` must be updated to map to
> `author_id` and omit audience filtering, or the columns must be removed/adapted.

---

## Affected Files

### `packages/` — No changes required

All hooks and services are already implemented and exported.

---

### `app/sentinel-web` — Instructor view (read-only list)

#### [NEW] `_components/announcements-container.tsx`

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/announcements/page.tsx>)

#### [MODIFY] [announcements-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-list.tsx>)

#### [MODIFY] [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/columns.tsx>)

---

### `app/sentinel-core` — Admin/superadmin view (full CRUD)

#### [NEW] `_components/announcements-container.tsx`

#### [NEW] `_components/edit-announcement-dialog.tsx`

#### [NEW] `_components/delete-announcement-dialog.tsx`

#### [NEW] `_lib/get-announcement-status.ts`

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/page.tsx>)

#### [MODIFY] [announcements-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/_components/announcements-list.tsx>)

#### [MODIFY] [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/_components/columns.tsx>)

#### [MODIFY] [add-announcement-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx>)

---

### `app/sentinel-support` — Support portal (full CRUD, mirrors core)

#### [NEW] `_components/announcements-container.tsx`

#### [NEW] `_components/edit-announcement-dialog.tsx`

#### [NEW] `_components/delete-announcement-dialog.tsx`

#### [NEW] `_lib/get-announcement-status.ts`

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/page.tsx>)

#### [MODIFY] [announcements-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/_components/announcements-list.tsx>)

#### [MODIFY] [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/_components/columns.tsx>)

#### [MODIFY] [add-announcement-dialog.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx>)

---

## Phased Implementation

---

### Phase 1: Align Column Definitions to Real API Type

**Goal:** Update all `columns.tsx` files across the three apps to use the real `Announcement` type
from `@sentinel/services`, removing references to non-existent mock fields.

- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/columns.tsx`
    - Remove import of `Announcement` from `@sentinel/shared/types`
    - Import `Announcement` from `@sentinel/services`
    - Replace `publishedAt` accessor with `published_at` (snake_case)
    - Replace `author` column display with `author_id`

- [x] Update `app/sentinel-core/src/app/(protected)/announcements/_components/columns.tsx`
    - Remove import of `Announcement` from `@sentinel/shared/types`
    - Import `Announcement` from `@sentinel/services`
    - Remove `targetAudience` column (field does not exist in API type)
    - Replace `author` column with `author_id`
    - Replace `publishedAt` with `published_at`
    - Derive status label from `published_at`/`unpublished_at` — call `getAnnouncementStatus()` in cell renderer
    - Keep action buttons (Publish / Edit / Delete) wired as no-ops until Phase 3

- [x] Update `app/sentinel-support/src/app/(protected)/announcements/_components/columns.tsx`
    - Same changes as sentinel-core above

- [x] Write column tests at `app/sentinel-core/src/app/(protected)/announcements/_components/columns.test.tsx`
    - Verify that derived status renders the correct badge label for draft/published/unpublished

**Migration required:** No

---

### Phase 2: Connect `sentinel-web` Instructor Page to Real API

**Goal:** Replace `MOCK_ANNOUNCEMENTS` in the instructor page with live data from
`useAnnouncementsQuery`, add loading skeleton and empty state.

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-container.tsx`
    - `'use client'` directive
    - Call `useAnnouncementsQuery()` from `@sentinel/hooks`
    - Render a `Skeleton` grid (5 rows) from `@sentinel/ui` while `isLoading === true`
    - Pass `data.data` (`Announcement[]`) to `AnnouncementsList` on success
    - Render `<p className="text-muted-foreground">No announcements yet.</p>` when list is empty

- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/announcements/page.tsx`
    - Remove `MOCK_ANNOUNCEMENTS` import
    - Remove direct `AnnouncementsList` import
    - Render `<AnnouncementsContainer />` instead

- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-list.tsx`
    - Change prop type from mock `Announcement` to `Announcement` from `@sentinel/services`

- [x] Write Vitest test for `AnnouncementsContainer` at:
    - `app/sentinel-web/src/app/(protected)/(instructor)/announcements/_components/announcements-container.test.tsx`
    - Mock `useAnnouncementsQuery` → assert loading renders skeleton, success renders list, empty renders empty state

**Migration required:** No

---

### Phase 3: Wire `sentinel-core` Create/Edit/Delete to Live Mutations

**Goal:** Fully connect the `sentinel-core` announcement CRUD flow to the real API via shared
mutation hooks.

- [x] Create `app/sentinel-core/src/app/(protected)/announcements/_lib/get-announcement-status.ts`
    - Export `getAnnouncementStatus(announcement: Announcement): 'draft' | 'published' | 'unpublished'`
    - Returns `'published'` if `published_at != null && unpublished_at == null`
    - Returns `'unpublished'` if `unpublished_at != null`
    - Returns `'draft'` otherwise
    - JSDoc on the exported function

- [x] Write unit tests at `app/sentinel-core/src/app/(protected)/announcements/_lib/get-announcement-status.test.ts`
    - Cover all three status branches

- [x] Update `app/sentinel-core/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx`
    - Remove `console.log` and `toast.success('Announcement saved as draft')` mock
    - Import `useCreateAnnouncementMutation` from `@sentinel/hooks`
    - Call `mutation.mutate({ title, content, published_at, unpublished_at })` in `onSubmit`
    - Map `publishedAt` form field → `published_at` in `CreateAnnouncementDto`
    - Close dialog and reset form in mutation `onSuccess`
    - Disable submit button while `mutation.isPending`

- [x] Create `app/sentinel-core/src/app/(protected)/announcements/_components/edit-announcement-dialog.tsx`
    - Accept `announcement: Announcement`, `open: boolean`, `onOpenChange: (open: boolean) => void` props
    - Pre-populate form with announcement data
    - Import `useUpdateAnnouncementMutation` from `@sentinel/hooks`
    - Call `mutation.mutate({ id: announcement.id, payload })` on submit
    - Disable submit while `mutation.isPending`
    - JSDoc on the exported function

- [x] Create `app/sentinel-core/src/app/(protected)/announcements/_components/delete-announcement-dialog.tsx`
    - Accept `announcementId: string`, `announcementTitle: string`, `open`, `onOpenChange` props
    - Render an `AlertDialog` with destructive confirmation button
    - Import `useDeleteAnnouncementMutation` from `@sentinel/hooks`
    - Call `mutation.mutate(announcementId)` on confirm
    - Disable confirm button while `mutation.isPending`
    - JSDoc on the exported function

- [x] Create `app/sentinel-core/src/app/(protected)/announcements/_components/announcements-container.tsx`
    - `'use client'` directive
    - Call `useAnnouncementsQuery({ page: 1, limit: 20 })` with debounced `search` state via `useDebounce`
    - Manage `editingAnnouncement: Announcement | null` and `deletingAnnouncement: Announcement | null` local state
    - Pass `onEdit` and `onDelete` callbacks into `AnnouncementsList` as props
    - Render `EditAnnouncementDialog` and `DeleteAnnouncementDialog` conditionally
    - Render `Skeleton` rows while loading, empty state when `data.data.length === 0`
    - Render status filter tabs (`All` / `Draft` / `Published`) using `Tabs` from `@sentinel/ui`; pass selected status as `params.status`

- [x] Update `app/sentinel-core/src/app/(protected)/announcements/_components/announcements-list.tsx`
    - Add `onEdit?: (announcement: Announcement) => void` and `onDelete?: (announcement: Announcement) => void` props
    - Pass them into `DataTable` as `meta={{ onEdit, onDelete }}`

- [x] Update `app/sentinel-core/src/app/(protected)/announcements/_components/columns.tsx` action cells
    - Edit button calls `table.options.meta?.onEdit(row.original)`
    - Delete button calls `table.options.meta?.onDelete(row.original)`
    - Publish button calls `useUpdateAnnouncementMutation` inline with `{ published_at: new Date().toISOString() }`, only visible when `getAnnouncementStatus(row.original) === 'draft'`

- [x] Update `app/sentinel-core/src/app/(protected)/announcements/page.tsx`
    - Remove `'use client'` directive (becomes a server component)
    - Remove `MOCK_ANNOUNCEMENTS` import
    - Render `<AnnouncementsContainer />`

- [x] Write Vitest tests at `app/sentinel-core/src/app/(protected)/announcements/_components/`:
    - `add-announcement-dialog.test.tsx` — mock `useCreateAnnouncementMutation`, assert called with correct `CreateAnnouncementDto`
    - `delete-announcement-dialog.test.tsx` — mock `useDeleteAnnouncementMutation`, assert confirm calls mutation with correct id

**Migration required:** No

---

### Phase 4: Wire `sentinel-support` to Live Mutations

**Goal:** Mirror Phase 3 for the `sentinel-support` portal.

- [x] Create `app/sentinel-support/src/app/(protected)/announcements/_lib/get-announcement-status.ts`
    - Identical to sentinel-core's `get-announcement-status.ts`

- [x] Write unit tests at `app/sentinel-support/src/app/(protected)/announcements/_lib/get-announcement-status.test.ts`

- [x] Update `app/sentinel-support/src/app/(protected)/announcements/_components/add-announcement-dialog.tsx`
    - Same changes as Phase 3 for sentinel-core

- [x] Create `app/sentinel-support/src/app/(protected)/announcements/_components/edit-announcement-dialog.tsx`
    - Identical structure to sentinel-core's `edit-announcement-dialog.tsx`

- [x] Create `app/sentinel-support/src/app/(protected)/announcements/_components/delete-announcement-dialog.tsx`
    - Identical structure to sentinel-core's `delete-announcement-dialog.tsx`

- [x] Create `app/sentinel-support/src/app/(protected)/announcements/_components/announcements-container.tsx`
    - Same pattern as sentinel-core's container

- [x] Update `app/sentinel-support/src/app/(protected)/announcements/_components/announcements-list.tsx`
    - Accept same `onEdit` / `onDelete` callbacks; pass into `DataTable` via `meta`

- [x] Update `app/sentinel-support/src/app/(protected)/announcements/page.tsx`
    - Remove `'use client'`, remove `MOCK_ANNOUNCEMENTS`, render `<AnnouncementsContainer />`

- [x] Write Vitest tests at `app/sentinel-support/src/app/(protected)/announcements/_components/`:
    - `add-announcement-dialog.test.tsx`
    - `delete-announcement-dialog.test.tsx`

**Migration required:** No

---

### Phase 5: UX Polish — Skeleton, Empty State, Search, Pagination

**Goal:** Ensure consistent, polished UX with search debounce, status tabs, and skeleton loading
across all three apps.

- [x] Verify `AnnouncementsSkeleton` is rendered in all three containers while `isLoading === true`
    - Use `Skeleton` from `@sentinel/ui` to mock 5 placeholder rows matching the DataTable column count

- [x] Confirm `useDebounce` (from `packages/hooks/src/use-debounce.ts`) is applied to the search
      input in sentinel-core and sentinel-support containers (300ms debounce before passing to `useAnnouncementsQuery`)

- [x] Confirm status filter tabs (`All`, `Draft`, `Published`) map correctly to `AnnouncementQueryParams.status`
      in sentinel-core and sentinel-support containers

- [x] Add empty state message to sentinel-web container (read-only, no create button shown to student)

- [x] Run full test suite: `pnpm --dir app/sentinel-core test` and `pnpm --dir app/sentinel-support test`

**Migration required:** No

---

## Done Criteria

- [x] No `MOCK_ANNOUNCEMENTS` import remains in any app's announcement page or component
- [x] All three apps fetch live data via `useAnnouncementsQuery`
- [x] `sentinel-core` and `sentinel-support` can create, edit, publish, and delete announcements
- [x] Column definitions use `Announcement` from `@sentinel/services` (not `@sentinel/shared/types`)
- [x] Loading skeletons render during fetch; empty states render when no data
- [x] All exported functions have JSDoc
- [x] All Vitest tests pass with no skipped or failing cases
- [x] Prisma migration: **Not applied** (no schema changes)
- [x] `sentinel-web` instructor page is read-only (no create/edit/delete UI)

---

## Additional Considerations

- **Breaking change**: `Announcement` mock type fields `targetAudience` (array) and `author` (string)
  do not exist in the API type — components importing from `@sentinel/shared/types` must switch to
  `@sentinel/services`. This affects `columns.tsx` and `announcements-list.tsx` in all three apps.
- **No new env variables** needed — all hooks use the existing `apiClient` from `useApi()`.
- **Rollback**: No migration to roll back; reverting is restoring the `MOCK_ANNOUNCEMENTS` import.
- **Out of scope**: `sentinel-web` student notifications page (`notification-list.tsx`) — does not
  depend on `MOCK_ANNOUNCEMENTS`.

---

## Reference

- [useAnnouncementsQuery](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/announcements/use-announcements-query.ts)
- [useCreateAnnouncementMutation](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/announcements/use-create-announcement-mutation.ts)
- [useUpdateAnnouncementMutation](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/announcements/use-update-announcement-mutation.ts)
- [useDeleteAnnouncementMutation](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/announcements/use-delete-announcement-mutation.ts)
- [announcements.ts (service)](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/announcements.ts)
