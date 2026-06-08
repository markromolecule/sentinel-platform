# feat-003: Support Dashboard UI Improvements

## Summary

Extend the existing `sentinel-support` dashboard with three targeted UI improvements:
a right-hand sidebar containing a mini calendar and announcement feed, a time-sensitive
greeting header ("Good morning/afternoon/evening, [Full Name]") with the current date
and a contextual sub-text, and the KPI metric cards carousel retained from feat-002.

---

## Pre-Planning Checklist

- [x] Task input summarized in one sentence
- [x] Relevant source files scanned
- [x] All files, services, and DB tables identified
- [x] Prisma migration decision made

> **Task (one sentence):** Add a right-hand sidebar (Calendar + Announcements) to the
> Support dashboard, introduce a personalized greeting block (time-of-day, full name,
> date, sub-text) in the top-left of the main content area, and keep the existing
> horizontally-draggable KPI carousel below it.

---

## Option Analysis (1-3-1 Rule)

### Option A — Inline Greeting + Sidebar as Separate Component (simple/fast)
Add the greeting block directly inside `page.tsx` and add a static right-panel div
alongside the existing widget list, wired to shadcn `Calendar` and a trimmed
`AnnouncementsContainer`.
- **Tradeoff:** Fast to implement but couples the layout change into `page.tsx`,
  making the file large and hard to extend later.

### Option B — Dashboard Shell Wrapper + Dedicated Sidebar Component (robust/scalable)
Create a `DashboardShell` layout component (mirroring `SubjectWorkspaceShell`) that
wraps the main content with a sticky right sidebar, extract the greeting into its own
`DashboardGreeting` component, and wire `DashboardSidebar` (mini Calendar + Announcements
list) as a separate component with clear props interfaces.
- **Tradeoff:** Best separation of concerns, highly maintainable, follows existing
  `SubjectWorkspaceShell` pattern — slight extra file count.

### Option C — Route-Level Layout Segment for Dashboard Only (creative)
Use a `layout.tsx` inside `app/(protected)/dashboard/` to inject the sidebar at the
route level, keeping `page.tsx` purely for content.
- **Tradeoff:** Clean Next.js approach, but overrides the existing protected layout
  padding (`p-6`) and requires layout nesting gymnastics to avoid double-padding.

---

## Best Option: **Option B** — Dashboard Shell Wrapper + Dedicated Sidebar

**Why:** Option B exactly mirrors the proven `SubjectWorkspaceShell` pattern already
in the codebase (`subjects/_components/layout/subject-workspace-shell.tsx`). It is the
most maintainable approach — the sidebar and greeting are independently testable and
composable. It avoids the layout-nesting complexity of Option C while keeping
`page.tsx` lean. No new dependencies are introduced; shadcn `Calendar` is already
available via `@sentinel/ui`.

> **NOTE:** No new dependencies are required. `Calendar` is imported from shadcn
> (already installed). The Announcements mini-feed reuses the existing Supabase query
> hook from `announcements/_components`.

---

## Open Questions

> **NOTE:** The following decisions are conservative defaults. Review before execution:

1. **Calendar interaction** — The mini-calendar in the sidebar is read-only (date
   highlight only) for now, not connected to the full `/calendar` page events. If
   click-to-navigate is required, a `useRouter` push can be added later.
2. **Announcements count** — The sidebar announcement feed will show the latest 3
   announcements (trimmed list). Full list is on `/announcements`.
3. **Greeting sub-text** — Default sub-text: _"Here's what's happening across your
   managed institutions today."_ This can be changed to a dynamic data-driven message
   later.
4. **Sidebar visibility on mobile** — On small viewports the sidebar collapses below
   the main content (stacks vertically), matching the subjects shell behavior.
5. **Right sidebar width** — Fixed at `w-72` (288 px), consistent with shadcn
   Calendar default width.

---

## Proposed Changes

### Phase 1: Dashboard Greeting Component

**Goal:** Build a standalone `DashboardGreeting` component that renders the
time-of-day greeting, the user's full name, the current date, and a static sub-text.

- [x] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-greeting.tsx`
  - `'use client'` — reads `new Date()` on client
  - Props: `fullName: string`
  - Derive greeting: `getTimeOfDayGreeting(): 'Good morning' | 'Good afternoon' | 'Good evening'` based on `new Date().getHours()` (morning: 0–11, afternoon: 12–17, evening: 18–23)
  - Render format:
    ```
    Good morning, Joseph           ← h2, text-2xl font-semibold
    Monday, June 9, 2026           ← p, text-sm text-muted-foreground
    Here's what's happening ...    ← p, text-xs text-muted-foreground mt-1
    ```
  - Date formatted via `Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })`
  - JSDoc on exported function and `getTimeOfDayGreeting` helper
- [x] Export from `app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts`
- [x] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-greeting.test.tsx`
  - Test: renders "Good morning" when hour is 8
  - Test: renders "Good afternoon" when hour is 14
  - Test: renders "Good evening" when hour is 20
  - Test: renders the `fullName` prop in the heading
  - Test: renders the formatted current date

