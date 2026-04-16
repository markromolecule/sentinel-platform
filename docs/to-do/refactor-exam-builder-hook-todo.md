# Refactor `useExamBuilder` Hook TODO

## 📋 Overview

Refactor the monolithic `useExamBuilder` hook into modular, domain-specific sub-hooks to improve maintainability and scalability.

## 🛠 Tasks

### 1. Research & Interface Definition

- [x] Analyze current `useExamBuilder` for dependency mapping.
- [ ] Define shared Types/Interfaces for sub-hooks if not already in `_types.ts`.

### 2. Implementation - Sub-hooks

- [ ] **`use-builder-ui-state`**:
    - Manage `isTypeSelectorOpen`, `activeQuestionType`, `editingQuestion`.
    - Provide UI-specific handlers (`handleSelectQuestionType`, `setIsTypeSelectorOpen`).
- [ ] **`use-builder-workspace-actions`**:
    - Handle `Save`, `Publish`, `UpdateTitle`.
    - Manage `isLoading`, `isSaving`, etc. state from mutations.
    - Handle hydration logic (`useEffect`).
- [ ] **`use-question-management`**:
    - Handle all Question CRUD.
    - Integration with `validateQuestionTypeContentMutation`.
    - Duplicate & Import logic.
    - "Add to Bank" logic.
- [ ] **`use-section-management`**:
    - Handle Section CRUD.
    - Collapse logic.
    - Reordering logic (Sections and Questions within sections).

### 3. Integration & Composition

- [ ] Refactor `index.ts` to compose the new sub-hooks.
- [ ] Ensure all return properties match `UseExamBuilderResult`.
- [ ] Clean up unused imports and organize dependencies.

### 4. Quality Assurance

- [ ] Manual verification of full exam building flow.
- [ ] Test edge cases (deleting last section, duplicating complex questions).
- [ ] Ensure `toast` messages and side effects (router navigation) work correctly.

## 📌 Progress Tracking

- [ ] Phase 1: Sub-hook extraction
- [ ] Phase 2: Integration
- [ ] Phase 3: Testing & Cleanup
