---
title: "ADR-0003: Read-Time Room Availability Status Computation and Zero-Mutation GET Queries"
type: decision
status: accepted
created: "2026-09-17"
tags: [adr, database, rooms, performance, kysely, postgresql, api]
---

# ADR-0003: Read-Time Room Availability Status Computation and Zero-Mutation GET Queries

## Context

Sentinel manages physical and virtual examination rooms (`rooms` table). Room records possess a `status` field defined by the PostgreSQL enum `room_status`:
- `'AVAILABLE'`: The room is operational and has no active exam in session.
- `'ASSIGNED'`: An active exam is currently running in the room within its scheduled window (`scheduled_date <= NOW() <= end_date_time`).
- `'MAINTENANCE'`: An administrator has placed the room into maintenance, rendering it unavailable regardless of exam schedules.

### Current Implementation & Failure Mode

In [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts#L30-L44), whenever `GET /rooms` is called, lines 30–44 execute:
```typescript
const roomIds = rawRooms.map((room: any) => room.room_id);
if (roomIds.length > 0) {
    await recalculateRoomStatus(dbClient, roomIds);
    const updatedStatuses = await dbClient
        .selectFrom('rooms')
        .select(['room_id', 'status'])
        .where('room_id', 'in', roomIds)
        .execute();
    ...
```

Inside [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts#L24-L44):
```typescript
for (const roomId of uniqueIds) {
    const activeExam = await dbClient
        .selectFrom('exams')
        .select('exam_id')
        .where('room_id', '=', roomId)
        .where('status', 'not in', ['DRAFT', 'ARCHIVED', 'COMPLETED'])
        .where('scheduled_date', '<=', now)
        .where('end_date_time', '>=', now)
        .executeTakeFirst();

    const targetStatus = activeExam ? 'ASSIGNED' : 'AVAILABLE';

    await dbClient
        .updateTable('rooms')
        .set({ status: targetStatus, updated_at: new Date() })
        .where('room_id', '=', roomId)
        .where('status', '!=', 'MAINTENANCE')
        .execute();
}
```

### Verified Systemic Consequences

1. **Violation of HTTP GET Semantics (RFC 7231 / 9110):** Reading data via `GET /rooms` causes write side-effects against every room row in PostgreSQL.
2. **$2N + 1$ Serial Database Round-Trips:** For $N$ rooms, fetching rooms issues $N$ serial `SELECT` queries on `exams` + $N$ serial `UPDATE` queries on `rooms` + 1 `SELECT` on `rooms`. For 50 rooms, 101 queries run sequentially over the wire.
3. **Severe Page Latency & Gateway Timeouts:** Fetching rooms takes 10 to 30+ seconds, regularly breaching timeout thresholds on edge proxies (Railway/Vercel).
4. **Audit Log Corruption:** Every room's `updated_at` column is continually overwritten with the current timestamp on every page navigation, destroying historical record accountability for authentic administrative edits.
5. **Support Dashboard Starvation:** The Support Dashboard calls `useRoomsQuery()` without institution scoping to display the "Rooms" KPI counter (`rooms.length`). The request stalls the dashboard, displaying `0` or spinning indefinitely. Navigating to `/rooms` repeats the entire $2N+1$ cycle again.

---

## Options Considered

### Option 1: Dynamic SQL Projection at Query Time with Comprehensive Assignment Parity (Accepted)

Compute room status dynamically in the initial SQL `SELECT` in [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts) using a SQL `CASE` expression and correlated `EXISTS` check covering both direct exam headers (`exams.room_id`) and section-split assignments (`exam_section_assignments.room_id`):

```sql
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
          AND e.scheduled_date <= NOW()
          AND e.end_date_time >= NOW()
    ) THEN 'ASSIGNED'
    ELSE 'AVAILABLE'
END AS status
```

- **Mechanism:**
  1. Remove `recalculateRoomStatus` entirely from [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts).
  2. In [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts), project the effective `status` column dynamically via Kysely SQL helper.
  3. Optimize [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts) into a set-based batch query (`WHERE room_id IN (...)`) strictly for write-path exam lifecycle hooks (`createExam`, `updateExam`, `updateExamStatus`, `deleteExam`).
- **Pros:**
  - **1 Single SQL Query:** Reduces query count from $2N + 1$ queries down to 1 query.
  - **Zero Database Writes on GET:** Completely eliminates all row updates, row locking, and WAL write pressure on read queries.
  - **Comprehensive Room Status Accuracy:** Correctly identifies active exams whether assigned at the exam level or broken down into section rooms.
  - **Audit Trail Integrity:** `updated_at` and `updated_by` are never mutated by reads.
  - **Sub-50ms Response Time:** Utilizes existing PostgreSQL indices on `exams(room_id, status, scheduled_date, end_date_time)` and `exam_section_assignments(room_id, exam_id)`.
  - **Zero Database Migrations:** No schema alteration required.
- **Cons:**
  - The status returned on `GET /rooms` is evaluated dynamically at query time rather than reading static row values.

---

### Option 2: Purely Event-Driven Stored Status with Scheduled Cron Worker (Rejected)

Maintain `status` as a strictly stored physical column on `rooms`, updated only during exam lifecycle events and periodically updated by an automated cron worker.

- **Mechanism:**
  1. Remove `recalculateRoomStatus` from `getRoomsService`.
  2. Read `r.status` directly from the `rooms` table.
  3. Deploy a background cron worker (e.g. BullMQ / pg_cron) running every 60 seconds to scan active exams and update room status rows as scheduled exam windows open and close.
- **Pros:**
  - The read query in `getRoomsData` remains a plain column select without any subquery.
- **Cons:**
  - **Eventual Consistency Window:** Rooms will display stale status for up to 60 seconds after an exam starts or ends.
  - **Operational Overhead:** Requires standing background worker infrastructure and scheduled job monitoring.
  - **Ongoing Row Churn:** The cron job continuously writes updates to PostgreSQL rows every minute.

---

### Option 3: Two-Query In-Memory Application Overlay (Rejected)

Execute two non-mutating read queries in `getRoomsService`: one to fetch rooms, and a second batch query to retrieve currently active room IDs from `exams`.

- **Mechanism:**
  1. `getRoomsData` retrieves rooms as normal without status subqueries.
  2. A secondary query executes:
     `SELECT DISTINCT room_id FROM exams WHERE room_id IN (:roomIds) AND status NOT IN ('DRAFT', 'ARCHIVED', 'COMPLETED') AND scheduled_date <= NOW() AND end_date_time >= NOW()`.
  3. In-memory mapping sets `room.status = activeRoomIds.has(room.room_id) ? 'ASSIGNED' : 'AVAILABLE'` (preserving `'MAINTENANCE'`).
- **Pros:**
  - Zero database writes on GET.
  - Keeps individual SQL queries simpler.
- **Cons:**
  - Requires two network round-trips to PostgreSQL instead of one.
  - Does not push status filtering or sorting down to the database engine.

---

## Decision

We adopt **Option 1: Dynamic SQL Projection at Query Time with Comprehensive Assignment Parity**.

1. **Eliminate Read Mutations:** Remove all invocations of `recalculateRoomStatus` from [get-rooms.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/get-rooms.service.ts). `GET /rooms` must be 100% read-only and safe.
2. **Project Status in SQL:** Incorporate the `CASE ... WHEN EXISTS (...)` projection into [get-rooms.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/data/get-rooms.ts), covering both `exams.room_id` and `exam_section_assignments.room_id`.
3. **Batch Exam Lifecycle Recalculation:** Refactor [recalculate-room-status.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/services/recalculate-room-status.ts) to execute set-based batch operations for write paths (`createExam`, `updateExam`, `deleteExam`).
4. **Fix Controller Pagination Mapping:** In [get-rooms.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/rooms/controllers/get-rooms.controller.ts), map `pageSize: pageSize ?? limit`.
5. **Defensive Response Normalization:** In [sentinel-support/rooms/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx), handle both array and paginated response structures cleanly.

---

## Consequences

### Positive
- `GET /rooms` query latency drops from 10–30s to <50ms.
- Support Dashboard and Room Management pages render immediately without hanging.
- Audit timestamps (`updated_at`, `updated_by`) are fully preserved and truthful.
- Completely eliminates row locking and transaction contention on `rooms`.
- Full parity for section-split exams.

### Negative / Trade-Offs
- The SQL query in `getRoomsData` includes correlated `EXISTS` checks on `exams` and `exam_section_assignments`. Existing indices ensure this executes efficiently in milliseconds.

---

## Validation and Review Date

- **Validation:**
  - Execute backend unit test suite: `pnpm --filter sentinel-api test src/modules/core/rooms`.
  - Verify zero `UPDATE` queries during `GET /rooms` requests.
  - Verify Support Dashboard room count card matches the total number of rooms registered.
  - Verify that when an active exam is scheduled for the current time, the room status evaluates to `ASSIGNED`, and returns to `AVAILABLE` once the window elapses or if the room is in `MAINTENANCE`.
- **Review Date:** 2026-10-17 (30 days post-implementation review).
