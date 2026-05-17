# Implementation Plan: Centralized Administrator Module

## Pre-Planning Checklist

- [x] Read and summarize the task input in one sentence: unify the `admin` and `superadmin` management experience in `sentinel-core` so both roles use the same pages and the UI/actions are controlled by active permissions instead of duplicated route trees.
- [x] Scan relevant source files to understand existing patterns:
      `app/sentinel-core/src/app/(protected)/layout.tsx`,
      `app/sentinel-core/src/components/sidebar/admin/constants/index.ts`,
      `app/sentinel-core/src/components/sidebar/superadmin/constants/index.ts`,
      `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx`,
      `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.tsx`,
      `app/sentinel-core/src/app/(protected)/(superadmin)/permissions/page.tsx`,
      `app/sentinel-core/src/app/(protected)/(superadmin)/departments/page.tsx`,
      `app/sentinel-core/src/app/(protected)/(superadmin)/institutions/page.tsx`,
      `app/sentinel-core/src/hooks/use-user.ts`,
      `app/sentinel-core/src/hooks/use-academic-scope.ts`,
      `packages/hooks/src/use-active-permissions.ts`,
      `packages/hooks/src/query/access-control/*`,
      `packages/hooks/src/query/users/use-users-query.ts`,
      `packages/services/src/api/access-control.ts`,
      `app/sentinel-api/src/modules/core/departments/departments.routes.ts`,
      `app/sentinel-api/src/modules/core/institutions/institution.routes.ts`,
      `app/sentinel-api/src/modules/core/semesters/semesters.routes.ts`,
      `app/sentinel-api/src/modules/identity/users/controllers/get-users.controller.ts`,
      `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`.
- [x] Identify all files, services, and DB tables the task will touch:
      frontend route/layout files in `app/sentinel-core/src/app/(protected)/(admin)` and `app/sentinel-core/src/app/(protected)/(superadmin)`;
      sidebar configs in `app/sentinel-core/src/components/sidebar/*`;
      shared permission hooks in `app/sentinel-core/src/hooks` and `packages/hooks/src`;
      access-control/user query services in `packages/services/src/api`;
      API route guards and controller tests in `app/sentinel-api/src/modules/core/*` and `app/sentinel-api/src/modules/security/*`;
      RBAC tables `roles`, `rbac_permissions`, `rbac_role_permissions`, `rbac_user_permission_overrides`, `user_roles`;
      scope-bearing tables `user_profiles`, `institutions`, `departments`, and `semesters`.
- [x] Determine if a Prisma migration is needed: No. The RBAC schema already exists; this feature is primarily a route, authorization, and UI consolidation effort.

---

## 1-3-1 Architectural Decision

### Viable Option 1: Shared feature modules with legacy route aliases and permission-driven rendering

- Create shared administration page modules in `sentinel-core` and have both `(admin)` and `(superadmin)` routes render the same page components.
- Keep current URLs such as `/users`, `/administrators`, `/permissions`, `/institutions`, and `/semesters` working during the transition.
- Drive sidebar visibility, page availability, empty states, and action buttons from `useActivePermissions()` plus the current user scope.
- Pros: lowest-risk rollout, preserves bookmarks and navigation, and removes duplicated page logic without a broad route migration.
- Cons: requires a temporary alias layer while both old route groups exist.

### Viable Option 2: Replace both route groups with a single new `/administration/*` tree

- Move all centralized admin pages into a new canonical route group and redirect old admin/superadmin URLs to the new tree.
- Pros: cleaner final route model.
- Cons: larger navigation, QA, and redirect surface; higher risk of regressions in links, tests, and user onboarding.

### Viable Option 3: Keep current route trees and only extract shared components

- Leave `/users` and `/administrators` as separate pages but share tables, forms, and hooks under a new common component layer.
- Pros: smallest initial code movement.
- Cons: duplicated page shells, duplicated route-level authorization checks, duplicated sidebars, and continued drift between admin and superadmin UX.

### Chosen Best Option: Option 1

Why: it removes the actual duplication while preserving the existing URLs and release surface. It also fits the current codebase well because shared hooks already exist for user scope and active permissions, but the app still branches too early at the route and sidebar level.

### Recommendation for Next Steps

