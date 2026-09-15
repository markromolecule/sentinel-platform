---
title: "Supabase Slow Query Analysis and Database Performance Optimization"
type: context
status: draft
created: "2026-09-15"
tags: [context, performance, database, supabase, slow-queries, pg_stat_statements, realtime, postgrest, kysely]
feature: "supabase-slow-query-analysis-and-optimization"
---

# Supabase Slow Query Analysis and Database Performance Optimization Context Specification

## 1. Overview & Executive Summary

### 1.1 Context & Background

An export of PostgreSQL's `pg_stat_statements` view from the Supabase production/staging instance was provided for analysis. The dataset records cumulative query performance metrics across 20 distinct query signatures, totaling over **846,878 ms (~14.1 minutes)** of database execution time and hundreds of thousands of calls.

### 1.2 Performance Metric Breakdown by Subsystem

| Subsystem / Category | Calls | Total Execution Time | % of Total DB Time | Avg Latency Range | Peak Spikes | Primary Bottleneck |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase Realtime CDC** (`realtime.list_changes`, pub tables, slots) | 113,614 | 739,788.17 ms (~12.3 min) | **87.35%** | 0.82 ms – 28.27 ms | **5,114.85 ms (5.1s)** | WAL decoding polling loop across 4 `REPLICA IDENTITY FULL` tables |
| **PostgREST Schema Introspection** (`pg_timezone_names`, types, procs, constraints) | 2,850 | 63,293.68 ms (~1.05 min) | **7.47%** | 2.05 ms – 67.76 ms | **837.62 ms** | 475 schema reloads scanning filesystem zoneinfo and catalog tables |
| **Supabase Studio Admin Introspection** (Table editor, extensions, privileges) | 95 | 24,026.26 ms (~24.0 s) | **2.84%** | 94.44 ms – 2,497.40 ms | **2,565.36 ms (2.5s)** | Heavy admin catalog joins executed during dashboard usage |
| **Sentinel Application Queries** (Exam ingress, exam catalog, notifications, audit) | 6,701 | 15,789.74 ms (~15.8 s) | **1.86%** | 0.40 ms – 16.35 ms | **493.38 ms** | Correlated subqueries, missing composite index scans, complex `OR` filters |
| **PgBouncer Pooler Auth** (`pgbouncer.get_auth`) | 40,900 | 3,978.02 ms (~4.0 s) | **0.47%** | 0.097 ms | 10.04 ms | Healthy connection pooler auth checks (optimal) |

---

## 2. In-Depth Query Analysis & Diagnosis

### 2.1 Group A: Supabase Realtime CDC Engine (87.02% of Database Time)

#### Query 1: `realtime.list_changes($1, $2, $3, $4)`

- **Role:** `supabase_admin`
- **Metrics:** 111,410 calls | Mean: 6.61 ms | Min: 3.04 ms | Max: **5,114.85 ms** | Total: 736,945.08 ms (**87.02%**) | Cache Hit: 100%
- **Mechanism:** Supabase Realtime polls the PostgreSQL logical replication slot (`realtime.list_changes`) to decode the Write-Ahead Log (WAL) and stream row-level database changes to connected WebSockets.
- **Root Cause of High Consumption & 5-Second Latency Spikes:**
  1. **Extreme Polling Frequency:** 111,410 executions dominate total CPU cycles.
  2. **`REPLICA IDENTITY FULL` Overhead:** The Sentinel database has enabled `REPLICA IDENTITY FULL` on 4 high-frequency tables:
     - `public.notifications` (`packages/db/prisma/migrations/20260510040000_enable_notifications_realtime`)
     - `public.exam_lobby_admissions` (`packages/db/prisma/migrations/20260818160000_enable_lobby_admissions_realtime_and_indexes`)
     - `public.messages` (`packages/db/prisma/migrations/20260523195300_enable_messages_realtime`)
     - `public.conversation_participants` (`packages/db/prisma/migrations/20260523195300_enable_messages_realtime`)
     When a table is set to `REPLICA IDENTITY FULL`, every single update writes the complete old row and new row to the WAL. Logical decoding must serialize and compare the full row image, ballooning WAL volume and causing periodic multi-second stalls during write bursts (e.g. audit log writes or concurrent exam admissions).
  3. **Architectural Redundancy:** Sentinel recently migrated exam lobby admission sync to **in-memory Realtime Broadcast channels** (`broadcast-lobby-event.ts`). Therefore, keeping `exam_lobby_admissions` in `supabase_realtime` and forcing `REPLICA IDENTITY FULL` is no longer necessary for client updates.

