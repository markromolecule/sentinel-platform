# feat-002: Support Dashboard Overview Refactor

## Summary

Refactor the `sentinel-support` dashboard (`/dashboard`) into a clean, customizable, data-rich overview that gives support staff an at-a-glance picture of the entire platform — with draggable widget layout, horizontally-draggable metric card carousels, and intelligently grouped charts.

---

## Pre-Planning Checklist

- [x] Task input summarized in one sentence
- [x] Relevant source files scanned
- [x] All files, services, and DB tables identified
- [x] Prisma migration decision made

> **Task (one sentence):** Fully refactor the support dashboard page into a customizable, widget-based overview with draggable layout, horizontal metric card carousels, grouped charts, and all essential platform KPIs visible in a single scroll.

---

## Option Analysis (1-3-1 Rule)

### Option A — Simple Static Refactor (fast, no interactivity)
Replace current layout with a well-organized grid of cards and charts using existing Recharts components, matching page margins. No drag, no persistence.
- **Tradeoff:** Fast to build but does not satisfy the user's explicit requirement for draggable/rearrangeable widgets and horizontal card carousels.

### Option B — Fully Custom Drag-and-Drop with `@dnd-kit/core` (robust/scalable)
Build a complete drag-and-drop grid using `@dnd-kit/sortable`, persist layout order to `localStorage` via a Zustand store, and implement a CSS `scroll-snap` horizontal drag carousel for metric cards.
- **Tradeoff:** Maximally flexible and satisfies all requirements; moderate complexity with one new dependency (`@dnd-kit`).

### Option C — CSS-only Drag via `draggable` HTML API + `scroll-snap` carousel (creative)
Use the native HTML `draggable` attribute for widget reordering and CSS `overflow-x: scroll` + `scroll-behavior: smooth` for the horizontal carousel — zero new dependencies.
- **Tradeoff:** Accessible without dependencies but HTML drag API is notoriously unreliable on touch/mobile and produces poor UX compared to `@dnd-kit`.

---

## Best Option: **Option B** — `@dnd-kit` Drag-and-Drop + Zustand Layout Store

**Why:** The user's requirements are explicit — draggable cards, carousel scrolling, and priority ordering. `@dnd-kit/sortable` is the de-facto standard in the React ecosystem for this pattern, integrates cleanly with the existing Tailwind/RSC approach, and is keyboard-accessible. A Zustand store with `localStorage` persistence gives the layout memory across sessions at no server cost. No new backend changes are needed.

> **NOTE:** `@dnd-kit/core` and `@dnd-kit/sortable` must be added as dependencies to `app/sentinel-support`. These are the only new dependencies introduced.

---

## Open Questions

> **NOTE:** The following decisions have been made conservatively based on the existing codebase, but can be overridden before execution:

1. **Persistence scope** — Widget order will be persisted to `localStorage` only (not user profile in DB). If server-side persistence is required, a migration + API endpoint would be needed.
2. **Carousel vs. pagination** — The metric cards carousel will use pointer/mouse drag (no click required). Should touch drag on mobile also be supported? (Assumed: yes, via `@dnd-kit` pointer sensors.)
3. **Data source** — All dashboard data currently uses `MOCK_*` constants from `@sentinel/shared/constants`. This plan will wire the `RecentInstitutionsWidget` to the real `useInstitutionsQuery` hook (already done) and leave remaining widgets on mock data until real API endpoints exist.
4. **Chart grouping** — Exam Completion Chart + Incident Trends Chart will be co-located in a tabbed `ChartGroupPanel` widget on the dashboard.

---

## Proposed Changes

### Phase 1: Types, Constants & Mock Data Extensions

**Goal:** Establish all new shared types and mock data required by every subsequent phase without touching component files.

- [ ] Create `packages/shared/src/types/dashboard.ts` — define `SupportKpiCard`, `PlatformActivity`, `DashboardWidgetId`, `DashboardLayoutItem` types
- [ ] Modify `packages/shared/src/types/index.ts` — re-export the four new types
- [ ] Modify `packages/shared/src/mock-data/index.ts` — add `MOCK_SUPPORT_KPI_CARDS` (8+ KPI cards: managed institutions, active sessions, pending incidents, resolved tickets, exam completion rate, total students, avg session duration, flagged-dismissed ratio) and `MOCK_PLATFORM_ACTIVITY` (cross-institution activity feed entries)
- [ ] Modify `packages/shared/src/constants/index.ts` — export `MOCK_SUPPORT_KPI_CARDS` and `MOCK_PLATFORM_ACTIVITY`
- [ ] Modify `packages/shared/src/index.ts` — ensure new types are exported at package root

**Migration required:** No — no DB schema changes, types only.

---

### Phase 2: Dashboard Layout Store (Zustand)

**Goal:** Implement a Zustand + Immer store that persists widget drag order to `localStorage`, enabling layout memory across sessions.

