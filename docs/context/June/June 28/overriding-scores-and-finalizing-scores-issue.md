# Overriding Scores & Finalizing Scores — Investigation & Expanded Issue

## Main Issue Summary

The instructor flow for saving score overrides and finalizing attempt reports has several
interconnected bugs that prevent grades from being persisted, displayed, and transitioned
correctly through the exam lifecycle.

---

## Issue 1 — Attempt Report Score Cards Not Updating After "Save Overrides"

### Symptom
After clicking **Save Overrides** on the attempt report page, the "Final Score" card
(`attempt.score / attempt.totalScore`) may not reflect the newly overridden scores.

### Root Cause — Score Reflected From DB `score` Column, Not Snapshot
The frontend `useAttemptReportQuery` fetches `AttemptGradingDetailType` from the API via
`GET /reporting/attempts/:attemptId`. This call reaches `getGradingAttemptDetail`, which
reads `ea.score` and `ea.total_score` **directly from the DB columns**.

After a `POST /grading/attempts/:attemptId` (Save Overrides), the backend does:
1. Re-compute score from `buildExamAttemptQuestionReports` with the merged overrides.
2. Write `score: roundedScore` to `exam_attempts.score` in the DB.
3. Write the full override map into `answer_snapshot._itemOverrides`.

So the DB `score` **is updated**, and after `queryClient.invalidateQueries` the card
_should_ refresh. The bug may stem from:
- **React Query cache invalidation timing**: `queryClient.invalidateQueries` is called
  but the page may re-render before the refetch is completed.
- **Score card reads stale `attempt.score`** before the new data arrives.
- **No optimistic update** is applied, so the card lags one refetch cycle.

### Data Flow Diagram
```
[Frontend Dialog] ──onConfirm──► buildOverridePayload()
    ──► onSubmit({ itemOverrides, finalize: false })
    ──► saveMutation.mutate(payload)
    ──► POST /grading/attempts/:attemptId  { itemOverrides, finalize: false }
    ──► updateGradingAttempt (backend service)
        ► merges itemOverrides into answer_snapshot._itemOverrides
        ► recalculates score via buildExamAttemptQuestionReports
        ► writes exam_attempts.score = roundedScore  ✓
    ──► onSuccess: invalidateQueries([attemptReport, examId])
    ──► re-fetch GET /reporting/attempts/:attemptId
    ──► getGradingAttemptDetail reads ea.score from DB  ✓ (now correct)
```

### Remaining Gap
The `buildExamAttemptQuestionReports` call in the **read path** (`getGradingAttemptDetail`)
uses the snapshot `_itemOverrides` to compute per-question `awardedScore`. But the "Final
Score" summary card uses `attempt.score` (the DB column), which is written on every save.
These should agree after a successful save + refetch, so the most likely culprit is UI
state not being reset after the dialog closes (the dialog keeps its local draft).

---

## Issue 2 — "Save & Finalize Report" Does Not Transition Finalization Status

### Symptom
After clicking **Save & Finalize Report**, the request returns HTTP 200, but navigating
back shows the attempt as **Draft** and scores appear as overridden values are not
retained.

### Root Cause (Previous)
The backend `updateGradingAttempt` was **not** writing `status`, `completed_at`, or
`total_score` back to the DB when `finalize: true`. For `IN_PROGRESS` attempts:
- `status` remained `IN_PROGRESS` in the DB.
- `completed_at` stayed `null`.
- `total_score` stayed `null`.
- The exam report list (`GET /reporting/exams/:examId`) reads `ea.status` to compute
  `isFinalized` via `answer_snapshot->'_grading'->>'finalizedAt'`.
  The grading metadata WAS being written into the snapshot, so `finalizedAt` in the
  snapshot was correct — but the **report query** only fetched the snapshot's
  `finalizedAt` value from the DB JSON column, which IS what drives `isFinalized`.
  So this alone was not the re-navigation bug.

### Actual Root Cause
The `attempt_finalized_at` column in the report list is derived from:
```sql
(latest_attempts.answer_snapshot->'_grading'->>'finalizedAt')::text
```
This IS being set on finalization. However, the report summary table's `score` and
`totalScore` columns come from `ea.score` and `ea.total_score` directly. For `IN_PROGRESS`
attempts, `ea.total_score` is `null` and the score card shows `N/A`.

**Fix already applied** (Phase 1 of execution): `updateGradingAttempt` now writes
`status = COMPLETED`, `completed_at`, and `total_score` when `finalize = true`, so the
report list will correctly display the finalized score after a refetch.

---

## Issue 3 — Overridden Scores Not Persisted Across Page Navigation

### Symptom
After clicking **Save Overrides** and navigating back then returning to the attempt page,
the overridden scores are shown correctly in the table BUT after a **finalize**, navigating
back shows original (un-overridden) scores.

### Root Cause — `_feedback` null Wipe
In `updateGradingAttempt`, the snapshot is rebuilt as:
```ts
const updatedSnapshot = {
    ...attempt.answers,         // student's raw answers
    _evaluations: updatedEvaluations,
    _itemOverrides: persistedOverrides,
    _grading: updatedGradingMetadata,
    _feedback: feedback ?? null,  // ← feedback comes from the request body
};
```
The problem: when calling **Save & Finalize**, the instructor page sends:
```ts
{
    evaluations: data?.attempt.evaluations ?? {},
    feedback: data?.attempt.feedback ?? null,  // ← reads from stale query data
    itemOverrides: payload.itemOverrides,
    finalize: true,
}
```
If `data?.attempt.feedback` is `null` but the user typed feedback and saved overrides
first (without finalize), that feedback is in the DB snapshot. The finalize call
correctly reads it from `data?.attempt.evaluations` (which comes from the latest
refetched data). But there is a window where **stale query data** can be sent.

