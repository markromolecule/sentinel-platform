---
title: "Phase 1: Set-Based Multi-Row Student Upsert & Batch Enrollment Implementation"
type: phase
parent: "Optimize Classroom Student Enrollment: Eliminate N+1 Queries via Set-Based Batch Upsert"
phase: "01"
status: completed
created: "2026-09-17"
completed: "2026-09-18"
tags: [task, phase, performance, kysely, batch-upsert]
---

# Phase 1: Set-Based Multi-Row Student Upsert & Batch Enrollment Implementation

## Objective

Refactor `enrollStudentsData` in `app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts` to replace the sequential N+1 query loop with set-based multi-row batch upserts in Kysely wrapped in `executeTransaction`.

---

## Dependencies & Prerequisites

- ADR accepted: [`docs/decisions/2026-09-17-batch-classroom-student-enrollment-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-17-batch-classroom-student-enrollment-optimization.md)
- Context specification ready: [`docs/context/September/17/classroom-enrollment-batch-upsert-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/17/classroom-enrollment-batch-upsert-optimization.md)

---

## Impacted Files & Components

- [enroll-students.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts) — Replace the `for...of` loop with in-memory validation, multi-row `insertInto('students').values([...])` with `COALESCE`, and multi-row `insertInto('enrollments').values([...])`.

---

## Implementation Tasks

- [x] **Task 1.1 — Import `executeTransaction` and Kysely helpers:** Ensure `executeTransaction` from `@sentinel/db` is imported and used for atomic multi-row mutation.
- [x] **Task 1.2 — Implement In-Memory Validation & Partitioning:**
  - Build a lookup map from `whitelistRecords` keyed by `student_number`.
  - Iterate through `studentNumbers` and partition into `failedResults` (not found, department mismatch, course mismatch) and `validWhitelistRecords`.
- [x] **Task 1.3 — Implement Multi-Row Student Upsert:**
  - Map `validWhitelistRecords` into a batch values array for `students`.
  - Execute a single `insertInto('students').values([...]).onConflict(oc => oc.columns(['institution_id', 'student_number']).doUpdateSet({ department_id, course_id, user_id: COALESCE, updated_at })).returning(['student_id', 'user_id', 'student_number'])`.
- [x] **Task 1.4 — Implement Multi-Row Enrollment Insert:**
  - Correlate upserted student records with `existingEnrollmentStudentIds`.
  - Partition students into already-enrolled (`FAILED` with reason) and eligible new enrollments.
  - Execute a single `insertInto('enrollments').values([...]).onConflict(oc => oc.columns(['class_group_id', 'student_id']).doNothing())` for all new enrollments.
- [x] **Task 1.5 — Return Formatted Response:**
  - Combine success and failure results into the required `{ enrolledCount, failedCount, results }` contract.

---

## Verification & Testing

- **Formatting Check:**
  - Command: `npx prettier --check app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts`
  - Result: Clean (All matched files use Prettier code style).
- **Type-Check:**
  - Command: `npx tsc --noEmit app/sentinel-api/src/modules/identity/enrollments/data/enroll-students.ts --target ESNext --module NodeNext --moduleResolution NodeNext --skipLibCheck`
  - Result: 0 errors (Exit code 0).
- **Unit & Integration Suite:**
  - Command: `pnpm --filter sentinel-api test src/modules/identity/enrollments`
  - Result: **16 passed (16 test files), 34 passed (34 tests)**. Total test execution time 18.05s.

---

## Risks & Rollback

- **Risk:** In-memory validation differs from previous loop checks.
  - *Mitigation:* The validation logic preserves the identical department and course ID equality guards against `classGroup`.
- **Rollback:** Revert `enroll-students.ts` via Git if any regression is detected.
