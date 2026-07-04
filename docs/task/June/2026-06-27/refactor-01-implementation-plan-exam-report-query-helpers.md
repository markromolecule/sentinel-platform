# Implementation Plan: Refactor Exam Report Query Helpers

## 1-3-1 Options Analysis

**Option 1: Split by Functional Layers (Queries vs Domain Logic)**

- **Approach:** Separate Kysely query builders into `exam-report.queries.ts`, and domain logic (overrides, types, data-loading) into `exam-report.domain.ts`.
- **Tradeoff:** Faster to implement, but `exam-report.domain.ts` might still become bloated as the reporting feature grows.

**Option 2: Split into Granular Utility Modules within a Dedicated Folder (Recommended)**

- **Approach:** Create a folder `exam-report-queries/` containing `types.ts`, `date-utils.ts`, `override-helpers.ts`, `query-builders.ts`, and `data-loader.ts`. Add an `index.ts` to re-export everything.
- **Tradeoff:** Introduces a new directory and slightly more files, but provides the highest cohesion, readability, and scalability for future reporting features.

**Option 3: Extract Only the Query Builders and Keep the Rest**

- **Approach:** Move the 4 Kysely query builder functions to `exam-report.query-builders.ts` and keep the data loader, date util, and override logic in the original file.
- **Tradeoff:** Minimal impact on imports, but doesn't fully resolve the modularity and single-responsibility issues of the original file.

**Best Option: Option 2**
**Why:** Option 2 provides a highly modular and scalable structure. By breaking down the 310-line file into domain-specific modules (types, date utilities, overrides, queries, orchestrator), we adhere strictly to single-responsibility principles. The `index.ts` file encapsulates these changes, minimizing import churn in consuming files. We will use this option.

---

## Phase 1: Setup and Extraction

**Goal:** Create the new modular structure and extract responsibilities from the original monolithic file.

- [x] Extract types (`ExamContextForReporting`, `EnrichedReportStudentRow`) into `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/types.ts`
- [x] Add JSDoc comments to all exported types in `types.ts`
- [x] Extract utility function (`parseDateValue`) into `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/date-utils.ts`
- [x] Add JSDoc comments to `parseDateValue`
- [x] Write tests for date utilities at `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/date-utils.test.ts`
- [x] Extract override logic (`compareOverrideRecency`, `buildOverrideRecencyMaps`) into `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/override-helpers.ts`
- [x] Add JSDoc comments to exported functions in `override-helpers.ts`
- [x] Write tests for override logic at `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/override-helpers.test.ts`
- [x] Extract query builders (`buildAssignedStudentsQuery`, `buildLatestAttemptsQuery`, `buildAttemptCountsQuery`, `buildIncidentSummaryQuery`) into `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/query-builders.ts`
- [x] Add JSDoc comments to query builder functions in `query-builders.ts`
- [x] Extract the data loader orchestrator (`loadExamReportSourceData`) into `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/data-loader.ts`
- [x] Add JSDoc comments to `loadExamReportSourceData`
- [x] Create barrel file `app/sentinel-api/src/modules/examination/reporting/services/exam-report-queries/index.ts` to export all extracted modules
      **Migration required:** No — purely internal refactoring of TypeScript code.

## Phase 2: Integration and Cleanup

**Goal:** Update consuming files to use the new module structure and remove the old monolithic file.

- [x] Update imports in `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.helpers.ts` to point to `./exam-report-queries`
- [x] Update imports in `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.ts` to point to `./exam-report-queries`
- [x] Update imports in `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.view.helpers.ts` to point to `./exam-report-queries`
- [x] Delete the deprecated file `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.query.helpers.ts`
- [x] Write integration test verification (or ensure existing ones pass) at `app/sentinel-api/src/modules/examination/reporting/services/get-exam-report.test.ts`
- [x] Run `pnpm test` and `pnpm build` to confirm all tests pass and there are no type errors.
      **Migration required:** No — no database schema changes are required for this refactoring.
