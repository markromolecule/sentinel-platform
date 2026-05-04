# Support Portal Component Refactor Roadmap

This document outlines the strategic plan to refactor the Sentinel Support portal modules (Courses, Sections, Subjects, and Offered Subjects) into a modular, maintainable architecture following project standards.

## 1-3-1 structural Proposal

### Option 1: Page-by-Page Incremental Refactor

Refactor each module completely (Hooks -> Components -> Page) one at a time.

- **Pros:** Smaller PRs, immediate feedback for each module.
- **Cons:** Risk of inconsistent component patterns if logic is duplicated across pages before being abstracted.

### Option 2: Component-First Pattern Standardization (Recommended)

Extract common patterns across all four modules into a shared structure first, then migrate each page.

- **Pros:** Ensures maximum reusability. Identifies common hooks and component types early. Reduces total lines of code.
- **Cons:** Higher initial setup time before the first page is fully migrated.

### Option 3: Massive Parallel Overhaul

Move all logic into the new folder structure for all pages simultaneously.

- **Pros:** Fastest completion time if performed by a large team.
- **Cons:** Extremely high risk of regression. Difficult to review and test.

### Recommendation

**Option 2** is the best choice. By standardizing the `_components` (Dialogs, Forms, Tables, Views) and `_hooks` across all four modules, we ensure that the "Support" experience is uniform and that we don't build four slightly different versions of the same patterns.

---

## Phased Breakdown

### Phase 1: Foundation & Shared Hooks

- [x] Create `_hooks` directories for each module.
- [x] Extract state management for Courses.
- [x] Extract state management for Sections.
- [x] Extract state management for Subjects.
- [x] Centralize data-fetching logic using TanStack Query hooks in `_hooks/query`.

### Phase 2: Component Extraction

- [x] **Courses:** Extract `CourseForm`, `CourseTable`, and `CourseRevertDialog`.
- [x] **Sections:** Extract `SectionForm`, `SectionTable`, and `SectionRevertDialog`.
- [x] **Subjects:** Extract `SubjectForm`, `SubjectTable`, and `SubjectRevertDialog`.
- [x] **Offered Subjects:** Extract `OfferedTable`.

### Phase 3: Route Reorganization & Renaming

- [x] Move `subject-offerings` to `subjects/offered`.
- [x] Rename `SubjectOfferingsPage` to `OfferedPage`.
- [x] Update all import paths.

### Phase 4: Final Integration & Verification

- [x] Reconstruct `page.tsx` for all modules using only the new components and hooks.
- [x] Perform cross-browser and functional testing.

---

## Actionable Tasks

### General Setup

- [x] [NEW] Create `.agents/todo/refactor-support.md` to track real-time progress.

### Courses Module Refactor

- [x] `courses/_hooks/use-courses-page-state.ts`
- [x] `courses/_components/tables/courses-table.tsx`
- [x] `courses/_components/forms/course-form-dialog.tsx`
- [x] `courses/_components/views/courses-view.tsx`
- [x] `courses/page.tsx` (Clean up)

### Sections Module Refactor

- [x] `sections/_hooks/use-sections-page-state.ts`
- [x] `sections/_components/tables/sections-table.tsx`
- [x] `sections/_components/forms/section-form-dialog.tsx`
- [x] `sections/page.tsx` (Clean up)

### Subjects & Offered Module Refactor

- [x] [MOVE] `subject-offerings/` -> `subjects/offered/`
- [x] `subjects/_hooks/use-subjects-page-state.ts`
- [x] `subjects/_components/tables/subjects-table.tsx`
- [x] `subjects/_components/forms/subject-form-dialog.tsx`
- [x] `subjects/page.tsx` (Clean up)
- [x] `subjects/offered/_components/tables/offered-table.tsx`

---

## Data Layer

- **Schema Changes:** No database schema changes are required for this UI refactor.
- **API Contracts:** No backend changes are required; we will leverage existing Hono endpoints and TanStack Query hooks.

---

## Testing Strategy

### Automated Tests

- [ ] Create Vitest unit tests for the new state hooks (`use-courses-page-state.ts`, etc.) to ensure search and filter logic remains intact.
- [ ] Add basic rendering tests for extracted components.

### Manual Verification

1. **CRUD Operations:** Verify that creating, updating, and deleting courses/sections/subjects still works correctly.
2. **Context Switching:** Ensure the `TemplateContextToolbar` correctly filters data across all modules.
3. **Revert Flow:** Test the override-revert logic in the `RevertPreviewDialog` for all applicable modules.
4. **Navigation:** Verify that the new `/subjects/offered` route loads correctly and is linked from anywhere it was previously.
