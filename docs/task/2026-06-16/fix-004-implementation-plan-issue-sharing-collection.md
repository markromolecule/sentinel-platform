# fix: Collection Sharing Endpoint & Question Bank Visibility

Fix the collection sharing 404 error by mounting sharing routes under the `/question-bank`
router prefix. Implement database-level visibility filtering to hide questions that belong
to private, unshared collections of other users.

---

## Visibility Rule

A question is **hidden** from a user's question bank when **all** of the following are true:

- The question belongs to a collection
- That collection is **not public**
- The user is **not** the collection owner
- The user is **not** explicitly shared on the collection
- The user is **not** the question owner

In all other cases — including uncollected questions — the question remains visible.

---

## Root Causes

| # | Problem | Root Cause |
|---|---------|------------|
| 1 | Sharing endpoints return 404 | Routes registered under `/question-collection`, but frontend calls `/question-bank` |
| 2 | Private collection questions leak to all users | Visibility filtering is absent at the query level |

---

## Solution Approach

### Problem 1 — Endpoint 404

| Option | Approach | Tradeoff |
|--------|----------|----------|
| ✅ **1 — Register on question-bank router** | Import sharing handlers from `question-collection` and mount them on `questionBankRoutes` | Minimal risk, no refactoring, uses already-tested controllers |
| 2 — Move sharing logic to question-bank | Migrate controller + logic out of `question-collection` entirely | Cleaner long-term, but risks breaking imports and tests |
| 3 — Middleware request rewrite | Rewrite `/question-bank/collections/:id/shares` → `/question-collection/...` | No new routes needed, but introduces opaque routing behavior |

**Decision: Option 1.** Fastest path to fix with the lowest blast radius.

### Problem 2 — Question Visibility Filtering

| Option | Approach | Tradeoff |
|--------|----------|----------|
| 1 — In-memory filter in `question.service.ts` | Filter the returned array after fetching | Fast to write, but breaks pagination and degrades performance at scale |
| ✅ **2 — Database-level filter via Kysely** | Pass `userId` into `get-questions.ts` and add a WHERE clause | Fully compatible with pagination and sorting; matches established patterns |
| 3 — PostgreSQL Row Level Security | Define RLS policies in Supabase | Centralized DB-level security, but breaks test pipelines that bypass Supabase auth |

**Decision: Option 2.** Consistent with the existing query architecture and correct under pagination.

---

## Implementation Plan

### Phase 1 — Mount Sharing Routes on Question Bank Router

**Goal:** Resolve the 404 by exposing sharing endpoints under `/question-bank`.

#### [question-bank.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank.route.ts)
- [x] Import `getQuestionCollectionSharesRoute` and `shareQuestionCollectionRoute` from `app/sentinel-api/src/modules/content/question-collection/controllers/share-question-collection.controller.ts`
- [x] Mount both handlers on the `questionBankRoutes` instance under the path `collections/:id/shares`

#### [question-bank-shares.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank-shares.test.ts) *(new file)*
- [x] Implement Hono app request tests asserting that `GET /question-bank/collections/:id/shares` correctly returns the shared users list
- [x] Implement request tests asserting that `POST /question-bank/collections/:id/shares` updates shares and returns the updated list
- [x] Ensure proper error handling (e.g. 404 or 403 on invalid/unauthorized requests) is tested

**Migration required:** No

---

### Phase 2 — Implement Question Visibility Filtering

**Goal:** Exclude questions from private, unshared collections of other users at the query level.

#### [get-questions.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/controllers/get-questions.controller.ts)
- [x] Extract `user.id` from Hono context inside `getQuestionsRouteHandler`
- [x] Pass the retrieved `userId` to `QuestionService.getQuestions`

#### [question.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/question.service.ts)
- [x] Add optional `userId?: string` parameter to `QuestionService.getQuestions` method signature
- [x] Forward the `userId` to the underlying query function `getQuestionsData`

#### [get-questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-questions.ts)
- [x] Add `userId` property to `GetQuestionsDataArgs` type definition
- [x] In `applyQuestionFilters`, add Kysely filters using `.where(...)` to exclude questions that reside in collections the user cannot access, unless the user is the question creator:
  ```typescript
  // Hide if the question belongs to a private, unshared collection of another user
  // and the current user is not the question owner.
  ```

#### [get-questions.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-questions.test.ts) *(new file)*
- [x] Implement unit/integration tests asserting:
  - Uncollected questions are visible to all users
  - Questions in a public collection are visible to all users
  - Questions in a private collection owned by the user are visible
  - Questions in a private collection owned by another user but shared with the user are visible
  - Questions in a private collection owned by another user and not shared are hidden (absent from result)

**Migration required:** No

---

## Affected Files

`src/modules/content/`
├── `question-bank/`
│   ├── [question-bank.route.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank.route.ts)              [modify]
│   └── [question-bank-shares.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question-bank/question-bank-shares.test.ts)    [new]
└── `question/`
    ├── `controllers/`
    │   └── [get-questions.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/controllers/get-questions.controller.ts)     [modify]
    ├── [question.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/question.service.ts)                 [modify]
    └── `data/`
        ├── [get-questions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-questions.ts)                [modify]
        └── [get-questions.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/content/question/data/get-questions.test.ts)       [new]

---

## Verification

### Automated
```bash
pnpm --dir app/sentinel-api test
```
All question and sharing tests must pass with no regressions.

### Manual

**Sharing (Phase 1)**
1. Open the UI and share a collection with another user.
2. Confirm no 404 appears in the network tab.
3. Confirm the share is reflected in the collection's share list.

**Visibility (Phase 2)**
1. Log in as **User A** — create a private collection, add **Question A** to it.
2. Log in as **User B** — confirm **Question A** is not in the question bank.
3. As **User A** — share the collection with User B.
4. As **User B** — confirm **Question A** is now visible in the question bank.
5. As **User A** — confirm **Question A** remains visible throughout.
