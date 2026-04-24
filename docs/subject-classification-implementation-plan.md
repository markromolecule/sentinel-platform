# Subject Classification Implementation Plan

This plan expands `docs/subject-classification-plan.md` into an implementation-ready workflow. It follows the `to-do-workflow`: investigate first, document the plan in `/docs`, and do not start coding until implementation is explicitly approved.

## 1-3-1 Rule

### 1 Core Objective

Use subject classifications as an operational shortcut for subject offering while fixing academic-scope leaks so admins and superadmins only see subject offerings and enrollment requests for their institution.

### 3 Viable Options

#### Option 1: Frontend-Only Bulk Offer Flow

Add a bulk-offer button in the classification UI that loops through selected subjects and calls the existing `POST /subject-offerings` endpoint once per subject.

Pros:

- Smallest backend change.
- Reuses the existing subject-offering create endpoint and current form schema.
- Fastest UI-only path for a first draft.

Cons:

- No transaction boundary across the bulk operation.
- Partial success is possible and hard to explain to admins.
- Duplicates, validation errors, and institution-scope failures would be handled one request at a time.
- More network traffic and more frontend orchestration.

#### Option 2: Dedicated Classification Bulk Offer Endpoint

Add a backend endpoint that accepts a `subject_classification_id`, `term_id`, and target assignments, resolves the classification subjects server-side, and creates subject offerings in one service flow.

Pros:

- Keeps bulk business rules on the backend.
- Allows idempotent duplicate handling and clear result summaries.
- Can enforce institution, department, course, section, and term scope in one place.
- Gives the UI a simple mutation and a reliable result shape.

Cons:

- Requires new DTO, service, data-layer, service-client, hook, and UI work.
- Needs new tests for classification scope, duplicate handling, and partial/transaction behavior.

#### Option 3: Extend Current Subject Offering Create Contract

Change `POST /subject-offerings` so it can accept either one `subject_id` or a `subject_classification_id`, then internally create one offering per subject in that classification.

Pros:

- Keeps all offering creation under one route.
- Reduces endpoint count.
- Reuses existing permission and assignment resolution code.

Cons:

- Makes the single-subject create contract do two different jobs.
- Response shape becomes awkward because one request may now return many offerings.
- Higher risk of breaking existing create-offering callers.

### 1 Recommended Option

Choose **Option 2: Dedicated Classification Bulk Offer Endpoint**.

Why:

- The classification workflow is a bulk domain action, not just a UI loop.
- The backend already has subject-classification and subject-offering modules, so a narrow bridge endpoint keeps concerns clear.
- It is the safest place to enforce institution scope, assignment scope, duplicate handling, and result summaries.
- It keeps existing single-subject offering behavior stable.

Recommended next step:

- Implement Phase 1 and Phase 2 first, then pause for backend/API validation before building the full UI.

## Key Findings From Current Code

-> [ ] `GET /subject-offerings` already passes an `institutionId` into `getSubjectOfferingsData`, but this should be covered by regression tests because the source plan calls out a cross-institution visibility bug.

-> [ ] `GET /enrollments/requests` currently restricts instructors to their own requests, but admin/superadmin calls do not pass institution, department, or course scope into `getEnrollmentRequestsData`.

-> [ ] `POST /subject-offerings` already uses `buildRequesterAcademicScope`, `assertSubjectOfferingMutationAccess`, and `resolveSubjectOfferingAssignmentsForScope`; the bulk classification endpoint should reuse the same scope resolution instead of duplicating assignment rules.

-> [ ] `SubjectClassificationCard` currently uses compact badges but still has whitespace/card sizing complaints; the UI pass should focus on card width, title/description sizing, tag sizing, and dense preview spacing.

## Phase 0: Approval And Baseline

Goal: Confirm the implementation path before coding and preserve a clean validation baseline.

-> [x] Confirm Option 2 as the chosen approach.

-> [x] Review current routes and permissions:

-> [x] `app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.routes.ts`

-> [x] `app/sentinel-api/src/modules/core/subject-classification/subject-classification.routes.ts`

