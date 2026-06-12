# feat-005 - Replicate sentinel-support Dashboard to sentinel-core Implementation Plan

**Date:** 2026-06-11  
**Type:** Feature  
**Summary:** Replicate the advanced dashboard layout, features, components, and styling of `sentinel-support` into `sentinel-core` for both the `admin` and `superadmin` dashboards.

## User Review Required

> [!IMPORTANT]
>
> - **Dependency Additions:** This replication requires adding `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` to the `sentinel-core` application dependencies. These packages enable the reorderable/drag-and-drop widget layout capability.
> - **Layout Transformation:** Implementing the `DashboardShell` layout will introduce a sticky right-hand sidebar containing the Calendar and Announcements widgets to both `admin` and `superadmin` dashboards in `sentinel-core`.
> - **Page Header Replacement:** The static `PageHeader` at the top of the dashboards will be replaced with the dynamic `DashboardGreeting`, which shows personalized time-of-day greetings and active time updates.

## Open Questions

> [!NOTE]
> None. The requirements for parity in features, components, paddings, margins, and functionality are fully defined.

## 3 Viable Options

### Option A - Static Style Realignment Only

Apply only the visual padding, margin, and flex-container class alignments to match the fallback layouts in both projects. Do not port the right sidebar, greeting, or drag-and-drop store.

**Tradeoff:** Easiest to implement and test, but fails to replicate the premium sidebar, greeting, and widget reordering features.

### Option B - Component and Feature Port with Layout Upgrades ✅ Recommended

Port all missing dashboard components (`DashboardShell`, `DashboardSidebar`, `DashboardGreeting`, `KpiCarouselWidget`, `ChartGroupPanel`, `SystemActivityWidget`, and `useDashboardLayoutStore`) from `sentinel-support` to `sentinel-core`. Install the `@dnd-kit` packages in `sentinel-core` and upgrade the `admin` and `superadmin` dashboard screens to utilize the shell, greeting, and sidebar layout.

**Tradeoff:** Delivers a fully-featured, premium dashboard matching the support portal's upgrades, but requires copying several React components and managing new dependencies.

### Option C - Core Shared Package Extraction

Extract all the shared dashboard components and stores into a shared workspace package (e.g. `packages/ui` or a new shared package) so both apps consume the same code.

**Tradeoff:** Best long-term architectural maintenance, but carries the highest complexity and risk of breaking existing layouts in the support portal.

## Best Option

**Option B** is the best option. It satisfies all criteria in the task description (reproducing same features, components, functionality, paddings, and margins) while keeping changes safely scoped to `sentinel-core` without modifying the existing `sentinel-support` code.

## Concrete Next Steps

1. Install `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` in `app/sentinel-core`.
2. Port the dashboard widgets, shell, sidebar, and layout store from `app/sentinel-support` to `app/sentinel-core`.
3. Update `app/sentinel-core/src/app/(protected)/dashboard/_components/index.ts` to export all newly added components.
4. Refactor `app/sentinel-core/src/app/(protected)/dashboard/page.tsx` to render the `DashboardShell` and `DashboardGreeting` for both the `superadmin` and `admin` roles, using their respective statistics and widget setups.
5. Port all associated component test files and write/update unit tests for the dashboard page.
6. Verify layout correctness, text sizing, padding, and margins manually and using Vitest.

---

## Pre-Planning Checklist

- [x] Read and summarized the task input in one sentence.
- [x] Scanned relevant source files to understand existing patterns.
- [x] Identified all files, services, and DB tables the task will touch.
- [x] Determined if a Prisma migration is needed.

## Task Summary

- [ ] Replicate the advanced dashboard layout (with sticky sidebar calendar/announcements, time-of-day greeting, and widget structures) from `sentinel-support` to `sentinel-core`.
- [ ] Align all paddings, margins, and text sizes to ensure visual parity.

## Existing Findings

- `sentinel-support` has a dynamic, two-column dashboard page utilizing `DashboardShell` and a sticky `DashboardSidebar` for the `support` role.
- `sentinel-core` uses a simpler, single-column dashboard with a static `PageHeader` for `admin` and `superadmin`.
- Components such as `DashboardShell`, `DashboardGreeting`, `DashboardSidebar`, `KpiCarouselWidget`, `ChartGroupPanel`, `SystemActivityWidget`, and `useDashboardLayoutStore` are completely missing in `sentinel-core`.
- `@dnd-kit` packages are defined in the support portal's `package.json` but not in `sentinel-core`'s `package.json`.
- The database schema is not affected by this task.

## Files, Services, and DB Tables in Scope

### Backend / DB

- None

### Frontend (sentinel-core)

#### [NEW] [use-dashboard-layout-store.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.ts>)

#### [NEW] [use-dashboard-layout-store.test.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.test.ts>)