- Build a centralized capability map first so navigation, route wrappers, and button visibility all read from the same permission source.
- Consolidate the user/administrator management screens next because they already share form components and are the clearest duplication hotspot.
- After the shared UI exists, widen backend route guards that are still hard-coded to `support` so superadmin/admin access matches the new permission-driven frontend.

---

## Scope Notes

- Breaking API change risk: moderate if non-GET role guards are widened in `departments`, `institutions`, or `semesters`; keep request/response shapes unchanged and only change authorization semantics.
- New `.env` variables: none expected.
- Migration rollback note: no Prisma migration is planned; rollback is reverting route-guard and frontend consolidation commits.

---

### Phase 1: Define Shared Authorization and Navigation Contracts

**Goal:** establish one source of truth for which admin pages are visible, accessible, and editable for `admin` and `superadmin`.

- [x] Create `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts` to declare page IDs, legacy route aliases, required view permissions, and optional action permissions for `users`, `administrators`, `permissions`, `institutions`, `departments`, `semesters`, and `sections`.
- [x] Create `app/sentinel-core/src/hooks/use-core-admin-capabilities.ts` to combine `useUser()`, `useAcademicScope()`, and `useActivePermissions()` into helpers such as `canViewPage(pageId)`, `canEditPage(pageId)`, and `getVisibleNavigationItems()`.
- [x] Update `app/sentinel-core/src/app/(protected)/layout.tsx` to consume `use-core-admin-capabilities` and swap role-specific header/sidebar branching for a single capability-driven shell.
- [x] Replace the duplicated item arrays in `app/sentinel-core/src/components/sidebar/admin/constants/index.ts` and `app/sentinel-core/src/components/sidebar/superadmin/constants/index.ts` with a shared config module such as `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`.
- [x] Refactor `app/sentinel-core/src/components/sidebar/admin/admin-sidebar.tsx` and `app/sentinel-core/src/components/sidebar/superadmin/superadmin-sidebar.tsx` to render from the shared nav config, or replace them with a new `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx`.
- [x] Add JSDoc to every exported helper in the new authorization and navigation modules.
- [x] Write hook tests in `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts` covering admin, superadmin, and no-permission permutations.
- [x] Write sidebar contract tests in `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` covering visible items and hidden items by permission key.
      **Migration required:** No — this phase only introduces shared frontend authorization metadata and tests.

### Phase 2: Consolidate User and Administrator Management Into Shared Pages

**Goal:** remove the split between `/users` and `/administrators` by moving both flows onto shared management components with permission-aware presets.

- [x] Create `app/sentinel-core/src/features/administration/users/user-management-page.tsx` as the shared shell for user-directory pages with props for `roleFilter`, `title`, `description`, `createAction`, and `scopeMode`.
- [x] Create `app/sentinel-core/src/features/administration/users/administrator-management-page.tsx` only if the admin-account flow still needs a thin preset wrapper over `user-management-page.tsx`; otherwise keep one shared page component and document the presets inline.
  <!-- NOTE: A dedicated wrapper file was not needed because `user-management-page.tsx` plus `user-management-presets.ts` fully covers the administrator preset. -->
- [x] Extract shared query preset logic from `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx` and `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.tsx` into `app/sentinel-core/src/features/administration/users/user-management-presets.ts`.
- [x] Refactor `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx` to render the shared user management page with the current student/instructor/admin scope rules.
- [x] Refactor `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.tsx` to render the same shared page using an `admin` role preset and institution-scoped copy.
- [x] Extract the overlap between `app/sentinel-core/src/app/(protected)/(admin)/users/_hooks/use-user-form.ts` and `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/_hooks/use-administrator-form.ts` into `app/sentinel-core/src/features/administration/users/hooks/use-managed-user-form.ts`.
- [x] Update `app/sentinel-core/src/app/(protected)/(admin)/users/_hooks/use-user-form-logic.ts` so institution/department/course locking reads from the shared capability hook instead of hard-coded `role === 'superadmin'` checks.
- [x] Refactor `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/_components/dialogs/add-admin-dialog.tsx` and `edit-admin-dialog.tsx` to use the shared managed-user form hook.
- [x] Add tests in `app/sentinel-core/src/features/administration/users/user-management-page.test.tsx` covering search, loading, and permission-based action visibility.
- [x] Add tests in `app/sentinel-core/src/features/administration/users/hooks/use-managed-user-form.test.ts` covering admin-account defaults, institution locking, and edit-mode reset behavior.
      **Migration required:** No — the existing user, profile, and RBAC tables already support both views.

