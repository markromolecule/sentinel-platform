# Implementation Plan - Removing Support Portal Bridge from sentinel-core

This plan outlines the steps required to replicate departments and semesters management pages from `sentinel-support` directly into `sentinel-core`, remove the support portal bridge (since we no longer delegate pages to it), relocate sections for superadmin access, and clean up institutions page and setup-feature folders.

## Pre-Planning Summary

- **Task Goal**: Remove the `SupportPortalBridge` delegation from `sentinel-core` by replicating the `departments` and `semesters` management modules directly, removing the `institutions` setup entirely, and relocating `sections` out of the `(admin)` route group so both `admin` and `superadmin` have access.
- **Affected Workspaces**: `sentinel-core` (UI modules, route paths, capabilities, navigation layout).
- **Affected Services & DB Tables**: No backend services or database tables are modified, since they are already fully capability-driven and the existing Prisma schema supports these updates.
- **Database Migration Required**: **No** — We are reusing existing database queries, API schemas, and react-query hooks provided by `@sentinel/hooks` and `@sentinel/services` that are already built-in.

---

## Phase 1: Access Control & Sidebar Navigation Configuration

**Goal:** Modify the centralized capabilities and navigation maps to support the updated routes, remove institutions, and grant superadmin access to sections.

- [ ] Update [core-admin-capability-map.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts):
    - [ ] Remove `institutions` from `CORE_ADMIN_PAGE_CAPABILITIES` (lines 189–201) and remove `'institutions'` from `CoreAdminPageId` type.
    - [ ] Modify `sections` in `CORE_ADMIN_PAGE_CAPABILITIES` (lines 59–67) to include `'superadmin'` in `allowedRoles` to allow superadmins access.
    - [ ] Update `departments` primaryPath to `/departments` and `semesters` primaryPath to `/semesters` to reflect relocation outside of the `(admin)` route group.
- [ ] Update [core-admin-nav-config.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts):
    - [ ] Remove the subItem for `institutions` (lines 133–136).
    - [ ] Change the parent item's `pageId` from `'institutions'` to `'departments'`, and update its `url` to `/departments` (lines 127–148).
- [ ] Update [core-admin-sidebar.test.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx):
    - [ ] Modify mock assertions inside `renders the Academic Setup item and its sub-items when visible` (lines 116–141) to assert against `/departments` as the parent URL and only `Departments` and `Semesters` in sub-items.

---

## Phase 2: Relocate and Configure Sections Route

**Goal:** Relocate the `sections` route group outside of `(admin)` so both admins and superadmins can access it.

- [ ] Move the `app/sentinel-core/src/app/(protected)/(admin)/sections` folder to `app/sentinel-core/src/app/(protected)/sections`.
- [ ] Create Vitest test file `app/sentinel-core/src/app/(protected)/sections/page.test.tsx` to assert that the relocated Sections page mounts correctly.

---

## Phase 3: Replicate and Relocate Departments & Semesters Pages

**Goal:** Replicate departments and semesters views directly from `sentinel-support` to `sentinel-core` to remove the delegation bridge.

- [ ] Replicate `departments` management page:
    - [ ] Copy all files from `app/sentinel-support/src/app/(protected)/(support)/departments` to `app/sentinel-core/src/app/(protected)/departments`.
    - [ ] Update any internal imports in the copied components and hooks (e.g. `use-add-department-form.ts`, `use-edit-department-form.ts`, and `use-bulk-department-form.ts`) to make sure they resolve relative to `@/app/(protected)/departments` and `@/data` in the `sentinel-core` environment.
    - [ ] Create Vitest test file `app/sentinel-core/src/app/(protected)/departments/page.test.tsx` to verify departments listing and action dialog trigger components.
- [ ] Replicate `semesters` management page:
    - [ ] Copy all files from `app/sentinel-support/src/app/(protected)/(support)/semesters` to `app/sentinel-core/src/app/(protected)/semesters`.
    - [ ] Update internal relative imports under the copied `semesters` components and hooks (e.g. `use-add-semester-form.ts` and `use-edit-semester-form.ts`) to resolve correctly in `sentinel-core`.
    - [ ] Create Vitest test file `app/sentinel-core/src/app/(protected)/semesters/page.test.tsx` to verify semesters list rendering and form trigger behaviors.

---

## Phase 4: Relocate Permissions Feature & Clean Up Setup Directory

**Goal:** Clean up the legacy `setup` features and relocate the permissions module.

- [ ] Relocate the permissions administration feature:
    - [ ] Move `app/sentinel-core/src/features/administration/setup/permissions` to `app/sentinel-core/src/features/administration/permissions`.
    - [ ] Update the import statement in `app/sentinel-core/src/app/(protected)/(superadmin)/permissions/page.tsx` (line 3) from `import { PermissionsPage } from '@/features/administration/setup/permissions/permissions-page';` to `import { PermissionsPage } from '@/features/administration/permissions/permissions-page';`.
- [ ] Clean up legacy route groups and feature files:
    - [ ] Delete `app/sentinel-core/src/app/(protected)/(admin)/departments`
    - [ ] Delete `app/sentinel-core/src/app/(protected)/(admin)/semesters`
    - [ ] Delete `app/sentinel-core/src/app/(protected)/(admin)/institutions`
    - [ ] Delete the entire folder `app/sentinel-core/src/features/administration/setup`.
- [ ] Run a test build to ensure that all imports resolve cleanly and there are no compiling errors or missing files.

---

## Phase 5: Verification & End-to-End Validation

**Goal:** Ensure build, tests, and routing are completely robust and working properly.

- [ ] Execute `pnpm run test` or `pnpm --dir app/sentinel-core test` to verify all Vitest tests in the core app pass successfully.
- [ ] Execute `pnpm build` in the root workspace to confirm that the monorepo builds cleanly with zero compile-time or TypeScript errors.
