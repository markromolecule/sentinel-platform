---
title: "Phase 3 — Sentinel API Query Pruning & Index Alignment"
type: phase
status: completed
created: "2026-09-15"
tags: [phase, api, kysely, get-exams, performance, index]
---

# Phase 3 — Sentinel API Query Pruning & Index Alignment

## Goal

Optimize high-frequency application queries in `app/sentinel-api` by pruning unnecessary subqueries on student exam catalog views and verifying index alignment.

## Key Insights & Context

- In `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`, `students_count` and `incident_count` were evaluated as correlated subqueries across `exam_attempts` and `flagged_incidents` for **every exam in the page**, even when called by a student.
- In `map-exam-response.service.ts` (lines 313–322), student responses already hardcode `studentsCount: 0` and use `attempt_incident_count` for `incidentCount`, meaning the outer subqueries were completely discarded on student views.
- Query 16 (`notifications`) performance was bolstered by the composite index `idx_notifications_recipient_inst_created` combined with Phase 1's `REPLICA IDENTITY DEFAULT` to prevent page bloat.

## Tasks Completed

- [x] **Task 3.1 (Catalog Query Telemetry Pruning):**
  - In `get-exams.ts`, introduced role-aware select projection:
    - When `studentUserId` is present, statically project `sql<number>\`0\`.as('students_count')` and `sql<number>\`0\`.as('incident_count')`.
    - Only attach correlated subqueries across `exam_attempts` and `flagged_incidents` when called by instructors/staff (`!studentUserId`).
- [x] **Task 3.2 (Staff Exam Access Control Audit):**
  - Inspected `buildStaffExamVisibilityPredicates` in `exam-access.service.ts` and confirmed each subquery probes an index on the user foreign key (`exam_section_assignments.instructor_id`, `proctor_assignments.instructor_id`, `classroom_instructor_assignments.instructor_user_id`, `exam_shares.user_id`).
- [x] **Task 3.3 (Notification Index & Query Alignment):**
  - Audited `idx_notifications_recipient_inst_created` (`recipient_user_id, institution_id, created_at DESC`).
  - Confirmed Phase 1's `REPLICA IDENTITY DEFAULT` on `notifications` eliminates WAL and tuple churn during read status updates.
- [x] **Task 3.4 (Unit & Regression Tests):**
  - Added unit tests in `get-exams.test.ts` to assert that telemetry subqueries are pruned for students and present for instructors.
  - Verified that all 28 examination, history, and assignment test suites (155 tests) pass.

## Deliverables

- Optimized `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts`.
- Updated unit test suite in `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts`.
- Green test suite across 155 examination tests.