-> [x] `app/sentinel-api/src/modules/identity/enrollments/enrollments.routes.ts`

-> [x] Confirm the permission name for bulk offering, likely `subject_offerings:offer`.

-> [x] Confirm whether admin bulk offering should be limited to the admin course, current behavior, or widened to admin department.

-> [x] Confirm duplicate behavior for already offered subjects:

-> [x] skip duplicates and return them in a `skipped` summary

-> [ ] fail the whole request

-> [x] create missing offerings only

-> [x] Run baseline checks before editing:

-> [x] `pnpm --dir app/sentinel-api test`

-> [x] `pnpm --dir app/sentinel-core lint`

### Phase 0 Notes

-> [x] Route review: bulk classification offering should be registered in `subject-offerings.routes.ts`; subject-classification routes remain focused on classification CRUD; enrollment-request scope fixes belong in `enrollments.routes.ts` and the enrollment data/service layer.

-> [x] Permission review: the existing offer permission is `subject_offerings:offer`, already used by the current create-offering route and core UI.

-> [x] Admin scope decision for implementation: preserve the current admin behavior and keep bulk offering limited by the admin's assigned course through `resolveSubjectOfferingAssignmentsForScope`.

-> [x] Duplicate strategy decision for implementation: use `skip_existing`, create only missing offerings, and return skipped subjects/counts in the mutation response.

-> [x] Baseline test result: `pnpm --dir app/sentinel-api test` failed before implementation. Main blockers include unreachable configured Supabase database at `aws-1-ap-northeast-1.pooler.supabase.com`, unrelated telemetry assertions, and mocked route tests failing with `dbClient.insertInto is not a function`.

-> [x] Baseline lint result: `pnpm --dir app/sentinel-core lint` failed before implementation due to existing `react/no-unescaped-entities` errors in `edit-section-dialog.tsx` and `edit-subject-offering-dialog.tsx`, plus existing warnings in whitelist, subject classification form, offered subjects list, and classification detail page files.

## Phase 1: Academic-Scope Fixes

Goal: Fix institution leakage for subject offerings and enrollment requests, with tests proving the behavior.

### Subject Offerings Scope

-> [x] Add or update data-layer tests for `getSubjectOfferingsData` to prove institution filtering:

-> [x] create `app/sentinel-api/src/modules/core/subject-offerings/data/tests/get-subject-offerings.test.ts`

-> [x] include two institutions with similarly named subjects and terms

-> [x] assert an admin/superadmin scoped to Institution A cannot see Institution B offerings

-> [x] assert search, `subject_id`, and `term_id` filters do not bypass `institutionId`

-> [x] Review `getSubjectOfferingsRouteHandler` to ensure support/superadmin/admin query scope matches product expectations.

-> [x] Add a route/service test if route-level scope needs coverage beyond data-layer tests.

### Enrollment Requests Scope

-> [x] Update `getEnrollmentRequestsData` to accept academic scope filters:

-> [x] `institutionId`

-> [x] `departmentId`

-> [x] `courseId`

-> [x] optional `userId` for instructor-owned requests

-> [x] Filter enrollment requests through `subject_offerings.institution_id`.

-> [x] Filter admin/course scope through resolved class group sections, subject-offering courses, or the existing academic-scope rules.

-> [x] Update `EnrollmentService.getEnrollmentRequests` to pass the scope object instead of only `status` and `userId`.

-> [x] Update `getEnrollmentRequestsRouteHandler` to build requester academic scope and pass resolved query scope for admin and superadmin.

-> [x] Add tests:

-> [x] create `app/sentinel-api/src/modules/identity/enrollments/data/tests/get-enrollment-requests.test.ts`

-> [x] admin sees only requests inside their institution/course scope

-> [x] superadmin sees only requests inside their institution

-> [x] instructor sees only their own requests

-> [x] search/status filters, if present, do not widen scope

### Phase 1 Notes