**Migration required:** No.

---

### Phase 2: Dashboard Right Sidebar Component

**Goal:** Build a `DashboardSidebar` component containing a shadcn mini-calendar and
a trimmed announcements feed (latest 3), mirroring the subjects left-sidebar pattern
but positioned on the right.

- [x] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-sidebar.tsx`
  - `'use client'` — uses `useState` for calendar selected date
  - No external props
  - **Calendar section:**
    - Section heading: `p` with text "Calendar" and a `CalendarDays` lucide icon
    - Import `Calendar` from `@sentinel/ui` (shadcn)
    - Controlled: `const [date, setDate] = useState<Date | undefined>(new Date())`
    - `mode="single"`, `selected={date}`, `onSelect={setDate}`, `className="rounded-md border-0 p-0 w-full"`
  - **Announcements section:**
    - Section heading: `p` with text "Announcements" and a `Megaphone` lucide icon
    - Import and use `useAnnouncementsQuery` from `@sentinel/hooks` (existing query hook)
    - Show latest 3 items (`data?.slice(0, 3)`)
    - Each row: announcement title (truncated, `line-clamp-1`), `text-xs text-muted-foreground` date
    - Empty state: "No announcements yet."
    - Footer link: "View all →" linking to `/announcements` via `Link` from `next/link`
  - Visual layout: `flex flex-col gap-6 p-4` with a `Separator` between calendar and announcements sections
  - JSDoc on exported function
- [x] Export from `app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts`
- [x] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-sidebar.test.tsx`
  - Test: renders "Calendar" section heading
  - Test: renders "Announcements" section heading
  - Test: renders "View all" link with href `/announcements`
  - Test: renders empty state when no announcements

**Migration required:** No.

---

### Phase 3: Dashboard Shell (Two-Column Layout)

**Goal:** Introduce a `DashboardShell` wrapper component that places the main widget
content on the left and `DashboardSidebar` on the right, following the same layout
pattern as `SubjectWorkspaceShell`.

- [x] Create `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-shell.tsx`
  - `'use client'`
  - Props: `children: ReactNode`
  - Layout:
    ```tsx
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
      {/* Main content */}
      <main className="min-w-0 flex-1 space-y-6 p-6 pb-10">{children}</main>

      {/* Right Sidebar */}
      <div className="bg-background sticky top-0 hidden w-72 shrink-0 flex-col border-l lg:flex overflow-y-auto">
        <DashboardSidebar />
      </div>
    </div>
    ```
  - Mobile: sidebar stacks below children (`block lg:hidden` wrapper, full-width)
  - JSDoc on exported function
- [x] Export from `app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts`
- [x] Write tests at `app/sentinel-support/src/app/(protected)/dashboard/_components/dashboard-shell.test.tsx`
  - Test: renders `children` content
  - Test: renders `DashboardSidebar` alongside children

**Migration required:** No.

---

### Phase 4: Page Refactor — Wire Greeting + Shell into `page.tsx`

**Goal:** Update the support dashboard page to use `DashboardShell`, render
`DashboardGreeting` at the top of the main content, and retain all existing widgets
below it.

- [x] Modify `app/sentinel-support/src/app/(protected)/dashboard/page.tsx` (support role branch only):
  - Wrap the support branch return with `<DashboardShell>` replacing the bare `<div className="flex flex-col gap-6 p-4 md:p-6">`
  - Remove `<PageHeader title="Support Overview" />` — replaced by `<DashboardGreeting>`
  - Add `<DashboardGreeting fullName={user?.user_metadata?.full_name ?? user?.email ?? 'there'} />` as the **first child** inside `DashboardShell`'s main content area (passed as `children`)
  - Keep the existing `<DndContext>` + `<SortableContext>` widget list below the greeting
  - Admin role branch: **untouched**
  - Final support branch layout order:
    ```
    DashboardShell
    ├── DashboardGreeting (full name, time greeting, date, sub-text)
    └── DndContext + SortableContext
        ├── KpiCarouselWidget  (draggable)
        ├── ChartGroupPanel    (draggable)
        ├── RecentInstitutionsWidget (draggable)
        ├── ActiveSessionsWidget     (draggable)
        ├── FlaggedIncidentsWidget   (draggable)
        └── SystemActivityWidget     (draggable)
    DashboardSidebar (right column, inside DashboardShell)
    ├── Calendar (shadcn, mini, read-only)
    └── Announcements (latest 3, "View all" link)
    ```
