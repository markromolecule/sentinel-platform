# feat-001 — Frontend Layout Redesign (Workspace Shell Pattern)

## Summary

Redesign three page groups in `sentinel-core` — **Organization** (`/departments`, `/semesters`, `/rooms`), **System Logs** (`/logs`), and **Analytics** (`/analytics`) — to use the same persistent inner-sidebar workspace shell that already exists for the **Subjects** pages. This eliminates the need for sub-item links to live in the global `CoreAdminSidebar` and creates a consistent, scoped navigation experience within each section.

---

## Viable Options

### Option A — Fully generic `WorkspaceShell` (shared component)

Build one generic `WorkspaceShell` component in `src/components/common/` that accepts nav config as props and is reused by every section.

**Tradeoff:** Maximum code reuse but requires a flexible, abstract API that every section must conform to — harder to customise per-section later.

### Option B — Per-section shells, co-located with each feature (✅ BEST)

Mirror the Subjects pattern exactly. Each section owns its own `_components/layout/` folder with a typed nav, a workspace shell, and a page shell. Sections stay fully self-contained.

**Tradeoff:** Some code repetition across shells, but perfectly matches the established codebase pattern and keeps each section independently evolvable.

### Option C — Route groups with a shared `layout.tsx` shell

Use Next.js route groups `(organization)`, `(logs)`, `(analytics)` and a single shared `layout.tsx` per group.

**Tradeoff:** Leverages Next.js conventions but couples shell logic to the route tree, making it harder to swap layouts without restructuring directories.

---

## Best Option: **Option B**

Option B matches the existing `subjects` pattern 1-to-1, requires no new dependencies, and keeps each feature domain self-contained. It is the lowest-risk, most maintainable path forward given the codebase's clear precedent.

---

## Open Questions

> [!CAUTION]
> **Organization route group:** The `OrganizationWorkspaceShell` must be an ancestor of all three pages (`/departments`, `/semesters`, `/rooms`). Since these are sibling directories, placing a `layout.tsx` only inside `/departments` won't cover `/semesters` and `/rooms`. **A Next.js route group `(organization)/` wrapping all three directories is likely required.** This restructure must be decided before execution begins.

> [!IMPORTANT]
> **Logs sub-navigation:** The current `/logs` page uses a `LogsTabsView` component with internal tab switching (not separate routes). Should the workspace shell nav expose those tab types as separate nav items (requiring tabs → routes conversion), or remain a single-item nav wrapper for now?

> [!IMPORTANT]
> **Analytics sub-navigation:** Should the Analytics shell nav expose sub-items (e.g., Overview, Reports, Trends) as separate routes, or remain a single wrapper for the existing dense page?

---

## Proposed Changes

---

### Phase 1 — Organization Workspace Shell (`/departments`, `/semesters`, `/rooms`)

**Goal:** Wrap the three Organization pages in a shared inner-sidebar shell for scoped navigation between Departments, Semesters, and Rooms.

**Migration required:** No — UI/layout changes only.

- [x] Create Next.js route group `app/(protected)/(organization)/` and move `departments/`, `semesters/`, and `rooms/` directories into it
- [x] Create `app/(protected)/(organization)/layout.tsx` — wraps children in `<OrganizationWorkspaceShell>`
- [x] Create `app/(protected)/(organization)/_components/layout/organization-nav.tsx`
    - Define `OrganizationSection = 'departments' | 'semesters' | 'rooms'`
    - Define `ORGANIZATION_NAV_ITEMS` with `{ id, label, href }` for each route
    - Export `OrganizationNav` component mirroring `SubjectNav` (active-state links, grouped nav)
- [x] Create `app/(protected)/(organization)/_components/layout/organization-workspace-shell.tsx`
    - Derive `activeSection` from `usePathname()` matching `/departments`, `/semesters`, `/rooms`
    - Sticky desktop sidebar (w-64) + mobile card-style top nav — mirror `SubjectWorkspaceShell` exactly
    - Title: "Organization"
- [x] Create `app/(protected)/(organization)/_components/layout/organization-page-shell.tsx`
    - Props: `title`, `description`, optional `actions`, `children`
    - Mirrors `SubjectPageShell` (PageHeader + Separator + children)
- [x] Create `app/(protected)/(organization)/_components/layout/index.ts` — re-export all layout components
- [x] Wrap `departments/page.tsx` content in `<OrganizationPageShell title="Departments" description="Manage academic departments and their configurations." />`
- [x] Wrap `semesters/page.tsx` content in `<OrganizationPageShell title="Semesters" description="Manage academic semesters and their scheduling periods." />`
- [x] Wrap `rooms/page.tsx` content in `<OrganizationPageShell title="Rooms" description="Manage physical rooms and their availability." />`
- [x] Write tests at `app/(protected)/(organization)/_components/layout/organization-nav.test.tsx`
    - Renders all nav items
    - Applies active class to the correct item per `activeSection`
