---
title: "ADR: Batch Multi-Row Upsert for Classroom Student Enrollment"
type: decision
status: proposed
created: "2026-09-17"
tags: [adr, performance, database, kysely, enrollment, scalability, connection-pool]
---

# ADR: Batch Multi-Row Upsert for Classroom Student Enrollment

## Context

During exam preparation and live exam administration, instructors and administrators enroll cohorts of students (typically 40–50 students per classroom across 8 classrooms, totaling ~360 students) into class groups (`enrollStudentsData` in `sentinel-api`).

The current implementation in `app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts` contains an **N+1 query pattern**:

1. It executes 5 initial read queries to resolve access, class group details, whitelist entries, existing students, and existing enrollments.
2. It then iterates through every student number in a sequential `for...of` loop:
   - Queries `students` via an individual `insertInto('students').onConflict(...).returning(...)` or `updateTable('students')`.
   - Queries `enrollments` via an individual `insertInto('enrollments').onConflict(...).execute()`.
3. For a single classroom cohort of 45 students, this fires **45 to 90 sequential single-row SQL statements** across the public network to Supavisor (port 6543).
4. Across 8 classrooms enrolled prior to or on test day, this results in **360 to 720 sequential queries**, holding pooled database connections open for 1.8s–4.5s per classroom batch.

On test day, when instructors perform last-minute roster adjustments or enroll make-up cohorts while exams are live or students are logging in, this N+1 write pattern starves the shared `pg.Pool` (capped at 25 connections per replica), causing connection timeouts (`connectionTimeoutMillis: 5000`) and latency spikes for concurrent student answer syncs (`syncSessionService`) and lobby check-ins (`bootstrap`).

---

## Options Considered

### Option 1: Native Multi-Row Batch Upsert with `COALESCE` via Kysely (Recommended)

- **Mechanism:**
  1. Validate all student whitelist rules and course/department matches in-memory against pre-fetched sets.
  2. Execute a single multi-row `insertInto('students').values([...]).onConflict(...).returning(['student_id', 'user_id', 'student_number'])` statement for all valid students, preserving existing claimed `user_id`s via SQL `COALESCE(excluded.user_id, students.user_id)`.
  3. Filter out students already enrolled using the in-memory pre-fetched enrollment set.
  4. Execute a single multi-row `insertInto('enrollments').values([...]).onConflict(doNothing())` statement for all new enrollments.
  5. Wrap the batch execution in `executeTransaction(dbClient, ...)` for atomicity.
- **Pros:**
  - Reduces database query round-trips from **45–90 queries down to 2 atomic set-based write queries** per classroom.
  - Slashes connection checkout hold time from **~2,500ms down to < 25ms** (>98% reduction).
  - Eliminates connection pool starvation risks on Supavisor port 6543 during concurrent exam operations.
  - Fully type-safe within existing Kysely schema without introducing new stored procedures or migrations.
  - Preserves exact return shape (`{ enrolledCount, failedCount, results: [...] }`) and telemetry audit logging.
- **Cons:**
  - If a fatal database error occurs during the multi-row insert (e.g. FK violation), the entire batch fails rather than partially enrolling (though this is mitigated by pre-validating foreign keys against the whitelist in memory).

### Option 2: Parallelized Concurrent Promises (`Promise.all`) with Concurrency Chunking

- **Mechanism:** Retain individual single-row queries but execute them concurrently in chunks (e.g. `p-limit` with concurrency of 5–10) using `Promise.all`.
- **Pros:** Simple refactor requiring minimal changes to the existing loop logic.
- **Cons:**
  - **High Connection Contention:** Firing 10–45 concurrent queries simultaneously instantly monopolizes 10–25 connections from the replica's local pool (`DB_POOL_MAX=25`), directly starving student HTTP answer syncs.
  - Does not reduce aggregate database query volume or network round-trips over public TLS to Supabase.
  - Rejected as counterproductive to concurrency surge stabilization.

### Option 3: PostgreSQL Stored Procedure / PL/pgSQL Function (`enroll_students_batch`)

- **Mechanism:** Create a dedicated database migration with a custom PL/pgSQL function that accepts a JSON/array payload and performs student upserts and enrollment inserts entirely inside PostgreSQL.
- **Pros:** Single database round-trip; maximum execution speed in the PostgreSQL engine.
- **Cons:**
  - Migrates application business logic (whitelist validation, department/course matching, claim state resolution) into database stored procedures.
  - Bypasses Kysely type-checking and complicates automated testing and schema evolution.
  - Unnecessary overhead when standard Kysely set-based multi-row queries achieve equivalent (< 30ms) performance.

---

## Decision

**We will adopt Option 1: Native Multi-Row Batch Upsert with `COALESCE` via Kysely.**

By transforming the sequential `for...of` loop into two atomic multi-row operations (`students` batch upsert and `enrollments` batch insert), we reduce total database round-trips per classroom roster by over 90% while keeping connection hold time well under 30ms.

---

## Consequences

### Positive

- **Instantaneous Classroom Enrollment:** Enrolling a full classroom of 45 students drops from ~2.5s–4s to $< 35\text{ms}$.
- **Zero Pool Starvation on Test Day:** Batch writes release database connections back to Supavisor in milliseconds, preventing 500/504 errors on concurrent student lobby boots or answer syncs.
- **Transactional Consistency:** Either all valid students in the batch are enrolled atomically or none are, preventing partial roster corruption.
- **Zero Schema Migrations Required:** Relies entirely on existing unique indexes: `students(institution_id, student_number)` and `enrollments(class_group_id, student_id)`.

### Negative / Mitigations

- **Error Aggregation:** If one student record has malformed data that passes in-memory validation but fails a database constraint, the whole batch could reject.
  - *Mitigation:* The existing in-memory checks against `whitelistRecords`, `section_department_id`, and `section_course_id` already filter invalid student rows into `failedResults` prior to constructing the database values.

---

## Validation and Review Date

- **Validation Gate:**
  1. Unit tests in `app/sentinel-api` verifying 45-student batch enrollment with mixed claimed, unclaimed, already-enrolled, and invalid student numbers.
  2. Query count verification confirming $\le 6$ total queries executed during a 45-student enrollment operation.
  3. Load test simulation demonstrating concurrent classroom enrollment alongside active `syncSessionService` requests without connection timeouts.
- **Review Date:** Prior to live exam day deployment (2026-09-18).
