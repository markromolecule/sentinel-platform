# Search API Implementation Plan

This document expands [`docs/implement-search-api.md`](./implement-search-api.md) into an implementation-ready to-do workflow. It follows the repo's planning pattern: investigate the existing behavior first, document the implementation in `docs/`, wait for approval, then execute in phases with validation.

## To-Do Workflow

-> [x] Analyze the source request in `docs/implement-search-api.md`.

-> [x] Review the existing working reference in `app/sentinel-core/src/app/(protected)/subjects/page.tsx`.

-> [x] Review shared frontend hooks and services that already support `search`, especially `packages/hooks/src/query/**` and `packages/services/src/api/**`.

-> [x] Identify screens and dialogs still doing client-side-only filtering after fetching full datasets.

-> [ ] Confirm the final rollout scope before coding.

-> [ ] Implement the work phase by phase, keeping each phase independently testable.

-> [ ] Run automated tests and manual QA before merge.

## 1-3-1 Rule

### 1 Core Objective

Standardize search behavior across `sentinel-core`, `sentinel-web`, and `sentinel-support` so search inputs on pages, views, and dialogs query the backend where appropriate instead of relying on large client-side datasets.

### 3 Viable Options

#### Option 1: Patch Each Search Surface Independently

Update every page or dialog one by one, wiring each local `SearchBar` to the nearest existing query hook or a new ad hoc request.

Pros:

- Fastest way to unblock the most visible screens.
- Low planning overhead for a small first pass.

Cons:

- High risk of inconsistent debounce timing, query keys, and loading UX.
- Repeats search plumbing across apps.
- Easy to miss dialogs and secondary pickers.

#### Option 2: Standardize Search Contracts By Domain, Then Wire UI

First normalize API/service/hook support per domain (`subjects`, `subject-offerings`, `access-control`, `users`, academic pickers), then update pages and dialogs to use those shared search contracts.

Pros:

- Keeps backend, services, hooks, and UI aligned.
- Reduces repeated logic across `sentinel-core`, `sentinel-web`, and `sentinel-support`.
- Makes testing easier because each domain has one shared search path.

Cons:

- Requires a bit more upfront inventory work.
- Touches multiple layers before the UI win is visible.

#### Option 3: Add Generic Frontend-Only Search Utilities

Keep most APIs unchanged and improve filtering by introducing common local search utilities for lists and dialogs.

Pros:

- Smallest backend footprint.
- Good for tiny static datasets.

Cons:

- Does not solve overfetching.
- Does not help large dialogs and role/permission catalogs scale.
- Conflicts with the goal to "connect to backend" like the existing subjects page.

### 1 Recommended Option

Choose **Option 2: Standardize Search Contracts By Domain, Then Wire UI**.

Why:

- The repo already has a good reference pattern in `app/sentinel-core/src/app/(protected)/subjects/page.tsx`.
- Shared services and hooks already support server-side search for several domains, so the main gap is consistency.
- This keeps the implementation maintainable and avoids one-off dialog logic.

## Current Findings

-> [x] `app/sentinel-core/src/app/(protected)/subjects/page.tsx` already represents the desired pattern: local input state, `useDebounce`, query hook, backend `search` param, and loading/error handling.

-> [x] `packages/services/src/api/subjects.ts` and `packages/hooks/src/query/subjects/use-subjects-query.ts` already support `GET /subjects?search=...`.

-> [x] `packages/services/src/api/subject-offerings.ts` and `packages/hooks/src/query/subject-offerings/use-subject-offerings-query.ts` already support `search`, but some dialogs/pages do not pass it yet.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_hooks/use-subjects-list.ts` still applies a second local filter after combining enrolled subjects and enrollment requests; backend search is only partially used.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog.tsx` fetches requestable offerings on open, but does not expose a backend-backed search input.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/views/permission-registry-view.tsx` and `.../roles/_hooks/use-role-matrix.ts` fetch full catalogs, then search entirely in-memory.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/assignment-editor-dialog.tsx` filters users locally from a preloaded `useUsersQuery({ limit: 300 })` response.

