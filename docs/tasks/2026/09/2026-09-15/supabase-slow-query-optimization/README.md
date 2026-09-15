---
title: "Supabase Slow Query Optimization and Database Performance Tuning"
type: task
status: planned
created: "2026-09-15"
tags: [task, performance, database, supabase, slow-queries, pg_stat_statements, realtime, kysely]
---

# Supabase Slow Query Optimization and Database Performance Tuning

## Outcome

Systematically eliminate the database performance bottlenecks identified in the `pg_stat_statements` export across Supabase Realtime CDC (87.35% of DB time), PostgREST schema introspection (7.47% of DB time), and Sentinel application queries (exam catalog, student ingress, notifications, and staff visibility).

## Pre-planning Record

- **Context Specification:** [`docs/context/September/15/supabase-slow-query-analysis-and-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/15/supabase-slow-query-analysis-and-optimization.md)
- **Prior Work Reference:** [`docs/context/September/7/optimize-slow-queries-and-exam-ingress.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/7/optimize-slow-queries-and-exam-ingress.md)
- **Realtime Migration Context:** [`docs/context/September/14/realtime-exam-navigation-and-lobby-sync-optimization.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/14/realtime-exam-navigation-and-lobby-sync-optimization.md)

### Actors and Goals

- **Students:** Experience instant (< 50ms) exam catalog and exam detail loading without backend connection starvation or query latency spikes during peak concurrent exam periods.
- **Instructors / Staff:** Rapidly load class group exams and proctoring views with optimized access-control queries.
- **System / Database:** Reduce Write-Ahead Log (WAL) decode amplification and prevent connection pooler saturation on Supabase.

### Scenario Coverage

| ID | Actor and Situation | Preconditions | Expected Outcome | Failure/Recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student loads exam catalog (`/student/exams`) | Authenticated as student with 20+ assigned exams | Catalog loads in < 50ms; skips redundant `students_count` and global `incident_count` scans | Fallback to default count 0 | Planned |
| SC-02 | Supabase Realtime logical decoding loop | High database write volume | `realtime.list_changes` executes in < 10ms without multi-second stalls; `exam_lobby_admissions` uses `DEFAULT` replica identity | Falls back to normal polling | Planned |
| SC-03 | PostgREST service startup & client queries | PostgREST starts or receives reload notification | PostgREST introspects schema once and remains stable without crash loops; no repetitive `pg_timezone_names` filesystem scans | Automatic retry on failure | Planned |
| SC-04 | Instructor filters exams with staff visibility | Authenticated as instructor with section/proctor assignments | Query executes via indexed `UNION` CTE in < 15ms instead of 6-branch multi-table `OR` scan | Fallback to direct scope filter | Planned |

### Decision Ledger

| ID | Question | Decision | Evidence or Rationale | Alternatives Rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Should `exam_lobby_admissions` retain `REPLICA IDENTITY FULL`? | Revert to `REPLICA IDENTITY DEFAULT` and remove from `supabase_realtime` publication. | Lobby synchronization now uses in-memory Supabase Broadcast channels (`broadcast-lobby-event.ts`). `REPLICA IDENTITY FULL` causes massive WAL bloat and 5-second stalls in `realtime.list_changes`. | Retaining `FULL` replica identity on all tables | Migration SQL |
| DEC-02 | Should student catalog queries calculate global instructor telemetry? | Conditionally omit `students_count` and `incident_count` when `studentUserId` is present. | Students never view distinct student counts or total incident metrics on their exam cards. Evaluating these subqueries for each row in a page of 20 exams forces 40 unnecessary table scans. | Keeping identical select lists for all roles | `get-exams.ts` |
| DEC-03 | How to optimize staff exam access predicates? | Refactor the 6-way `OR` tree into a `UNION` CTE of accessible exam IDs. | PostgreSQL planner cannot decompose multi-table `OR` subqueries into index seeks, forcing sequential/bitmap merges. A `UNION` CTE executes 5 fast index probes and merges them in memory. | Multiple separate queries or denormalization | `exam-access.service.ts` |

---

## Acceptance Criteria

| ID | Source Goal / Scenario | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-02 / DEC-01 | `exam_lobby_admissions` replica identity reverted to `DEFAULT` | Migration SQL script | Unit test `prune-realtime-and-replica-identity.test.ts` | Completed |
| AC-02 | SC-01 / DEC-02 | `getExamsData` omits telemetry subqueries when called by students | Update `get-exams.ts` select logic | Unit tests in `get-exams.test.ts` | Completed |
| AC-03 | SC-04 / DEC-03 | Staff exam visibility queries indexed | Audit and verify FK indexes in `exam-access.service.ts` | Unit tests in `exam-access.test.ts` | Completed |
| AC-04 | SC-03 | PostgREST stability verified and root cause of 475 reloads documented | Codebase audit & diagnostic report | `phase-02-architecture-and-contracts.md` | Completed |
| AC-05 | Baseline | `pg_stat_statements` reset and re-benchmarked under load | Execute `SELECT pg_stat_statements_reset()` | `pg_stat_statements` query output | Completed |

---

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1 — Realtime WAL Polling & Replica Identity Pruning
- [x] `phase-02-architecture-and-contracts.md` — Phase 2 — PostgREST Stability & Schema Reload Investigation
- [x] `phase-03-implementation-and-tests.md` — Phase 3 — Sentinel API Query Pruning & Index Alignment
- [x] `phase-04-verification-and-release.md` — Phase 4 — Verification, Quality Gates, and Baseline Reset

## Verification

- **Phase 1 Verification:**
  - `pnpm --filter @sentinel/db test` exited 0 (12 test suites, 38 tests passing).
  - Confirmed `exam_lobby_admissions` dropped from `supabase_realtime` publication.
  - Confirmed `notifications`, `messages`, `conversation_participants`, and `exam_lobby_admissions` reverted to `REPLICA IDENTITY DEFAULT`.
  - Rollback script `rollback.sql` generated and tested.
- **Phase 2 Verification:**
  - Codebase audit confirmed 0 trigger loops or `NOTIFY pgrst` calls.
  - Confirmed application does not call `SELECT name FROM pg_timezone_names`.
- **Phase 3 Verification:**
  - `get-exams.ts` updated to prune `students_count` and `incident_count` when `studentUserId` is set.
  - Unit tests in `get-exams.test.ts` added and passing (15 tests).
  - All 28 examination domain test files (155 tests) pass with 0 failures.
- **Phase 4 Verification:**
  - Full test verification across `@sentinel/db` and `@sentinel/api`.
  - User confirmed execution of `SELECT pg_stat_statements_reset()` and `2026-09-15-prune-realtime-and-replica-identity.sql`.


