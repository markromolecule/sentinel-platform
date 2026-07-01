# feat-001 — Identity & Access Page Consolidation

**Task summary:** Consolidate the admin `/users` route and the superadmin `/administrators` route into a single shared Identity & Access page (outside the `(superadmin)` route group) that is accessible by both `admin` and `superadmin` roles, mirrors the `IdentityWorkspaceShell` layout, removes sidebar sub-items from the admin Users entry, and deletes the now-redundant `(admin)/users` directory.

---

## Pre-Planning Checklist

- [x] Read and summarized the task input
- [x] Scanned all relevant source files
- [x] Identified all files the task will touch
- [x] Determined migration is **not required** (no schema changes)

---

## 1-3-1: Three Viable Options

### Option A — Move Everything Into a New Shared Route Group `(identity)`

Create a new route group `app/(protected)/(identity)/identity/` with its own `layout.tsx` wrapping `IdentityWorkspaceShell`, and add new nav presets for `admin` + `superadmin`. Redirect `/users` → `/identity`.

**Tradeoff:** Cleanest separation, but requires updating every internal link that references `/users` and changes the URL visible to users.

---

### Option B — Promote the Superadmin Page Outside Its Route Group _(Recommended)_

Move the superadmin `administrators/` directory one level up to `app/(protected)/administrators/`, give it a local `layout.tsx` that reuses `IdentityWorkspaceShell`, and update the admin sidebar to point to `/administrators` instead of `/users`. Extend `user-management-presets.ts` with admin-scoped presets for students, instructors, and whitelist. Update the capability map to allow both roles on `administrators`. Finally, delete `(admin)/users`.

**Tradeoff:** Minimal URL surface change (URL stays `/administrators`), no redirect needed, reuses all existing components — highest maintainability.

---

### Option C — Keep Both Routes, Share Only the Shell via a HOC

Wrap both `(admin)/users/page.tsx` and `(superadmin)/administrators/page.tsx` in `IdentityWorkspaceShell` and merge sub-navigation. Keep separate URL paths.

**Tradeoff:** Lowest effort, but leaves redundant routes, duplicates layout logic, and doesn't eliminate the sidebar sub-items cleanly.

---

## Best Option: **Option B**

**Why:** Option B reuses 100% of existing components (`IdentityWorkspaceShell`, `IdentityNav`, `UserManagementPage`, all presets). It keeps the public URL at `/administrators`, avoids any redirect infrastructure, requires no new dependencies, and eliminates the redundant `(admin)/users` path completely. It is the most maintainable and consistent with the existing pattern already used by the superadmin.

---

## Proposed Changes

---

### Phase 1 — Capability Map & Auth

**Goal:** Allow both `admin` and `superadmin` roles to access the unified identity pages so the sidebar and route guard render correctly for both.

#### [MODIFY] `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts`

- [x] Change `administrators.allowedRoles` from `['superadmin']` → `['admin', 'superadmin']`
- [x] Change `administrator-whitelist.allowedRoles` from `['superadmin']` → `['admin', 'superadmin']`
- [x] Change `permissions.allowedRoles` — verify already `['admin', 'superadmin']` (no change needed)
- [x] Remove capability entries for `users`, `students`, `instructors`, `student-whitelist` from `CoreAdminPageId` union and `CORE_ADMIN_PAGE_CAPABILITIES` (deferred to Phase 5 to avoid breaking existing routes during transition)

#### [NEW] `app/sentinel-core/src/lib/authorization/core-admin-capability-map.test.ts`

- [x] Assert `admin` role is eligible for `administrators` and `administrator-whitelist`
- [x] Assert `superadmin` role is eligible for `administrators` and `administrator-whitelist`

**Migration required:** No

---

### Phase 2 — Promote `administrators/` Route Outside `(superadmin)`

**Goal:** Move the administrators pages to a shared protected route accessible by both roles.

#### [MOVE] `(protected)/(superadmin)/administrators/` → `(protected)/administrators/`

- [x] Move entire directory: `page.tsx`, `whitelist/`, `_components/`, `_constants/`, `_hooks/`, `_types/`, `page.test.tsx`

#### [NEW] `app/sentinel-core/src/app/(protected)/administrators/layout.tsx`

