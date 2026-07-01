# fix-002 — Implementation Plan: Score Override Revert, Finalize Status, & Attempt Summary Bugs

**Task summary:** Fix three interconnected bugs in the instructor grading flow:
(1) overridden scores revert to 0 after clicking Save Overrides,
(2) Save & Finalize does not transition the attempt from DRAFT → FINALIZED in the UI,
(3) the Attempt Summary page does not reflect the finalized/overridden score after grading.

---

## Pre-Planning Checklist

- [x] Read and summarized the issue in one sentence (above).
- [x] Scanned source files: `update-grading-attempt.ts`, `get-grading-attempt-detail.ts`,
  `use-attempt-report/index.ts`, `attempt-report-view.tsx`, `attempt-report-summary-cards.tsx`,
  `attempt-report-actions.tsx`, `page.tsx` (instructor attempt report page),
  `query-builders.ts`, `data-loader.ts`, `reporting-response.shared.ts`,
  `student-reporting.helpers.ts`, `use-exam-report-query.ts`, `use-attempt-report-query.ts`,
  `exam-constants.ts`.
- [x] Identified all files, services, and DB tables to touch (see each phase).
- [x] Migration required: **No** — all fixes are in application logic and query invalidation.

---

## Root-Cause Analysis

### Bug 1 — Score Reverts to 0 After Save Overrides

**Two-part root cause:**

1. **`overrideDrafts` state resets while refetch is in-flight.**
   In `use-attempt-report/index.ts`, a `useEffect` fires whenever `attempt.itemOverrides`
   changes. When `saveMutation.mutate()` runs, the query cache is invalidated and a
   background refetch begins. During that refetch window, React may re-render with the
   *old* cached `attempt.itemOverrides` (before the server returns the new data), causing
   the `useEffect` to reset `overrideDrafts` to the stale/old values — making the
   per-question score badges flash back to the pre-save state.

2. **`total_score` is null for IN_PROGRESS attempts after Save Overrides.**
   The backend only writes `total_score` when `finalize: true`. For attempts that were
   still `IN_PROGRESS`, `ea.total_score = null` in the DB. After Save Overrides
   (`finalize: false`), `total_score` remains null. `getPercentage()` returns null
   (see `reporting-response.shared.ts` line 44: `if (totalScore === null) return null`),
   so the ScoreCard renders `N/A / N/A`, which looks like the score reverted.

### Bug 2 — Save & Finalize Does Not Show FINALIZED Status

**Root cause:** The backend correctly writes `status = 'COMPLETED'`, `completed_at`, and
`_grading.finalizedAt` to the snapshot on finalize. However, `router.push()` fires after
`await Promise.all([invalidateQueries...])`. `invalidateQueries` marks the cache as stale
but does **not** wait for the refetch to complete. When the user arrives at the Attempt
Summary page, the React Query cache still holds pre-finalization data — the `attempt` query
returns the old snapshot with `finalizedAt: null`, so the badge still says DRAFT.

Additionally, for `IN_PROGRESS` attempts, `total_score` is only written on `finalize: true`
(confirmed in code), but if the attempt was `COMPLETED` before grading, `total_score` may
already be set. The safe fix is to always populate `total_score` when missing.

### Bug 3 — Attempt Summary Score Shows 0 / N/A After Grading

**Root cause:** `buildLatestAttemptsQuery` selects `ea.score` and `ea.total_score` directly.
For any attempt where `total_score` is null, `mapStudentSummary` → `getPercentage` returns
null → `ExamReportStudentSummary.score / totalScore` renders as `N/A / N/A` in the table
column defined in `columns.tsx`. This is not a query-key invalidation problem (prefix
matching works correctly); it is purely a data problem caused by `total_score` being null.

---

## Proposed Changes

### Phase 1: Backend — Always Persist `total_score` on Every Grading Save

**Goal:** Ensure `ea.total_score` is populated on every `POST /grading/attempts/:attemptId`
call (both save-overrides and finalize), so Score column in Attempt Summary never shows N/A
after the first instructor touch.

- [ ] Modify `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts`:
  - Move the `total_score` write **outside** the `if (finalize)` block so it fires on
    every save whenever `total_score` is currently null:
    ```ts
    // Always backfill total_score on first grading save (write-once semantics).
    if (attempt.totalScore === null || attempt.totalScore === undefined) {
        updatePayload.total_score = totalAttemptPoints;
    }
    ```
  - `status` and `completed_at` transitions remain gated on `finalize: true`.
  - Add JSDoc comment on the write-once intent.
- [ ] Write/extend tests at `app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts`:
  - Add test: `"writes total_score on first save-overrides call when total_score is null"`.
  - Add test: `"does NOT overwrite total_score when it is already set"`.
  - Verify the existing finalize test still passes.

**Migration required:** No.

---

### Phase 2: Backend — Finalize Guard Tests (Verification Phase)

**Goal:** Confirm `status = COMPLETED`, `completed_at`, and `_grading.finalizedAt` are
atomically written on finalize for ALL attempt states (including IN_PROGRESS).

- [ ] Review `update-grading-attempt.ts` lines 186-194 to confirm the `if (finalize)` block
  unconditionally sets `status = 'COMPLETED'` regardless of current attempt status.
  Current code: `updatePayload.status = 'COMPLETED'` — this is correct as written.
- [ ] Add tests at `app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts`:
  - Add test: `"finalizes an IN_PROGRESS attempt → status=COMPLETED, completed_at set"`.
  - Add test: `"finalizes a COMPLETED attempt → finalizedAt written to _grading snapshot"`.
  - Add test: `"getGradingAttemptDetail returns correct finalizedAt from snapshot after finalize"`.

