# Question Import Flow Refactor TO-DO

This plan outlines the refactoring of the question import process to remove the Generative AI tab and implement a 3-step wizard flow in the Upload tab.

## Phase 1: Research & Cleanup
- [ ] Research all occurrences of `ImportModal` in `question/bank` and `question/bank/collections`.
- [ ] Remove `ai-tab.tsx` from `_components/import-modal/_components`.
- [ ] Remove references to `AITab` in `import-modal.tsx`.
- [ ] Clean up any unused types or hooks related to the Generative AI feature.

## Phase 2: Upload Tab Refactoring (Step 1: Upload)
- [ ] Update `upload-tab.tsx` to handle file selection and "Analyze" action.
- [ ] Implement a "mock" analysis state that triggers the transition to the next step.
- [ ] Ensure the "Upload" step UI is premium and visually appealing.

## Phase 3: Configuration Dialog (Step 2: Configure)
- [ ] Create `configure-step.tsx` in `_components/import-modal/_components`.
- [ ] Design a form for:
    - Number of questions needed.
    - Question types (Multiple Choice, True/False, etc.).
- [ ] Add navigation buttons ("Back" to Upload, "Generate" to Preview).

## Phase 4: Preview Page/Step (Step 3: Preview)
- [ ] Create `preview-step.tsx` in `_components/import-modal/_components`.
- [ ] Display a list of "generated" (mocked) questions.
- [ ] Ensure the layout matches the existing question bank styling.
- [ ] Add "Finalize/Import" action.

## Phase 5: Integration & Verification
- [ ] Integrate the new step-based logic into `import-modal.tsx`.
- [ ] Verify the flow in `question-bank`.
- [ ] Verify the flow in `question-collection` (ensuring it works for both).
- [ ] Final UI/UX polish.
