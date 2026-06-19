# Implementation Plan - Passage Fix

> **Task summary:** fix the passage image upload/rendering flow and replace dialog-based question editing in question bank and collection screens with builder-route editing.

## Solution Options

### Option 1: Minimal UI patch

- Patch the passage editor to make uploaded images and link insertion work again, then keep the existing dialog-based edit flow and only update the broken controls.
- Tradeoff: fastest to ship, but it leaves the current dialog complexity and route fragmentation in place.

### Option 2: Route-first builder migration

- Keep the passage editor fixes, then move question editing from dialogs to dedicated builder routes for question bank, collection, and import-preview edit flows.
- Tradeoff: more files and route work up front, but it aligns all edit paths with the existing exam builder pattern and reduces duplicate UI state.

### Option 3: Shared editor shell refactor

- Build a reusable question-editing shell that both the exam builder and question bank/collection flows consume, and refactor the passage editor controls into the same shared surface.
- Tradeoff: strongest long-term consolidation, but it is the largest change and risks widening the scope beyond the immediate bug fix.

## Recommended Path

**Best option: Option 2, Route-first builder migration.**

Why:

- It directly solves the reported problems without introducing a larger architecture change.
- It reuses the existing builder editor and keeps the implementation aligned across `sentinel-web` and `sentinel-core`.
- It is easier to reason about than the current dialog-based edit flow and lowers the chance of image or passage state getting lost between modal lifecycle changes.

Concrete next steps:

1. Fix passage image upload and link behavior in `packages/ui/src/components/passage-editor.tsx`.
2. Correct the passage image storage path and validate the upload service in `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.ts`.
3. Replace question edit dialogs with builder routes for question bank, collection, and import-preview edit flows in both apps.
4. Add targeted tests for the passage editor, upload service, and new route/navigation behavior.

---

## Pre-Planning Notes

- The passage image is already uploading to storage, but the editor UI is not reliably inserting or retaining the rendered image after save.
- Link insertion needs to work from the passage HTML toolbar, including when no text is selected.
- The question bank and collection edit flows currently open dialogs; the desired behavior is to navigate to a dedicated builder page instead.
- The upload bucket already exists, and the request indicates a `PASSAGE` folder inside the bucket.

---

## Scope

### In scope

- Fix passage image insertion, upload handling, and persistence in the shared passage editor.
- Remove the manual image URL / alt text inputs from the passage editor UI.
- Make passage link insertion work reliably in the rich text toolbar.
- Update the passage image service to use the expected storage folder naming.
- Redirect edit actions in question bank, collection, and import-preview flows to builder routes.
- Add builder-route pages for question bank and collection editing in both apps.

### Out of scope

- Database schema changes.
- New passage content types or editor libraries.
- Changes to exam runtime passage rendering beyond what is needed to support the upload fix.

---

## Impacted Files and Surfaces

