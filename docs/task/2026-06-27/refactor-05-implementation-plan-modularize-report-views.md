# Implementation Plan: Decompose Detailed Report Page Views

This plan modularizes the main report page by dividing its three primary sections (Overview, Attempt Summary, Action Queue) into isolated sub-view components located inside the `_components/` subdirectory. This improves component isolation, makes it easier to write tests, and drastically reduces the size of `page.tsx`.

---

## Proposed Changes

### Component 1: Create View Components

#### [NEW] [overview-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/overview-view.tsx)
- Create `OverviewView` component displaying:
  - Header title, scheduled info, and back/refresh buttons
  - Summary metric cards section
  - Incident, severity, and window breakdown lists
- Document with descriptive JSDoc.

#### [NEW] [attempts-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/attempts-view.tsx)
- Create `AttemptsView` component rendering:
  - Attempts summary header and description
  - Attempts summary `DataTable` with search and section facets in `toolbarActions`
- Document with descriptive JSDoc.

#### [NEW] [action-queue-view.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/_components/action-queue-view.tsx)
- Create `ActionQueueView` component containing:
  - Action Queue header and description
  - Inline queue tab selection buttons (Needs Review, Needs Makeup, Needs Retake)
  - Selected `ActionQueuePanel` renders
- Document with descriptive JSDoc.

---

### Component 2: Main Page Layout Refactoring

#### [MODIFY] [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/%5Bid%5D/report/page.tsx)
- Remove detailed rendering code for Overview, Attempts, and Action Queue blocks.
- Import `OverviewView`, `AttemptsView`, and `ActionQueueView`.
- Clean up imports.
- Render these components conditionally in the main content container.

---

## Verification Plan

### Automated Tests
- Run unit tests to verify page flow and layout functionality remain intact:
  `pnpm --dir app/sentinel-web test src/app/\(protected\)/\(instructor\)/exams/\[id\]/report/page.test.tsx`
