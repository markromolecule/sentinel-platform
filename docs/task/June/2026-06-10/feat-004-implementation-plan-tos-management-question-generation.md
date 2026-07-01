# feat-004: TOS Management & Question Generation

## Summary

Enhance the Table of Specifications (TOS) configuration and matrix display by:

1. Enabling instructors to select specific Bloom's Taxonomy levels during AI question generation, strictly aligning generated output with those categories, and optimizing generation latency.
2. Redesigning the TOS Matrix page layout to remove the taxonomy distribution chart, position stats horizontally at the top, and provide a dedicated, accessible view for Retired questions with restoration capabilities.

---

## Pre-Planning Checklist

- [x] Task input summarized in one sentence
- [x] Relevant source files scanned
- [x] All files, services, and DB tables identified
- [x] Prisma migration decision made

> **Task (one sentence):** Enable Bloom's Taxonomy multi-selection in AI question generation with strict category prompting and optimized parallel page resolution, and redesign the TOS page to show stats above the matrix and link to a new retired question management view.

---

## Option Analysis (1-3-1 Rule)

### Option A — Filtered Toggle on the Question Bank Page

Keep all questions in the main Question Bank list and filter them by adding a status facet dropdown. Navigating to retired questions would just trigger a search filter on the bank list.

- **Tradeoff:** Simplest to implement, but does not provide the requested "dedicated view" clearly separated from active bank questions, leading to a cluttered user experience.

### Option B — Dedicated Retired Questions page `/question/bank/tos/retired`

Create a separate page route under the TOS matrix for managing retired questions. Include a table showing only retired questions with an explicit "Restore" action to reactivate them.

- **Tradeoff:** Requires creating a new page route and custom action column logic, but delivers a clean, high-premium dashboard that satisfies the accessibility and separate-view requirement perfectly.

### Option C — Tabbed View inside the TOS Matrix Page

Add tabs to the TOS Matrix Page: "TOS Matrix" and "Retired Questions". Clicking "Retired Questions" replaces the matrix with a list of retired questions.

- **Tradeoff:** Keeps all TOS-related elements in a single page shell, but increases state complexity and prevents clean bookmarking/direct navigation to the retired list.

## Best Option

**Option B** is chosen as the best fit.

**Why:** It provides a clean, highly accessible, dedicated view for Retired questions without cluttering either the active Question Bank or the TOS Matrix page. It also allows adding a dedicated action column to restore questions, giving instructors a robust dashboard experience.

---

## Assumptions

1. The Question Bank table should by default only display active questions (`status = 'ACTIVE'`) when no status filter is provided to avoid showing retired questions in the main active list.
2. Restoring a retired question updates its status back to `ACTIVE` and invalidates the active and retired queries.
3. The selected Bloom's Taxonomy levels during PDF import default to all levels if none are deselected, ensuring backwards compatibility and ease of use.

---

## Proposed Changes

### Phase 1: Shared Schemas and Services

**Goal:** Extend database/API schemas and the TypeScript services layer to support status filtering and Bloom's Taxonomy configurations.

- [ ] Modify [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts) to ensure all Bloom's Taxonomy level constants and schemas are cleanly exported.
- [ ] Modify [gemini-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/gemini/gemini-schema.ts) to add `bloomLevels: z.array(bloomCognitiveLevelSchema).optional()` to `generateQuestionPreviewConfigSchema`.
- [ ] Modify [question-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-schema.ts) to add `status: questionBankStatusSchema.optional()` to `getQuestionsQuerySchema` and `updateQuestionBodySchema`, and include `status: questionBankStatusSchema` in `questionRecordSchema`.
- [ ] Modify [questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/questions.ts) to accept `status?: QuestionBankStatus` in `GetQuestionsParams` and `UpdateQuestionPayload`, and add `status` to `QuestionRecord`. Ensure `buildQueryString` appends `status` when provided.
- [ ] Write unit tests for schema changes in `packages/shared/src/schema/exams/question-schema.test.ts` (or equivalent) to verify schema validations.

