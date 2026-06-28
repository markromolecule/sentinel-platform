# Move Exam Logs into Exam Report

Relocate the incident logs feature from the standalone `/exams/logs` route into the
per-exam `/exams/[id]/report` page as a new **"Logs"** sidebar section, then remove
the now-redundant `/exams/logs` route and its supporting card-selection flow.

---

## 1-3-1 Options Analysis

### Option A — Lift-and-shift into the existing report page (Simple / Fast)

Copy the incident-logs components and hook directly into
`app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/` and add a
`logs` branch to the existing `activeSection` state machine.

**Tradeoff:** Quick to ship, but inflates the already-large `page.tsx` and duplicates
the `examId` derivation logic.

---

### Option B — Extract a shared `<IncidentLogsView />` feature component, mount it in the report (Robust / Maintainable) ✅ BEST

Move the hook and UI into a proper feature module under
`app/sentinel-web/src/features/exams/logs/`, expose a single `<IncidentLogsView examId={id} />`
component, and mount it as the new `logs` section in the report page — the same pattern
already used by `<OverviewView>`, `<AttemptsView>`, and `<ActionQueueView>`.
The hook receives `examId` as a prop instead of reading it from the URL, removing
URL-coupling and making the component reusable.

**Tradeoff:** Slightly more upfront restructuring, but matches existing conventions and
keeps `page.tsx` thin.

---

### Option C — Nested route under `/exams/[id]/report/logs` (Creative / URL-driven)

Create a new Next.js nested route so the logs live at `/exams/[id]/report/logs`.

**Tradeoff:** No component extraction required, but the report page already uses
in-page state switching via `?section=` — mixing URL links and state buttons would
create UX inconsistency.

---

### Best Option: **Option B**

Option B matches the exact patterns established by `OverviewView`, `AttemptsView`,
and `ActionQueueView`. The feature directory pattern (`src/features/exams/`) already
exists. The hook refactor to accept `examId` as a prop removes hidden URL coupling and
makes tests simpler. No new dependencies are needed.

---

## Phase 1: Extract the Incident Logs Feature Module

**Goal:** Move all logs logic into `src/features/exams/logs/` so it is decoupled from
the `/exams/logs` route.

- [x] Create directory `app/sentinel-web/src/features/exams/logs/`
- [x] Create `app/sentinel-web/src/features/exams/logs/hooks/use-incident-logs.ts`
  - Copy logic from `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_hooks/use-exam-incident-logs.ts`
  - Change signature: accept `examId: string` as a parameter instead of reading it
    from `useSearchParams()`
  - Remove `handleExamChange` (exam is pre-selected by the report page)
  - Remove `examSearch`, `setExamSearch`, `debouncedExamSearch`, `useExamsQuery`
    (exam combobox/selector is gone)
  - Keep all incident fetching, grouping, section-derivation, and review-action logic
  - Add JSDoc to the exported function
- [x] Write `app/sentinel-web/src/features/exams/logs/hooks/use-incident-logs.test.ts`
  - Unit-test: initial state values are correct
  - Unit-test: `displayIncidents` grouping logic (mocked incidents array)
  - Unit-test: `sections` derivation from report data
  - Unit-test: `handleConfirmIncident` calls `reviewIncidents` with `status: 'CONFIRMED'`
  - Unit-test: `handleDismissIncident` calls `reviewIncidents` with `status: 'DISMISSED'`
  - Unit-test: bulk confirm/dismiss expand grouped incidents correctly
- [x] Create `app/sentinel-web/src/features/exams/logs/components/incident-table.tsx`
  - Move from `exams/logs/_components/incident-table.tsx`; update import paths only
- [x] Create `app/sentinel-web/src/features/exams/logs/components/incident-drawer.tsx`
  - Move from `exams/logs/_components/incident-drawer.tsx`; update import paths only
- [x] Create `app/sentinel-web/src/features/exams/logs/components/bulk-actions.tsx`
  - Move from `exams/logs/_components/bulk-actions.tsx`; update import paths only
- [x] Create `app/sentinel-web/src/features/exams/logs/components/columns.tsx`
  - Move from `exams/logs/_components/columns.tsx`; update import paths only
- [x] Create `app/sentinel-web/src/features/exams/logs/components/incident-logs-view.tsx`
  - New view component with props `{ examId: string }`
  - Composes `useIncidentLogs(examId)` + `<IncidentTable>` + `<IncidentDrawer>` +
    `<BulkActions>`
  - Renders the loading, error, and table states extracted from the inner JSX of
    `exams/logs/page.tsx` — **only the table content branch** (no `<ExamCardsGrid>`,
    no `<ExamCombobox>`)
  - Includes a `<RefreshCw>` refresh button in its header consistent with current UX
  - Add JSDoc to the exported component
