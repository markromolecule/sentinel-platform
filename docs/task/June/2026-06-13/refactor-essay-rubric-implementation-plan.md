# Refactor Essay Question Grading and Rubric Workflows

This document outlines the design and implementation checklist for refactoring the Essay Question grading and rubric workflows across the Sentinel monorepo.

---

## 1-3-1 Architectural Alternatives

### 1. Problem Description

Currently, Essay questions in Sentinel require manual review by instructors but lack a standardized, structured grading rubric. This makes grading subjective, creates inconsistencies for AI-assisted evaluations (Gemini), and leaves instructors without clear reference materials. We need to introduce a central, non-editable essay rubric, update question templates/schemas, align the Instructor Guide page, and establish manual grading interfaces in both the API and frontend.

### 2. Three Viable Options

#### Option A: Client-Side Scoring and Basic Text Schema

Define the rubric solely on the frontend. Perform score calculations directly in the React components, and keep the essay builder question contents as raw strings.

- **Tradeoff**: Very fast to implement initially, but exposes business calculations to client tampering and does not provide type safety or structural validation for the API.

#### Option B: Centralized Shared Rubric with Structured Schemas and Dedicated Grading Pages (Recommended)

Define the rubric metadata and weighting calculations in the shared package (`essay-rubric.ts`). Update Zod schemas in `assessment-schema.ts` to parse criteria breakdowns. Implement a new attempt grading route on the API and a corresponding sliders-based grading page on the frontend.

- **Tradeoff**: Touches multiple code workspaces (shared, api, and web), but ensures complete data integrity, security, and consistent rendering across student, instructor, and AI grading pipelines.

#### Option C: Database-Driven Customizable Rubrics

Create new database tables and migrations for question-level customizable rubrics. Allow instructors to adjust weights and criteria per essay question.

- **Tradeoff**: Extremely customizable, but directly violates the core requirement that the essay grading standards must remain strictly non-editable and standardized across all exams to prevent grade inflation or grading disparity.

### 3. Best Option Selection

We select **Option B**. It perfectly aligns with the core requirements of standardized and non-customizable rubrics, guarantees grading consistency via centralized calculations on the backend, and provides a sleek, sliders-based manual scoring interface for instructors.

---

## Proposed Changes

### 1. Shared Logic (`packages/shared`)

#### [NEW] [essay-rubric.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/exams/essay-rubric.ts)

- Export the `ESSAY_RUBRIC_CRITERIA` array detailing criteria key, name, weight, description, and level definitions (0-4).
- Export the `calculateEssayWeightedScore(scores: Record<string, number>, maxPoints: number): number` helper.

#### [MODIFY] [assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)

- Add Zod validation schemas for essay evaluation criteria (`essayRubricCriterionEvaluationSchema`, `essayQuestionEvaluationSchema`, and `attemptEvaluationsSchema`).

#### [MODIFY] [index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/index.ts)

- Export the new rubric and schema variables.

---

### 2. Backend API (`app/sentinel-api`)

#### [MODIFY] [definitions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts)

- Update Prompt Builder instructions for `ESSAY` question types to align with the new standardized criteria.

#### [NEW] [get-grading-attempt-detail.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/get-grading-attempt-detail.ts)

- Fetch full exam questions, student's submitted answers from `answer_snapshot`, and overall scores for grading review.

#### [NEW] [update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts)

- Calculate overall attempt score using `isCorrectAnswer()` for objective items and `calculateEssayWeightedScore()` for essay criteria scores. Update the DB record and store the breakdown details inside `answer_snapshot._evaluations`.

#### [MODIFY] [grading.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/grading.routes.ts)

- Add `GET /grading/attempts/:attemptId` and `POST /grading/attempts/:attemptId` routes.

---

### 3. Frontend Web (`app/sentinel-web`)

#### [MODIFY] [guide/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx>)

- Refactor container margins and padding to align with standard layout shell. Use `@sentinel/ui`'s `PageHeader` and `Separator`.
- Append a responsive visual table displaying the criteria, weights, and detailed performance levels of the standardized essay rubric.

#### [MODIFY] [essay-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-forms/essay-form.tsx)

- Remove the customizable "Rubric" textarea.
- Add an informational banner informing the user that the Standardized Essay Rubric is automatically applied.

#### [MODIFY] [essay-preview.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/preview/essay-preview.tsx>)

- Render the 5 standardized criteria and weights instead of displaying custom free-form rubric strings.

#### [MODIFY] [grading-student-list.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx>)

- Add navigation linking each student's name/score row to their specific grading submission page.

#### [NEW] [grading/[examId]/[attemptId]/page.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx>)

- Build a sliders-based manual scoring interface for essay questions.
- Dynamically calculate the weighted score in real-time as sliders (0-4) are adjusted.
- Save overall manual feedback and submit grades to the API.

---

## Phases & Execution Plan

### Phase 1: Shared Core logic and Rubric Definition

**Goal:** Create centralized essay rubric definition and schema validators in the shared package.

- [x] Create `packages/shared/src/exams/essay-rubric.ts` with metadata and calculations.
- [x] Add unit tests in `packages/shared/src/exams/essay-rubric.test.ts`.
- [x] Modify `packages/shared/src/schema/exams/assessment-schema.ts` to add evaluation Zod validators.
- [x] Export elements in `packages/shared/src/index.ts`.
- [x] Run `pnpm test` in the shared package workspace to verify logic.

### Phase 2: Backend API Services & Route Integrations

**Goal:** Build api services to retrieve attempt submission details and persist manual scores.

- [x] Modify Prompt Builder definitions in `app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts`.
- [x] Create API service `app/sentinel-api/src/modules/examination/grading/services/get-grading-attempt-detail.ts`.
- [x] Create API service `app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts` to score essays and update the database.
- [x] Integrate get/post handlers in `app/sentinel-api/src/modules/examination/grading/grading.routes.ts`.
- [x] Write API integration tests in `app/sentinel-api/src/modules/examination/grading/services/grading-detail.test.ts`.
- [x] Run `pnpm --dir app/sentinel-api test` to confirm tests pass.

### Phase 3: Frontend Web Layout & Components Refactoring

**Goal:** Align the Guide layout, clean up the question builder forms, and implement the manual grading workspace.

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx` to standardize shell layout and append the rubric visualization table.
- [x] Modify `app/sentinel-web/src/features/exams/builder/_components/question-forms/essay-form.tsx` to replace custom rubric input with standard banner.
- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/preview/essay-preview.tsx` to show the criteria.
- [x] Update `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx` to allow navigating to individual attempts.
- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx` for the manual scoring interface with sliders.
- [x] Run `pnpm --dir app/sentinel-web test` to verify compilations.

---

## Verification Plan

### Automated Tests

- Run `pnpm --dir packages/shared test`
- Run `pnpm --dir app/sentinel-api test`
- Run `pnpm --dir app/sentinel-web test`

### Manual Verification

1. Open the Instructor Guide page and verify the layout shell matches `/subjects` and renders the standardized essay rubric table correctly.
2. Edit an essay question in the builder and preview bank; verify no text input is shown for rubric, and standard banner/criteria details are shown.
3. Open a student's completed attempt from the exams grading list.
4. Verify the sliders for Content, Structure, Argumentation, Style, and Grammar display correct scores (0-4) and dynamically update the weighted essay score in real-time.
5. Save manual feedback, click "Submit", and verify the list page updates status to `GRADED` with the correct overall score.
