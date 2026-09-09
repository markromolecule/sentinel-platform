---
title: "Phase 1 — Model Contracts and Section ID Preservation"
type: phase
parent: "fix-mobile-question-rendering-and-result-parity"
phase: "01"
status: completed
created: "2026-09-09"
completed: "2026-09-09"
tags: [task, phase, contracts, mobile-adapter, question-rendering]
---

# Phase 1 — Model Contracts and Section ID Preservation

## Objective

Extend `MobileSessionQuestion` type contract and `adaptExamQuestionsForMobile` adapter to preserve `sectionId` and `content` properties, ensuring section groupings and full question metadata are maintained when raw API questions are transformed for mobile.

## Dependencies & Prerequisites

- None. Builds directly upon existing `mobile-question-adapter.ts` and `mobile-exam-adapter.types.ts`.

## Impacted Files & Components

- [`app/sentinel-mobile/features/exam/lib/mobile-exam-adapter.types.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-exam-adapter.types.ts) — Add `sectionId?: string | null` and `content?: ExamQuestion['content']` to `MobileSessionQuestion`.
- [`app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-question-adapter.ts) — Extract and populate `sectionId` and `content` in `adaptExamQuestionsForMobile()`.
- [`app/sentinel-mobile/features/exam/lib/mobile-question-adapter.test.ts`](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-mobile/features/exam/lib/mobile-question-adapter.test.ts) — Add test coverage verifying `sectionId` and `content` propagation.

## Implementation Tasks

- [x] Task 1: Add optional `sectionId?: string | null` and `content?: ExamQuestion['content']` to `MobileSessionQuestion` in `mobile-exam-adapter.types.ts`.
- [x] Task 2: In `adaptExamQuestionsForMobile()` in `mobile-question-adapter.ts`, extract `sectionId: question?.sectionId ?? question?.section_id ?? null` and pass `sectionId` and `content: question?.content ?? content` into the returned item.
- [x] Task 3: In `mobile-question-adapter.test.ts`, add unit tests verifying that questions with `sectionId` retain the property after adaptation and `content` is accessible.

## Verification & Testing

- Run adapter tests: `./node_modules/.bin/vitest run features/exam/lib/mobile-question-adapter.test.ts features/exam/lib/mobile-exam-adapter.test.ts` (PASS: 54/54 passed across 2 test files).
- Run full mobile suite: `./node_modules/.bin/vitest run` (PASS: 262/262 passed across 41 test files).
- Run TypeScript check: `./node_modules/.bin/tsc --noEmit` (PASS: 0 errors).

## Risks & Rollback

- Additive property change on an internal type. Zero breaking changes to existing components.
- Rollback: Revert changes in `mobile-exam-adapter.types.ts` and `mobile-question-adapter.ts`.
