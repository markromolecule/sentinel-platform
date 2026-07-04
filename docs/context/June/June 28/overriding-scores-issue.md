# Issue: Overriding Scores & UI Improvements

> Context for developers explaining the root cause of the score override failures, along with details for required UI adjustments.

---

## 1. Backend Investigation & Root Cause

### Error Details

- **Failing Route**: `POST /grading/attempts/:attemptId`
- **Error Status**: `400 (Bad Request)`
- **Error Message**: `Evaluation missing for essay question: <question-id>`
- **Failing File & Line**: [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts#L87-L105)

### Diagnosis

In the `updateGradingAttempt` service logic:

```typescript
    for (const question of questions) {
        if (question.type === 'ESSAY') {
            const evaluation = evaluations[question.id];

            if (!evaluation) {
                throw new HTTPException(400, {
                    message: `Evaluation missing for essay question: ${question.id}`,
                });
            }
```

1. **No Request Fallback**: The service iterates over all essay questions and expects their evaluations to be passed in the `evaluations` argument of the function. However, when the client only modifies an item override (e.g. through the override score dialog) and submits the draft overrides, it does not send the full evaluations for all essay questions in the payload if they haven't been completed yet.
2. **Eager Validation**: The backend throws a `400 Bad Request` regardless of whether `finalize` is `true` or `false`. If an instructor just wants to save score overrides (with `finalize = false`) before grading the essays, the backend blocks this.

### Proposed Fix

We should modify [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts#L87-L105) to check:

1. Fallback to existing database-persisted evaluations:
    ```typescript
    const evaluation = evaluations[question.id] ?? detail.attempt.evaluations[question.id];
    ```
2. Relax validation when saving drafts (`finalize` is false):
    ```typescript
    if (!evaluation) {
        if (finalize) {
            throw new HTTPException(400, {
                message: `Evaluation missing for essay question: ${question.id}`,
            });
        }
        continue;
    }
    ```
    This ensures instructors can override scores and save progress freely, and the validation only triggers when attempting to finalize the grading.

---

## 2. UI Adjustment Details

### Adjustment 1: Adjust Score Override Dialog

- **Target File**: [attempt-report-override-dialog.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/_components/attempt-report-override-dialog.tsx)
- **Changes**:
    1. **Include Student Answer**: The dialog should render the student's answer. Add a new read-only field/panel for it using `formatAnswerValue(selectedReport.answer)`.
    2. **Make the Dialog Larger**: Set the `<DialogContent>` width class to something larger like `sm:max-w-2xl` or `sm:max-w-3xl` to accommodate the two columns comfortably.
    3. **Break into Two Columns**: Wrap the content inside `<DialogContent>` in a grid layout (`grid grid-cols-1 md:grid-cols-2 gap-6`).
        - **Left Column**: Question Context
            - Question prompt: `selectedReport.question?.content.prompt ?? selectedReport.prompt`
            - Student's Answer: Display in a scrollable, styled text container (e.g., `bg-slate-50/50 border rounded-lg p-3 text-sm text-slate-800 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto`).
        - **Right Column**: Score Adjustment Fields
            - Override Score input
            - Override Reason textarea
    4. **Change the [Done] button color**: Update the button style. Change `variant="outline"` to `variant="default"`, or style it directly with a primary blue background: `className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"`.

### Adjustment 2: Trim / Truncate Student Answer in Summary Data-Table

- **Target File**: [attempt-report-table.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/_components/attempt-report-table.tsx#L75-L94)
- **Changes**:
    - The "Student Answer" column currently renders `formatAnswerValue(report.answer)` in full. Long essay answers stretch the table row dramatically.
    - **Truncation Logic**: Truncate the rendered answer text to a maximum of 100 characters.
        ```typescript
        const rawAnswerText = formatAnswerValue(report.answer);
        const displayedAnswer =
            rawAnswerText.length > 100
                ? `${rawAnswerText.substring(0, 100).trim()}...`
                : rawAnswerText;
        ```
    - Display the full response inside a `title` attribute or a tooltip for hover visibility:
        ```tsx
        <div
            className="text-sm break-words whitespace-pre-wrap text-slate-800"
            title={rawAnswerText}
        >
            {displayedAnswer}
        </div>
        ```

---

## 3. Verification Plan

### Automated Tests

- Run backend tests to ensure `updateGradingAttempt` no longer fails when evaluations are omitted:
    ```bash
    pnpm --dir app/sentinel-api test src/modules/examination/grading/services/grading-detail.test.ts
    ```
- Add a new test case inside `grading-detail.test.ts` to explicitly verify that `updateGradingAttempt` allows saving overrides when `finalize` is `false` and essay evaluations are missing.

### Manual Verification

1. Navigate to the Attempt Summary page of an exam containing essay questions.
2. Select a student attempt, open the score override dialog, and modify a score on any question.
3. Click "Done" (confirm layout improvements in the dialog).
4. Click "Save Overrides" and verify it succeeds with a toast notification.
5. Verify that student answers on the summary table are neatly truncated.
