# feat-007 - Replicate sentinel-core Dashboard to sentinel-web: instructor

**Date:** 2026-06-11  
**Type:** Feature  
**Summary:** Replicate the advanced dashboard layout, greeting, and sidebar components from `sentinel-core` into `sentinel-web` for the `instructor` dashboard, ensuring design, style, and functional parity.

---

## 3 Viable Options

### Option A - Simple Header & Spacing Realignment

Replace the static `PageHeader` with `DashboardGreeting` and align layout margins/paddings on the instructor dashboard to match `sentinel-core`. Do not port the outer `DashboardShell` layout or the sticky `DashboardSidebar`.
_Tradeoff:_ Simplest and fastest to execute, but fails to replicate the premium sidebar calendar/announcements features and the full structural layout.

### Option B - Component Port and Layout Refactor ✅ Recommended

Port all missing layout components (`DashboardShell`, `DashboardSidebar`, `DashboardGreeting`) from `sentinel-core` to the instructor dashboard directory in `sentinel-web`. Update the instructor dashboard page to utilize these components, wrapping its widgets inside the shell and arranging them into a responsive layout.
_Tradeoff:_ Achieves complete visual and functional parity with the premium layout, but requires copying several React components and writing custom unit tests for them in `sentinel-web`.

### Option C - Core Shared Layout Package Extraction

Extract the dashboard layout components (`DashboardShell`, `DashboardGreeting`, `DashboardSidebar`) into a shared package (e.g., `packages/ui` or a new package) so they can be consumed by both `sentinel-core` and `sentinel-web`.
_Tradeoff:_ Best long-term architectural approach for code reuse, but carries the highest complexity and risk of breaking existing layout configurations across multiple applications.

## Best Option

**Option B** is the best option. It achieves full design and feature parity for the instructor dashboard while keeping all changes safely scoped inside the `sentinel-web` workspace, minimizing external risk and complexity.

## Concrete Next Steps

1. Create the ported dashboard components and their test suites in `app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/`.
2. Refactor `app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.tsx` to use `DashboardShell` and `DashboardGreeting`.
3. Re-arrange the instructor dashboard widgets within the main column of `DashboardShell`.
4. Create the page unit test suite `app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.test.tsx`.
5. Run the test suite and verify visual correctness.

---

## User Review Required

> [!IMPORTANT]
>
> - **Sidebar Layout Update:** The instructor dashboard will transition from its current 2-column layout to a new 2-column layout where the right column is a sticky sidebar containing a Calendar widget and the latest Announcements.
> - **Header Update:** The static `PageHeader` will be replaced by a dynamic, personalized `DashboardGreeting` that displays a time-of-day greeting (e.g., "Good afternoon, Jane!") and a live-updating date/time clock pill.

## Open Questions

> [!NOTE]
> None. The requirements for parity in features, components, paddings, margins, and functionality are fully defined.

---

## Proposed Changes

### Component: frontend (sentinel-web)

Port and adapt components from `sentinel-core` to `sentinel-web` to structure the new dashboard layout.

#### [NEW] [dashboard-shell.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-shell.tsx>)

Ported from `app/sentinel-core`. Wraps children inside the primary content column and embeds the `DashboardSidebar` in the right column (collapsible on mobile, sticky on desktop).

#### [NEW] [dashboard-shell.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-shell.test.tsx>)

Ported from `app/sentinel-core`. Tests rendering of main content and the sidebar.

#### [NEW] [dashboard-sidebar.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-sidebar.tsx>)

Ported from `app/sentinel-core`. Renders a calendar view and the latest 3 announcements using `useAnnouncementsQuery` from `@sentinel/hooks`.

#### [NEW] [dashboard-sidebar.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-sidebar.test.tsx>)

Ported from `app/sentinel-core`. Tests the sidebar loading state, calendar, and announcement rendering.

#### [NEW] [dashboard-greeting.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-greeting.tsx>)

Ported from `app/sentinel-core`. Renders a time-sensitive greeting and today's date/time pill.

#### [NEW] [dashboard-greeting.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/_components/dashboard-greeting.test.tsx>)

Ported from `app/sentinel-core`. Tests time-of-day greeting text and display name formatting.

#### [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.tsx>)

Refactor to:

- Use `useProfileQuery` from `@sentinel/hooks` to get the instructor's profile name.
- Wrap the page in `DashboardShell` and include `DashboardGreeting` + `Separator` inside it.
- Render the instructor-specific widgets (`DashboardStats`, `RecentExams`, `RecentStudents`, and `QuickActions`) inside the flexible left column of the shell.
- Remove redundant announcement widget since it is now in the outer sidebar.

#### [NEW] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/dashboard/page.test.tsx>)

Add unit tests for the instructor dashboard page to verify greeting, layout, and component loading states.

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-web test` to verify all dashboard tests compile and pass successfully.

### Manual Verification

1. Boot the development servers with `pnpm dev`.
2. Log in as an instructor and navigate to the dashboard at `http://localhost:3000/dashboard`.
3. Verify that the time-of-day greeting (e.g., "Good morning!", "Good afternoon!") displays correctly.
4. Verify the sticky right sidebar renders the Calendar and recent Announcements.
5. Verify responsive layout behavior on tablet and mobile viewports (sidebar should stack below).
6. Verify alignment, colors, margins, and padding.
