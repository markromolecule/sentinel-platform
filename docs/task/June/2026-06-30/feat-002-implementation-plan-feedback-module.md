# feat-002: Feedback Module Backend-to-Frontend Implementation

## Implementation Status

- [x] Core implementation completed on 2026-06-30 across `packages/shared`, `packages/db`, `app/sentinel-api`, `packages/services`, `packages/hooks`, `app/sentinel-web`, and `app/sentinel-support`.
- [x] Focused verification completed for shared, services, hooks, student web, support web, and Prisma client generation.
- [ ] Remaining follow-up: add the backend feedback Vitest coverage listed in Phase 2 and run a clean repo-wide API typecheck once unrelated pre-existing errors are resolved.

Read and summarize the task input in one sentence: build a persistent exam feedback module with API routes, shared schemas, service/query hooks, a student post-exam feedback flow, and a paginated support feedback review page.

---

## Relevant Findings

- `app/sentinel-api/src/modules/general/feedbacks/feedback.dto.ts`, `feedback.routes.ts`, and `feedback.service.ts` already exist but are empty stubs.
- No Prisma feedback model/table exists, so persistent feedback requires a schema change and migration.
- Student result flow currently completes the exam in `app/sentinel-web/src/app/(protected)/student/exam/[id]/result/page.tsx` and redirects directly to history details.
- Support sidebar navigation is driven by `app/sentinel-support/src/components/sidebar/support/constants/index.ts`.
- Shared API helpers live in `packages/services/src/api`, and React Query hooks live in `packages/hooks/src/query`.
- Likely touched DB tables: new `exam_feedbacks`, plus relations to `exam_attempts`, `exams`, `students`, and `institutions`.
- Prisma migration needed: Yes. The module needs a dedicated queryable table for rating, optional experience text, attempt ownership, support pagination, and filtering.

---

## Viable Options

### Option 1: Minimal feedback table and two endpoints

Create feedback with `POST /feedbacks`, list feedback with `GET /feedbacks`, then wire basic student and support UI.

Tradeoff: fastest path, but it leaves limited reporting UX, weak filtering, and less room for future support workflows.

### Option 2: Full module following existing backend/frontend patterns

Add shared schemas, a Prisma table, modular backend data/services/controllers, package API helpers, React Query hooks, student feedback/thank-you pages, and a support listing with search, rating filter, sort, and pagination.

Tradeoff: broader implementation, but it matches the requested structure and existing repo conventions.

### Option 3: Store feedback inside `exam_attempts.answer_snapshot`

Avoid a new table by embedding rating and experience text in existing attempt JSON.

Tradeoff: avoids migration, but makes support pagination/filtering brittle and mixes platform feedback with exam answer data.

---

## Best Option

**Option 2** is the best fit because the request explicitly asks for a proper backend module, frontend API/mutation hooks, and a support listing page with backend pagination. A dedicated table keeps feedback queryable, testable, and cleanly separated from exam scoring data while following the repo's existing module layout.

Concrete numbered next steps:

1. Add shared feedback schemas and query keys.
2. Add the `exam_feedbacks` Prisma model and SQL migration.
3. Implement feedback data functions, modular services, DTOs, controllers, routes, and route registration.
4. Add package-level API helpers and React Query hooks.
5. Insert the student feedback page after exam turn-in and add the thank-you page.
6. Add the support feedback page, sidebar entry, table UX, filters, and pagination.
7. Run focused backend, hooks, shared, and frontend tests.

---

## Proposed Changes

### Phase 1: Shared Contracts and Database Schema

**Goal:** Define the feedback API contract and persistent storage before wiring app behavior.

- [x] Add `packages/shared/src/schema/feedbacks/feedback-schema.ts` with `createFeedbackSchema`, `getFeedbacksQuerySchema`, `feedbackRecordSchema`, `feedbackPageSchema`, and inferred types.
- [x] Export feedback schemas from `packages/shared/src/schema/index.ts`.
- [x] Add `FEEDBACK_QUERY_KEYS` to `packages/shared/src/constants/feedbacks.ts`.
- [x] Export `FEEDBACK_QUERY_KEYS` from `packages/shared/src/constants/index.ts`.
- [x] Update `packages/shared/src/constants/permissions.ts` with `feedback:create` and `feedback:view`.
- [x] Assign `feedback:create` to the `student` role and `feedback:view` to the `support` and `superadmin` role blueprints in `packages/shared/src/constants/permissions.ts`.
- [x] Add Prisma model `exam_feedbacks` in `packages/db/prisma/schema.prisma` with `feedback_id`, unique `attempt_id`, nullable `exam_id`, nullable `student_id`, nullable `institution_id`, `rating`, nullable `experience`, `created_at`, and `updated_at`.
- [x] Add relation fields from `exam_attempts`, `exams`, `students`, and `institutions` to `exam_feedbacks` in `packages/db/prisma/schema.prisma`.
- [x] Create `packages/db/prisma/migrations/[timestamp]_add_exam_feedbacks/migration.sql` with the table, foreign keys, unique attempt constraint, rating check constraint, and indexes for `institution_id, created_at`, `exam_id`, `student_id`, and `rating`.
- [x] Write tests in `packages/shared/src/schema/feedbacks/feedback-schema.test.ts` for rating bounds, optional experience, pagination defaults, and invalid query values.
      **Migration required:** Yes - this phase adds the `exam_feedbacks` persistence table and Prisma relations.

