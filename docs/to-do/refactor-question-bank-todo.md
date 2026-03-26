# Question Bank Refactoring To-Do

The goal of this refactor is to improve the modularity, scalability, and readability of the Question Bank collections and preview sheet.

## Progress Overview

- [ ] Phase 1: Modularize `CollectionsPage`
- [ ] Phase 2: Refactor `QuestionPreviewSheet`
- [ ] Phase 3: Final Polishing & Verification

## Tasks

### Phase 1: Collections Page

- [x] Define `Collection` interface in a shared types file.
- [x] Extract `CollectionCard` (Grid View) into `_components/collection-card.tsx`.
- [x] Create `CollectionListItem` (List View) in `_components/collection-list-item.tsx`.
- [x] Create `CollectionViewControls` for switching between Grid and List views.
- [x] Refactor `CollectionsPage` to use these modular components.

### Phase 2: Question Preview Sheet

- [x] Extract `MultipleChoicePreview` into `_components/preview/multiple-choice-preview.tsx`.
- [x] Extract `TrueFalsePreview` into `_components/preview/true-false-preview.tsx`.
- [x] Create a `QuestionPreviewContent` router component to handle different question types. (Integrated into Sheet)
- [x] Refactor `QuestionPreviewSheet` to use the content router.

### Phase 3: Verification

- [x] Test Grid/List view toggle in Collections.
- [x] Verify point display and metadata in Preview Sheet.
- [x] Ensure all actions (Edit, Duplicate, Delete) are correctly hooked up.
