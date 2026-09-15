---
title: "Exam Query Layer Refactoring and Performance Optimization"
type: task
status: completed
created: "2026-09-15"
tags: [task, refactor, performance, database, kysely, pagination, exam-catalog]
---

# Exam Query Layer Refactoring and Performance Optimization

## Outcome

Systematically eliminate runtime schema introspection, correlated subquery storms, legacy table dual-querying, type unsafety, and pagination vulnerabilities in the Sentinel exam catalog data layer (`get-exams.ts` and `get-exam-by-id.ts`).

## Pre-planning Record

- **Parent Performance Investigation:** [`docs/tasks/2026/09/2026-09-15/supabase-slow-query-optimization/README.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/tasks/2026/09/2026-09-15/supabase-slow-query-optimization/README.md)
- **Supabase Slow Query Context:** [`docs/context/September/15/supabase-slow-query-analysis-and-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/15/supabase-slow-query-analysis-and-optimization.md)

### Actors and Goals

- **Instructors / Staff:** Instantaneous exam catalog and detail views with deterministic ordering, complete pagination totals, and resilient department/scope filtering.
- **Students:** Fast exam list retrieval with clean, honest null telemetry instead of masked zeros.
- **System / Database:** Single-pass `LEFT JOIN LATERAL` replacing 7 separate correlated subqueries per row; index-backed status lookups; 0 runtime `information_schema` round-trips.

### Scenario Coverage

| ID | Actor and Situation | Preconditions | Expected Outcome | Failure/Recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Instructor views exam list | Authenticated instructor with department or scope filters | Query compiles statically without `information_schema` check; executes in single lateral join pass in < 15ms | Fallback to direct scope | Completed |
| SC-02 | Department-scoped query | User filters by `departmentId` | Accurately checks exam section, class group, and subject assignments without crashing on missing columns | Empty result if unassigned | Completed |
| SC-03 | Exam catalog pagination | Page boundary traversal | Deterministic sorting by `updated_at desc, exam_id desc` prevents vanishing/duplicate rows; returns total count | Default to page 1 | Completed |
| SC-04 | Exam search with special characters | Search input contains `%` or `_` | Characters escaped safely; no seq scan wildcard explosion | Literal match search | Completed |

### Decision Ledger

| ID | Question | Decision | Evidence or Rationale | Alternatives Rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | How to resolve `exam_assigned_sections` vs `exam_section_assignments`? | Backfill all missing rows into `exam_section_assignments` and standardize on `exam_section_assignments` as single source of truth. | `exam_section_assignments` is a strict superset with foreign keys to room, instructor, and class group. Dual-querying forces UNIONs and prevents unified lateral joins. | Continuing dual-table UNION queries | Migration SQL |
| DEC-02 | How to eliminate `getExamColumnSupport`? | Rely strictly on verified static Prisma/Kysely schemas. | Columns `section_id`, `section_name`, `room_id` are long migrated into `exams`. Dynamic feature detection adds latency and poisons TypeScript types. | In-memory caching of schema introspection | `get-exams.ts` |
| DEC-03 | How to collapse the 7 correlated subqueries? | Consolidate into a single `LEFT JOIN LATERAL` over `exam_section_assignments` with deterministic `json_agg(... order by ... filter (...))`. | Eliminates up to 350 subquery executions per request, reducing DB execution time by > 75%. | Keeping separate correlated subqueries | `build-exam-assignment-lateral-join.ts` |
| DEC-04 | How to handle pagination and total count? | Add secondary tiebreaker `.orderBy('e.exam_id', 'desc')`, clamp limit, and provide total count in data layer and API response metadata. | Identical timestamps cause inconsistent pagination pagination slices. The DTO clamp ensures queries never exceed safe bounds. | Client-only pagination | `get-exams.ts`, `exam.dto.ts` |

---

## Acceptance Criteria

| ID | Source Goal / Scenario | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | DEC-01 | `exam_section_assignments` contains all historical section assignments; `UNION` removed from queries | Migration SQL script and query cleanup | Migration execution and test assertions | Completed |
| AC-02 | DEC-02 | `getExamColumnSupport` completely removed from `get-exams.ts` and `get-exam-by-id.ts` | Static column selection in Kysely | Typecheck and mock removal in tests | Completed |
| AC-03 | SC-02 | Department-scoped queries safely check `e.section_id` and `exam_section_assignments` | Update `departmentId` where condition | `get-exams.test.ts` | Completed |
| AC-04 | DEC-03 | 7 assignment subqueries replaced by single `LEFT JOIN LATERAL` with `order by` and `filter (where ... is not null)` | `build-exam-assignment-lateral-join.ts` | SQL query inspection in vitest | Completed |
| AC-05 | DEC-04 | Pagination has `exam_id` tiebreaker, clamped limit, and total count metadata | Update query builder and controller | Pagination unit tests | Completed |
| AC-06 | Smaller items | Direct enum comparison for `status`, escaped wildcards for `search`, non-empty guard for visibility predicates | Parameter and query hardening | Edge-case unit tests | Completed |

---

## Phases

- [x] `phase-01-database-migration-and-assignment-consolidation.md` — Phase 1: Database Migration & Section Assignment Consolidation
- [x] `phase-02-eliminate-runtime-schema-introspection-and-fix-department-bug.md` — Phase 2: Eliminate Runtime Schema Introspection & Fix Department Bug
- [x] `phase-03-lateral-join-consolidation-and-subquery-elimination.md` — Phase 3: Lateral Join Consolidation & Correlated Subquery Elimination
- [x] `phase-04-query-typing-pagination-search-hardening-and-tests.md` — Phase 4: Query Typing, Pagination, Search Hardening & Test Alignment

## Verification

- `pnpm --filter sentinel-api test src/modules/examination/exams` exits 0 with 100% tests passing.
- `pnpm --filter sentinel-api typecheck` exits 0 with 0 TypeScript compiler errors.
- Verified compiled SQL in tests confirms 0 `information_schema` queries, single lateral join, and deterministic array aggregations.
