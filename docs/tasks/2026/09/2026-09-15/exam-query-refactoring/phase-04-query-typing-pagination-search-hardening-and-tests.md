---
title: "Phase 4 — Query Typing, Pagination, Search Hardening & Test Alignment"
type: phase
parent: "Exam Query Layer Refactoring and Performance Optimization"
phase: "04"
status: completed
created: "2026-09-15"
tags: [task, phase, typing, pagination, search, tests]
---

# Phase 4 — Query Typing, Pagination, Search Hardening & Test Alignment

## Objective

Eliminate unsafe `as RawExamRecord[]` type assertions by leveraging Kysely's inferred query return types, add deterministic secondary sorting, total count metadata, search wildcard escaping, direct status enum comparison, empty visibility predicate protection, and align all unit tests.

## Dependencies & Prerequisites

- Phases 1–3 completed.

## Impacted Files & Components

- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` — Sorting tiebreaker, total count, search escaping, status comparison, predicate non-empty guard, student null telemetry.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/services/get-exams.service.ts` — Support pagination metadata.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/controllers/get-exams.controller.ts` — Provide pagination metadata in response.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/exam.dto.ts` — Add optional pagination metadata to `getExamsSchema.response`.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` — Update tests (remove metadata mock, add tiebreaker, pagination, and lateral assertions).
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts` — Update tests.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams-instructor-visibility.test.ts` — Update tests.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` — Update tests.

## Implementation Tasks

- [x] Task 4.1 — Derive query return type directly from Kysely and eliminate `as RawExamRecord[]`.
- [x] Task 4.2 — Add tie-breaker `.orderBy('e.exam_id', 'desc')` to `.orderBy('e.updated_at', 'desc')`.
- [x] Task 4.3 — Return total count from `getExamsData` (using window count `count(*) over()` or count query).
- [x] Task 4.4 — Clamp `limit` to `Math.min(Math.max(filters.limit ?? 50, 1), 100)`.
- [x] Task 4.5 — Sanitize search parameter: escape `%`, `_`, and `\`.
- [x] Task 4.6 — Replace `lower(e.status::text) = ${filters.status}` with direct enum comparison `e.status = ${filters.status}` to utilize B-tree index.
- [x] Task 4.7 — Guard `visibilityPredicates`: if empty, filter `false` instead of invalid syntax `()`.
- [x] Task 4.8 — Replace student fake count `0` with honest `null` in DB layer (`students_count`, `incident_count`).
- [x] Task 4.9 — Update and run all unit test suites.

## Verification & Testing

- `pnpm --filter sentinel-api test src/modules/examination/exams` exits 0.
- `pnpm --filter sentinel-api typecheck` exits 0.
- Search with `100%` and `test_exam` does not trigger wildcard matching.

## Risks & Rollback

- **Risk:** Existing callers expecting `students_count === 0` in raw DB records.
- **Mitigation:** `mapExamSummaryResponse` in `map-exam-response.service.ts` already handles student view formatting.
