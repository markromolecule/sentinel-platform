# Analytics Backend Module

Build the `sentinel-api` analytics module (`/analytics`) including data-access queries, a service layer, OpenAPI controllers, and the corresponding `@sentinel/services` API client and `@sentinel/hooks` React Query hooks — so the frontend can later replace mock data with live API calls.

---

## 1-3-1 Options Analysis (Global 1-3-1 Rule)

Three viable approaches for modelling the analytics data-access layer:

### Option 1: Flat KPI Query in a Single Data File

Collapse all KPI, incidents, and department aggregation into one large SQL query inside a single `get-analytics-summary.ts` data function.

- **Pros:** Simple, single-trip.
- **Cons:** Monolithic, untestable in parts, hard to extend without breaking shape contracts.

### Option 2: One Data File per Metric Group (Recommended)

Separate data files for each logical analytics group: `get-analytics-kpis.ts`, `get-analytics-incident-severity.ts`, `get-analytics-incident-type.ts`, `get-analytics-department-integrity.ts`, `get-analytics-reports.ts`. Each file runs its own Kysely query and returns a typed result. The main `analytics.service.ts` orchestrates them under a single exported service class.

- **Pros:** Individually testable, follows the established module pattern (see `notification`, `telemetry`), easy to add new metrics. Cleanly maps to distinct frontend chart components.
- **Cons:** Multiple DB round-trips — acceptable since these are admin-only, low-frequency reads.

### Option 3: Materialized View / DB Function

Push aggregation logic into a Postgres materialized view or SQL function, called from a single data file.

- **Pros:** Fast at query time.
- **Cons:** Requires a schema migration with complex SQL, harder to iterate on, less transparent for developers unfamiliar with Postgres.

### Selected Choice & Recommendation

**Option 2** — one data file per metric group — is the best fit. It mirrors the notification and telemetry module patterns already established in the codebase, enables targeted Vitest unit tests, and keeps data-access functions small and readable.

---

## User Review Required

> [!IMPORTANT]
> **No Prisma migration needed** — the analytics module reads from existing tables (`exam_attempts`, `flagged_incidents`, `exams`, `analytics_reports`, `departments`, `users`) using Kysely. No new DB columns or tables are required.

> [!NOTE]
> The `/analytics` route will be **institution-scoped** (filtered by `institution_id` from the authenticated session context) and protected behind `authMiddleware`, matching the notification and calendar module patterns.

> [!NOTE]
> The analytics query hooks (`packages/hooks/src/query/analytics`) and API service (`packages/services/src/api/analytics.ts`) stubs already exist as **empty files** and will be filled in by this plan.

---

## Resolved Questions

> [!NOTE]
> **Report generation write path confirmed** — `GET /analytics/reports` is **read-only** (list existing reports). `POST /analytics/reports` is added to **trigger generation** of a new report record and write it to `analytics_reports`. This aligns with the `analytics_reports` table schema which already stores `type`, `format`, `status`, `file_url`, and `created_by`.

---

## Proposed Changes

### Package: `packages/shared`

#### [NEW] `packages/shared/src/constants/analytics.ts`

- Define `ANALYTICS_QUERY_KEYS` with typed key factory methods mirroring `TELEMETRY_QUERY_KEYS`:
    - `all`, `kpis(institutionId?)`, `incidentSeverity(institutionId?)`, `incidentType(institutionId?)`, `departmentIntegrity(institutionId?)`, `reports(institutionId?)`
- Also export `ANALYTICS_MUTATION_KEYS` for mutation cache invalidation:
    - `generateReport`

#### [MODIFY] [constants/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/constants/index.ts)

- Add `export { ANALYTICS_QUERY_KEYS } from './analytics';`

---

### Package: `packages/services`

#### [MODIFY] [api/analytics.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/analytics.ts)

