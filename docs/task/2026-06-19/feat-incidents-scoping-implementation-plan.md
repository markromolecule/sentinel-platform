# Incident Logs Scoping & Access Control Implementation Plan

## Goal Description

Restrict visibility and mutations of proctoring incident logs to align with academic and administrative boundaries: **Superadmins** view logs within their assigned department, **Admins** view logs within their assigned course, and **Instructors** view logs only for exams they own, are assigned to, or are shared with.

## User Review Required

> [!IMPORTANT]
> **Dynamic Role Context Requirement**:
> Enforcing department-level and course-level scopes relies on `user_profiles` having correct `department_id` and `course_id` associations populated in the database. Ensure that the test suite and environment seed profiles correctly assign these relationships.
>
> **Global Scoping for Support**:
> Platform-wide roles (`support`) will bypass these filters and retain cross-tenant / global access as defined in `resolveAssessmentInstitutionId`.

## Open Questions

> [!NOTE]
> * **Disciplinary Officers**: How should disciplinary officers be scoped? Currently they possess global or institution-wide `incidents:view`/`incidents:review` permissions. We plan to keep them at the institution scope (unfiltered by department/course) unless they are associated with a specific department profile.
> * **Instructor Classroom Permissions**: Should instructors see all incidents for an exam if they are assigned to *any* classroom associated with that exam, or only the students in *their* assigned classroom? The current requirement states they see incidents on the "exam of their own or assigned to them", meaning exam-level visibility is granted if they proctor/instruct any part of it. We will implement exam-level visibility.

---

## Proposed Options & Tradeoffs

### Option 1 (Recommended): Kysely Query-Level Scoping Wrapper (Robust & Scalable)
* **Description**: Create a shared Kysely utility function `applyIncidentQueryScoping(query, userScope)` that dynamically appends Kysely subquery predicates (`exists`) to restrict results based on the user's role (`superadmin`, `admin`, `instructor`) and assigned IDs (`departmentId`, `courseId`, `userId`).
* **Tradeoff**: Very secure and DRY, eliminating data leaks across all endpoints (bulk listings, single record fetches, and reviews).

### Option 2: Controller-Level Validation (Simple & Fast)
* **Description**: Resolve user scopes in each controller and append filters directly as route query parameters, returning 403 Forbidden if requests target other scopes.
* **Tradeoff**: Fast to write, but easily prone to leakage if a controller does not fully check parameter constraints.

### Option 3: PostgreSQL Row Level Security (RLS) (Creative/Alternative)
* **Description**: Implement PostgreSQL RLS policies on the `flagged_incidents` table using session variables for role and scoping.
* **Tradeoff**: Extremely robust database-level security, but introduces complex Prisma/Kysely type generation issues and custom migration scripts.

---

## Best Option Selection

We choose **Option 1 (Kysely Query-Level Scoping Wrapper)** because it handles security logic at the database query layer dynamically, works out-of-the-box with existing Prisma and Kysely client definitions, requires no database migrations, and matches scoping patterns already used in Sentinel (e.g., `get-exams.ts`).

---

## Proposed Changes

### 1. Dynamic Permissions Configuration
#### [MODIFY] [permissions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/permissions.ts)
* Add `incidents:view`, `incidents:review`, and `incidents:export` to `superadmin`, `admin`, and `instructor` in `SYSTEM_ROLE_BLUEPRINTS`.

---

### 2. Query Scoping Helper
#### [NEW] [query-scoping.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/data/query-scoping.ts)
* Implement `applyIncidentQueryScoping(query, userScope)` mapping Kysely exists subqueries for:
  * `superadmin` $\rightarrow$ matching `sections.department_id` or `class_groups.section.department_id` or `subject_departments.department_id`.
  * `admin` $\rightarrow$ matching `sections.course_id` or `class_groups.section.course_id`.
  * `instructor` $\rightarrow$ matching `exams.created_by` or `exam_section_assignments.instructor_id` or `proctor_assignments.instructor_id` or `exam_shares.user_id` or `classroom_instructor_assignments.instructor_user_id`.

---

### 3. Service Layer Integration
#### [MODIFY] [get-incidents.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/data/get-incidents.ts)
* Add optional `userScope` to `buildIncidentQuery`, `getIncidentsFromDb`, and `getIncidentByIdFromDb`.
* Call `applyIncidentQueryScoping(query, userScope)` inside `buildIncidentQuery`.

#### [MODIFY] [storage.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/storage.service.ts)
* Update `getIncidents`, `getIncidentById`, and `updateIncidentReview` signatures to accept `userScope`.

