---
title: "Phase 2 — Eliminate Runtime Schema Introspection & Fix Department Bug"
type: phase
parent: "Exam Query Layer Refactoring and Performance Optimization"
phase: "02"
status: completed
created: "2026-09-15"
completed: "2026-09-15"
tags: [task, phase, schema, introspection, bug-fix]
---

# Phase 2 — Eliminate Runtime Schema Introspection & Fix Department Bug

## Objective

Completely remove runtime `information_schema.columns` checks (`getExamColumnSupport`) from `get-exams.ts` and `get-exam-by-id.ts`, select columns statically, and fix the unguarded `departmentId` filter bug.

## Dependencies & Prerequisites

- Verified static schema in `@sentinel/db` confirming `exams` has `section_id`, `section_name`, `room_id`.

## Impacted Files & Components

- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.ts` — Remove `getExamColumnSupport` call; make select list static; fix department filtering.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts` — Remove `getExamColumnSupport` call; select columns statically.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts` — Remove `hasSectionId` param and dynamic branch.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/helper/exam-schema-compat.ts` — Marked `getExamColumnSupport` as `@deprecated`.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams.test.ts` — Removed metadata mock; verified single query invocation.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.test.ts` — Removed metadata mock; verified single query invocation.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/get-exams-instructor-visibility.test.ts` — Removed metadata mock; verified single query invocation.
- [MODIFY] `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.test.ts` — Removed `hasSectionId` and streamlined predicate testing.

## Implementation Tasks

- [x] Task 2.1 — Remove `getExamColumnSupport` call from `getExamsData` and `getExamByIdData`.
- [x] Task 2.2 — Replace conditional `$if(columnSupport.hasRoomId, ...)` with static `leftJoin('rooms as r', 'r.room_id', 'e.room_id')`.
- [x] Task 2.3 — Statically select `'e.room_id'`, `'r.room_name'`, `'e.section_id'`, `'e.section_name'` without `sql<string | null>` null fallbacks.
- [x] Task 2.4 — Fix department filter in `get-exams.ts`: ensure `e.section_id` is statically valid and add check against `exam_section_assignments` for section-assigned exams.
- [x] Task 2.5 — Remove `hasSectionId` from `buildClassroomExamFilter` and `buildStudentExamVisibilityPredicate`.

## Verification & Testing

- Run unit tests in `get-exams.test.ts` and `get-exam-by-id.test.ts`:
  - `get-exams.test.ts`: 15 passed (15/15)
  - `get-exam-by-id.test.ts`: 5 passed (5/5)
  - `get-exams-instructor-visibility.test.ts`: 3 passed (3/3)
  - `build-student-exam-scope-predicates.test.ts`: 12 passed (12/12)
  - All 21 test files in `src/modules/examination/exams`: 127 passed (127/127)
- Verified no metadata query (`information_schema.columns`) is issued:
  - Spy assertion `expect(executeSpy).toHaveBeenCalledTimes(1)` confirms exactly 1 query executed per fetch.

## Risks & Rollback

- **Risk:** If an environment exists where `section_id` or `room_id` is genuinely missing, queries would fail.
- **Mitigation:** Production databases and migrations are all at schema level where these columns are non-negotiable. Standard CI/CD deploy gate guarantees migration application.