---

### 2.2 Group B: PostgREST Schema Cache & Connection Flapping (7.47% of Database Time)

#### Queries 2, 4, 5, 9, 15, 20: PostgREST Introspection Suite

- **Role:** `authenticator`
- **Call Count Alignment:** Exactly **475 calls** on every single query in this group:
  - `SELECT name FROM pg_timezone_names`: 475 calls | Mean: **67.76 ms** | Max: **837.62 ms** | Total: **32,186.91 ms (3.80%)** | Cache Hit: **0%**
  - `WITH base_types AS ... columns`: 475 calls | Mean: 28.07 ms | Total: 13,332.27 ms (1.57%)
  - `WITH base_types AS ... arguments AS ... pg_proc`: 475 calls | Mean: 23.85 ms | Total: 11,329.71 ms (1.34%)
  - `WITH pks_uniques_cols AS ... pg_constraint`: 475 calls | Mean: 8.29 ms | Total: 3,938.32 ms (0.47%)
  - `with recursive pks_fks ... views`: 475 calls | Mean: 3.23 ms | Total: 1,533.76 ms (0.18%)
  - `role_setting ... kv_settings`: 475 calls | Mean: 2.05 ms | Total: 972.71 ms (0.11%)
- **Root Cause & Diagnosis:**
  1. **475 PostgREST Reloads:** PostgREST executes this full suite of introspection queries upon initial boot, upon container restart, or whenever a `NOTIFY pgrst, 'reload schema'` is received. 475 executions indicate that PostgREST has restarted 475 times (e.g., container OOM crash loop, connection dropping) or an automated job/migration is repeatedly issuing schema reload notifications.
  2. **`pg_timezone_names` 0% Cache Hit:** `pg_timezone_names` is a dynamic view backed directly by the operating system's zoneinfo files. PostgreSQL does not cache this view in its buffer pool. Across 475 calls, it read 567,150 rows from the OS filesystem, averaging 67.8ms per call and peaking at 837.6ms.

---

### 2.3 Group C: Sentinel Application Queries (User-Facing Bottlenecks)

#### 1. Student Exam Detail Query (`getExamByIdData` — Query 6)

- **Role:** `postgres`
- **Metrics:** 1,379 calls | Mean: 4.89 ms | Max: **177.50 ms** | Total: 6,738.68 ms
- **Signature:** Massive query containing **12 duplicate scalar subqueries** in the SELECT list for `exam_attempts` and `flagged_incidents`.
- **Diagnosis:**
  - On Sep 7, commit `33f0dfbf` integrated `withStudentAttemptJoin` using `LEFT JOIN LATERAL` in `app/sentinel-api/src/modules/examination/history/data/build-student-attempt-selects.ts`.
  - Because `pg_stat_statements` is cumulative, the historical stats reflect queries executed before the lateral join fix was active.
  - Resetting `pg_stat_statements` is required to isolate current performance.

#### 2. Student Exam Catalog Listing (`getExamsData` — Queries 10 & 11)

- **Role:** `postgres`
- **Metrics:** 330 total calls (173 + 157) | Mean: 13.88 ms – 16.35 ms | Max: **116.73 ms** | Total: 5,008.91 ms
- **Root Cause in Active Code:**
  Even with the lateral join for student attempts, `getExamsData` in `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` unconditionally executes correlated subqueries for **every single exam row returned on the page**:
  1. `(select count(distinct ea.student_id)::int from exam_attempts ea where ea.exam_id = e.exam_id) as students_count`
  2. `(select count(*)::int from flagged_incidents fi join exam_attempts ea on ea.attempt_id = fi.attempt_id where ea.exam_id = e.exam_id) as incident_count`
  3. `(select count(*)::int from exam_questions q where q.exam_id = e.exam_id and q.question_type = 'ESSAY') as essay_question_count`
  4. Multiple union subqueries for `assigned_section_names`, `class_group_ids`, `class_group_names`, and `assigned_room_names`.
  - **The Problem:** Students browsing `/student/exams` never consume `students_count` or global `incident_count` (these are instructor-only telemetry fields). For a page of 20 exams, PostgreSQL evaluates 40 separate subqueries across `exam_attempts` and `flagged_incidents`.

