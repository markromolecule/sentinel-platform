---
title: "Phase 1: Dynamic SQL Status Projection & Removal of Read-Time Mutation Loop"
type: phase
parent: "docs/tasks/2026/09/2026-09-17/task-room-management-query-optimization/README.md"
phase: "1"
status: completed
created: "2026-09-17"
tags: [task, phase, api, kysely, rooms]
---

# Phase 1: Dynamic SQL Status Projection & Removal of Read-Time Mutation Loop

## Objective

Eliminate all `UPDATE` queries and side-effects from `getRoomsService` on `GET /rooms` requests. Project room `status` dynamically within `getRoomsData` via a correlated SQL `CASE ... WHEN EXISTS (...)` check against active exams, ensuring instantaneous response times and preserving historical `updated_at` timestamps.

## Dependencies & Prerequisites

- Verified Context Specification: [[docs/context/September/17/room-management-status-recalculation-optimization|Context Spec]]
- Accepted Architecture Decision Record: [[docs/decisions/2026-09-17-read-time-room-status-query-optimization|ADR-0003]]

## Impacted Files & Components

- [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts): Kysely query builder for rooms table.
- [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts): Room retrieval business logic service.
- [get-rooms.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.test.ts): Unit tests for compiled query construction.
- [room.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/room.service.test.ts): Unit tests for room service operations.

## Implementation Tasks

- [x] **Task 1.1 — Dynamic SQL Status Projection in `getRoomsData`:**
  In [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts), replaced the static `'r.status'` select with a dynamic SQL expression:
  ```typescript
  const now = new Date();
  ...
  sql<'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE'>`
      CASE
          WHEN r.status = 'MAINTENANCE' THEN 'MAINTENANCE'
          WHEN EXISTS (
              SELECT 1 FROM exams e
              WHERE (
                  e.room_id = r.room_id
                  OR EXISTS (
                      SELECT 1 FROM exam_section_assignments esa
                      WHERE esa.room_id = r.room_id
                        AND esa.exam_id = e.exam_id
                  )
              )
                AND e.status NOT IN ('DRAFT', 'ARCHIVED', 'COMPLETED')
                AND e.scheduled_date <= ${now}
                AND e.end_date_time >= ${now}
          ) THEN 'ASSIGNED'
          ELSE 'AVAILABLE'
      END
  `.as('status')
  ```
- [x] **Task 1.2 — Purge Read-Time Recalculation Loop in `getRoomsService`:**
  In [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts), removed lines 30–44 (`await recalculateRoomStatus(...)` and follow-up `selectFrom('rooms').where('room_id', 'in', roomIds)` query). Directly feeding `rawRooms` into `paginateItems`.
- [x] **Task 1.3 — Update Room Service Unit Tests:**
  In [room.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/room.service.test.ts), updated `getRoomsService` test suite to assert that `recalculateRoomStatus` is **never** invoked on read queries, and that the returned room retains its projected status.

## Verification & Testing

- Run room module test suite:
  ```bash
  pnpm --filter sentinel-api test src/modules/core/rooms
  ```
  Outcome: **PASS** (4 test files, 13 tests passed in 1.44s).
- Assert `recalculateRoomStatus` has zero calls during `getRoomsService`: **VERIFIED** via unit test expectation.
- Assert SQL CASE subquery compilation: **VERIFIED** via [get-rooms.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.test.ts).

## Risks & Rollback

- **Risk:** Malformed SQL syntax in Kysely `sql` template literal.
- **Mitigation:** Verified through compiled Kysely SQL inspect test in `get-rooms.test.ts`.
- **Rollback:** Revert modifications to `get-rooms.ts` and `get-rooms.service.ts`.
- **Mitigation:** Rely on strong TypeScript typing and unit tests verifying compiled query structure.
- **Rollback:** Restore previous `get-rooms.ts` and `get-rooms.service.ts` from git.
