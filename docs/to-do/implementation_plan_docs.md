# Subject Classification Access Implementation Plan

This document analyzes [identify-subject-classification.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/identify-subject-classification.md) and converts it into an implementation-ready to-do plan. It follows the `1-3-1` rule and the `.agents/workflows/to-do-workflow.md` requirement to investigate and document first without starting code changes.

## 1-3-1 Rule

### 1 Goal

- [ ] Restore `subject classification` fetch and CRUD behavior for `support`, `superadmin`, and `admin`, and ensure parent-institution classifications are inherited correctly by branch institutions.

### 3 Viable Options

#### Option 1: Route And Permission Patch Only

- [ ] Audit only the currently failing API route registrations, permission guards, and frontend service paths for subject classification.
- [ ] Fix any mismatched paths such as `/subjects/classifications`, missing query propagation like `institutionId`, and missing permission checks for non-student roles.
- [ ] Validate support, superadmin, and admin access against the existing implementation without changing inheritance behavior deeply.

Why this is viable:

- [ ] Lowest implementation cost.
- [ ] Fastest path if the 404 is caused by route mismatch, wrong base path, or missing permission wiring.

Risks:

- [ ] May fix the 404 while leaving branch inheritance inconsistent.
- [ ] May preserve duplicated institution-scoping logic across controllers and services.

#### Option 2: Service-Centered Scope And Inheritance Hardening

- [ ] Audit the full subject-classification flow across API routes, services, data access, hooks, and both `sentinel-core` and `sentinel-support`.
- [ ] Centralize institution-scope resolution in the backend so `support`, `superadmin`, and `admin` all resolve allowed institution context consistently.
- [ ] Add explicit inheritance handling so classifications created on a parent institution are included in branch reads and remain safe for CRUD rules.
- [ ] Add regression tests at controller, service, and hook level before rollout.

Why this is viable:

- [ ] Addresses both reported symptoms: `404` failures and missing inherited data.
- [ ] Keeps business rules in the backend instead of scattering role logic across clients.
- [ ] Safer for future maintenance because access and inheritance rules become testable in one place.

Risks:

- [ ] Higher effort than a direct patch.
- [ ] Requires careful testing around institution hierarchy and role scope.

#### Option 3: Full Subject-Management Access Refactor

- [ ] Refactor subject classification, subjects, courses, and related institution-scope modules into a shared access-control pattern.
- [ ] Rework support/core clients to consume a unified subject-management API contract.
- [ ] Revisit permission naming, inheritance contracts, and admin branching rules as one larger platform change.

Why this is viable:

- [ ] Best long-term architectural cleanup.
- [ ] Reduces the chance of repeating the same scope bug in adjacent modules.

Risks:

- [ ] Too large for the issue described.
- [ ] Higher regression risk and slower delivery for a targeted production bug.

### 1 Best Option

- [ ] Choose **Option 2: Service-Centered Scope And Inheritance Hardening**.

Why this is the best option:

- [ ] The issue is not just a missing page or broken button; it spans fetch, CRUD, and inherited visibility.
- [ ] The API already mounts subject-classification routes at `/subjects/classifications` in [app.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts:129), so the remaining risk is likely in role scope, controller behavior, client usage, or inheritance queries rather than route absence alone.
- [ ] A backend-first fix gives one place to enforce `support`, `superadmin`, `admin`, parent institution, and branch institution behavior.
- [ ] It is narrow enough to ship safely and broad enough to prevent a partial fix.

Recommended next step:

- [ ] Start with backend route, controller, service, and data-flow validation for `GET`, `POST`, `PUT`, and `DELETE` before touching UI behavior.

## Current Findings From Initial Analysis

- [ ] The feature brief says `support`, `superadmin`, and `admin` cannot fetch subject classifications and CRUD returns `404`.
- [ ] The API currently mounts the module at `/subjects/classifications`, which suggests the 404 may come from downstream route usage, request context, permission failure handling, or workspace-specific client integration rather than the root app route itself.
- [ ] The list controller already has role-based institution resolution in [get-subject-classifications.controller.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/controllers/get-subject-classifications.controller.ts:31), but the rest of the CRUD handlers still need validation for the same behavior.
- [ ] The service client in [subject-classifications.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subject-classifications.ts:44) targets `/subjects/classifications`, so the failure may be limited to certain app flows, request parameters, or role-scoped backend behavior.
- [ ] Branch inheritance is explicitly required by the issue brief, so the plan must verify whether the data layer already supports parent-to-branch lookup or if a new lookup strategy is needed.

## Implementation To-Do

### Phase 0: Investigation Baseline

- [x] Trace the full request flow for subject classification in:
      [app.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts:129),
      [subject-classification.routes.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.routes.ts:1),
      [subject-classifications.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subject-classifications.ts:1),
      [use-subject-classifications-query.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/subjects/use-subject-classifications-query.ts:1).
