# fix-001 — Implementation Plan: Score Override & Finalization Fixes

**Task summary:** Fix all remaining bugs in the instructor score-override and finalize-report
flow so that overridden scores are reflected immediately in the UI, finalized attempts are
locked and visually indicated, stale feedback data cannot be wiped, `total_score` is reliably
populated for all submitted attempts, and an `initial_score` baseline is persisted for the
upcoming re-attempt / pass-fail lifecycle.

---

## Pre-Planning Checklist

- [x] Read and summarized the issue document in one sentence (above).
- [x] Scanned source files: `update-grading-attempt.ts`, `attempt-report-view.tsx`,
  `use-attempt-report/index.ts`, `attempt-report-actions.tsx`, `attempt-report-summary-cards.tsx`,
  `attempt-report-table.tsx`, `attempt-report-utils.ts`, `page.tsx` (instructor attempt report),
  `grading-schema.ts`, `reporting-response.shared.ts`.
- [x] Identified all files and DB tables touched (see each phase).
- [x] Prisma migration required: **Yes** — add `initial_score` column to `exam_attempts` (Phase 5).

---

## Options (1-3-1 Rule)

### Option A — Targeted Bug Fixes Only (Simple / Fast)
Fix each of the five open items as small, independent patches with no schema changes.
- **Tradeoff:** Fast to ship; `initial_score` baseline and re-attempt lifecycle remain
  unsupported — tech debt accumulates.

### Option B — Full Fix + Schema Extension (Robust / Scalable) ✅ Chosen
Fix all UI and backend bugs AND add the `initial_score` column via a Prisma migration so
the exam lifecycle has a stable foundation.
- **Tradeoff:** Requires one migration and a backfill script; adds a week of work but
  unblocks re-attempt / pass-fail features permanently.

### Option C — Snapshot-First Architecture (Creative)
Move all grading metadata out of `answer_snapshot` JSONB into dedicated relational tables
(`exam_attempt_overrides`, `exam_attempt_grading`).
- **Tradeoff:** Cleanest long-term design, but requires a large migration and rewrites of
  all reporting queries — not feasible in a single sprint.

**Chosen: Option B.** It delivers all five bug fixes, adds the `initial_score` column (which
is a single nullable column migration — low risk), and leaves the snapshot architecture intact
so no reporting queries need rewriting.

---

## Phase 1: UI — Optimistic Score Update After "Save Overrides"

**Goal:** Make the "Final Score" summary card reflect the newly overridden score immediately
after clicking Save Overrides, without waiting for the full refetch cycle.

- [ ] In `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx`:
  - Add `onMutate` to `saveMutation` that computes a local `optimisticScore` from
    `buildOverridePayload(overrideDrafts)` and stores it in React state.
  - Pass `optimisticScore` down to `AttemptReportView` so the "Final Score" card can
    display it while the refetch is in-flight.
  - Reset `optimisticScore` to `null` in `onSettled` (success or error).
- [ ] In `app/sentinel-web/src/features/exams/reports/_components/attempt-report-summary-cards.tsx`:
  - Accept an optional `optimisticScore?: number | null` prop in `AttemptReportSummaryCards`.
  - In `ScoreCard`, display `optimisticScore ?? attempt.score` as the displayed value.
- [ ] In `app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx`:
  - Thread the `optimisticScore` prop down from the page into `AttemptReportSummaryCards`.
- [ ] Write tests at `app/sentinel-web/src/features/exams/reports/_components/attempt-report-summary-cards.test.tsx`:
  - Test that `ScoreCard` renders `optimisticScore` when provided.
  - Test that it falls back to `attempt.score` when `optimisticScore` is null.

**Migration required:** No.

---

## Phase 2: UI — Finalization Lock on Action Buttons

**Goal:** Hide / disable "Save Overrides" and "Save & Finalize Report" once an attempt is
already finalized, preventing accidental double-finalization.

- [ ] In `app/sentinel-web/src/features/exams/reports/_components/attempt-report-actions.tsx`:
  - Add `isFinalized: boolean` to `AttemptReportActionsProps`.
  - When `isFinalized` is `true`, render a read-only `Badge` ("Report Finalized") instead
    of the action buttons.
- [ ] In `app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx`:
  - Derive `isFinalized = !!attempt.grading.finalizedAt` and pass it to `AttemptReportActions`.
- [ ] Write tests at `app/sentinel-web/src/features/exams/reports/_components/attempt-report-actions.test.tsx`:
  - Test that buttons are rendered when `isFinalized = false`.
  - Test that the "Report Finalized" badge renders and no buttons appear when `isFinalized = true`.