- Implement typed API client functions calling the new `sentinel-api` endpoints:
    - `getAnalyticsKPIs(apiClient, params?)` → `GET /analytics/kpis`
    - `getAnalyticsIncidentSeverity(apiClient, params?)` → `GET /analytics/incident-severity`
    - `getAnalyticsIncidentType(apiClient, params?)` → `GET /analytics/incident-type`
    - `getAnalyticsDepartmentIntegrity(apiClient, params?)` → `GET /analytics/department-integrity`
    - `getAnalyticsReports(apiClient, params?)` → `GET /analytics/reports`
    - `generateAnalyticsReport(apiClient, payload)` → `POST /analytics/reports` — accepts `{ title, type, format }` body, returns newly created `AnalyticsReport`

---

### Package: `packages/hooks`

#### [NEW] `packages/hooks/src/query/analytics/use-analytics-kpis-query.ts`

- `useAnalyticsKPIsQuery(params?)` — `useQuery` wrapping `getAnalyticsKPIs`.

#### [NEW] `packages/hooks/src/query/analytics/use-analytics-incident-severity-query.ts`

- `useAnalyticsIncidentSeverityQuery(params?)` — `useQuery` wrapping `getAnalyticsIncidentSeverity`.

#### [NEW] `packages/hooks/src/query/analytics/use-analytics-incident-type-query.ts`

- `useAnalyticsIncidentTypeQuery(params?)` — `useQuery` wrapping `getAnalyticsIncidentType`.

#### [NEW] `packages/hooks/src/query/analytics/use-analytics-department-integrity-query.ts`

- `useAnalyticsDepartmentIntegrityQuery(params?)` — `useQuery` wrapping `getAnalyticsDepartmentIntegrity`.

#### [NEW] `packages/hooks/src/query/analytics/use-analytics-reports-query.ts`

- `useAnalyticsReportsQuery(params?)` — `useQuery` wrapping `getAnalyticsReports`.

#### [NEW] `packages/hooks/src/query/analytics/use-generate-analytics-report-mutation.ts`

- `useGenerateAnalyticsReportMutation()` — `useMutation` wrapping `generateAnalyticsReport`.
- On `onSuccess`: invalidates `ANALYTICS_QUERY_KEYS.reports()` so the reports list auto-refreshes.

#### [NEW] `packages/hooks/src/query/analytics/index.ts`

- Barrel export for all five query hooks and the mutation hook.

#### [MODIFY] [query/index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/index.ts)

- Add `export * from './analytics';`

---

### App: `app/sentinel-api` — Analytics Module

All files live under `app/sentinel-api/src/modules/general/analytics/`.

---

#### Data Layer (`data/`)

##### [NEW] `data/get-analytics-kpis.ts`

Kysely aggregation queries returning:

- `totalExams` — count of non-draft exams for the institution.
- `totalAttempts` — count of `exam_attempts` records.
- `completedAttempts` — count where `status = 'COMPLETED'`.
- `totalIncidents` — count of `flagged_incidents` joined via `exam_attempts`.
- `integrityIndex` — `(completedAttempts - flaggedAttempts) / completedAttempts * 100` (percentage, computed in TS).
- `activeExams` — count where `exam status = 'AVAILABLE' OR 'IN_PROGRESS'`.

##### [NEW] `data/get-analytics-incident-severity.ts`

Kysely GROUP BY on `flagged_incidents.severity`, joined through `exam_attempts → exams` for institution scoping. Returns `{ severity, count, percentage }[]`.

##### [NEW] `data/get-analytics-incident-type.ts`

Kysely GROUP BY on `flagged_incidents.incident_type` with institution scoping. Returns `{ type, count, percentage }[]`.

##### [NEW] `data/get-analytics-department-integrity.ts`

Kysely query joining `exam_attempts → exams → sections → departments`. Groups by `department_id`/`department_name` and counts `completed`, `flagged` (attempts with incidents), and `dropped` (attempts where status ≠ `COMPLETED` and no incidents). Returns `{ department, completed, flagged, dropped }[]`.

##### [NEW] `data/get-analytics-reports.ts`

Kysely SELECT from `analytics_reports` with optional institution scope via `created_by → users → institution_id`. Supports `limit` and `page` pagination. Returns `{ records, total_records, limit, page }`.

