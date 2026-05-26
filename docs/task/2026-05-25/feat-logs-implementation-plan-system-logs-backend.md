# System Logs Backend Module — Implementation Plan

> **Status:** Draft  
> **Version:** 1.0  
> **Source spec:** [create-system-logs-backend.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/create-system-logs-backend.md)  
> **Implementation plan ref:** [.agents/rules/implementation-plan.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/.agents/rules/implementation-plan.md)  
> **Workflow refs:** [.agents/workflows/to-do-workflow.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/.agents/workflows/to-do-workflow.md)  

---

## Goal

Build the **System Logs** backend module under `app/sentinel-api/src/modules/general/logs/`. This module will capture, store, and expose end-to-end activity logs across the entire system. It includes modifying the schema to support strict scoping to parent institutions and sub-branches, implementing structured Kysely repositories, defining OpenAPI schemas/DTOs, and setting up scoped controllers for authentication, activity, and system logs.

---

## User Review Required

> [!IMPORTANT]
> **Database Schema Update Needed:** The existing `audit_logs` model in `schema.prisma` does not contain scoping fields (`institution_id`, `branch_id`). We must add these columns to support the core requirement of parent-institution scoping and sub-branch context isolation. A database migration will be generated and run in Phase 1.

> [!WARNING]
> **Data Security and Scoping Enforcements:** 
> - Users authenticated at a **parent institution** can query logs for all branches under that parent (or filter by `branchId`).
> - Users authenticated at a **child branch** can *only* query logs for that specific branch. Any attempts to request logs outside their child branch boundary will be rejected with an unauthorized error.

---

## Open Questions

> [!NOTE]
> **Internal Logging Mechanism:** Should we automatically capture REST requests via a global middleware, or rely on explicit logging calls via `LogsService` inside specific modules (e.g., auth, exams, user update routes)?  
> *Proposed Answer:* Explicit module-level service calls are safer, more specific, and prevent logging noise or credential leaks. We will provide a robust, reusable `LogsService.createLog()` method that other modules can easily invoke.

---

## Proposed Changes

We will create and modify the following files to implement the System Logs backend module.

### Database Layer

#### [MODIFY] [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)
Add scoping columns and indexes to the `audit_logs` model:
```prisma
model audit_logs {
  log_id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id       String?   @db.Uuid
  action        String    @db.VarChar(100)
  resource_type String?   @db.VarChar(50)
  resource_id   String?   @db.VarChar(100)
  details       Json?
  ip_address    String?   @db.VarChar(45)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  institution_id String?   @db.Uuid
  branch_id      String?   @db.Uuid

  @@index([institution_id])
  @@index([branch_id])
  @@index([created_at])
  @@schema("public")
}
```

---

### Backend API Module (`sentinel-api`)

#### [NEW] [logs.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/logs.dto.ts)
OpenAPI and Zod request/response validation schemas for log queries, filtering, and paging.

#### [NEW] [create-log.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/data/create-log.ts)
Structured Kysely repository logic for inserting new logs.

#### [NEW] [get-logs.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/data/get-logs.ts)
Structured Kysely repository query builder for searching, filtering, and paging logs.

#### [NEW] [logs.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/logs.service.ts)
Main orchestrator service that coordinates sub-services, resolves user institution hierarchy, and exposes internal log creation interfaces.

#### [NEW] [auth-logs.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/services/auth-logs.service.ts)
Handles logs relating to authentication, session monitoring, and failed access attempts.

#### [NEW] [activity-logs.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/services/activity-logs.service.ts)
Handles user CRUD activity, admin actions, and records operations.

#### [NEW] [system-logs.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/services/system-logs.service.ts)
Handles backend system events, job triggers, and errors.

#### [NEW] [get-auth-logs.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/controllers/get-auth-logs.controller.ts)
Route handler for auth-related activities.

#### [NEW] [get-activity-logs.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/controllers/get-activity-logs.controller.ts)
Route handler for user actions and operational records.

#### [NEW] [get-system-logs.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/controllers/get-system-logs.controller.ts)
Route handler for system diagnostics and error events.

#### [NEW] [logs.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/logs/logs.routes.ts)
OpenAPI route definitions mapping URLs `/logs/auth`, `/logs/activity`, `/logs/system` to controllers under `authMiddleware`.

#### [MODIFY] [app.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts)
Mount the `logsRouter` under the `/logs` path.

---

## Phased Implementation Plan

### Phase 1: Database Schema & Migration
**Goal:** Add parent-institution and branch scoping fields to `audit_logs` and generate database clients.

- [x] Modify `packages/db/prisma/schema.prisma` to append `institution_id` and `branch_id` to the `audit_logs` model, complete with single-column indexes for fast scoping queries.
- [x] Generate database migrations and deploy them:
  ```bash
  pnpm --dir packages/db prisma migrate dev --name add_institution_and_branch_to_audit_logs
  ```
- [x] Regenerate DB clients to sync the new model structures:
  ```bash
  pnpm --dir packages/db generate
  ```
- [x] Rebuild the `@sentinel/db` package to propagate types:
  ```bash
  pnpm --dir packages/db build
  ```