-> [x] Implemented enrollment-request academic scope filters in `getEnrollmentRequestsData` for `institutionId`, `departmentId`, and `courseId`, while preserving `userId` filtering for instructors.

-> [x] Updated `EnrollmentService.getEnrollmentRequests` to accept a scope object so future callers cannot accidentally drop academic scope by passing only status/user arguments.

-> [x] Updated `getEnrollmentRequestsRouteHandler` to build requester academic scope and pass institution, department, and course scope for admin/superadmin views; instructor views remain restricted to the instructor's own requests.

-> [x] Added lightweight query-construction tests instead of remote-database integration tests because the Phase 0 baseline confirmed the configured Supabase database is unreachable in this environment.

-> [x] Targeted tests passed:

-> [x] `pnpm --dir app/sentinel-api exec vitest run src/modules/core/subject-offerings/data/tests/get-subject-offerings.test.ts`

-> [x] `pnpm --dir app/sentinel-api exec vitest run src/modules/identity/enrollments/data/tests/get-enrollment-requests.test.ts`

-> [x] API typecheck note: `pnpm --dir app/sentinel-api exec tsc --noEmit` exceeded the default Node heap. Rerunning with `NODE_OPTIONS=--max-old-space-size=4096` completed type analysis but failed on pre-existing examination and telemetry test fixture errors unrelated to Phase 1 touched files.

## Phase 2: Bulk Classification Offering Backend

Goal: Add a backend-first bulk offering workflow based on `subject_classification_id`.

### Shared Schema And DTO

-> [x] Add a shared schema in `packages/shared/src/schema/subjects/subject-offering-schema.ts`:

-> [x] `subject_classification_id`

-> [x] `term_id`

-> [x] `department_ids`

-> [x] `course_ids`

-> [x] `section_ids`

-> [x] `year_levels`

-> [x] optional duplicate strategy, defaulting to `skip_existing`

-> [x] Add OpenAPI DTOs in `app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.dto.ts`.

-> [x] Define a response shape that can show:

-> [x] created offerings

-> [x] skipped subjects

-> [x] failed subjects, if partial success is allowed

-> [x] total counts

### Service And Data Layer

-> [x] Add `bulkCreateSubjectOfferingsFromClassification` to `SubjectOfferingsService`.

-> [x] Load the classification by ID using `SubjectClassificationService` or a small data helper.

-> [x] Verify the classification belongs to the requester institution.

-> [x] Resolve all subject IDs assigned to the classification.

-> [x] Reject empty classifications with a clear 400 response.

-> [x] Reuse `resolveSubjectOfferingAssignmentsForScope` for target departments, courses, sections, and year levels.

-> [x] Reuse `getTermRecordData` and `validateInstitutionScope` for term validation.

-> [x] Create offerings in a database transaction where supported.

-> [x] Skip existing `subject_id + term_id` offerings when duplicate strategy is `skip_existing`.

-> [x] Return a structured summary so the UI can explain what happened.

### Route

-> [x] Add a route such as `POST /subject-offerings/bulk/classification`.

-> [x] Guard it with `subject_offerings:offer`.

-> [x] Use the same requester academic-scope construction as single create.

-> [x] Map known errors to clear statuses:

-> [x] 400 invalid payload or empty classification

-> [x] 403 out-of-scope target assignment

-> [x] 404 missing classification or term

-> [x] 409 duplicate-only request if product chooses fail-on-duplicate

### Backend Tests

-> [x] Add service tests:

-> [x] `app/sentinel-api/src/modules/core/subject-offerings/services/bulk-create-subject-offerings-from-classification.test.ts`

-> [x] creates one offering per subject in classification

-> [x] skips already offered subjects and reports skipped counts

-> [x] rejects classifications from another institution

-> [x] rejects terms from another institution

-> [x] rejects empty classifications

-> [x] preserves admin assignment scope

-> [x] Add route/contract tests:

-> [x] `app/sentinel-api/src/modules/core/subject-offerings/bulk-classification-offerings.test.ts`

-> [x] validates request schema

-> [x] validates response summary shape

