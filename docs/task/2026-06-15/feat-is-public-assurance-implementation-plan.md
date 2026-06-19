# feat: Is-Public Assurance — UI Polish & Assignment Pre-Selection

**Summary:** Remove visual noise from exam cards (Draft labels and the sidebar icon), wire the "Share" dropdown button to pre-select the exam on the Assignment page, improve the tab-filter UX on the Exams dashboard, and add a sidebar separator between the Students and Exam groups — all applied consistently to both `sentinel-web` and `sentinel-core`.

---

## Proposed Changes

### Phase 1: Remove Exam Icon from the Sidebar Layout (Exam-Page Sub-Navigation)

**Goal:** The exam page's internal workspace-shell sidebar no longer renders an icon next to the "Exams" heading, giving a cleaner layout.

> **Note:** "the icon on the sidebar layout of the exam page" refers to the icon row inside `ExamsWorkspaceShell`. Both apps share an identical shell layout.

#### [MODIFY] exams-workspace-shell.tsx (sentinel-web)

`app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx`

- [x] Remove any icon import rendered adjacent to the "Exams" `<h1>` heading inside `ExamsWorkspaceShell` — keep only the text heading.
- [x] Write test at `exams-workspace-shell.test.tsx` verifying the heading renders without an SVG/icon element.

#### [MODIFY] exams-workspace-shell.tsx (sentinel-core)

`app/sentinel-core/src/app/(protected)/exams/_components/layout/exams-workspace-shell.tsx`

- [x] Apply the same icon-removal change.
- [x] Write / update `exams-workspace-shell.test.tsx` verifying the heading renders without an icon element.

**Migration required:** No — pure UI change.

---

### Phase 2: Remove Draft Attribution Text from Exam Cards

**Goal:** Exam cards in both apps no longer show `"Draft — no questions added yet"` in the card body or `"Draft"` / `"Draft by <name>"` in the attribution row beneath the assigned instructor.

#### [MODIFY] exam-card-body.tsx (sentinel-web)

`app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-body.tsx`

- [x] Remove the `showDraftNote` variable (line 53) and its conditional `<div>` block (lines 74–80) that renders `"Draft — no questions added yet"`.
- [x] Remove the `getExamAttribution` helper's draft arm (`"Draft"` / `"Draft by <name>"`); gate the attribution row only for published/created-by info on non-draft exams.
- [x] Update `exam-card-body.test.tsx` — add a test confirming no `"Draft"` or `"Draft — no questions"` text appears for a draft exam card.

#### [MODIFY] exam-card-body.tsx (sentinel-core)

`app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-body.tsx`

- [x] Remove the `isDraft` / `creatorOrPublisherText` draft arm from the card body.
- [x] Update `exam-card-body.test.tsx` (sentinel-core) to confirm draft attribution text is hidden.

#### [MODIFY] exam-list-item.tsx (sentinel-web)

`app/sentinel-web/src/features/exams/_components/cards/exam-list-item.tsx`

- [x] Remove the `getExamAttribution` draft arm so attribution is suppressed for draft exams; show published-by/created-by only for non-draft exams.
- [x] Add a unit test in `exam-list-item.test.tsx` verifying that a draft exam does not render any attribution text.

#### [MODIFY] exam-list-item.tsx (sentinel-core)

`app/sentinel-core/src/features/exams/_components/cards/exam-list-item.tsx`

- [x] Remove the `isDraft` / `creatorOrPublisherText` draft arm.
- [x] Add / update `exam-list-item.test.tsx` for the same assertion.

**Migration required:** No — display-only change.

---

### Phase 3: Share Button → Pre-select Exam on Assignment Page

**Goal:** Clicking "Share / Assign" on any exam card or list item navigates to `/exams/assign?examId=<id>` with `examId` pre-populated, so the assignment selector auto-selects that exam.

The `assignment-content.tsx` in both apps already reads `searchParams.get('examId')` to pre-select the exam — no changes needed there.

#### [MODIFY] exam-card-header.tsx (sentinel-web)

`app/sentinel-web/src/features/exams/_components/cards/exam-card/exam-card-header.tsx`

- [x] Update `handleShare` to navigate to `` `/exams/assign?examId=${exam.id}` `` instead of plain `/exams/assign`.
- [x] Write / update `exam-card-header.test.tsx` to assert the router push call includes the `examId` query param.

#### [MODIFY] exam-card-header.tsx (sentinel-core)

`app/sentinel-core/src/features/exams/_components/cards/exam-card/exam-card-header.tsx`

- [x] Apply the same `examId` query param to `handleShare`.
- [x] Add / update a test asserting `examId` is passed.

#### [MODIFY] exam-list-item.tsx (sentinel-web)

`app/sentinel-web/src/features/exams/_components/cards/exam-list-item.tsx`

