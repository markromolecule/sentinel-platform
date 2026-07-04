# Exam Reports — Implementation Tasks

---

## 1. Backend Pagination — `/exams/reports` (`app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`)

Connect the instructor exam reports listing page to backend pagination.

**Requirements:**

- The page must not fetch all records at once. It should request a specific page and page size from the backend.
- Pagination parameters (e.g. `page`, `limit` or `cursor`) must be visible in the Network tab of the browser DevTools — confirm the request URL includes pagination query parameters.
- The UI must update the displayed records when the user navigates between pages.
- Use the same pagination component/pattern already established in the codebase.

---

## 2. UI Cleanup — `/exams/reports` (`app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`)

### 2a. Remove "Back to Exams" Button

- Delete the "Back to Exams" button from the `/exams/reports` page entirely.
- Do not replace it with another navigation element.

### 2b. Remove Breadcrumb Navigation

- Remove the `<Breadcrumb />` component (or equivalent) from the `/exams/reports` page.
- Do not replace it with another breadcrumb or navigation trail.

### 2c. Fix Report Card — Pin "Open Report Summary" Button to Bottom

The "Open Report Summary" button inside each report card must always appear at the bottom of the card, regardless of how long the card's title or description is.

**Implementation:**

- Make the card a flex column container: `display: flex; flex-direction: column`.
- Push the button to the bottom using `margin-top: auto` on the button (or its wrapper).
- Do not use absolute positioning.
- Verify the layout holds when titles are short, long, or truncated, and when descriptions vary in length.

---

## 3. Page Redesign — `/exams/[id]/report` (`app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx`)

Redesign this page from a tab-based layout to a **sidebar navigation layout**, consistent with the existing exam page and subject page patterns (`app/sentinel-web/src/app/(protected)/(instructor)/subjects/[id]/layout.tsx`) in the codebase.

### 3a. Sidebar Layout

- Replace the current top-level tab layout with a vertical sidebar navigation panel on the left.
- Each former tab becomes a sidebar nav item.
- The right-hand content area renders the selected section.
- Mirror the structure, component names, and styling conventions used on the exam page / subject page. Do not invent a new pattern.

### 3b. Action Queue — Redesign the Tab Layout

The Action Queue section currently uses a nested/secondary tab layout. This must be redesigned.

**Requirements:**

- Remove the nested tab pattern inside the Action Queue entirely.
- Redesign the Action Queue UI so that its content (queued items, filters, statuses, etc.) is accessible without tabs — for example, using segmented controls, inline filtering, or stacked sections, whichever best fits the existing design system.
- The goal is to eliminate redundant or nested tab structures. One level of navigation (the sidebar) should be sufficient.

### 3c. Attempt Summary Report Table

- Replace the current table implementation with the shared `DataTable` component imported from `@sentinel/ui`.
- Do **not** wrap the `DataTable` in a `<Card>` or card-style container. It should render directly in the content area, consistent with how other pages in the codebase use this component.
- Verify that column definitions, sorting, and any existing functionality are preserved after the migration.

### 3d. Pagination — All Tables and Card Lists

Every table and paginated card list on the `/exams/[id]/report` page must be connected to backend pagination.

**Requirements:**

- No table or card list should load its full dataset in a single request.
- Each paginated section must send `page` / `limit` (or equivalent) parameters to the backend and reflect the response correctly.
- Use the project's existing pagination component. Do not implement a custom one.
- This applies to: the Attempt Summary Report table, the Action Queue list, and any other data list on this page that currently loads unbounded data.

---

## Acceptance Criteria Summary

| Area                        | Check                                                                        |
| --------------------------- | ---------------------------------------------------------------------------- |
| `/exams/reports` pagination | Network tab shows paginated request with page/limit params                   |
| "Back to Exams" button      | Removed, no replacement                                                      |
| Breadcrumb                  | Removed, no replacement                                                      |
| Report card button position | Button always at bottom regardless of content height                         |
| `/exams/[id]/report` layout | Sidebar nav replaces top-level tabs; matches exam/subject page pattern       |
| Action Queue                | No nested tabs; content accessible without secondary tab navigation          |
| Attempt Summary table       | Uses shared `DataTable` component from `@sentinel/ui`; not wrapped in a card |
| All tables/lists pagination | Connected to backend; no full-dataset fetches                                |