- [x] Import `IdentityWorkspaceShell` from `@/app/(protected)/(superadmin)/_components/layout`
- [x] Import `useUser` from `@/hooks/use-user` to read the current role
- [x] Pass `role` to `IdentityWorkspaceShell` (prop to be added in Phase 3)
- [x] Add JSDoc on the exported layout function

#### [MODIFY] `app/sentinel-core/src/app/(protected)/(superadmin)/layout.tsx`

- [x] After moving `administrators/`, `(superadmin)` will only contain `permissions/`
- [x] Keep or simplify the layout — if `permissions/` also needs the identity shell, it can keep using `(superadmin)/layout.tsx`; otherwise convert to a passthrough

- [x] Write a render test for the new `administrators/layout.tsx` asserting `IdentityWorkspaceShell` renders

**Migration required:** No

---

### Phase 3 — Extend `IdentityWorkspaceShell` & `IdentityNav` for Admin Scope

**Goal:** Update the workspace shell and nav to show admin-specific tabs (Students, Instructors, Whitelist) when role is `admin`, and superadmin tabs (Administrators, Whitelist, Permissions) when role is `superadmin`.

#### [MODIFY] `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-workspace-shell.tsx`

- [x] Add optional `role?: CoreRole` prop
- [x] Pass `role` down to `IdentityNav`
- [x] Update active-section detection to handle new paths: `/administrators/students`, `/administrators/instructors`
- [x] Update JSDoc

#### [MODIFY] `app/sentinel-core/src/app/(protected)/(superadmin)/_components/layout/identity-nav.tsx`

- [x] Extend `IdentitySection` union: add `'students' | 'instructors' | 'student-whitelist'`
- [x] Add `IdentityNavProps.role?: CoreRole` prop
- [x] Define `ADMIN_IDENTITY_NAV_GROUPS` constant:
    ```ts
    [
        {
            title: 'Identity & Access',
            items: [
                { id: 'students', label: 'Students', href: '/administrators/students' },
                { id: 'instructors', label: 'Instructors', href: '/administrators/instructors' },
                { id: 'student-whitelist', label: 'Whitelist', href: '/administrators/whitelist' },
            ],
        },
    ];
    ```
- [x] Render `ADMIN_IDENTITY_NAV_GROUPS` when `role === 'admin'`, existing `IDENTITY_NAV_GROUPS` when `role === 'superadmin'`
- [x] Update JSDoc

- [x] Update `identity-nav.test.tsx` to cover admin nav group rendering
- [x] Update `identity-workspace-shell.tsx` with role-based active section tests

**Migration required:** No

---

### Phase 4 — New Admin Sub-Pages Under `/administrators/`

**Goal:** Create student and instructor sub-pages under the new shared `/administrators/` path so admins can navigate to each within the identity shell.

#### [NEW] `app/sentinel-core/src/app/(protected)/administrators/students/page.tsx`

- [x] `'use client'` directive
- [x] Import and render `<UserManagementPage {...ADMIN_STUDENTS_PRESET} />`

#### [NEW] `app/sentinel-core/src/app/(protected)/administrators/instructors/page.tsx`

- [x] `'use client'` directive
- [x] Import and render `<UserManagementPage {...ADMIN_INSTRUCTORS_PRESET} />`

#### [MODIFY] `app/sentinel-core/src/features/administration/users/user-management-presets.ts`

- [x] Add `ADMIN_STUDENTS_PRESET: UserManagementPreset`:
    ```ts
    { title: 'Students', description: '...', variant: 'users', scopeMode: 'institution', roleFilter: 'student', actions: createElement(...) }
    ```
- [x] Add `ADMIN_INSTRUCTORS_PRESET: UserManagementPreset`:
    ```ts
    { title: 'Instructors', description: '...', variant: 'users', scopeMode: 'institution', roleFilter: 'instructor', actions: createElement(...) }
    ```
- [x] Rename `ADMIN_USER_MANAGEMENT_PRESET` → `ADMIN_IDENTITY_MANAGEMENT_PRESET` and update its description to reflect the consolidated page; update its single usage in the old page before deletion
- [x] Add JSDoc on each new/modified export

- [x] Update `user-management-page.test.tsx` to cover new roleFilter + scopeMode combinations

**Migration required:** No

---

### Phase 5 — Sidebar Cleanup & Capability Map Final Pass

**Goal:** Remove sub-items from the admin sidebar's Users entry, point it to `/administrators`, and purge now-dead capability entries.

