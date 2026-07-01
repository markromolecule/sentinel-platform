# Implementation Plan - Reuse Exam Builder on Import Preview Builder

## Task Summary

Refactor the AI question import preview builder page (`/question/bank/import/preview/[editingIndex]/builder`) to directly use the standard `QuestionBuilderForm` in `builderMode` from the exam builder features, reducing layout redundancy and restoring missing Action buttons.

## Pre-Planning

- [x] Read and summarize the task input in one sentence: Update the import preview builder route to directly render the split-screen `QuestionBuilderForm` in builder mode, removing the redundant `EditQuestionView` wrapper.
- [x] Scan relevant source files to understand existing patterns: Checked `page.tsx`, `EditQuestionView.tsx`, `QuestionBuilderForm.tsx`, and the builder route tests.
- [x] Identify all files, services, and DB tables the task will touch: Touches frontend route and view files inside `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/`. No DB tables or services are altered.
- [x] Determine if a Prisma migration is needed: No migration is needed as this is a frontend layout and routing refinement.

## Codebase Findings

- The import preview builder route `/question/bank/import/preview/[editingIndex]/builder/page.tsx` currently wraps the `QuestionBuilderForm` component in a custom `EditQuestionView` wrapper with `builderMode={false}`.
- Because `builderMode` is false, the form fails to render its action buttons (Cancel, Save Changes), making it impossible to save the edits.
- The custom wrapper also introduces redundant elements (a duplicate passage text box) that are already managed natively inside `QuestionBuilderForm`'s split screen.
- In both the Exam Builder workspace and the main Question Bank builder route, `QuestionBuilderForm` is rendered directly with `builderMode={true}`.

## Options (1-3-1 Rule)

### Option 1: Direct Component Reuse (Recommended)

- [x] Replace `EditQuestionView` with `QuestionBuilderForm` directly in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/[editingIndex]/builder/page.tsx`, set `builderMode={true}`, and fetch `questionTypeDefinition` using `useQuestionTypesQuery`.
- [x] Delete `edit-question-view.tsx` and its conditional branch in the parent `/question/bank/import/preview/page.tsx`.
- [x] Trade-off: Best code reuse, removes dead code/markup, resolves layout redundancy completely, and ensures a consistent UI across all builder interfaces.

### Option 2: Patch EditQuestionView Wrapper

- [ ] Keep the custom `EditQuestionView` wrapping layout but modify it to pass `builderMode={true}` to `QuestionBuilderForm` and adjust CSS/markup to align with the split-screen visual structure.
- [ ] Trade-off: Keeps a custom wrapper component that serves no functional purpose, increasing maintenance overhead and code redundancy.

### Option 3: Revert to Local Modal Builder

- [ ] Revert the page routing change and edit questions inside a local modal on the list page.
- [ ] Trade-off: Diverges from the route-based builder pattern used in the rest of the application and prevents a clean full-screen editing experience.

## Best Option

- [x] Choose **Option 1: Direct Component Reuse**.
- [x] Why: It aligns the import preview builder route with the standard patterns used in the exam builder and question bank builder, deletes redundant view code, and resolves the issue without introducing new layout wrappers.

## Impacted Files

- [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/[editingIndex]/builder/page.tsx>)
- [MODIFY] [page.test.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/[editingIndex]/builder/page.test.tsx>)
- [DELETE] [edit-question-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/_components/views/edit-question-view.tsx>)
- [MODIFY] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/page.tsx>)

## Implementation Phases

### Phase 1: Implement Direct Builder Reuse

**Goal:** Modify the builder page route to directly render the split-screen `QuestionBuilderForm` in `builderMode` and fetch matching `questionTypeDefinition`.

- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/[editingIndex]/builder/page.tsx` to:
    - Import `useQuestionTypesQuery` from `@sentinel/hooks`.
    - Fetch question types and resolve `questionTypeDefinition`.
    - Render `<QuestionBuilderForm>` directly inside a `div` wrapper with `builderMode={true}`.
    - Update `handleUpdateQuestion` to parse all modified fields (such as `tags`, `passageContent`, and `passageType`) and save them.
      **Migration required:** No

### Phase 2: Cleanup Redundant Components

**Goal:** Delete the obsolete `EditQuestionView` component and clean up references to it.

- [ ] Delete `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/_components/views/edit-question-view.tsx`.
- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/page.tsx` to remove the conditional `EditQuestionView` import and render branch since the route is always used for editing.
      **Migration required:** No

### Phase 3: Update and Fix Route Tests

**Goal:** Update tests in `page.test.tsx` to mock `QuestionBuilderForm` from `@/features/exams` instead of the deleted `EditQuestionView`.

- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/[editingIndex]/builder/page.test.tsx` to mock `QuestionBuilderForm` and assert correct callback triggers on back/save.
- [ ] Run vitest to verify all tests in the builder route pass.
      **Migration required:** No

## Done Criteria

- [ ] The builder page route `/question/bank/import/preview/[editingIndex]/builder` renders `QuestionBuilderForm` in `builderMode` directly.
- [ ] Redundant passage box and outer header elements are removed.
- [ ] "Cancel" and "Save Changes" buttons appear and save edited changes to the session store.
- [ ] Obsolete `EditQuestionView` component is deleted.
- [ ] All route tests pass successfully.

## Reference Docs

- [System Overview](../../../docs/architecture/system-overview.md)
- [Agent Rules Overview](../../../docs/agents/rules-overview.md)
- [Agent Workflows Overview](../../../docs/agents/workflows-overview.md)
