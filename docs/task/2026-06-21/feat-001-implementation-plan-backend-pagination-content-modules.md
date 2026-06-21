# feat-001: Backend Pagination for Content Modules

## Summary

Add server-side offset pagination to the `question-bank/collections` and `question-collection/collections` list endpoints (modelled on the already-paginated `questions` endpoint), and update the corresponding shared schemas, frontend service functions, and React Query hooks so the web client can consume paginated responses.

---

## Options Analysis (1-3-1 Rule)

### Option A — Simple Offset Pagination (same pattern as `questions`)
Extend both collection query schemas with `page`/`pageSize` fields, add a `collectionPageSchema`, implement count + data queries in the data layer, and propagate the page envelope up through service → controller → DTO. Frontend updates mirror the existing `questions` pattern.

**Tradeoff:** Fast to implement and fully consistent with the existing codebase pattern; no cursor support so deep-page performance degrades at scale.

### Option B — Cursor-based Pagination
Replace `page`/`pageSize` with `cursor`/`limit` params using an `updated_at` + `id` compound cursor, returning `nextCursor` instead of `totalPages`.

**Tradeoff:** Scales better for large tables but is a breaking API change and requires more complex frontend integration than currently exists.

### Option C — Deferred-count Pagination (two-query with parallel execution)
Run count and data queries in parallel (`Promise.all`) to reduce latency, using the same page/pageSize interface as Option A.

**Tradeoff:** Slightly better latency for large datasets, but adds marginal complexity; more valuable once row counts are in the millions.

### Best Option → **Option A**

Rationale: The `questions` data layer (`get-questions.ts`) already implements sequential count + data queries with the exact page/totalPages/hasMore envelope. Adopting the same pattern for `question-bank` and `question-collection` keeps all three modules consistent, minimises review surface, and requires only additive schema changes. The collections tables are not expected to reach cursor-pagination scale in the near term.

---

## Proposed Changes

---

### Phase 1: Shared Schema Updates (`packages/shared`)

**Goal:** Add `page`/`pageSize` query params and a page-envelope schema for both collection modules.

#### [MODIFY] [question-bank-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-bank-schema.ts)

- Add `page: z.coerce.number().int().min(1).default(1)` and `pageSize: z.coerce.number().int().min(1).max(100).default(20)` to `getQuestionBankCollectionsQuerySchema`.
- Export `questionBankCollectionPageSchema` (mirrors `questionPageSchema`) containing `items`, `page`, `pageSize`, `total`, `totalPages`, `hasMore`.

#### [MODIFY] [question-collection-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/question-collection-schema.ts)

- Add `page`/`pageSize` fields to `getQuestionCollectionsQuerySchema`.
- Export `questionCollectionPageSchema` with the same envelope shape.

**Tasks:**

- [x] Add `page` and `pageSize` coerce fields to `getQuestionBankCollectionsQuerySchema` in `packages/shared/src/schema/exams/question-bank-schema.ts`
- [x] Export `questionBankCollectionPageSchema` from `packages/shared/src/schema/exams/question-bank-schema.ts`
- [x] Add `page` and `pageSize` coerce fields to `getQuestionCollectionsQuerySchema` in `packages/shared/src/schema/exams/question-collection-schema.ts`
- [x] Export `questionCollectionPageSchema` from `packages/shared/src/schema/exams/question-collection-schema.ts`
- [x] Write unit tests in `packages/shared/src/schema/exams/question-bank-schema.test.ts` — verify `page`/`pageSize` defaults, coercion from strings, and `questionBankCollectionPageSchema` shape
- [x] Write unit tests in `packages/shared/src/schema/exams/question-collection-schema.test.ts` — verify `page`/`pageSize` defaults, coercion, and `questionCollectionPageSchema` shape

**Migration required:** No — schema-only changes, no DB tables affected.

---

### Phase 2: API — Question Bank Collections (`app/sentinel-api`)

**Goal:** The `GET /question-bank/collections` endpoint returns a paginated envelope `{ items, page, pageSize, total, totalPages, hasMore }` instead of a flat array.

#### [MODIFY] [question-bank.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank.dto.ts)

- Update `getQuestionBankCollectionsSchema.response` to use `Schema.questionBankCollectionPageSchema` instead of `z.array(questionBankCollectionSchema)`.
- Export `QuestionBankCollectionPageRecord` type.

#### [MODIFY] [get-question-bank-collections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.ts)

- Accept `page` and `pageSize` from `filters`.
- Run a count query first (`select count(*)`), then a data query with `.limit(pageSize).offset((page-1)*pageSize)`.
- Return `{ items, page, pageSize, total, totalPages, hasMore }`.

#### [MODIFY] [question-bank.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank.service.ts)

- Update `QuestionBankService.getCollections` to return the page envelope (spread `page`, replace `items` with mapped records).

