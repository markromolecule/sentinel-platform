# Implementation Plan: Department Permissions, Hierarchical Filtering, and CRUD Notifications

## Pre-Planning

- **Summary of the Task:** Enforce permission gates for department bulk imports, restrict database queries for scoped admins/superadmins to their parent and branch institutions, restrict the institution selector dropdown list to hierarchical nodes, and ensure update and delete notifications trigger and propagate properly to all relevant administrators.
- **Source Files Scanned:**
    - `app/sentinel-api/src/modules/_shared/academic-scope/context.ts` (query scoping resolver)
    - `app/sentinel-api/src/modules/core/departments/controllers/create-bulk-departments.controller.ts` (import controller)
    - `app/sentinel-api/src/modules/core/institutions/controllers/get-institutions.controller.ts` (institutions list)
    - `app/sentinel-core/src/app/(protected)/departments/page.tsx` (frontend UI check)
    - `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts` (recipient roles helper)
- **Files, Services, and DB Tables touched:**
    - `context.ts` (scoping context service)
    - `create-bulk-departments.controller.ts` (API route controller)
    - `get-institutions.controller.ts` (API route controller)
    - `departments/page.tsx` (next.js UI page)
    - `activity-notification.service.ts` (notification service)
    - DB Tables: `rbac_permissions`, `notifications`, `user_roles`, `user_profiles`
- **Prisma Migration Needed:** No. The required permission (`departments:import`) and notification activity action types are already defined in seed files and existing database migrations.

---

## Phase 1: Granular Import Permission Gates

**Goal:** Secure the frontend and backend bulk-import actions by introducing and gating them with the `'departments:import'` permission.

- [ ] Update [create-bulk-departments.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/controllers/create-bulk-departments.controller.ts) to enforce `'departments:import'` instead of `'departments:create'`.
- [ ] Add active permission checks in [page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/%28protected%29/departments/page.tsx) using the `useActivePermissions` hook to hide or show the bulk-import dialog button.
- [ ] Write integration test cases in `create-bulk-departments.controller.test.ts` to assert that users without the `'departments:import'` permission receive a 403 Forbidden.
- **Migration required:** No. `'departments:import'` is populated via existing seed logic.

---

## Phase 2: Global Hierarchical Data Access Restrictions

**Goal:** Scopes all academic resource queries (departments, courses, semesters, sections, etc.) for non-global admins/superadmins to their assigned institution.

- [ ] Modify `resolveAcademicQueryScope` in [context.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/_shared/academic-scope/context.ts) to intercept queries from users who have a specific `requesterInstitutionId` assigned to their account, overwriting the requested scope with their assigned institution ID.
- [ ] Create unit tests in [context.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/_shared/academic-scope/context.test.ts) to verify that `resolveAcademicQueryScope` restricts both `admin` and `superadmin` to their assigned institution, while keeping `support` role queries globally scoped.
- **Migration required:** No. The database schema already connects user profiles to their institution via the `institution_id` column.

---

## Phase 3: Dropdown Institutional Scope Filtering

**Goal:** Restrict the institution filters and selection dropdowns to only show the assigned institution, parent node, and branch nodes for scoped users.

- [ ] Update [get-institutions.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/institutions/controllers/get-institutions.controller.ts) to dynamically extract the requester's hierarchy (parent ID, branch IDs, and assigned ID) and append an `.in` query restriction to the Kysely select builder.
- [ ] Write tests in `get-institutions.controller.test.ts` to verify that a scoped administrator is only able to see institutions corresponding to their authorized parent and branch nodes in the response payload.
- **Migration required:** No. The hierarchy properties (`parent_institution_id`) already exist on the `institutions` table.

---

## Phase 4: Multi-Module CRUD Activity Notification Enforcements

**Goal:** Standardize update, delete, and override notifications across all core modules and correct the recipient role mapping bottleneck.

- [ ] Modify `getRecipientRolesForActorRole` in [activity-notification.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts) to include `admin` and `superadmin` in the returned array when the actor is an `admin` or `superadmin` (i.e. `['support', 'superadmin', 'admin', 'instructor']`), allowing colleagues in the same institution to see edits.
- [ ] Verify that all core services (`departments.service.ts`, `courses.service.ts`, `semesters.service.ts`, `sections.service.ts`, `rooms.service.ts`) call `ActivityNotificationService.notifyGenericInstitutionActivity` on `CREATED`, `UPDATED`, and `DELETED` operations.
- [ ] Add unit tests in [activity-notification.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/notification/services/activity-notification.service.test.ts) to assert that updating/deleting departments generates notification records for administrators in the same hierarchy.
- **Migration required:** No. The notification table schema and action enums already contain `INSTITUTION_ACTIVITY_UPDATED` and `INSTITUTION_ACTIVITY_DELETED` types.

---

## Phase 5: Automated Verification & Test Coverage

**Goal:** Ensure absolute monorepo stability, compilation accuracy, and zero regressions across all workspaces.

- [ ] Run target test suite: `pnpm --dir app/sentinel-api test` to confirm all controllers, services, and utils pass cleanly.
- [ ] Execute `pnpm build` to compile the `sentinel-web`, `sentinel-core`, and `sentinel-api` workspaces to check for any TypeScript or structural errors.
- **Migration required:** No.

---

## Done Criteria

- Every task is mapped to a concrete controller, service file, or UI page path.
- Each of the 5 phases includes explicit testing tasks co-located as `*.test.ts`.
- The database migration requirement is explicitly detailed for each phase.
- No tasks use vague verbiage; precise functions are detailed throughout.

---

## Additional Considerations

### Breaking API Changes

- None. API signatures for GET `/institutions` and GET `/notifications` remain fully compatible.

### Environment Variables

- No new environment variables are introduced in this plan.
