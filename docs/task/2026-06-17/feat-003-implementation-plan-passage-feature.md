# Implementation Plan - Passage Feature Enhancement

This document outlines the plan to enhance the question passage feature in Sentinel, allowing instructors to provide rich content (images, code snippets, and formatted descriptions) instead of the current limited "reference" field.

## User Review Required

> [!IMPORTANT]
> This plan assumes that the new `passage_content` field will be added directly to the `exam_questions` and `question_bank_questions` tables. It will store HTML or Markdown content.

- [ ] Confirm if we should support both HTML and Markdown, or stick to one (Recommended: HTML for easier rendering with rich text editors).
- [ ] Confirm if the existing `source_evidence` field should be automatically migrated to the new `passage_content` field.

---

## Proposed Options (1-3-1 Rule)

### Option 1: Expand `content` JSON
- **Approach**: Add a `passage` field inside the existing `content` JSONB column.
- **Tradeoff**: Quickest to implement with no schema change, but harder to query/index and mixes content types.

### Option 2: Dedicated DB Columns (Recommended)
- **Approach**: Add `passage_content` (TEXT/JSONB) and `passage_type` (String) columns directly to `exam_questions` and `question_bank_questions`.
- **Tradeoff**: Robust, clean separation of concerns, and better indexing; requires a DB migration.

### Option 3: Separate `passages` Table
- **Approach**: Create a new `passages` table and link questions via foreign keys.
- **Tradeoff**: Most scalable for re-using passages, but highest complexity in implementation and data management.

---

## Best Option: Option 2
**Why**: It provides the best balance of structure and simplicity. Since passages are typically unique to a question or imported with it, a dedicated column in the question tables keeps the data model flat and easy to work with while clearly distinguishing the passage from the question-specific logic (like options or correct answers).

---

## Implementation Phases

### Phase 1: Database & Shared Schema

**Goal:** Update the data model to support rich passage content.

- [ ] [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)
    - Add `passage_content String?` and `passage_type String? @default("plain")` to `exam_questions` model.
    - Add `passage_content String?` and `passage_type String? @default("plain")` to `question_bank_questions` model.
- [ ] [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)
    - Update `questionInputSchema` to include `passageContent` and `passageType`.
- [ ] Generate Prisma migration and client.
    **Migration required:** Yes — adding columns to `exam_questions` and `question_bank_questions`.

### Phase 2: Backend API Updates

**Goal:** Enable the API to handle the new passage fields.

- [ ] Update question DTOs in `app/sentinel-api` to include passage fields.
- [ ] Update question services in `app/sentinel-api` to save and retrieve `passage_content` and `passage_type`.
- [ ] Add Vitest tests in `app/sentinel-api/src/modules/examination/assessment/tests/passage.test.ts` to verify passage storage and retrieval.

### Phase 3: Frontend Builder Enhancement

**Goal:** Provide a rich UI for instructors to create and edit passages.

- [ ] Integrate a rich text editor (e.g., Tiptap) in `app/sentinel-web` and `app/sentinel-core` question builder forms.
- [ ] Update `QuestionBuilderPayload` and associated forms to support the new passage fields.
- [ ] Implement image upload handling within the rich text editor (linking to an existing or new upload endpoint).
- [ ] Implement a code snippet block with language selection in the editor.

### Phase 4: Frontend Exam Runtime Update

**Goal:** Render the rich passage content to students during attempts.

- [ ] [exam-attempt-runtime-passage.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/engine/attempt/runtime/exam-attempt-runtime-passage.tsx)
    - Update to render `passage_content` using a safe HTML renderer (e.g., `dangerouslySetInnerHTML` with sanitization).
    - Add syntax highlighting support for code snippets (e.g., using `prismjs` or `shiki`).
- [ ] [utils.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/_components/engine/utils.ts)
    - Update `getExamContextDetails` to prioritize `passage_content` over `questionBody` (the old `sourceEvidence`).

### Phase 5: Verification & Cleanup

**Goal:** Ensure everything works and clean up deprecated patterns.

- [ ] Run full test suite: `pnpm test`.
- [ ] Verify rich content rendering in both `sentinel-web` and `sentinel-core`.
- [ ] (Optional) Create a script to migrate existing `source_evidence` to `passage_content` for older questions.

---

## Done Criteria

- [ ] `passage_content` and `passage_type` exist in DB and shared schemas.
- [ ] Instructors can use a rich text editor to add images and code to passages.
- [ ] Students see formatted passages with syntax-highlighted code during exams.
- [ ] At least one Vitest test covers the new functionality in the backend.
- [ ] No regressions in existing question rendering.
