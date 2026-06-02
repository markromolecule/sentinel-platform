# feat-001: Subjects Sidebar Layout Redesign

Redesign the Subject page across **sentinel-support**, **sentinel-core**, and **sentinel-web** by converting the flat sub-page navigation into a sidebar layout — mirroring the existing `telemetry` workspace-shell pattern found in `sentinel-support`.

---

## Task Summary

The existing subject pages use a flat, top-level route structure. The goal is to wrap all subject sub-sections under a shared sidebar layout (desktop sidebar + mobile accordion), matching the established `TelemetryWorkspaceShell` / `TelemetryNav` / `TelemetryPageShell` pattern. No new routes are created; instead, the existing pages are wrapped inside a sidebar-aware shell via `layout.tsx`.

---

## Options Analysis (1-3-1 Rule)

### Option A — Client-side state sidebar (in-memory section switch)

Mirror telemetry exactly: a single `page.tsx` drives all sections via `useState`, a workspace shell renders the sidebar, and child views are swapped in memory.

**Tradeoff:** Fast to implement, but URL doesn't reflect the active section (no deep-linking, no browser back navigation per section).

### Option B — Next.js layout + nested routes with sidebar ✅ SELECTED

Add a `layout.tsx` at the `subjects/` level that renders the sidebar shell. Each existing sub-route (`/subjects`, `/subjects/classifications`, `/subjects/offered`, `/subjects/requests`) remains its own `page.tsx`. The sidebar highlights the active link based on `usePathname`.

**Tradeoff:** URL-based navigation and deep-linking work out of the box; more idiomatic Next.js App Router; slightly more boilerplate but each page stays focused.

### Option C — Shared server layout + URL segments via parallel routes

Use Next.js parallel routes (`@slot`) to co-render the sidebar and the active segment simultaneously.

**Tradeoff:** Most powerful, but high complexity and unnecessary for a simple sidebar; overkill for this use case.

### Best Option: **Option B — layout.tsx + nested routes**

**Why:** The sub-pages (`/subjects`, `/subjects/classifications`, `/subjects/offered`, `/subjects/requests`) are already separate Next.js routes with their own `page.tsx`. Option B respects that investment, adds deep-linking for free, follows the App Router convention, and requires minimal refactoring of existing view components. The active sidebar link is driven by `usePathname` — the standard Next.js pattern for persistent sidebar layouts.

---

## Decisions

- **Enrollment Requests in sentinel-support:** ✅ Create a new `/subjects/requests` page in sentinel-support mirroring the sentinel-core implementation.
- **sentinel-web Instructor — Enrollment Requests:** ❌ No new route. Instructor sidebar will only have `list` and `offered`.
- **Sidebar section title:** ✅ Confirmed — **"Subject Management"**.
- **Parent Sidebar Collapsible Menu:** ✅ Omit sub-items/nested children from parent navigation sidebars across all platforms, flattening "Subjects" into a single, clean link to `/subjects`.

---

## Phase 1: sentinel-support — Subject Sidebar Layout

**Goal:** Add a sidebar workspace layout to the support subjects section using the telemetry shell as a direct reference, including a new `/subjects/requests` page.

**Migration required:** No — no DB or schema changes.

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-nav.tsx`
    - Define `SubjectSection`: `'list' | 'classifications' | 'offered' | 'requests'`
    - Export `SubjectNav` styled after `TelemetryNav`
    - Active link driven by `pathname` prop matched against route segments
    - Nav groups: **"Catalog"** (Subject List → `/subjects`, Classifications → `/subjects/classifications`), **"Enrollment"** (Offered Subjects → `/subjects/offered`, Enrollment Requests → `/subjects/requests`)

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-workspace-shell.tsx`
    - Mirror `TelemetryWorkspaceShell`: sticky desktop sidebar (w-64, border-r) + mobile card nav
    - Import `SubjectNav`; use `usePathname` to derive active section
    - Accepts `children: ReactNode`; sidebar header title: "Subject Management"

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-page-shell.tsx`
    - Mirror `TelemetryPageShell`: `PageHeader` + `Separator` + `children`
    - Props: `title: string`, `description: string`, `actions?: ReactNode`, `children: ReactNode`

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/index.ts`
    - Barrel export for `SubjectWorkspaceShell`, `SubjectNav`, `SubjectPageShell`

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/layout.tsx`
    - `'use client'` directive; wrap `{children}` in `SubjectWorkspaceShell`

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/page.tsx`
    - Wrap `<SubjectsView />` in `<SubjectPageShell title="Subject List" description="Browse and manage the institutional subject catalog." />`

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/page.tsx`
    - Wrap view in `<SubjectPageShell title="Subject Classifications" description="Organize subjects into classification groups." />`

- [x] Modify `app/sentinel-support/src/app/(protected)/(support)/subjects/offered/page.tsx`
    - Wrap view in `<SubjectPageShell title="Offered Subjects" description="Review all term-based subject offerings." />`

- [x] Create `app/sentinel-support/src/app/(protected)/(support)/subjects/requests/page.tsx`
    - New page mirroring `sentinel-core`'s `requests/page.tsx`
    - Use `useEnrollmentRequestsQuery`, `useDepartmentsQuery`, `useCoursesQuery`, `useSectionsQuery` from `@sentinel/hooks`
    - Render `<EnrollmentRequestsList />` from `sentinel-core`'s shared components (or duplicate if not importable)
    - Wrap in `<SubjectPageShell title="Enrollment Requests" description="Review and process instructor enrollment requests." />`

- [x] Write `app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-nav.test.tsx`
    - Renders all 4 nav items
    - Applies active styles to item matching mocked `usePathname`
    - Links point to correct routes

- [x] Run `pnpm --dir app/sentinel-support test` — all tests pass

---

## Phase 2: sentinel-core — Subject Sidebar Layout

**Goal:** Add a sidebar workspace layout to the administrator subject section with four fully-functional sub-pages.

**Migration required:** No.

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-nav.tsx`
    - `SubjectSection`: `'list' | 'classifications' | 'offered' | 'requests'`
    - Nav groups: **"Catalog"** (`list`, `classifications`), **"Enrollment"** (`offered`, `requests`)
    - Active state from `pathname` matching

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-workspace-shell.tsx`
    - Same structure as sentinel-support shell

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-page-shell.tsx`
    - Same as sentinel-support page shell

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/layout/index.ts`
    - Barrel export

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/layout.tsx`
    - Wrap `{children}` in `SubjectWorkspaceShell`

