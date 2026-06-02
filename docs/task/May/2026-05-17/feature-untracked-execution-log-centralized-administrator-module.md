# Execution Log: Centralized Administrator Module

## Pre-Execution

- [x] Read and confirm the implementation plan at `docs/task/2026-05-17/feature-untracked-implementation-plan-centralized-administrator-module.md`
- [x] Scan all files and modules listed in the plan to understand current state
- [x] Verify the Prisma schema if a migration is required
- [x] Confirm all required environment variables exist in `.env` / `.env.example`
- [x] Check that the dev server and test runner are operational before proceeding

<!-- NOTE: No Prisma migration is required for this feature. -->

### Phase 1: Define Shared Authorization and Navigation Contracts

**Goal:** Establish one source of truth for which admin pages are visible, accessible, and editable for `admin` and `superadmin`.

- [x] Implement `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts` — declare centralized page capabilities, aliases, and permission requirements
- [x] Implement `app/sentinel-core/src/hooks/use-core-admin-capabilities.ts` — combine auth, scope, and active permissions into page and navigation helpers
- [x] Update `app/sentinel-core/src/app/(protected)/layout.tsx` — switch to a single capability-driven shell
- [x] Implement `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts` — replace duplicated admin/superadmin nav definitions
- [x] Implement `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.tsx` — render the shared sidebar from the centralized config
- [x] Update `app/sentinel-core/src/components/sidebar/admin/constants/index.ts` and `app/sentinel-core/src/components/sidebar/superadmin/constants/index.ts` — point legacy exports at the shared config
- [x] Update `app/sentinel-core/src/components/sidebar/admin/admin-sidebar.tsx` and `app/sentinel-core/src/components/sidebar/superadmin/superadmin-sidebar.tsx` — delegate to the shared sidebar
- [x] Write tests at `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts`
- [x] Write tests at `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx`
- [x] Run Phase 1 tests and confirm all pass
- [x] Mark Phase 1 complete in this execution log

<!-- NOTE: Validation completed with `pnpm --dir app/sentinel-core exec vitest run src/hooks/use-core-admin-capabilities.test.ts src/components/sidebar/common/core-admin-sidebar.test.tsx` and `pnpm --dir app/sentinel-core test`. -->

**Migration applied:** No — frontend-only capability and navigation consolidation.
**Breaking changes:** No — Phase 1 keeps the current route surface and only centralizes shell logic.

### Phase 2: Consolidate User and Administrator Management Into Shared Pages

**Goal:** Remove the split between `/users` and `/administrators` by moving both flows onto shared management components with permission-aware presets.

- [x] Implement `app/sentinel-core/src/features/administration/users/user-management-page.tsx` — add the shared user-directory shell for admin and administrator flows
- [x] Implement `app/sentinel-core/src/features/administration/users/user-management-presets.ts` — centralize the route presets for admin users and superadmin administrators
- [x] Reuse `app/sentinel-core/src/features/administration/users/user-management-page.tsx` instead of creating `administrator-management-page.tsx`
- [x] Update `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx` — render the shared page with the admin preset
- [x] Update `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/page.tsx` — render the shared page with the administrator preset
- [x] Implement `app/sentinel-core/src/features/administration/users/hooks/use-managed-user-form.ts` — centralize create/edit/invite form behavior for both user and administrator dialogs
- [x] Update `app/sentinel-core/src/app/(protected)/(admin)/users/_hooks/use-user-form.ts` — delegate to the shared managed-user form hook
- [x] Update `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/_hooks/use-administrator-form.ts` — delegate to the shared managed-user form hook in forced-admin mode
- [x] Update `app/sentinel-core/src/app/(protected)/(admin)/users/_hooks/use-user-form-logic.ts` — read superadmin state from the shared capability hook
- [x] Keep `app/sentinel-core/src/app/(protected)/(superadmin)/administrators/_components/dialogs/add-admin-dialog.tsx` and `edit-admin-dialog.tsx` on the shared managed-user form flow through the wrapper hook
- [x] Write tests at `app/sentinel-core/src/features/administration/users/user-management-page.test.tsx`
- [x] Write tests at `app/sentinel-core/src/features/administration/users/hooks/use-managed-user-form.test.ts`
- [x] Run Phase 2 tests and confirm all pass
- [x] Mark Phase 2 complete in this execution log

<!-- NOTE: A dedicated `administrator-management-page.tsx` wrapper was not needed because `user-management-page.tsx` plus `user-management-presets.ts` already covers the administrator-specific preset cleanly. -->
<!-- NOTE: Validation completed with `pnpm --dir app/sentinel-core exec vitest run src/features/administration/users/hooks/use-managed-user-form.test.ts src/features/administration/users/user-management-page.test.tsx` and `pnpm --dir app/sentinel-core test`. -->

**Migration applied:** No — frontend-only page and form-hook consolidation.
**Breaking changes:** No — route URLs and dialog entry points remain unchanged.

### Phase 3: Centralize Institutional Setup Pages and Replace Role-Only Branching

**Goal:** Allow admin and superadmin to open the same setup pages while showing read-only or editable controls based on active permissions.

