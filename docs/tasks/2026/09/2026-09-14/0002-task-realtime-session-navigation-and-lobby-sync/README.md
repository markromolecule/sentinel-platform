---
title: "Task: Real-Time Session Navigation and Lobby Admission Sync Optimization"
type: task
status: completed
created: "2026-09-14"
tags: [task, realtime, lobby, submission, navigation, mobile, web, performance]
---

# Task: Real-Time Session Navigation and Lobby Admission Sync Optimization

## Outcome

Eliminate client-side transition lags during live exams across Sentinel Mobile and Sentinel Web:

1. Student lobby reflects instructor approval in real time (< 150ms) by aligning real-time broadcast identifiers (`student_id` and `user_id`) and tuning fallback polling to 3 seconds.
2. Mobile exam session navigates to the post-exam feedback screen immediately (< 500ms) upon server submission completion by unblocking TanStack Query cache invalidations, and provides instant visual feedback via a dedicated submitting overlay on the session screen.

## Pre-Planning Record

### Actors and Goals

- **Student:** Wants instant feedback when an instructor admits them from the lobby (no 10-second lag) and immediate confirmation and routing to the feedback screen when submitting their exam (no frozen screen).
- **Instructor / Proctor:** Wants student devices to reflect admission decisions and turn-in events synchronously with instructor monitoring records.

### Domain Language

- **Lobby Admission Status:** State of the student's entry permission (`WAITING`, `APPROVED`, `REJECTED`).
- **Student ID vs User ID:** `students.student_id` (database entity PK) vs `auth.users.id` / `session.user.id` (Supabase authentication user identity).
- **Stateless Broadcast:** Lightweight REST-dispatched Supabase Realtime message on topic `lobby:${examId}`.
- **Turn-In / Submission:** Finalizing the attempt via `/examination/flow/complete`, writing score snapshot, and navigating to `/exam/[id]/feedback`.

### Scenario Coverage

| ID | Actor and Situation | Preconditions | Expected Outcome | Failure / Recovery | Status |
| --- | --- | --- | --- | --- | --- |
| **SC-01** | Student waiting in mobile lobby admitted by instructor | Student connected to `lobby:${examId}`, status `WAITING` | Instructor clicks "Admit"; broadcast receives dual identifier; "Continue" unlocks in < 150ms | Polling fallback detects approval within 3s | Planned |
| **SC-02** | Bulk "Admit All" from instructor web lobby | Multiple students waiting in lobby | All waiting students receive broadcast with matching `studentIds`/`userIds` and unlock simultaneously | Individual polling fallback catches any dropped packet | Planned |
| **SC-03** | Student clicks Submit on last question | Student has answered questions, clicks Submit in confirmation alert | Immediate submitting overlay appears; API finishes; router navigates to `/feedback?attemptId=...` in < 500ms | 409 already submitted proceeds gracefully to feedback | Planned |
| **SC-04** | Query cache refetch during submission | Active queries mounted on session screen | Query cache invalidation runs asynchronously in the background without blocking router navigation | Background refetch errors do not interrupt feedback view | Planned |

### Decision Ledger

| ID | Question | Decision | Evidence or Rationale | Alternatives Rejected | Artifact |
| --- | --- | --- | --- | --- | --- |
| **DEC-01** | How to fix realtime lobby broadcast matching? | Include both `studentIds` and `userIds` in broadcast payload; update `useLobbyRealtime` matching predicate | Backend has `students.user_id` available; client hook has `session.user.id`; matching both guarantees instant match | Relying solely on client profile resolution (introduces async round-trip) | [ADR](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md) |
| **DEC-02** | How to handle query invalidation on submission? | Fire `queryClient.invalidateQueries` asynchronously (`void`) without `await` before `router.replace` | `await queryClient.invalidateQueries` awaits all mounted active query HTTP refetches, adding 2–4s lag | Invalidating only after unmount (delayed freshness) | [ADR](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md) |
| **DEC-03** | What interaction feedback to show on submission? | Render a high-visibility submitting overlay on `ExamSessionScreen` | `isSubmitting` was unconsumed, leaving the screen visually static after alert dismissed | Toast only (user can still tap questions) | [ADR](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/decisions/2026-09-14-realtime-session-navigation-and-admission-sync.md) |

