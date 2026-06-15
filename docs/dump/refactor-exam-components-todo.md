# Refactor Exam Components

## Overview

The goal is to safely and fully refactor `@app/sentinel-web/src/features/exams/_components` to be cleaner and easier to maintain. Currently, the components are deeply nested and scattered across feature-specific folders (`exam-config`, `exam-list`, `exam-table`), making it hard to find items and maintain a consistent architecture.

## 1-3-1 Rule Analysis

### 3 Viable Options

**Option 1: Feature-Sliced Design within `_components`**
Group files by their exact functional capability within the exams feature (e.g., `assignment/`, `configuration/`, `preview/`, `listing/`).

- _Pros_: Highly decoupled features; all files for a single business capability live together.
- _Cons_: Doesn't clearly separate UI primitives (a form vs. a dialog vs. a view), leading to mental overhead when searching for generic component types.

**Option 2: UI-Role Based Structure (Dialogs, Views, Forms, Tables, Cards)**
Group components perfectly by their UI responsibility, flattening the hierarchy.

- _Pros_: Completely eliminates deep nesting. Aligns with standard component organization (Dialogs go in `dialogs/`, Views in `views/`). Highly predictable.
- _Cons_: Splits features apart (e.g., the `exam-assign-dialog` lives far from the `useExamAssignment` hook if we move hooks, though hooks typically go to `_hooks/`).

**Option 3: Hybrid Approach (Feature Folders with Internal UI Grouping)**
Keep the main folders (`exam-config`, `exam-list`), but enforce a strict `dialogs/`, `views/`, `forms/` structure inside each of them.

- _Pros_: Retains some of the current structure while cleaning it up.
- _Cons_: Still leaves us with deep nesting (e.g., `exam-config/dialogs/exam-assign-dialog`).

### The Best Option

**Option 2: UI-Role Based Structure**
_Why?_ The user explicitly suggested grouping related components into `dialogs`, `views`, etc., similar to other shared components. By fully adopting this pattern, we flatten the deep 5-level hierarchy (like `exam-list/exam-card/_components/exam-preview-dialog/question-types`) into a predictable, 1-to-2 level architecture. Developers will know immediately that any pop-ups reside in `_components/dialogs/`, any full-page chunks reside in `_components/views/`, and reusable UI parts reside in `_components/cards/`, `_components/tables/`, or `_components/forms/`.

### Recommended Next Steps

1. **Approve the Plan**: Confirm the UI-Role Based structure.
2. **Setup Directories**: Create `dialogs/`, `views/`, `forms/`, `cards/`, `tables/` inside `_components/`.
3. **Migrate Views & Tables**: Move `exam-management.tsx`, `exam-table`, `exam-empty-state.tsx`, and `exams-filter-bar.tsx` into `views/` and `tables/`.
4. **Migrate Dialogs**: Extract all dialogs (`exam-assign-dialog`, `exam-create-dialog`, `exam-edit-dialog`, `exam-preview-dialog`, and their highly-coupled internal components) into the `dialogs/` directory.
5. **Migrate Forms/Fields**: Consolidate form elements into `forms/`.
6. **Update Imports**: Systematically update barrel files (`index.ts`) and references across `features/exams`.

## To-Do List

- [x] **Phase 1: Directory Scaffolding**
    - [x] Create `views/`
    - [x] Create `dialogs/`
    - [x] Create `forms/`
    - [x] Create `tables/`
    - [x] Create `cards/`
- [x] **Phase 2: File Migration**
    - [x] Move `exam-management.tsx` to `views/exam-management-view.tsx`
    - [x] Move `exam-table/` contents to `tables/exam-table/`
    - [x] Move `exam-list/exam-card/` contents to `cards/exam-card/`
    - [x] Move `exam-config/dialogs/*` to `dialogs/`
    - [x] Move `exam-list/exam-card/_components/exam-preview-dialog` to `dialogs/exam-preview-dialog/`
    - [x] Move `exam-config/forms/` and `exam-config/_fields/` to `forms/`
- [x] **Phase 3: Refactor & Cleanup Imports**
    - [x] Fix all relative imports in the moved files.
    - [x] Update imports in `features/exams/config/`, `features/exams/monitoring/`, `features/exams/builder/`, etc.
    - [x] Create clean barrel exports (`index.ts`) in each new top-level folder.
- [x] **Phase 4: Final Validation**
    - [x] Run `pnpm lint` and `pnpm tsc` to verify no broken imports.
    - [x] Verify UI components render correctly.
