# Implementation Plan - Student Score Overrides Fix and UI Adjustments

This document outlines the phased tasks for resolving the student score override failure (400 Bad Request due to missing essay evaluations) and implementing the required UI enhancements for the override dialog and student answer table.

## Summary of Task
Resolve the backend `400 Bad Request` block when overriding scores on attempts with ungraded essay questions, and update the frontend override dialog to display student answers in a larger 2-column layout, and truncate student answers in the attempt summary table.

---

## 1-3-1 Rule Options for Score Override Fix

### Option 1 (Recommended): Fallback and Conditional Validation on Finalize
Retrieve essay evaluations using a fallback to persisted database state: `evaluations[question.id] ?? detail.attempt.evaluations[question.id]`. If the evaluation is still missing:
- Throw a `400 Bad Request` only if `finalize = true`.
- Skip/continue if `finalize = false` (draft/saving override).
* **Tradeoff:** Safely allows saving overrides/drafts before essay grading is complete, while ensuring no exam is finalized with ungraded essay questions.

### Option 2: Frontend Eagerly Sends Full Current Evaluations Array
Modify the frontend page layout to always pass all current evaluations retrieved from the API when sending the score override POST request.
* **Tradeoff:** Avoids backend logic changes but increases API payload complexity and risks overriding state if the frontend is out of sync.

### Option 3: Separate Endpoint for Overrides
Expose a new `POST /grading/attempts/:attemptId/override` endpoint that only processes `itemOverrides` and ignores the essay evaluation loop completely.
* **Tradeoff:** Completely isolates the override feature but increases route and controller bloat in the grading module.

### Recommendation
We choose **Option 1** because it naturally handles the draft versus finalized states of an attempt and leverages the existing `updateGradingAttempt` structure without adding unnecessary API endpoints or coupling.

---

## Phased Implementation Plan

### Phase 1: Backend Score Override Logic & Unit Tests
**Goal:** Prevent backend validation from blocking score overrides when essay questions are not yet evaluated and the report is not being finalized.

- [x] Modify `updateGradingAttempt` in [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts) to fallback to `detail.attempt.evaluations[question.id]` and relax the missing evaluation error when `finalize === false`.
- [x] Add a unit test in [grading-detail.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts) that mocks an attempt with an essay question, verifies that updating overrides succeeds when `finalize: false`, and verifies it fails when `finalize: true` without evaluation.
- [x] Run backend tests using `pnpm --dir app/sentinel-api test src/modules/examination/grading/services/grading-detail.test.ts` to verify success.
**Migration required:** No — purely service-level validation changes.

---

### Phase 2: Frontend Score Override Dialog Enhancements
**Goal:** Enhance the override dialog layout to be larger, break into two columns, include the student answer, and highlight the Done button.

- [x] Update `AttemptReportOverrideDialog` in [attempt-report-override-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/_components/attempt-report-override-dialog.tsx):
  - Increase Dialog width to `sm:max-w-3xl`.
  - Split the body layout into a two-column grid (`grid grid-cols-1 md:grid-cols-2 gap-6`).
  - Render the student's answer in the left column inside a scrollable box using `formatAnswerValue(selectedReport.answer)`.
  - Place the input fields (Score & Reason) in the right column.
  - Update the "Done" button variant to `default` and apply the primary color theme (`bg-[#323d8f] text-white hover:bg-[#323d8f]/90`).
**Migration required:** No.

---

### Phase 3: Truncate Student Answer in Attempt Summary Table
**Goal:** Implement character truncation in the summary table to prevent long student answers from breaking the page layout.

- [x] Modify the "Student Answer" cell in [attempt-report-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/_components/attempt-report-table.tsx) to truncate `formatAnswerValue(report.answer)` to 100 characters and append `...`.
- [x] Add a `title={rawAnswerText}` tooltip wrapper so the full response is viewable on hover.
**Migration required:** No.

---

### Phase 4: Full End-to-End Verification
**Goal:** Run the full monorepo test suites and perform manual end-to-end user testing.

- [x] Run and pass all frontend and backend tests.
- [x] Verify score override flow with a student attempt containing ungraded essay questions.
**Migration required:** No.

---

## Rollback Plan
- Revert file changes using git checkouts on modified files.
- No DB rollback needed since no migrations are applied.
