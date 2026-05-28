# Fix Workspace Shell — Logs & Analytics

**Task summary:** Split the monolithic Logs page into three dedicated sub-route pages (Auth, Activity, System) and split the monolithic Analytics page into focused sub-route pages grouped by domain, both surfaced through the existing workspace-shell sidebar pattern already in place.

---

## Option Analysis (1-3-1 Rule)

### Option A — Tabs inside a single route (status-quo, simple)
Keep everything on one page; replace the `LogsWorkspaceShell` sidebar with a tab-strip on `page.tsx`.
**Tradeoff:** Fastest, but kills URL-addressability and ignores the established sub-nav shell pattern already present in the codebase.

### Option B — Sub-routes + sidebar nav ✅ (recommended)
Create `logs/auth/`, `logs/activity/`, `logs/system/` and `analytics/overview/`, `analytics/incidents/`, `analytics/exams/`, `analytics/integrity/`, `analytics/reports/` as proper Next.js nested routes, each with its own `page.tsx`. Update `logs-nav.tsx` and `analytics-nav.tsx` to list all entries. Drive the `activeSection` from `usePathname()` instead of a hard-coded literal.
**Tradeoff:** More files, but mirrors the existing shell pattern exactly, is URL-addressable, and is easy to test.

### Option C — Parallel routes (`@slot`) for each category
Use Next.js parallel routes so that switching categories swaps a named slot without navigation.
**Tradeoff:** Powerful but complex, requires significant layout surgery, and is incompatible with the current `WorkspaceShell` pattern without a full rewrite.

**Best option: Option B** — it fits the existing `LogsWorkspaceShell` / `AnalyticsWorkspaceShell` pattern perfectly. Both shells already read `activeSection` from a typed union. Extending the nav groups and adding sub-routes is the minimal, idiomatic change. No new dependencies.

---

## Phase 1 — Logs Shell: Split into 3 Sub-Routes

**Goal:** Replace `LogsTabsView` (tab-switcher on a single route) with three dedicated sub-pages — `auth`, `activity`, and `system` — each listed in `LogsNav` and addressable via their own URL.

**Migration required:** No — all three query hooks (`useAuthLogsQuery`, `useActivityLogsQuery`, `useSystemLogsQuery`) already exist in `@sentinel/hooks`. No API or DB changes needed.

### Tasks

- [x] Modify `app/sentinel-core/src/app/(protected)/logs/_components/layout/logs-nav.tsx`
  - Extend `LogsSection` type: `'auth' | 'activity' | 'system'`
  - Replace single nav item with three items: `/logs/auth`, `/logs/activity`, `/logs/system`
  - Add Lucide icons (`ShieldCheck`, `UserCog`, `Terminal`) per item

- [x] Modify `app/sentinel-core/src/app/(protected)/logs/_components/layout/logs-workspace-shell.tsx`
  - Import `usePathname` from `next/navigation`
  - Derive `activeSection` dynamically from pathname instead of hard-coded `'overview'`
  - Update `logs-workspace-shell.test.tsx` to mock `usePathname`

- [x] Modify `app/sentinel-core/src/app/(protected)/logs/page.tsx`
  - Replace current full render with `redirect('/logs/auth')`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/auth/page.tsx`
  - `<LogsPageShell title="Authentication Logs">` + `<AuthLogTable>`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/auth/page.test.tsx`
  - Smoke test: shell renders, title "Authentication Logs" correct

