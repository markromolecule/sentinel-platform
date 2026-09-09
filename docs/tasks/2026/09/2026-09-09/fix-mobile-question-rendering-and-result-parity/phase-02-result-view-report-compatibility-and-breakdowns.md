---
title: "Phase 2 — Result View Report Compatibility and Section Breakdowns"
type: phase
parent: "fix-mobile-question-rendering-and-result-parity"
phase: "02"
status: completed
created: "2026-09-09"
completed: "2026-09-09"
tags: [task, phase, result-view, section-breakdown, score-reports]
---

# Phase 2 — Result View Report Compatibility and Section Breakdowns

## Objective

Harden `ResultView` in `app/sentinel-mobile/features/exam/components/detail/result-view.tsx` to:
1. Normalize questions defensively before invoking `buildExamAttemptQuestionReports` to ensure `question.content.prompt` and scoring options are present and cannot crash at runtime.
2. Filter questions by `sectionId` properly so exams with sections show actual score breakdowns per section.
3. Maintain clean fallback to "Core Assessment" when an exam has no defined sections.

## Dependencies & Prerequisites

- Phase 1 completed (`MobileSessionQuestion` carries `sectionId` and `content`).

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/components/detail/result-view.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/detail/result-view.tsx) — Question report normalization and section filtering.
- [`app/sentinel-mobile/features/exam/components/detail/result-view.test.tsx`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/components/detail/result-view.test.tsx) — Tests for section breakdown filtering and fallback behavior.

## Implementation Tasks

- [x] Task 1: In `result-view.tsx`, ensure the question array passed to `buildExamAttemptQuestionReports` has a guaranteed `content.prompt` fallback derived from `q.content?.prompt ?? q.text ?? ''`.
- [x] Task 2: Verify `questionList` leverages `q.sectionId` to accurately filter questions belonging to each section in `exam.questionSections`.
- [x] Task 3: In `result-view.test.tsx`, add tests verifying:
  - When `exam.questionSections` exists and questions carry matching `sectionId`, section breakdown titles and calculated scores render properly.
  - When no sections exist, "Core Assessment" renders with total points and percentage.

## Verification & Testing

- Run component tests: `./node_modules/.bin/vitest run features/exam/components/detail/result-view.test.tsx` (PASS: 9/9 passed).
- Run full mobile suite: `./node_modules/.bin/vitest run` (PASS: 265/265 passed across 41 test files).
- Run TypeScript check: `./node_modules/.bin/tsc --noEmit` (PASS: 0 errors).

## Risks & Rollback

- Defensive mapping ensures backward compatibility with legacy question payloads.
- Rollback: Revert modifications to `result-view.tsx` and `result-view.test.tsx`.
