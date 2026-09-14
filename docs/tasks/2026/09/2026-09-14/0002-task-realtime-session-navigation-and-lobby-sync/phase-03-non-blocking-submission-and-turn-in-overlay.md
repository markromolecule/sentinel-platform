---
title: "Phase 3: Non-Blocking Submission and Turn-In Visual Overlay"
type: phase
parent: "0002-task-realtime-session-navigation-and-lobby-sync"
phase: "3"
status: completed
created: "2026-09-14"
tags: [task, phase, mobile, session, submission, ui, navigation]
---

# Phase 3: Non-Blocking Submission and Turn-In Visual Overlay

## Objective

Eliminate the multi-second navigation delay between submitting an exam and loading the feedback screen in Sentinel Mobile by executing query invalidation asynchronously in the background, and provide instant visual turn-in feedback on `ExamSessionScreen`.

## Dependencies & Prerequisites

- Prior phases planned.

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/hooks/session/use-exam-session-submission.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/session/use-exam-session-submission.ts): Remove blocking `await` on `queryClient.invalidateQueries`.
- [`app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/exam-session-screen.tsx): Consume `isSubmitting` from `useExamSession()` and render full-screen submission loading overlay.
- [`app/sentinel-mobile/features/exam/components/session/session-footer.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/session/session-footer.tsx): Disable footer navigation buttons when submitting.
- [`app/sentinel-mobile/features/exam/hooks/session/use-exam-session-submission.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/session/use-exam-session-submission.test.ts): Unit tests for submission flow and non-blocking invalidation.
- [`app/sentinel-mobile/features/exam/hooks/session/use-exam-session.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/hooks/session/use-exam-session.test.ts): Unit tests for session turn-in.

## Implementation Tasks

- [x] Task 3.1: In `use-exam-session-submission.ts`, convert `await queryClient?.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })` to non-blocking `void queryClient?.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })`.
- [x] Task 3.2: Ensure `router.replace(`/exam/${id}/feedback?attemptId=${sessionId}`)` triggers immediately following local AsyncStorage operations (`writeStoredMobileExamPreview`, `clearStoredMobileExamSession`).
- [x] Task 3.3: In `exam-session-screen.tsx`, destructure `isSubmitting` from `useExamSession()`.
- [x] Task 3.4: In `exam-session-screen.tsx`, add a high-priority loading overlay with `ActivityIndicator` and informative copy.
- [x] Task 3.5: In `session-footer.tsx`, pass `isSubmitting` prop to disable navigation buttons during submission.
- [x] Task 3.6: Update and verify unit tests in `use-exam-session-submission.test.ts` and `use-exam-session.test.ts`.

## Verification & Testing

- `pnpm --filter sentinel-mobile test features/exam/hooks/session/use-exam-session-submission.test.ts features/exam/hooks/session/use-exam-session.test.ts`:
  - 2 test files, **12 passed** (3/3 in `use-exam-session-submission.test.ts`, 9/9 in `use-exam-session.test.ts`).
  - Proves non-blocking invalidation (`mockRouter.replace` is called without waiting for slow `invalidateQueries` promise to resolve).
- `pnpm --filter sentinel-mobile test features/exam/`:
  - 39 test files, **316 passed** (100% pass rate).

## Risks & Rollback

- **Risk:** Feedback page mounts before active query cache is fully invalidated.
- **Mitigation:** The feedback page only depends on `attemptId` and `useExamQuery(id)`; it does not depend on active session queries. Background invalidation ensures fresh data without blocking UI transitions.
- **Rollback:** Revert changes in `use-exam-session-submission.ts` and `exam-session-screen.tsx`.