**Migration required:** No.

---

## Phase 3: Backend — Fix Stale Feedback Wipe on Finalize

**Goal:** Ensure that the `_feedback` value already stored in the snapshot is never silently
wiped when the instructor calls Save Overrides or Save & Finalize without explicitly providing
a new feedback value.

- [ ] In `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts`:
  - Change the `_feedback` entry in `updatedSnapshot` to:
    ```ts
    _feedback: feedback !== undefined ? feedback : (attempt.grading._feedback ?? null),
    ```
    so that if `feedback` is `undefined` in the request body, the existing snapshot value
    is preserved rather than overwritten with `null`.
  - Add JSDoc explaining the fallback logic.
- [ ] In `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx`:
  - Change `feedback: data?.attempt.feedback ?? null` to `feedback: data?.attempt.feedback`
    (pass `undefined` rather than `null` when no feedback is present, so the backend keeps
    the existing value).
- [ ] Write / update tests at `app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts`:
  - Add test: "preserves existing feedback when feedback field is undefined in request".
  - Add test: "overwrites feedback with null when feedback is explicitly null".

**Migration required:** No.

---

## Phase 4: Backend — Backfill `total_score` for Existing COMPLETED Attempts

**Goal:** Ensure that all pre-existing `COMPLETED` attempts with `total_score = null` get
their `total_score` populated so percentage and pass/fail calculations work correctly.

- [ ] Create backfill script at `app/sentinel-api/src/scripts/backfill-total-score.ts`:
  - Query all `exam_attempts` where `status = 'COMPLETED'` AND `total_score IS NULL`.
  - For each distinct `exam_id`, fetch `SUM(points)` from `exam_questions`.
  - `UPDATE exam_attempts SET total_score = <sum> WHERE exam_id = <id> AND total_score IS NULL`.
  - Log count of rows updated.
- [ ] Write tests at `app/sentinel-api/src/scripts/backfill-total-score.test.ts`:
  - Mock DB client and verify correct update logic per exam.
- [ ] Document the backfill run command in the plan execution log:
  ```bash
  pnpm --dir app/sentinel-api exec tsx -r dotenv/config src/scripts/backfill-total-score.ts
  ```

**Migration required:** No — this is a data backfill, not a schema change.

---

## Phase 5: Database — Add `initial_score` Column to `exam_attempts`

**Goal:** Persist the auto-graded score captured at submission time so re-attempt / pass-fail
logic can compare the initial result against any instructor-applied overrides.

- [ ] In `packages/db/prisma/schema.prisma`:
  - Add field `initial_score Int?` to the `ExamAttempts` model.
  - Add JSDoc: `/// Auto-graded score at time of submission, before any instructor overrides.`
- [ ] Run migration:
  ```bash
  pnpm db:migrate dev --name add-initial-score-to-exam-attempts
  ```
  - **Rollback note:** `ALTER TABLE exam_attempts DROP COLUMN initial_score;`
- [ ] In `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts`:
  - On the **first** save of overrides (i.e., when `attempt.initialScore === null`), write
    `initial_score = attempt.score` (capturing the pre-override baseline).
  - Do NOT update `initial_score` on subsequent saves — it is write-once.
- [ ] In `app/sentinel-api/src/modules/examination/grading/services/get-grading-attempt-detail.ts`:
  - Add `ea.initial_score as initialScore` to the SELECT clause.
  - Include `initialScore` in the returned `attempt` object.
- [ ] In `packages/shared/src/schema/exams/grading-schema.ts`:
  - Add `initialScore: z.number().nullable()` to `attemptGradingDetailSchema`.
- [ ] Write tests at `app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts`:
  - Add test: "writes initial_score on first override save when initial_score is null".
  - Add test: "does NOT overwrite initial_score on subsequent saves".

**Migration required:** Yes — adds nullable `initial_score Int?` column to `exam_attempts`.
**Breaking changes:** No — nullable column; existing rows default to `null`.
**Rollback:** `ALTER TABLE exam_attempts DROP COLUMN initial_score;`

---

## Done Criteria

- [ ] Every phase's tasks reference concrete files and function names.
- [ ] Each phase has at least one test task.
- [ ] Migration decision is explicit per phase.
- [ ] No vague tasks — each bullet specifies the exact code change.
- [ ] `initial_score` migration includes a rollback command.
- [ ] `.env.example` — no new environment variables required.
