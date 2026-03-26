# To-Do: Exam Preview Dialog Improvement

## High-Level Goals

- [x] Improve Dialog responsiveness and sizing (50-60% web view).
- [x] Remove excessive mobile frame decorators.
- [x] Refactor component into a modular structure (Question Types, Logic Hook).
- [x] Enhance UI/UX for all question types.

## Tasks

### 1. Research & Planning

- [x] Analyze `exam-preview-dialog.tsx` structure.
- [x] Review `@.agent/rules` for Web Components and Project Structure.
- [x] Finalize 1-3-1 Option and get approval.

### 2. Standardize Types & Logic
- [x] Extract state logic into `use-exam-preview.ts` hook.
- [x] Define standardized props for question type components in `_types.ts`.

### 3. Modularize Components
- [ ] Create `_components/exam-preview-dialog/` directory.
- [ ] Extract `exam-info-step.tsx`.
- [ ] Extract `question-step.tsx`.
- [ ] Create `_components/exam-preview-dialog/question-types/` directory.
- [ ] Implement individual question type components:
    - [ ] `multiple-choice.tsx`
    - [ ] `multiple-response.tsx`
    - [ ] `true-false.tsx`
    - [ ] `identification.tsx`
    - [ ] `essay.tsx`
    - [ ] `fill-blank.tsx`
    - [ ] `matching.tsx`
    - [ ] `enumeration.tsx`

### 4. Layout & UI Improvements
- [x] Update `DialogContent` max-width and responsiveness.
- [x] Simplify `previewMode === "mobile"` rendering (remove phone frame).
- [x] Polishing UI for premium look (gradients, micro-animations).

### 5. Verification

- [/] Test across all question types.
- [/] Verify responsive behavior on different screen sizes.
- [/] Linting and code quality check.
