# Builder + Question + Question-Type Frontend Integration

This document scopes the frontend connection for the existing backend `builder`, `question`, and `question-type` modules. The goal is to replace the remaining mock and local-only flows in the instructor builder and question bank surfaces while preserving the current package layering and route/feature structure.

## 1-3-1 Rule Analysis

### 1 Goal

- Connect the frontend to the real backend modules for:
    - `builder` workspace load/save/publish
    - `question` list/create/update/delete flows
    - `question-type` definition and validation flows

### 3 Viable Options

#### Option 1: Frontend-only swap with minimal API wrappers

- Add thin service calls for the three modules, then wire them directly into the existing builder page and question bank page with the least possible component movement.

Pros:

- Fastest visible integration.
- Lower initial file count.

Cons:

- Leaves current mock/persisted stores in place longer than necessary.
- Risks mixing server-backed state with local-only state.
- Makes later debugging harder because boundaries stay blurred.

#### Option 2: Phased integration by module boundary

- Add typed `packages/services` APIs first.
- Add `packages/hooks` query/mutation hooks second.
- Replace builder and question bank mock state usage phase by phase while preserving the current component tree and route structure.
- Use `question-type` definitions as the shared source for selectable types and default content.

Pros:

- Best fit for the repo rules around service and hook layering.
- Keeps each phase testable and easier to review.
- Lets us validate builder behavior separately from question bank CRUD.

Cons:

- Slightly slower than a wide wiring pass.
- Requires temporary mapping between current UI props and backend responses.

#### Option 3: Full assessment content integration in one sweep

- Connect builder, question, question-type, and question-bank collection/import flows together in one pass.

Pros:

- Largest visible feature jump.
- Avoids revisiting adjacent files multiple times.

Cons:

- Too wide for safe phase review.
- Mixes builder persistence, question CRUD, collection behavior, and import workflows in one milestone.
- Higher regression risk across multiple instructor surfaces.

### 1 Recommendation

**Option 2** is the best path.

Why:

- It matches the repo’s existing `packages/services` -> `packages/hooks` -> frontend flow.
- It respects your request to review the work by phase before implementation.
- It keeps the current UI structure intact while replacing mock data sources in controlled slices.

---

## Current Findings

- Backend routes already exist for:
    - `GET /builder/exams/:id`
    - `PUT /builder/exams/:id`
    - `POST /builder/exams/:id/publish`
    - `GET /questions`
    - `GET /questions/:id`
    - `POST /questions`
    - `PUT /questions/:id`
    - `DELETE /questions/:id`
    - `GET /question-types`
    - `GET /question-types/:type`
    - `POST /question-types/:type/validate`

- Frontend is still local/mock in the main integration points:
    - builder uses [`use-exam-store`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_stores/use-exam-store.ts)
      with `localStorage` and mock exams
    - question bank uses [`use-question-bank`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/questions/store/use-question-bank.ts)
      with persisted mock questions and collections
    - question type selection still relies on local static metadata in [`question-type-meta.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_constants/question-type-meta.ts)

---

## To-Do Workflow

### Phase 1: Data Access Contracts

- [x] Add `packages/services` API modules for `builder`, `questions`, and `question-types`.
- [x] Export the new APIs from [`packages/services/src/api/index.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/index.ts).
- [x] Add matching React Query hooks in `packages/hooks/src/query/`.
- [x] Export the new hooks from [`packages/hooks/src/query/index.ts`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/index.ts).
- [x] Keep all frontend data access inside hooks and centralized services only.

### Phase 3: Question-Type Integration

- [x] Fetch real question type definitions from `GET /question-types`.
- [x] Use backend `label`, `description`, and `defaultContent` as the source of truth for the selector and create flow.
- [x] Add optional content validation via `POST /question-types/:type/validate` only on `blur`, a debounced idle window, or pre-submit validation.
- [x] Do not call `POST /question-types/:type/validate` on every text input change.
- [x] Keep icon metadata local only if the backend response does not carry presentation data.

### Phase 4: Question Module Integration

- [x] Replace question bank page data from persisted mock store with `GET /questions`.
- [x] Wire create/import flows to `POST /questions`.
- [x] Wire edit/update actions to `PUT /questions/:id`.
- [x] Wire delete actions to `DELETE /questions/:id`.
- [x] Add the required frontend mapping from backend `QuestionRecord` to current table/preview UI props.
- [x] Keep question-bank collections out of this phase unless the UI cannot function without them.

### Phase 2: Builder Workspace Integration

- [x] Replace builder page hydration from local/mock state with `GET /builder/exams/:id`.
- [x] Keep [`use-exam-store`](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_stores/use-exam-store.ts) as a UI-only store for transient draft interactions and unsaved drag/drop or form edits.
- [x] Hydrate `use-exam-store` from the builder workspace query result instead of mock/local exam sources.
- [x] Replace local save flow with `PUT /builder/exams/:id` using the store state as the mutation payload source.
- [x] Replace local publish flow with `POST /builder/exams/:id/publish`.
- [x] Keep the current builder screen/component structure intact and only refactor the state boundary required for real API wiring.

### Phase 5: Verification and Cleanup

- [x] Remove or narrow mock-only dependencies that are no longer needed for builder/question flows.
- [x] Run targeted typecheck/lint for the touched workspaces.
- [x] Verify builder load, save, publish, question list, question create, question update, and question delete flows.
- [x] Capture collection/import-preview follow-ups as a separate later phase if still mock-based.

### Deferred Follow-Ups

- [x] Replace mock-based question-bank collection management with real backend-backed collection workflows in a separate phase.
- [x] Replace the mock import parsing/source pipeline with real file parsing before import preview.
- [ ] Re-enable the `Generative AI` import tab only after a real backend generation workflow exists.

---

## Phase Guardrails

- Do not start implementation until this plan is approved.
- Keep the existing route and feature structure unless a small structural adjustment is necessary to align with repo rules.
- Do not mix direct component fetches with centralized service/hook access.
- Keep `use-exam-store` as local UI state for builder editing, not as the long-term source of truth for persisted server state.
- Do not expand this pass into question-bank collection management unless you explicitly approve that scope.
- Treat builder persistence and question bank CRUD as separate reviewable phases even if they share some support code.

## Proposed Execution Order

1. Phase 1: Data Access Contracts
2. Phase 3: Question-Type Integration
3. Phase 4: Question Module Integration
4. Phase 2: Builder Workspace Integration
5. Phase 5: Verification and Cleanup