### Phase 3: Centralize Institutional Setup Pages and Replace Role-Only Branching

**Goal:** allow admin and superadmin to open the same setup pages while showing read-only or editable controls based on active permissions.

- [ ] Create shared page wrappers in `app/sentinel-core/src/features/administration/setup/` for `institutions`, `departments`, `semesters`, and `permissions`, each exposing a permission-aware page header and action slots.
- [ ] Replace the mock-only implementation in `app/sentinel-core/src/app/(protected)/(superadmin)/permissions/page.tsx` with a shared page wired to `packages/hooks/src/query/access-control/use-access-control-roles-query.ts`, `use-access-control-permissions-query.ts`, and `use-access-control-role-mutations.ts`.
- [ ] Create `app/sentinel-core/src/features/administration/setup/permissions/permissions-page.tsx` and move the role/permission table setup out of the route file.
- [ ] Refactor `app/sentinel-core/src/app/(protected)/(superadmin)/institutions/page.tsx`, `departments/page.tsx`, and `semesters/page.tsx` to route through the shared setup wrappers instead of standalone redirects only.
- [ ] Add new admin aliases `app/sentinel-core/src/app/(protected)/(admin)/institutions/page.tsx`, `departments/page.tsx`, and `semesters/page.tsx` that render the same shared setup wrappers so the page tree is consistent for both roles.
- [ ] If the support portal remains the owning UI for some resources, create `app/sentinel-core/src/features/administration/setup/shared/support-portal-bridge.tsx` to show a permission-aware CTA, read-only messaging, and deep-link handoff instead of raw `redirect()` calls.
- [ ] Update `app/sentinel-core/src/hooks/use-academic-scope.ts` or a sibling hook to expose `isReadOnlyFor(resourceKey)` and `shouldLockInstitution` helpers for setup pages.
- [ ] Add tests in `app/sentinel-core/src/features/administration/setup/permissions/permissions-page.test.tsx` covering real hook data, hidden create/edit actions, and empty states.
- [ ] Add tests in `app/sentinel-core/src/features/administration/setup/shared/support-portal-bridge.test.tsx` covering superadmin editable state, admin read-only state, and missing-permission denial copy.
      **Migration required:** No — this phase replaces route composition and mocks, not schema.

### Phase 4: Align Backend Route Guards With Permission-Driven Access

**Goal:** ensure the API authorizes the same admin/superadmin actions that the consolidated frontend exposes.

- [ ] Refactor `app/sentinel-api/src/modules/core/departments/departments.routes.ts` to replace the `support`-only mutation gate with a shared helper such as `allowCoreAdminManagementRoles(method)` that admits `superadmin` and `admin` where permission checks already exist.
- [ ] Refactor `app/sentinel-api/src/modules/core/institutions/institution.routes.ts` so non-GET access is no longer hard-coded to `support` only when the caller also has the required `institutions:*` permission.
- [ ] Refactor `app/sentinel-api/src/modules/core/semesters/semesters.routes.ts` to use the same role-guard helper and keep GET access behavior unchanged.
- [ ] Audit `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`, `roles.route.ts`, and `permission.route.ts` and add explicit route-level guards if the new frontend allows admins or superadmins to open access-control screens but not perform all mutations.
- [ ] Add or update controller tests for `departments`, `institutions`, and `semesters` route access in new test files:
      `app/sentinel-api/src/modules/core/departments/controllers/route-access.test.ts`,
      `app/sentinel-api/src/modules/core/institutions/controllers/route-access.test.ts`,
      `app/sentinel-api/src/modules/core/semesters/controllers/route-access.test.ts`.
- [ ] Extend `app/sentinel-api/src/modules/security/access-control/tests/role-access.test.ts` to cover the final permission matrix used by the centralized module.
- [ ] Add JSDoc to any new exported route-guard helper introduced in `app/sentinel-api/src/modules/_shared` or `app/sentinel-api/src/lib`.
      **Migration required:** No — authorization logic changes reuse existing `rbac_permissions`, `rbac_role_permissions`, `user_roles`, and `user_profiles` data.