##### [NEW] `data/create-analytics-report.ts`

Kysely INSERT INTO `analytics_reports` with fields `title`, `type`, `format`, `status` (default `'READY'`), `file_url` (optional), `created_by` (from authed user). Returns the newly created row via `.returningAll().executeTakeFirstOrThrow()`.

---

#### Service Layer (`services/`)

##### [NEW] `services/map-analytics-kpis.ts`

Pure helper that receives raw KPI row aggregates and computes the `integrityIndex` percentage, returning a typed `AnalyticsKPIsSummary` object.

---

#### DTO (`analytics.dto.ts`)

##### [MODIFY] [analytics.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/analytics/analytics.dto.ts)

Define Zod OpenAPI schemas for all six analytics endpoints:

- `analyticsQuerySchema` — shared query params (`institution_id?`)
- `analyticsKPIsResponseSchema` — KPI metrics wrapped in `{ message, data }` envelope
- `analyticsIncidentSeverityResponseSchema` — severity distribution array
- `analyticsIncidentTypeResponseSchema` — incident type distribution array
- `analyticsDepartmentIntegrityResponseSchema` — department metrics array
- `analyticsReportsResponseSchema` — paginated reports list
- `generateAnalyticsReportBodySchema` — POST body: `{ title, type: z.enum(['completion','incident','performance']), format: z.enum(['pdf','csv','xlsx']) }`
- `generateAnalyticsReportResponseSchema` — single `AnalyticsReport` record response

---

#### Controllers (`controllers/`)

##### [NEW] `controllers/get-analytics-kpis.controller.ts`

- `getAnalyticsKPIsRoute` — `GET /kpis`
- `getAnalyticsKPIsRouteHandler` — calls `AnalyticsService.getKPIs()`

##### [NEW] `controllers/get-analytics-incident-severity.controller.ts`

- `getAnalyticsIncidentSeverityRoute` — `GET /incident-severity`
- `getAnalyticsIncidentSeverityRouteHandler`

##### [NEW] `controllers/get-analytics-incident-type.controller.ts`

- `getAnalyticsIncidentTypeRoute` — `GET /incident-type`
- `getAnalyticsIncidentTypeRouteHandler`

##### [NEW] `controllers/get-analytics-department-integrity.controller.ts`

- `getAnalyticsDepartmentIntegrityRoute` — `GET /department-integrity`
- `getAnalyticsDepartmentIntegrityRouteHandler`

##### [NEW] `controllers/get-analytics-reports.controller.ts`

- `getAnalyticsReportsRoute` — `GET /reports`
- `getAnalyticsReportsRouteHandler`

##### [NEW] `controllers/generate-analytics-report.controller.ts`

- `generateAnalyticsReportRoute` — `POST /reports`
- `generateAnalyticsReportRouteHandler` — validates body against `generateAnalyticsReportBodySchema`, calls `AnalyticsService.generateReport()`, returns `201` with the created report.

---

#### Main Service (`analytics.service.ts`)

##### [MODIFY] [analytics.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/analytics/analytics.service.ts)

Implement `AnalyticsService` class (static methods, mirroring `NotificationService`):

```typescript
export class AnalyticsService {
    static async getKPIs(args: { dbClient; institutionId? }): Promise<AnalyticsKPIsSummary> { ... }
    static async getIncidentSeverity(args): Promise<IncidentSeverityDistribution[]> { ... }
    static async getIncidentType(args): Promise<IncidentTypeDistribution[]> { ... }
    static async getDepartmentIntegrity(args): Promise<DepartmentIntegrityMetric[]> { ... }
    static async getReports(args): Promise<PaginatedAnalyticsReports> { ... }
    static async generateReport(args: { dbClient; userId; title; type; format }): Promise<AnalyticsReport> { ... }
}
```

---

#### Routes (`analytics.routes.ts`)

##### [MODIFY] [analytics.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/general/analytics/analytics.routes.ts)

