---
title: "Room Management Read Query Optimization & Zero-Mutation Status Resolution"
type: context
status: ready
created: "2026-09-17"
tags: [context, rooms, performance, queries, support, kpi]
feature: "room-management-query-optimization"
---

# Room Management Read Query Optimization & Zero-Mutation Status Resolution Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  When users navigate to the Room Management page (`/rooms`) or access the Support Dashboard (`/dashboard`), the request takes an unacceptably long time to load (frequently 10–30+ seconds or encountering gateway timeouts). In the database, every single room in the system has its `updated_at` timestamp modified whenever the rooms page or dashboard is opened. Furthermore, when entering the Support Dashboard, the "Rooms" KPI counter card displays `0` or fails to show the accurate count because the un-scoped room query is blocked by massive sequential database updates executed on every entry.
- **Root Cause Analysis (Verified Code Evidence):**
  1. **Side-Effect Mutation on Read Query (`GET /rooms`):** In [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts#L30-L44), lines 30–44 call `await recalculateRoomStatus(dbClient, roomIds)` across all retrieved room IDs before returning data. For support users without an explicit institution filter, this retrieves every room across the entire system.
  2. **$2N$ Sequential Database Operations Loop:** In [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts#L24-L44), a serial `for...of` loop executes two separate queries per room:
     - `SELECT exam_id FROM exams WHERE room_id = ? ...`
     - `UPDATE rooms SET status = ?, updated_at = ? WHERE room_id = ? AND status != 'MAINTENANCE'`
     For $N$ rooms, this performs $2N$ round-trip database queries plus a subsequent `SELECT ... WHERE room_id IN (...)` (totaling $2N + 1$ queries), acquiring row locks, thrashing WAL logs, and overwriting `updated_at` with the current timestamp on every read.
  3. **Dashboard Starvation & Double Execution:** In [sentinel-support/dashboard/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/dashboard/page.tsx#L35), `useRoomsQuery()` is called with no arguments. This sends an un-scoped `GET /rooms` request, triggering the global recalculation and write loop. If the user then clicks into the Room page ([sentinel-support/rooms/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx#L31)), `useRoomsQuery({ page: 1, limit: 10 })` sends another `GET /rooms?page=1&limit=10`, repeating the full update loop a second time.
  4. **Query Parameter Mismatch in Controller:** In [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts#L52), line 52 extracts `{ page, pageSize }` from the query parameters, omitting `limit`. When the frontend client passes `?page=1&limit=10`, `pageSize` is `undefined`, causing fallback to default server page size (20) instead of the user's requested page size.
  5. **Support Frontend Pagination Defensive Handling:** In [sentinel-support/rooms/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx#L37-L39), `roomsResponse?.items` and `roomsResponse?.pagination?.total` expect a paginated wrapper. If the response ever falls back to an array, the component displays 0 items and count 0 (unlike [sentinel-core/rooms/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/rooms/page.tsx#L30-L36) which defends with `Array.isArray(roomsResponse)`).
- **Business / User Value:**
  - Eliminates 10–30s latency, bringing Room page and Support Dashboard query latency down to <50ms.
  - Guarantees idempotent, zero-mutation HTTP GET semantics in accordance with RFC 7231 / RFC 9110.
  - Preserves audit trail integrity: `updated_at` and `updated_by` will strictly represent authentic administrative changes rather than phantom read updates.
  - Ensures Support Dashboard KPI cards accurately display the true room count immediately upon mount.
- **Success Criteria:**
  - `GET /rooms` performs zero `UPDATE` or write operations against the database.
  - Room availability status (`AVAILABLE` vs. `ASSIGNED`) is evaluated at query time with 100% real-time accuracy without modifying stored row state.
  - Both direct exam assignments (`exams.room_id`) and section split assignments (`exam_section_assignments.room_id`) are covered.
  - Database round-trips for `GET /rooms` drop from $2N + 1$ queries down to 1 single SQL query.
  - Query latency for `GET /rooms` is under 100ms for up to 10,000 rooms.
  - The Support Dashboard displays the correct total room count immediately on first load without hanging.
  - Frontend pagination respects both `limit` and `pageSize` parameters seamlessly across `sentinel-support`, `sentinel-core`, and `sentinel-web`.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a Support Specialist or Superadmin*, I want to open the Support Dashboard so that I immediately see accurate KPI counts (including total rooms) without delay or timeout.
- *As an Institution Administrator or Support User*, I want to navigate to the Room Management page so that the list of rooms loads instantaneously with accurate real-time availability statuses.
- *As a System Auditor or Administrator*, I want room `updated_at` and `updated_by` metadata to only reflect actual administrative edits, so that change logs and audit records remain truthful.
- *As an Exam Coordinator*, I want room availability (`AVAILABLE` vs `ASSIGNED`) to automatically reflect whether an active exam is currently underway during the scheduled exam window (`scheduled_date <= NOW() <= end_date_time`), checking both direct and section assignments, without requiring database writes on every page view.

### Functional Requirements

- [ ] **FR-01 (Remove Read Mutations):** Eliminate `recalculateRoomStatus` from `getRoomsService` ([get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts)). `GET /rooms` must be completely read-only.
- [ ] **FR-02 (Dynamic Status Projection at Query Time with Comprehensive Parity):** In [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts), project room `status` dynamically via SQL:
  - If stored `status = 'MAINTENANCE'`, return `'MAINTENANCE'`.
  - Else if an active, non-draft, non-archived, non-completed exam currently occupies the room (`scheduled_date <= NOW() AND end_date_time >= NOW()`) either through `exams.room_id` OR `exam_section_assignments.room_id`, return `'ASSIGNED'`.
  - Otherwise, return `'AVAILABLE'`.
- [ ] **FR-03 (Batch Mutation for Lifecycle Triggers):** Refactor [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts) for exam mutation hooks (`createExam`, `updateExam`, `updateExamStatus`, `deleteExam`) to operate via set-based batch queries instead of an $N$-iteration loop.
- [ ] **FR-04 (Controller Query Parameter Mapping):** In [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts), accept and map both `pageSize` and `limit` alias parameters (`pageSize: pageSize ?? limit`).
- [ ] **FR-05 (Defensive Client Handling):** In [sentinel-support/rooms/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx), add resilient array/paginated response checks for `rooms` and `totalCount`, matching `sentinel-core`.

### Edge Cases & Failure Modes

- **Section-Split Exam Windows:** When exams assign individual rooms via `exam_section_assignments`, the room is correctly recognized as `'ASSIGNED'` for the duration of the parent exam window.
- **Overlapping Exam Windows:** If multiple exams are assigned to the same room or cross boundary times, `EXISTS (SELECT 1 FROM exams ...)` evaluates to true if at least one active exam is running, returning `'ASSIGNED'`.
- **Maintenance Overrides:** Rooms set to `'MAINTENANCE'` by an administrator must never be overridden by exam assignments in the dynamic projection or batch recalculator.
- **Unscheduled or Draft Exams:** Exams in `'DRAFT'`, `'ARCHIVED'`, or `'COMPLETED'` status, or exams with `null` scheduled dates, must never mark a room as `'ASSIGNED'`.
- **Unassigned / Global Scope:** Support users querying `/rooms` without `institutionId` load all institutions' rooms in a single paginated query without firing cross-tenant serial locks.

---

## 3. Technical & Architectural Context

- **Affected Layers & Domains:**
  - `sentinel-api`:
    - `src/modules/core/rooms/services/get-rooms.service.ts`
    - `src/modules/core/rooms/data/get-rooms.ts`
    - `src/modules/core/rooms/services/recalculate-room-status.ts`
    - `src/modules/core/rooms/controllers/get-rooms.controller.ts`
    - `src/modules/core/rooms/room.service.test.ts`
  - `sentinel-support`:
    - `src/app/(protected)/(support)/rooms/page.tsx`
    - `src/app/(protected)/dashboard/page.tsx`
  - `packages/services`:
    - `src/api/room.ts`
- **Data Model & Schema Impact:**
  - No database migration or table schema changes required.
  - The `rooms.status` enum (`AVAILABLE`, `ASSIGNED`, `MAINTENANCE`) and `exams.room_id` relation remain identical.
- **Index Optimization Consideration:**
  - Existing composite indices and foreign keys (`idx_exam_section_assignments_composite`, `exams_room_id_fkey`) support the correlated `EXISTS` subquery efficiently.

---

## 4. UI/UX & Interaction Guidelines

- **Support Dashboard (`/dashboard`):**
  - The "Rooms" card in `KpiCarouselWidget` displays the total registered rooms immediately upon initial page render alongside Institutions, Departments, and Programs.
  - Zero loading stall or greeting freeze on dashboard entry.
- **Room Management Page (`/rooms`):**
  - Instantaneous data rendering; table skeleton only flashes momentarily during initial data fetch (<150ms).
  - Status badges accurately display "Available" (green), "Assigned" (blue), or "Maintenance" (amber).
  - Audit columns (`Updated At`, `Updated By`) accurately show when an administrator last edited the room record, rather than displaying "a few seconds ago" for every record.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Complete removal of write/update operations from `getRoomsService` on read requests.
  - Dynamic SQL projection of room status in `getRoomsData` checking both `exams.room_id` and `exam_section_assignments.room_id`.
  - Batching the write-time `recalculateRoomStatus` utility used by exam mutation hooks.
  - Parameter normalization (`limit` vs `pageSize`) in `getRoomsRouteHandler`.
  - Defensive response shape normalization in `sentinel-support` Room Management page.
- **Out of Scope / Non-Goals:**
  - Altering the Prisma schema or adding new database tables.
  - Modifying exam scheduling collision rules in `assertExamRoomAvailability`.
  - Redesigning room management dialog forms or CSV bulk upload logic.

---

## 6. References & External Context

- [[docs/decisions/2026-09-17-read-time-room-status-query-optimization|ADR-0003: Read-Time Room Availability Status Computation and Zero-Mutation GET Queries]]
- [[docs/task/June/2026-06-13/feat-room-availability-walkthrough|Historical Walkthrough: Room Availability & Exam/Question Bank Access]]
- RFC 7231 / RFC 9110: HTTP Semantics — Section 9.2.1 Safe Methods (GET / HEAD)
