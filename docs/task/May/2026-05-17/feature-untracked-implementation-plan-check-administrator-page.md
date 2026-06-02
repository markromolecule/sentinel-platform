# Implementation Plan: Centralized Administrator Sidebar and Course Scope Alignment

## Pre-Planning Checklist

- [x] **Read and summarize the task input in one sentence:** Resolve administrative interface accessibility and permission scopes in `sentinel-core` by adding missing institutional setup pages (`institutions`, `departments`, `semesters`) under a unified dropdown in the sidebar and enabling scoped, read-only "limited access" to `courses` for the `admin` role.
- [x] **Scan relevant source files to understand existing patterns:** - Page capability map: `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts` - Academic scope and read-only gates: `app/sentinel-core/src/hooks/use-academic-scope.ts` - Sidebar menu structure: `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts` - Page routes: `app/sentinel-core/src/app/(protected)/(admin)/institutions/page.tsx` and `app/sentinel-core/src/app/(protected)/(superadmin)/courses/page.tsx` - Courses components/dialogs: `app/sentinel-core/src/app/(protected)/(superadmin)/courses/_components/`
- [x] **Identify all files, services, and DB tables the task will touch:** - **Frontend files to modify:** - `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts` - `app/sentinel-core/src/hooks/use-academic-scope.ts` - `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts` - `app/sentinel-core/src/app/(protected)/(superadmin)/courses/page.tsx` - **Frontend files to create:** - `app/sentinel-core/src/features/administration/courses/courses-page.tsx` (Shared feature page) - Move components from `app/sentinel-core/src/app/(protected)/(superadmin)/courses/_components/` to `app/sentinel-core/src/features/administration/courses/_components/` - Move hooks from `app/sentinel-core/src/app/(protected)/(superadmin)/courses/_hooks/` to `app/sentinel-core/src/features/administration/courses/hooks/` - **Tests to write/update:** - `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts` (Update) - `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` (Update) - `app/sentinel-core/src/features/administration/courses/courses-page.test.tsx` (New) - **Database tables:** None. Standard RBAC structures (`roles`, `rbac_permissions`, `rbac_role_permissions`, `user_roles`) and entity schemas (`institutions`, `departments`, `semesters`, `courses`) are fully capability-driven and scoped in backend.
- [x] **Determine if a Prisma migration is needed:** No. The database schema already accommodates academic permissions and role assignments; all changes are frontend-only capability routing, sidebar additions, and component reorganization.

---

## 1-3-1 Architectural Decision

### Viable Option 1: Unified "Academic Setup" Dropdown in Sidebar and Shared Courses Feature

- Group `institutions`, `departments`, and `semesters` under a new dropdown menu item in the "Management" section of the sidebar named "Academic Setup".
- This menu will utilize a `Building2` icon, expanding into three sub-items: "Institutions", "Departments", and "Semesters". Using `institutions` as the parent `pageId` lets us leverage existing rendering paths, and if an admin has access to any subitem, they see the dropdown dynamically.
- For `courses`, we expand `allowedRoles: ['admin', 'superadmin']` in the capability map and migrate the course management logic into a shared feature folder (`app/sentinel-core/src/features/administration/courses/`). We add `courses` to `isReadOnlyFor` in `useAcademicScope.ts` to automatically restrict admins who lack write permissions (`courses:create`, `courses:update`, `courses:delete`), hiding action buttons/dialogs.
- **Pros:** High-fidelity premium design; aligns perfectly with the established dropdown paradigms ("Access Management" and "Subjects"); prevents sidebar height bloat; ensures standard code boundaries.
- **Cons:** Requires reorganizing the legacy `courses` page and components.

### Viable Option 2: Add Setup Pages as Individual Top-Level Sidebar Items

- Add `institutions`, `departments`, and `semesters` as separate, top-level items directly under the "Management" section in `core-admin-nav-config.ts` without dropdown nesting (e.g. "Institutions" with a `Building2` icon, "Departments" with a `School` icon, and "Semesters" with a `Calendar` icon).
- Keep courses page route files exactly where they are and only modify access roles without refactoring courses to a shared feature.
- **Pros:** Minimum code movements; simple configuration.
- **Cons:** Clutters the sidebar navigation with three new tall icons; violates Next.js features organization rules by leaving pages inside the route directory instead of a shared feature.

### Viable Option 3: Separate "Institutional Setup" Section in Sidebar

- Define a new top-level sidebar section (below "Management" or "Analytics & Logs") named "Academic Setup" and list `institutions`, `departments`, and `semesters` as top-level items inside it.
- **Pros:** Segmented separation of setup configurations.
- **Cons:** Too many small sections degrade the premium feel of the dashboard; does not solve the lack of structured code organization in the courses module.

### Chosen Best Option: Option 1

Why: It preserves the clean, elegant visual aesthetic expected of a professional dashboard by grouping related institutional setup pages into a single dynamic dropdown, matching the established "Access Management" and "Subjects" layout. Additionally, migrating the `courses` page into a shared feature folder strictly follows the repository's modular development standards (`RULE[code-organization.md]` and `RULE[project-structure.md]`), ensuring future-proof maintainability.

### Recommendation for Next Steps

- First, expand the capability mapping in `core-admin-capability-map.ts` to make the `admin` role eligible for `courses`.
- Second, add the "Academic Setup" dropdown into the centralized sidebar configuration.
- Third, migrate the legacy courses views, dialogs, tables, and hooks into `features/administration/courses` and wire the route page to it.
- Finally, verify validation gates by executing Vitest specs and Turborepo builds.

---

## Scope Notes