**Migration required:** No (The `status` column already exists in the `question_bank_questions` database table).

---

### Phase 2: Backend API and Ingestion Pipeline

**Goal:** Update backend endpoints, query handlers, and prompt builders to filter by status, process per-category taxonomy options, and optimize pipeline latency.

- [ ] Modify [get-questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-questions.ts) to select `qbq.status` and apply a filter: if `filters.status` is provided, filter by it; otherwise, default to `'ACTIVE'`.
- [ ] Modify [get-question-by-id.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-question-by-id.ts) to select `qbq.status`.
- [ ] Modify [map-question-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/services/map-question-response.ts) to map `record.status` to `status` in the mapped response payload.
- [ ] Modify [question.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/question.service.ts) to update and pass `status: body.status ?? current.status` in `updateQuestion`.
- [ ] Modify [config-parser.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/multipart-parser/config-parser.ts) to parse `bloomLevels` from multipart request payloads.
- [ ] Modify [prompt-builder.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/prompt-builder.service.ts):
    - In `buildPrompt`, if `config.bloomLevels` is provided and non-empty, dynamically append cognitive requirements and verbs (Recall, Solve, Analyze, etc.) for only those levels.
    - In `buildResponseJsonSchema`, constrain the `cognitive_level` enum of the JSON schema to the selected `bloomLevels` if provided.
- [ ] Modify [orchestrator.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts) to run `resolveGeminiNativeSourcePageCounts` concurrently with batch generation promises using `Promise.all` instead of waiting in sequence, reducing overall generation latency.
- [ ] Write backend unit tests in [question-generator.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/tests/gemini/question-generator.test.ts) and `app/sentinel-api/src/tests/question/get-questions.test.ts` to assert that:
    - Allowed cognitive levels are strictly populated in the JSON schema.
    - Question generation latency is reduced through concurrency.
    - Status filters default to `'ACTIVE'` and correctly retrieve `'RETIRED'` questions.

**Migration required:** No.

---

### Phase 3: Frontend AI Import Config

**Goal:** Implement the multi-select UI for Bloom's Taxonomy in the configuration wizard step of question generation.

- [ ] Create [use-bloom-selection.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-bloom-selection.ts>) to manage checked states for the 6 Bloom's levels (default all to true).
- [ ] Modify [use-import-handler.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler.ts>) to wire the Bloom's levels state and include `bloomLevels` in the mutation payload.
- [ ] Modify [use-generate-questions-mutation.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts>) to include `bloomLevels` in the configuration FormData payload.
- [ ] Modify [configure-step.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step.tsx>) to accept Bloom selection handlers and render the Bloom's taxonomy section.
- [ ] Create [bloom-category-selector.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step/bloom-category-selector.tsx>) using rich UI card grids with checkmarks, level names, descriptions, and subtle micro-animations for active states.
- [ ] Write tests for the configure step in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step.test.tsx` to verify Bloom categories render and can be toggled.

**Migration required:** No.

---

### Phase 4: Frontend Layout Redesign & Dedicated Retired Page

**Goal:** Reposition TOS stats cards, remove the distribution component, make the Retired card clickable, and build a dedicated Retired questions management page.

- [ ] Modify [tos-matrix-page-content.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/_components/tos-matrix-page-content.tsx>):
    - Remove `TosLevelDistribution`.
    - Position `TosStatsCards` horizontally directly above `TosMatrixTable`.
    - Add a "View Retired Questions" button in the header navigating to `/question/bank/tos/retired`.
- [ ] Modify [tos-stats-cards.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/_components/tos-stats-cards.tsx>):
    - Lay out cards in a horizontal 4-column grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
    - Make the "Retired" card clickable using Next.js `Link` pointing to `/question/bank/tos/retired`.
- [ ] Modify [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/tables/columns.tsx>):
    - Accept `onRestore?: (question: QuestionTableItem) => void` in columns config.
    - If a question's status is `'RETIRED'`, display a "Restore" action in the row dropdown menu instead of "Edit".
- [ ] Create [retired/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/retired/page.tsx>):
    - Fetch retired questions using `useQuestionsQuery({ status: 'RETIRED' })`.
    - Render a premium page shell, back button, header, and a table using `QuestionsTable` with custom restore/delete callbacks using `useUpdateQuestionMutation` and `useDeleteQuestionMutation`.
- [ ] Write tests in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/retired/page.test.tsx` to assert that:
    - The page fetches and lists retired questions.
    - Clicking "Restore" triggers the mutation and updates query state.

