# Execution Log: Department Permissions, Hierarchical Filtering, and CRUD Notifications

## Pre-Execution

- [x] Read and confirm the implementation plan at [feat-untracked-implementation-plan-department-permissions-and-hierarchical-filtering.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/task/2026-05-18/feat-untracked-implementation-plan-department-permissions-and-hierarchical-filtering.md)
- [x] Scan all files and modules listed in the plan to understand current state
- [x] Verify the Prisma schema if a migration is required (No migration needed)
- [x] Confirm all required environment variables exist in `.env` / `.env.example`
- [x] Check that the dev server and test runner are operational before proceeding

---

## Phase 1: Granular Import Permission Gates

**Goal:** Secure the frontend and backend bulk-import actions by introducing and gating them with the `'departments:import'` permission.

- [x] Update [create-bulk-departments.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/controllers/create-bulk-departments.controller.ts) to enforce `'departments:import'` instead of `'departments:create'`.
- [x] Add active permission checks in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/departments/page.tsx) using the `useActivePermissions` hook to hide or show the bulk-import dialog button.
- [x] Write integration test cases in `create-bulk-departments.controller.test.ts` (inside `route-access.test.ts`) to assert that users without the `'departments:import'` permission receive a 403 Forbidden.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 2: Global Hierarchical Data Access Restrictions

**Goal:** Scopes all academic resource queries (departments, courses, semesters, sections, etc.) for non-global admins/superadmins to their assigned institution.

- [x] Modify `resolveAcademicQueryScope` in [context.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/_shared/academic-scope/context.ts) to intercept queries from users who have a specific `requesterInstitutionId` assigned to their account, overwriting the requested scope with their assigned institution ID.
- [x] Create unit tests in [context.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/_shared/academic-scope/context.test.ts) to verify that `resolveAcademicQueryScope` restricts both `admin` and `superadmin` to their assigned institution, while keeping `support` role queries globally scoped.
- [x] Run `pnpm test` and confirm all tests pass.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 3: Dropdown Institutional Scope Filtering

**Goal:** Restrict the institution filters and selection dropdowns to only show the assigned institution, parent node, and branch nodes for scoped users.

- [x] Update [get-institutions.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/institutions/controllers/get-institutions.controller.ts) to dynamically extract the requester's hierarchy (parent ID, branch IDs, and assigned ID) and append an `.in` query restriction to the Kysely select builder.
- [x] Write tests in `get-institutions.controller.test.ts` (inside `route-access.test.ts`) to verify that a scoped administrator is only able to see institutions corresponding to their authorized parent and branch nodes in the response payload.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 4: Multi-Module CRUD Activity Notification Enforcements

**Goal:** Standardize update, delete, and override notifications across all core modules and correct the recipient role mapping bottleneck.

- [x] Modify `getRecipientRolesForActorRole` in [activity-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts) to include `admin` and `superadmin` in the returned array when the actor is an `admin` or `superadmin` (i.e. `['support', 'superadmin', 'admin', 'instructor']`), allowing colleagues in the same institution to see edits.
- [x] Verify that all core services (`departments.service.ts`, `courses.service.ts`, `semesters.service.ts`, `sections.service.ts`, `rooms.service.ts`) call `ActivityNotificationService.notifyGenericInstitutionActivity` on `CREATED`, `UPDATED`, and `DELETED` operations.
- [x] Add unit tests in [activity-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts) to assert that updating/deleting departments generates notification records for administrators in the same hierarchy.

**Migration applied:** No
**Breaking changes:** No

---

## Phase 5: Automated Verification & Test Coverage

**Goal:** Ensure absolute monorepo stability, compilation accuracy, and zero regressions across all workspaces.

- [x] Run target test suite: `pnpm --dir app/sentinel-api test` to confirm all controllers, services, and utils pass cleanly.
- [x] Execute `pnpm build` to compile the `sentinel-web`, `sentinel-core`, and `sentinel-api` workspaces to check for any TypeScript or structural errors.

**Migration applied:** No
**Breaking changes:** No