#### 3. Notifications List Query (Query 16)

- **Role:** `postgres`
- **Metrics:** 453 calls | Mean: 2.90 ms | Min: 0.014 ms | Max: **493.38 ms (Spike to ~0.5s!)** | Total: 1,315.52 ms
- **Signature:**

  ```sql
  select "n"."notification_id" as "id", "n"."title", ...
  from "notifications" as "n"
  left join "user_profiles" as "actor_profile" on "actor_profile"."user_id" = "n"."actor_user_id"
  where "n"."recipient_user_id" = $1 and "n"."institution_id" in ($2, $3)
  order by "n"."created_at" desc limit $4
  ```

- **Root Cause:**
  The `IN ($2, $3)` condition across institutions causes PostgreSQL to evaluate whether to use `idx_notifications_recipient_inst_created` or fall back to an index on `recipient_user_id` followed by a Bitmap Heap Scan and sort. When the table is bloated with `REPLICA IDENTITY FULL` write churn, row fetching spikes to 493ms.

#### 4. Staff / Instructor Exam Access Scope Query (Query 19)

- **Role:** `postgres`
- **Metrics:** 147 calls | Mean: 6.64 ms | Max: **78.50 ms** | Total: 976.33 ms | Rows Read: 5,667
- **Signature:**
  `WHERE institution_id = $1 AND (is_public OR created_by = $3 OR EXISTS(esa) OR exam_id IN (pa) OR exam_id IN (cia) OR exam_id IN (es))`
- **Root Cause:**
  A 6-branch `OR` tree referencing 5 distinct tables (`exams`, `exam_section_assignments`, `proctor_assignments`, `classroom_instructor_assignments`, `exam_shares`). The query planner cannot perform a direct index scan across disjoint tables in an `OR` clause, forcing sequential filter evaluation or multi-index bitmap merges.

---

## 3. Actionable Optimization Strategy & Solutions

### Phase 1: Supabase Realtime & Publication Tuning (Eliminates 87% Bottleneck)

1. **Revert Unnecessary `REPLICA IDENTITY FULL`:**
   - On `exam_lobby_admissions`: Revert to `REPLICA IDENTITY DEFAULT`. The primary key is sufficient for identity resolution, and the application now uses in-memory broadcast channels.
   - On `notifications`: Evaluate if `DEFAULT` is sufficient. `DEFAULT` logs only changed columns and the primary key in WAL, reducing WAL volume by 60–80%.

   ```sql
   ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY DEFAULT;
   ```

2. **Audit and Prune `supabase_realtime` Publication:**
   - Remove tables that are no longer subscribed to via client `postgres_changes`:

   ```sql
   -- Check currently published tables:
   SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

   -- Drop tables that use Realtime Broadcast or direct polling instead:
   ALTER PUBLICATION supabase_realtime DROP TABLE "public"."exam_lobby_admissions";
   ```

3. **Calibrate Supabase Realtime Polling Settings:**
   - In the Supabase project configuration (or `realtime.json`), adjust the replication slot polling batch interval to prevent continuous tight-loop execution during idle periods.

---

### Phase 2: PostgREST Stability & Schema Reload Prevention (Saves 63+ Seconds)

1. **Check PostgREST Health & Container Logs:**
   - Investigate why PostgREST reloaded 475 times. Look for OOM events or container restarts in the Supabase Dashboard under Settings > General > Logs > API (PostgREST).
2. **Eliminate Redundant Schema Cache Reload Triggers:**
   - Ensure migration scripts and background workers do not emit `NOTIFY pgrst, 'reload schema'` on high-frequency loops.
3. **Avoid Querying `pg_timezone_names` Dynamically:**
   - If an application component or script runs `SELECT name FROM pg_timezone_names`, replace it with an in-memory cached list (e.g. `Intl.supportedValuesOf('timeZone')` on the client or a static JSON enum in the API).

---

### Phase 3: Sentinel API Query Pruning & Index Alignment

