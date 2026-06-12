# feat-008 - Incident Logs & Analytics Page

**Date:** 2026-06-11  
**Type:** Feature  
**Summary:** Implement a dedicated Incident Logs & Analytics page for instructors to search, filter, and review student telemetry violations during exams. This includes creating backend routes in `sentinel-api`, service layer calls and custom hooks in `packages`, a new persistent exam sidebar layout in `sentinel-web`, and a virtualized logs table with single/bulk review workflows.

---

## 3 Viable Options

### Option A - Simple List Embedded in Exam Report Page

Add the incident logs as a new tab or expandable section inside the existing `/exams/[id]/report/page.tsx` page instead of a dedicated page.
_Tradeoff:_ Faster to implement and avoids routing/layout modifications, but clutters the report view and degrades performance for large log volumes.

### Option B - Dedicated Route & Sidebar Layout Refactor ✅ Recommended

Create the route `/exams/[id]/logs/page.tsx` and introduce a shared layout `/exams/[id]/layout.tsx` to provide a persistent exam-level sidebar (Lobby, Live Monitor, Incident Logs, Builder, Report) across all sub-routes.
_Tradeoff:_ Provides a clean, highly structured workspace and premium UX, but requires modifying routing structure for existing exam sub-pages.

### Option C - Separate Proctoring Telemetry Portal

Implement a separate log monitoring portal specifically for telemetry incident reviews, decoupled from the exam management workspace.
_Tradeoff:_ Keeps exam management simple, but introduces disjointed user navigation and higher authentication overhead.

---

## Best Option

**Option B** is the best option because it aligns perfectly with the goal to "add the new page on the sidebar of new layout on the exam page", ensures high-efficiency rendering of student logs, and keeps the instructor workspace clean and cohesive.

---

## Concrete Next Steps

1. Create backend DTO, service methods, and Hono route controllers under `app/sentinel-api/src/modules/examination/incidents/`.
2. Register the incident routes in `app/sentinel-api/src/modules/examination/exams/exam.routes.ts`.
3. Create the API client methods and TanStack Query hooks under `packages/services` and `packages/hooks`.
4. Create the shared layout `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/layout.tsx` to display the persistent exam sidebar.
5. Build the client components (Filter bar, virtualized Table, Drawer details panel, Bulk actions toolbar) and composition page.
6. Verify implementation via unit tests and manual browser validation.

---

## User Review Required

> [!IMPORTANT]
>
> - **Persistent Sidebar Layout:** Existing sub-routes under `/exams/[id]` (`/lobby`, `/monitoring`, `/report`, `/builder`) will be updated to inherit a shared layout that displays a persistent, collapsible sidebar for navigation inside a single exam.
> - **Bulk Actions Impact:** Performing bulk confirmations or dismissals will update the `status`, `reviewed_by`, `reviewed_at`, and optional `review_notes` of all selected incidents in the database via a single PATCH network request.

## Open Questions

> [!NOTE]
> None. Database models (`flagged_incidents`), API contracts, and UI constraints are fully defined.

---

## Proposed Changes

### Component: Backend (sentinel-api)

Create database querying, updating, and route-handling controllers for student incidents.

#### [NEW] [incidents.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/incidents.dto.ts)

Defines GET query parameters, response shape, and PATCH bulk review payload using Hono Zod OpenAPI.

#### [NEW] [incidents.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/incidents.service.ts)

Implements Kysely queries to fetch paginated incidents with joined student user profile and section details. Implements updates for single/bulk review states.

#### [NEW] [get-exam-incidents.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/controllers/get-exam-incidents.controller.ts)

GET endpoint handler to fetch paginated incidents with authorization checks.

#### [NEW] [review-exam-incidents.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/controllers/review-exam-incidents.controller.ts)

PATCH endpoint handler to update one or more incident review states.

#### [NEW] [incidents.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/incidents/incidents.routes.ts)

Registers GET and PATCH incident endpoints under `/exams/:id/incidents` and `/exams/:id/incidents/review`.

#### [MODIFY] [exam.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/exam.routes.ts)

Register `registerIncidentsRoutes` in `examsRoutes`.

---

### Component: Shared Packages (services & hooks)

#### [NEW] [incidents.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/incidents.ts)

Exposes `getExamIncidents` and `reviewIncidents` calling the `sentinel-api` endpoints.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/index.ts)

Exports services from `incidents.ts`.

#### [MODIFY] [types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/exams/types.ts)

Defines/exports TypeScript contracts for incident list elements, filters, and update results.

#### [NEW] [use-exam-incidents-query.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-exam-incidents-query.ts)

Provides infinite query caching hook `useExamIncidentsQuery` via TanStack Query.

#### [NEW] [use-update-exam-incidents-mutation.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-update-exam-incidents-mutation.ts)

Provides mutation hook `useUpdateIncidentsMutation` for single and bulk reviews.

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/index.ts)

Exports hook functions.

---

### Component: Frontend UI (sentinel-web)

Create layout, page, filters, table, drawer, and bulk action elements.