- [x] Create `app/sentinel-core/src/app/(protected)/logs/activity/page.tsx`
  - `<LogsPageShell title="Activity Logs">` + `<ActivityLogTable>`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/activity/page.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/system/page.tsx`
  - `<LogsPageShell title="System Logs">` + `<SystemLogTable>`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/system/page.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/_components/auth-log-table.tsx`
  - Self-contained: `useAuthLogsQuery` + pagination state + `<AuditLogTable>`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/_components/activity-log-table.tsx`
  - Same pattern for `useActivityLogsQuery`

- [x] Create `app/sentinel-core/src/app/(protected)/logs/_components/system-log-table.tsx`
  - Same pattern for `useSystemLogsQuery`

- [x] Modify `app/sentinel-core/src/app/(protected)/logs/_components/index.ts`
  - Remove `LogsTabsView` export; add `AuthLogTable`, `ActivityLogTable`, `SystemLogTable`

- [x] Delete `app/sentinel-core/src/app/(protected)/logs/_components/logs-tabs-view.tsx`

- [x] Run `pnpm --dir app/sentinel-core test` and confirm all Phase 1 tests pass


---

## Phase 2 — Analytics Shell: Split into 5 Focused Sub-Routes

**Goal:** Replace the single monolithic `analytics/page.tsx` with five dedicated sub-pages grouped by domain, surfaced through a multi-entry `AnalyticsNav` sidebar.

**Migration required:** No — all query hooks and backend routes already exist. Pure UI reorganisation.

### Backend Coverage

| Backend endpoint | Currently shown | Target sub-page |
|---|---|---|
| `GET /analytics/kpis` | ✅ KPI cards | Overview |
| `GET /analytics/exam-completions` | ✅ Chart | Exams |
| `GET /analytics/incident-trends` | ✅ Chart | Incidents |
| `GET /analytics/incident-severity` | ✅ Chart | Incidents |
| `GET /analytics/incident-type` | ✅ Chart | Incidents |
| `GET /analytics/department-integrity` | ✅ Chart | Integrity |
| `GET /analytics/reports` | ✅ Table | Reports |
| `POST /analytics/reports` | ✅ Generate button | Reports |

### Tasks

- [x] Modify `app/sentinel-core/src/app/(protected)/analytics/_components/layout/analytics-nav.tsx`
  - Extend `AnalyticsSection`: `'overview' | 'incidents' | 'exams' | 'integrity' | 'reports'`
  - Two nav groups: "Telemetry" (Overview, Incidents, Exams, Integrity) + "Reports"
  - Add icons: `LayoutDashboard`, `ShieldAlert`, `ClipboardList`, `Building2`, `FileBarChart`

- [x] Modify `app/sentinel-core/src/app/(protected)/analytics/_components/layout/analytics-workspace-shell.tsx`
  - Import `usePathname`; derive `activeSection` from pathname
  - Update `analytics-workspace-shell.test.tsx` to mock `usePathname`

- [x] Modify `app/sentinel-core/src/app/(protected)/analytics/page.tsx` (Overview)
  - Retain only `<AnalyticsKPICards>` block
  - Add quick-link navigation cards to each sub-page
  - Remove all chart and report imports

- [x] Delete `app/sentinel-core/src/app/(protected)/analytics/analytics.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/page.test.tsx`
  - Smoke test: KPI cards render; quick-link cards present

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/incidents/page.tsx`
  - `<AnalyticsPageShell title="Incident Analytics">`
  - `<IncidentTrendsChart>`, `<IncidentByTypeChart>`, `<IncidentSeverityChart>` in a responsive grid

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/incidents/page.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/exams/page.tsx`
  - `<AnalyticsPageShell title="Exam Performance">`
  - `<ExamCompletionChart>` full-width + computed stat callouts (completion rate, drop rate)

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/exams/page.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/integrity/page.tsx`
  - `<AnalyticsPageShell title="Integrity by Department">`
  - `<DepartmentIntegrityChart>` + sortable summary table

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/integrity/page.test.tsx`

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/reports/page.tsx`
  - `<AnalyticsPageShell title="Generated Reports">`
  - `<AnalyticsReportsList>` with `onGenerateReport` wired

- [x] Create `app/sentinel-core/src/app/(protected)/analytics/reports/page.test.tsx`

- [x] Verify `app/sentinel-core/src/app/(protected)/analytics/_components/index.ts` — no removals needed (all charts reused)

- [x] Run `pnpm --dir app/sentinel-core test` and confirm all Phase 2 tests pass


---

## Verification Plan

```bash
# All sentinel-core tests
pnpm --dir app/sentinel-core test

# Targeted
pnpm --dir app/sentinel-core test --reporter=verbose logs
pnpm --dir app/sentinel-core test --reporter=verbose analytics
```

### Manual Checks

1. `/logs` → redirects to `/logs/auth`; sidebar item "Authentication Logs" active
2. `/logs/activity` and `/logs/system` load correctly with independent pagination
3. `/analytics` → KPI overview + quick-links
4. Each analytics sub-route loads only its own charts; sidebar item highlights correctly
5. Mobile nav renders all items without overflow on all routes