### Phase 5: Update Shared Query Contracts and Page-Level Permission UX

**Goal:** make frontend data hooks and page states consistent with the new centralized admin experience.

- [ ] Add `packages/hooks/src/query/access-control/use-access-control-page-permissions.ts` if the permissions page needs a thin adapter around `useActivePermissions()` for role table actions.
- [ ] Update `packages/hooks/src/query/users/use-users-query.ts` only if the shared page presets require normalized role-array query keys for `/users` and `/administrators`.
- [ ] Update `packages/services/src/api/access-control.ts` only if the real permissions page needs missing endpoints or request payload helpers not already exposed.
- [ ] Add a shared UI helper `app/sentinel-core/src/features/administration/shared/permission-gate.tsx` to standardize hidden, disabled, and read-only states across buttons, tables, and empty states.
- [ ] Refactor page-level action areas in `app/sentinel-core/src/app/(protected)/(admin)/sections/page.tsx`, `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx`, and the new shared setup pages to use `PermissionGate` instead of ad hoc role checks.
- [ ] Add tests in `app/sentinel-core/src/features/administration/shared/permission-gate.test.tsx` covering hidden vs disabled rendering rules.
- [ ] Add tests in `packages/hooks/src/query/access-control/use-access-control-page-permissions.test.ts` if the adapter hook is introduced.
      **Migration required:** No — query-key normalization and page UX do not require schema changes.

### Phase 6: Regression Coverage, Documentation, and Release Safety

**Goal:** lock in the consolidated behavior with focused tests and deployment notes before implementation is considered complete.

- [ ] Add route smoke tests for the consolidated aliases in:
      `app/sentinel-core/src/app/(protected)/(admin)/institutions/page.test.tsx`,
      `app/sentinel-core/src/app/(protected)/(admin)/departments/page.test.tsx`,
      `app/sentinel-core/src/app/(protected)/(admin)/semesters/page.test.tsx`,
      `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.test.tsx`.
- [ ] Add regression tests for the protected layout in `app/sentinel-core/src/app/(protected)/layout.test.tsx` covering admin and superadmin shell rendering from the shared capability map.
- [ ] Update `docs/centralized-administrator-module.md` with the final permission matrix, route alias map, and rollout notes after implementation is complete.
- [ ] Add a rollback note to the implementation PR describing how to revert the shared layout/sidebar switch independently from backend route-guard changes.
- [ ] Validate with focused commands during implementation:
      `pnpm --dir app/sentinel-core test`,
      `pnpm --dir app/sentinel-api test`,
      `pnpm lint`.
      **Migration required:** No — this phase is documentation, regression testing, and rollout control only.

---

## Concrete Files, Services, and Tables to Track During Implementation

- Frontend pages/routes:
  `app/sentinel-core/src/app/(protected)/layout.tsx`,
  `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(admin)/sections/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(superadmin)/permissions/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(superadmin)/institutions/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(superadmin)/departments/page.tsx`,
  `app/sentinel-core/src/app/(protected)/(superadmin)/semesters/page.tsx`.
- Frontend hooks/components:
  `app/sentinel-core/src/hooks/use-user.ts`,
  `app/sentinel-core/src/hooks/use-academic-scope.ts`,
  `packages/hooks/src/use-active-permissions.ts`,
  `packages/hooks/src/query/access-control/*`,
  `packages/hooks/src/query/users/use-users-query.ts`,
  `app/sentinel-core/src/components/sidebar/*`.
- Backend services/routes:
  `app/sentinel-api/src/modules/core/departments/departments.routes.ts`,
  `app/sentinel-api/src/modules/core/institutions/institution.routes.ts`,
  `app/sentinel-api/src/modules/core/semesters/semesters.routes.ts`,
  `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`,
  `app/sentinel-api/src/modules/security/roles/roles.route.ts`,
  `app/sentinel-api/src/modules/security/permission/permission.route.ts`,
  `app/sentinel-api/src/modules/identity/users/controllers/get-users.controller.ts`.
- Database tables:
  `roles`,
  `rbac_permissions`,
  `rbac_role_permissions`,
  `rbac_user_permission_overrides`,
  `user_roles`,
  `user_profiles`,
  `institutions`,
  `departments`,
  `semesters`.