- [x] Create `app/sentinel-web/src/features/exams/logs/index.ts`
  - Re-export `IncidentLogsView` and `useIncidentLogs`

**Migration required:** No — pure frontend refactor, no schema changes.

---

## Phase 2: Integrate Logs Section into the Exam Report Page

**Goal:** Add a fourth "Logs" section to `/exams/[id]/report` with full
incident-review functionality.

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx`
  - Extend `activeSection` union type: `'overview' | 'attempts' | 'queue' | 'logs'`
  - Add `'logs'` to the `useEffect` that syncs `sectionParam` → `activeSection`
  - Add **"Incident Logs"** sidebar button (desktop) with `<ShieldAlert>` icon,
    matching existing button style
  - Add **"Incident Logs"** mobile navigation tab
  - Render `<IncidentLogsView examId={id} />` when `activeSection === 'logs'`
  - Import `IncidentLogsView` from `@/features/exams/logs`
- [x] Write / update `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.test.tsx`
  - Verify "Incident Logs" tab renders in the sidebar
  - Verify `<IncidentLogsView>` is mounted when `activeSection === 'logs'`
  - Verify URL `?section=logs` activates the Logs section
  - Verify other sections (overview, attempts, queue) still render correctly

**Migration required:** No.

---

## Phase 3: Remove the Standalone `/exams/logs` Route

**Goal:** Delete the now-redundant route, its hook, components, and navigation
references to reduce dead code.

- [x] Delete `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx`
- [x] Delete `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.test.tsx`
- [x] Delete `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_hooks/use-exam-incident-logs.ts`
- [x] Delete `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_hooks/use-exam-incident-logs.test.ts`
- [x] Delete entire `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/` directory:
  - `bulk-actions.tsx`
  - `columns.tsx`
  - `exam-cards-grid.tsx`
  - `exam-cards-grid.test.tsx`
  - `exam-combobox.tsx`
  - `exam-combobox.test.tsx`
  - `incident-drawer.tsx`
  - `incident-table.tsx`
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.tsx`
  - Remove `{ id: 'logs', label: 'Incident Logs', href: '/exams/logs', icon: ShieldAlert }` from `EXAM_NAV_GROUPS`
  - Remove `'logs'` from the `ExamSection` type union
  - Remove the `if (pathname.startsWith('/exams/logs')) return 'logs';` branch from `resolveActiveSection`
  - Remove unused `ShieldAlert` import if no longer used
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx`
  - Remove the `if (segment === 'logs') return 'logs';` branch from `getManagedSection`
- [x] Write / update `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.test.tsx`
  - Assert `logs` nav item no longer appears in the rendered nav
  - Assert `reports` nav item still appears and is active on `/exams/reports`
- [x] Write / update `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.test.tsx`
  - Assert `getManagedSection('/exams/logs')` no longer returns `'logs'`
  - Assert existing sections (reports, assign, grading) are unaffected

**Migration required:** No.

---

## Phase 4: Add "Incident Logs" Deep-Link to the Reports List Cards

**Goal:** Since the "Review Logs" button on the removed `ExamCardsGrid` no longer
exists, add a direct entry point on the `/exams/reports` card list.

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`
  - Add a secondary `Button` (`variant="outline"`) on each exam card alongside the
    existing "Open Report Summary" button
  - Label: **"Incident Logs"**
  - `href`: `/exams/${exam.id}/report?section=logs`
  - Icon: `<ShieldAlert className="h-4 w-4" />`
- [x] Write / update `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.test.tsx`
  - Assert "Incident Logs" button is rendered for each exam card
  - Assert the button href contains `?section=logs`

**Migration required:** No.

---

## Done Criteria

- [x] All phase checkboxes above are checked
- [x] Every new or modified file matches the specified paths
- [x] `pnpm --dir app/sentinel-web test` passes with no skipped or failing cases
- [x] `/exams/logs` returns 404 in the browser (Next.js page file deleted)
- [x] `/exams/[id]/report?section=logs` displays the full incident-log table with
  confirm / dismiss / bulk actions for the given exam
- [x] The exams workspace sidebar no longer shows an "Incident Logs" top-level nav item
- [x] Each exam card on `/exams/reports` shows an "Incident Logs" deep-link button
- [x] No new npm dependencies introduced
- [x] `.env.example` unchanged (no new environment variables)

---

## Breaking Changes

> [!WARNING]
> The `/exams/logs` URL will no longer exist after Phase 3. Any bookmark, in-app
> link, or external reference pointing to `/exams/logs` or `/exams/logs?examId=...`
> will break. Instructors should navigate to `/exams/reports`, select an exam card,
> and use the **"Incident Logs"** sidebar tab or the new card deep-link.

## Rollback Note

No Prisma migration is involved. To roll back, revert the git commits for Phases 1–4
in reverse order (Phase 4 → 3 → 2 → 1). No database changes need to be undone.
