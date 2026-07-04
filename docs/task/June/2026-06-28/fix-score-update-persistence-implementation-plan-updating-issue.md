# Implementation Plan: Fix Score Override Persistence & Finalization

This plan resolves the issue where manual score overrides are not persisted correctly (getting deleted/overwritten when submitting essay grades) and provides a clear mechanism to finalize grading from the grading workspace.

## Proposed Changes

### [Backend API]

#### [MODIFY] [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts)

- Update the override mapping to merge incoming `itemOverrides` with `detail.attempt.itemOverrides`.
- Handle the case where `itemOverrides` is undefined or partially supplied.

#### [MODIFY] [grading-detail.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts)

- Add a unit test verifying that existing database overrides are preserved when the update payload omits `itemOverrides`.

---

### [Frontend Web Client]

#### [MODIFY] [use-grading-attempt/index.ts](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.ts>)

- Update `handleSubmit` to accept a `finalize: boolean` parameter.
- Pass `finalize` in the mutation payload body to the backend.

#### [MODIFY] [grading-header.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/grading-header.tsx>)

- Render two primary actions: "Save Draft" (`onSubmit(false)`) and "Submit & Finalize" (`onSubmit(true)`).

#### [MODIFY] [_components/grading-header.tsx (types)](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_components/_types/index.ts>) or related types

- Update component prop types to allow `onSubmit` to pass a `finalize` boolean argument.

---

## Verification Plan

### Automated Tests

- Run the grading detail service test suite:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/examination/grading/services/grading-detail.test.ts
    ```

### Manual Verification

1. Log in as an instructor (`cianessevielle@gmail.com` / `@Livado02`).
2. Go to the attempt report page and set a manual score override for an objective question. Save overrides (keeps as draft).
3. Open the grading workspace for that attempt and submit essay scores.
4. Verify that the manual score override is still preserved.
5. Click "Submit & Finalize" in the grading workspace and verify the attempt status updates to "Finalized".