- [x] Expand capability mappings in `core-admin-capability-map.ts` to include allowed roles for `institutions`, `departments`, `semesters`, and `permissions`
- [x] Expand academic scope helper in `use-academic-scope.ts` with `isReadOnlyFor(resourceKey)` and `shouldLockInstitution`
- [x] Implement the shared permission-aware `SupportPortalBridge` component at `app/sentinel-core/src/features/administration/setup/shared/support-portal-bridge.tsx`
- [x] Implement shared setup page wrappers for `institutions`, `departments`, and `semesters` in the features folder
- [x] Implement the centralized dynamic `PermissionsPage` at `app/sentinel-core/src/features/administration/setup/permissions/permissions-page.tsx`
- [x] Wire route aliases for `institutions`, `departments`, and `semesters` under both `(admin)` and `(superadmin)` folders rendering setup wrappers
- [x] Delegate both superadmin and admin `permissions` routes to render the shared dynamic `PermissionsPage`
- [x] Write comprehensive unit tests for `SupportPortalBridge` at `support-portal-bridge.test.tsx`
- [x] Write comprehensive unit tests for `PermissionsPage` at `permissions-page.test.tsx`
- [x] Run Phase 3 tests and confirm 100% test coverage and pass status
- [x] Mark Phase 3 complete in this execution log

<!-- NOTE: Validation completed with `pnpm --dir app/sentinel-core test` yielding 28/28 tests passing. -->

**Migration applied:** No — frontend-only capability routing and setup consolidation.
**Breaking changes:** No — page layout features remain visually seamless while dynamically securing backend interaction.

### Phase 4: Align Backend Route Guards With Permission-Driven Access

**Goal:** Ensure the API authorizes the same admin/superadmin actions that the consolidated frontend exposes.

- [x] Audit backend route authorization inside `app/sentinel-api/src/modules/core/departments/departments.routes.ts`, `institution.routes.ts`, and `semesters.routes.ts`
- [x] Allow `superadmin` and `admin` alongside `support` to read/write core administrator resources if authorized by role-level and active-permission policies
- [x] Ensure the API authorizes the same admin/superadmin actions that the consolidated frontend exposes
- [x] Audit `app/sentinel-api/src/modules/security/access-control/access-control.route.ts`, `roles.route.ts`, and `permission.route.ts` and add explicit route-level guards if the new frontend allows admins or superadmins to open access-control screens but not perform all mutations
- [x] Add or update controller tests for `departments`, `institutions`, and `semesters` route access in new test files:
      `app/sentinel-api/src/modules/core/departments/controllers/route-access.test.ts`,
      `app/sentinel-api/src/modules/core/institutions/controllers/route-access.test.ts`,
      `app/sentinel-api/src/modules/core/semesters/controllers/route-access.test.ts`
- [x] Extend `app/sentinel-api/src/modules/security/access-control/tests/role-access.test.ts` to cover the final permission matrix used by the centralized module
- [x] Clean up old duplicate views in `app/(protected)/(superadmin)/departments/page.tsx`, `app/(protected)/(superadmin)/institutions/page.tsx`, and `app/(protected)/(superadmin)/semesters/page.tsx` resolving parallel route compilation errors
- [x] Run Phase 4 tests and confirm 100% test coverage and pass status
- [x] Run full monorepo-wide Turborepo build verification

<!-- NOTE: Validation completed with `pnpm --dir app/sentinel-api test route-access.test.ts role-access.test.ts` yielding 16/16 tests passing, and duplicate route deletion verified with a clean `pnpm build`. -->

**Migration applied:** No — backend route and middleware security widening.
**Breaking changes:** No — API route surfaces are fully backwards compatible while securely admitting admin and superadmin roles with proper active permissions.

### Phase 5: Update Shared Query Contracts and Page-Level Permission UX

**Goal:** Make frontend data hooks and page states consistent with the new centralized admin experience.

- [x] Create a shared UI helper `app/sentinel-core/src/features/administration/shared/permission-gate.tsx` to standardize hidden, disabled, and read-only states across buttons, tables, and empty states.
- [x] Refactor page-level action areas in `app/sentinel-core/src/app/(protected)/(admin)/sections/page.tsx`, `app/sentinel-core/src/app/(protected)/(admin)/users/page.tsx`, and the new shared setup pages to use `PermissionGate` instead of ad hoc role checks.
- [x] Add tests in `app/sentinel-core/src/features/administration/shared/permission-gate.test.tsx` covering hidden vs disabled rendering rules.

<!-- NOTE: Dynamic validation and actions verified with a clean `pnpm test`. -->

**Migration applied:** No — query-key normalization and page UX do not require schema changes.
**Breaking changes:** No — user flow and presets scale dynamically according to their active permissions.

### Phase 6: Regression Coverage, Documentation, and Release Safety

**Goal:** Lock in the consolidated behavior with focused tests and deployment notes before implementation is considered complete.

- [x] Add route smoke tests for the consolidated aliases in `app/sentinel-core/src/app/(protected)/(admin)/institutions/page.test.tsx`, `departments/page.test.tsx`, `semesters/page.test.tsx`, and `(superadmin)/administrators/page.test.tsx`
- [x] Add regression tests for the protected layout in `app/sentinel-core/src/app/(protected)/layout.test.tsx` covering admin and superadmin shell rendering from the shared capability map
- [x] Update `docs/centralized-administrator-module.md` with the final permission matrix, route alias map, and rollout notes after implementation is complete
- [x] Confirm all 43 tests pass successfully with 100% success
- [x] Verify full monorepo-wide Turborepo build passes without type or compilation errors

<!-- NOTE: Verification completed successfully with `pnpm build` and `pnpm --dir app/sentinel-core test` yielding 43/43 tests passing. -->

**Migration applied:** No — testing, documentation, and build validation only.
**Breaking changes:** No — visual backward compatibility and high stability are preserved.