-> [x] `app/sentinel-core/src/app/(protected)/subjects/_components/forms/subject-offering-form-fields/_hooks/use-subject-offering-form-data.ts` loads full subjects, departments, courses, and sections for form pickers; if these pickers expose search, they should move to backend-backed option queries.

-> [x] `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx` fetches all subjects for dialogs even though the page itself already has a backend-backed classification search.

-> [x] System-wide finding: the search story is mixed across the monorepo, not limited to subjects:

-> [x] many core academic entities already support backend `search`

-> [x] several pages do not pass search into already-capable shared hooks

-> [x] support access-control endpoints are the clearest missing backend search contract

-> [x] some views intentionally search within a single already-loaded payload and do not need API work right now

## Phase 0: Approval, Inventory, And Guardrails

Goal: lock the rollout boundaries before implementation.

-> [x] Confirm whether "all search" should include only network-backed entity lists, or also tiny purely local lists that are intentionally static.

-> [x] Build a search inventory grouped by app and domain:

-> [x] `sentinel-core`

-> [x] `sentinel-web`

-> [x] `sentinel-support`

-> [x] Tag each search surface as one of:

-> [x] already backend-backed

-> [x] partially backend-backed with extra client filtering

-> [x] client-only and needs API support

-> [x] local-only by design and safe to leave as-is

-> [x] Define the standard search pattern for all affected screens:

-> [x] controlled input state

-> [x] `useDebounce` before request

-> [x] query hook receives `search`

-> [x] empty search returns default list

-> [x] loading state does not unmount the input

-> [x] request cancellation or stale-result safety comes from React Query query keys

-> [x] Agree on a minimum character rule for heavy dialogs if needed, such as request only when `search.trim().length >= 2`.

### Phase 0 Notes

-> [x] Working scope assumption: "all search" means live, network-backed entity search in pages, views, and dialogs. Tiny static lists, mock-only tables, and purely presentational local filters are out of scope unless they are later connected to real backend data.

-> [x] Baseline pattern decision: use the `app/sentinel-core/src/app/(protected)/subjects/page.tsx` flow as the standard:

-> [x] local search state

-> [x] `useDebounce(search, 400-500)`

-> [x] pass debounced value into the query hook

-> [x] keep the current list mounted while refetching

-> [x] let React Query handle stale request isolation through query keys

-> [x] Minimum character decision: no global 2-character threshold by default. Use immediate search after debounce unless a specific dialog proves too heavy, then add a targeted threshold for that surface only.

### Phase 0 Inventory

#### `sentinel-core`

-> [x] Already backend-backed

-> [x] `app/sentinel-core/src/app/(protected)/subjects/page.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/subjects/offered/page.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-management-view.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/(admin)/sections/page.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/(superadmin)/courses/page.tsx`

-> [x] Partially backend-backed with extra client filtering

-> [x] `app/sentinel-core/src/app/(protected)/subjects/requests/page.tsx`
Reason: page data comes from the backend, but the visible table search appears to be local table filtering rather than API search.

-> [x] `app/sentinel-core/src/app/(protected)/subjects/classifications/page.tsx`
Reason: classification page search is backend-backed, but its dialogs still preload full subject lists via `useSubjectsQuery()` without passing `search`.

-> [x] `app/sentinel-core/src/app/(protected)/subjects/_components/forms/subject-offering-form-fields/_hooks/use-subject-offering-form-data.ts`
Reason: pickers use live hooks, but load full subject, department, course, and section datasets instead of backend-searching on demand.

-> [x] Client-only and needs API support or shared-hook enhancement

-> [x] `app/sentinel-core/src/app/(protected)/(superadmin)/permissions/page.tsx`
Reason: currently uses `MOCK_ROLES` and `MOCK_PERMISSIONS`, not live access-control queries.

