---
title: "Phase 1 — Database Migration & Section Assignment Consolidation"
type: phase
parent: "Exam Query Layer Refactoring and Performance Optimization"
phase: "01"
status: completed
created: "2026-09-15"
tags: [task, phase, migration, database, section-assignments]
---

# Phase 1 — Database Migration & Section Assignment Consolidation

## Objective

Backfill all assignments from the legacy `exam_assigned_sections` table into `exam_section_assignments`, establish `exam_section_assignments` as the single source of truth, and eliminate the repetitive `UNION` queries in the examination data layer.

## Dependencies & Prerequisites

- Existing Prisma schema and PostgreSQL database connection.

## Impacted Files & Components

- [NEW] `packages/db/prisma/migrations/20260915123000_backfill_exam_section_assignments/migration.sql` — Idempotent migration backfilling historical assignments.
- [NEW] `packages/db/prisma/migrations/20260915123000_backfill_exam_section_assignments/rollback.sql` — Rollback documentation for additive migration.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/replace-exam-assigned-sections.ts` — Mirrored into `exam_section_assignments` on conflict do nothing.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` — Removed UNION query in `buildAssignedSectionIdsSelect` and simplified `buildSectionAssignmentExistsPredicate` to query only `exam_section_assignments`.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` — Replaced UNION section subqueries with direct queries against `exam_section_assignments`.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` — Replaced UNION section subqueries with direct queries against `exam_section_assignments`.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` — Updated assertions to reflect unified `exam_section_assignments` queries.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` — Updated assertions.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts` — Updated assertions.

## Implementation Tasks

- [x] Task 1.1 — Create migration script to copy missing `(exam_id, section_id, created_at)` from `exam_assigned_sections` to `exam_section_assignments` with `ON CONFLICT (exam_id, section_id) DO NOTHING`.
- [x] Task 1.2 — Refactor `buildSectionAssignmentExistsPredicate` to query only `exam_section_assignments`.
- [x] Task 1.3 — Refactor `buildAssignedSectionIdsSelect` to query only `exam_section_assignments` without the `UNION` operation.
- [x] Task 1.4 — Ensure `createExam` and `updateExam` write paths maintain `exam_section_assignments` cleanly.

## Verification & Testing

- **Predicates Test Suite:**
  ```bash
  pnpm --filter sentinel-api test src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts
  ```
  Result: 12/12 tests passed (100%).
- **Exams Data Test Suite:**
  ```bash
  pnpm --filter sentinel-api test src/modules/examination/exams/data
  ```
  Result: 4 test files passed (35/35 tests).
- **Exams Module Test Suite:**
  ```bash
  pnpm --filter sentinel-api test src/modules/examination/exams
  ```
  Result: 21 test files passed (127/127 tests).

## Risks & Rollback

- **Risk:** Existing legacy rows missing from `exam_section_assignments` could cause visibility drops if not backfilled.
- **Mitigation:** The `INSERT ... ON CONFLICT DO NOTHING` migration is idempotent and guarantees 100% data presence before queries drop the UNION.