**Migration required:** No.

---

### Phase 3: Frontend — Suppress Override Draft Reset While Saving

**Goal:** Prevent `overrideDrafts` state from resetting to stale server values while a
save mutation is in-flight, eliminating the per-question score flash.

- [ ] Modify `app/sentinel-web/src/features/exams/reports/_hooks/use-attempt-report/_types.ts`:
  - Add `isSaving?: boolean` to `UseAttemptReportProps`.
- [ ] Modify `app/sentinel-web/src/features/exams/reports/_hooks/use-attempt-report/index.ts`:
  - Accept `isSaving` prop. Guard the `useEffect` reset:
    ```ts
    useEffect(() => {
        // Do not reset drafts while a save is in-flight (prevents stale flash).
        if (!isSaving) {
            setOverrideDrafts(normalizeOverrideDrafts(attempt.itemOverrides));
        }
    }, [attempt.itemOverrides, isSaving]);
    ```
- [ ] Modify `app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx`:
  - Add `isSaving?: boolean` to `AttemptReportViewProps`.
  - Thread it through to `useAttemptReport({ attempt, questions, onSubmit, isSaving })`.
- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx`:
  - Pass `isSaving={saveMutation.isPending}` to `<AttemptReportView>`.
- [ ] Write tests at `app/sentinel-web/src/features/exams/reports/attempt-report-view.test.tsx`:
  - Add test: `"does not reset override drafts while isSaving=true"`.
  - Add test: `"resets override drafts from server data when isSaving transitions to false"`.

**Migration required:** No.

---

### Phase 4: Frontend — Await Cache Refetch Before Navigating on Finalize

**Goal:** Ensure the Attempt Summary query cache is populated with finalized data before
`router.push()` fires, so the page does not render stale DRAFT state on arrival.

- [ ] Modify `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx`:
  - Change the `onSuccess` handler to await `refetchQueries` in addition to `invalidateQueries`:
    ```ts
    onSuccess: async (_, payload) => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: EXAM_QUERY_KEYS.attemptReport(attemptId),
            }),
            queryClient.invalidateQueries({
                queryKey: EXAM_QUERY_KEYS.report(examId),
            }),
        ]);

        if (payload.finalize) {
            // Ensure the summary page loads fresh data immediately on arrival.
            await queryClient.refetchQueries({
                queryKey: EXAM_QUERY_KEYS.report(examId),
            });
        }

        toast.success(
            payload.finalize
                ? 'Report finalized successfully.'
                : 'Override changes saved successfully.',
        );

        if (payload.finalize) {
            router.push(`/exams/${examId}/report?section=attempts`);
        }
    },
    ```
- [ ] Write tests (mock-based) at the page level:
  - Add test: `"awaits refetchQueries for the report before navigating on finalize"`.
  - Add test: `"does not call refetchQueries on save-overrides (finalize=false)"`.

**Migration required:** No.

---

### Phase 5: Frontend — Verify Attempt Summary Score Column (No Code Change Needed)

**Goal:** Confirm the Score column in the Attempt Summary DataTable will correctly
display overridden scores once Phase 1 ensures `total_score` is populated.

- [ ] Review `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/_components/columns.tsx`:
  - Score cell renders `{student.score ?? 'N/A'} / {student.totalScore ?? 'N/A'}`.
  - After Phase 1, `total_score` is always set → `N/A` is eliminated. **No code change.**
- [ ] Review `app/sentinel-api/src/modules/examination/reporting/helpers/student-reporting.helpers.ts`:
  - `mapStudentSummary` maps `totalScore: row.total_score ?? null`.
  - After Phase 1, `row.total_score` is non-null for all graded attempts.
- [ ] Write / extend tests at `app/sentinel-api/src/modules/examination/reporting/helpers/student-reporting.helpers.ts` (or a co-located test file):
  - Add test: `"mapStudentSummary returns non-null percentage when total_score is set"`.
  - Add test: `"mapStudentSummary correctly reflects isFinalized when finalizedAt is present in snapshot"`.

**Migration required:** No.

---

## Done Criteria

- [ ] All checkboxes across all 5 phases are resolved.
- [ ] `total_score` is written on every grading save (Save Overrides AND Save & Finalize).
- [ ] `status = COMPLETED`, `completed_at`, `_grading.finalizedAt` are atomically written on finalize.
- [ ] `overrideDrafts` state does not reset while `saveMutation.isPending = true`.
- [ ] `router.push()` on finalize fires only after `refetchQueries` on the report cache completes.
- [ ] Attempt Summary table shows correct overridden score and FINALIZED status after grading.
- [ ] All Vitest tests pass with no skipped or failing cases.
- [ ] No new `.env` variables required.
- [ ] No Prisma migration needed.

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Should Save Overrides also transition IN_PROGRESS → COMPLETED?**
> Currently only `finalize: true` flips the status. Recommend: keep the current behavior
> (only finalize changes status) but confirm with the product owner.

> [!IMPORTANT]
> **Q2 — Phase 4 `refetchQueries` may add 200-500ms delay before navigation.**
> An alternative is to navigate immediately and let the Attempt Summary page fetch its own
> fresh data on mount. If the loading state on the Summary page is acceptable UX, we can
> skip `refetchQueries` and rely on `invalidateQueries` + the Summary page's normal load.

> [!NOTE]
> **Q3 — Relationship to fix-001 plan.** The existing `fix-001` plan covers optimistic
> score display, finalization lock on buttons, and stale feedback wipe. This `fix-002` plan
> addresses the three user-reported bugs that are distinct from those items. Both plans
> can be executed independently or merged into a single execution pass.