- [x] Write/update tests at `app/sentinel-support/src/app/(protected)/dashboard/page.test.tsx` (if it exists) or create it
  - Test: renders `DashboardGreeting` for support role
  - Test: does NOT render `DashboardGreeting` for admin role (admin branch unchanged)

**Migration required:** No.

---

### Phase 5: Final Exports, Lint & Tests

**Goal:** Ensure all exports are correct, lint passes, and all tests pass.

- [x] Verify `app/sentinel-support/src/app/(protected)/dashboard/_components/index.ts` exports all five new components:
  - `DashboardGreeting`, `DashboardSidebar`, `DashboardShell`
- [x] Run full test suite: `pnpm --dir app/sentinel-support test`
- [x] Run lint: `pnpm --dir app/sentinel-support lint`
- [x] Confirm no TypeScript errors: `pnpm --dir app/sentinel-support build` (or `tsc --noEmit`)

**Migration required:** No.

---

## Files Touched Summary

| File | Action | Phase |
|---|---|---|
| `dashboard/_components/dashboard-greeting.tsx` | NEW | 1 |
| `dashboard/_components/dashboard-greeting.test.tsx` | NEW | 1 |
| `dashboard/_components/dashboard-sidebar.tsx` | NEW | 2 |
| `dashboard/_components/dashboard-sidebar.test.tsx` | NEW | 2 |
| `dashboard/_components/dashboard-shell.tsx` | NEW | 3 |
| `dashboard/_components/dashboard-shell.test.tsx` | NEW | 3 |
| `dashboard/_components/index.ts` | MODIFY | 1, 2, 3 |
| `dashboard/page.tsx` | MODIFY | 4 |

---

## Migration Decision

**Migration required: NO**

All changes are purely frontend (React components, Zustand store extensions). The
announcements data is already served by the existing Supabase-backed
`useAnnouncementsQuery` hook. No new DB tables, Prisma schema changes, or API
endpoints are needed.

> **Rollback note (if a migration were ever needed in future):** `prisma migrate reset --skip-seed`

---

## Verification Plan

### Automated Tests

```bash
# Run all support portal tests
pnpm --dir app/sentinel-support test

# Dashboard tests only
pnpm --dir app/sentinel-support test dashboard
```

All new `*.test.tsx` files must pass with no skipped cases.

### Manual Verification

1. Navigate to `/dashboard` as a `support` role user
2. Greeting renders correctly at the top-left: correct time-of-day salutation, full name, today's date, sub-text
3. Right sidebar is visible on ≥ `lg` breakpoint: Calendar and Announcements sections present
4. Calendar highlights today's date; can select a different date
5. Announcements panel shows ≤ 3 items; "View all →" navigates to `/announcements`
6. KPI carousel below greeting scrolls horizontally by pointer drag
7. Widgets below carousel remain drag-reorderable (layout persists on refresh)
8. On mobile (< `lg`): sidebar stacks vertically below main content, no horizontal overflow
9. Admin role at `/dashboard`: greeting and sidebar are **NOT** shown; existing admin layout is intact

---

## Additional Considerations

- **No new `.env` variables** are introduced.
- **No breaking API changes** — pure frontend additions.
- **Admin role dashboard** (`role !== 'support'`) is **not touched**.
- `useAnnouncementsQuery` is already available in `@sentinel/hooks` — no new hook needed.
- `Calendar` from shadcn is already available via `@sentinel/ui` — no new dependency needed.
- `getTimeOfDayGreeting()` is a pure function — unit-testable without mocking.
- All new files follow `kebab-case` naming; exported functions use `PascalCase` with JSDoc.

---

## Reference Docs

- [Component Rules](../../../.agents/rules/web/components.md)
- [Query Hooks Rules](../../../.agents/rules/web/query-hooks.md)
- [Zustand Store Rules](../../../.agents/rules/web/zustand-store.md)
- [Project Structure Rules](../../../.agents/rules/web/project-structure.md)
- [Global Naming Conventions](../../../.agents/rules/global/global-naming-conventions.md)
- [Subject Workspace Shell (sidebar pattern reference)](../../app/sentinel-support/src/app/(protected)/(support)/subjects/_components/layout/subject-workspace-shell.tsx)
