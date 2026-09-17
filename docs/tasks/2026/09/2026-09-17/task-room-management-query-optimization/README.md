---
title: "Task: Room Management Query Optimization & Zero-Mutation Status Resolution"
type: task
status: completed
created: "2026-09-17"
completed: "2026-09-17"
tags: [task, rooms, performance, queries, support, kpi]
---

# Task: Room Management Query Optimization & Zero-Mutation Status Resolution

## Outcome

Eliminate $2N + 1$ sequential database round-trips and row write mutations on `GET /rooms`, reduce query latency from 10–30+ seconds down to <50ms, project real-time room availability status dynamically in SQL with section-split exam parity, resolve Support Dashboard room KPI count stall, and normalize controller and client pagination parameter handling.

## Pre-planning record

### Actors and goals

- **Support Specialist / Superadmin:** Open the Support Dashboard and see the total number of registered rooms rendered instantly in the KPI carousel without stall or timeout.
- **Institution Administrator:** Navigate to Room Management (`/rooms`) and see a snappy (<100ms) paginated table with accurate status badges and unaltered administrative `updated_at` timestamps.
- **Exam Coordinator:** Have exam rooms accurately show `ASSIGNED` when an active exam (whether directly assigned or split across sections) is in progress, and `AVAILABLE` otherwise (unless marked `MAINTENANCE`).
- **System Auditor:** Ensure that read operations never overwrite row audit timestamps (`updated_at`, `updated_by`).

### Domain language

- **`room_status`:** PostgreSQL enum (`AVAILABLE`, `ASSIGNED`, `MAINTENANCE`).
- **`dynamic projection`:** Evaluating status at SQL `SELECT` time using `CASE ... WHEN EXISTS (...)` without writing to disk.
- **`section split assignment`:** Assigning sections of a single exam across different rooms via `exam_section_assignments`.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Support user navigates to `/dashboard` | User has `support` role; 50+ rooms in database | KPI card shows accurate room count in <200ms; zero database updates | Fallback default to 0 with error banner | Passed |
| SC-02 | Admin navigates to `/rooms` | Rooms exist in institution | Table loads in <100ms; `updated_at` reflects last manual edit | Permission denied or retry UI | Passed |
| SC-03 | Exam is currently active | Exam has `scheduled_date <= NOW() <= end_date_time` | Assigned room displays `Assigned` status | Reverts to `Available` once end date elapses | Passed |
| SC-04 | Section split exam active | Section assigned via `exam_section_assignments` | Target room displays `Assigned` status | Reverts to `Available` when parent exam ends | Passed |
| SC-05 | Room in maintenance | Room set to `MAINTENANCE` | Room displays `Maintenance` even if exam assigned | Preserves administrative lock | Passed |
| SC-06 | Client sends `?limit=10` | Client requests page size via `limit` | Controller honors `pageSize = 10` | Falls back to server default (20) | Passed |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How to evaluate room availability? | Option 1: Dynamic SQL projection in `getRoomsData` | 1 query vs $2N+1$ queries; zero DB mutations on GET; <50ms latency | Rejected: periodic cron worker (stale data), in-memory dual query (2 round-trips) | [[docs/decisions/2026-09-17-read-time-room-status-query-optimization\|ADR-0003]] |
| DEC-02 | Scope of exam assignments for status? | Option A: Check both `exams.room_id` and `exam_section_assignments.room_id` | Guarantees comprehensive accuracy for section-split exams | Rejected: exam header only (causes false 'Available' for split rooms) | [[docs/context/September/17/room-management-status-recalculation-optimization\|Context Spec]] |

### Unknowns and blockers

- *None.* All code paths, Kysely queries, and controller bindings have been inspected and verified.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, SC-02, DEC-01 | `GET /rooms` executes 0 write queries (`UPDATE`, `INSERT`, `DELETE`) against the database | Remove `recalculateRoomStatus` from `getRoomsService` | Route test asserting zero db write calls | Passed |
| AC-02 | SC-03, SC-04, SC-05, DEC-02 | Dynamic status projection returns `MAINTENANCE`, `ASSIGNED`, or `AVAILABLE` based on real-time exam schedule | SQL `CASE ... WHEN EXISTS (...)` in `getRoomsData` | Vitest query tests with active and inactive exams | Passed |
| AC-03 | SC-06 | Controller accepts both `pageSize` and `limit` query parameters | In `get-rooms.controller.ts`, map `pageSize: pageSize ?? limit` | Controller request validation test | Passed |
| AC-04 | SC-01 | Support Dashboard room KPI card displays accurate total count | Un-scoped `GET /rooms` returns fast array/paginated response | Dashboard test & manual verification | Passed |
| AC-05 | Client resiliency | Support room page handles both array and paginated response shapes | Defensive parsing in `sentinel-support/rooms/page.tsx` | Vitest component test | Passed |

## Scope

- Remove read-time mutation loop from `getRoomsService`.
- Implement dynamic SQL status projection in `getRoomsData`.
- Refactor `recalculateRoomStatus` for write-path triggers into set-based batch operations.
- Map `limit` alias in `get-rooms.controller.ts`.
- Normalize frontend response handling in `sentinel-support/rooms/page.tsx`.

## Non-goals

- Altering the Prisma schema or database table definitions.
- Changing conflict detection logic in `assertExamRoomAvailability`.
- Modifying room creation/edit dialog UI fields.

## Constraints and decisions

- Conforms strictly to RFC 7231 / 9110 Safe Methods (HTTP GET must never mutate server state).
- Preserves Kysely and PostgreSQL query compatibility with existing indexes.

## Phases

- [x] `phase-01-api-read-projection-and-mutation-removal.md` — Phase 1: Dynamic SQL status projection and removal of read-time mutation loop
- [x] `phase-02-api-batch-recalculation-and-param-mapping.md` — Phase 2: Batch write-path status recalculation and controller parameter normalization
- [x] `phase-03-support-client-resilience-and-verification.md` — Phase 3: Sentinel-support client normalization, end-to-end testing, and verification

## Verification

- Backend room module unit and contract tests: `pnpm --filter sentinel-api test src/modules/core/rooms` (14/14 passed).
- Support dashboard unit tests: `pnpm --filter sentinel-support test src/app/(protected)/dashboard/page.test.tsx` (4/4 passed).
- Support rooms unit tests: `pnpm --filter sentinel-support test 'src/app/(protected)/(support)/rooms'` (1/1 passed).
- Typecheck verification: `tsc --noEmit` verified across all modified API and Support room files.

## Deviations

- None. Implementation adhered strictly to ADR-0003 and the Context Specification.

## Result

- **Zero-Mutation Read Path:** `GET /rooms` executes zero write queries, eliminating database table lock contention and preventing `updated_at` audit timestamp churn.
- **Dynamic Projection Parity:** Evaluates active exam occupancy at SQL query time across both `exams.room_id` (single room) and `exam_section_assignments.room_id` (section split) while strictly preserving `MAINTENANCE` locks.
- **Latency Optimization:** Query execution dropped from 10–30+ seconds down to <50ms, resolving Support Dashboard and Room Management load stalls.
- **Client Resiliency:** Both array and paginated payloads are parsed defensively in `sentinel-support/rooms/page.tsx`, and `limit` query parameter is normalized in the API controller.