- **Breaking API change risk:** None. The backend is already capability-driven and securely admits `admin` and `superadmin` actions based on active permissions and academic scoping.
- **New `.env` variables:** None.
- **Migration rollback note:** No Prisma migrations are made; rollback consists of resetting capability mappings, sidebar items, and layout route delegations.

---

## Phases

### Phase 1: Update Capability Map and Academic Scope Rules

**Goal:** Authorize the `admin` role to access the courses page in the capability map and establish read-only gates in academic scope.

- [ ] Modify `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts` to include `'admin'` in the `allowedRoles` list for the `courses` page ID.
    ```typescript
    courses: {
        id: 'courses',
        title: 'Courses',
        primaryPath: '/courses',
        aliases: ['/courses'],
        allowedRoles: ['admin', 'superadmin'], // Widened
        requiredViewPermissions: ['courses:view'],
        requiredActionPermissions: ['courses:create', 'courses:update', 'courses:delete'],
    }
    ```
- [ ] Modify `app/sentinel-core/src/hooks/use-academic-scope.ts` to add `courses` to the `actionPermissionsMap` inside the `isReadOnlyFor` function:
    ```typescript
    courses: ['courses:create', 'courses:update', 'courses:delete'],
    ```
- [ ] Add JSDoc annotations to `useAcademicScope` and `getCoreAdminPageCapability` explaining the expanded course access.
- [ ] Update tests in `app/sentinel-core/src/hooks/use-core-admin-capabilities.test.ts` to cover `admin` eligibility for the `courses` page when the user has the required view permissions, and verify they lack edit permissions unless explicitly assigned.
      **Migration required:** No — frontend-only capability routing and role lock widening.

### Phase 2: Add Setup Pages and Courses to Centralized Sidebar

**Goal:** Integrate the missing setup pages under a unified "Academic Setup" dropdown and ensure courses are visible to authorized administrators.

- [ ] Import `Building2` from `lucide-react` in `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`.
- [ ] Modify `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts` to add the "Academic Setup" dropdown under the `Management` section:
    ```typescript
    {
        pageId: 'institutions',
        title: 'Academic Setup',
        url: '/institutions',
        icon: Building2,
        subItems: [
            {
                pageId: 'institutions',
                title: 'Institutions',
                url: '/institutions',
            },
            {
                pageId: 'departments',
                title: 'Departments',
                url: '/departments',
            },
            {
                pageId: 'semesters',
                title: 'Semesters',
                url: '/semesters',
            },
        ],
    },
    ```
- [ ] Ensure `courses` is also kept in `CORE_ADMIN_NAV_DEFINITIONS` so it resolves dynamically for both roles (which happens naturally since `core-admin-capability-map.ts` is updated).
- [ ] Update unit tests in `app/sentinel-core/src/components/sidebar/common/core-admin-sidebar.test.tsx` to verify that the "Academic Setup" item and its three sub-items are rendered correctly based on mock capability permissions.
      **Migration required:** No — sidebar configuration addition.

### Phase 3: Centralize Course Management Feature

**Goal:** Reorganize the courses module into a shared feature folder and implement capability-aware course controls.

- [ ] Create the target feature directories:
    - `app/sentinel-core/src/features/administration/courses/`
    - `app/sentinel-core/src/features/administration/courses/_components/`
    - `app/sentinel-core/src/features/administration/courses/hooks/`
- [ ] Move components from `app/sentinel-core/src/app/(protected)/(superadmin)/courses/_components/` to `app/sentinel-core/src/features/administration/courses/_components/`.
- [ ] Move hooks from `app/sentinel-core/src/app/(protected)/(superadmin)/courses/_hooks/` to `app/sentinel-core/src/features/administration/courses/hooks/`.
- [ ] Create `app/sentinel-core/src/features/administration/courses/courses-page.tsx` and move the page layout logic from `app/sentinel-core/src/app/(protected)/(superadmin)/courses/page.tsx` into this file, renaming the exported component to `CoursesPage`.
- [ ] In `app/sentinel-core/src/features/administration/courses/courses-page.tsx`, import `useAcademicScope` and utilize `isReadOnlyFor('courses')` to dynamically restrict add/edit/delete triggers for the `admin` role when permissions are missing (updating imports of dialogs and tables).
- [ ] Update imports in the moved courses dialogs, tables, and hooks to resolve correct paths and keep them scoped under the features folder.
- [ ] Update `app/sentinel-core/src/app/(protected)/(superadmin)/courses/page.tsx` to export a default function rendering the centralized `<CoursesPage />`.
- [ ] Create a new route file at `app/sentinel-core/src/app/(protected)/(admin)/courses/page.tsx` rendering the same centralized `<CoursesPage />`.
- [ ] Add JSDoc annotations to `CoursesPage` explaining the shared capability-driven presets.
- [ ] Implement a comprehensive unit test suite at `app/sentinel-core/src/features/administration/courses/courses-page.test.tsx` verifying:
    - Searching, loading, and listing states.
    - Hiding the `<AddCourseDialog />` when `courses:create` permission is missing.
    - Disabling/hiding update and delete actions when corresponding permissions are missing.
      **Migration required:** No — component migration and route wiring.

### Phase 4: Verification, Build Validation, and Release

**Goal:** Verify monorepo type compliance and confirm that all new sidebar links work flawlessly under test coverage.

- [ ] Run focused test command for frontend:
    ```bash
    pnpm --dir app/sentinel-core test
    ```
- [ ] Run linter checks to ensure compliance with Prettier formatting:
    ```bash
    pnpm --dir app/sentinel-core lint
    ```
- [ ] Execute full monorepo-wide compilation and build task:
    ```bash
    pnpm build
    ```
- [ ] Document final rollout changes in `docs/centralized-administrator-module.md` by updating the capability tables and sidebar navigation matrix.
      **Migration required:** No — verification and build checks.
