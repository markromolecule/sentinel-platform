---
title: "Phase 2: Batch Write-Path Status Recalculation & Controller Parameter Normalization"
type: phase
parent: "docs/tasks/2026/09/2026-09-17/task-room-management-query-optimization/README.md"
phase: "2"
status: completed
created: "2026-09-17"
tags: [task, phase, api, controllers, rooms]
---

# Phase 2: Batch Write-Path Status Recalculation & Controller Parameter Normalization

## Objective

Optimize the write-time helper `recalculateRoomStatus` (used by `createExam`, `updateExam`, `updateExamStatus`, `deleteExam`) to operate via set-based batch queries rather than a sequential loop over room IDs. Normalize controller parameter parsing in `getRoomsRouteHandler` to properly read and forward the `limit` query parameter.

## Dependencies & Prerequisites

- Completion of Phase 1 (`phase-01-api-read-projection-and-mutation-removal.md`).

## Impacted Files & Components

- [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts): Helper for updating room statuses on exam lifecycle mutations.
- [recalculate-room-status.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.test.ts): Unit tests for recalculateRoomStatus helper.
- [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts): Hono controller for `GET /rooms`.

## Implementation Tasks

- [x] **Task 2.1 — Refactor `recalculateRoomStatus` to Set-Based Batch Queries:**
  In [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts):
  - Replaced the serial loop with two set-based queries checking active exams across both direct `exams.room_id` and split `exam_section_assignments.room_id`.
  - Batch updated active rooms to `ASSIGNED` (`WHERE room_id IN (...) AND status != 'MAINTENANCE'`).
  - Batch updated inactive rooms to `AVAILABLE` (`WHERE room_id IN (...) AND status != 'MAINTENANCE'`).
- [x] **Task 2.2 — Update Recalculate Unit Tests:**
  Updated [recalculate-room-status.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.test.ts) to verify direct exam assignments, section-split assignments, and constant-count batch updates.
- [x] **Task 2.3 — Map `limit` Parameter in `getRoomsRouteHandler`:**
  In [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts#L52), extracted `limit` from `c.req.valid('query')` and passed `pageSize: pageSize ?? limit` into `getRoomsService`.

## Verification & Testing

- Run recalculate unit tests:
  ```bash
  pnpm --filter sentinel-api test src/modules/core/rooms/services/recalculate-room-status.test.ts
  ```
  Outcome: **PASS** (4 tests passed).
- Run controller route access tests:
  ```bash
  pnpm --filter sentinel-api test src/modules/core/rooms/controllers/route-access.test.ts
  ```
  Outcome: **PASS** (5 tests passed).
- Full room module test run:
  ```bash
  pnpm --filter sentinel-api test src/modules/core/rooms
  ```
  Outcome: **PASS** (4 test files, 14 tests passed in 1.53s).

## Risks & Rollback

- **Risk:** Empty active or inactive ID arrays passed to `where('room_id', 'in', ...)`.
- **Mitigation:** Guarded with `if (assignedIds.length > 0)` and `if (availableIds.length > 0)`.
- **Rollback:** Revert `recalculate-room-status.ts` and `get-rooms.controller.ts`.
