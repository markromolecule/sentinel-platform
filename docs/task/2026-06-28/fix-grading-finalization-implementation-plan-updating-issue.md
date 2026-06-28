# Implementation Plan: Fix Grading Finalization Status & Score Updates

This plan resolves the issue where attempts in the `IN_PROGRESS` state (such as proctor-flagged or abandoned student attempts) are not correctly marked as finalized, remain in the "Draft" status, and show incorrect total scores (`N/A`) after save & finalize or bulk finalization.

## Proposed Changes

### [Backend API]

#### [MODIFY] [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts)
- Update the database update query payload to transition attempt status to `COMPLETED` when `finalize` is true.
- Populate `completed_at` (if null) and `total_score` (if null) based on the sum of points of all exam questions.

#### [MODIFY] [bulk-finalize-attempts.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/bulk-finalize-attempts.ts)
- Remove the status filters that restrict finalization to `COMPLETED` attempts only.
- In the iteration loop, transition non-finalized attempts (including `IN_PROGRESS` ones) to `COMPLETED`, setting `completed_at` and `total_score` if they are null.

#### [MODIFY] [grading-detail.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts)
- Add/update unit test cases verifying that the `status`, `completed_at`, and `total_score` fields are successfully updated on individual attempt finalization.

#### [MODIFY] [bulk-finalize-attempts.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/bulk-finalize-attempts.test.ts)
- Add/update unit test cases verifying that bulk finalization correctly transitions and finalizes `IN_PROGRESS` attempts.

---

## Verification Plan

### Automated Tests
- Run grading service unit tests:
  ```bash
  pnpm --dir app/sentinel-api test src/modules/examination/grading/services/grading-detail.test.ts
  pnpm --dir app/sentinel-api test src/modules/examination/grading/services/bulk-finalize-attempts.test.ts
  ```

### Manual Verification
1. Log in as an instructor.
2. Select an exam attempt that is currently `IN_PROGRESS` or has a score of `0 / N/A` (such as Mark Joseph Livado's attempt).
3. Click "Save & Finalize Report" inside the attempt report page.
4. Verify that the score updates from `0 / N/A` to the actual score (e.g., `0 / 10` or `1 / 10`) and the finalization status changes to "Finalized" in the summary table and cards.
