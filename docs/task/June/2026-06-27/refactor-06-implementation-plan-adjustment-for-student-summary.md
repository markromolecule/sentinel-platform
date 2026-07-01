# Implementation Plan: Adjustment for Student Summary Report

This plan coordinates the frontend adjustments required to improve the individual student attempt report view (`/exams/reports/[examId]/[attemptId]`) accessed by instructors. It focuses on sidebar shell alignment, breadcrumb removal, target back navigation using URL query parameters, and converting the question list into a structured, highly-scannable table layout.

---

## 1-3-1 Options Analysis

**Option 1: Complete Client-Side Navigation and Table Refactoring (Recommended)**
- **Approach**:
  - Exclude the student report sub-path from [exams-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx).
  - Render a Report Sections vertical sidebar layout directly in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx) that navigates back to the parent report page segments via query parameters (`?section=overview/attempts/queue`).
  - Read query params in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx) to set the active section on load.
  - Refactor [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx) from card blocks into a standard `@sentinel/ui` `Table`.
- **Tradeoff**: Offers the most clean, responsive, and unified layout while preserving state across page refreshes.

**Option 2: Minimalist Routing with State Toggles**
- **Approach**:
  - Retain the default Exams sidebar layout and hide the breadcrumb.
  - Maintain the active section in a client-side state store (Zustand or local storage) rather than URL query parameters.
  - Keep question cards but condense the size, omitting a full table conversion.
- **Tradeoff**: Slightly simpler to implement, but fails the requirement to render the report sidebar layout and active states will not survive page reloads.

**Option 3: Shared Workspace Layout Wrapper**
- **Approach**:
  - Create a new shared Layout structure (`exams/reports/layout.tsx`) that handles sidebar mounting and navigation states for both detailed exam reports and student attempt reports.
  - Convert the question cards into a fully virtualized `DataTable` component.
- **Tradeoff**: Provides high architectural abstraction, but introduces substantial refactoring risk, file churn, and complexity for existing routes and tests.

**Best Option**: **Option 1**
**Why**: Option 1 ensures strict adherence to all requirement details (sidebar layout matching the report, breadcrumbs removed, back button correctly returning to the attempts section), uses native URL search params for page navigation robustness, and keeps component structures testable and clean.

---

## Phase 1: Sidebar Layout & Shell Integration
**Goal**: Remove the generic Exams sidebar from the student attempt page and replace it with the Report Sections sidebar layout.

- [ ] Exclude report detail routes from the Exams sidebar in [exams-workspace-shell.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.tsx) by checking if the path contains `exams/reports/[examId]/[attemptId]`.
- [ ] Implement the two-column desktop sidebar layout inside [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx) (aside panel on the left, main content scroll area on the right).
- [ ] Render the Report Sections sidebar buttons (Overview, Attempt Summary, Action Queue) in the left panel of [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx). Clicking them navigates to `/exams/[examId]/report?section=[section]`.
- [ ] Write unit tests to cover the workspace shell logic update in [exams-workspace-shell.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-workspace-shell.test.tsx).

**Migration required**: No — purely layout and client routing adjustments.

---

## Phase 2: Navigation Polish & Section URL State
**Goal**: Clean up top breadcrumbs, update the Back button target, and initialize the active section on the parent page from query parameters.

- [ ] Remove the breadcrumb element (`Reports / {examTitle} / {studentName}`) from [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx).
- [ ] Update the "Back to Summary" button target link in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx) to load `/exams/[examId]/report?section=attempts`.
- [ ] Update the initial `activeSection` state in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx) to read from `useSearchParams().get('section')` (defaulting to `'overview'`).
- [ ] Ensure that [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx) handles Suspense boundaries for `useSearchParams` rendering safely.
- [ ] Write unit tests in [page.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.test.tsx) to verify that loading the URL with `?section=attempts` correctly triggers the attempts section tab state.

**Migration required**: No.

---

## Phase 3: Tabular Questions List
**Goal**: Refactor the attempt report questions view from a card list into a scannable table layout.

- [ ] Import standard table elements (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) from `@sentinel/ui` in [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx).
- [ ] Refactor [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx) to display question reports in a Table.
- [ ] Design the columns mapping:
  1. `#` - row index + 1
  2. `Question` - renders question prompt (with passage render toggled inside collapsible section if `getQuestionPassage` is defined)
  3. `Type` - renders type badge
  4. `Student Answer` - formatted using `formatAnswerValue`
  5. `Correct Answer` - formatted using `formatCorrectAnswer`
  6. `Score` - displays awarded score / max score
  7. `Overrides` - renders inline override score input and reason textarea if `editable` is true
- [ ] Modify the override change events `handleOverrideChange` to bind to the inputs rendered in the new table layout in [attempt-report-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx).
- [ ] Write unit tests in [attempt-report-view.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-view.test.tsx) to cover the table rendering, column verification, and editable input bindings.

**Migration required**: No.

---

## Done Criteria
- Every task references a concrete file path or function.
- All modified components contain descriptive JSDoc block comments.
- Navigating to `/exams/reports/[examId]/[attemptId]` shows the Report Sections sidebar instead of the Exams sidebar.
- "Back to Summary" button redirects to `/exams/[examId]/report?section=attempts` and mounts with the Attempt Summary tab active.
- Redundant breadcrumbs are removed.
- Question list is rendered inside a clean, responsive `@sentinel/ui` `Table` layout.
- Grade override inputs function correctly and save override details.
- All Vitest test suites compile and pass.