#### [MODIFY] `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`

- [x] Replace the `users` nav item block (including its `subItems` array) with a single flat `administrators` entry visible to admin:
    ```ts
    {
        pageId: 'administrators',
        title: 'Identity & Access',
        url: '/administrators',
        icon: Users,
    }
    ```
- [x] Remove the separate `administrators` entry already present for superadmin (consolidate into one — the capability map now controls per-role visibility)
- [x] Verify `getCoreAdminNavigationSections` still filters correctly per role

#### [MODIFY] `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts`

- [x] Remove `'users' | 'students' | 'instructors' | 'student-whitelist'` from `CoreAdminPageId` union type
- [x] Remove their `CORE_ADMIN_PAGE_CAPABILITIES` entries

- [x] Update `core-admin-sidebar.test.tsx`:
    - Assert sub-items are no longer rendered for admin
    - Assert single `Identity & Access` item renders with URL `/administrators`
- [x] Run `pnpm --dir app/sentinel-core test` — all tests must pass before proceeding

**Migration required:** No

---

### Phase 6 — Delete Redundant `(admin)/users` Directory

**Goal:** Remove all now-unused admin-specific user pages and relocate shared components to prevent orphaned imports.

#### [MOVE] `(admin)/users/_components/` & `_hooks/`

- [x] Move `_components/` (dialogs, forms, tables, views) into `(protected)/administrators/_components/` (merge with existing)
- [x] Move `_hooks/` (use-bulk-upload, use-user-form-logic, use-user-form, use-user-management) into `(protected)/administrators/_hooks/`
- [x] Update `(protected)/administrators/_components/index.ts` barrel export to include moved components

#### [MODIFY] `app/sentinel-core/src/features/administration/users/user-management-presets.ts`

- [x] Update import path for `AddUserDialog`, `BulkUploadDialog` from old `(admin)/users/_components` → new location
- [x] Update import path for `AddAdminDialog` similarly if moved

#### [MODIFY] `app/sentinel-core/src/features/administration/users/user-management-page.tsx`

- [x] Update import path for `UserManagementTable` from old `(admin)/users/_components` → new location

#### [DELETE] `app/sentinel-core/src/app/(protected)/(admin)/users/`

- [x] Delete the entire directory after confirming zero remaining references
- [x] Delete `(admin)/` route group directory if now empty

- [x] Run `pnpm --dir app/sentinel-core build` (TypeScript compile, no-emit check) — zero type errors
- [x] Run `pnpm --dir app/sentinel-core test` — all tests pass

**Migration required:** No

---

## Done Criteria

- [x] `/administrators` route is accessible by both `admin` and `superadmin` roles
- [x] Admin sidebar shows a single flat `Identity & Access` entry (no sub-items) pointing to `/administrators`
- [x] `IdentityWorkspaceShell` sidebar renders the correct tabs per role:
    - `admin` → Students | Instructors | Whitelist
    - `superadmin` → Administrators | Whitelist | Permissions
- [x] `(admin)/users/` directory is fully deleted with no orphaned imports
- [x] `(superadmin)` route group no longer contains `administrators/` pages
- [x] All Vitest tests pass: `pnpm --dir app/sentinel-core test`
- [x] TypeScript compilation succeeds with no errors: `pnpm --dir app/sentinel-core build`
- [x] No new `.env` variables required
- [x] No Prisma migration required

---

## Additional Considerations

- **Breaking API changes:** None — no API routes are changed; this is a frontend-only restructure.
- **New `.env` variables:** None.
- **Migration rollback:** N/A — no schema change.
- **Open question:** Should `permissions/` remain under `(superadmin)/` or be promoted alongside `administrators/`? Current scope only moves `administrators/` — `permissions/` is unchanged.
- **Note on `IdentityWorkspaceShell` location:** The shell lives under `(superadmin)/_components/layout/`. After Phase 2, the new `administrators/layout.tsx` imports from that path via `@/app/(protected)/(superadmin)/_components/layout`. Consider moving the shell to a more neutral location (e.g., `src/components/layout/identity-workspace-shell.tsx`) in a follow-up refactor.

---

## Reference Docs

- [System Overview](../../architecture/system-overview.md)
- [Agent Rules Overview](../../agents/rules-overview.md)
- [Agent Workflows Overview](../../agents/workflows-overview.md)
