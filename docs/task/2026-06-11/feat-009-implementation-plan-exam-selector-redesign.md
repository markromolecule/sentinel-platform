# feat-009 - Exam Selector Redesign (Incident Logs)

**Date:** 2026-06-11  
**Type:** Feature / UX Redesign  
**Summary:** Redesign the exam selection flow on the global Incident Logs & Analytics page (`/exams/logs`) to eliminate the blank-state roadblock and reduce click friction. This plan introduces a visual dashboard card grid for the initial selection state and a searchable combobox in the header for fast, context-preserving exam switching.

---

## 3 Viable Options

### Option A - Searchable Autocomplete Combobox only
Replace the standard `<Select>` dropdown with a custom searchable combobox component. Typing filters the list, which is grouped by active/completed status.
*Tradeoff:* Compact and minimal layout disruption, but leaves the "No examination selected" empty state in place.

### Option B - Visual Dashboard Cards Grid for Empty State
When no exam is selected, replace the passive empty state graphic with a beautiful grid of cards for all active/recent exams, containing metrics like student counts and incident counts.
*Tradeoff:* Inviting, click-to-select dashboard view, but requires clicking "Back" to choose a different exam once one is active.

### Option C - Hybrid Visual Cards Grid + Searchable Combobox Header Switcher ✅ Recommended
Show a searchable grid of visual exam cards when no exam is selected. Once an exam is selected, hide the grid, render the incidents table, and display a compact searchable combobox in the header for quick-switching.
*Tradeoff:* Ultimate premium UX for both landing and exploration, but requires more UI state management and custom components.

---

## Best Option

**Option C** is the best option. It completely eliminates the passive blank empty-state roadblock by displaying cards for active/recent exams, while simultaneously preserving maximum horizontal space for the incident logs table once an exam is selected. The header combobox allows power-user switching in a single click without leaving the page.

---

## Concrete Next Steps

1. Create a `ExamCardsGrid` component displaying exams with subjects, sections, status badges, and alert counts.
2. Create a `ExamCombobox` component using a Popover/Command-style search input for quick header switching.
3. Integrate both components into `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx`.
4. Update client-side tests to verify cards render when no `examId` is in the URL, and combobox renders when `examId` is present.

---

## User Review Required

> [!IMPORTANT]
> - **Visual Cards Grid:** Clicking an exam card will instantly update the URL query parameter `?examId=uuid`, loading the incidents table.
> - **Header Combobox:** The combobox will replace the "Select Examination" card at the top, freeing up 80px of vertical space for the incident logs table.

## Open Questions

> [!NOTE]
> None. The existing `useExamsQuery` hook returns all required exam details (title, subject, status, studentsCount, incidentCount).

---

## Proposed Changes

### Component: Frontend UI (sentinel-web)

Create selection UI components and integrate into the main logs page.

#### [NEW] [exam-cards-grid.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-cards-grid.tsx)
Displays a grid of recent and active exams when no exam is selected. Features search filtering, status tags, student counts, and hover micro-animations.

#### [NEW] [exam-combobox.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-combobox.tsx)
Searchable combobox for the top page header, allowing quick-switching between exams once a specific exam's incident table is active.

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx)
Integrates `ExamCardsGrid` and `ExamCombobox`. Cleans up the old select card and empty state graphics.

---

## Phases & Execution Plan

### Phase 1: Build Selection Components
**Goal:** Create `ExamCardsGrid` and `ExamCombobox` client components.

- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-cards-grid.tsx`
- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-combobox.tsx`
- [ ] Create Vitest test file `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-cards-grid.test.tsx`
- [ ] Create Vitest test file `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/_components/exam-combobox.test.tsx`
- [ ] Run `pnpm --dir app/sentinel-web test` to verify the components compile and tests pass

**Migration required:** No - purely frontend presentation changes.

---

### Phase 2: Page Integration and Layout Adjustments
**Goal:** Integrate components into the main logs page and verify user flow.

- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx` to use the hybrid layout
- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.test.tsx` to align with the new components and verify URL updates on click
- [ ] Run `pnpm --dir app/sentinel-web test` to verify all client tests pass successfully

---

## Verification Plan

### Automated Tests
- `pnpm --dir app/sentinel-web test` to run the updated page tests and verify selection behaviors.

### Manual Verification
1. Open the browser to `/exams/logs`.
2. Confirm the page displays a grid of visual exam cards with a search box, instead of a dashed blank box.
3. Search for an exam in the search input and click a card. Verify the incident table loads.
4. Verify the header combobox appears in the top action area. Click it and type to select a different exam. Verify the table updates instantly.
