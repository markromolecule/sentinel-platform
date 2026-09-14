---
title: "Phase 2: Client Realtime Matching and Fallback Polling Calibration"
type: phase
parent: "0002-task-realtime-session-navigation-and-lobby-sync"
phase: "2"
status: completed
created: "2026-09-14"
tags: [task, phase, hooks, realtime, polling, lobby]
---

# Phase 2: Client Realtime Matching and Fallback Polling Calibration

## Objective

Enhance `useLobbyRealtime` to match incoming `admission:updated` broadcast messages against both student IDs and authenticated user IDs, and re-calibrate the waiting fallback polling in `useExamLobbyAdmissionStatusQuery` from 10s down to 3s.

## Dependencies & Prerequisites

- Phase 1 completed (API dispatches dual-identity broadcast).

## Impacted Files & Components

- [`packages/hooks/src/use-lobby-realtime.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/use-lobby-realtime.ts): Update `isTargetStudent` filter logic while preserving exact parameter types and return signature.
- [`packages/hooks/src/query/exams/use-exam-lobby-admission-status-query.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/query/exams/use-exam-lobby-admission-status-query.ts): Set `refetchInterval` to 3,000ms while waiting, terminating upon `APPROVED`.
- [`packages/hooks/src/use-lobby-realtime.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/hooks/src/use-lobby-realtime.test.ts): Add test cases for dual-identity matching.
- [`app/sentinel-mobile/features/exam/hooks/lobby/use-exam-lobby.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/lobby/use-exam-lobby.ts): Verify instant reactive transition to "Continue" on admission.
- **Sentinel Web Non-Interference:** **Zero code modifications** in `app/sentinel-web`. Both `use-lobby-state.ts` (student lobby) and `use-instructor-lobby.ts` (instructor admissions) consume `@sentinel/hooks` directly. Because public hook contracts and types remain identical, web will automatically gain instant admission unlocking without any breaking changes or behavior regressions.

## Implementation Tasks

- [x] Task 2.1: In `use-lobby-realtime.ts`, update `isTargetStudent` condition to check `studentIds`, `userIds`, `studentId`, and `userId` against `studentId` and `session.user.id`.
- [x] Task 2.2: In `use-exam-lobby-admission-status-query.ts`, update `refetchInterval` to 3,000ms while waiting and `false` when `APPROVED`.
- [x] Task 2.3: Verify `use-exam-lobby-sync.ts` and `use-lobby-state.ts` trigger reactive state updates when cache updates occur.
- [x] Task 2.4: Update and execute unit tests in `packages/hooks`.

## Verification & Testing

- `pnpm --filter @sentinel/hooks test src/use-lobby-realtime.test.ts src/query/exams/use-exam-lobby-admission-status-query.test.ts`:
  - 67 test files, **202 passed** (100% pass rate).
  - 8/8 tests in `use-lobby-realtime.test.ts` passed (including dual-identity tests for `userIds` and `userId`).
  - 3/3 tests in `use-exam-lobby-admission-status-query.test.ts` passed (asserting 3000ms polling).
- `pnpm --filter sentinel-web test src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx src/app/(protected)/(instructor)/exams/[id]/lobby/_hooks/use-instructor-lobby.test.tsx`:
  - 2 test files, **10 passed** (100% pass rate with zero changes to sentinel-web).
- `pnpm --filter sentinel-mobile test features/exam/hooks/lobby/`:
  - 1 test file, **4 passed** (100% pass rate).

## Risks & Rollback

- **Risk:** Additional matching conditions cause false positives for other students.
- **Mitigation:** Matching strictly filters on explicit target `studentId` or `session.user.id`; instructor events remain unaffected.
- **Rollback:** Revert matching predicates in `use-lobby-realtime.ts`.