Wire all six controllers via `OpenAPIHono`, protected by `authMiddleware`:

```typescript
const analyticsRoutes = new OpenAPIHono<HonoEnv>();
analyticsRoutes.use('*', authMiddleware);
analyticsRoutes
    .openapi(getAnalyticsKPIsRoute, getAnalyticsKPIsRouteHandler)
    .openapi(getAnalyticsIncidentSeverityRoute, getAnalyticsIncidentSeverityRouteHandler)
    .openapi(getAnalyticsIncidentTypeRoute, getAnalyticsIncidentTypeRouteHandler)
    .openapi(getAnalyticsDepartmentIntegrityRoute, getAnalyticsDepartmentIntegrityRouteHandler)
    .openapi(getAnalyticsReportsRoute, getAnalyticsReportsRouteHandler)
    .openapi(generateAnalyticsReportRoute, generateAnalyticsReportRouteHandler);
export default analyticsRoutes;
```

---

#### App Entry (`app.ts`)

##### [MODIFY] [app.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/app.ts)

- Add `import analyticsRouter from './modules/general/analytics/analytics.routes';`
- Add `app.route('/analytics', analyticsRouter);`

---

## Verification Plan

### Automated Tests

```bash
# Run API tests
pnpm --dir app/sentinel-api test

# Run shared package tests
pnpm --dir packages/shared test

# Full lint and format check
pnpm lint && pnpm format:check
```

### Manual Verification

1. Start the dev server: `pnpm --dir app/sentinel-api dev`
2. Open Scalar API docs at `http://localhost:4000/reference`
3. Confirm **six** new routes appear under the **Analytics** tag:
    - `GET /analytics/kpis`
    - `GET /analytics/incident-severity`
    - `GET /analytics/incident-type`
    - `GET /analytics/department-integrity`
    - `GET /analytics/reports`
    - `POST /analytics/reports`
4. Execute each GET with a valid bearer token and verify structured JSON responses match the defined schemas.
5. Execute `POST /analytics/reports` with body `{ "title": "Test Report", "type": "completion", "format": "pdf" }` — confirm `201` response and a new row appears via `GET /analytics/reports`.

---

## Phased Execution Roadmap

### Phase 1: Shared Constants

**Goal:** Add `ANALYTICS_QUERY_KEYS` to `@sentinel/shared` for use by hooks.

- [x] Create `packages/shared/src/constants/analytics.ts` with `ANALYTICS_QUERY_KEYS`
- [x] Modify `packages/shared/src/constants/index.ts` to export `ANALYTICS_QUERY_KEYS`
- [x] Write tests at `packages/shared/src/constants/analytics.test.ts` — assert key shapes and uniqueness
- [x] Run `pnpm --dir packages/shared test`

**Migration required:** No

---

### Phase 2: Data Access Layer

**Goal:** Implement all six Kysely data-access functions in `modules/general/analytics/data/`.

- [x] Implement `data/get-analytics-kpis.ts` — aggregate KPI metrics via Kysely
- [x] Implement `data/get-analytics-incident-severity.ts` — GROUP BY severity
- [x] Implement `data/get-analytics-incident-type.ts` — GROUP BY incident_type
- [x] Implement `data/get-analytics-department-integrity.ts` — JOIN departments, group outcomes
- [x] Implement `data/get-analytics-reports.ts` — paginated SELECT from `analytics_reports`
- [x] Implement `data/create-analytics-report.ts` — INSERT INTO `analytics_reports`, return created row
- [x] Write tests: `data/get-analytics-kpis.test.ts`, `data/get-analytics-incident-severity.test.ts`, `data/get-analytics-incident-type.test.ts`, `data/get-analytics-department-integrity.test.ts`, `data/get-analytics-reports.test.ts`, `data/create-analytics-report.test.ts` using `mockDbClient` pattern
- [x] Run `pnpm --dir app/sentinel-api test`

**Migration required:** No — all reads and writes target the existing `analytics_reports` table

---

### Phase 3: Service Layer & DTO