#### [NEW] [chart-group-panel.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/chart-group-panel.tsx>)

#### [NEW] [chart-group-panel.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/chart-group-panel.test.tsx>)

#### [NEW] [dashboard-greeting.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-greeting.tsx>)

#### [NEW] [dashboard-greeting.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-greeting.test.tsx>)

#### [NEW] [dashboard-shell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-shell.tsx>)

#### [NEW] [dashboard-shell.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-shell.test.tsx>)

#### [NEW] [dashboard-sidebar.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-sidebar.tsx>)

#### [NEW] [dashboard-sidebar.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-sidebar.test.tsx>)

#### [NEW] [dashboard-widget-wrapper.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/dashboard-widget-wrapper.tsx>)

#### [NEW] [kpi-carousel-widget.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/kpi-carousel-widget.tsx>)

#### [NEW] [kpi-carousel-widget.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/kpi-carousel-widget.test.tsx>)

#### [NEW] [system-activity-widget.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/system-activity-widget.tsx>)

#### [NEW] [system-activity-widget.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/system-activity-widget.test.tsx>)

#### [MODIFY] [package.json](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/package.json)

#### [MODIFY] [index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/_components/index.ts>)

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/page.tsx>)

#### [NEW] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/dashboard/page.test.tsx>)

## Assumptions and Scope Guards

- The drag-and-drop dashboard capabilities are copied but will remain optional/configurable via local storage as in the support app.
- Core-specific routes/queries (like `useAnnouncementsQuery` and `useProfileQuery`) are verified as present in `sentinel-core` and will be utilized exactly.
- Keep the page structure completely responsive; on smaller displays, the sidebar folds below the primary layout content.

## Additional Considerations

- **Breaking API changes:** No.
- **New env variables:** None.
- **Migration rollback note:** Not applicable (no database schema changes).

---

## Proposed Changes

### Phase 1: Install Drag-and-Drop Dependencies & Copy Dashboard Components

**Goal:** Establish drag-and-drop styling dependencies and port all missing UI widget elements, test cases, and stores.

- [x] Add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` to `app/sentinel-core/package.json` and run `pnpm install` in workspace root.
- [x] Create `app/sentinel-core/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.ts` matching `sentinel-support` store code.
- [x] Create `app/sentinel-core/src/app/(protected)/dashboard/_stores/use-dashboard-layout-store.test.ts` for unit coverage.
- [x] Copy and adjust path references for the following components and their corresponding tests into `app/sentinel-core/src/app/(protected)/dashboard/_components/`:
    - `chart-group-panel.tsx` & `chart-group-panel.test.tsx`
    - `dashboard-greeting.tsx` & `dashboard-greeting.test.tsx`
    - `dashboard-shell.tsx` & `dashboard-shell.test.tsx`
    - `dashboard-sidebar.tsx` & `dashboard-sidebar.test.tsx`
    - `dashboard-widget-wrapper.tsx`
    - `kpi-carousel-widget.tsx` & `kpi-carousel-widget.test.tsx`
    - `system-activity-widget.tsx` & `system-activity-widget.test.tsx`
- [x] Modify `app/sentinel-core/src/app/(protected)/dashboard/_components/index.ts` to export all the newly created components.
- [x] Run `pnpm --dir app/sentinel-core test` to confirm all newly copied component tests compile and pass.
      **Migration required:** No.

### Phase 2: Refactor Dashboard Page and Wire Sidebar/Greeting Features

**Goal:** Integrates the ported components into the core dashboard page for both `admin` and `superadmin` layouts.

- [x] Modify `app/sentinel-core/src/app/(protected)/dashboard/page.tsx` to:
    - Import `useProfileQuery` and retrieve the user's details.
    - Implement dynamic display name parsing (`displayName`) and loading checks.
    - Embed both `superadmin` and `admin` page structures inside `DashboardShell`.
    - Use `DashboardGreeting` and `Separator className="my-6"` inside the shell at the top.
    - Align spacing, margins (`lg:-m-6`), paddings, and alignment structure with `sentinel-support`.
- [x] Create `app/sentinel-core/src/app/(protected)/dashboard/page.test.tsx` to test the user role and layout renders.
- [x] Run `pnpm --dir app/sentinel-core test` to confirm all tests pass successfully.
      **Migration required:** No.

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-core test` to ensure all dashboard component and layout tests execute and pass without errors.

### Manual Verification

1. Boot the development servers using `pnpm dev`.
2. Access `http://localhost:3002/dashboard` with both an `admin` and a `superadmin` account.
3. Confirm that:
    - The greeting updates dynamically depending on the current time of day.
    - The right sidebar is visible, rendering the calendar and latest three announcements.
    - Layout stacks correctly on mobile viewport sizes.
    - Paddings, margins, colors, and font weights are identical to `sentinel-support`.