- `packages/ui/src/components/passage-editor.tsx`
- `packages/ui/src/lib/html.ts` if sanitization or rendering helpers need adjustment
- `packages/services/src/api/passage-images.ts`
- `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.ts`
- `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.controller.ts`
- `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.dto.ts`
- `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.test.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/question-preview-sheet.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_hooks/use-question-bank-page/_hooks/use-question-bank-builder.ts`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/question-bank-page-content.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/[collectionId]/page.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/_components/views/edit-question-view.tsx`
- `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/page.tsx`
- Equivalent `app/sentinel-core/src/app/(protected)/question/...` surfaces
- New builder route files under `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/**/builder/`
- New builder route files under `app/sentinel-core/src/app/(protected)/question/bank/**/builder/`

**Migration required:** No — this is a UI and upload-flow fix, not a schema change.

---

## Phase 1: Restore Passage Image and Link Editing

**Goal:** Make the shared passage editor reliably insert links and uploaded images, then remove the manual image inputs that bypass upload.

- [x] Update `packages/ui/src/components/passage-editor.tsx` so `insertLink()` inserts linked text when no selection is active.
- [x] Update `packages/ui/src/components/passage-editor.tsx` so uploaded images use the returned public URL directly and do not require manual image URL or alt text fields.
- [x] Remove the `Image URL` and `Alt text` fields from the passage editor UI in `packages/ui/src/components/passage-editor.tsx`.
- [x] Keep the upload button as the only image path in `packages/ui/src/components/passage-editor.tsx`.
- [x] Update the upload helper in `packages/services/src/api/passage-images.ts` if the client contract needs to pass through any new metadata.
- [x] Update `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.ts` to store uploads under the `PASSAGE/` folder inside the selected bucket.
- [ ] Update `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.controller.ts` and `passage-images.dto.ts` only if the upload response or payload shape needs to change.
- [x] Write or adjust tests in `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.test.ts` for the new `PASSAGE/` path.
- [x] Add or update a UI-level test for `packages/ui/src/components/passage-editor.tsx` covering link insertion and upload insertion behavior.

**Migration required:** No — path and UI behavior only.

### Phase 1 Verification

- [ ] Confirm a local image upload returns a public URL and inserts an image node into the editor.
- [ ] Confirm the inserted image still exists after saving and reloading a question.
- [ ] Confirm the link toolbar inserts a clickable link even with an empty selection.

---

## Phase 2: Route-Based Question Editing

**Goal:** Replace dialog-based question editing with dedicated builder routes for question bank and collection editing in both apps.

- [x] Add a question-bank builder route under `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/[questionId]/builder/page.tsx`.
- [x] Add the equivalent route under `app/sentinel-core/src/app/(protected)/question/bank/[questionId]/builder/page.tsx`.
- [x] Add collection-scoped builder routes under `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/[collectionId]/builder/page.tsx`.
- [x] Add the equivalent route under `app/sentinel-core/src/app/(protected)/question/bank/collections/[collectionId]/builder/page.tsx`.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_hooks/use-question-bank-page/_hooks/use-question-bank-builder.ts` to navigate to the new builder routes instead of opening the edit dialog.
- [x] Update `app/sentinel-core/src/app/(protected)/question/bank/_hooks/use-question-bank-page/_hooks/use-question-bank-builder.ts` the same way.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/question-bank-page-content.tsx` so the table edit action routes to the builder page.
- [x] Update `app/sentinel-core/src/app/(protected)/question/bank/_components/views/question-bank-page-content.tsx` so the table edit action routes to the builder page.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/[collectionId]/page.tsx` so collection question edits navigate to the collection builder route.
- [x] Update `app/sentinel-core/src/app/(protected)/question/bank/collections/[collectionId]/page.tsx` the same way.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/import/preview/_components/views/edit-question-view.tsx` so generated questions can be opened in the builder route instead of an inline dialog.
- [x] Update `app/sentinel-core/src/app/(protected)/question/bank/import/preview/_components/views/edit-question-view.tsx` the same way.
- [x] Remove or deprecate the question-edit dialog usage from `question-preview-sheet.tsx` if the edit action now routes away.
- [ ] Keep preview, duplicate, and delete actions intact in `question-preview-sheet.tsx` and `questions-table.tsx`.

**Migration required:** No — route and navigation changes only.

### Phase 2 Verification

- [x] Clicking edit from question bank opens `/question/bank/[questionId]/builder` instead of a dialog.
- [x] Clicking edit from a collection opens `/question/bank/collections/[collectionId]/builder` instead of a dialog.
- [x] Editing a generated question from import preview opens the builder route and preserves the selected question data.
- [x] The old dialog entry points no longer appear in the edit flow.

---

## Phase 3: Builder Page Integration and Cleanup

**Goal:** Ensure the builder-route screens render the existing `QuestionBuilderForm` cleanly and remove any leftover dialog-specific assumptions.

- [x] Reuse `QuestionBuilderForm` in the new builder route pages without dialog wrappers.
- [x] Ensure builder pages load the current question by ID and pass `initialData` into `QuestionBuilderForm` in both apps.
- [x] Update the builder close/back behavior so it returns to the correct question bank or collection page.
- [x] Remove stale dialog state and unused dialog-local callbacks from the question bank builder hooks.
- [x] Update any route labels, breadcrumbs, or page headers so they reflect the builder route.
- [x] Add tests for the new builder route pages or route-level behavior in both apps.
- [ ] Update documentation notes in `docs/task/2026-06-18/fix-001-implementation-plan-passage-fix.md` only if the implementation choices change during execution.

**Migration required:** No.

### Phase 3 Verification

- [x] Opening a question from the bank or collection lands on the builder page with the correct question loaded.
- [x] Saving from the builder returns to the originating list view without losing context.
- [x] The layout still matches the existing exam builder interaction model.

---

## Tests

- [ ] `app/sentinel-api/src/modules/infrastructure/passage-images/passage-images.service.test.ts`
- [ ] `packages/ui/src/components/passage-editor.test.tsx` or the closest co-located test file for passage-editor behavior
- [x] Question bank hook/page tests for route navigation in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_hooks/use-question-bank-page/_hooks/`
- [x] Equivalent route/navigation tests in `app/sentinel-core/src/app/(protected)/question/bank/_hooks/use-question-bank-page/_hooks/`
- [x] Route or page tests for the new builder pages in both apps

---

## Risks and Rollback

- The bucket may be configured correctly while the public URL or folder naming is still mismatched, so the first validation should check the rendered HTML in the editor, not just the upload response.
- If route-based editing exposes missing data on the builder page, temporarily keep the old dialog implementation behind the edit action while the builder page loader is corrected.
- No database rollback is required because this plan does not change schema or persistence models.

---

## Done Criteria

- Passage images upload, render, and persist after save/reload.
- Link insertion works in the passage editor toolbar.
- Manual image URL and alt text inputs are removed from the editor UI.
- Edit actions from question bank, collection, and import preview route to dedicated builder pages.
- Question bank and core flows remain aligned across both apps.
- Each phase includes at least one concrete test task and a clear migration decision.