- [x] Confirm which workspace surfaces are failing:
  `sentinel-support`, `sentinel-core`, or both.
- [x] Reproduce the `404` for each operation:
  list, detail, create, update, delete.
- [x] Record whether the failure occurs at network level, Hono route level, controller validation level, or permission gate level.
- [x] Verify whether support requests pass `institutionId` when needed and whether admin/superadmin requests rely on server-side `institutionId` resolution.

### Phase 1: Root Cause Isolation

- [x] Audit all subject-classification controllers for role handling consistency:
  `get`, `get by id`, `create`, `update`, `delete`.
- [x] Review `SubjectClassificationService` and data helpers to confirm whether institution scope is enforced uniformly for all CRUD operations.
- [x] Check whether branch institutions should read:
  only local classifications,
  only inherited parent classifications,
  or a merged result set.
- [x] Validate whether parent and branch linkage is already represented in the institution model and reusable by subject classification queries.
- [x] Inspect support/core pages and hooks to confirm they call the same service methods and do not append incorrect path segments or omit required params.

### Phase 2: Backend Fix Plan

- [x] Normalize institution-scope resolution in the subject-classification backend so all handlers use one shared strategy.
- [ ] If needed, create a helper that resolves:
  requester role,
  active institution,
  parent institution,
  allowed CRUD scope,
  inherited read scope.
- [x] Update list and detail queries so branch institutions can read inherited parent classifications according to the product rule.
- [x] Define the CRUD rule clearly:
  support can CRUD for the active institution context,
  superadmin can CRUD within their institution scope,
  admin can CRUD within their institution scope,
  inherited parent records may be read-only for branches unless product rules explicitly allow editing.
- [x] Ensure 404 is only returned for truly missing resources, not for scope mismatches or malformed request flow where a `403` or `400` is more correct.
- [x] Review whether Prisma query changes are required for inheritance joins or unioned parent-and-branch reads.

### Phase 3: Frontend And Client Alignment

- [x] Verify `packages/services` subject-classification API helpers match the backend contract exactly.
- [x] Verify `packages/hooks` query and mutation hooks propagate any required `institutionId` or role-scoped parameters.
- [x] Review `sentinel-core` subject classification pages and dialogs for admin/superadmin behavior.
- [x] Review `sentinel-support` subject classification pages and dialogs for support behavior.
- [x] Normalize empty-state and error-state handling so permission and not-found states are distinguishable during QA.

### Phase 4: Testing

- [x] Add or extend Vitest coverage for backend service logic in:
  [subject-classification.service.test.ts](/Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.test.ts:1).
- [x] Create focused backend tests for controller or data-layer behavior covering:
  support list access,
  superadmin list access,
  admin list access,
  inherited branch reads,
  forbidden cross-institution access,
  create/update/delete behavior by role.
- [ ] Add hook-level tests in `packages/hooks` if role-scoped query composition changes.
- [ ] Add service-client tests in `packages/services` if endpoint or parameter behavior changes.
- [x] Run targeted Vitest validation for touched modules before implementation is considered complete.

### Phase 5: Database Review

- [x] Check whether the existing Prisma schema already contains everything required for parent-to-branch inheritance.
- [ ] Create a Prisma migration only if the current institution or subject-classification schema cannot express the required inheritance lookup.
- [x] If no schema change is needed, document that the fix is query and access-layer only.

### Phase 6: QA And Rollout

- [ ] Validate manual CRUD flows for `support`, `superadmin`, and `admin`.
- [ ] Validate branch inheritance using a parent institution with at least one branch and one shared subject classification.
- [ ] Confirm that unauthorized institutions cannot view or mutate foreign classifications.
- [ ] Confirm the API no longer returns misleading `404` responses for valid scoped requests.
- [x] Update the checklist in this file during implementation as work completes.

## Expected File Targets

- [ ] Backend routes and controllers:
      `app/sentinel-api/src/modules/core/subject-classification/**`
- [ ] Shared API client:
      `packages/services/src/api/subject-classifications.ts`
- [ ] Shared hooks:
      `packages/hooks/src/query/subjects/**`
- [ ] Core UI:
      `app/sentinel-core/src/app/(protected)/subjects/**`
- [ ] Support UI:
      `app/sentinel-support/src/app/(protected)/(support)/subjects/classifications/**`
- [ ] Optional Prisma work:
      `packages/db/prisma/schema.prisma` and `packages/db/prisma/migrations/**`

## Notes

- [x] Do not start implementation until this investigation plan is approved for execution.
- [ ] Add relevant code comments only where scope or inheritance behavior is not obvious from the code.
- [ ] Prefer targeted tests over broad integration changes so the regression surface stays controlled.
