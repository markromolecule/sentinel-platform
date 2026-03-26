# Phase 2 Refactor QuestionPreviewSheet To-Do Plan

## Phase 1: Preparation & Planning

- [x] Audit remaining components in the question bank for similar refactoring needs
- [x] Research registry-based rendering patterns for future-proofing question types
- [x] Define the file structure for sub-components

## Phase 2: File Decomposition (Modularity)

- [x] Create `_components/question-preview/` directory
- [x] Move `QuestionHeader`, `QuestionMetadataSection`, `QuestionActions` to separate files
- [x] Implement a `ContentRenderer` component that uses a registry or clean mapping for different previews
- [x] Move `QuestionContentRenderer` to `_components/question-preview/content-renderer.tsx`

## Phase 3: Logic Extraction (Readability & Scalability)

- [x] Create a custom `useQuestionPreview` hook to handle:
  - Time formatting logic (e.g., "formatDistanceToNow")
  - Difficulty mapping and fallback logic
  - Content preparation for the renderer
- [x] Update `QuestionPreviewSheet` to use the new hook

## Phase 4: Refinement

- [x] Ensure all sub-components follow the same styling and naming conventions
- [x] Clean up imports in the main `question-preview-sheet.tsx` file
- [x] Verify that all components are exported and typed correctly

## Phase 5: Verification

- [x] Test the sheet with real data when possible
- [x] Ensure no regressions in sheet state management (open/close behavior)