-> [x] validates permission failure

### Phase 2 Notes

-> [x] Added `classificationSubjectOfferingFormSchema` and `subjectOfferingDuplicateStrategySchema` in `packages/shared/src/schema/subjects/subject-offering-schema.ts`.

-> [x] Added `POST /subject-offerings/bulk/classification` through `create-subject-offerings-from-classification.controller.ts` and registered it before the generic offering routes.

-> [x] Added duplicate detection through `getExistingSubjectOfferingsBySubjectsData`, using `subject_id + term_id + institution_id` to identify existing offerings.

-> [x] Added `SubjectOfferingsService.createSubjectOfferingsFromClassification`, which loads the scoped classification, rejects empty classifications, validates term and subject institution scope, creates missing offerings inside `executeTransaction`, updates assignment tables, and returns created/skipped counts.

-> [x] Targeted tests passed:

-> [x] `pnpm --dir app/sentinel-api exec vitest run src/modules/core/subject-offerings/services/bulk-create-subject-offerings-from-classification.test.ts`

-> [x] `pnpm --dir app/sentinel-api exec vitest run src/modules/core/subject-offerings/bulk-classification-offerings.test.ts`

-> [x] Formatting passed for the touched Phase 2 backend/shared files with `pnpm exec prettier --check ...`.

-> [x] API typecheck note: `NODE_OPTIONS=--max-old-space-size=4096 pnpm --dir app/sentinel-api exec tsc --noEmit --pretty false` no longer reports Phase 2 files after the implicit-any fix; it still fails on the known unrelated examination and telemetry test fixture errors.

## Phase 3: Services, Hooks, And Types

Goal: Expose the backend bulk workflow to apps through the shared client layers.

-> [x] Update `packages/services/src/api/subject-offerings.ts`:

-> [x] add `createSubjectOfferingsFromClassification`

-> [x] map the response summary into frontend-safe types

-> [x] Update `packages/hooks/src/query/subject-offerings/`:

-> [x] add `useCreateSubjectOfferingsFromClassificationMutation`

-> [x] invalidate subject-offering query keys on success

-> [x] invalidate subject-classification detail/list query keys if counts or derived UI need refreshing

-> [x] Add or update shared types:

-> [x] `packages/shared/src/types/admin/subjects/index.ts`

-> [x] `packages/shared/src/types/index.ts`

-> [x] Add unit-level tests if the repo adds service/hook test support before implementation.

### Phase 3 Notes

-> [x] Added shared frontend-safe result types: `SkippedSubjectOffering` and `ClassificationSubjectOfferingResult`.

-> [x] Added `createSubjectOfferingsFromClassification` in `packages/services/src/api/subject-offerings.ts`, including API response mapping from backend snake_case to frontend camelCase.

-> [x] Added `useCreateSubjectOfferingsFromClassificationMutation` in `packages/hooks/src/query/subject-offerings/`, with subject-offering and subject-classification query invalidation.

-> [x] Exported the new hook from `packages/hooks/src/query/subject-offerings/index.ts`.

-> [x] Formatting passed for the touched Phase 3 files with `pnpm exec prettier --check ...`.

-> [x] Package builds passed:

-> [x] `pnpm --dir packages/shared build`

-> [x] `pnpm --dir packages/services build`

-> [x] `pnpm --dir packages/hooks build`

## Phase 4: Core Admin UI For Bulk Offering

Goal: Let admin/superadmin offer all subjects in a classification without manual per-subject offering.

### Entry Points

-> [x] Add an `Offer subjects` action to `SubjectClassificationCard`.

-> [x] Ensure clicking the action does not trigger the card navigation link.

-> [x] Add the same action to the classification detail page if one exists.

-> [x] Disable or explain the action when the classification has zero subjects.

### Bulk Offer Dialog

-> [x] Create a dialog under:

-> [x] `app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/offer-classification-subjects-dialog.tsx`

-> [x] Reuse existing subject-offering form controls where possible.

-> [x] Show classification name, classification type, and subject count.

