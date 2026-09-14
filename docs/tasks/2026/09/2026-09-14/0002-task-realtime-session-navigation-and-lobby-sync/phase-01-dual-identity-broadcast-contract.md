---
title: "Phase 1: Dual-Identity Realtime Broadcast Contract"
type: phase
parent: "0002-task-realtime-session-navigation-and-lobby-sync"
phase: "1"
status: completed
created: "2026-09-14"
tags: [task, phase, api, broadcast, realtime]
---

# Phase 1: Dual-Identity Realtime Broadcast Contract

## Objective

Ensure `sentinel-api` includes both `studentIds` (`students.student_id`) and `userIds` (`students.user_id`) in all `admission:updated` Supabase Realtime broadcast payloads, bridging the disconnect between database student records and client authentication sessions.

## Dependencies & Prerequisites

- ADR accepted: [`docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md)

## Impacted Files & Components

- [`app/sentinel-api/src/modules/examination/lobby/services/broadcast-lobby-event.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/broadcast-lobby-event.ts): Extend `LobbyBroadcastPayload` type with `userIds?: string[]; userId?: string;`.
- [`app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/update-admissions.ts): Resolve student records to collect linked `user_id`s, and include `userIds` in `broadcastLobbyEvent`.
- [`app/sentinel-api/src/modules/examination/student-overrides/services/authorize-student-reentry.service.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/student-overrides/services/authorize-student-reentry.service.ts): Resolve `user_id` and attach to broadcast payload.
- [`app/sentinel-api/src/modules/examination/lobby/services/broadcast-lobby-event.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/lobby/services/broadcast-lobby-event.test.ts): Verified payload contract tests.

## Implementation Tasks

- [x] Task 1.1: Update `LobbyBroadcastPayload` in `broadcast-lobby-event.ts` to type `userIds?: string[]` and `userId?: string`.
- [x] Task 1.2: In `update-admissions.ts`, query `students` table to resolve `user_id`s for the admitted students prior to broadcast, and pass `userIds` alongside `studentIds`.
- [x] Task 1.3: In `authorize-student-reentry.service.ts`, resolve student `user_id` and pass `userId` / `userIds` in the broadcast.
- [x] Task 1.4: Run backend unit tests to verify broadcast payload contract.

## Verification & Testing

- `pnpm --filter sentinel-api test src/modules/examination/lobby/`: 7 test files, 33/33 tests passed.
- `pnpm --filter sentinel-api test src/modules/examination/student-overrides/`: 6 test files, 21/21 tests passed.
- All touched files in `sentinel-api` compile with zero TypeScript errors.

## Risks & Rollback

- **Risk:** Extra query in `updateAdmissions` adds latency.
- **Mitigation:** The query (`selectFrom('students').where('student_id', 'in', studentIds)`) was already executed for notification delivery; it was consolidated so the single lookup result powers both broadcast and notifications.
- **Rollback:** Revert modifications to `update-admissions.ts`, `authorize-student-reentry.service.ts`, and `broadcast-lobby-event.ts`.