#### [MODIFY] [incident-query.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-query.service.ts) & [incident-review.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/services/incident-review.service.ts)
* Pass `userScope` from facade methods down to database access functions.

#### [MODIFY] [incidents.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/incidents.service.ts)
* Update `getExamIncidentsData` and `reviewExamIncidentsData` to accept and apply `userScope`.

---

### 4. Controller Layer & Middleware Integration
#### [MODIFY] [get-incidents.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/controllers/get-incidents.controller.ts)
* Check `requireActivePermission(c, 'incidents:view')`.
* Extract `user` and `role` from context, build `userScope`, and pass to `TelemetryStorageService.getIncidents`.

#### [MODIFY] [get-incident.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/controllers/get-incident.controller.ts)
* Check `requireActivePermission(c, 'incidents:view')`.
* Pass `userScope` to `TelemetryStorageService.getIncidentById`.

#### [MODIFY] [update-incident.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/telemetry/storage/controllers/update-incident.controller.ts)
* Check `requireActivePermission(c, 'incidents:review')`.
* Pass `userScope` to `TelemetryStorageService.updateIncidentReview`.

#### [MODIFY] [get-exam-incidents.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/controllers/get-exam-incidents.controller.ts)
* Check `requireActivePermission(c, 'incidents:view')`.
* Pass `userScope` to `IncidentsService.getExamIncidentsData`.

#### [MODIFY] [review-exam-incidents.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/controllers/review-exam-incidents.controller.ts)
* Check `requireActivePermission(c, 'incidents:review')`.
* Pass `userScope` to `IncidentsService.reviewExamIncidentsData`.

---

## Plan Checklist

### Phase 1: Shared Constants & Database Query Helpers
**Goal**: Configure role permission keys and build the reusable Kysely query scoping filter.

- [x] Modify `packages/shared/src/constants/permissions.ts` to add incident keys to superadmin, admin, and instructor roles.
- [x] Create `app/sentinel-api/src/modules/telemetry/storage/data/query-scoping.ts` and implement `applyIncidentQueryScoping`.
- [x] Modify `app/sentinel-api/src/modules/telemetry/storage/data/get-incidents.ts` to hook in the scoping filter.
- [x] Write unit tests in `app/sentinel-api/src/modules/telemetry/storage/tests/scoping.test.ts` to verify `applyIncidentQueryScoping` outputs correct WHERE clauses.
      **Migration required**: No

### Phase 2: Telemetry API Integration & Route Updates
**Goal**: Secure telemetry query endpoints with permission checks and pass active scopes.

- [x] Update `app/sentinel-api/src/modules/telemetry/storage/storage.service.ts` and its services (`incident-query.service.ts`, `incident-review.service.ts`).
- [x] Update `get-incidents.controller.ts` to fetch `userScope` and assert `incidents:view`.
- [x] Update `get-incident.controller.ts` to fetch `userScope` and assert `incidents:view`.
- [x] Update `update-incident.controller.ts` to fetch `userScope` and assert `incidents:review`.
- [x] Run vitest tests in `app/sentinel-api/src/modules/telemetry/storage/tests/` to verify all storage routes function correctly.
      **Migration required**: No

### Phase 3: Exam-Specific Incidents Scoping
**Goal**: Secure specific exam incident listing and review endpoints.

- [x] Update `app/sentinel-api/src/modules/examination/incidents/incidents.service.ts` to integrate query scoping.
- [x] Update `get-exam-incidents.controller.ts` and `review-exam-incidents.controller.ts` to verify permissions and pass scope parameters.
- [x] Run overall test suite `pnpm test` and verify that all Hono API routes build and pass.
      **Migration required**: No

---

## Verification Plan

### Automated Tests
* Run vitest tests for telemetry storage:
  ```bash
  pnpm --dir app/sentinel-api test storage.test.ts scoping.test.ts
  ```
* Run all api tests:
  ```bash
  pnpm --dir app/sentinel-api test
  ```

### Manual Verification
* Access the Core Admin dashboard (`sentinel-core`), navigate to the **Permissions & Roles** page, and verify that `View Incidents` (`incidents:view`), `Review Incidents` (`incidents:review`), and `Export Incidents` (`incidents:export`) are visible and correct for Superadmin and Admin roles.
* Log in as an Admin scoped to Course A, attempt to query the incidents API, and verify that only incidents belonging to exams in Course A are retrieved.
* Log in as an Instructor, attempt to fetch incidents for an exam they do not own or proctor, and verify that the API returns a 404/403 or empty array.