- [x] Write tests at `app/(protected)/(organization)/_components/layout/organization-workspace-shell.test.tsx`
    - Renders desktop sidebar and mobile nav
    - Renders children

---

### Phase 2 — System Logs Workspace Shell (`/logs`)

**Goal:** Give the System Logs page a workspace shell with its own inner nav, matching the shell pattern.

**Migration required:** No.

- [x] Create `app/(protected)/logs/_components/layout/logs-nav.tsx`
    - Define `LogsSection = 'overview'` (single item for now, extensible for future sub-routes)
    - Export `LogsNav` component
- [x] Create `app/(protected)/logs/_components/layout/logs-workspace-shell.tsx`
    - Title: "System Logs"
    - Mirrors `SubjectWorkspaceShell`
- [x] Create `app/(protected)/logs/_components/layout/logs-page-shell.tsx`
    - Mirrors `SubjectPageShell`
- [x] Create `app/(protected)/logs/_components/layout/index.ts` — re-export all
- [x] Create `app/(protected)/logs/layout.tsx` — wraps children in `<LogsWorkspaceShell>`
- [x] Modify `app/(protected)/logs/page.tsx`
    - Remove existing `PageHeader` (now owned by `LogsPageShell`)
    - Wrap `<LogsTabsView />` in `<LogsPageShell title="System Logs" description="Live audit trail of system activities, background tasks, and user security events." />`
- [x] Write tests at `app/(protected)/logs/_components/layout/logs-workspace-shell.test.tsx`
    - Renders shell and children
- [x] Update `app/(protected)/logs/page.test.tsx` — assert `LogsPageShell` wraps `LogsTabsView`

---

### Phase 3 — Analytics Workspace Shell (`/analytics`)

**Goal:** Give the Analytics page a workspace shell with an inner nav, ready for future sub-page expansion.

**Migration required:** No.

- [x] Create `app/(protected)/analytics/_components/layout/analytics-nav.tsx`
    - Define `AnalyticsSection = 'overview'`
    - Export `AnalyticsNav`
- [x] Create `app/(protected)/analytics/_components/layout/analytics-workspace-shell.tsx`
    - Title: "Reports & Analytics"
    - Mirrors `SubjectWorkspaceShell`
- [x] Create `app/(protected)/analytics/_components/layout/analytics-page-shell.tsx`
    - Mirrors `SubjectPageShell`
- [x] Create `app/(protected)/analytics/_components/layout/index.ts` — re-export all
- [x] Create `app/(protected)/analytics/layout.tsx` — wraps children in `<AnalyticsWorkspaceShell>`
- [x] Modify `app/(protected)/analytics/page.tsx`
    - Remove existing `PageHeader` (now owned by `AnalyticsPageShell`)
    - Wrap page content in `<AnalyticsPageShell title="System Reports & Analytics" description="Real-time telemetry, session metrics, and integrity insights." />`
- [x] Write tests at `app/(protected)/analytics/_components/layout/analytics-workspace-shell.test.tsx`
    - Renders shell and children
- [x] Update `app/(protected)/analytics/analytics.test.tsx` for new shell structure

---

### Phase 4 — Sidebar Cleanup

**Goal:** Remove the `subItems` for Organization, Logs, and Analytics from the global `CoreAdminSidebar` nav config since they now live inside their own workspace shells.

**Migration required:** No.

- [x] Modify `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`
    - `Organization` section: remove `subItems` array from the `departments` entry (keep top-level entry pointing to `/departments` as the shell entry point)
    - `Analytics & Logs` section: no sub-items currently exist — verify and confirm no changes needed
- [x] Verify `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` still passes

---

### Phase 5 — Final Verification

**Goal:** Run lint checks and verify that all test cases execute successfully.

**Migration required:** No.

- [x] Run `pnpm --dir app/sentinel-core test` — all tests must pass
- [x] Run `pnpm lint` — no new lint errors
- [x] Manually verify: `/departments`, `/semesters`, `/rooms` all load with shared inner sidebar
- [x] Manually verify: `/logs` loads with workspace shell
- [x] Manually verify: `/analytics` loads with workspace shell
- [x] Confirm global sidebar no longer shows Organization sub-items inline

---

## Done Criteria

- [x] All new shell components follow `SubjectWorkspaceShell` naming and file layout conventions
- [x] Every modified page renders inside `<*PageShell>` with a `PageHeader` + `Separator`
- [x] Desktop sticky sidebar + mobile card nav functional for all three section groups
- [x] Global `CoreAdminSidebar` Organisation entry no longer duplicates inner navigation
- [x] All Vitest tests pass with no skipped cases
- [x] No Prisma migration — confirmed layout-only change