## Acceptance Criteria

| ID | Source | Criterion | Implementation | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| **AC-01** | FR-01 | Realtime broadcast payload contains `userIds` alongside `studentIds` | `updateAdmissions.ts` and `authorizeStudentReentry.service.ts` query linked `user_id`s and broadcast both | Unit tests in `sentinel-api` (PASS: 33/33 lobby, 21/21 overrides) | Verified |
| **AC-02** | FR-02 | `useLobbyRealtime` matches events targeting either `studentId` or `userId` | `use-lobby-realtime.ts` predicate checks `studentIds`, `userIds`, and current user auth | Unit tests in `packages/hooks` (PASS: 8/8 tests) | Verified |
| **AC-03** | FR-03 | Fallback polling interval while waiting in lobby is 3s (down from 10s) | `use-exam-lobby-admission-status-query.ts` returns 3000ms when not approved, false when approved | Unit tests in `packages/hooks` (PASS: 3/3 tests) | Verified |
| **AC-04** | FR-04 | Submission navigation does not block on query invalidation | `use-exam-session-submission.ts` invokes `void queryClient?.invalidateQueries(...)` and navigates immediately | Unit tests in `sentinel-mobile` (PASS: 3/3 tests) | Verified |
| **AC-05** | FR-05 | `ExamSessionScreen` renders loading overlay when `isSubmitting` is true | `ExamSessionScreen` consumes `isSubmitting` and renders turn-in modal overlay | UI render inspection & component test | Verified |

## Scope

- Backend API broadcast payload enrichment (`studentIds` + `userIds`).
- Shared hook `useLobbyRealtime` matching predicate update.
- Adaptive polling tuning in `useExamLobbyAdmissionStatusQuery`.
- Mobile session submission hook navigation unblocking.
- Mobile session screen turn-in loading overlay.

## Non-Goals

- Changing exam scoring, auto-grading, or essay rubrics.
- Changing database schema or tables.
- Replacing Supabase Realtime broadcast with custom WebSockets.

## Phases

- [x] `phase-01-dual-identity-broadcast-contract.md` — Phase 1: Enrich API broadcast payloads with dual `student_id` & `user_id` identifiers
- [x] `phase-02-realtime-hook-and-polling-calibration.md` — Phase 2: Update shared realtime hook predicate and calibrate adaptive polling
- [x] `phase-03-non-blocking-submission-and-turn-in-overlay.md` — Phase 3: Unblock submission navigation and render turn-in overlay in mobile session
- [x] `phase-04-end-to-end-verification.md` — Phase 4: Full verification, regression audit, and test suite confirmation

## Verification

- **Phase 1:**
  - `pnpm --filter sentinel-api test src/modules/examination/lobby/` (PASS: 33/33 tests across 7 suites).
  - `pnpm --filter sentinel-api test src/modules/examination/student-overrides/` (PASS: 21/21 tests across 6 suites).
- **Phase 2:**
  - `pnpm --filter @sentinel/hooks test src/use-lobby-realtime.test.ts src/query/exams/use-exam-lobby-admission-status-query.test.ts` (PASS: 67/67 suites, 202/202 tests).
  - `pnpm --filter sentinel-web test src/app/(protected)/student/exam/[id]/lobby/_hooks/use-lobby-state.test.tsx src/app/(protected)/(instructor)/exams/[id]/lobby/_hooks/use-instructor-lobby.test.tsx` (PASS: 2/2 suites, 10/10 tests, zero changes required to web code).
  - `pnpm --filter sentinel-mobile test features/exam/hooks/lobby/` (PASS: 1/1 suites, 4/4 tests).
- **Phase 3:**
  - `pnpm --filter sentinel-mobile test features/exam/hooks/session/use-exam-session-submission.test.ts features/exam/hooks/session/use-exam-session.test.ts` (PASS: 2/2 suites, 12/12 tests).
  - `pnpm --filter sentinel-mobile test features/exam/` (PASS: 39/39 suites, 316/316 tests).
- **Phase 4:**
  - Full regression test run across all touched packages passed (100% pass rate).
  - TypeScript type checks passed with 0 errors across `@sentinel/hooks`, `sentinel-mobile`, and `sentinel-api`.