- [x] Add JSDoc to DB helper configurations.
- [x] Create a basic test checking generated client parity with the new schema columns.
      **Migration required:** Yes. Schema model `audit_logs` will be altered with 2 new columns and 3 indexes.

---

### Phase 2: DTOs & OpenAPI Validation Schemas
**Goal:** Define request, response validation schemas, and types with OpenAPI specifications.

- [x] Create `app/sentinel-api/src/modules/general/logs/logs.dto.ts`.
- [x] Define the base request query schema `logQuerySchema` with fields `page`, `pageSize`, `startDate`, `endDate`, `action`, `resourceType`, `userId`, `branchId`.
- [x] Define the base response log shape `logRecordSchema` detailing fields: `logId`, `userId`, `action`, `resourceType`, `resourceId`, `details`, `ipAddress`, `createdAt`, `institutionId`, `branchId`, `userFirstName`, `userLastName`.
- [x] Create OpenAPI-compatible list response schemas for `/logs/auth`, `/logs/activity`, and `/logs/system`.
- [x] Co-locate and write test file `app/sentinel-api/src/modules/general/logs/tests/logs.dto.test.ts` to test schema constraints (e.g., negative pagination pages, invalid Date structures).

---

### Phase 3: Data Access Layer (Repositories)
**Goal:** Implement Kysely data access queries for creating and fetching logs with strict tenant isolation.

- [x] Implement repository function `createLogData` in `app/sentinel-api/src/modules/general/logs/data/create-log.ts` to handle record insertions.
- [x] Implement query builder function `getLogsData` in `app/sentinel-api/src/modules/general/logs/data/get-logs.ts` supporting dynamic filters and strict scoping to context `institution_id` and `branch_id`.
- [x] Write unit tests for repositories in `app/sentinel-api/src/modules/general/logs/tests/logs-repository.test.ts` mocking `dbClient` and verifying that:
  - Scoping is correctly applied based on institution boundaries.
  - Optional search and Date-range filters map to Kysely statements correctly.
        **Migration required:** No.

---

### Phase 4: Service Layer & Business Logic
**Goal:** Break down logging logic into domain sub-services and implement institutional boundary validation.

- [x] Create sub-service `AuthLogsService` under `app/sentinel-api/src/modules/general/logs/services/auth-logs.service.ts` to parse and format authentication logs.
- [x] Create sub-service `ActivityLogsService` under `app/sentinel-api/src/modules/general/logs/services/activity-logs.service.ts` to format user action records.
- [x] Create sub-service `SystemLogsService` under `app/sentinel-api/src/modules/general/logs/services/system-logs.service.ts` to handle system errors.
- [x] Implement main orchestrator `logs.service.ts` including resolving:
  - The caller's institution kind (`PARENT`, `CHILD`, `STANDALONE`).
  - Strict security check mapping requested `branchId` filters to user credentials (a child user cannot request any logs where `branchId !== user.institutionId`).
- [x] Co-locate service tests in `app/sentinel-api/src/modules/general/logs/tests/logs-service.test.ts` to assert that hierarchical scoping logic functions correctly.

---

### Phase 5: Controllers & Routes Mounting
**Goal:** Build thin route controllers and map routes securely inside the main application.

- [x] Implement `get-auth-logs.controller.ts` under `app/sentinel-api/src/modules/general/logs/controllers/` to fetch auth records.
- [x] Implement `get-activity-logs.controller.ts` under `app/sentinel-api/src/modules/general/logs/controllers/` to query user CRUD actions.
- [x] Implement `get-system-logs.controller.ts` under `app/sentinel-api/src/modules/general/logs/controllers/` to get system diagnoses.
- [x] Write routes in `app/sentinel-api/src/modules/general/logs/logs.routes.ts` mapped to `authMiddleware`.
- [x] Mount route definitions in `app/sentinel-api/src/app.ts` under path `/logs`.
- [x] Co-locate and write controller tests in `app/sentinel-api/src/modules/general/logs/tests/logs-controllers.test.ts` verifying HTTP responses, error states, and schema parsing.

---

### Phase 6: E2E Verification & Review
**Goal:** Validate code conventions, complete testing suites, and guarantee production readiness.

- [x] Execute focused tests:
  ```bash
  pnpm --dir app/sentinel-api test
  ```
- [x] Run formatting and linting scripts:
  ```bash
  pnpm lint
  pnpm format:check
  ```
- [x] Draft a release walkthrough record listing the finalized endpoints.

---

## Verification Plan

### Automated Tests
- Run database integration tests using:
  ```bash
  pnpm --dir app/sentinel-api test
  ```
- Verify API contract responses by running Scalar documentation routes:
  `http://localhost:3000/reference` in a local browser environment.

### Manual Verification
1. Call authentication route and generate audit logs.
2. Query `/logs/auth` for user parent institution and assert logs returned are correctly scoped.
3. Attempt to fetch logs matching child branch coordinates with another branch's token, asserting it returns an explicit `403 Forbidden` response.
4. Call `/logs/system` and verify server-level background job events are listed with accurate detail objects.