#### [NEW] [layout.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/layout.tsx>)

Shared Next.js layout displaying a persistent left sidebar containing links (Lobby, Live Monitor, Incident Logs, Builder, Report) for the specific exam.

#### [NEW] [page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/page.tsx>)

Incident Logs page that handles page metadata, pre-fetches initial data via server-side props, and suspends components.

#### [NEW] [incident-filters.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-filters.tsx>)

Client control layout with text input (student search) and selects (section, severity, type, status).

#### [NEW] [incident-table.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-table.tsx>)

Infinite-scrolling table showing incidents, checkbox row selectors, severity indicator borders, and click-to-open details.

#### [NEW] [incident-drawer.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-drawer.tsx>)

Detail panel displaying timestamp, evidence snapshot, elapsed timeline, incident type metadata, review status actions (Confirm / Dismiss), and review notes input.

#### [NEW] [bulk-actions.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/bulk-actions.tsx>)

Floating toolbar visible when item count is > 0, supporting batch Confirm and Dismiss operations.

---

## Phases & Execution Plan

### Phase 1: Database access, Service Layer, and backend endpoints

**Goal:** Create database queries, service logic, API route controllers, and registers for incidents list and review endpoints.

- [ ] Create `app/sentinel-api/src/modules/examination/incidents/incidents.dto.ts` - DTO definitions
- [ ] Create `app/sentinel-api/src/modules/examination/incidents/incidents.service.ts` - database Kysely query and update operations
- [ ] Create `app/sentinel-api/src/modules/examination/incidents/controllers/get-exam-incidents.controller.ts` - GET route handler
- [ ] Create `app/sentinel-api/src/modules/examination/incidents/controllers/review-exam-incidents.controller.ts` - PATCH route handler
- [ ] Create `app/sentinel-api/src/modules/examination/incidents/incidents.routes.ts` - register endpoints
- [ ] Modify `app/sentinel-api/src/modules/examination/exams/exam.routes.ts` - call registers
- [ ] Write unit tests for query and review service operations in `app/sentinel-api/src/modules/examination/incidents/tests/incidents.service.test.ts`
- [ ] Run `pnpm --dir app/sentinel-api test` and verify backend passes

**Migration required:** No - the existing schema definition for `flagged_incidents` contains all required columns.

---

### Phase 2: Client SDK and Custom Query Hooks

**Goal:** Create frontend API calls, contract mappings, and React Query hooks.

- [ ] Create `packages/services/src/api/exams/incidents.ts` - API calls getExamIncidents and reviewIncidents
- [ ] Modify `packages/services/src/api/exams/types.ts` - define API-specific TypeScript contracts
- [ ] Create `packages/hooks/src/query/exams/use-exam-incidents-query.ts` - infinite query caching hook
- [ ] Create `packages/hooks/src/query/exams/use-update-exam-incidents-mutation.ts` - mutation review hook
- [ ] Modify export files `packages/services/src/api/exams/index.ts` and `packages/hooks/src/query/exams/index.ts`
- [ ] Write unit tests in `packages/hooks/src/query/exams/use-exam-incidents-query.test.ts`
- [ ] Run `pnpm --dir packages/hooks test` to confirm compilation and test execution

---

### Phase 3: Exam Sidebar Layout Integration

**Goal:** Refactor Next.js App Router for exams to include a persistent workspace sidebar.

- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/layout.tsx` - shared workspace layout with sidebar navigation
- [ ] Align existing subpages (`lobby`, `monitoring`, `report`, `builder`) by ensuring they are wrapped in this layout correctly
- [ ] Write unit tests in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/layout.test.tsx`
- [ ] Run `pnpm --dir app/sentinel-web test` to verify layout test suite compiles and runs

---

### Phase 4: Frontend incident logs page and widgets

**Goal:** Implement client components (Filters, virtual Table, Drawer details, Bulk actions) and the main logs screen.

- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-filters.tsx`
- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-table.tsx`
- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/incident-drawer.tsx`
- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/_components/bulk-actions.tsx`
- [ ] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/page.tsx`
- [ ] Write unit tests for page and sub-components in `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/logs/page.test.tsx`
- [ ] Run `pnpm --dir app/sentinel-web test` and verify all tests pass

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir app/sentinel-api test` to verify API and Kysely service logic.
- Run `pnpm --dir packages/hooks test` to verify query hooks.
- Run `pnpm --dir app/sentinel-web test` to verify sidebar layout, components, and the page container.

### Manual Verification

1. Open the browser and go to `http://localhost:3000/exams/[id]/logs`.
2. Confirm the persistent exam sidebar is visible and highlights the "Incident Logs" tab.
3. Test search and filtering (section selection, severity buttons, incident types).
4. Select a single incident, verify it displays the evidence snapshot, details timeline, and allows Confirm/Dismiss actions.
5. Verify bulk action panel appears at the bottom on multi-selection, and bulk Confirm/Dismiss updates database state in a single request.
6. Verify responsive layout behavior on tablet and mobile viewports (sidebar should stack below).