### More Critical — `feedback` Not Persisted From "Save Overrides"
Looking at the instructor attempt report page:
```tsx
mutationFn: (payload) =>
    updateGradingAttempt(apiClient, attemptId, {
        evaluations: data?.attempt.evaluations ?? {},
        feedback: data?.attempt.feedback ?? null,
        itemOverrides: payload.itemOverrides,
        finalize: payload.finalize,
    }),
```
The `feedback` field is always sourced from the **cached query data** at the time the
mutation fires. If the user edits feedback in the UI (via a feedback text area, if one
exists), those local changes are NOT included. This means feedback can be silently
dropped.

---

## Issue 4 — `total_score` = null Prevents Pass/Fail Calculations

### Symptom
Student report page shows `N/A` for score, and `getPercentage` returns `null`.

### Root Cause
`getPercentage` in `reporting-response.shared.ts`:
```ts
if (score === null || totalScore === null || totalScore <= 0) {
    return null;  // ← returns null if total_score is null
}
```
When `exam_attempts.total_score` is `null` (e.g., for `IN_PROGRESS` attempts, or attempts
that pre-date the `total_score` column being reliably populated), percentage is `null`,
`needsRetake` returns `false` (because `percentage === null`), and pass/fail status is
indeterminate.

**Fix already applied**: `updateGradingAttempt` now populates `total_score` from the sum
of `exam_questions.points` when `finalize = true` and `total_score` is currently null.
**Remaining gap**: Non-finalized `COMPLETED` attempts may also have `null` total_score
if they were submitted before this fix. A **backfill migration** may be needed.

---

## Issue 5 — Bulk Finalization Excluded `IN_PROGRESS` Attempts

### Symptom
"Finalize All" in the exam report action queue did not finalize attempts that were still
`IN_PROGRESS` (e.g., students who were force-closed by proctor, timed out but not
formally submitted).

### Root Cause
`bulkFinalizeAttempts` had a strict status filter:
```ts
.where((eb) => eb.or([
    eb('status', '=', 'COMPLETED'),
    eb('completed_at', 'is not', null),
]))
```
This excluded `IN_PROGRESS` attempts entirely.

**Fix applied**: Removed the status filter. All attempts for the exam are now fetched and
filtered by `!grading.finalizedAt` in application code. `IN_PROGRESS` attempts are
transitioned to `COMPLETED` with `completed_at` and `total_score` populated.

---

## Crucial Database Considerations

### Score Separation — Initial vs. Overridden vs. Finalized
The current schema stores **one** score in `exam_attempts.score`. There is no dedicated
column for the "initial auto-graded score" vs. "instructor-overridden finalized score".
This is a problem for the exam lifecycle:

| Lifecycle Stage | Where It Lives |
|---|---|
| Initial auto-grade score | `ea.score` (written at submission) |
| Overridden/adjusted score | `ea.score` (overwritten on each save) + `_itemOverrides` in snapshot |
| Finalized score | `ea.score` (same column, no separate track) |

**Recommendation for later**: Add a dedicated `final_score` column (or `initial_score`)
to `exam_attempts` to preserve the pre-override baseline. The `_itemOverrides` snapshot
already tracks per-question override data (including `overriddenAt`, `overriddenBy`,
`reason`), which is good for audit trails.

### Snapshot Architecture
All grading metadata lives inside `answer_snapshot` as JSON:
```json
{
  "questionId1": "studentAnswer",
  "_grading":      { "finalizedAt": "...", "finalizedBy": "..." },
  "_evaluations":  { "essayQuestionId": { "score": 3, "scores": {...} } },
  "_itemOverrides":{ "questionId": { "awardedScore": 1, "reason": "...", "overriddenBy": "...", "overriddenAt": "..." } },
  "_feedback":     "overall feedback text"
}
```
This is correct but means every read of override data requires parsing the JSONB snapshot
rather than querying a dedicated table.

---

## Exam Lifecycle Implications

For **re-attempt** and **pass/fail** status to work correctly, the following must be
reliable before that feature lands:

1. `ea.total_score` must always be non-null for submitted/finalized attempts.
2. `ea.score` must reflect the true final (post-override) score, not just the initial
   auto-grade score.
3. `ea.status` must be `COMPLETED` for any graded/finalized attempt regardless of how
   the attempt ended (`force_close`, `time_out`, `IN_PROGRESS` proctor termination, etc.).
4. The `_grading.finalizedAt` timestamp in the snapshot is what drives the `isFinalized`
   flag in the report list. This must be set atomically with the score update.

---

## Pending / Open Items

- [ ] **Backfill**: Populate `total_score` for existing `COMPLETED` attempts where it is
  currently `null` using `SUM(eq.points)` per `exam_id`.
- [ ] **UI Feedback Loop**: After "Save Overrides", the per-question score badges in the
  `AttemptReportTable` should immediately reflect the new `awardedScore` from the
  `overrideDrafts` state (this is already partially done in `useAttemptReport` via
  `overrideDrafts` state), but the "Final Score" card reads from `attempt.score` which
  only updates after the refetch. Consider adding an optimistic update.
- [ ] **Finalization Lock**: Once finalized, the "Save Overrides" and "Save & Finalize"
  buttons should be hidden/disabled. The `AttemptReportActions` component does not
  currently check `attempt.grading.finalizedAt`.
- [ ] **Feedback State Management**: The `feedback` field sent in override/finalize
  requests is always sourced from stale query cache. If the UI has a live feedback
  textarea, local state management is needed.
- [ ] **Separate initial score tracking**: For the re-attempt lifecycle, record the
  pre-override `initial_score` at submission time to enable proper audit and rollback.