- [ ] Create `app/sentinel-support/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.ts`
  - State: `layoutItems: DashboardLayoutItem[]` with default order constant `DEFAULT_DASHBOARD_LAYOUT`
  - Actions: `reorderWidgets(activeId: DashboardWidgetId, overId: DashboardWidgetId)` using `arrayMove` from `@dnd-kit/sortable`, `resetLayout()`
  - Middleware: `zustand/middleware/persist` with `localStorage` strategy
  - Follow Zustand store rules: use `immer` middleware, separate state/actions types, `DEFAULT_DASHBOARD_LAYOUT_STORE_STATE`
- [ ] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.test.ts`
  - Test: initial state matches `DEFAULT_DASHBOARD_LAYOUT_STORE_STATE`
  - Test: `reorderWidgets('kpi-carousel', 'flagged-incidents')` swaps positions correctly
  - Test: `resetLayout()` restores default order

**Migration required:** No.

---

### Phase 3: KPI Metric Cards Carousel Widget

**Goal:** Build a horizontally-draggable, scroll-snap carousel of KPI metric cards that the user drags left/right with a pointer (no click needed).

- [ ] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/kpi-carousel-widget.tsx`
  - `'use client'` — uses `useRef`, `onPointerDown`, `onPointerMove`, `onPointerUp`
  - Props: `cards: SupportKpiCard[]`
  - Container: `overflow-x-auto scroll-snap-type-x-mandatory cursor-grab` with `select-none` during drag
  - Inner flex row: each card has `min-w-[220px] scroll-snap-align-start`
  - Reuse existing `StatsCard` from `@/components/common/stats-card` for each KPI card
  - JSDoc on exported function
- [ ] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/kpi-carousel-widget.test.tsx`
  - Test: renders all card labels from props
  - Test: renders no cards when empty array passed (no crash)
  - Test: first card value is rendered correctly

**Migration required:** No.

---

### Phase 4: Chart Group Panel (Tabbed)

**Goal:** Group the existing Exam Completion and Incident Trends charts into a single tabbed card widget to reduce dashboard height and improve data grouping.

- [ ] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/chart-group-panel.tsx`
  - `'use client'` — tab state requires `useState`
  - Props: `examData: ChartProps['data']`, `incidentData: ChartProps['data']`
  - Import `ExamCompletionChart` and `IncidentTrendsChart` from `@/app/(protected)/analytics/_components`
  - Use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@sentinel/ui`
  - Card header: title "Analytics Overview" + tab switcher
  - Consistent `h-[280px]` chart area
  - JSDoc on exported function
- [ ] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/chart-group-panel.test.tsx`
  - Test: "Exam Completion" tab content is visible by default
  - Test: clicking "Incident Trends" tab renders incident chart content

**Migration required:** No.

---

### Phase 5: Draggable Widget Grid, SystemActivity Widget & Page Refactor

**Goal:** Wire all new and existing components into a fully draggable, sortable dashboard page where widget order persists to localStorage.

- [ ] Install dependencies: `pnpm --dir app/sentinel-support add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-widget-wrapper.tsx`
  - `'use client'`
  - Props: `id: DashboardWidgetId`, `children: ReactNode`
  - Uses `useSortable(id)` from `@dnd-kit/sortable` to apply `transform`, `transition`, `listeners`, `setNodeRef`, `attributes`
  - Renders a `GripVertical` (lucide) drag handle icon + `{children}`
  - JSDoc on exported function
- [ ] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/system-activity-widget.tsx`
  - `'use client'`
  - No props — reads `MOCK_PLATFORM_ACTIVITY` from `@sentinel/shared/constants`
  - Card title: "Platform Activity" with institution badge per row
  - Shows max 6 rows; "View All →" link to `/logs`
  - Row style matches existing `system-health.tsx` pattern
  - JSDoc on exported function
- [ ] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/system-activity-widget.test.tsx`
  - Test: renders at least one activity row
  - Test: "View All" link has href `/logs`
- [ ] Modify `app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts`
  - Export: `KpiCarouselWidget`, `ChartGroupPanel`, `DashboardWidgetWrapper`, `SystemActivityWidget`
- [ ] Fully refactor `app/sentinel-support/src/app/(protected)/dashboard/page.tsx` (support role branch only):
  ```
  Layout order (default):
  1. PageHeader — "Support Overview"
  2. KpiCarouselWidget (full-width, MOCK_SUPPORT_KPI_CARDS)
  3. DndContext + SortableContext (verticalListSortingStrategy):
     a. ChartGroupPanel (examData + incidentData from MOCK_*)
     b. RecentInstitutionsWidget (existing — real API)
     c. ActiveSessionsWidget (existing)
     d. FlaggedIncidentsWidget (existing)
     e. SystemActivityWidget (new)
  4. onDragEnd calls reorderWidgets from useDashboardLayoutStore
  5. Widget order sourced from useDashboardLayoutStore(s => s.layoutItems)
  ```
  - Sensors: `PointerSensor` + `KeyboardSensor` (accessibility)
  - Collision detection: `closestCenter`
  - Outer margins: `space-y-4` (match existing page pattern)
  - Admin role branch: **untouched**

