# Implementation Plan: Administrator Classroom Management

## Phase 1: Configure Admin Classroom Capabilities and Navigation

**Goal:** Expose the classroom feature in the sentinel-core role-based navigation and capability maps.

- [x] Implement `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts`
    - Add `'classrooms'` to `CoreAdminPageId`.
    - Add `'classrooms'` configuration to `CORE_ADMIN_PAGE_CAPABILITIES`.
        - allowedRoles: `['admin', 'superadmin']`
        - requiredViewPermissions: `['classrooms:view']`
        - requiredActionPermissions: `['classrooms:create', 'classrooms:update', 'classrooms:delete']`
- [x] Implement `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`
    - Add the `Classrooms` navigation item under the "Management" section, alongside `Courses`.

## Phase 2: Port Classrooms Feature Components to Sentinel Core

**Goal:** Extract and adapt the classroom UI components from sentinel-web for sentinel-core usage.

- [x] Create `app/sentinel-core/src/features/administration/classrooms/_components/` directory.
- [x] Port classroom listing components from `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/_components` into `app/sentinel-core/src/features/administration/classrooms/_components`. Ensure they use the `PermissionGate` checks for CUD actions based on the `classrooms` capability.
- [x] Port `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/page.tsx` into `app/sentinel-core/src/features/administration/classrooms/classrooms-page.tsx`. Adapt the `PageHeader` and handle access-denied states (using `PermissionDeniedState`).
- [x] Port `app/sentinel-web/src/app/(protected)/(instructor)/classrooms/[id]/page.tsx` into `app/sentinel-core/src/features/administration/classrooms/classroom-detail-page.tsx`. Ensure permission gates apply to assigning teachers and students.

## Phase 3: Setup Admin Route Handlers

**Goal:** Create the Next.js routes in sentinel-core that render the ported classroom feature pages.

- [x] Implement `app/sentinel-core/src/app/(protected)/classrooms/page.tsx` — render `ClassroomsPage`.
- [x] Implement `app/sentinel-core/src/app/(protected)/classrooms/[id]/page.tsx` — render `ClassroomDetailPage`.

**Migration required:** No — the classrooms table and necessary RBAC permissions (`classrooms:view`, `classrooms:create`, `classrooms:update`, `classrooms:delete`) already exist.