#### [MODIFY] [get-question-bank-collections.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/controllers/get-question-bank-collections.controller.ts)

- No handler logic changes needed — response shape is inferred from the updated DTO.

**Tasks:**

- [x] Refactor `getQuestionBankCollectionsData` in `app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.ts` to perform count + offset data queries and return the page envelope
- [x] Update `getQuestionBankCollectionsSchema.response` in `app/sentinel-api/src/modules/content/question-bank/question-bank.dto.ts` to use `Schema.questionBankCollectionPageSchema`
- [x] Export `QuestionBankCollectionPageRecord` from `question-bank.dto.ts`
- [x] Update `QuestionBankService.getCollections` in `app/sentinel-api/src/modules/content/question-bank/question-bank.service.ts` to return the page envelope with mapped `items`
- [x] Update existing tests in `app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.test.ts` to assert count query, offset, and page envelope shape
- [x] Write new tests in `app/sentinel-api/src/modules/content/question-bank/data/get-question-bank-collections.test.ts` — verify `page`, `pageSize` defaults, `totalPages` calculation, `hasMore` flag

**Migration required:** No — no schema changes, only query behaviour.

---

### Phase 3: API — Question Collection (`app/sentinel-api`)

**Goal:** The `GET /question-collection/collections` endpoint returns a paginated envelope, matching the pattern established in Phase 2.

#### [MODIFY] [question-collection.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/question-collection.dto.ts)

- Update `getQuestionCollectionsSchema.response` to use `Schema.questionCollectionPageSchema`.
- Export `QuestionCollectionPageRecord` type.

#### [MODIFY] [get-question-collections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/data/get-question-collections.ts)

- Accept `page` and `pageSize` from `filters`.
- Run count + offset data queries, return page envelope.

#### [MODIFY] [get-question-collections.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/services/get-question-collections.service.ts)

- Propagate the page envelope; map `items` with `mapQuestionCollectionResponse`.

#### [MODIFY] [question-collection.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-collection/question-collection.service.ts)

- Update `QuestionCollectionService.getCollections` return type.

**Tasks:**

- [x] Refactor `getQuestionCollectionsData` in `app/sentinel-api/src/modules/content/question-collection/data/get-question-collections.ts` to perform count + offset queries and return the page envelope
- [x] Update `getQuestionCollectionsSchema.response` in `app/sentinel-api/src/modules/content/question-collection/question-collection.dto.ts` to use `Schema.questionCollectionPageSchema`
- [x] Export `QuestionCollectionPageRecord` from `question-collection.dto.ts`
- [x] Update `getQuestionCollections` in `app/sentinel-api/src/modules/content/question-collection/services/get-question-collections.service.ts` to return the page envelope with mapped `items`
- [x] Update `QuestionCollectionService.getCollections` in `question-collection.service.ts` to pass through the page envelope
- [x] Write tests in `app/sentinel-api/src/modules/content/question-collection/data/get-question-collections.test.ts` — verify count query, offset, page envelope shape, `hasMore` flag

**Migration required:** No — no schema changes.

---

### Phase 4: Frontend Service Layer (`packages/services`)

**Goal:** Update `question-bank.ts` service and add a `question-collection.ts` service so that both return paginated response types.

#### [MODIFY] [question-bank.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/question-bank.ts)

- Add `GetQuestionBankCollectionsParams` fields `page?: number` and `pageSize?: number` to the existing interface.
- Add them to `buildQueryString`.
- Change `getQuestionBankCollections` return type from `QuestionBankCollectionRecord[]` to `QuestionBankCollectionPageRecord` (new interface mirroring `QuestionPageRecord` from `questions.ts`).
- Export `QuestionBankCollectionPageRecord`.

#### [NEW] [question-collection.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/question-collection.ts)

- Define `QuestionCollectionPageRecord`, `GetQuestionCollectionsParams`, `getQuestionCollections` function (mirrors `getQuestionBankCollections` but hits `/question-collection/collections`).

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/index.ts)

- Add `export * from './question-collection';`.

**Tasks:**

- [x] Add `page` and `pageSize` optional fields to `GetQuestionBankCollectionsParams` in `packages/services/src/api/question-bank.ts` and include them in `buildQueryString`
- [x] Change `getQuestionBankCollections` return type to `QuestionBankCollectionPageRecord` and export the type from `packages/services/src/api/question-bank.ts`
- [x] Create `packages/services/src/api/question-collection.ts` with `QuestionCollectionPageRecord`, `GetQuestionCollectionsParams`, and `getQuestionCollections` function
- [x] Add `export * from './question-collection'` to `packages/services/src/api/index.ts`
- [x] Update existing tests in `packages/services/src/api/question-bank.test.ts` to reflect the new paginated return type
- [x] Write tests for `getQuestionCollections` in `packages/services/src/api/question-collection.test.ts`