**Migration required:** No.

---

### Phase 6: Final Wiring & Package Updates

**Goal:** Ensure all package exports are correct and the build compiles cleanly.

- [ ] Verify `packages/shared` builds without errors: `pnpm --dir packages/shared build`
- [ ] Verify `app/sentinel-support` builds without errors: `pnpm --dir app/sentinel-support build`
- [ ] Run full test suite: `pnpm --dir app/sentinel-support test`
- [ ] Confirm `pnpm lint` passes for modified files

**Migration required:** No.

---

## Files Touched Summary

| File | Action | Phase |
|---|---|---|
| `packages/shared/src/types/dashboard.ts` | NEW | 1 |
| `packages/shared/src/types/index.ts` | MODIFY | 1 |
| `packages/shared/src/mock-data/index.ts` | MODIFY | 1 |
| `packages/shared/src/constants/index.ts` | MODIFY | 1 |
| `packages/shared/src/index.ts` | MODIFY | 1 |
| `dashboard/_stores/use-dashboard-layout-store.ts` | NEW | 2 |
| `dashboard/_stores/use-dashboard-layout-store.test.ts` | NEW | 2 |
| `dashboard/_components/kpi-carousel-widget.tsx` | NEW | 3 |
| `dashboard/_components/kpi-carousel-widget.test.tsx` | NEW | 3 |
| `dashboard/_components/chart-group-panel.tsx` | NEW | 4 |
| `dashboard/_components/chart-group-panel.test.tsx` | NEW | 4 |
| `app/sentinel-support/package.json` | MODIFY | 5 |
| `dashboard/_components/dashboard-widget-wrapper.tsx` | NEW | 5 |
| `dashboard/_components/system-activity-widget.tsx` | NEW | 5 |
| `dashboard/_components/system-activity-widget.test.tsx` | NEW | 5 |
| `dashboard/_components/index.ts` | MODIFY | 5 |
| `dashboard/page.tsx` | MODIFY | 5 |

---

## Migration Decision

**Migration required: NO**

All dashboard data at this stage uses mock constants from `@sentinel/shared`. The `RecentInstitutionsWidget` already calls the real `useInstitutionsQuery` hook. No new DB tables or Prisma schema changes are needed. When real API endpoints for KPI metrics, sessions, and activity feeds are built, only the data-fetching hooks need to be swapped in.

> **Rollback note (if a migration were ever needed in future):** `prisma migrate reset --skip-seed`

---

## Verification Plan

### Automated Tests

```bash
# All support-portal tests
pnpm --dir app/sentinel-support test

# Dashboard tests only
pnpm --dir app/sentinel-support test dashboard
```

All new `*.test.ts(x)` files must pass with no skipped cases.

### Manual Verification

1. Navigate to `/dashboard` as a `support` role user
2. KPI carousel renders 8+ cards and responds to horizontal pointer drag (no click)
3. Widgets below carousel can be dragged vertically and reordered
4. Refresh page — widget order is preserved (localStorage)
5. "Chart Group" panel tab switch works: Exam Completion ↔ Incident Trends
6. `RecentInstitutionsWidget` shows live institution data
7. `SystemActivityWidget` replaces the "Coming Soon" placeholder
8. Margins match other pages: `p-6` outer, `space-y-4` between widgets
9. Navigate to `/dashboard` as an `admin` role user — existing Admin dashboard branch is **unchanged**

---

## Additional Considerations

- **No new `.env` variables** are introduced.
- **No breaking API changes** — this is a pure frontend refactor.
- **Admin role dashboard** (`role !== 'support'`) is **not touched**.
- **`@dnd-kit` is the only new dependency.** No other libraries introduced.
- `ChartGroupPanel` imports `ExamCompletionChart` and `IncidentTrendsChart` from `analytics/_components` directly — no duplication.
- `StatsCard` from `@/components/common/stats-card` is reused inside `KpiCarouselWidget`.
- All new files follow `kebab-case` naming; all exported functions use `PascalCase` and have JSDoc comments.
- Inline comments only where drag/scroll logic is non-obvious.

---

## Reference Docs

- [Component Rules](../../../.agents/rules/web/components.md)
- [Query Hooks Rules](../../../.agents/rules/web/query-hooks.md)
- [Zustand Store Rules](../../../.agents/rules/web/zustand-store.md)
- [Project Structure Rules](../../../.agents/rules/web/project-structure.md)
- [Global Naming Conventions](../../../.agents/rules/global/global-naming-conventions.md)