**Migration required:** No.

---

## Files Touched Summary

| File                                                                                                                                                      | Action | Phase |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- |
| `packages/shared/src/schema/exams/assessment-schema.ts`                                                                                                   | MODIFY | 1     |
| `packages/shared/src/schema/gemini/gemini-schema.ts`                                                                                                      | MODIFY | 1     |
| `packages/shared/src/schema/exams/question-schema.ts`                                                                                                     | MODIFY | 1     |
| `packages/services/src/api/questions.ts`                                                                                                                  | MODIFY | 1     |
| `app/sentinel-api/src/modules/content/question/data/get-questions.ts`                                                                                     | MODIFY | 2     |
| `app/sentinel-api/src/modules/content/question/data/get-question-by-id.ts`                                                                                | MODIFY | 2     |
| `app/sentinel-api/src/modules/content/question/services/map-question-response.ts`                                                                         | MODIFY | 2     |
| `app/sentinel-api/src/modules/content/question/question.service.ts`                                                                                       | MODIFY | 2     |
| `app/sentinel-api/src/lib/gemini/services/multipart-parser/config-parser.ts`                                                                              | MODIFY | 2     |
| `app/sentinel-api/src/lib/gemini/services/prompt-builder/prompt-builder.service.ts`                                                                       | MODIFY | 2     |
| `app/sentinel-api/src/lib/gemini/services/question-generator/orchestrator.ts`                                                                             | MODIFY | 2     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-bloom-selection.ts`                          | NEW    | 3     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler.ts`                           | MODIFY | 3     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/query/use-generate-questions-mutation.ts`        | MODIFY | 3     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step.tsx`                         | MODIFY | 3     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/configure-step/bloom-category-selector.tsx` | NEW    | 3     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/_components/tos-matrix-page-content.tsx`                                             | MODIFY | 4     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/_components/tos-stats-cards.tsx`                                                     | MODIFY | 4     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/tables/columns.tsx`                                                          | MODIFY | 4     |
| `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/tos/retired/page.tsx`                                                                    | NEW    | 4     |

---

## Verification Plan

### Automated Tests

Run Vitest across api and web workspaces:

```bash
# Test backend services, controllers and prompt builder
pnpm --dir app/sentinel-api test

# Test frontend page, modals, and selectors
pnpm --dir app/sentinel-web test
```

### Manual Verification

1. Open the Question Bank page and click **Import Questions**. Upload a PDF.
2. In the configuration step, verify that the **Bloom's Taxonomy Cognitive Levels** selector is visible. Deselect some levels (e.g., "Creating", "Evaluating").
3. Click **Generate Questions** and confirm the generated questions strictly align with the remaining cognitive levels. Verify page extraction latency is reduced.
4. Navigate to the **TOS Matrix** page. Verify:
    - The "Bloom's Taxonomy Distribution" chart is removed.
    - The stats cards are positioned horizontally at the top.
    - The "Retired" card is styled nicely and is clickable.
5. Click either the "Retired" card or the "View Retired Questions" header button. Confirm you are navigated to `/question/bank/tos/retired`.
6. Verify the retired questions list is displayed. Click the action menu on a retired question and select **Restore**. Confirm it is successfully reactivated and disappears from the retired list.
