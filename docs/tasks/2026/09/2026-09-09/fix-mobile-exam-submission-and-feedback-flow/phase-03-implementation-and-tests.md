---
title: "Phase 3 — Incremental Implementation and Tests"
type: phase
parent: "0001-task-fix-mobile-exam-submission-and-feedback-flow"
phase: "03"
status: complete
created: "2026-09-09"
tags: [task, phase, implementation, tests]
---

# Phase 3 — Incremental Implementation and Tests

## Objective

1. Guarantee submission idempotency by storing `completedAt` in `writeStoredMobileExamPreview` during session submission.
2. In `useExamResult`, skip `completeExamSession` if `completedAt` exists, and catch 409 "already submitted" errors to gracefully transition to `/exam/[id]/feedback`.
3. Update `useExamResult` to query with `{ viewer: 'student' }` and map questions using `adaptExamQuestionsForMobile`.
4. Update unit tests in `use-exam-result.test.ts` and `use-exam-session.test.ts`.

## Dependencies & Prerequisites

- Phase 2 contract updates completed.

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts) — Store `completedAt: result.completedAt || new Date().toISOString()`.
- [`app/sentinel-mobile/features/exam/hooks/use-exam-result.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/use-exam-result.ts) — Skip duplicate turn-in, intercept 409 conflict, use student query params.
- [`app/sentinel-mobile/features/exam/hooks/use-exam-result.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/use-exam-result.test.ts) — Tests for idempotency skip and 409 recovery.
- [`app/sentinel-mobile/features/exam/hooks/use-exam-session.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/use-exam-session.test.ts) — Update preview assertion.

## Implementation Tasks

- [x] Task 1: In `use-exam-session-submission.ts`, add `completedAt: result.completedAt || new Date().toISOString()` to `preview`.
- [x] Task 2: In `use-exam-result.ts`, check `if (!preview.completedAt && !preview.summary?.completedAt)` before calling `completeExamSession`.
- [x] Task 3: In `use-exam-result.ts`, intercept 409 / "already been submitted" errors, clear storage, and call `router.replace({ pathname: '/exam/[id]/feedback', params: { id, attemptId: sessionId } })`.
- [x] Task 4: In `use-exam-result.ts`, query with `{ viewer: 'student' }` and adapt questions using `adaptExamQuestionsForMobile(rawExam)`.
- [x] Task 5: Update `use-exam-result.test.ts` with tests for:
  - Already submitted attempt skips network call and routes to `/feedback`.
  - 409 error is gracefully intercepted and routes to `/feedback`.
  - Missing preview/id safety guards.
- [x] Task 6: Update `use-exam-session.test.ts` to expect `completedAt` in `writeStoredMobileExamPreview`.

## Verification & Testing

- `pnpm --filter sentinel-mobile test features/exam/hooks/use-exam-result.test.ts`
- `pnpm --filter sentinel-mobile test features/exam/hooks/use-exam-session.test.ts`

## Risks & Rollback

- If 409 suppression is too broad, actual network failures could be masked. Mitigation: specifically check for status 409 or message matching `/already.*submitted/i`.
