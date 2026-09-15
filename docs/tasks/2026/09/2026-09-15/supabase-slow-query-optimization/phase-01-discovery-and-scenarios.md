---
title: "Phase 1 — Realtime WAL Polling & Replica Identity Pruning"
type: phase
status: completed
created: "2026-09-15"
tags: [phase, database, realtime, wal, replica-identity]
---

# Phase 1 — Realtime WAL Polling & Replica Identity Pruning

## Goal

Mitigate the primary bottleneck in the Supabase database—accounting for **87.02% of total execution time** and multi-second latency spikes—by reverting unnecessary `REPLICA IDENTITY FULL` configurations and pruning unused tables from the `supabase_realtime` publication.

## Key Insights & Context

- Query 1 (`realtime.list_changes`) consumed **736,945 ms** across 111,410 calls, with peak spikes reaching **5,114.85 ms (5.1s)**.
- `packages/db/prisma/migrations/20260818160000_enable_lobby_admissions_realtime_and_indexes/migration.sql` set `REPLICA IDENTITY FULL` on `public.exam_lobby_admissions`.
- The student lobby sync was upgraded on Sep 14 to use in-memory Realtime Broadcast channels (`broadcast-lobby-event.ts`), meaning Postgres CDC logical decoding is no longer required for lobby updates.
- Writing full rows to the WAL on every check-in/admission causes massive WAL bloat and logical decoding stalls.

## Tasks

- [x] **Task 1.1:** Author a Prisma/SQL migration script to revert `exam_lobby_admissions` from `REPLICA IDENTITY FULL` to `REPLICA IDENTITY DEFAULT`.
- [x] **Task 1.2:** Remove `public.exam_lobby_admissions` from the `supabase_realtime` publication (`ALTER PUBLICATION supabase_realtime DROP TABLE "public"."exam_lobby_admissions"`).
- [x] **Task 1.3:** Audit `public.notifications`, `public.messages`, and `public.conversation_participants` to determine whether `REPLICA IDENTITY FULL` is strictly required or if `DEFAULT` (logging PK + changed columns) satisfies all client listeners.
- [x] **Task 1.4:** Document SQL rollback commands in case real-time subscriber issues arise.

## Deliverables

- `packages/db/prisma/migrations/20260915120000_prune_realtime_publication_and_replica_identity/migration.sql`
- `packages/db/prisma/migrations/20260915120000_prune_realtime_publication_and_replica_identity/rollback.sql`
- `packages/db/src/scripts/sql/2026-09-15-prune-realtime-and-replica-identity.sql`
- Unit test suite: `packages/db/src/tests/prune-realtime-and-replica-identity.test.ts` (All 4 tests passing).

## Verification Evidence

- Ran `pnpm --filter @sentinel/db test` -> 12 test files passed, 38 tests passed.
- Verified client code:
  - `useLobbyRealtime` does not register `postgres_changes` listeners (uses broadcast).
  - `useNotificationRealtime` only invalidates queries without inspecting old payload state.
  - `useMessageRealtime` handles INSERT/UPDATE via `payload.new` and DELETE via primary key `payload.old.message_id`, both provided by `REPLICA IDENTITY DEFAULT`.