1. **Prune Heavy Subqueries in `getExamsData` for Students:**
   - In `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`, conditionally omit `students_count`, `incident_count`, and `essay_question_count` when `studentUserId` is provided:

   ```typescript
   // Only evaluate instructor telemetry when not a student query
   const includeInstructorTelemetry = !studentUserId;

   // In query.select:
   includeInstructorTelemetry
     ? (eb) => eb.selectFrom('exam_attempts as ea')
         .select(sql<number>`count(distinct ea.student_id)::int`.as('count'))
         .whereRef('ea.exam_id', '=', 'e.exam_id')
         .as('students_count')
     : sql<number>`0`.as('students_count'),
   ```

2. **Refactor Staff Exam Visibility to a `UNION` CTE (Query 19):**
   - Replace the 6-way `OR` condition with a unified CTE of accessible exam IDs:

   ```sql
   WITH accessible_exams AS (
       SELECT exam_id FROM exams WHERE created_by = :userId OR (is_public AND institution_id = :instId)
       UNION
       SELECT exam_id FROM exam_section_assignments WHERE instructor_id = :userId
       UNION
       SELECT exam_id FROM proctor_assignments WHERE instructor_id = :userId AND status IN ('CONFIRMED', 'PENDING')
       UNION
       SELECT ex.exam_id FROM exams ex
       JOIN classroom_instructor_assignments cia ON ex.class_group_id = cia.class_group_id
       WHERE cia.instructor_user_id = :userId
       UNION
       SELECT exam_id FROM exam_shares WHERE user_id = :userId
   )
   SELECT e.* FROM exams e
   JOIN accessible_exams ae ON ae.exam_id = e.exam_id
   WHERE e.institution_id = :instId
   ORDER BY e.updated_at DESC
   LIMIT :limit OFFSET :offset;
   ```

3. **Verify Notification Composite Index Usage (Query 16):**
   - Confirm that `idx_notifications_recipient_inst_created` is actively used and not invalidated by null handling:

   ```sql
   CREATE INDEX IF NOT EXISTS idx_notifications_recipient_inst_created
   ON notifications (recipient_user_id, institution_id, created_at DESC);
   ```

---

### Phase 4: Baseline Reset & Continuous Observability

1. **Reset `pg_stat_statements` Statistics:**
   - Clear historical query metrics in Supabase SQL Editor to measure the real-time impact of recent and upcoming optimizations:

   ```sql
   SELECT pg_stat_statements_reset();
   ```

2. **Monitor Performance Under Next Load Run:**
   - Execute a simulated student load test and verify that:
     - `realtime.list_changes` accounts for <20% of total DB time.
     - Student exam ingress latency remains under 5ms mean and <30ms p99.
     - PostgREST reload queries remain at 0 during normal operation.

---

## 4. Verification & Testing Matrix

| Component | Target Metric Before | Target Metric After | Verification Command / Method |
| :--- | :--- | :--- | :--- |
| **Realtime WAL Polling** | 87.02% total time, 5.1s max spike | < 25% total time, < 100ms max | `SELECT * FROM pg_stat_statements WHERE query LIKE '%realtime.list_changes%'` |
| **PostgREST Schema Reloads** | 475 calls, 63.3s total time | 1–2 boot calls, < 1s total | `SELECT calls FROM pg_stat_statements WHERE query LIKE '%pg_timezone_names%'` |
| **Student Exam Catalog (`getExamsData`)** | 16.35ms mean, 82ms max | < 6ms mean, < 25ms max | Run `pnpm --filter @sentinel/api test` & benchmark API endpoint |
| **Notifications Query** | 493ms peak latency | < 15ms peak latency | `EXPLAIN ANALYZE SELECT ... FROM notifications WHERE ...` |
| **Staff Exam Visibility** | 6.64ms mean, 78ms max | < 2ms mean, < 10ms max | Run access test suites & benchmark instructor catalog query |

---

## 5. References & Related Documents

- `docs/context/September/7/optimize-slow-queries-and-exam-ingress.md`
- `docs/context/September/14/realtime-exam-navigation-and-lobby-sync-optimization.md`
- `packages/db/prisma/schema.prisma`
- `app/sentinel-api/src/modules/examination/history/data/build-student-attempt-selects.ts`
- `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`
