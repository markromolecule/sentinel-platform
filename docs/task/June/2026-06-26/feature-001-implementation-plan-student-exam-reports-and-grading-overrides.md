# Feature 001 Implementation Plan: Student Exam Reports and Grading Overrides

**Status:** In Progress  
**Date:** 2026-06-26  
**Type:** feature  
**Scope:** `sentinel-api`, `sentinel-web`, `packages/shared`, `packages/services`

## Pre-Planning

- **Task Summary:** Build instructor and student exam report views that show question-by-question responses, correct answers, essay rubric breakdowns, and system grading, while also allowing instructors to override scoring per attempt and exposing the finalized report to students after grading.
- **Source Files Scanned:**
    - `docs/context/June/June 26/report-instructor-student.md`
    - `.agents/rules/implementation-plan.md`
    - `.agents/rules/global/1-3-1-rule.md`
    - `.agents/workflows/to-do-workflow.md`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx`
    - `app/sentinel-web/src/features/exams/grading/*`
    - `app/sentinel-web/src/app/(protected)/student/history/[attemptId]/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-api/src/modules/examination/grading/controllers/get-grading-attempt-detail.ts`
    - `app/sentinel-api/src/modules/examination/grading/controllers/update-grading-attempt.ts`
    - `app/sentinel-api/src/modules/examination/grading/routes.ts`
    - `app/sentinel-api/src/modules/examination/reports/controllers/get-exam-report.ts`
    - `app/sentinel-api/src/modules/examination/reports/routes.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-instructor-exam-visibility-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-student-exam-scope-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
    - `packages/shared/src/exams/score-exam-attempt.ts`
    - `packages/services/src/api/exams/*`
    - `packages/db/prisma/schema.prisma`
- **Files, Services, And DB Tables Touched:**
    - `app/sentinel-api/src/modules/examination/grading/controllers/get-grading-attempt-detail.ts`
    - `app/sentinel-api/src/modules/examination/grading/controllers/update-grading-attempt.ts`
    - `app/sentinel-api/src/modules/examination/grading/routes.ts`
    - `app/sentinel-api/src/modules/examination/reports/controllers/get-exam-report.ts`
    - `app/sentinel-api/src/modules/examination/reports/routes.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/build-instructor-exam-visibility-predicates.ts`
    - `app/sentinel-api/src/modules/examination/exams/data/get-exam-by-id.ts`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx`
    - `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/history/[attemptId]/page.tsx`
    - `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts`
    - `app/sentinel-web/src/features/exams/reports/`
    - `packages/shared/src/exams/score-exam-attempt.ts`
    - `packages/services/src/api/exams/mappers.ts`
    - `packages/services/src/api/exams/types.ts`
    - DB tables: `exam_attempts`, `exam_questions`, `essay_rubrics`, `exams`, `students`
- **Prisma Migration Needed:** No new migration is planned. The plan stores per-attempt override metadata inside `exam_attempts.answer_snapshot` alongside existing grading metadata, so the current schema should be enough.

## 1-3-1 Options

### Option 1: Extend the Existing Grading Screens

Add report detail panes and override controls directly into the current grading pages so the instructor workflow and report workflow stay in one place.

- **Tradeoff:** Lowest initial surface area, but it blurs grading and reporting, makes the UI harder to scan, and still leaves the student report path to be built separately.

### Option 2: Shared Attempt Report Contract And Components

Create one attempt-report contract in the API and one shared report component set in the web app, then reuse them for instructor and student views.

- **Tradeoff:** Slightly broader implementation, but it gives us one source of truth for grading output, override state, correct-answer display, and responsive presentation.

### Option 3: New Normalized Report Tables And Module

Introduce dedicated report/override tables and a separate report module so grading, overrides, and final reports are fully normalized.

- **Tradeoff:** Clean at the database layer, but it is larger than the problem needs and would force a migration that adds operational risk without clear benefit.

## Best Option

Choose **Option 2**.

It matches the current codebase best because the key data already exists in grading payloads and exam attempt snapshots, and the main work is turning that into a clearer, role-aware report experience. A shared contract also makes it much easier to keep instructor and student screens aligned while still supporting per-attempt overrides.

**Concrete next steps:**

1. Expand the grading payload so one attempt report can power both instructor and student views.
2. Persist per-attempt override metadata in the attempt snapshot and make finalization explicit.
3. Gate student report access until grading is finalized, while keeping objective-only attempts readable as soon as they complete.
4. Build a shared, Google Forms-style report layout that supports question-by-question responses, correct answers, rubric scoring, and override editing.
5. Add instructor navigation and report list/detail routes so the report experience is reachable from the exam area.
6. Add focused API and UI tests for access control, override persistence, and report rendering.

## Phase 1: Expand The Attempt Report Contract

**Goal:** Expose everything the report screens need from the API in one shape, including question answers, correct answers, rubric breakdowns, and current grading state.

- [x] Update `app/sentinel-api/src/modules/examination/grading/controllers/get-grading-attempt-detail.ts` so the response includes detailed per-question grading output for objective and essay questions, not just the current summary fields.
- [x] Review `packages/shared/src/exams/score-exam-attempt.ts` and add or export a reusable detailed scoring helper if the current summary scorer does not expose enough item-level data for reports.
- [x] Update `packages/services/src/api/exams/mappers.ts` and `packages/services/src/api/exams/types.ts` so client consumers can rely on a stable report DTO rather than reconstructing report data from grading fragments.
- [x] Keep the instructor and student report contract aligned with existing attempt data so the new screens do not need separate data-fetching logic.
- [x] Add or update tests for grading-detail shape and scoring helper output, especially for mixed objective and essay attempts.

**Migration required:** No - this phase changes response shape and shared helpers only.
**Migration applied:** No - contract and mapper updates only.
**Breaking changes:** Potentially yes for internal consumers, so the API contract must be updated deliberately and verified together with the web client.

<!-- NOTE: The live grading module uses `app/sentinel-api/src/modules/examination/grading/services/get-grading-attempt-detail.ts` plus `grading.dto.ts` instead of the older controller filename referenced in the original plan, so Phase 1 was implemented on the current service stack. -->
<!-- NOTE: Added `buildExamAttemptQuestionReports()` in `packages/shared/src/exams/score-exam-attempt.ts` and widened `Schema.attemptGradingDetailSchema` so attempt detail now includes `questionReports` with submitted answers, resolved correct answers, awarded scores, and essay evaluation metadata. -->
<!-- NOTE: Phase 1 validation passed with `pnpm --dir packages/shared exec vitest run src/exams/score-exam-attempt.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/grading/services/grading-detail.test.ts --reporter=verbose`, and `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.test.tsx' --reporter=verbose`. -->

## Phase 2: Persist Per-Attempt Overrides And Finalization State

**Goal:** Store instructor override decisions in the attempt snapshot so the report can show the final grading state consistently.

- [x] Update `app/sentinel-api/src/modules/examination/grading/controllers/update-grading-attempt.ts` to accept optional per-item override input and persist the chosen override values, reasons, and instructor metadata.
- [x] Store override metadata in `exam_attempts.answer_snapshot` under a dedicated grading block, including `_itemOverrides`, `_grading.finalizedAt`, and `_grading.finalizedBy`.
- [x] Keep the existing automatic objective scoring and essay rubric scoring path intact, but let the override layer win when an instructor explicitly changes a scored item.
- [x] Expose a finalization step in the grading update flow so the system can distinguish between in-progress grading and a finalized report.
- [x] Add or update tests covering override persistence, finalized state updates, and the interaction between automated scoring and manual override values.

**Migration required:** No - the data lives in the existing JSON snapshot field.
**Migration applied:** No - snapshot enrichment only.
**Breaking changes:** No.
<!-- NOTE: The live implementation path is `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts` plus `update-grading-attempt.controller.ts`, not the older filename referenced in the plan. -->
<!-- NOTE: Phase 2 adds optional `itemOverrides` and `finalize` to `Schema.updateGradingAttemptBodySchema`, persists `_itemOverrides` and `_grading` in `exam_attempts.answer_snapshot`, and exposes `attempt.itemOverrides` plus `attempt.grading` on grading detail responses. -->
<!-- NOTE: `questionReports` now reflects override-winning awarded scores so later report screens can render the final graded state without re-deriving override logic on the client. -->
<!-- NOTE: Phase 2 validation passed with `pnpm --dir packages/shared exec vitest run src/exams/score-exam-attempt.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/grading/services/grading-detail.test.ts --reporter=verbose`, and `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.test.tsx' --reporter=verbose`. -->

## Phase 3: Enforce Role-Aware Access And Release Rules

**Goal:** Make sure only the assigned instructor can see or update the instructor report path, and only finalized grading is visible to students except for objective-only attempts that are already complete.

- [x] Tighten `app/sentinel-api/src/modules/examination/exams/data/build-instructor-exam-visibility-predicates.ts` and related grading/report controllers so the assigned instructor is the only one allowed to view or edit the report for an exam.
- [x] Add a student-facing report endpoint, likely under `app/sentinel-api/src/modules/examination/reports/routes.ts`, that returns the final report once grading is complete.
- [x] Update student history access in `app/sentinel-web/src/app/(protected)/student/history/[attemptId]/page.tsx` and `app/sentinel-web/src/app/(protected)/student/history/_hooks/use-student-history/index.ts` so students see the finalized report state rather than only a summary.
- [x] Make the report endpoint return a clear in-progress state, such as `409`, when an essay attempt has not been finalized yet.
- [x] Ensure correct answers become visible on the finalized report regardless of runtime `show_correct_answers` settings, because the task explicitly calls for post-grading report visibility.
- [x] Add tests for assigned-instructor-only access, student ownership checks, objective-only immediate visibility, and essay-attempt gating before finalization.

**Migration required:** No - this phase changes authorization and response behavior only.
**Migration applied:** No - access-control logic only.
**Breaking changes:** Yes, if existing internal consumers depend on unauthenticated or broader grading access; those call sites must be updated to the new authorization rules.
<!-- NOTE: The current instructor-assignment helper lives in `app/sentinel-api/src/modules/examination/assign/services/exam-access.ts`, so Phase 3 tightened access there by adding assignment-only predicates and attempt-level instructor assertions rather than editing the non-existent older predicate file path from the plan. -->
<!-- NOTE: The student-facing attempt-report endpoint was implemented under the reporting module at `/exams/attempts/:attemptId/report`, which keeps the detailed report contract close to the instructor reporting routes while still supporting student ownership checks. -->
<!-- NOTE: Student history now surfaces report availability state in `student/history/details` and distinguishes finalized reports from instructor-review-in-progress states; the full readonly question-by-question report UI remains scheduled for Phase 5. -->
<!-- NOTE: Correct answers are now exposed through the finalized attempt report contract via `questionReports`, intentionally ignoring runtime `show_correct_answers` visibility because this task requires post-grading disclosure. -->
<!-- NOTE: Phase 3 validation passed with `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/assign/services/exam-access.test.ts src/modules/examination/reporting/services/get-attempt-report.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/grading/services/grading-detail.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/history/details/_hooks/use-exam-details/index.test.tsx' --reporter=verbose`, and `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.test.tsx' --reporter=verbose`. -->

## Phase 4: Build The Instructor Report Experience

**Goal:** Give instructors a dedicated report area that lists exam attempts and opens a detailed, editable attempt report.

- [x] Add a reports entry to `app/sentinel-web/src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.tsx` so the report area is reachable from the exam navigation.
- [x] Add a report list route such as `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/page.tsx` that surfaces exams and their report-ready attempts.
- [x] Add a detail route such as `app/sentinel-web/src/app/(protected)/(instructor)/exams/reports/[examId]/[attemptId]/page.tsx` or equivalent so each attempt can be opened directly from the list.
- [x] Refactor `app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/page.tsx` so it links into the new per-attempt report flow instead of only showing summary rows.
- [x] Build shared instructor report UI under `app/sentinel-web/src/features/exams/reports/` with question cards, answer blocks, correct-answer reveal, essay rubric breakdowns, score totals, and override controls.
- [x] Ensure the instructor report UI is responsive and feels closer to a Google Forms-style review surface than a dense admin table.
- [x] Add tests for the reports nav, report list, report detail, and override editing interactions.

**Migration required:** No - this phase is UI and routing only.
**Migration applied:** No - presentation and route wiring only.
**Breaking changes:** No.
<!-- NOTE: Added `Reports` to the instructor exams nav, created `/exams/reports` as the report browser, and added `/exams/reports/[examId]/[attemptId]` as the detailed editable attempt report route. -->
<!-- NOTE: The shared instructor report surface now lives in `app/sentinel-web/src/features/exams/reports/attempt-report-view.tsx`; it renders question-by-question answers, correct answers, rubric breakdowns, override score/reason inputs, and explicit save/finalize actions using the Phase 2/3 attempt-report contract. -->
<!-- NOTE: The existing `/exams/[id]/report` summary page now links each attempt row into the per-attempt report route instead of remaining a dead-end summary table. -->
<!-- NOTE: A dedicated `useAttemptReportQuery()` hook was added under `packages/hooks/src/query/exams/` so the attempt-report contract can be reused cleanly by instructor and student report screens. -->
<!-- NOTE: Phase 4 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/(instructor)/exams/_components/layout/exams-nav.test.tsx' 'src/app/(protected)/(instructor)/exams/[id]/report/page.test.tsx' 'src/app/(protected)/(instructor)/exams/reports/page.test.tsx' 'src/features/exams/reports/attempt-report-view.test.tsx' --reporter=verbose` and `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/student/history/details/_hooks/use-exam-details/index.test.tsx' 'src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/_hooks/use-grading-attempt/index.test.tsx' --reporter=verbose`. -->

## Phase 5: Build The Student Finalized Report Experience

**Goal:** Let students see the same report structure after grading is finalized, without exposing edit controls.

- [x] Add a student report data hook or service wrapper so the history page can request the finalized report without duplicating report logic.
- [x] Update `app/sentinel-web/src/app/(protected)/student/history/[attemptId]/page.tsx` so the student report view uses the shared report components in readonly mode.
- [x] Keep grading-in-progress and not-yet-finalized states visible to the student with a clear waiting message instead of a broken or empty report.
- [x] Reuse the shared report layout from the instructor experience while hiding override controls and presenting the student-facing tone and actions.
- [x] Add tests for finalized student reports, objective-only immediate access, and the in-progress grading state.

**Migration required:** No - this phase changes client behavior only.
**Migration applied:** No - student report rendering only.
**Breaking changes:** No.
<!-- NOTE: The student history details route in the current codebase is `app/sentinel-web/src/app/(protected)/student/history/details/page.tsx`, so Phase 5 was applied there instead of the older parameterized path named in the plan. -->
<!-- NOTE: `useExamDetails()` now uses the shared `useAttemptReportQuery()` hook so both instructor and student report surfaces consume the same attempt-report contract without duplicating fetch logic. -->
<!-- NOTE: The student history details page now renders `AttemptReportView` in readonly mode when a finalized report is available and continues to show a dedicated “Report In Review” state for essay attempts that are not finalized yet. -->
<!-- NOTE: Override controls remain hidden on the student route because `AttemptReportView` only shows save/finalize actions when `editable` is explicitly enabled on the instructor flow. -->
<!-- NOTE: Phase 5 validation passed with `pnpm --dir app/sentinel-web exec vitest run 'src/features/exams/reports/attempt-report-view.test.tsx' 'src/app/(protected)/student/history/details/_hooks/use-exam-details/index.test.tsx' 'src/app/(protected)/student/history/details/page.test.tsx' --reporter=verbose` and `pnpm --dir app/sentinel-web exec vitest run 'src/app/(protected)/(instructor)/exams/reports/page.test.tsx' 'src/app/(protected)/(instructor)/exams/[id]/report/page.test.tsx' 'src/features/exams/reports/attempt-report-view.test.tsx' --reporter=verbose`. -->

## Phase 6: Polish Passage Rendering And Responsive Behavior

**Goal:** Make sure report content, including customized passages and references, renders correctly on small screens and shows the right source context.

- [x] Review the report UI components so they render passage content through the same sanitized path used elsewhere in the exam experience.
- [x] Confirm customized passage and reference content is displayed from the attempt/exam data instead of falling back to the original source text when the task-specific override is present.
- [x] Surface source metadata, labels, and any passage reference context in a way that remains readable on mobile and desktop.
- [x] Add focused tests for passage-content precedence and responsive report layout behavior.

**Migration required:** No - presentation and rendering only.
**Migration applied:** No - UI and rendering polish only.
**Breaking changes:** No.
<!-- NOTE: The grading detail contract now returns `sourceFileName`, `sourcePageNumber`, `sourceEvidence`, `passageContent`, and `passageType` for each report question so the report surfaces can render customized passages instead of only bare prompts. -->
<!-- NOTE: `AttemptReportView` now uses the shared `renderPassage()` helper from `@sentinel/shared`, which keeps report passage sanitization and passageContent-over-sourceEvidence precedence aligned with the existing exam runtime. -->
<!-- NOTE: Passage/source metadata is rendered in a dedicated report block with mobile-safe wrapping and source/page labels before the student answer and correct-answer panels, which keeps the reference context readable across student and instructor report routes. -->
<!-- NOTE: Phase 6 validation passed with `pnpm --dir packages/shared exec vitest run src/utils/passage-rendering.test.ts --reporter=verbose`, `pnpm --dir app/sentinel-api exec vitest run src/modules/examination/grading/services/grading-detail.test.ts --reporter=verbose`, and `pnpm --dir app/sentinel-web exec vitest run 'src/features/exams/reports/attempt-report-view.test.tsx' 'src/app/(protected)/student/history/details/page.test.tsx' 'src/app/(protected)/(instructor)/exams/reports/page.test.tsx' --reporter=verbose`. -->

## Validation And Release Notes

- [ ] Run focused API tests for grading-detail, grading-update, report access, and any shared scoring helper tests added in Phases 1 through 3.
- [ ] Run focused web tests for the instructor report routes, student history report route, and shared report components added in Phases 4 and 5.
- [ ] Manually verify the instructor flow, override interaction, and finalized student view on mobile and desktop widths.
- [ ] Confirm the report screens still respect assigned-instructor scope and student ownership after the new routes are wired up.
- [ ] Record any rollout notes for support or QA, especially around when students can first see their finalized reports.

## Breaking API Changes

- The grading detail response is expected to gain item-level report fields.
- Existing internal consumers of grading endpoints may need updates if they assume the older summary-only shape.

## Environment Variables

- No new `.env` variables are expected.
