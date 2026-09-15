---
title: "Phase 2 — PostgREST Stability & Schema Reload Investigation"
type: phase
status: completed
created: "2026-09-15"
tags: [phase, postgrest, schema-cache, introspection, timezone]
---

# Phase 2 — PostgREST Stability & Schema Reload Investigation

## Goal

Resolve the recurring execution of PostgREST schema cache introspection queries—which ran **475 times** and accounted for **63,293 ms (~63.3 seconds / 7.47% of DB time)**—with particular attention to `SELECT name FROM pg_timezone_names` (averaging 67.8ms with a 0% cache hit rate).

## Key Insights & Context

- 6 distinct introspection queries (`pg_timezone_names`, types, procs, constraints, views, role settings) were each executed exactly **475 times**.
- `pg_timezone_names` had a **0% cache hit rate** because it scans the host OS filesystem zoneinfo directory on every execution. Across 475 calls, it read 567,150 rows.
- PostgREST only executes these queries on cold worker connection establishment, container crash/restart, or upon receiving `NOTIFY pgrst, 'reload schema'`.

## Investigation & Audit Results

- [x] **Task 2.1 (PostgREST Connection & Process Lifecycle):**
  - PostgREST connects to Postgres as `authenticator`.
  - In Supabase, PostgREST worker pools recycle connections when idle or when worker processes restart.
  - In the previous load test (`docs/context/September/7/optimize-slow-queries-and-exam-ingress.md`), exactly 38 calls occurred (1 per concurrent worker). Over prolonged testing or multiple container redeploys without resetting `pg_stat_statements`, this counter reached 475.
- [x] **Task 2.2 (Audit Triggers and NOTIFY Statements):**
  - Searched entire codebase for `pgrst` and `reload schema`. Confirmed **zero** application triggers or backend services emit `NOTIFY pgrst`.
  - The 475 reloads are attributable to server lifecycle events and worker connection re-initializations rather than application trigger loops.
- [x] **Task 2.3 (Application Timezone Query Audit):**
  - Confirmed that neither `sentinel-web`, `sentinel-mobile`, nor `sentinel-api` issues `SELECT name FROM pg_timezone_names`.
  - Timezone handling in the application uses native browser/Node.js `Intl.DateTimeFormat().resolvedOptions().timeZone` or static IANA constants.
- [x] **Task 2.4 (Supabase Pooler & Stability Recommendations):**
  - Connection pooling via PgBouncer port 6543 (transaction mode) ensures persistent backend connection reuse.
  - In Supabase Dashboard, monitor PostgREST memory under Settings > Logs > API to ensure workers don't hit memory limits during bulk batch queries.

## Deliverables

- Diagnostic report documenting that the 475 calls are cumulative connection/worker lifecycle events.
- Verification that no application code issues `SELECT name FROM pg_timezone_names` or triggers `NOTIFY pgrst`.
- Recommendation to reset `pg_stat_statements` to measure active baseline.