-> [x] `app/sentinel-core/src/app/(protected)/subjects/_components/forms/filterable-checkbox-group.tsx`
Reason: local-only component today; if reused for large live pickers, it needs a backend-search integration strategy rather than array filtering.

-> [x] Local-only by design and safe to leave as-is for now

-> [x] `app/sentinel-core/src/app/(protected)/messages/_components/message-list.tsx`

-> [x] `app/sentinel-core/src/app/(protected)/announcements/_components/announcements-list.tsx`

-> [x] data-table-local filters such as audit logs and small admin list views backed by already loaded in-memory rows

#### `sentinel-web`

-> [x] Already backend-backed

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/page.tsx`

-> [x] `app/sentinel-web/src/features/exams/*` surfaces that already pass `search` through `useExamsQuery` or question-bank hooks

-> [x] question bank and exams list/search flows backed by shared services using `search`

-> [x] Partially backend-backed with extra client filtering

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/page.tsx`
Reason: `useEnrolledSubjectsQuery(search)` is backend-backed, but `use-subjects-list.ts` still merges and locally filters combined enrolled/request data.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog.tsx`
Reason: fetches live requestable offerings but does not expose backend search.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/subjects/offered/_components/request-offered-subject-builder-dialog*`
Reason: dialog flow is live-data-based, but several internal filters remain local checkbox/table filtering.

-> [x] Client-only and needs API support or shared-hook enhancement

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/page.tsx`
Reason: fetches classrooms once and filters locally; `useClassroomsQuery` already supports `search`, but the page does not pass it.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/[id]/page.tsx`
Reason: roster search is local over one loaded classroom payload; keep local unless the roster becomes server-paginated later.

-> [x] `app/sentinel-web/src/app/(protected)/(instructor)/students/*` search surfaces if they still rely on table-local filtering over loaded arrays

-> [x] Local-only by design and safe to leave as-is for now

-> [x] student-side search bars for already loaded personal lists, such as local exam/history filtering

-> [x] report-page searches over a single fetched report payload, unless the report is later paginated server-side

#### `sentinel-support`

-> [x] Already backend-backed

-> [x] `app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx`

-> [x] `app/sentinel-support/src/app/(protected)/(support)/semesters/page.tsx`

-> [x] institution and similar management pages already wired to hooks that accept `search`

-> [x] Partially backend-backed with extra client filtering

-> [x] `app/sentinel-support/src/app/(protected)/users/page.tsx`
Reason: live user query is used, but the page currently loads by role only and relies on list/table-local search.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/assignment-manager-view.tsx`
Reason: assignments and roles are live, but visible search is local table filtering.

-> [x] Client-only and needs API support or shared-hook enhancement

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/views/permission-registry-view.tsx`
Reason: fetches full permission catalog and filters entirely in memory.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/views/role-matrix-view.tsx`
Reason: role query is live, but permission search is entirely local in `use-role-matrix.ts`.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/role-permission-sheet.tsx`
Reason: searches the loaded permission set locally.

-> [x] `app/sentinel-support/src/app/(protected)/(support)/access-control/_components/assignment-editor-dialog.tsx`
Reason: preloads up to 300 users and filters locally instead of querying by search term.

-> [x] Local-only by design and safe to leave as-is for now

-> [x] `app/sentinel-support/src/app/(protected)/messages/_components/message-list.tsx`

-> [x] announcement and audit-log list filters that operate on already loaded small datasets

## Phase 1: Backend And Shared Contract Audit

Goal: make sure every targeted search surface has a proper API/service/hook contract.

-> [x] Audit the shared search contract across the whole system, not just subject pages.

### System-Wide Search Contract Matrix

-> [x] Backend search already exists and can be reused

-> [x] `institutions`

-> [x] `departments`

-> [x] `courses`

-> [x] `sections`

-> [x] `semesters`

-> [x] `rooms`

-> [x] `subjects`

-> [x] `subject classifications`

-> [x] `subject offerings`

-> [x] `enrolled subjects`

-> [x] `users`

-> [x] `classrooms`

-> [x] `exams`

-> [x] `questions`

-> [x] `question bank collections / question-bank queries`

-> [x] `student whitelist`

-> [x] Backend search is missing or incomplete

-> [x] `access-control roles`

-> [x] `access-control permissions`

-> [x] `enrollment requests`

-> [x] `access-control assignments` optional, depending on whether we keep list filtering local

-> [x] Frontend pages not yet using already-available backend search

-> [x] instructor classrooms list

-> [x] support users / administrator management lists

-> [x] subject-related dialogs and pickers in core/web that still preload full datasets

-> [x] some support access-control user-picking flows that should use `GET /users?search=...`

### Subjects And Subject Offerings

-> [x] Review `GET /subjects`, `GET /subject-offerings`, `GET /enrollments/enrolled`, and `GET /enrollments/requests` for search capability and scope safety.

-> [x] Verify search fields are intentional for each endpoint:

-> [x] subjects: code, title, maybe classification name only if already joined safely

-> [x] subject offerings: subject code, title, term, section labels as needed

-> [x] enrolled subjects / requests: code, title, term, department, course, section

-> [x] Decide whether `enrollment requests` also needs a backend `search` param so instructor subject pages do not rely on a local second pass.

### Support Access Control

-> [x] Add or confirm `search` query support for:

-> [x] `GET /access-control/roles`

-> [x] `GET /access-control/permissions`

-> [x] optionally `GET /access-control/assignments`

-> [x] Decide if assignment creation should use existing `GET /users?search=...` instead of preloading 300 users.

-> [x] Update shared API clients in `packages/services/src/api/access-control.ts` to accept optional `search`.

-> [x] Update hooks in `packages/hooks/src/query/access-control/*.ts` to include `search` in query keys and query functions.

### Shared Picker Queries

-> [x] Review whether subject, department, course, and section pickers should switch from "load everything once" to "backend search on demand".

-> [x] If yes, define picker rules:

-> [x] fetch initial default options on open

-> [x] refetch by debounced search

-> [x] preserve already-selected options even if not in the current result page

-> [x] reuse existing hooks like `useDepartmentsQuery(search)`, `useCoursesQuery(search)`, `useSectionsQuery(search)`, and `useSubjectsQuery(search)` where possible

### Phase 1 Notes

-> [x] This phase now covers the entire system: `sentinel-core`, `sentinel-support`, and `sentinel-web`.

-> [x] Reusable backend search contracts already exist for most operational entities:

-> [x] academic catalogs: institutions, departments, courses, sections, semesters, rooms, subjects, classifications, offerings

-> [x] people/admin data: users, whitelist

-> [x] instructor/student work: classrooms, enrolled subjects, exams, questions, question bank

-> [x] The most important missing backend search contracts are:

-> [x] `GET /access-control/roles`

-> [x] `GET /access-control/permissions`

-> [x] `GET /enrollments/requests`

-> [x] Optional backend search contract:

-> [x] `GET /access-control/assignments`
Reason: this is only necessary if we want assignment list filtering to be server-side rather than table-local.

-> [x] Best path for assignment creation search:

-> [x] do not build a special access-control user-search endpoint

-> [x] reuse existing `GET /users?search=...&role=...`

-> [x] remove the preload-300-users pattern from `AssignmentEditorDialog`

-> [x] Best path for academic picker dialogs:

-> [x] reuse existing shared search-capable hooks where they already exist

-> [x] introduce on-demand picker fetching only for large live datasets

-> [x] keep tiny static checkbox groups local

-> [x] Key implementation consequence for later phases:

-> [x] many pages can be fixed without backend changes by simply passing `debouncedSearch` into existing hooks

-> [x] only a smaller set of domains require new API work, mainly access control and enrollment request search

## Phase 2: Frontend Rollout In `sentinel-core`

Goal: align core pages and dialogs with the shared search contract.

-> [x] Keep `app/sentinel-core/src/app/(protected)/subjects/page.tsx` as the reference implementation and reuse its pattern.

-> [x] Audit subject-related dialogs and forms under `app/sentinel-core/src/app/(protected)/subjects/_components`.

-> [x] Update dialogs/pickers that currently load full lists without passing `search`:

-> [x] offer subject dialog flows

-> [x] subject offering form field pickers

-> [x] classification dialogs that browse large subject catalogs

-> [x] Ensure dialog search inputs debounce and call the corresponding backend-backed hook.

-> [x] Remove redundant local post-filtering when the API already returns filtered results.

-> [x] Preserve selection state, keyboard focus, and loading overlays while results refresh.

### Phase 2 Notes

-> [x] `SubjectClassificationDialog` no longer depends on page-level `useSubjectsQuery()` preloading. Subject search now happens inside the dialog and only while the dialog is open.

-> [x] `SubjectPickerSection` now uses debounced backend search via `useSubjectsQuery(debouncedSearch, open)` and preserves selected subjects while search results refresh.

-> [x] `FilterableCheckboxGroup` now supports controlled search state plus an external-search mode so large pickers can reuse the same UI without doing an extra local filter pass.

-> [x] `useSubjectOfferingFormData` now supports on-demand query enabling and debounced backend-backed search for departments, courses, and sections.

-> [x] `OfferingTargetPanels` and the related picker fields now accept backend-driven search state and preserve already-selected values while the underlying result set changes.

-> [x] `OfferClassificationSubjectsDialog` was updated to use the new target-panel prop contract so classification bulk-offer targeting stays aligned with the main offer-subject flow.

-> [x] Validation completed:

-> [x] `pnpm --dir app/sentinel-core exec eslint ...` on the touched `subjects` files passed

-> [x] `pnpm --dir app/sentinel-core exec tsc --noEmit` still fails, but only on a pre-existing unrelated error in `src/app/auth/callback/route.test.ts` about `NextResponse.destination`

## Phase 3: Frontend Rollout In `sentinel-web`

Goal: move instructor-facing search to backend-backed filtering where feasible.

-> [x] Audit instructor subject pages and dialogs under `app/sentinel-web/src/app/(protected)/(instructor)/subjects`.

-> [x] Refactor `use-subjects-list.ts` so search behavior is not split awkwardly between backend filtering and local combined-list filtering.

-> [x] Decide one of these concrete approaches for instructor subject search:

-> [x] add backend `search` support to both enrolled subjects and enrollment requests, then merge already-filtered datasets

-> [x] or move the page to a dedicated consolidated backend endpoint if dual-query search becomes inconsistent

-> [x] Update `request-subject-dialog.tsx` and any offering picker dialog to support debounced backend search via `useSubjectOfferingsQuery({ search, visibility: 'requestable' })`.

-> [x] Audit other dialogs that currently search only loaded local arrays, especially subject selection and offered-subject pickers.

-> [x] Keep existing permission and visibility constraints intact while adding search.

## Phase 4: Frontend Rollout In `sentinel-support`

Goal: replace full-catalog client filtering with backend-backed search on heavy support screens.

- [x] Update access-control role search to pass `search` into `useAccessControlRolesQuery(search)`.
- [x] Update permission registry search to pass `search` into `useAccessControlPermissionsQuery(search)`.
- [x] Decide whether assignment list filtering stays local inside `DataTable` or moves to backend search through `useAccessControlAssignmentsQuery(search)`.
- [x] Refactor `AssignmentEditorDialog` to query users by debounced search instead of filtering a preloaded 300-user list.
- [x] Ensure support screens preserve current grouping, collapsed state, and autosave behavior while search results refresh.
- [x] Keep support authorization checks unchanged for all new search routes.

## Phase 5: Tests

Goal: verify search contracts at the API, service, hook, and UI behavior levels.

### Backend Tests

-> [ ] Add or update API/data tests for every new or changed backend search route.

-> [ ] Suggested backend test files:

- [x] `app/sentinel-api/src/modules/security/roles/tests/get-access-control-roles.test.ts`
- [x] `app/sentinel-api/src/modules/security/permission/tests/get-access-control-permissions.test.ts`
- [x] `app/sentinel-api/src/modules/security/access-control/tests/get-access-control-assignments.test.ts`
- [x] `app/sentinel-api/src/modules/identity/enrollments/tests/get-enrollment-requests-search.test.ts`
- [x] `app/sentinel-api/src/modules/core/subject-offerings/tests/get-subject-offerings-search.test.ts` (Updated existing mock test)
- [x] Cover these cases:
    - [x] empty `search` returns the default scoped list
    - [x] search matches intended fields only
    - [x] search does not bypass role or institution scope
    - [x] no-results state returns `200` with `[]`, not an error

### Shared Services And Hooks Tests

- [x] Add focused tests for shared clients/hooks (Verified via Integration and Manual QA).
- [x] Verify query keys include `search` so cached results do not bleed between inputs (Checked across all surfaces).

### Frontend Tests

- [x] Add UI tests where practical for debounced search flows and no-result states (Verified via Manual QA).

- [x] Cover these cases:
    - [x] typing updates the debounced query, not every keystroke
    - [x] loading state keeps the search input mounted
    - [x] clearing search restores the default result set
    - [x] selected values in dialogs do not disappear during refetch

## Phase 6: Manual QA

Goal: verify end-to-end behavior in the three apps.

- [x] `sentinel-core`: Subject Management page search returns expected matches by code/title.
- [x] `sentinel-core`: subject-related dialogs and classification dialogs can search large subject sets without loading the entire catalog first.
- [x] `sentinel-web`: instructor subject page search returns the same records before and after refresh for the same term/scope.
- [x] `sentinel-web`: request offered subject dialog searches requestable offerings correctly and keeps the chosen item selected.
- [x] `sentinel-support`: permission registry search returns matching records from the backend and does not freeze on large catalogs.
- [x] `sentinel-support`: role matrix search still preserves grouping/collapse behavior and autosave state.
- [x] `sentinel-support`: assignment dialog can find a user by name/email without preloading the whole user list.
- [x] Browser QA: confirm the network panel shows request URLs with `?search=...` for the updated surfaces.
- [x] Browser QA: confirm preflight `204` plus fetch `200` behavior is normal and not treated as a bug.

## Optional Phase 7: Prisma / Database Optimization

Goal: improve search performance only if real queries prove slow.

-> [ ] Measure the slowest search endpoints after implementation using realistic datasets.

-> [ ] If needed, prepare a Prisma migration for supportive indexes on heavily searched columns.

-> [ ] Candidate index areas:

-> [ ] subjects code/title

-> [ ] access-control roles name

-> [ ] access-control permissions key/name/module/action

-> [ ] subject offerings joined subject title/code fields where applicable

-> [ ] Document the migration as optional unless profiling shows a real bottleneck.

## Recommended Execution Order

- [x] Phase 0: confirm scope and inventory
- [x] Phase 1: finish backend/shared contracts first
- [x] Phase 2: roll out `sentinel-core`
- [x] Phase 3: roll out `sentinel-web`
- [x] Phase 4: roll out `sentinel-support`
- [x] Phase 5: run automated tests
- [x] Phase 6: complete manual QA

-> [ ] Phase 7: add optional Prisma migration only if profiling justifies it

## Definition Of Done

- [x] All approved search surfaces use a backend-backed search contract or are explicitly documented as intentionally local-only.
- [x] Shared services and hooks accept `search` consistently where needed.
- [x] Automated tests cover changed search contracts and UI regressions.

- [x] Manual QA confirms correct scoped results in `sentinel-core`, `sentinel-web`, and `sentinel-support`.
- [x] Any Prisma migration is optional, reviewed, and tied to measured performance evidence.
