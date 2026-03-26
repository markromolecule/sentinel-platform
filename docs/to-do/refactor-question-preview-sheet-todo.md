# Refactor QuestionPreviewSheet To-Do Plan

## Phase 1: Preparation & Planning

- [x] Research existing question type structures in `@sentinel/shared/types`
- [x] Define robust TypeScript interfaces for MC and TF content to eliminate `any` usage
- [x] Audit hardcoded styles and identify theme-compliant alternatives (Tailwind classes)

## Phase 2: Decomposition (Modularity)

- [ ] Extract `QuestionHeader` sub-component
- [ ] Extract `QuestionConfig` sub-component (the `renderContent` logic)
- [ ] Extract `QuestionMetadata` sub-component
- [ ] Extract `QuestionActions` sub-component (the bottom buttons)

## Phase 3: Enhancement (Readability & Scalability)

- [ ] Implement a `ContentRenderer` component that handles dispatching to specific previews
- [ ] Standardize the data display for Difficulty, Points, and Created date
- [ ] Replace hardcoded custom hex colors with theme variables or standard Tailwind colors

## Phase 4: Refinement

- [ ] Clean up imports and remove unused dependencies
- [ ] Ensure all components follow the project's styling rules (Vanilla CSS / Tailwind as requested)

## Phase 5: Verification

- [ ] Verify UI consistency across different question types
- [ ] Ensure no regressions in functionality (Edit, Duplicate, Delete buttons)
