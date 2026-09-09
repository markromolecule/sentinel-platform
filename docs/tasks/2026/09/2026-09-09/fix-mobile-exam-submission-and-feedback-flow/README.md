---
title: "Fix Mobile Exam Turn-in Idempotency and Question Visibility"
type: task
status: complete
created: "2026-09-09"
tags: [task, mobile, exam-flow, submission, result-view, feedback]
---

# Fix Mobile Exam Turn-in Idempotency and Question Visibility

## Outcome

1. Eliminate the blocking "Turn-in failed: This exam session has already been submitted." alert modal on mobile so students seamlessly transition from `/exam/[id]/result` to `/exam/[id]/feedback`.
2. Clarify and align question visibility across exam lifecycle states (in-progress attempt vs. result preview vs. post-release history review).

## Pre-planning record

### Actors and goals

- **Student on Mobile:** After completing and turning in an exam, wants to view their result summary and proceed to give feedback without false failure alerts.
- **Instructor / Proctor:** Wants accurate single-submission event recording on the server and integrity timeline.

### Scenario coverage

| ID | Actor and situation | Preconditions | Expected outcome | Failure/recovery | Status |
|---|---|---|---|---|---|
| SC-01 | Student turns in exam in session | Exam active in session | `completeExamSession` called, `preview` stored with `completedAt`, routes to `/result` | Network retry | Verified |
| SC-02 | Student taps "Complete & Give Feedback" | On `/exam/[id]/result`, attempt already completed | Navigates directly to `/exam/[id]/feedback?id=${id}&attemptId=${sessionId}` without re-calling API | Clears local storage | Verified |
| SC-03 | Defensive duplicate API call | Attempt already completed on server | If 409 "already been submitted" received, treats as success and routes to feedback | Modal alert suppressed | Verified |
| SC-04 | Question visibility on result screen | Result screen active | Result view displays section summary; does not expose sanitized questions/answers unless released | Clear status label | Verified |

### Decision ledger

| ID | Question | Decision | Evidence or rationale | Alternatives rejected | Artifact |
|---|---|---|---|---|---|
| DEC-01 | Why does `handleTurnIn` call `completeExamSession` again? | `useExamSessionSubmission` omitted `completedAt` in `writeStoredMobileExamPreview`, causing `!preview.completedAt` to be true | Code inspection in `use-exam-result.ts#L52` & `use-exam-session-submission.ts#L54-L61` | Requiring backend to allow re-submission | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/9/fix-mobile-exam-submission-and-question-visibility.md) |
| DEC-02 | How should 409 "already submitted" be handled on mobile? | Intercept HTTP 409 / conflict and proceed to `/feedback` | Eliminates terminal lockout if storage gets out of sync | Showing failure modal | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/9/fix-mobile-exam-submission-and-question-visibility.md) |
| DEC-03 | Where was the question visibility issue observed? | Option A confirmed: questions were missing in active exam session; preserve `rawQuestions` in `adaptExamForMobile` to prevent dropping questions | Grill session confirmation | Guessing intent | [Context Spec](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/9/fix-mobile-exam-submission-and-question-visibility.md) |

### Unknowns and blockers

- *None remaining.* Option A confirmed by developer.

## Acceptance criteria

| ID | Source goal/scenario/decision | Criterion | Implementation | Verification | Status |
|---|---|---|---|---|---|
| AC-01 | SC-01, DEC-01 | `useExamSessionSubmission` stores `completedAt` in `writeStoredMobileExamPreview` | `use-exam-session-submission.ts` | Unit test in `use-exam-session.test.ts` | Verified |
| AC-02 | SC-02, DEC-01 | `handleTurnIn` in `useExamResult` skips `completeExamSession` when `preview.completedAt` or `preview.summary` exists, routing directly to `/feedback` | `use-exam-result.ts` | Unit test in `use-exam-result.test.ts` | Verified |
| AC-03 | SC-03, DEC-02 | `handleTurnIn` gracefully catches 409 "already submitted" and routes to `/feedback` | `use-exam-result.ts` | Unit test in `use-exam-result.test.ts` | Verified |
| AC-04 | DEC-03 | `adaptExamForMobile` preserves `rawQuestions` so questions are never lost when an adapted model is passed to `adaptExamQuestionsForMobile` | `mobile-exam-display-adapter.ts`, `mobile-exam-adapter.types.ts` | Unit tests in `mobile-exam-adapter.test.ts` | Verified |
| AC-05 | DEC-03 | `useExamResult` queries with `{ viewer: 'student' }` and adapts questions via `adaptExamQuestionsForMobile` | `use-exam-result.ts` | Unit test in `use-exam-result.test.ts` | Verified |

## Scope

- Mobile turn-in idempotency in `use-exam-session-submission.ts` and `use-exam-result.ts`.
- Navigation from `/exam/[id]/result` to `/exam/[id]/feedback`.
- Question visibility audit and clarification.

## Non-goals

- Altering backend grading engine or scoring algorithms.
- Changing proctoring anomaly detection thresholds.

## Phases

- [x] `phase-01-discovery-and-scenarios.md` — Phase 1 — Discovery, Scenarios, and Boundary Analysis
- [x] `phase-02-architecture-and-contracts.md` — Phase 2 — Architecture, Contracts, and Data Modeling
- [x] `phase-03-implementation-and-tests.md` — Phase 3 — Incremental Implementation and Tests
- [x] `phase-04-verification-and-release.md` — Phase 4 — Verification, Quality Gates, and Release
