# Execution Log - Removing Support Portal Bridge from sentinel-core

Track the progress of removing the support portal bridge, relocating routes, replicating departments/semesters, and cleaning up legacy features.

## Pre-Execution Check

- [x] Pre-planning: Scan relevant files and confirm no migrations are needed.
- [x] Environment: Verify existing variables in `.env` and `.env.example` are sufficient.

---

## Phase 1: Access Control & Sidebar Navigation Configuration

**Goal:** Modify the centralized capabilities and navigation maps to support the updated routes, remove institutions, and grant superadmin access to sections.

- [x] Update `core-admin-capability-map.ts` (Remove `institutions`, allow `superadmin` access to `sections`, update `departments` and `semesters` paths)
- [x] Update `core-admin-nav-config.ts` (Remove `institutions`, set parent item pageId to `'departments'`)
- [x] Update `core-admin-sidebar.test.tsx` (Adjust mock assertions to match the new nav configuration)
- [x] Run `pnpm test` and confirm all tests pass

**Migration applied:** No
**Breaking changes:** Yes — Removed `/institutions` setup page from `sentinel-core`.

---

## Phase 2: Relocate and Configure Sections Route

**Goal:** Relocate the `sections` route group outside of `(admin)` so both admins and superadmins can access it.

- [x] Move the `app/sentinel-core/src/app/(protected)/(admin)/sections` folder to `app/sentinel-core/src/app/(protected)/sections`
- [x] Create Vitest test file `app/sentinel-core/src/app/(protected)/sections/page.test.tsx`
- [x] Run `pnpm test` and confirm all tests pass

**Migration applied:** No
**Breaking changes:** No

---

## Phase 3: Replicate and Relocate Departments & Semesters Pages

**Goal:** Replicate departments and semesters views directly from `sentinel-support` to `sentinel-core` to remove the delegation bridge.

- [x] Copy departments files to `app/sentinel-core/src/app/(protected)/departments` and update internal imports to resolve correctly
- [x] Create Vitest test file `app/sentinel-core/src/app/(protected)/departments/page.test.tsx`
- [x] Copy semesters files to `app/sentinel-core/src/app/(protected)/semesters` and update internal imports to resolve correctly
- [x] Create Vitest test file `app/sentinel-core/src/app/(protected)/semesters/page.test.tsx`
- [x] Run `pnpm test` and confirm all tests pass

**Migration applied:** No
**Breaking changes:** No

---

## Phase 4: Relocate Permissions Feature & Clean Up Setup Directory

**Goal:** Clean up the legacy `setup` features and relocate the permissions module.

- [x] Move permissions from `features/administration/setup/permissions` to `features/administration/permissions` and update the import in `permissions/page.tsx`
- [x] Delete legacy folders: `(admin)/departments`, `(admin)/semesters`, `(admin)/institutions`, and `features/administration/setup`
- [x] Run `pnpm build` in the root workspace to confirm that the monorepo builds cleanly with zero compile-time errors

**Migration applied:** No
**Breaking changes:** No

---

## Phase 5: Verification & End-to-End Validation

**Goal:** Ensure build, tests, and routing are completely robust and working properly.

- [x] Execute `pnpm run test` or `pnpm --dir app/sentinel-core test` to verify all Vitest tests pass
- [x] Execute `pnpm build` in the root workspace to confirm that the monorepo builds cleanly

**Migration applied:** No
**Breaking changes:** No