**Goal:** Wire data functions through the service class and define all Zod/OpenAPI schemas.

- [x] Create `services/map-analytics-kpis.ts` — pure TS helper to compute `integrityIndex`
- [x] Implement `analytics.service.ts` — `AnalyticsService` class with **six** static methods (including `generateReport`)
- [x] Implement `analytics.dto.ts` — all request/response Zod OpenAPI schemas including `generateAnalyticsReportBodySchema` and `generateAnalyticsReportResponseSchema`
- [x] Write tests at `analytics.service.test.ts` — mock data functions, assert service output shapes; include `generateReport` test asserting `201` insert path
- [x] Run `pnpm --dir app/sentinel-api test`

**Migration required:** No

---

### Phase 4: Controllers & Routes

**Goal:** Expose all six analytics endpoints via OpenAPIHono.

- [x] Implement `controllers/get-analytics-kpis.controller.ts`
- [x] Implement `controllers/get-analytics-incident-severity.controller.ts`
- [x] Implement `controllers/get-analytics-incident-type.controller.ts`
- [x] Implement `controllers/get-analytics-department-integrity.controller.ts`
- [x] Implement `controllers/get-analytics-reports.controller.ts`
- [x] Implement `controllers/generate-analytics-report.controller.ts` — POST handler returning `201`
- [x] Implement `analytics.routes.ts` — register all **six** routes with `authMiddleware`
- [x] Modify `app/sentinel-api/src/app.ts` — mount `analyticsRouter` at `/analytics`
- [x] Write controller tests for GET endpoints + `controllers/generate-analytics-report.controller.test.ts` — assert `201`, correct body shape, and service call
- [x] Run `pnpm --dir app/sentinel-api test`

**Migration required:** No

---

### Phase 5: API Service Client & React Query Hooks

**Goal:** Provide typed client functions, `useQuery` hooks, and a `useMutation` hook for frontend consumption.

- [x] Implement `packages/services/src/api/analytics.ts` — **six** typed API client functions (five GET + `generateAnalyticsReport` POST)
- [x] Create `packages/hooks/src/query/analytics/use-analytics-kpis-query.ts`
- [x] Create `packages/hooks/src/query/analytics/use-analytics-incident-severity-query.ts`
- [x] Create `packages/hooks/src/query/analytics/use-analytics-incident-type-query.ts`
- [x] Create `packages/hooks/src/query/analytics/use-analytics-department-integrity-query.ts`
- [x] Create `packages/hooks/src/query/analytics/use-analytics-reports-query.ts`
- [x] Create `packages/hooks/src/query/analytics/use-generate-analytics-report-mutation.ts` — `useMutation` wrapping `generateAnalyticsReport`, invalidates `ANALYTICS_QUERY_KEYS.reports()` on success
- [x] Create `packages/hooks/src/query/analytics/index.ts` — barrel export (five queries + one mutation)
- [x] Modify `packages/hooks/src/query/index.ts` — add `export * from './analytics'`
- [x] Write tests at `packages/hooks/src/query/analytics/use-analytics-kpis-query.test.ts` — mock API client, assert query key and data flow
- [x] Write tests at `packages/hooks/src/query/analytics/use-generate-analytics-report-mutation.test.ts` — assert mutation calls `generateAnalyticsReport` and invalidates the reports query key
- [x] Run `pnpm --dir packages/hooks test` and `pnpm --dir packages/services test`

**Migration required:** No

---

### Phase 6: Final Verification

**Goal:** Confirm all tests pass, lint is clean, and routes are discoverable in Scalar docs.

- [x] Run full test suite: `pnpm test`
- [x] Run `pnpm lint && pnpm format:check`
- [x] Manually verify **six** routes at `http://localhost:4000/reference` under **Analytics** tag
- [x] Test each GET endpoint with a valid auth token — confirm JSON responses match defined schemas
- [x] Test `POST /analytics/reports` with `{ "title": "Test", "type": "completion", "format": "pdf" }` — confirm `201` and new record in list

**Migration required:** No
