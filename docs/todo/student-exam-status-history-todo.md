# Student Exam Status And History Sync To-Do

## Summary

Align student exam availability and history around the student-facing statuses `upcoming`, `past_due`, and `turned_in`. Use real `exam_attempts` data for `/student/history`, keep the status derivation in shared/backend read models, remove archived leakage from `/student/exam`, and present both pages as date-grouped lists.

## 1-3-1 Rule Analysis

### 1 problem

Student exam state is inconsistent: `/student/exam` mixes internal statuses, `/student/history` uses mock data, and the student-visible labels do not reflect actual attempt and due-window behavior.

### 3 options

1. Persist new statuses directly in the database enum and write them during exam lifecycle changes.
2. Derive student-facing statuses from `exams` plus `exam_attempts` in shared/backend read models.
3. Keep backend responses as-is and translate everything only in the frontend.

### 1 recommendation

Use option 2. It keeps the persistence model stable while still giving the student UI the exact states it needs.

## To-Do Workflow

1. Extend shared exam and history contracts with `turned_in` and `past_due`, plus attempt-aware history payloads.
2. Add Prisma indexes for student attempt lookups and wire student attempt metadata into exam queries.
3. Add `/exams/history` and `/exams/history/:attemptId` for real student history data.
4. Refactor `/student/exam` to show only actionable upcoming work in a date-grouped list.
5. Refactor `/student/history` and its details page to use real API data, Teams-style tabs, and date grouping.
6. Validate the student flows and add focused regression coverage.

## Notes

- Student-facing statuses remain derived and are not stored as new DB enum values.
- `/student/history` uses `attemptId` when available and falls back to `examId` for non-submitted records.
- Internal statuses like `archived` and `completed` remain internal workflow concepts.