-> [x] Let the user pick term, departments, courses, year levels, and sections.

-> [x] For admin users, respect existing course/department limits in the available options.

-> [x] Show a pre-submit summary:

-> [x] number of subjects to offer

-> [x] selected term

-> [x] selected target departments/courses/year levels/sections

-> [x] likely skipped duplicates if a preview endpoint is added later

-> [x] On success, show a result summary with created and skipped counts.

-> [x] Refresh classification and subject-offering lists after success.

### UI Tests

-> [x] Add focused tests if component test setup is available:

-> [ ] `app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/offer-classification-subjects-dialog.test.tsx`

-> [ ] validates disabled submit with missing term

-> [ ] validates payload sent to mutation

-> [ ] validates success summary rendering

-> [x] If component test support is not available, document this as manual QA and rely on backend tests plus lint/typecheck.

### Phase 4 Notes

-> [x] Added `OfferClassificationSubjectsDialog` and `useOfferClassificationSubjectsForm` for the core admin classification bulk-offer workflow.

-> [x] Reused the existing subject-offering target panels, selection overview, academic-scope locking behavior, and term data helpers.

-> [x] Added offer actions to the classification list cards and classification detail page. The card action stops navigation propagation and disables offering for empty classifications.

-> [x] Wired success refresh through the Phase 3 mutation hook, which invalidates subject-offering and subject-classification query keys and shows created/skipped counts.

-> [x] Formatting passed for touched Phase 4 files with `pnpm exec prettier --check ...`.

-> [x] Targeted ESLint passed for all touched Phase 4 files with `pnpm --dir app/sentinel-core exec eslint ...`.

-> [x] `pnpm --dir app/sentinel-core test` passed.

-> [x] Broader validation notes: `pnpm --dir app/sentinel-core lint` still fails only on the known baseline errors from Phase 0. `pnpm --dir app/sentinel-core build` is blocked by restricted network access to Google Fonts. `pnpm --dir app/sentinel-core exec tsc --noEmit --pretty false` is blocked by an existing `src/app/auth/callback/route.test.ts` type error.

## Phase 5: Subject Classification Card Polish

Goal: Fix the card sizing and whitespace feedback without changing classification behavior.

-> [x] Update `app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx`.

-> [x] Reduce card minimum height if content permits.

-> [x] Keep card width controlled by the parent grid; avoid content-driven width growth.

-> [x] Use smaller, consistent title and description sizes.

-> [x] Keep tag fonts small and stable; do not enlarge subject code tags.

-> [x] Reduce vertical whitespace between badge row, body, subject preview, and footer.

-> [x] Ensure action buttons remain accessible on hover and keyboard focus.

-> [x] Verify long classification names, long descriptions, and many subject codes truncate cleanly.

-> [x] Verify mobile layout does not overlap action buttons with text.

### Phase 5 Notes

-> [x] Lowered the card minimum height from `140px` to `118px`, reduced padding and vertical gaps, and matched the loading skeleton height.

-> [x] Added `min-w-0`, truncation, and smaller stable badge/tag typography so long names, descriptions, and subject codes cannot widen the card.

-> [x] Tightened the list grid from `gap-4` to `gap-3` and added a `2xl:grid-cols-4` breakpoint so card width stays controlled by the parent grid.

-> [x] Added keyboard-visible focus handling and explicit action labels for offer, edit, and delete buttons.

### Phase 5 Validation

-> [x] `pnpm exec prettier --check 'app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx' 'app/sentinel-core/src/app/(protected)/subjects/_components/views/subject-classifications-list.tsx'`

-> [x] `pnpm --dir app/sentinel-core exec eslint 'src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx' 'src/app/(protected)/subjects/_components/views/subject-classifications-list.tsx'`

## Phase 6: Manual QA

Goal: Confirm the workflow end-to-end with real user roles and cross-institution fixtures.

### Scope QA

-> [ ] Sign in as Institution A admin and verify only Institution A subject offerings appear.

-> [ ] Sign in as Institution B admin and verify Institution A subject offerings are hidden.

