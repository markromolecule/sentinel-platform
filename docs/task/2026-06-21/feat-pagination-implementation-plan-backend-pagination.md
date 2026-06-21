# Backend Pagination Components & API Implementation Plan

Implement backend pagination (supporting `page` and `limit` query parameters) for the remaining 8 core and identity modules, and update the corresponding frontend API calls and query hooks.

## 1-3-1 Rule Analysis

### Viable Options

#### Option 1: Inline Service Pagination (Simple & Fast)
Define a local `paginateItems` helper function in each of the 8 services (replicating the pattern used in `SubjectService`).
- **Tradeoff**: Fast and isolated, but introduces code duplication across 8 service files.

#### Option 2: Shared Backend Utility Pagination (Robust & Scalable) [RECOMMENDED]
Create a central pagination utility in `app/sentinel-api/src/lib/pagination.ts` and use it in all 8 module services.
- **Tradeoff**: Very clean and maintains consistent pagination logic, but requires importing from a shared api utility.

#### Option 3: Database-Level Offset Pagination (Performance Optimized)
Refactor the underlying database query files in `*/data/*.ts` to perform database-level `LIMIT`/`OFFSET` queries.
- **Tradeoff**: Highly performant for massive databases, but carries high risk and complexity because it requires refactoring several raw SQL/Kysely query builders.

### Selected Option
We select **Option 2** (Shared Backend Utility Pagination) as it strikes the perfect balance between architectural cleanliness and safety. It avoids database query refactoring risks (Option 3) while eliminating code duplication (Option 1).

---

## User Review Required

> [!IMPORTANT]
> The pagination logic wraps returning arrays in a `{ data, pagination }` structure. For the frontend query hooks, we use TypeScript signature overloading to ensure backwards compatibility so that components not passing `page` and `limit` still receive standard arrays of models, preventing build breaks.

---

## Open Questions

> [!NOTE]
> 1. **Default limits**: Do we want a uniform default limit across all these endpoints (e.g. 10 items) when pagination query params are present but limit is omitted? (Recommended: Yes, default to 10).
> 2. **Max limits**: Should we enforce a maximum limit (e.g., 100) to prevent denial-of-service/memory exhaustion on large tables? (Recommended: Yes, enforce `max(100)` using Zod).

---

## Proposed Changes

### Phase 1: Shared Backend Utility & DTO Updates
**Goal**: Create the shared pagination helper and update DTO schemas for all 8 modules.

- [x] Create shared helper `app/sentinel-api/src/lib/pagination.ts` containing the `paginateItems` helper function.
- [x] Update DTO schemas in the following files to include `page` and `limit` in `get*Schema.request.query` and `pagination` in `response`:
  - [institution.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/institutions/institution.dto.ts)
  - [departments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/departments.dto.ts)
  - [courses.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/courses/courses.dto.ts)
  - [sections.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/sections/sections.dto.ts)
  - [semesters.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/semesters.dto.ts)
  - [room.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/room.dto.ts)
  - [student-whitelist.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/student-whitelist/student-whitelist.dto.ts)
  - [enrollments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts)
- [x] Run `pnpm test` to verify no schema or typescript errors are introduced.

**Migration required**: No

---

### Phase 2: Service & Controller Implementation (Core Modules)
**Goal**: Apply pagination in the services and controllers for the 6 core modules.

- [x] Update services and controllers to support pagination:
  - **Institutions**: [get-institutions.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/institutions/services/get-institutions.service.ts) and [get-institutions.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/institutions/controllers/get-institutions.controller.ts)
  - **Departments**: [departments.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/departments.service.ts) and [get-departments.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/departments/controllers/get-departments.controller.ts)
  - **Courses**: [courses.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/courses/courses.service.ts) and [get-courses.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/courses/controllers/get-courses.controller.ts)
  - **Sections**: [sections.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/sections/sections.service.ts) and [get-sections.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/sections/controllers/get-sections.controller.ts)
  - **Semesters**: [semesters.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/semesters.service.ts) and [get-semesters.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/controllers/get-semesters.controller.ts)
  - **Rooms**: [room.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/room.service.ts) and [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts)
- [x] Add/update Vitest integration tests for paginating these endpoints.
- [x] Run `pnpm --dir app/sentinel-api test` to verify backend core paginations.

**Migration required**: No

---

### Phase 3: Service & Controller Implementation (Identity Modules)
**Goal**: Apply pagination in services and controllers for the 2 identity modules.

- [x] Update services and controllers to support pagination:
  - **Student Whitelist**: [student-whitelist.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/student-whitelist/student-whitelist.service.ts) and [get-student-whitelist.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/student-whitelist/controllers/get-student-whitelist.controller.ts)
  - **Enrollments**: [enrollments.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.service.ts) and [get-enrollments.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/controllers/get-enrollments.controller.ts)
- [x] Add/update Vitest integration tests for identity module pagination.
- [x] Run `pnpm --dir app/sentinel-api test` to verify backend identity paginations.

**Migration required**: No

---

### Phase 4: Frontend API Services & Hooks Update
**Goal**: Update frontend service calls and Tanstack Query hooks to support paginated calls while maintaining backwards compatibility.

- [x] Update frontend services in `packages/services/src/api/` to accept `page` and `limit`, and return `PaginatedApiResponse<T>`:
  - [institutions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/institutions.ts)
  - [departments.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/departments.ts)
  - [courses.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/courses.ts)
  - [sections.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/sections.ts)
  - [semesters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/semesters.ts)
  - [room.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/room.ts)
  - [student-whitelist.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/student-whitelist.ts)
  - [subjects.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/subjects.ts)
- [x] Update Tanstack query hooks in `packages/hooks/src/query/` to export overloaded signatures returning `T[]` (when unpaginated) or `PaginatedApiResponse<T>` (when paginated):
  - [use-institutions-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/institutions/use-institutions-query.ts)
  - [use-departments-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/departments/use-departments-query.ts)
  - [use-courses-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/courses/use-courses-query.ts)
  - [use-sections-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/sections/use-sections-query.ts)
  - [use-semesters-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/semesters/use-semesters-query.ts)
  - [use-rooms-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/rooms/use-rooms-query.ts)
  - [use-student-whitelist-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/student-whitelist/use-student-whitelist-query.ts)
- [x] Run overall build using `pnpm build` to ensure type compatibility across frontend applications.

**Migration required**: No

---

## Verification Plan

### Automated Tests
- Run backend controller tests using Vitest:
  `pnpm --dir app/sentinel-api test`
- Build the entire monorepo:
  `pnpm build`

### Manual Verification
- Deploy and verify `/institutions` and other endpoints return the `pagination` metadata correctly when `page` and `limit` parameters are provided.