### Phase 2: Backend Feedback Module

**Goal:** Implement authenticated feedback creation and support-facing paginated reads using the existing Hono/OpenAPI module style.

- [x] Implement DTO/OpenAPI schemas in `app/sentinel-api/src/modules/general/feedbacks/feedback.dto.ts` using shared feedback schemas.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/data/create-feedback.ts` to insert one feedback per completed attempt.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/data/get-feedback.ts` to fetch one feedback by ID with joined student, exam, and institution display fields.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/data/get-feedbacks.ts` to return `{ items, page, pageSize, total, totalPages, hasMore }` with `page`, `pageSize`, `rating`, `examId`, `search`, `sortBy`, and `sortOrder`.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/data/index.ts` to export feedback data functions.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/services/create-feedback.service.ts` to verify the authenticated student owns the completed attempt, derive `exam_id`, `student_id`, and `institution_id`, enforce rating validation, and reject duplicate attempt feedback with 409.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/services/get-feedback.service.ts` to enforce `feedback:view` and return a single scoped feedback record.
- [x] Create `app/sentinel-api/src/modules/general/feedbacks/services/get-feedbacks.service.ts` to enforce `feedback:view`, apply institution/support scoping, and return the paginated list.
- [x] Implement facade methods with JSDoc in `app/sentinel-api/src/modules/general/feedbacks/feedback.service.ts`.
- [x] Add `app/sentinel-api/src/modules/general/feedbacks/controllers/create-feedback.controller.ts` with `POST /`.
- [x] Add `app/sentinel-api/src/modules/general/feedbacks/controllers/get-feedback.controller.ts` with `GET /{id}`.
- [x] Add `app/sentinel-api/src/modules/general/feedbacks/controllers/get-feedbacks.controller.ts` with `GET /`.
- [x] Implement `app/sentinel-api/src/modules/general/feedbacks/feedback.routes.ts` with `authMiddleware` and OpenAPI route registration.
- [x] Register `feedbackRouter` in `app/sentinel-api/src/app.ts` at `/feedbacks`.
- [ ] Write tests in `app/sentinel-api/src/modules/general/feedbacks/feedback.dto.test.ts` for request and response validation.
- [ ] Write tests in `app/sentinel-api/src/modules/general/feedbacks/data/create-feedback.test.ts` and `get-feedbacks.test.ts` for insert, duplicate attempt protection, joins, filters, and pagination totals.
- [ ] Write tests in `app/sentinel-api/src/modules/general/feedbacks/services/create-feedback.service.test.ts` for student ownership, completed-attempt enforcement, and duplicate handling.
- [ ] Write tests in `app/sentinel-api/src/modules/general/feedbacks/controllers/feedback.controller.test.ts` for create/list/detail success and authorization errors.
      **Migration required:** Yes - this phase depends on the `exam_feedbacks` table from Phase 1.

### Phase 3: Services Package and React Query Hooks

**Goal:** Expose feedback API helpers and hooks for both student and support apps.

- [x] Add `packages/services/src/api/feedbacks.ts` with `createFeedback`, `getFeedbacks`, `getFeedback`, `buildFeedbacksQueryString`, and exported DTO/page types.
- [x] Export feedback APIs from `packages/services/src/api/index.ts`.
- [x] Add `packages/hooks/src/query/feedbacks/use-create-feedback-mutation.ts`, invalidating `FEEDBACK_QUERY_KEYS.all` on success.
- [x] Add `packages/hooks/src/query/feedbacks/use-feedbacks-query.ts` for paginated support feedback reads.
- [x] Add `packages/hooks/src/query/feedbacks/use-feedback-query.ts` for single feedback details.
- [x] Add `packages/hooks/src/query/feedbacks/index.ts` and export it from `packages/hooks/src/query/index.ts`.
- [x] Write tests in `packages/services/src/api/feedbacks.test.ts` for query-string serialization and API response unwrapping.
- [x] Write tests in `packages/hooks/src/query/feedbacks/use-create-feedback-mutation.test.ts` for mutation calls and query invalidation.
- [x] Write tests in `packages/hooks/src/query/feedbacks/use-feedbacks-query.test.ts` for query keys and authenticated query gating.
      **Migration required:** No - client contract and hook wiring only.