- [x] Create `app/sentinel-core/src/app/(protected)/subjects/_components/views/subjects-view.tsx`
    - Extract full render body from current `page.tsx` (search state, permissions, columns, facets, table)

- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/page.tsx`
    - Replace body with `<SubjectPageShell title="Subject Management" ...><SubjectsView /></SubjectPageShell>`
    - Remove outer `flex flex-col gap-6 p-4 md:p-6` wrapper
    - Remove inline `Link href="/subjects/classifications"` Classification button

- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx`
    - Wrap in `<SubjectPageShell title="Subject Classifications" description="..." />`
    - Remove outer padding wrapper and inline `PageHeader`

- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx`
    - Wrap in `<SubjectPageShell title="Offered Subjects" description="..." />`
    - Remove outer padding wrapper and inline `PageHeader`

- [x] Modify `app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx`
    - Wrap in `<SubjectPageShell title="Enrollment Requests" description="..." />`
    - Remove outer padding wrapper and inline `PageHeader`

- [x] Write `app/sentinel-core/src/app/(protected)/subjects/_components/layout/subject-nav.test.tsx`
    - Renders all 4 nav items
    - Active link matches mocked route

- [x] Update `app/sentinel-core/src/app/(protected)/subjects/page.test.tsx`
    - Remove assertions tied to extracted `PageHeader` / padding wrappers

- [x] Run `pnpm --dir app/sentinel-core test` — all tests pass

---

## Phase 3: sentinel-web — Instructor Subject Sidebar Layout

**Goal:** Add a sidebar workspace layout to the instructor-facing subject section.

**Migration required:** No.

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.tsx`
    - `SubjectSection`: `'list' | 'offered'`
    - Nav groups: **"My Subjects"** (`list` → `/subjects`), **"Browse"** (`offered` → `/subjects/offered`)

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-workspace-shell.tsx`
    - Consistent shell structure

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-page-shell.tsx`
    - Consistent page shell

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/index.ts`
    - Barrel export

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/subjects/layout.tsx`
    - Wrap `{children}` in `SubjectWorkspaceShell`

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx`
    - Wrap in `<SubjectPageShell title="Subject Management" description="..." />`
    - Remove outer `flex flex-col gap-6 p-4 md:p-6` wrapper

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/page.tsx`
    - Wrap in `<SubjectPageShell title="Offered Subjects" description="..." />`
    - Remove outer wrapper padding

- [x] Write `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/layout/subject-nav.test.tsx`
    - Renders 2 nav items
    - Active link reflects mocked pathname

- [x] Run `pnpm --dir app/sentinel-web test` — all tests pass

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-support test
pnpm --dir app/sentinel-core test
pnpm --dir app/sentinel-web test
```

### Manual Verification

1. Navigate to `/subjects` in each app — sidebar visible on desktop, mobile card nav visible at mobile viewport
2. Click each sidebar link — active indicator (border-right highlight) updates; page content changes
3. Hard-refresh on a sub-route (e.g. `/subjects/classifications`) — sidebar highlights the correct item
4. Resize to mobile — sidebar collapses to mobile card layout
5. Confirm the "Classification" button is removed from the sentinel-core subjects page header
