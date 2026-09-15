---
title: "Phase 3 — Lateral Join Consolidation & Correlated Subquery Elimination"
type: phase
parent: "Exam Query Layer Refactoring and Performance Optimization"
phase: "03"
status: completed
created: "2026-09-15"
completed: "2026-09-15"
tags: [task, phase, performance, lateral-join, kysely, subqueries]
---

# Phase 3 — Lateral Join Consolidation & Correlated Subquery Elimination

## Objective

Collapse 7 separate correlated subqueries targeting `exam_section_assignments` into a single, high-performance `LEFT JOIN LATERAL` aggregation with explicit `filter (where ... is not null)` and deterministic `order by`.

## Dependencies & Prerequisites

- Phase 1 completion (all section assignments available in `exam_section_assignments`).
- Phase 2 completion (static column selection).

## Impacted Files & Components

- [NEW] `app/sentinel-api/src/modules/examination/exams/data/build-exam-assignment-lateral-join.ts` — Modular helper providing `withExamAssignmentsLateralJoin` and `buildExamAssignmentSelects`.
- [NEW] `app/sentinel-api/src/modules/examination/exams/data/build-exam-assignment-lateral-join.test.ts` — Dedicated test suite verifying lateral join compilation, syntax, ordering, and fallbacks.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` — Integrated lateral join; deleted 7 correlated subqueries.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` — Integrated lateral join; deleted correlated subqueries.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` — Updated assertions to reflect the consolidated lateral join.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts` — Updated assertions to reflect the consolidated lateral join.

## Implementation Tasks

- [x] Task 3.1 — Create `build-exam-assignment-lateral-join.ts` with:
  - Aggregation of section names, section IDs, class group IDs, class group names, room names, instructor names, instructor IDs.
  - Distinct selections with `order by` and `filter (where ... is not null)`.
  - Empty array fallback `coalesce(..., '[]'::json)`.
- [x] Task 3.2 — Attach `withExamAssignmentsLateralJoin` to `getExamsData` query.
- [x] Task 3.3 — Replace 7 correlated subqueries in `get-exams.ts` select list with references to the lateral join alias (`esa_agg`).
- [x] Task 3.4 — Adopt the same lateral join helper in `getExamByIdData` (`get-exam-by-id.ts`).

## Verification & Testing

- Unit tests in `build-exam-assignment-lateral-join.test.ts`:
  - 3 passed (3/3)
- Unit tests in `get-exams.test.ts`:
  - 15 passed (15/15)
- Unit tests in `get-exam-by-id.test.ts`:
  - 5 passed (5/5)
- Full exam module test suite (`pnpm --filter sentinel-api test src/modules/examination/exams`):
  - 22 test files passed, 130 tests passed (130/130).

## Risks & Rollback

- **Risk:** Null or empty array differences if `filter` is not properly set.
- **Mitigation:** Comprehensive unit tests assert identical JSON array outputs with `coalesce(..., '[]'::json)` fallback across empty, single, and multiple assignment scenarios.
