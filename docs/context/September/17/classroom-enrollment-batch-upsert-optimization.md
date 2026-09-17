---
title: "Classroom Enrollment Batch Upsert & N+1 Query Elimination"
type: context
status: ready
created: "2026-09-17"
tags: [context, performance, enrollment, database, kysely, optimization]
feature: "classroom-enrollment-batch-upsert"
---

# Classroom Enrollment Batch Upsert & N+1 Query Elimination Context Specification

## 1. Overview & Objective

- **Problem Statement:** Enrolling students into a classroom (`enrollStudentsData`) uses a sequential `for...of` loop that fires 1 to 2 individual SQL statements per student. For a standard classroom cohort of 42–45 students across 8 classrooms (~360 students), this generates 360 to 720 sequential queries across the public network to Supavisor (port 6543). On test day, last-minute enrollment or roster synchronization monopolizes the shared database connection pool (`DB_POOL_MAX=25`), leading to connection timeouts and latency spikes on concurrent exam answer syncs (`syncSessionService`) and lobby boots (`bootstrap`).
- **Business / User Value:** 
  - Instructors and administrators experience instant (< 50ms) classroom enrollment even for large 50+ student cohorts.
  - Live exams running concurrently in other classrooms suffer zero connection pool starvation or answer sync latency degradation.
- **Success Criteria:**
  - Total queries for a 45-student classroom enrollment reduced from 45–90 queries to $\le 6$ total queries.
  - Total enrollment latency drops from 2,500ms–4,000ms to $< 50\text{ms}$.
  - Zero connection pool checkout timeouts (`connectionTimeoutMillis: 5000`) during concurrent exam sessions.
  - Full backward compatibility with the existing API response schema and audit logging.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As an Instructor or Administrator, I want to enroll an entire section/classroom of 45 students in a single action, so that students are immediately eligible to enter the exam lobby without experiencing gateway timeouts.*
- *As a Student taking an active exam, I want the backend connection pool to remain available and responsive, so that my background answer progress continues to sync reliably without 500/504 errors while instructors manage other classrooms.*

### Functional Requirements

- [ ] **FR-01 (In-Memory Whitelist Validation):** Validate all student numbers in memory against the pre-fetched `student_whitelist` records and `class_groups` department/course constraints, partitioning the input into `failedResults` and `validWhitelistRecords`.
- [ ] **FR-02 (Batch Multi-Row Student Upsert):** Execute a single multi-row `insertInto('students').values([...])` with `onConflict(['institution_id', 'student_number'])` using `COALESCE(excluded.user_id, students.user_id)` and `.returning(['student_id', 'user_id', 'student_number'])`.
- [ ] **FR-03 (Batch Enrollment Insert):** Filter out students who are already enrolled in the classroom using the in-memory pre-fetched enrollment records, and insert all eligible students in a single multi-row `insertInto('enrollments').values([...]).onConflict(doNothing())` statement.
- [ ] **FR-04 (Transactional Safety):** Wrap all database writes within `executeTransaction(dbClient, ...)` to ensure atomic all-or-nothing roster consistency.
- [ ] **FR-05 (Contract Parity):** Return the exact existing result payload: `{ enrolledCount: number, failedCount: number, results: Array<{ studentNumber: string, status: 'SUCCESS' | 'FAILED', reason?: string }> }`.
- [ ] **FR-06 (Audit Logging):** Preserve the asynchronous telemetry log `enrollment.bulk_student_enrolled` in `enrollStudentsService`.

### Edge Cases & Failure Modes

- **Mixed Cohort (Claimed & Unclaimed Accounts):** Pre-enrolled students may have `user_id: null` in `students` (unclaimed whitelist placeholders) or a non-null `user_id` (already registered). The SQL `COALESCE(excluded.user_id, students.user_id)` ensures existing claimed accounts never revert to null while allowing newly claimed accounts to update.
- **Duplicate Student Numbers in Request:** Normalized and deduplicated in memory prior to querying; duplicate attempts in the same payload are safely handled.
- **Student Already Enrolled:** Detected via pre-fetched enrollment set; flagged with `FAILED` status and `'Student is already enrolled in the selected classroom.'` without causing database unique constraint violations.
- **Zero Students Enrolled (All Fail Validation):** Returns cleanly with `enrolledCount: 0` and failure reasons without executing empty write queries.

---

## 3. Technical & Architectural Context

- **Affected Domains / Layers:**
  - Backend API: `app/sentinel-api`
  - Database Layer: `packages/db`
- **Existing Files & Reference Symbols:**
  - [enroll-students.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts) — Primary target for refactoring.
  - [enroll-students.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/services/enroll-students.service.ts) — Service orchestrator and audit logging.
  - [enrollments.dto.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.dto.ts) — Zod input/output schemas.
  - [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma) — Table definitions for `students` and `enrollments`.
- **Data Model & Schema Changes:**
  - **Zero schema changes or migrations required.**
  - Relies on existing unique indexes:
    - `students`: `@@unique([institution_id, student_number], map: "students_institution_id_student_number_key")`
    - `enrollments`: `@@unique([class_group_id, student_id], map: "enrollments_class_group_id_student_id_key")`
- **Security & Authorization:**
  - Enforces `getAccessibleClassroomOrThrow` RBAC check on `classGroupId` before executing queries.
  - Enforces institution-level multi-tenancy isolation (`institution_id = institutionId`).

---

## 4. UI/UX & Interaction Guidelines

- **Frontend Impact:**
  - No frontend UI changes required. Both Web (`sentinel-web`) and Mobile (`sentinel-mobile`) consume `useEnrollStudentsMutation`.
  - Mutation latency drops noticeably from 3s+ loading spinner to instant success toast.

---

## 5. Scope & Boundaries

- **In Scope:**
  - Refactoring `enrollStudentsData` in `enroll-students.ts` to use set-based multi-row batch upserts.
  - Writing automated Vitest unit tests verifying batch execution, claimed/unclaimed states, and error reporting.
  - Verification of query count and execution time.
- **Out of Scope / Non-Goals:**
  - Altering the CSV upload or student preview endpoints (`previewStudentEnrollmentData` is already batched).
  - Changing unenroll workflows (`bulkUnenrollStudentsService` already uses `whereIn`).
  - Altering instructor subject enrollment.

---

## 6. References & External Context

- **Architecture Decision Record:** [`docs/decisions/2026-09-17-batch-classroom-student-enrollment-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-17-batch-classroom-student-enrollment-optimization.md)
- **Previous Concurrency Optimization Report:** [`docs/tasks/2026/08/2026-08-28/scale-concurrency-surge-optimization/COMPARISON_AND_METRICS.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/08/2026-08-28/scale-concurrency-surge-optimization/COMPARISON_AND_METRICS.md)
- **Database Connection Pool Configuration:** [`packages/db/src/db.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/src/db.ts)