### Phase 4: Student Post-Exam Feedback Flow

**Goal:** Show a required rating form after exam turn-in, then show a thank-you screen.

- [x] Update `app/sentinel-web/src/app/(protected)/student/exam/[id]/result/page.tsx` so successful `completeExamSession(...)` redirects to `/student/exam/[id]/feedback?attemptId=[attemptId]` instead of history details.
- [x] Add `app/sentinel-web/src/app/(protected)/student/exam/[id]/feedback/page.tsx` with a required 1-5 rating control, optional experience textarea, submit loading state, validation feedback, and duplicate-feedback handling that redirects to thank-you.
- [x] Add `app/sentinel-web/src/app/(protected)/student/exam/[id]/feedback/thank-you/page.tsx` with actions back to exam history/details.
- [x] Use `useCreateFeedbackMutation` in `app/sentinel-web/src/app/(protected)/student/exam/[id]/feedback/page.tsx` with payload `{ attemptId, rating, experience }`.
- [x] Add or update `app/sentinel-web/src/app/(protected)/student/exam/[id]/result/page.test.tsx` to assert the redirect targets the feedback page after turn-in.
- [ ] Add `app/sentinel-web/src/app/(protected)/student/exam/[id]/feedback/page.test.tsx` for missing `attemptId`, required rating validation, successful submission, API error display, and duplicate feedback redirect.
- [x] Add `app/sentinel-web/src/app/(protected)/student`/exam/[id]/feedback/thank-you/page.test.tsx` for thank-you content and navigation links.
      **Migration required:** No - frontend flow only.

### Phase 5: Support Feedback Review Page

**Goal:** Let support users review student feedback with useful scanning, filters, and backend pagination.

- [x] Add a sidebar item named `Feedback` in `app/sentinel-support/src/components/sidebar/support/constants/index.ts`, using a lucide icon and URL `/feedbacks`.
- [x] Update `app/sentinel-support/src/components/sidebar/support/support-sidebar.test.tsx` to assert the `/feedbacks` item renders and becomes active.
- [x] Add `app/sentinel-support/src/app/(protected)/feedbacks/page.tsx` as a client page using `useFeedbacksQuery`.
- [x] Add `app/sentinel-support/src/app/(protected)/feedbacks/_components/feedback-summary-cards.tsx` for total count and average rating from the current response.
- [x] Add `app/sentinel-support/src/app/(protected)/feedbacks/_components/feedbacks-table.tsx` with columns for rating, experience preview, student name/email, exam title, institution, and submitted date.
- [x] Add `app/sentinel-support/src/app/(protected)/feedbacks/_components/feedback-detail-dialog.tsx` to show the full optional experience text and metadata for one feedback row.
- [x] Add rating filter, search input, sort controls, loading, empty, error, and paginated table states in `app/sentinel-support/src/app/(protected)/feedbacks/page.tsx`, connected to backend query params.
- [x] Add `app/sentinel-support/src/app/(protected)/feedbacks/page.test.tsx` for loading, empty, rendered feedback rows, filters, pagination changes, and detail viewing.
- [ ] Add component tests next to `feedback-summary-cards.tsx`, `feedbacks-table.tsx`, and `feedback-detail-dialog.tsx` for display and interaction behavior.
      **Migration required:** No - support UI only.

### Phase 6: Verification and Regression Sweep

**Goal:** Validate the full backend-to-frontend feedback path and document rollback behavior.

- [ ] Run `pnpm --dir app/sentinel-api test` for feedback backend tests.
- [x] Run focused tests for `packages/shared`, `packages/services`, and `packages/hooks` feedback files.
- [x] Run focused `sentinel-web` tests for the result, feedback, and thank-you pages.
- [x] Run focused `sentinel-support` tests for the sidebar and feedback page.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm format:check`.
- [ ] Manually verify student flow: turn in exam, feedback form appears, submit rating, thank-you page appears.
- [ ] Manually verify support flow: open `/feedbacks`, search/filter/sort, paginate, and inspect full feedback.
      **Migration required:** Yes - verification includes applying and rolling back the new feedback table in a safe local database.

---

## Breaking API Changes

- None expected. This adds `/feedbacks` endpoints and new shared exports without changing existing endpoint behavior.

## Environment Variables

- No new `.env` variables required.

## Migration Rollback Note

- Roll back by dropping `public.exam_feedbacks`, removing the Prisma `exam_feedbacks` model and relation fields, then regenerating Prisma/Kysely types.
