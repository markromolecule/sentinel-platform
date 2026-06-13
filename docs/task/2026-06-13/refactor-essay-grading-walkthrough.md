# Walkthrough: Essay Question Grading & Rubric Workflows Refactoring

We have successfully refactored the Essay question grading and rubric workflows across the Sentinel monorepo, establishing a standardized non-customizable rubric, updating question templates and schemas, aligning the Instructor Guide layout, and dividing the manual grading attempt page into clean, modular, and type-safe components.

## Changes Made

### 1. Shared Logic (`packages/shared`)
- **[essay-rubric.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/exams/essay-rubric.ts)**: Declared the `ESSAY_RUBRIC_CRITERIA` array representing the 5 core criteria (Content, Structure, Argumentation, Style, Grammar) and their respective weights, along with the `calculateEssayWeightedScore` utility.
- **[assessment-schema.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/schema/exams/assessment-schema.ts)**: Added Zod validators for rubric criterion evaluation, question evaluation, and overall attempt evaluations.
- **[index.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/shared/src/index.ts)**: Exported all new rubric definitions and schemas.

### 2. Backend API (`app/sentinel-api`)
- **[definitions.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/lib/gemini/services/prompt-builder/definitions.ts)**: Aligned Gemini prompt generation instructions with the 5 rubric criteria.
- **[get-grading-attempt-detail.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/get-grading-attempt-detail.ts)**: Developed a service to fetch all exam question details, snapshot data, and previous evaluation states.
- **[update-grading-attempt.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/services/update-grading-attempt.ts)**: Implemented scoring calculation including objective correctness checks and essay weighted scoring.
- **[grading.routes.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/examination/grading/grading.routes.ts)**: Added endpoints for retrieving and posting detailed grading actions.

### 3. Frontend Web (`app/sentinel-web`)
- **[guide/page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/guide/page.tsx)**: Re-styled the page layout shell to conform to global styling guidelines and added a detailed visual table showcasing the essay grading rubric.
- **[essay-form.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/features/exams/builder/_components/question-forms/essay-form.tsx)**: Replaced the editable rubric textarea with a standardized informational banner.
- **[essay-preview.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/question/bank/_components/views/preview/essay-preview.tsx)**: Displayed the 5 standardized criteria and weights.
- **[grading-student-list.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list.tsx)**: Added student name linkages navigating to individual submissions.
- **[page.tsx](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-web/src/app/(protected)/(instructor)/exams/grading/[examId]/[attemptId]/page.tsx)**: Cleared inline spaghetti code and refactored the layout to import modular hooks and components.
- **Modular Directory Refactoring**: Split the monolithic grading detail view into:
  - `_constants/`: Grading query key and score defaults.
  - `_types/`: Strict TypeScript typings for evaluation states.
  - `_hooks/use-grading-attempt/`: Custom TanStack Query hooks, query filters, and score mutations.
  - `_components/`: Separate components for page headers, loading skeletons, score cards, and rubric/question sliders.

---

## Verification Results

### 1. Automated Unit Tests
- Ran unit tests for the shared rubric calculator and Zod validators in `packages/shared`.
- Verified Hono endpoint queries and controller updates through API unit/integration tests (`grading-detail.test.ts`).
- Executed `pnpm test` successfully across workspaces.
