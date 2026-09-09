---
title: "Fix Mobile Exam Submission Flow, Result View Parity, and Question Visibility"
type: context
status: draft
created: "2026-09-09"
tags: [context, mobile, exam-flow, submission, result-view, feedback, question-visibility]
feature: "fix-mobile-exam-submission-and-question-visibility"
---

# Fix Mobile Exam Submission Flow, Result View Parity, and Question Visibility Context Specification

## 1. Overview & Objective

- **Problem Statement:**
  1. **Redundant Duplicate Turn-In & Feedback Block on Mobile:** When a student finishes an exam session on mobile, `useExamSessionSubmission` immediately invokes `completeExamSession(apiClient, ...)`, mutating the exam attempt state to `COMPLETED` on the backend. The student is then routed to `/exam/[id]/result`. On the result screen, tapping the primary button "Complete & Give Feedback" executes `handleTurnIn` in `use-exam-result.ts`, which checks `if (!preview.completedAt)`. Because `useExamSessionSubmission` saved `preview` without a top-level `completedAt` property, `!preview.completedAt` evaluates to `true`, causing mobile to re-invoke `completeExamSession`. The backend rejects this second mutation with HTTP 409 (`"This exam session has already been submitted."`), triggering a blocking modal alert ("Turn-in failed: This exam session has already been submitted") that traps the student on the result screen and prevents navigation to the post-exam feedback form.
  2. **Question Visibility & Answer Breakdown Ambiguity:** The user reported two related questions/visibility concerns:
     - Clarify whether questions should be visible or hidden in the post-submission result view (`ResultView`) vs. during active exam session vs. exam history review.
     - In `ResultView`, objective questions cannot be re-graded client-side because the student question endpoint sanitizes answer keys (`correctAnswer`, `acceptedAnswers`, etc.), causing section scores and answered counts to appear provisional (`-- (0%)` or `0 answered`) despite successful submission on the server.
- **Business / User Value:**
  - Guarantees seamless transition from exam completion to the post-exam feedback workflow without traumatic "Turn-in failed" error alerts.
  - Ensures accurate representation of student results and clear, transparent feedback regarding why individual questions and answer keys are protected or displayed according to exam release policy.
- **Success Criteria:**
  - Tapping "Complete & Give Feedback" on `/exam/[id]/result` transitions smoothly to `/exam/[id]/feedback` without duplicate network mutations or 409 errors.
  - If a duplicate turn-in is attempted defensively, HTTP 409 "already been submitted" is treated as idempotent success, clearing local session storage and navigating forward to feedback.
  - Question visibility and scoring behavior across exam lifecycle states (in-progress session, result preview, and historical review) are verified and documented.

---

## 2. Requirements & User Stories

### User Stories / Scenarios

- *As a student completing an exam on mobile, I want to submit my exam and immediately proceed to provide feedback without seeing a "Turn-in failed" error alert.*
- *As a student viewing my completed exam result, I want my performance breakdown and answered metrics to accurately reflect my submission status (or clearly state if review is pending).*
- *As a proctor or instructor, I want the student's submission timestamp and telemetry to be recorded once without duplicate conflicting submission events.*

### Functional Requirements

- [ ] **FR-01 (Idempotent Session Turn-in & Result Navigation):**
  - In `useExamSessionSubmission` (`app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts`):
    - When `completeExamSession` succeeds, write `completedAt: result.completedAt || new Date().toISOString()` into `MobileStoredExamPreview`.
  - In `useExamResult` (`app/sentinel-mobile/features/exam/hooks/use-exam-result.ts`):
    - Check if `preview.completedAt` exists OR if `preview.summary` is already present. If present, do NOT invoke `completeExamSession`; immediately clear storage and navigate to `/exam/[id]/feedback?id=${id}&attemptId=${sessionId}`.
    - Wrap `completeExamSession` in error interception: if an HTTP 409 or message containing "already been submitted" or "already submitted" is caught, treat as idempotent success, clear storage, and proceed to `/exam/[id]/feedback`.
- [ ] **FR-02 (Question Visibility & Active Session Adaptation):**
  - Option A Confirmed: Resolve the condition where questions fail to display during the active session:
    - In `adaptExamForMobile` (`mobile-exam-display-adapter.ts`), preserve the raw questions list in `rawQuestions` so that replacing `questions` with `questionCount: number` does not obliterate the question objects.
    - In `useExamResult` (`use-exam-result.ts`), query with `{ viewer: 'student' }` and use `adaptExamQuestionsForMobile` for consistent question mapping.
    - In `extractRawQuestionsList` (`mobile-question-adapter.ts`), safely retrieve `rawQuestions` if `questions` is a number.

### Edge Cases & Failure Modes

- **Already Submitted Attempt:** When `completeExamSession` returns 409, client gracefully proceeds to feedback instead of blocking the user.
- **Network Interruption during Feedback Transition:** Storage cleanup only occurs upon verified completion or confirmed idempotent status.

---

## 3. Technical & Architectural Context

- **Affected Layers:** Mobile (`app/sentinel-mobile`), Shared Contracts (`packages/services`, `@sentinel/shared`).
- **Key Files:**
  - `app/sentinel-mobile/features/exam/hooks/use-exam-result.ts`
  - `app/sentinel-mobile/features/exam/hooks/use-exam-session-submission.ts`
  - `app/sentinel-mobile/features/exam/lib/mobile-exam-storage.ts`
  - `app/sentinel-mobile/features/exam/components/detail/result-view.tsx`
  - `app/sentinel-api/src/modules/examination/flow/services/complete-session/complete-session.guards.ts`

---

## 4. Scope & Boundaries

- **In Scope:**
  - Mobile exam turn-in idempotency fix and feedback page navigation.
  - Clarification and alignment of question visibility behavior on mobile result screens.
- **Out of Scope:**
  - Modifying backend scoring engines or database schemas.

---

## 5. Decision Ledger

| ID | Topic | Decision | Status |
| :--- | :--- | :--- | :--- |
| DEC-01 | Submission Idempotency | `handleTurnIn` must not re-invoke `completeExamSession` when session was submitted during session flow | Approved |
| DEC-02 | 409 Recovery | Intercept "already been submitted" as success and route to feedback | Approved |
| DEC-03 | Question Visibility | Option A confirmed: Address missing questions in active exam session and prevent question dropping during model adaptation | Approved |
