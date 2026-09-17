---
title: "Phase 2: Comprehensive Unit & Concurrency Verification Test Suite"
type: phase
parent: "Optimize Classroom Student Enrollment: Eliminate N+1 Queries via Set-Based Batch Upsert"
phase: "02"
status: completed
created: "2026-09-17"
completed: "2026-09-18"
tags: [task, phase, testing, vitest, verification]
---

# Phase 2: Comprehensive Unit & Concurrency Verification Test Suite

## Objective

Author an automated Vitest test suite in `app/sentinel-api/src/modules/identity/enrollments/data/tests/enroll-students.test.ts` to verify the batch multi-row enrollment data layer across all edge cases (claimed, unclaimed, already enrolled, invalid, mixed batches), and ensure query count is $\le 6$ total queries.

---

## Dependencies & Prerequisites

- Phase 1 completed: [`phase-01-batch-enrollment-data-layer.md`](./phase-01-batch-enrollment-data-layer.md)

---

## Impacted Files & Components

- [enroll-students.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/data/tests/enroll-students.test.ts) — Comprehensive unit test suite covering query budget, account integrity, duplicate conflict handling, and invalid scope partitioning.
- [enrollments.service.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/identity/enrollments/enrollments.service.test.ts) — Verification of integration with notification and audit logging.

---

## Implementation Tasks

- [x] **Task 2.1 — Mock Database Client & Query Counter:** Implement test harness that tracks total SQL query invocations during `enrollStudentsData`.
- [x] **Task 2.2 — Test 45-Student Cohort Batch Enrollment:** Verify that enrolling 45 valid students executes $\le 6$ queries and returns `enrolledCount: 45, failedCount: 0`.
- [x] **Task 2.3 — Test Claimed vs Unclaimed Account Integrity:**
  - Verify that an unclaimed student on whitelist (`claimed_user_id: null`) creates a `students` record with `user_id: null`.
  - Verify that an already claimed student (`claimed_user_id: 'user-123'`) creates/updates `students` with `user_id: 'user-123'`.
  - Verify that if a student previously had `user_id: 'user-123'` but the whitelist record has `claimed_user_id: null`, the existing `user_id` is NOT wiped (COALESCE preservation in SQL query generation).
- [x] **Task 2.4 — Test Duplicate & Already Enrolled Handling:**
  - Verify that students already enrolled in the classroom are returned with `status: 'FAILED'` and reason `'Student is already enrolled in the selected classroom.'` without failing the remaining cohort.
- [x] **Task 2.5 — Test Out-of-Scope / Invalid Student Numbers:**
  - Verify rejection for non-whitelisted numbers, department mismatches, and course mismatches.
- [x] **Task 2.6 — Execute Full Identity Test Suite & TypeScript Verification:**
  - Run `pnpm --filter sentinel-api test src/modules/identity/enrollments`
  - Run `npx tsc --noEmit`

---

## Verification & Testing

- **Dedicated Test Suite:**
  - Command: `pnpm --filter sentinel-api test src/modules/identity/enrollments/data/tests/enroll-students.test.ts`
  - Result: **9/9 passed in 7ms** (query counter, 45-student cohort, claimed/unclaimed, COALESCE conflict resolution, duplicate handling, invalid numbers, empty cohort, and error rollback).
- **Module Test Suite:**
  - Command: `pnpm --filter sentinel-api test src/modules/identity/enrollments`
  - Result: **16/16 test files passed, 42/42 tests passed** in 20.06s.
- **Type-Check:**
  - Command: `npx tsc --noEmit app/sentinel-api/src/modules/identity/enrollments/data/tests/enroll-students.test.ts --target ESNext --module NodeNext --moduleResolution NodeNext --skipLibCheck`
  - Result: 0 errors (Exit code 0).
- **Formatting:**
  - Command: `npx prettier --check app/sentinel-api/src/modules/identity/enrollments/data/tests/enroll-students.test.ts`
  - Result: Clean (All matched files use Prettier code style).

---

## Risks & Rollback

- **Risk:** Mocking Kysely queries in Vitest can be fragile if not matching the query builder chain.
  - *Mitigation:* Use standard mocked query builder patterns established in `sentinel-api` (e.g. as seen in `get-session-status.service.test.ts` and `prepare-session.service.test.ts`).