**Migration required:** No.

> [!WARNING]
> **Breaking change:** `getQuestionBankCollections` previously returned `QuestionBankCollectionRecord[]`. After this change it returns `QuestionBankCollectionPageRecord`. All callers in `sentinel-web` (`useQuestionBankCollectionsQuery`) must be updated.

---

### Phase 5: Frontend Hooks (`packages/hooks`)

**Goal:** Replace the flat-array `useQuestionBankCollectionsQuery` with a paginated query, and create a new `useQuestionCollectionsQuery` hook for question-collection.

#### [MODIFY] [use-question-bank-collections-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/question-bank/use-question-bank-collections-query.ts)

- Accept paginated `GetQuestionBankCollectionsParams` (now includes `page`/`pageSize`).
- Return value is `QuestionBankCollectionPageRecord` instead of `QuestionBankCollectionRecord[]`.

#### [NEW] [question-collection/](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/question-collection/)

- Create `use-question-collections-query.ts` using `getQuestionCollections` from `@sentinel/services`.
- Create `index.ts` exporting the hook.

#### [MODIFY] [query/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/index.ts)

- Export `* from './question-collection'`.

**Tasks:**

- [x] Update `useQuestionBankCollectionsQuery` in `packages/hooks/src/query/question-bank/use-question-bank-collections-query.ts` to accept `page`/`pageSize` params and reflect the new paginated return type
- [x] Create `packages/hooks/src/query/question-collection/use-question-collections-query.ts` with `useQuestionCollectionsQuery` hook
- [x] Create `packages/hooks/src/query/question-collection/index.ts` exporting the hook
- [x] Export question-collection hooks from `packages/hooks/src/query/index.ts`
- [x] Write tests for `useQuestionBankCollectionsQuery` in `packages/hooks/src/query/question-bank/use-question-bank-collections-query.test.ts`
- [x] Write tests for `useQuestionCollectionsQuery` in `packages/hooks/src/query/question-collection/use-question-collections-query.test.ts`

**Migration required:** No.

---

### Phase 6: Web App — Collections Page Consumer Update (`app/sentinel-web`)

**Goal:** Update `useCollectionManagement` (and the import-modal data hook) to consume the paginated API response instead of the flat array, removing the client-side pagination slice.

#### [MODIFY] [use-collection-management.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_hooks/use-collection-management.ts)

- Pass `page` / `pageSize` to `useQuestionBankCollectionsQuery`.
- Replace client-side slice/pagination logic with server-returned `page`, `totalPages`, `items`.
- Remove `collectionsWithDraft` client-side pagination and use `data.items` directly.

#### [MODIFY] [use-question-bank-import-data.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_hooks/use-question-bank-import-data.ts)

- Read `collections` from `data?.items ?? []` instead of the flat array.

**Tasks:**

- [x] Update `useCollectionManagement` in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_hooks/use-collection-management.ts` to pass page state to `useQuestionBankCollectionsQuery` and consume `data.items`/`data.totalPages` from the paginated response
- [x] Remove the client-side `collectionsWithDraft` pagination slice in `use-collection-management.ts` (server now owns pagination)
- [x] Update `useQuestionBankImportData` in `app/sentinel-web/src/features/exams/builder/_components/question-bank-import-modal/_hooks/use-question-bank-import-data.ts` to read `collections` from `data?.items ?? []`
- [x] Write / update tests in `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/collections/_hooks/use-collection-management.test.ts`

**Migration required:** No.

---

## Breaking Changes

| Change | Scope |
|--------|-------|
| `getQuestionBankCollections` now returns `QuestionBankCollectionPageRecord` | `packages/services`, `packages/hooks`, `sentinel-web` |
| `GET /question-bank/collections` response shape changes from `data: []` to `data: { items, page, pageSize, total, totalPages, hasMore }` | API clients |

---

## Verification Plan

### Automated Tests

```bash
# Shared schemas
pnpm --dir packages/shared test

# API modules
pnpm --dir app/sentinel-api test

# Services package
pnpm --dir packages/services test

# Hooks package
pnpm --dir packages/hooks test

# Web app
pnpm --dir app/sentinel-web test

# Full suite
pnpm test
```

### Manual Verification

1. Start the dev server (`pnpm dev`).
2. Navigate to `/question/bank/collections` — verify collections render with correct page count and next/prev page buttons work via server-driven pagination.
3. Open the exam builder import modal — verify collections list still populates.
4. Hit `GET /question-bank/collections?page=1&pageSize=5` and `GET /question-collection/collections?page=1&pageSize=5` directly and confirm the paginated envelope is returned.
5. Confirm `GET /questions?page=1&pageSize=20` still works correctly (no regression).
