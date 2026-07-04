# Implementation Plan - Student Score Overrides & Streamlined Finalization

This document outlines the design and phased tasks for resolving student score override bugs and implementing bulk finalization and score visibility rules.

## Summary of Task

Address four core bugs (B-1: override UI revert, B-2: optional override reason, B-3: immediate score update in table, B-4: 500 error on save & finalize) and implement new features (streamlined bulk finalization and score visibility settings).

---

## 1-3-1 Rule Options for Score Visibility

### Option 1 (Recommended): DB Column in `exam_configurations`

Add an enum `release_score_mode` (`AUTO_RELEASE` / `MANUAL_RELEASE`) to the `exam_configurations` table.

- **Tradeoff:** Requires a Prisma DB migration, but provides robust, explicit, and clean configuration that fits the repository's architecture.

### Option 2: Overload the `allow_review` configuration flag

Use the existing `allow_review` setting to hide scores if disabled.

- **Tradeoff:** No DB migration required, but lacks fine-grained control if instructors want students to review questions without seeing final scores, or vice-versa.

### Option 3: Add `scores_released` boolean on the `exams` table

Add a column directly on the `exams` table to toggle score release.

- **Tradeoff:** Easy to query at the exam level, but scatters configuration fields outside the `exam_configurations` table, violating modularity.

### Recommendation

We choose **Option 1** because it aligns with how other exam settings (e.g., `lobbyAdmissionMode`, `showCorrectAnswers`) are modeled, keeping configuration unified and extensible.

---

## Phased Implementation Plan

### Phase 1: Database Migration & API Schema Configuration

**Goal:** Add the release score mode setting to the database schema and expose it in API schemas.

- [x] Add `release_score_mode` enum and column to [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma)
- [x] Run `pnpm --dir packages/db prisma migrate dev --name add_release_score_mode` to apply DB migration and regenerate clients.
- [x] Add `releaseScoreMode` to `examConfigurationSchema` in [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)
- [x] Make `evaluations` optional in `updateGradingAttemptBodySchema` in [grading-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/grading-schema.ts)
- [x] Write schema validation tests in `packages/shared/src/schema/exams/grading-schema.test.ts`
      **Migration required:** Yes — database needs the new configuration column.

---

### Phase 2: Bug Fixes (B-1, B-2, B-4)

**Goal:** Fix React Query state revert, override reason validation crash, and 500 error during finalization.

- [x] Sync `overrideDrafts` when `attempt.itemOverrides` changes in `useAttemptReport/index.ts` (fixes B-1)
- [x] Safe-trim the override reason in `buildOverridePayload` in [attempt-report-utils.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/reports/attempt-report-utils.ts) (fixes B-2)
- [x] Default `evaluations = {}` in `updateGradingAttempt` in [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts) (fixes B-4)
- [x] Write unit tests for optional evaluation behavior in `update-grading-attempt.test.ts`
      **Migration required:** No.

---

### Phase 3: Score Visibility Rule

**Goal:** Prevent students from viewing scores/reports for manual-release exams until finalized.

- [x] Update `mapExamConfigurationState` in [map-exam-configuration-state.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/services/map-exam-configuration-state.ts) and `saveExamConfiguration` in [save-exam-configuration.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/configuration/services/save-exam-configuration.ts) to handle the new `releaseScoreMode` setting.
- [x] Update `getAttemptReport` in [get-attempt-report.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/reporting/services/get-attempt-report.ts) to throw a 409 Conflict if not finalized under manual release.
- [x] Mask attempt scores and results in `mapExamHistorySummaryResponse` in [map-exam-response.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/exams/services/map-exam-response.service.ts) if visibility is MANUAL_RELEASE and the attempt is not finalized.
- [x] Add the "Auto-release student scores" toggle switch in [exam-rules-section.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/config/_components/exam-rules-section.tsx).
- [x] Run test suite `pnpm test` to verify no regressions in student reports.
      **Migration required:** No.

---

### Phase 4: Streamlined Bulk Finalization & Immediate Score Refresh (B-3)

**Goal:** Implement the bulk finalization endpoint and wire it to a "Finalize All" button with appropriate guardrails.

- [ ] Update `buildLatestAttemptsQuery` in [query-builders.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/query-builders.ts) to select `answer_snapshot` to check finalization status.
- [ ] Extract and map `finalized_at` to student rows in [data-loader.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/data-loader.ts), [reporting-response.types.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/reporting/services/reporting-response.types.ts), and [student-reporting.helpers.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/reporting/helpers/student-reporting.helpers.ts).
- [ ] Implement `bulkFinalizeAttempts` service at [bulk-finalize-attempts.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/bulk-finalize-attempts.ts) and controller at [bulk-finalize-attempts.controller.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/controllers/bulk-finalize-attempts.controller.ts).
- [ ] Register `POST /grading/exams/:examId/finalize-all` in [grading.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/grading.routes.ts).
- [ ] Add the "Finalize All" button and safety dialog in [attempts-view.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/report/_components/attempts-view.tsx>).
- [ ] Write unit tests for `bulkFinalizeAttempts` in `bulk-finalize-attempts.test.ts`.
      **Migration required:** No.

---

## Rollback Plan

- Revert schema modifications in `schema.prisma`.
- Reapply previous migration using `pnpm --dir packages/db prisma db push --force-reset` if necessary (for development).
