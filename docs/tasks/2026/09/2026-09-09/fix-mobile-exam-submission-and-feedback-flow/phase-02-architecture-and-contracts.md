---
title: "Phase 2 — Architecture, Contracts, and Data Modeling"
type: phase
parent: "0001-task-fix-mobile-exam-submission-and-feedback-flow"
phase: "02"
status: complete
created: "2026-09-09"
completed: "2026-09-09"
tags: [task, phase, contracts, architecture]
---

# Phase 2 — Architecture, Contracts, and Data Modeling

## Objective

Update the mobile exam data models and adapters to guarantee:
1. `MobileExamDisplay` preserves `rawQuestions: ExamQuestion[]` so that `questions: questionCount` does not obliterate the original question list.
2. `extractRawQuestionsList` safely extracts questions from both raw exam payloads and adapted mobile display objects.

## Dependencies & Prerequisites

- Phase 1 discovery complete.
- Existing tests in `mobile-exam-adapter.test.ts` passing.

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/lib/mobile-exam-adapter.types.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-exam-adapter.types.ts) — Add optional `rawQuestions?: ExamQuestion[]` to `MobileExamDisplay`.
- [`app/sentinel-mobile/features/exam/lib/mobile-exam-display-adapter.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-exam-display-adapter.ts) — Populate `rawQuestions` in `adaptExamForMobile()`.
- [`app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts) — Ensure `extractRawQuestionsList()` checks `rawQuestions` fallback when `questions` is a number.

## Implementation Tasks

- [x] Task 1: Add `rawQuestions?: ExamQuestion[]` property to `MobileExamDisplay` interface in `mobile-exam-adapter.types.ts`.
- [x] Task 2: In `adaptExamForMobile()` in `mobile-exam-display-adapter.ts`, assign `rawQuestions: Array.isArray(exam.questions) ? exam.questions : (exam as any).rawQuestions ?? []`.
- [x] Task 3: In `extractRawQuestionsList()` in `mobile-question-adapter.ts`, verify that `exam.rawQuestions` is inspected if `exam.questions` is not an array.

## Verification & Testing

- Run `pnpm --filter sentinel-mobile test features/exam/lib/mobile-exam-adapter.test.ts`. (39/39 passed)
- Added unit test verifying question extraction succeeds on an exam object that was previously passed through `adaptExamForMobile()`.

## Risks & Rollback

- Zero breaking changes: `rawQuestions` is an additive optional property on `MobileExamDisplay`.
- Rollback by reverting changes in `mobile-exam-display-adapter.ts` and `mobile-exam-adapter.types.ts`.