- [x] The list item's dropdown currently has no Share entry; add a `Share / Assign` `<DropdownMenuItem>` that calls ``router.push(`/exams/assign?examId=${exam.id}`)``.
- [x] Extend `exam-list-item.test.tsx` to verify the share menu item renders and triggers the correct route.

#### [MODIFY] exam-list-item.tsx (sentinel-core)

`app/sentinel-core/src/features/exams/_components/cards/exam-list-item.tsx`

- [x] Apply the same Share menu item with `examId` query param.
- [x] Update / add test assertions.

**Migration required:** No — routing/navigation change only.

---

### Phase 4: Improve Tab Filter UX on Exams Dashboard

**Goal:** The All / Published / Drafts / Archived tab selector is visually cleaner, more compact, and consistently styled in both apps.

#### [NEW] exams-filter-tabs.tsx (sentinel-web)

`app/sentinel-web/src/app/(protected)/(instructor)/exams/dashboard/_components/exams-filter-tabs.tsx`

- [x] Extract the `<TabsList>` / `<TabsTrigger>` block from `dashboard/page.tsx` into a standalone `<ExamsFilterTabs>` component.
- [x] Redesign to pill-style compact tabs: tighter padding (`px-3 py-1.5`), `h-9` height, smaller count badge (`text-[10px]`), clean active indicator (solid underline or subtle ring), remove heavy background on inactive tabs.
- [x] Write `exams-filter-tabs.test.tsx` verifying all four tab values render and `onValueChange` fires correctly.

#### [MODIFY] dashboard/page.tsx (sentinel-web)

`app/sentinel-web/src/app/(protected)/(instructor)/exams/dashboard/page.tsx`

- [x] Replace the inline `<TabsList>` block with `<ExamsFilterTabs>`.

#### [NEW] exams-filter-tabs.tsx (sentinel-core)

`app/sentinel-core/src/app/(protected)/exams/dashboard/_components/exams-filter-tabs.tsx`

- [x] Apply the same component extraction and pill-style refinement.
- [x] Write `exams-filter-tabs.test.tsx`.

#### [MODIFY] dashboard/page.tsx (sentinel-core)

`app/sentinel-core/src/app/(protected)/exams/dashboard/page.tsx`

- [x] Replace the inline `<TabsList>` block with `<ExamsFilterTabs>`.

**Migration required:** No — UI-only refactor.

---

### Phase 5: Add Separator Between Students and Exams in Instructor Sidebar

**Goal:** In `sentinel-web`'s instructor sidebar, add a visible `<SidebarSeparator>` between the Students item and the Exams / Question Bank group.

#### [MODIFY] constants/index.ts (sentinel-web sidebar)

`app/sentinel-web/src/components/sidebar/instructor/constants/index.ts`

- [x] Split `managementItems` into two separate arrays:
    - `studentManagementItems` — Subjects, Classrooms, Students
    - `examManagementItems` — Exams, Question Bank

#### [MODIFY] instructor-sidebar.tsx (sentinel-web)

`app/sentinel-web/src/components/sidebar/instructor/instructor-sidebar.tsx`

- [x] Update `sections` array to render `studentManagementItems` (with `showSeparator: true`) followed by a new `examManagementItems` section (with `showSeparator: true`), so a `<SidebarSeparator>` appears between Students and Exams.
- [x] Update `instructor-sidebar.test.tsx` to assert the separator renders between the two groups.

**Migration required:** No — layout/config only.

---

## Done Criteria

- [ ] No `"Draft — no questions added yet"` text visible in exam cards in either app.
- [ ] No `"Draft"` / `"Draft by …"` attribution text shown in exam cards or list items in either app.
- [ ] Clicking `"Share / Assign"` routes to `/exams/assign?examId=<id>`, and the assignment page auto-selects the exam.
- [ ] Tab filter UI is compact and clean using the extracted `<ExamsFilterTabs>` component in both apps.
- [ ] Instructor sidebar shows a visible separator between Students and the Exams group.
- [ ] All Vitest tests pass.

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir app/sentinel-web test
pnpm --dir app/sentinel-core test
```

### Manual Verification

1. Navigate to `/exams` in sentinel-web; confirm no `"Draft…"` text appears on draft exam cards.
2. Open "Share / Assign" dropdown on an exam card; confirm redirect lands on `/exams/assign?examId=<correct-id>` and the selector pre-selects the exam.
3. Confirm Exams tab filter looks compact and clean.
4. Open instructor sidebar; confirm visible separator between Students and Exams.
5. Repeat all checks in sentinel-core.

---

## Additional Considerations

- **No breaking API or schema changes** — pure UI and navigation update.
- **No new environment variables** required.
- **No Prisma migration** needed.
- Both `sentinel-web` and `sentinel-core` must be updated in lock-step since they share the same exam card design pattern.