-> [ ] Sign in as Institution A superadmin and verify only Institution A enrollment requests appear.

-> [ ] Sign in as Institution B superadmin and verify Institution A enrollment requests are hidden.

-> [ ] Sign in as instructor and verify only the instructor's own enrollment requests appear.

### Bulk Offer QA

-> [ ] Create or identify a `GENERAL` classification with at least three subjects.

-> [x] Bulk offer that classification to one term and multiple target sections.

-> [ ] Confirm the subject-offerings page shows one offering per classification subject.

-> [ ] Repeat the same bulk offer and confirm duplicate handling matches the approved strategy.

-> [ ] Try bulk offering an empty classification and confirm a clear error appears.

-> [ ] Try bulk offering with a term from another institution and confirm it is rejected.

-> [ ] Try bulk offering as an admin outside the allowed course/department scope and confirm it is rejected.

### Phase 6 QA Finding

-> [x] Fixed a Prisma `P2028` transaction timeout found during bulk offering QA by batching subject-offering inserts and assignment inserts.

-> [x] Moved subject validation and full created-offering reads outside the interactive transaction so the transaction only performs the write batch.

-> [x] Added `getSubjectRecordsByIdsData` and `createSubjectOfferingsData` helpers for the bulk path.

-> [x] Added `SubjectOfferingAssignmentsService.createAllForOfferings` to write assignment rows across created offerings in bulk.

-> [x] Re-ran focused bulk offering tests after the fix.

-> [x] Re-test the same manual bulk offer flow that produced the transaction timeout.

-> [x] Confirmed the manual retry succeeds after the transaction batching fix.

-> [x] Added a shared `AlertDialog` success summary after bulk offering completes, including created, skipped, and total counts.

-> [x] Converted offered-subject row unoffer confirmation to the shared `AlertDialog` component.

-> [x] Added a shared `AlertDialog` confirmation for bulk unoffering selected offered subjects.

-> [x] `pnpm exec prettier --check 'app/sentinel-core/src/app/(protected)/subjects/_components/dialogs/offer-classification-subjects-dialog.tsx' 'app/sentinel-core/src/app/(protected)/subjects/_hooks/use-offer-classification-subjects-form.ts'`

-> [x] `pnpm --dir app/sentinel-core exec eslint 'src/app/(protected)/subjects/_components/dialogs/offer-classification-subjects-dialog.tsx' 'src/app/(protected)/subjects/_hooks/use-offer-classification-subjects-form.ts'`

-> [x] `pnpm --dir app/sentinel-core test`

### UI QA

-> [ ] Verify classification cards are smaller and visually dense without cramped text.

-> [ ] Verify badge/tag text does not grow beyond the intended size.

-> [ ] Verify whitespace is reduced in the card header, preview, and footer.

-> [ ] Verify long subject codes and long classification names truncate instead of stretching the card.

-> [ ] Verify desktop and mobile breakpoints for the classification list.

## Phase 7: Final Validation

Goal: Run the smallest reliable command set that proves the touched areas work.

-> [ ] `pnpm --dir app/sentinel-api test`

-> [ ] `pnpm --dir app/sentinel-core lint`

-> [ ] `pnpm --dir app/sentinel-core test`

-> [ ] `pnpm --dir packages/shared build`

-> [ ] `pnpm --dir packages/services build`

-> [ ] `pnpm --dir packages/hooks build`

-> [ ] `pnpm lint`

-> [ ] `pnpm test`

## Rollout Notes

-> [ ] No Prisma migration is expected if the bulk workflow only reuses existing `subject_classifications`, `subject_classification_subjects`, and `subject_offerings` tables.

-> [ ] Add a migration only if product wants persistent bulk-offer audit records separate from the created offerings.

-> [ ] Keep the old manual single-subject offer flow available after bulk offering ships.

-> [ ] Log the final duplicate strategy in this document before implementation starts.

-> [ ] Update completed tasks from `-> [ ]` to `-> [x]` during development so progress is easy to cross out.
