# To-Do: Exam Assign Dialog Refactor

Refactor the `exam-assign-dialog.tsx` component to improve modularity, readability, and scalability while adhering to `@sentinel` project rules.

## Phase 1: Preparation & Planning

- [x] Analyze current implementation and dependencies.
- [x] Define refactoring strategy (1-3-1 Rule).
- [x] Create implementation plan.

## Phase 2: Logic Extraction (Hooks)

- [x] Create `use-exam-assignment.ts` hook.
  - [x] Move student filtering logic.
  - [x] Move selection state management (`selectedStudents`, `sectionSelect`).
  - [x] Move UI state management (`expandedSections`, `searchQuery`, `filters`).
- [ ] Extract data fetching logic into a query hook (optional, depending on project mock strategy).

## Phase 3: Component Decomposition

- [x] Create sub-components in `_components/exam-config/exam-assign/`:
  - [x] `exam-assign-search.tsx`: Search input and filter selects.
  - [x] `exam-assign-header.tsx`: Section header with "Select All" and toggle.
  - [x] `exam-assign-student.tsx`: Individual student list items.
  - [x] `exam-assign-footer.tsx`: Summary and action buttons.

## Phase 4: Integration & Cleanup

- [x] Refactor `ExamAssignDialog` to use the new hook and sub-components.
- [x] Ensure consistent styling and `sonner` toast integration.
- [x] Clean up unused imports and mock data references if necessary.
- [x] Remove hardcoded colors (e.g., `bg-[#323d8f]`) and replace with design system variables.

## Phase 5: Verification

- [x] Test filtering functionality.
- [x] Test selection/deselection of individual students.
- [x] Test "Select All" section functionality.
- [x] Verify UI responsiveness and accessibility.
